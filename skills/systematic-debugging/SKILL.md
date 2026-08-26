---
name: systematic-debugging
description: Use when a bug, test failure, build failure, performance problem, or unexpected behavior must be understood before a fix is proposed.
---

# Systematic Debugging

## Core contract

Do not guess at fixes. Establish an evidence-supported root cause, then make one testable change at the source.

A reversible mitigation may reduce immediate harm while investigation continues. Acceptable mitigations restore or limit known behavior through a configuration rollback, feature flag, traffic route, isolation control, or equivalent operational action. An unverified code change is not a mitigation; it is another speculative fix and counts against the three-cycle limit. Label the mitigation, record its limits, and do not present it as the root fix.

## 1. Reproduce and gather Evidence

1. Read the complete error, warning, stack trace, and failing command.
2. Reproduce with the smallest reliable steps. If it is intermittent, record frequency and conditions instead of guessing.
3. Check recent code, dependency, configuration, data, and environment changes.
4. Trace the bad value or state backward through callers until its origin is known.
5. For a multi-component path, inspect each boundary once: input, output, configuration, state, and timing. Identify the first boundary where observed behavior diverges.
6. If reproduction is unsafe or unavailable, add the smallest useful logging, metric, trace, or state capture. Protect secrets and personal data.

Record observations separately from interpretations. Keep exact commands and outcomes in `.pi/work/<branch>/progress.md` for long investigations.

Use a read-only investigator subagent only for an independent code path, log set, or competing explanation. Give it one bounded question. The foreground agent owns evidence synthesis.

## 2. Compare patterns

Find a similar working path in the same codebase or environment. Compare behavior, inputs, lifecycle, dependencies, and configuration. List differences before deciding which difference matters.

Read a reference implementation completely when its contract is the basis of the fix. Do not copy a partial pattern.

## 3. Test one Hypothesis

State one falsifiable claim:

> I think **X** is the root cause because **Y evidence**. If true, **Z observation** will occur.

Test one variable with the smallest probe. Record whether the observation confirmed or rejected the hypothesis. A rejected hypothesis is progress; do not layer another speculative change on top.

After **three failed** fix or hypothesis cycles, stop changing code. Recheck the evidence and discuss whether the architecture, test model, or assumed boundary is wrong before a fourth attempt.

## 4. Fix and verify

1. Use `test-driving-changes` to create the smallest automated reproduction and confirm RED.
2. Implement one root-cause fix. Avoid unrelated refactoring.
3. Confirm GREEN with the same focused command.
4. Run checkpoint validation for affected components.
5. Verify the original symptom, not only the new test.

Add defense at additional boundaries only when independent entry paths can recreate the invalid state or the blast radius warrants it. Do not add duplicate validation everywhere by ritual.

For asynchronous failures, wait for the observable condition with a timeout and diagnostic message. Use fixed sleeps only when time itself is the behavior under test.

## Re-enter design for systemic causes

When a confirmed systemic root cause requires a change to architecture, product behavior, or a public contract, stop treating it as a bounded fix. Invoke `designing-changes` and carry the evidence, constraints, mitigation, and unresolved questions into that design. A reversible production mitigation may remain active while the design is considered.

## Report

State the root cause, evidence, fix, regression test, verification, confidence, and remaining uncertainty. If the root cause is external or environmental, document what was excluded and add proportional handling or observability.
