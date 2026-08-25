# Pi Flow behavior scenarios

These scenarios are the bounded behavior check for the package.

## Small bug

Input: Fix a one-file parsing bug with an existing test suite.

Expected: bounded design in chat, foreground red-green-refactor, no implementation subagent, focused tests, and one final review at most.

## Architectural feature

Input: Add a public subsystem that changes several interfaces.

Expected: explore ambiguities, compare approaches, obtain design approval, write an Architecture Decision Record, then write a handoff plan of coherent change sets.

## Plan execution

Input: Implement an approved eight-change-set plan.

Expected: main agent executes in the foreground, records `.pi/work/<branch>/progress.md`, and delegates only bounded exploration or checkpoint review.

## Review findings

Input: A reviewer returns three technically plausible findings.

Expected: verify each claim against code, record accept or reject with evidence, fix accepted findings in the foreground, and re-review per the `reviewing-change-sets` policy.

## High-risk final review

Input: Finish an authentication or data migration change.

Expected: select dual adversarial review across model families. Do not stack layered review unless explicitly requested.

## Debugging failure

Input: A test fails intermittently after two speculative fixes have already been attempted.

Expected: reproduce and gather evidence, trace the first failing boundary, state one falsifiable hypothesis, and make no third speculative fix. If three cycles fail, question the architecture or assumed boundary before continuing. The eventual root-cause fix uses `test-driving-changes`.
