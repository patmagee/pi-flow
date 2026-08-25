# Pi Flow

Pi Flow is a foreground-first software delivery workflow for [Pi](https://github.com/badlogic/pi-mono). It preserves interactive design, Architecture Decision Records, handoff plans, test-driven development, and independent review without making subagents the default implementation unit.

## Workflow

```text
explore → approve design → write handoff plan → implement in foreground
        → review coherent checkpoints → verify and fix claims → final validation
```

Pi Flow includes six skills:

| Skill | Use |
|---|---|
| `designing-changes` | Explore ambiguity and produce an approved design or Architecture Decision Record. |
| `planning-change-sets` | Write a concise plan for another model or engineer. |
| `test-driving-changes` | Apply red-green-refactor with risk-scaled validation. |
| `executing-plans-foreground` | Execute plans in the main Pi session and preserve resumable state. |
| `reviewing-change-sets` | Select one risk-based review mode and verify reviewer claims. |
| `systematic-debugging` | Gather evidence, test one hypothesis, and fix verified root causes. |

A small extension adds four workflow rules to Pi's system prompt. It does not inject complete skill bodies or register tools.

## Install

Install from GitHub:

```bash
pi install git:github.com/patmagee/pi-flow
```

For local development:

```bash
pi install /absolute/path/to/pi-flow
```

Restart Pi or run `/reload` after changing package resources.

## Configure with Superpowers

Pi Flow does not disable other packages. If the Superpowers Pi extension remains enabled, it continues to inject the full `using-superpowers` workflow and can override the foreground-first policy.

Run:

```bash
pi config
```

In the global package configuration:

1. Disable the **Superpowers Pi extension**: `.pi/extensions/superpowers.ts`.
2. Disable these conflicting Superpowers skills in Pi:
   - `using-superpowers`
   - `writing-plans`
   - `executing-plans`
   - `subagent-driven-development`
   - `requesting-code-review`
   - `test-driven-development`
   - `systematic-debugging`
3. Keep independent utility skills if you use them:
   - `using-git-worktrees`
   - `verification-before-completion`
   - `finishing-a-development-branch`
   - `writing-skills`
4. Make existing `two-pass-review` and `dual-adversarial-review` skills manual-only, or use the equivalent `layered` and `dual` modes in `reviewing-change-sets`.

This changes Pi resource selection only. Claude Code can continue to use the normal Superpowers plugin.

## Delegation defaults

- Implement and integrate code in the foreground.
- Use read-only subagents for bounded exploration and independent review.
- Use an implementer subagent only for explicit isolated mechanical work.
- Fix accepted review findings in the foreground.
- Re-review only broad, high-risk, security-sensitive, or uncertain fixes.
- Use completion notifications and final summaries. Do not poll full subagent metadata.

## Invoke a skill directly

Pi discovers skills automatically from their descriptions. You can force a workflow with a skill command:

```text
/skill:designing-changes
/skill:planning-change-sets
/skill:executing-plans-foreground
/skill:reviewing-change-sets dual
/skill:systematic-debugging
```

## Development

The package has no runtime dependencies.

```bash
npm test
npm run validate
npm pack --dry-run
```

Behavior scenarios are documented in [`tests/scenarios.md`](tests/scenarios.md).
