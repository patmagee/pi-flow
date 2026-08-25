---
name: test-driving-changes
description: Use when implementing a feature, bug fix, refactor, or other behavior change before production code is written.
---

# Test-Driving Changes

## Core contract

Prove the test can detect missing behavior before writing the behavior. A bounded bug fix stays in the foreground unless the user explicitly requests isolated implementation.

## RED

Write one focused test for the next observable behavior. Prefer real code and state over assertions about mocks.

Run the narrowest useful command. Confirm the test fails for the intended missing behavior. A compile error counts only when the new public contract cannot compile before implementation. Fix unrelated errors until the failure is meaningful.

If the test passes immediately, it does not prove the new behavior. Correct the test before proceeding.

## GREEN

Write the smallest production change that satisfies the failing behavior. Do not add speculative options or unrelated refactors.

Run the same focused command. Confirm the new test passes and nearby tests remain green.

## REFACTOR

After GREEN, improve names, duplication, and boundaries without adding behavior. Keep the focused tests green.

Repeat for the next behavior.

## Validation ladder

| Point | Validation |
|---|---|
| Each cycle | One focused test or smallest relevant target. |
| Change-set checkpoint | Affected module tests plus compile, lint, format, or schema checks. |
| Final handoff | The appropriate full project validation once on the final tree. |

Do not rerun a broad suite merely because a reviewer read the same unchanged diff.

## Regression guard

Use a local revert or mutation check when a bug fix, review finding, or subtle boundary test could pass for the wrong reason. Temporarily remove the specific production fix, confirm the targeted regression guard fails, restore the fix, and confirm GREEN.

A regression guard is evidence for a risky test, not a ritual for every test.

## Exceptions

Generated output, configuration-only changes, and throwaway probes may need validation instead of unit tests. State the reason and obtain user approval when production behavior changes without a failing automated test.
