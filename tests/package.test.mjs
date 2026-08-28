import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const expectedSkills = [
  "designing-changes",
  "executing-plans-foreground",
  "planning-change-sets",
  "reviewing-change-sets",
  "systematic-debugging",
  "test-driving-changes",
];

async function text(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

function frontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "skill must start with YAML frontmatter");
  const values = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return values;
}

test("package exposes one extension and the skills directory", async () => {
  const pkg = JSON.parse(await text("package.json"));
  assert.equal(pkg.name, "pi-flow");
  assert.equal(pkg.type, "module");
  assert.ok(pkg.keywords.includes("pi-package"));
  assert.deepEqual(pkg.pi.extensions, ["./extensions/pi-flow.js"]);
  assert.deepEqual(pkg.pi.skills, ["./skills"]);
  assert.equal(pkg.scripts.eval, "node scripts/eval-workflows.mjs");
  assert.ok(pkg.files.includes("scripts"));
  assert.ok(pkg.files.includes("evals"));
  assert.ok(pkg.files.includes("tests/scenarios.md"));
  assert.ok(pkg.files.includes("tests/*.test.mjs"));
  assert.ok(pkg.files.includes("docs"));
});

test("all workflow skills are discoverable and concise", async () => {
  for (const name of expectedSkills) {
    const markdown = await text(`skills/${name}/SKILL.md`);
    const metadata = frontmatter(markdown);
    assert.equal(metadata.name, name);
    assert.match(metadata.description, /^Use when /);
    assert.ok(metadata.description.length <= 1024, `${name} description is too long`);
    assert.ok(markdown.split(/\s+/).length <= 800, `${name} exceeds the 800-word budget`);
  }
});

test("skills contain the workflow decisions that prevent orchestration bloat", async () => {
  const required = {
    "designing-changes": ["Spike", "Bounded", "Architectural", "A)", "Accept", "Change", "Discuss", "one section per turn"],
    "planning-change-sets": ["Outcome", "Test-first contract", "Review gate", "30–90 minutes"],
    "test-driving-changes": ["RED", "GREEN", "REFACTOR", "regression guard"],
    "executing-plans-foreground": ["foreground", "completion notification", "metadata", "progress.md", "Never let implementation drift silently", "same commit"],
    "reviewing-change-sets": [
      "single", "layered", "dual", "stacked",
      "Accept", "Re-review", "testable claim", "needs evidence",
      "orchestrator", "oracle", "prior reviewer verdict", "attack matrix",
      "semantic seam", "designing-changes",
      "exactly", "every", "any", "only", "always", "never",
    ],
    "systematic-debugging": ["Reproduce", "Evidence", "Hypothesis", "root cause", "three failed", "test-driving-changes", "An unverified code change is not a mitigation", "systemic root cause", "`designing-changes`"],
  };

  for (const [name, terms] of Object.entries(required)) {
    const markdown = await text(`skills/${name}/SKILL.md`);
    for (const term of terms) {
      assert.ok(markdown.includes(term), `${name} must contain ${JSON.stringify(term)}`);
    }
  }
});

test("reviewing-change-sets defines four modes, oracle independence, and the stop rule", async () => {
  const review = await text("skills/reviewing-change-sets/SKILL.md");

  for (const mode of ["single", "layered", "dual", "stacked"]) {
    assert.ok(review.includes(`**${mode}**`), `review skill must document the ${mode} mode`);
  }

  // stacked is the three-seat mode and is never automatic.
  assert.match(review, /two semantic[\s\S]*mechanical/i);
  assert.match(review, /[Nn]ever select .*stacked.* automatically|stacked.* never automatic|[Nn]ever.*automatically.*stacked/);
  assert.match(review, /explicit/i);

  // reviewing-change-sets is the single review orchestrator while Pi Flow is active.
  assert.match(review, /orchestrator/);
  assert.match(review, /Do not invoke another review-orchestration skill/);

  // Oracle independence.
  assert.match(review, /oracle/);
  assert.match(review, /behavior contract/);
  assert.match(review, /prior reviewer verdict/);
  assert.match(review, /attack matrix/);
  assert.match(review, /parser|rewriter|validator/);

  // Repeated-defect stop rule.
  assert.match(review, /semantic seam/);
  assert.match(review, /two accepted post-fix findings/i);
  assert.match(review, /`designing-changes`/);
  assert.match(review, /source-to-output invariant/);
  assert.match(review, /pairwise/);
  assert.match(review, /A third reviewer is not the default/);

  // Strengthened mechanical review of quantified claims.
  for (const word of ["exactly", "every", "any", "only", "always", "never"]) {
    assert.ok(review.includes(word), `review skill must list the quantifier word ${JSON.stringify(word)}`);
  }
});

test("extension states the review orchestrator and stop rule briefly", async () => {
  const extension = await text("extensions/pi-flow.js");
  assert.match(extension, /reviewing-change-sets/);
  assert.match(extension, /orchestrat/i);
  assert.match(extension, /stacked/);
  assert.match(extension, /oracle|contract/);
  assert.match(extension, /semantic seam|two .*findings|repeated/i);
});

test("documentation explains installation and Superpowers coexistence", async () => {
  const readme = await text("README.md");
  assert.match(readme, /pi install git:github\.com\/patmagee\/pi-flow/);
  assert.match(readme, /pi config/);
  assert.match(readme, /Superpowers Pi extension/);
  assert.match(readme, /subagent-driven-development/);
  assert.match(readme, /systematic-debugging/);
  assert.match(readme, /Claude Code/);

  const review = frontmatter(await text("skills/reviewing-change-sets/SKILL.md"));
  assert.match(review.description, /receiving review feedback/);

  // README documents the four modes and the review orchestrator policy.
  for (const mode of ["single", "layered", "dual", "stacked"]) {
    assert.ok(readme.includes(mode), `README must document the ${mode} mode`);
  }
  assert.match(readme, /review orchestrator/);
  assert.match(readme, /two-pass-review/);

  const license = await text("LICENSE");
  assert.match(license, /MIT License/);
});

test("distribution includes validation and representative scenarios", async () => {
  await text("scripts/validate-skills.mjs");
  await text("scripts/eval-workflows.mjs");
  const scenarios = await text("tests/scenarios.md");
  for (const heading of [
    "## Small bug",
    "## Architectural feature",
    "## Incremental design approval",
    "## Plan execution",
    "## Plan divergence",
    "## Review findings",
    "## Feedback intake",
    "## High-risk final review",
    "## Debugging failure",
    "## Systemic root cause",
    "## Repeated defects from one seam",
    "## Independent review oracle",
    "## Explicit stacked review",
    "## Review orchestrator is single source",
    "## Heuristic transform without a contract",
  ]) {
    assert.ok(scenarios.includes(heading), `scenarios.md must document ${heading}`);
  }

  assert.match(scenarios, /re-review per the `reviewing-change-sets` policy/);
  assert.match(scenarios, /semantic seam/);
  assert.match(scenarios, /stacked/);
  const adr = await text("docs/decisions/2026-08-25-pi-flow.md");
  assert.match(adr, /Re-review follows the `reviewing-change-sets` policy/);
  assert.match(adr, /approach selection from incremental design approval/);
  assert.match(adr, /When only one approach is viable/);
  assert.match(adr, /does not advance to the next section/);
  assert.match(adr, /Never let implementation drift silently/);
  assert.match(adr, /systemic root cause/);
  assert.match(adr, /receiving review feedback/);
  assert.match(adr, /review orchestrator/);
  assert.match(adr, /stacked/);
  assert.match(adr, /oracle/);
  assert.match(adr, /semantic seam/);
  assert.match(scenarios, /one obvious safe solution/);
  assert.match(scenarios, /Do not invent alternatives/);

  const tdd = await text("skills/test-driving-changes/SKILL.md");
  assert.match(tdd, /bounded bug fix stays in the foreground/);
});
