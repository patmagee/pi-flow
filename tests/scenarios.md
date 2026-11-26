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

Expected: select `dual` adversarial review across model families. Do not select `stacked` or add a mechanical seat unless the user explicitly requests all three seats.

## Repeated defects from one seam

Input: Two accepted post-fix findings come from the same semantic seam in one source-to-output transform, and a teammate proposes a third reviewer.

Expected: freeze production edits, stop the patch and re-review loop, return to `designing-changes`, write the source-to-output invariant, enumerate the relevant dimensions and pairwise compositions, and approve the contract before another implementation attempt. A third reviewer is not the default response.

## Independent review oracle

Input: Prepare two semantic reviewers for a high-risk change that a previous reviewer already approved.

Expected: give each reviewer the raw user requirements or approved ADR alongside the behavior contract plus raw evidence and paths. Do not state the prior reviewer verdict or describe the current detector as correct. Define independence by the review oracle, the contract, not by the model family alone.

## Dynamic review model selection

Input: Select reviewer models for a `dual` review when Pi exposes models across Anthropic, OpenAI Codex, Google Vertex Gemini, DeepSeek, Kimi, and GLM.

Expected: inspect the live model catalog exposed by `subagent_start` instead of sticking to hardcoded providers, choose freely across any enabled providers while keeping `dual` seats in distinct model families, pass exact `provider/model` identifiers, and record each seat's actual model, effort, and role.

## Fast-track design approval

Input: After reviewing section 1 of a bounded design, the user says "accept all remaining sections and just build it; I am going AFK."

Expected: stop pausing at intermediate section gates, summarize the accepted decisions and any assumptions, and proceed to approved implementation without further section prompts.

## Explicit stacked review

Input: The user explicitly asks for two semantic reviewers from different model families plus one mechanical reviewer and accepts the cost.

Expected: select `stacked` with all three seats. State that `stacked` is never selected automatically.

## Review orchestrator is single source

Input: A generic "just review my branch" request while Pi Flow is active, from a teammate who usually runs a separate two-pass review skill.

Expected: state that `reviewing-change-sets` is the review orchestrator for this checkpoint, map the request onto one of its modes, and do not run the separate explicit-only two-pass skill at the same checkpoint.

## Heuristic transform without a contract

Input: Review a Cypher rewriter that detects and transforms unsafe identifiers, high-risk semantic behavior with no approved contract.

Expected: return to `designing-changes` to establish the behavior contract before review. For a parser, rewriter, or validator, require reviewers to derive an attack matrix from the contract. Do not treat the current detector as correct.

## Debugging failure

Input: A test fails intermittently after two speculative fixes have already been attempted.

Expected: reproduce and gather evidence, trace the first failing boundary, state one falsifiable hypothesis, and make no third speculative fix. If three cycles fail, question the architecture or assumed boundary before continuing. The eventual root-cause fix uses `test-driving-changes`.

## Systemic root cause

Input: Investigation confirms that the defect can only be fixed by changing a public consistency contract shared by several services.

Expected: preserve any reversible mitigation, stop treating the work as a bounded fix, and invoke `designing-changes` with the evidence, constraints, and unresolved questions.
