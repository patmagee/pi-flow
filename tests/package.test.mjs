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
  assert.ok(pkg.files.includes("scripts"));
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
    "designing-changes": ["Spike", "Bounded", "Architectural", "approval"],
    "planning-change-sets": ["Outcome", "Test-first contract", "Review gate", "30–90 minutes"],
    "test-driving-changes": ["RED", "GREEN", "REFACTOR", "regression guard"],
    "executing-plans-foreground": ["foreground", "completion notification", "metadata", "progress.md"],
    "reviewing-change-sets": ["single", "layered", "dual", "Accept", "Re-review"],
    "systematic-debugging": ["Reproduce", "Evidence", "Hypothesis", "root cause", "three failed", "test-driving-changes", "An unverified code change is not a mitigation"],
  };

  for (const [name, terms] of Object.entries(required)) {
    const markdown = await text(`skills/${name}/SKILL.md`);
    for (const term of terms) {
      assert.ok(markdown.includes(term), `${name} must contain ${JSON.stringify(term)}`);
    }
  }
});

test("documentation explains installation and Superpowers coexistence", async () => {
  const readme = await text("README.md");
  assert.match(readme, /pi install git:github\.com\/patmagee\/pi-flow/);
  assert.match(readme, /pi config/);
  assert.match(readme, /Superpowers Pi extension/);
  assert.match(readme, /subagent-driven-development/);
  assert.match(readme, /systematic-debugging/);
  assert.match(readme, /Claude Code/);

  const license = await text("LICENSE");
  assert.match(license, /MIT License/);
});

test("distribution includes validation and representative scenarios", async () => {
  await text("scripts/validate-skills.mjs");
  const scenarios = await text("tests/scenarios.md");
  for (const heading of [
    "## Small bug",
    "## Architectural feature",
    "## Plan execution",
    "## Review findings",
    "## High-risk final review",
    "## Debugging failure",
  ]) {
    assert.ok(scenarios.includes(heading));
  }

  assert.match(scenarios, /re-review per the `reviewing-change-sets` policy/);
  const adr = await text("docs/decisions/2026-08-25-pi-flow.md");
  assert.match(adr, /Re-review follows the `reviewing-change-sets` policy/);

  const tdd = await text("skills/test-driving-changes/SKILL.md");
  assert.match(tdd, /bounded bug fix stays in the foreground/);
});
