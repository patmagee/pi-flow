export const FLOW_MARKER = "pi-flow workflow policy";

export const FLOW_POLICY = `## ${FLOW_MARKER}

- Before substantive design, debugging, review, or code work, load the one Pi Flow skill that matches the current phase.
- Implement in the foreground by default. Use subagents only for bounded exploration, independent review, explicit isolated mechanical work, or high-risk adversarial review.
- Select one review mode for each checkpoint. Do not stack single, layered, and dual review modes.
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
