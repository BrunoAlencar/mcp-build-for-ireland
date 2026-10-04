import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { listDocs, readDoc, searchDocs } from "./doc-library.js";

let root: string;

before(async () => {
  root = await mkdtemp(join(tmpdir(), "project-docs-"));
  await mkdir(join(root, "docs", "notes"), { recursive: true });
  await mkdir(join(root, "src"));
  await writeFile(join(root, "README.md"), "# Demo Project\n\nIrish public data.\n");
  await writeFile(join(root, "docs", "guide.md"), "# Guide\n\n## Schedule\n\nDoors open at 9am in Dublin.\n");
  await writeFile(join(root, "docs", "notes", "ideas.md"), "No heading here\n");
  await writeFile(join(root, "docs", "data.json"), "{}");
  await writeFile(join(root, ".env"), "SECRET=1\n");
  await writeFile(join(root, "src", "notes.md"), "# Not approved\n");
  await symlink(join(root, ".env"), join(root, "docs", "leak.md"));
});

after(async () => {
  await rm(root, { recursive: true, force: true });
});

test("listDocs returns only approved Markdown files", async () => {
  const docs = await listDocs(root);
  assert.deepEqual(docs.map((doc) => doc.path), ["README.md", "docs/guide.md", "docs/notes/ideas.md"]);
  assert.equal(docs[0].title, "Demo Project");
  assert.equal(docs[2].title, "docs/notes/ideas.md");
});

test("readDoc returns an approved document", async () => {
  const doc = await readDoc(root, "./docs/guide.md");
  assert.equal(doc.path, "docs/guide.md");
  assert.equal(doc.truncated, false);
  assert.match(doc.text, /Doors open/);
});

test("readDoc rejects paths outside the approved list", async () => {
  for (const path of ["../README.md", "docs/../.env", ".env", "src/notes.md", "docs/data.json", "docs/leak.md", join(root, "README.md")]) {
    await assert.rejects(readDoc(root, path), /not an approved project document/, path);
  }
});

test("searchDocs matches every term and reports the nearest heading", async () => {
  const result = await searchDocs(root, "dublin DOORS", 10);
  assert.equal(result.totalMatches, 1);
  assert.deepEqual(result.matches[0], {
    path: "docs/guide.md",
    title: "Guide",
    line: 5,
    heading: "Schedule",
    text: "Doors open at 9am in Dublin.",
  });
});

test("searchDocs caps returned matches but counts them all", async () => {
  const result = await searchDocs(root, "e", 1);
  assert.equal(result.matches.length, 1);
  assert.ok(result.totalMatches > 1);
});

test("searchDocs never surfaces unapproved files", async () => {
  assert.equal((await searchDocs(root, "SECRET", 10)).totalMatches, 0);
});
