#!/usr/bin/env node
/**
 * fix-noopener.mjs — Auto-add rel="noopener noreferrer" to every
 * target="_blank" anchor/Link that is missing it. Fixes the tabnabbing findings.
 *
 * Safe: only touches <a>/<Link> tags that already have target="_blank" and no rel.
 * Prints a diff-style summary. Use --dry to preview without writing.
 *
 * USAGE (from project root):
 *   node fix-noopener.mjs            # fix src/** and app/**
 *   node fix-noopener.mjs --dry      # preview only
 *   node fix-noopener.mjs --dir src
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const args = process.argv.slice(2);
const DRY  = args.includes("--dry");
const di   = args.indexOf("--dir");
const ROOT = di >= 0 ? args[di + 1] : ".";
const EXT  = new Set([".tsx", ".jsx", ".ts", ".js", ".html", ".htm", ".astro", ".vue", ".svelte"]);
const SKIP = new Set(["node_modules", ".next", ".git", "dist", "build", "out", ".vercel"]);

let filesChanged = 0, tagsFixed = 0;

// Match an <a ...> or <Link ...> opening tag that has target="_blank" but no rel=
const TAG_RE = /<(a|Link)\b([^>]*?)>/g;

function fixTag(full, tag, attrs) {
  if (!/target\s*=\s*["'{]?\s*_blank/.test(attrs)) return full;   // not a new-tab link
  if (/\brel\s*=/.test(attrs)) return full;                        // already has rel
  tagsFixed++;
  const sep = attrs.endsWith(" ") || attrs === "" ? "" : " ";
  return `<${tag}${attrs}${sep}rel="noopener noreferrer">`;
}

async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) await walk(join(dir, e.name)); continue; }
    if (!EXT.has(extname(e.name).toLowerCase())) continue;
    const p = join(dir, e.name);
    const src = await readFile(p, "utf8");
    const before = tagsFixed;
    const out = src.replace(TAG_RE, fixTag);
    if (out !== src) {
      filesChanged++;
      console.log(`✎ ${p}  (+${tagsFixed - before} link${tagsFixed - before > 1 ? "s" : ""})`);
      if (!DRY) await writeFile(p, out);
    }
  }
}

console.log(`🔗 Adding rel="noopener noreferrer" to target=_blank links${DRY ? "  (DRY RUN)" : ""}\n`);
await walk(ROOT);
console.log(`\n✅ ${tagsFixed} link(s) in ${filesChanged} file(s)${DRY ? " would be" : ""} fixed.`);
