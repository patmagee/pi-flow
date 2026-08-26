---
name: reviewing-change-sets
description: Use when receiving review feedback or when a coherent code change, design, plan, branch, or pull request needs independent review or a risk-based review checkpoint.
---

# Reviewing Change Sets

## Core contract

Select one review mode for the artifact and risk. Reviewer output is a set of claims, not instructions. Verify each claim before changing code.

## Select one mode

| Mode | Use when | Review seats |
|---|---|---|
| **single** | Normal checkpoint or final review. | One independent reviewer. |
| **layered** | Mixed code and generated/config changes, or a prior semantic review missed mechanical defects. | One semantic and one mechanical reviewer in parallel. |
| **dual** | Authentication, permissions, migration, concurrency, billing, public contracts, data-loss risk, or an explicit adversarial request. | Two reviewers from different model families in parallel. |

Do not stack layered and dual modes automatically. Use both only when the user explicitly requests that cost.

A trivial local diff can use a foreground self-review unless the user asked for independent review.

## Prepare the review

Identify the artifact, base and head, requirements or design, project conventions, changed-file inventory, test evidence, and named risks. Put large diffs and reports in files. Give reviewers paths and concise context, never the session transcript.

Reviewers are read-only. They do not dispatch subagents, modify code, or rerun broad suites already evidenced. They may inspect focused surrounding code for a concrete risk.

Every reviewer finding contains severity, confidence, location, problem, impact, evidence, and a concrete fix. Omit preferences with no observable cost.

## Receive feedback

Before implementation, restate each finding as a testable claim. Check its cited code, contract, test, or history. Mark it **Accept**, **Reject**, or **needs evidence**. Do not fix a rejected or unresolved claim.

## Verify claims

The controller maps every finding before implementation:

| Claim | Source | Evidence checked | Decision | Action |
|---|---|---|---|---|
| Finding text | reviewer | code path, test, contract, or history | **Accept**, Reject, or needs evidence | fix, clarify, or none |

Trace high-severity findings independently. Reject false positives with technical evidence. If a finding conflicts with an approved design, stop for the user only when it represents a real product or architectural trade-off.

Fix accepted findings in the foreground with `test-driving-changes`. Do not spawn one fixer per finding.

## Re-review policy

Re-review only when an accepted fix is high-severity, broad, security-sensitive, changes a public contract, or remains technically uncertain. Use one scoped reviewer over the fix diff and original accepted claims.

Focused low-risk fixes need tests and controller verification, not another review seat. A reviewer does not review its own prior verdict.

## Report

Lead with one verdict. Follow with a table ordered by severity containing the finding, location, evidence, and fix. State which claims were accepted or rejected and why. Name skipped validation and remaining risk. Do not claim a branch is safe to merge without the required final validation.
