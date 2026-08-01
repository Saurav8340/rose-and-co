#!/usr/bin/env node
/**
 * compress-images.mjs — Batch image optimizer for Next.js projects.
 *
 * Fixes the #1 finding: 1.7–2.4 MB PNGs killing LCP → CVR → ROAS.
 * Converts every raster image under /public to optimized WebP (and keeps a
 * resized fallback), targeting: hero < 150 KB, gallery < 90 KB.
 *
 * Safe by default: writes .webp NEXT TO the original (originals untouched) so
 * you can review before deleting. Use --replace to also shrink the originals.
 *
 * USAGE (run from project root, sharp already ships with Next.js):
 *   node compress-images.mjs                      # scan ./public, make .webp
 *   node compress-images.mjs --dir public/products
 *   node compress-images.mjs --maxw 1600 --quality 78
 *   node compress-images.mjs --replace            # also downscale originals in place
 *   node compress-images.mjs --dry                # just report, write nothing
 */
import sharp from "sharp";
import { readdir, stat, writeFile } from "node:fs/promises";
import { join, extname, dirname, basename } from "node:path";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const has = (k) => args.includes(k);

const DIR      = opt("--dir", "public");
const MAXW     = parseInt(opt("--maxw", "1600"), 10);   // cap width (px)
const QUALITY  = parseInt(opt("--quality", "76"), 10);  // webp quality
const REPLACE  = has("--replace");
const DRY      = has("--dry");
const EXT      = new Set([".png", ".jpg", ".jpeg"]);

let scanned = 0, done = 0, savedBytes = 0;

async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { console.error(`✖ cannot read ${dir}`); return; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { await walk(p); continue; }
    if (!EXT.has(extname(e.name).toLowerCase())) continue;
    await optimizeFile(p);
  }
}

async function optimizeFile(p) {
  scanned++;
  const before = (await stat(p)).size;
  const webpPath = join(dirname(p), basename(p, extname(p)) + ".webp");
  try {
    const pipeline = sharp(p).rotate().resize({ width: MAXW, withoutEnlargement: true });
    const webp = await pipeline.clone().webp({ quality: QUALITY, effort: 5 }).toBuffer();
    const kbB = (before / 1024).toFixed(0);
    const kbA = (webp.length / 1024).toFixed(0);
    const cut = (100 - (webp.length / before) * 100).toFixed(0);
    console.log(`${cut >= 0 ? "↓" : "↑"} ${p}  ${kbB}KB → ${kbA}KB webp  (-${cut}%)`);
    if (!DRY) {
      await writeFile(webpPath, webp);
      if (REPLACE) {
        // also rewrite the original in its own format, downscaled + compressed
        const ext = extname(p).toLowerCase();
        const buf = ext === ".png"
          ? await pipeline.clone().png({ compressionLevel: 9, palette: true }).toBuffer()
          : await pipeline.clone().jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
        if (buf.length < before) await writeFile(p, buf);
      }
    }
    savedBytes += Math.max(0, before - webp.length);
    done++;
  } catch (e) {
    console.error(`✖ ${p}: ${e.message}`);
  }
}

console.log(`🖼  Optimizing images in ./${DIR}  (maxw=${MAXW}, q=${QUALITY}${REPLACE ? ", REPLACE" : ""}${DRY ? ", DRY" : ""})\n`);
await walk(DIR);
console.log(`\n✅ ${done}/${scanned} images processed. Est. saved ~${(savedBytes / 1024 / 1024).toFixed(1)} MB of transfer.`);
console.log(REPLACE
  ? "   Originals were downscaled in place; .webp versions also written."
  : "   .webp files written next to originals. Point <Image src> at them, then delete originals when happy.");
