# Pi Flow behavior scenarios

These scenarios are the bounded behavior check for the package.

## Small bug

Input: Fix a one-file parsing bug with an existing test suite.

Expected: bounded design in chat, foreground red-green-refactor, no implementation subagent, focused tests, and one final review at most.

## Architectural feature

Input: Add a public subsystem that changes several interfaces.

Expected: explore ambiguities, compare approaches, obtain design approval, write an Architecture Decision Record, then write a handoff plan of coherent change sets.

## Incremental design approval

Scenario A input: Design a nontrivial feature with three viable approaches and several load-bearing decisions.

Expected: present A/B/C approaches with trade-offs and a recommendation. After the user chooses one, present one design section per turn with Accept, Change, and Discuss choices. Revise a changed section before continuing, then present the integrated design for final approval.

Scenario B input: Make a one-line configuration change with one obvious safe solution.

Expected: Do not invent alternatives. State why the approach is the only viable one, then use the trivial one-section path without unnecessary approach-selection ceremony.

## Plan execution

Input: Implement an approved eight-change-set plan.

Expected: main agent executes in the foreground, records `.pi/work/<branch>/progress.md`, and delegates only bounded exploration or checkpoint review.

## Plan divergence

Input: Implementation reveals that a reversible library choice in the approved plan cannot satisfy an existing interface.

Expected: Never let implementation drift silently. If the plan is committed, update it in the same commit. If it is session-local, update `progress.md` and `decisions.md`. Stop for the user only if the departure conflicts with the approved design.

## Review findings

Input: A reviewer returns three technically plausible findings.

Expected: verify each claim against code, record accept or reject with evidence, fix accepted findings in the foreground, and re-review per the `reviewing-change-sets` policy.

## Feedback intake

Input: A review comment claims that a changed function can return null and asks for a defensive cast.

Expected: restate the finding as a testable claim, inspect the cited contract and code path, then mark it Accept, Reject, or needs evidence before proposing a fix. Implement only an accepted claim.

## High-risk final review

Input: Finish an authentication or data migration change.

Expected: select dual adversarial review across model families. Do not stack layered review unless explicitly requested.

## Debugging failure

Input: A test fails intermittently after two speculative fixes have already been attempted.

Expected: reproduce and gather evidence, trace the first failing boundary, state one falsifiable hypothesis, and make no third speculative fix. If three cycles fail, question the architecture or assumed boundary before continuing. The eventual root-cause fix uses `test-driving-changes`.

## Systemic root cause

Input: Investigation confirms that the defect can only be fixed by changing a public consistency contract shared by several services.

Expected: preserve any reversible mitigation, stop treating the work as a bounded fix, and invoke `designing-changes` with the evidence, constraints, and unresolved questions.
