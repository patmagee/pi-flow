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
3. Create or resume `.pi/work/<branch>/progress.md` and `decisions.md`.
4. Record the current change set, repository state, and exact verification commands.

## Execute each change set

1. Mark the change set active in `progress.md`.
2. Use `test-driving-changes` for behavior changes.
3. Edit and integrate code in the foreground.
4. Use `bg_run` for long tests and builds. Continue only independent work while they run.
5. Run checkpoint validation once on the completed change set.
6. Apply its Review gate with `reviewing-change-sets`.
7. Verify review claims. Fix accepted findings in the foreground.
8. Commit a coherent unit when requested or appropriate, then record the commit and evidence.

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

After each change set or important ruling, update `progress.md` with:

- completed and current change sets;
- files and commits;
- RED, GREEN, and checkpoint commands with outcomes;
- accepted or rejected review claims;
- unresolved blockers and the next exact action.

Treat this file and Git state as authoritative after compaction.

## Stop conditions

Stop and ask for destructive or irreversible work, security-sensitive side effects, push or merge actions, conflicting product trade-offs, or a plan defect that leaves every path as a guess. Make reversible implementation rulings and record their risk.

Before claiming completion, run fresh final validation and check every plan outcome against the final tree.
