import { lstat, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT_DOCS = ["README.md", "AGENTS.md"];
const DOCS_DIR = "docs";
const MAX_DOC_CHARS = 100_000;
const MAX_SNIPPET_CHARS = 300;

export type DocEntry = {
  path: string;
  title: string;
  bytes: number;
};

export type DocMatch = {
  path: string;
  title: string;
  line: number;
  heading?: string;
  text: string;
};

function headingText(line: string) {
  return /^#{1,6}\s+(.+?)\s*#*$/.exec(line)?.[1];
}

function titleOf(text: string, fallback: string) {
  for (const line of text.split("\n")) {
    const match = /^#\s+(.+?)\s*#*$/.exec(line);
    if (match) return match[1];
  }
  return fallback;
}

// Only regular files count: symlinks are skipped so a link cannot expose files outside the approved paths.
async function isRegularFile(path: string) {
  try {
    return (await lstat(path)).isFile();
  } catch {
    return false;
  }
}

async function markdownFilesUnder(root: string, relativeDir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(join(root, relativeDir), { withFileTypes: true });
  } catch {
    return [];
  }

  const paths: string[] = [];
  for (const entry of entries) {
    const relativePath = `${relativeDir}/${entry.name}`;
    if (entry.isDirectory()) {
      paths.push(...await markdownFilesUnder(root, relativePath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      paths.push(relativePath);
    }
  }
  return paths;
}

async function approvedPaths(root: string) {
  const paths: string[] = [];
  for (const path of ROOT_DOCS) {
    if (await isRegularFile(join(root, path))) paths.push(path);
  }
  paths.push(...(await markdownFilesUnder(root, DOCS_DIR)).sort());
  return paths;
}

export async function listDocs(root: string): Promise<DocEntry[]> {
  const docs: DocEntry[] = [];
  for (const path of await approvedPaths(root)) {
    const text = await readFile(join(root, path), "utf8");
    docs.push({ path, title: titleOf(text, path), bytes: Buffer.byteLength(text) });
  }
  return docs;
}

export async function readDoc(root: string, path: string) {
  const requested = path.trim().replace(/^\.\//, "");
  // Exact match against the approved list, so traversal and absolute paths can never resolve.
  const approved = (await approvedPaths(root)).find((candidate) => candidate === requested);
  if (!approved) {
    throw new Error(`"${path}" is not an approved project document. Use list_docs to see the available paths.`);
  }

  const text = await readFile(join(root, approved), "utf8");
  const truncated = text.length > MAX_DOC_CHARS;
  return {
    path: approved,
    title: titleOf(text, approved),
    truncated,
    text: truncated ? text.slice(0, MAX_DOC_CHARS) : text,
  };
}

export async function searchDocs(root: string, query: string, limit: number) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches: DocMatch[] = [];
  let totalMatches = 0;

  for (const path of await approvedPaths(root)) {
    const text = await readFile(join(root, path), "utf8");
    const title = titleOf(text, path);
    let heading: string | undefined;

    text.split("\n").forEach((line, index) => {
      heading = headingText(line) ?? heading;
      const lowered = line.toLowerCase();
      if (terms.length === 0 || !terms.every((term) => lowered.includes(term))) return;

      totalMatches += 1;
      if (matches.length < limit) {
        matches.push({ path, title, line: index + 1, heading, text: line.trim().slice(0, MAX_SNIPPET_CHARS) });
      }
    });
  }

  return { totalMatches, matches };
}
