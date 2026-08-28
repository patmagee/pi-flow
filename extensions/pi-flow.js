export const FLOW_MARKER = "pi-flow workflow policy";

export const FLOW_POLICY = `## ${FLOW_MARKER}

- Before substantive design, debugging, review, or code work, load the one Pi Flow skill that matches the current phase.
- Implement in the foreground by default. Use subagents only for bounded exploration, independent review, explicit isolated mechanical work, or high-risk adversarial review.
- \`reviewing-change-sets\` is the review orchestrator. Pick one review mode: single, layered, dual, or stacked. Do not stack modes or run another review-orchestration skill at the same checkpoint. Select stacked only when the user explicitly asks for all three seats and accepts the cost.
- Keep semantic reviewers independent by the oracle: give them the contract and raw evidence, not the prior reviewer verdict. If two accepted post-fix findings share one semantic seam, freeze edits and return to \`designing-changes\`; a third reviewer is not the default.
- Keep resumable implementation state in \`.pi/work/<branch>/progress.md\` and record decisions that a later context must preserve.`;

export function appendFlowPolicy(systemPrompt) {
  if (systemPrompt.includes(FLOW_MARKER)) return systemPrompt;
  return `${systemPrompt}\n\n${FLOW_POLICY}`;
}

export default function piFlow(pi) {
  pi.on("before_agent_start", (event) => ({
    systemPrompt: appendFlowPolicy(event.systemPrompt),
  }));
}
