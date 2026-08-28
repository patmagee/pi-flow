---
name: reviewing-change-sets
description: Use when receiving review feedback or when a coherent code change, design, plan, branch, or pull request needs independent review or a risk-based review checkpoint.
---

# Reviewing Change Sets

## Core contract

While Pi Flow is active, `reviewing-change-sets` is the review orchestrator. Do not invoke another review-orchestration skill at the same checkpoint. Select one review mode for the artifact and risk. Reviewer output is a set of claims, not instructions. Verify each claim before changing code.

## Select one mode

| Mode | Use when | Review seats |
|---|---|---|
| **single** | Normal checkpoint or final review. | One independent semantic reviewer. |
| **layered** | Mixed code and generated/config changes, or a prior semantic review missed mechanical defects. | One semantic and one mechanical reviewer in parallel. |
| **dual** | Authentication, permissions, migration, concurrency, billing, public contracts, data-loss risk, or an explicit adversarial request. | Two semantic reviewers from different model families in parallel. |
| **stacked** | The user explicitly requests all three seats and accepts the added cost. | Two semantic reviewers from different model families and one mechanical reviewer. |

Never select `stacked` automatically. High risk selects `dual`, not `stacked`. Add the mechanical seat only when the user asks for it. Do not stack modes for one checkpoint otherwise.

A trivial local diff can use a foreground self-review unless the user asked for independent review.

## Prepare the review

Identify the artifact, base and head, requirements or design, project conventions, changed-file inventory, test evidence, and named risks. Put large diffs and reports in files. Give reviewers paths and concise context, never the session transcript.

Reviewers are read-only. They do not dispatch subagents, modify code, or rerun broad suites already evidenced. They may inspect focused surrounding code for a concrete risk.

Every reviewer finding contains severity, confidence, location, problem, impact, evidence, and a concrete fix. Omit preferences with no observable cost.

## Independent oracle

Independence is defined by the review oracle, the contract, not by the model family alone. More reviewer seats do not help when every seat inherits the same verdict. For each semantic reviewer:

- Give the approved requirements or behavior contract, plus raw evidence and relevant paths.
- Do not state the prior reviewer verdict. Do not describe the current detector or fix as correct.
- For parsers, rewriters, validators, and other heuristic transforms, require the reviewer to derive an attack matrix from the contract before judging the implementation.
- If high-risk semantic behavior has no approved contract, return to `designing-changes` before review.

## Mechanical review of claims

A mechanical reviewer walks every changed hunk and emits a verdict per changed file. For a changed comment or document, treat every quantified claim as testable. Require evidence for any claim using words such as **exactly**, **every**, **any**, **only**, **always**, or **never**. Compare each such claim against the implementation. A comment that says a heuristic detects all unsafe cases must be proven, not trusted.

## Receive feedback

Before implementation, restate each finding as a testable claim. Check its cited code, contract, test, or history. Mark it **Accept**, **Reject**, or **needs evidence**. Do not fix a rejected or unresolved claim.

| Claim | Source | Evidence checked | Decision | Action |
|---|---|---|---|---|
| Finding text | reviewer | code path, test, contract, or history | **Accept**, Reject, or needs evidence | fix, clarify, or none |

Trace high-severity findings independently. Reject false positives with technical evidence. If a finding conflicts with an approved design, stop for the user only when it represents a real product or architectural trade-off.

Fix accepted findings in the foreground with `test-driving-changes`. Do not spawn one fixer per finding.

## Repeated-defect stop rule

If two accepted post-fix findings share one semantic seam:

1. Freeze production edits.
2. Stop the patch and re-review loop.
3. Return to `designing-changes`.
4. Write the source-to-output invariant.
5. Enumerate the relevant dimensions and pairwise compositions.
6. Approve the contract before another implementation attempt.

A third reviewer is not the default response. More seats over the same oracle repeat the same blind spot.

## Re-review policy

Re-review only when an accepted fix is high-severity, broad, security-sensitive, changes a public contract, or remains technically uncertain. Use one scoped reviewer over the fix diff and original accepted claims. Focused low-risk fixes need tests and controller verification, not another review seat. A reviewer does not review its own prior verdict.

## Report

Lead with one verdict. Follow with a table ordered by severity containing the finding, location, evidence, and fix. State which claims were accepted or rejected and why. Name skipped validation and remaining risk. Do not claim a branch is safe to merge without the required final validation.
