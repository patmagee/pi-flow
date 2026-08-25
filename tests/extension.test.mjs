import assert from "node:assert/strict";
import { test } from "node:test";
import piFlow, { FLOW_MARKER, FLOW_POLICY, appendFlowPolicy } from "../extensions/pi-flow.js";

test("flow policy is short and states the foreground and review contracts", () => {
  assert.ok(FLOW_POLICY.length < 1200);
  assert.match(FLOW_POLICY, /foreground/i);
  assert.match(FLOW_POLICY, /bounded exploration/i);
  assert.match(FLOW_POLICY, /one review mode/i);
  assert.match(FLOW_POLICY, /progress/i);
});

test("policy append is idempotent", () => {
  const once = appendFlowPolicy("base prompt");
  const twice = appendFlowPolicy(once);
  assert.equal(once, twice);
  assert.equal(once.split(FLOW_MARKER).length - 1, 1);
});

test("extension registers only a before_agent_start handler", () => {
  const handlers = new Map();
  const pi = {
    on(event, handler) {
      assert.equal(handlers.has(event), false, `duplicate ${event} handler`);
      handlers.set(event, handler);
    },
  };

  piFlow(pi);
  assert.deepEqual([...handlers.keys()], ["before_agent_start"]);

  const result = handlers.get("before_agent_start")({ systemPrompt: "base prompt" });
  assert.equal(result.systemPrompt, appendFlowPolicy("base prompt"));
});
