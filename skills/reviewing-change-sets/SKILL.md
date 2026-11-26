---
name: reviewing-change-sets
description: Use when receiving review feedback or when a coherent code change, design, plan, branch, or pull request needs independent review or a risk-based review checkpoint.
---

# Reviewing Change Sets

## Core contract

While Pi Flow is active, `reviewing-change-sets` is the review orchestrator. Do not invoke another review-orchestration skill at the same checkpoint. Select one review mode for the artifact and risk. Reviewer output is claims, not instructions; verify each claim before editing code.

## Select one mode

| Mode | Use when | Review seats |
|---|---|---|
| **single** | Normal checkpoint or final review. | One independent semantic reviewer. |
| **layered** | Mixed code/config changes or missed mechanical defects. | One semantic and one mechanical reviewer in parallel. |
| **dual** | Authentication, permissions, migration, concurrency, billing, public contracts, data-loss risk, or adversarial request. | Two semantic reviewers from different model families in parallel. |
| **stacked** | User explicitly requests all three seats and accepts the cost. | Two semantic reviewers from different model families and one mechanical reviewer. |

Never select `stacked` automatically. High risk selects `dual`, not `stacked`. Add the mechanical seat only when requested. Do not stack modes at one checkpoint.

Review coherent milestones, not per-function micro-diffs. Trivial local diffs can use foreground self-review unless independent review was requested.

## Model selection

Never hardcode models or stick to a fixed two-provider habit. Inspect the live catalog of available models exposed by `subagent_start`, and choose freely across all enabled providers and model families for each seat.

For `dual` and `stacked`, pick distinct model families across any enabled providers from that live catalog. Pass exact `provider/model` identifiers so dispatches avoid ambiguity or retired IDs. Record each seat's actual model, effort, and role for pull request `AI review` receipts.

## Prepare the review

Pass artifact, base/head, requirements, changed files, test evidence, and risks. Put large diffs in files; pass paths, never session transcripts.

Reviewers are read-only: no subagent dispatches, code edits, or rerunning evidenced broad suites. They may inspect surrounding code for concrete risk.

Every finding states severity, confidence, location, problem, impact, evidence, and fix. Report blocking, high, and medium defects with observable cost. Drop style nits unless requested, and flag behavior changes that leave docs stale.

## Independent oracle

Independence is defined by the review oracle, the contract, not model family alone. Extra seats fail when they inherit one verdict or flawed summary. For each semantic reviewer:

- Give raw user requirements or the approved ADR alongside the behavior contract, raw evidence, and paths so reviewers can challenge a flawed controller-written contract.
- Omit the prior reviewer verdict. Never call the current detector or fix correct.
- For parsers, rewriters, validators, and heuristic transforms, require an attack matrix derived from the contract before judging code.
- If high-risk semantic behavior has no approved contract, return to `designing-changes` before review.

## Mechanical review of claims

A mechanical reviewer inspects every changed hunk and emits a file verdict. Treat quantified claims in changed comments or docs as testable: require code evidence for **exactly**, **every**, **any**, **only**, **always**, or **never**. A comment claiming a heuristic detects all unsafe cases must be proven, not trusted.

## Receive feedback

Restate each finding as a testable claim. Check cited code, contract, test, or history, then mark **Accept**, **Reject**, or **needs evidence**. Never fix rejected or unresolved claims.

| Claim | Source | Evidence checked | Decision | Action |
|---|---|---|---|---|
| Finding text | reviewer | code, test, contract, history | **Accept**, Reject, or needs evidence | fix, clarify, or none |

Trace high-severity findings independently and reject false positives with evidence. Stop for the user on a design conflict only for a real product or architectural trade-off. Fix accepted findings in the foreground with `test-driving-changes`; never spawn one fixer per finding.

## Repeated-defect stop rule

If two accepted post-fix findings share one semantic seam:

1. Freeze production edits and stop the patch and re-review loop.
2. Return to `designing-changes`.
3. Write the source-to-output invariant, enumerate dimensions and pairwise compositions, and approve the contract before another implementation attempt.

A third reviewer is not the default response; more seats over the same oracle repeat the same blind spot.

## Re-review policy

Re-review only when an accepted fix is high-severity, broad, security-sensitive, changes a public contract, or remains uncertain. Use one scoped reviewer over the fix diff and accepted claims. Verify focused low-risk fixes in the foreground with tests instead of spawning fix-verification subagents. A reviewer never reviews its own prior verdict.

## Report

Lead with one verdict and a severity-ordered table of finding, location, evidence, and fix. Include each reviewer's actual model, effort, and role, accepted or rejected claims, skipped validation, and remaining risk. Never claim a branch is merge-safe without final validation.
