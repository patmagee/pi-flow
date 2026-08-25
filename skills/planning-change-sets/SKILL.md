---
name: planning-change-sets
description: Use when an approved design or stable requirements need a multi-step implementation plan that another model or engineer can execute.
---

# Planning Change Sets

## Core contract

Write a concise handoff contract, not a second implementation. A new executor should know what must change, how to prove it, and which decisions it must not reopen.

## Prepare

Read the approved design, project rules, relevant code, and test conventions. Map changed files, symbols, interfaces, and cross-cutting invariants before dividing work.

Use coherent vertical change sets. A normal change set represents one complete test loop or roughly **30–90 minutes** of focused work. Split where a commit, test result, or review verdict can stand independently. Do not split setup, tests, implementation, and documentation into separate tasks when they deliver one behavior.

## Plan format

Start with the goal, design path, global invariants, excluded work, and executor assumptions. Then use this structure for each change set:

```markdown
## Change set N: Name

**Outcome:** Observable behavior delivered.
**Files and symbols:** Exact paths and important interfaces.
**Behavior:** Examples, edge cases, and error semantics.
**Test-first contract:** Test cases and the focused RED/GREEN command.
**Dependencies:** Earlier outputs and invariants consumed.
**Verification:** Focused and checkpoint commands.
**Review gate:** none | checkpoint | high-risk.
```

Include exact signatures, schema fields, constants, or wire examples when they are contractual. Do not paste complete implementation code unless that code is the approved interface. Point to existing patterns by path and symbol instead of copying them.

Record architectural decisions in the design document, not the plan. Record temporary execution state under `.pi/work/<branch>/`.

## Self-check

Before handoff:

1. Map every design requirement to a change set.
2. Check interfaces and names across change sets for consistency.
3. Remove placeholders and repeated requirements.
4. Confirm each change set has a useful RED test and an observable completion condition.
5. Mark trust, data-loss, security, concurrency, migration, billing, and public-interface boundaries as high-risk.

Save the plan to the project's plan location. If none exists, use `.pi/work/<branch>/implementation-plan.md` for session work or `docs/plans/` for a team-facing committed plan.

Handoff by naming `executing-plans-foreground`. Do not recommend a subagent-per-task execution mode.
