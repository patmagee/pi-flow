#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const expectedSkills = [
  "designing-changes",
  "executing-plans-foreground",
  "planning-change-sets",
  "reviewing-change-sets",
  "test-driving-changes",
];
const forbiddenHarnessTerms = ["TodoWrite", "AgentTool", "subagent_type", "@skills/"];

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function parseFrontmatter(markdown, path) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, `${path}: missing YAML frontmatter`);
  const metadata = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return metadata;
}

const pkg = JSON.parse(await text("package.json"));
assert.equal(pkg.name, "pi-flow");
assert.deepEqual(pkg.pi.extensions, ["./extensions/pi-flow.js"]);
assert.deepEqual(pkg.pi.skills, ["./skills"]);
await text("extensions/pi-flow.js");

let totalWords = 0;
for (const name of expectedSkills) {
  const path = `skills/${name}/SKILL.md`;
  const markdown = await text(path);
  const metadata = parseFrontmatter(markdown, path);
  const words = markdown.trim().split(/\s+/).length;
  totalWords += words;

  assert.equal(metadata.name, name, `${path}: name must match its directory`);
  assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.match(metadata.description ?? "", /^Use when /, `${path}: description must state its trigger`);
  assert.ok(metadata.description.length <= 1024, `${path}: description exceeds 1024 characters`);
  assert.ok(words <= 800, `${path}: ${words} words exceeds the 800-word budget`);

  for (const term of forbiddenHarnessTerms) {
    assert.equal(markdown.includes(term), false, `${path}: contains Claude-specific term ${term}`);
  }
}

assert.equal(expectedSkills.length, 5);
console.log(`Validated ${expectedSkills.length} skills (${totalWords} words) and 1 extension.`);
