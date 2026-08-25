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

For Bounded work, describe the approach, affected components, data or control flow, error behavior, and testing in chat. Stop for explicit approval before implementation.

For Architectural work:

1. Present two or three viable approaches with trade-offs and a recommendation.
2. Present the design in sections sized to the decision.
3. Confirm each load-bearing decision with the user.
4. Write the approved ADR under `docs/decisions/YYYY-MM-DD-<topic>.md`, unless the project has another convention.
5. Ask the user to review the written ADR.
6. After approval, use `planning-change-sets`.

An ADR contains context, decision, alternatives, consequences, invariants, acceptance scenarios, and excluded work. Distinguish user decisions from agent-selected implementation details.

## Gate

No production implementation begins before design approval. A short design is still a design. A spike that becomes retained code is a new implementation request and must pass this gate.
