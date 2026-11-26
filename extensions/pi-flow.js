export const FLOW_MARKER = "pi-flow workflow policy";

export const FLOW_POLICY = `## ${FLOW_MARKER}

- Before substantive design, debugging, review, or code work, load the matching Pi Flow skill once per context window (reload only after compaction or a phase change).
- Implement in the foreground by default. Use subagents only for bounded exploration, independent review, explicit isolated mechanical work, or high-risk adversarial review.
- \`reviewing-change-sets\` is the review orchestrator. Pick one review mode: single, layered, dual, or stacked, choosing freely from all models available in Pi. Do not stack modes or run another review-orchestration skill at the same checkpoint. Select stacked only when the user explicitly asks for all three seats and accepts the cost.
- Keep semantic reviewers independent by the oracle: give them the contract and raw evidence, not the prior reviewer verdict. If two accepted post-fix findings share one semantic seam, freeze edits and return to \`designing-changes\`; a third reviewer is not the default.
- Track live steps in \`task_stack\` when available; snapshot resumable state and decisions in \`.pi/work/<branch>/progress.md\` at checkpoints or before compaction.`;

export function isSubagentProcess(env = process.env) {
  return Boolean(env?.PI_SUB_AGENT_ID?.trim()) || Number(env?.PI_SUB_DEPTH) > 0;
}

export function appendFlowPolicy(systemPrompt) {
  if (systemPrompt.includes(FLOW_MARKER)) return systemPrompt;
  return `${systemPrompt}\n\n${FLOW_POLICY}`;
}

export default function piFlow(pi) {
  pi.on("before_agent_start", (event) => {
    if (isSubagentProcess()) return undefined;
    return {
      systemPrompt: appendFlowPolicy(event.systemPrompt),
    };
  });
}
