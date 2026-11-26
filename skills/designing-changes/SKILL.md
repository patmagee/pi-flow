---
name: designing-changes
description: Use when creating a feature, changing behavior, or resolving an ambiguous implementation request before code changes begin.
---

# Designing Changes

## Core contract

Understand the change before implementation. Explore the real code, resolve ambiguity with the user, compare viable approaches, and obtain explicit approval for the proposed design.

## Choose the path

State the path before the first question. Upgrade when hidden complexity appears.

| Path | Use when | Artifact |
|---|---|---|
| **Spike** | The output is a feasibility answer or throwaway probe. | Question, probe, and recommendation in chat. |
| **Bounded** | An existing flow needs a focused change with no new subsystem or public contract. | Short design in chat. |
| **Architectural** | The change creates a subsystem, restructures components, or changes an interface used elsewhere. | Approved Architecture Decision Record (ADR), then a plan. |

## Explore

Read the relevant code, tests, project rules, recent history, and prior decisions before proposing a solution. Work in the foreground by default.

Use a read-only scout subagent only when a separate question is independent, bounded, and cheaper to summarize than to retain in the main context. Do not dispatch one scout per file or per ordinary search.

Ask one question at a time. Focus on purpose, constraints, success criteria, compatibility, and risk. When several interpretations remain, present concrete choices and recommend one.

## Present the design

Use two stages for nontrivial Bounded and Architectural work.

### Stage 1: Select an approach

When multiple viable approaches exist:

1. Present two or three choices as **A)**, **B)**, and optionally **C)**.
2. State each choice's main benefit, cost, and risk.
3. Recommend one choice and explain why.
4. Ask the user to choose A, B, C, or request another option.

Do not invent alternatives when only one approach is reasonable. State why it is the only viable approach, then continue.

### Stage 2: Approve the design incrementally

Expand the selected approach into two to five named sections. Cover the approach, affected components, data or control flow, error behavior, and testing as relevant.

Present one section per turn. End each section with these choices:

1. **Accept**
2. **Change**
3. **Discuss**

Stop for the answer. If the user chooses Change, revise and present the same section again. If the user chooses Discuss, answer the concern and ask for a decision on that section before continuing.

Keep accepted sections stable. If a later section conflicts with one, explicitly reopen the earlier decision. After all sections are accepted, present a short integrated design and request final approval.

A truly focused Bounded change may use one section. Spikes and trivial one-section changes may skip unnecessary choices.

### Fast-track and autonomous execution

When the user approves the full design at once, asks to batch remaining sections, or explicitly authorizes autonomous or away-from-keyboard execution, stop pausing at intermediate section gates. Summarize the accepted decisions, note any open assumptions, and proceed to planning or implementation.

For Architectural work, after final approval:

1. Write the approved ADR under `docs/decisions/YYYY-MM-DD-<topic>.md`, unless the project has another convention.
2. Ask the user to review the written ADR.
3. After approval, use `planning-change-sets`.

An ADR contains context, decision, alternatives, consequences, invariants, acceptance scenarios, and excluded work. Distinguish user decisions from agent-selected implementation details.

## Gate

No production implementation begins before design approval. A short design is still a design. A spike that becomes retained code is a new implementation request and must pass this gate.
