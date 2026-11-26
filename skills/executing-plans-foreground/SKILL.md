---
name: executing-plans-foreground
description: Use when implementing an approved multi-step plan in Pi while preserving context across checkpoints or compaction.
---

# Executing Plans in the Foreground

## Core contract

The current Pi agent owns implementation. Subagents reduce context only when their work is bounded and their result is smaller than the context they rebuild.

## Start

1. Verify the workspace and branch. Do not implement on `main` or `master` without explicit user consent.
2. Read the design and plan once. Raise only blockers, conflicting requirements, or irreversible choices.
3. Track active steps in `task_stack` when available. Create or resume `.pi/work/<branch>/progress.md` and `decisions.md` for durable resume state instead of duplicating every live checklist change in both places.
4. Record the current change set, repository state, and exact verification commands.

## Plan fidelity

Never let implementation drift silently from the approved plan. If a departure conflicts with the approved design, stop for the user. For a reversible implementation correction, record the reason, affected change sets, and changed verification.

When the plan is committed, update it in the same commit as the departure. When the plan is session-local, update `.pi/work/<branch>/progress.md` and `decisions.md` before the next checkpoint. Verify the final tree against the revised plan.

## Execute each change set

1. Mark the active step in `task_stack` (or `progress.md` if `task_stack` is unavailable).
2. Use `test-driving-changes` for behavior changes.
3. Edit and integrate code in the foreground.
4. Run focused tests and builds with `bash` (or batch independent read-only checks in `codemode`).
5. Before checkpoint review, check diff size against the plan scope and repository pull request size guideline. If it exceeds that budget, cut dead code, speculative options, and scope creep, or split unrelated changes before dispatching reviewers, and update affected docs or guides.
6. Run checkpoint validation once on the completed change set.
7. Apply its Review gate with `reviewing-change-sets`.
8. Verify review claims. Fix accepted findings in the foreground.
9. Commit a coherent unit when requested or appropriate, then snapshot the commit and evidence in `progress.md`.

## Delegation policy

| Work | Action |
|---|---|
| Routine reads, searches, edits, and integration | Foreground. |
| Independent unknown with a narrow answer | Optional read-only scout. |
| Coherent checkpoint or final diff | Read-only reviewer. |
| Explicit isolated mechanical batch | Optional implementer with exact files and contract. |
| Routine fix, test run, or status check | Do not delegate. |

Never dispatch one implementation agent per plan task by default. Never dispatch a fixer solely because a reviewer found an issue.

Pass subagents artifact paths, bounded questions, and an output contract. Do not paste session history. Use the automatic completion notification and retrieve one final summary if needed. Never poll or fetch full `metadata` as a waiting mechanism.

## Resume after compaction

At each change-set checkpoint, important ruling, or before compaction, snapshot `progress.md` with a clean full `write` rather than fragile partial `edit` patches. Include:

- completed and current change sets;
- files and commits;
- RED, GREEN, and checkpoint commands with outcomes;
- accepted or rejected review claims;
- unresolved blockers and the next exact action.

Treat this file and Git state as authoritative after compaction.

## Stop conditions

Stop and ask for destructive or irreversible work, security-sensitive side effects, push or merge actions, conflicting product trade-offs, or a plan defect that leaves every path as a guess. Make reversible implementation rulings and record their risk.

Before claiming completion, run fresh final validation and check every plan outcome against the final tree.
