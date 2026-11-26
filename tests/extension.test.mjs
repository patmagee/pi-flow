import assert from "node:assert/strict";
import { test } from "node:test";
import piFlow, { FLOW_MARKER, FLOW_POLICY, appendFlowPolicy, isSubagentProcess } from "../extensions/pi-flow.js";

test("flow policy is short and states the foreground and review contracts", () => {
  assert.ok(FLOW_POLICY.length < 1200);
  assert.match(FLOW_POLICY, /once per context window/i);
  assert.match(FLOW_POLICY, /foreground/i);
  assert.match(FLOW_POLICY, /bounded exploration/i);
  assert.match(FLOW_POLICY, /one review mode/i);
  assert.match(FLOW_POLICY, /all models available/i);
  assert.match(FLOW_POLICY, /task_stack/i);
  assert.match(FLOW_POLICY, /progress/i);
});

test("isSubagentProcess detects pi-sub child environment variables", () => {
  assert.equal(isSubagentProcess({}), false);
  assert.equal(isSubagentProcess({ PI_SUB_AGENT_ID: "", PI_SUB_DEPTH: "0" }), false);
  assert.equal(isSubagentProcess({ PI_SUB_AGENT_ID: "   ", PI_SUB_DEPTH: "invalid" }), false);
  assert.equal(isSubagentProcess({ PI_SUB_AGENT_ID: "agent-123" }), true);
  assert.equal(isSubagentProcess({ PI_SUB_DEPTH: "1" }), true);
  assert.equal(isSubagentProcess({ PI_SUB_DEPTH: "2" }), true);
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

  const savedId = process.env.PI_SUB_AGENT_ID;
  const savedDepth = process.env.PI_SUB_DEPTH;
  try {
    delete process.env.PI_SUB_AGENT_ID;
    delete process.env.PI_SUB_DEPTH;

    const rootResult = handlers.get("before_agent_start")({ systemPrompt: "base prompt" });
    assert.equal(rootResult.systemPrompt, appendFlowPolicy("base prompt"));

    process.env.PI_SUB_AGENT_ID = "child-1";
    const childById = handlers.get("before_agent_start")({ systemPrompt: "base prompt" });
    assert.equal(childById, undefined);

    delete process.env.PI_SUB_AGENT_ID;
    process.env.PI_SUB_DEPTH = "1";
    const childByDepth = handlers.get("before_agent_start")({ systemPrompt: "base prompt" });
    assert.equal(childByDepth, undefined);
  } finally {
    if (savedId === undefined) delete process.env.PI_SUB_AGENT_ID;
    else process.env.PI_SUB_AGENT_ID = savedId;
    if (savedDepth === undefined) delete process.env.PI_SUB_DEPTH;
    else process.env.PI_SUB_DEPTH = savedDepth;
  }
});
