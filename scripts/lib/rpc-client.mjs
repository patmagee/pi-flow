import { spawn as spawnProcess } from "node:child_process";
import { StringDecoder } from "node:string_decoder";

export class PiRpcError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "PiRpcError";
  }
}

export class StrictJsonlParser {
  #buffer = "";
  #decoder = new StringDecoder("utf8");
  #ended = false;

  push(chunk) {
    if (this.#ended) throw new PiRpcError("Cannot push data after the JSONL stream ended");
    const text = typeof chunk === "string" ? chunk : this.#decoder.write(chunk);
    this.#buffer += text;
    return this.#drain(false);
  }

  end(chunk) {
    if (this.#ended) return [];
    if (chunk !== undefined) {
      this.#buffer += typeof chunk === "string" ? chunk : this.#decoder.write(chunk);
    }
    this.#buffer += this.#decoder.end();
    this.#ended = true;
    return this.#drain(true);
  }

  #drain(flush) {
    const values = [];
    let newline;
    while ((newline = this.#buffer.indexOf("\n")) !== -1) {
      const line = this.#buffer.slice(0, newline);
      this.#buffer = this.#buffer.slice(newline + 1);
      this.#parseLine(line, values);
    }

    if (flush && this.#buffer.length > 0) {
      this.#parseLine(this.#buffer, values);
      this.#buffer = "";
    }
    return values;
  }

  #parseLine(rawLine, values) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    if (line.length === 0) return;
    try {
      values.push(JSON.parse(line));
    } catch (cause) {
      const preview = line.length > 200 ? `${line.slice(0, 200)}…` : line;
      throw new PiRpcError(`Invalid JSONL record: ${preview}`, { cause });
    }
  }
}

export class PiRpcClient {
  #child;
  #counter = 0;
  #events = [];
  #exitPromise;
  #exitResult;
  #failure;
  #killGraceMs;
  #killTimer;
  #parser = new StrictJsonlParser();
  #pending = new Map();
  #resolveExit;
  #stderr = "";
  #timeoutMs;
  #waiters = new Set();

  constructor({
    command = "pi",
    args = [],
    cwd = process.cwd(),
    env = process.env,
    timeoutMs = 120_000,
    killGraceMs = 1_000,
    spawn = spawnProcess,
  } = {}) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new TypeError("timeoutMs must be a positive number");
    }
    if (!Number.isFinite(killGraceMs) || killGraceMs <= 0) {
      throw new TypeError("killGraceMs must be a positive number");
    }
    this.#timeoutMs = timeoutMs;
    this.#killGraceMs = killGraceMs;
    this.#exitPromise = new Promise((resolveExit) => {
      this.#resolveExit = resolveExit;
    });
    this.#child = spawn(command, args, {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.#child.stdout.on("data", (chunk) => {
      try {
        for (const value of this.#parser.push(chunk)) this.#handle(value);
      } catch (error) {
        this.#fail(error);
      }
    });
    this.#child.stdout.on("end", () => {
      try {
        for (const value of this.#parser.end()) this.#handle(value);
      } catch (error) {
        this.#fail(error);
      }
    });
    this.#child.stderr.on("data", (chunk) => {
      this.#stderr = `${this.#stderr}${chunk}`.slice(-8_192);
    });
    const settleExit = (code, signal) => {
      if (this.#exitResult) return;
      this.#exitResult = { code, signal };
      clearTimeout(this.#killTimer);
      this.#resolveExit(this.#exitResult);
    };
    this.#child.on("error", (error) => this.#fail(new PiRpcError(`Could not start Pi RPC: ${error.message}`, { cause: error })));
    this.#child.on("exit", (code, signal) => {
      settleExit(code, signal);
      if (this.closed) return;
      const detail = this.#stderr.trim() ? `: ${this.#stderr.trim()}` : "";
      this.#fail(new PiRpcError(`Pi RPC exited before completion (${signal ?? code})${detail}`));
    });
    this.#child.on("close", settleExit);
  }

  get closed() {
    return this.#child === undefined;
  }

  get events() {
    return [...this.#events];
  }

  async prompt(message) {
    if (typeof message !== "string" || message.length === 0) {
      throw new TypeError("prompt message must be a non-empty string");
    }
    const settled = this.#waitForEvent("agent_settled");
    try {
      await Promise.all([
        this.request({ type: "prompt", message }),
        settled.promise,
      ]);
    } catch (error) {
      settled.cancel();
      throw error;
    }
    return this.getLastAssistantText();
  }

  async getLastAssistantText() {
    const response = await this.request({ type: "get_last_assistant_text" });
    return response.data?.text ?? null;
  }

  async getSessionStats() {
    const response = await this.request({ type: "get_session_stats" });
    return response.data;
  }

  waitForExit() {
    return this.#exitPromise;
  }

  request(command) {
    if (this.closed) return Promise.reject(this.#failure ?? new PiRpcError("Pi RPC client is closed"));
    const id = command.id ?? `pi-flow-${++this.#counter}`;
    const payload = { ...command, id };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#fail(new PiRpcError(`Pi RPC command ${command.type} timed out after ${this.#timeoutMs}ms`));
      }, this.#timeoutMs);
      this.#pending.set(id, { resolve, reject, timer });
      this.#child.stdin.write(`${JSON.stringify(payload)}\n`, (error) => {
        if (error) this.#fail(new PiRpcError(`Could not write Pi RPC command ${command.type}: ${error.message}`, { cause: error }));
      });
    });
  }

  close() {
    if (this.closed) return this.#exitPromise;
    const child = this.#child;
    this.#child = undefined;
    const error = this.#failure ?? new PiRpcError("Pi RPC client closed");
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.#pending.clear();
    for (const waiter of this.#waiters) waiter.reject(error);
    this.#waiters.clear();
    child.stdin.destroy();
    child.kill("SIGTERM");
    if (child.exitCode === null && child.signalCode === null) {
      this.#killTimer = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
      }, this.#killGraceMs);
      this.#killTimer.unref?.();
    }
    return this.#exitPromise;
  }

  #handle(value) {
    this.#events.push(value);
    if (value.type === "response" && value.id && this.#pending.has(value.id)) {
      const pending = this.#pending.get(value.id);
      this.#pending.delete(value.id);
      clearTimeout(pending.timer);
      if (value.success) pending.resolve(value);
      else pending.reject(new PiRpcError(value.error ?? `Pi RPC command ${value.command} failed`));
      return;
    }

    for (const waiter of [...this.#waiters]) {
      if (waiter.type !== value.type) continue;
      this.#waiters.delete(waiter);
      clearTimeout(waiter.timer);
      waiter.resolve(value);
    }
  }

  #waitForEvent(type) {
    let waiter;
    const promise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#fail(new PiRpcError(`Pi RPC event ${type} timed out after ${this.#timeoutMs}ms`));
      }, this.#timeoutMs);
      waiter = { type, resolve, reject, timer };
      this.#waiters.add(waiter);
    });
    return {
      promise,
      cancel: () => {
        if (!this.#waiters.delete(waiter)) return;
        clearTimeout(waiter.timer);
      },
    };
  }

  #fail(error) {
    if (this.#failure) return;
    this.#failure = error instanceof Error ? error : new PiRpcError(String(error));
    this.close();
  }
}
