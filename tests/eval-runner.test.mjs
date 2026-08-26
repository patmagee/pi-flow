import assert from "node:assert/strict";
import process from "node:process";
import { test } from "node:test";

import { gradeAssertions, validateScenario } from "../scripts/lib/eval-core.mjs";
import { PiRpcClient, StrictJsonlParser } from "../scripts/lib/rpc-client.mjs";

const fakeRpc = String.raw`
let buffer = "";
process.stdin.setEncoding("utf8");
function send(value) { process.stdout.write(JSON.stringify(value) + "\n"); }
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, newline).replace(/\r$/, "");
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    const command = JSON.parse(line);
    if (command.type === "prompt") {
      globalThis.lastPrompt = command.message;
      send({ id: command.id, type: "response", command: "prompt", success: true });
      setTimeout(() => send({ type: "agent_settled" }), 5);
    } else if (command.type === "get_last_assistant_text") {
      send({ id: command.id, type: "response", command: command.type, success: true, data: { text: "turn:" + globalThis.lastPrompt } });
    } else if (command.type === "get_session_stats") {
      send({ id: command.id, type: "response", command: command.type, success: true, data: { tokens: { total: 42 }, cost: 0.01 } });
    }
  }
});
`;

test("strict JSONL parser splits only on LF and accepts chunked Unicode separators", () => {
  const parser = new StrictJsonlParser();
  assert.deepEqual(parser.push(Buffer.from('{"text":"left')), []);
  assert.deepEqual(parser.push(Buffer.from('\u2028right"}\n{"value":2}\r\n')), [
    { text: "left\u2028right" },
    { value: 2 },
  ]);
  assert.deepEqual(parser.end(), []);
});

test("strict JSONL parser reports malformed records", () => {
  const parser = new StrictJsonlParser();
  assert.throws(() => parser.push(Buffer.from("not-json\n")), /Invalid JSONL record/);
});

test("RPC client correlates responses and waits for the settled turn", async (t) => {
  const client = new PiRpcClient({
    command: process.execPath,
    args: ["-e", fakeRpc],
    timeoutMs: 1_000,
  });
  t.after(() => client.close());

  assert.equal(await client.prompt("hello"), "turn:hello");
  assert.deepEqual(await client.getSessionStats(), { tokens: { total: 42 }, cost: 0.01 });
});

test("RPC client terminates a process when a turn times out", async (t) => {
  const client = new PiRpcClient({
    command: process.execPath,
    args: ["-e", "process.stdin.resume()"],
    timeoutMs: 25,
  });
  t.after(() => client.close());

  await assert.rejects(client.prompt("never answered"), /timed out/i);
  assert.equal(client.closed, true);
});

test("scenario validation accepts the behavior contract", () => {
  const scenario = {
    id: "feedback-validation",
    name: "Feedback validation",
    skill: "reviewing-change-sets",
    turns: [
      {
        user: "A reviewer claims this can return null.",
        assertions: [{ type: "includesAll", values: ["claim", "evidence"] }],
      },
    ],
    rubric: ["The assistant validates the claim before proposing a fix."],
  };

  assert.equal(validateScenario(scenario), scenario);
  assert.throws(() => validateScenario({ ...scenario, turns: [] }), /turns/);
  assert.throws(() => validateScenario({ ...scenario, skill: "" }), /skill/);
});

test("deterministic assertions report pass and actionable evidence", () => {
  const results = gradeAssertions("Choose A), B), or C). I will not implement yet.", [
    { type: "includesAll", values: ["A)", "B)", "C)"] },
    { type: "includesAny", values: ["Accept", "not implement"] },
    { type: "excludesAll", values: ["I changed the files"] },
    { type: "matches", pattern: "not\\s+implement", flags: "i" },
    { type: "notMatches", pattern: "implemented", flags: "i" },
  ]);

  assert.equal(results.every((result) => result.pass), true);

  const [failure] = gradeAssertions("I fixed it.", [
    { type: "includesAll", values: ["evidence"] },
  ]);
  assert.equal(failure.pass, false);
  assert.match(failure.evidence, /evidence/);
});
