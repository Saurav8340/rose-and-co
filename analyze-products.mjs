#!/usr/bin/env node
/**
 * analyze-products.mjs — Reads your Rose & Co project and builds a
 * Product Intelligence Report + a first-draft Ideal Customer Profile (ICP).
 *
 * It scans (read-only, changes nothing):
 *   • /public/products images        → count, formats, sizes, dimensions
 *   • product data                    → src/lib/*products*, *.json, schemas.ts, API routes
 *   • page copy                       → titles, descriptions, prices, trust words
 *   • lead capture fields             → what data you collect (buyer signals)
 *   • analytics/marketing signals     → Pixel, GA4, UTM handling
 * Then it synthesizes an ICP from those signals and writes:
 *   → product-intel.json   (raw structured data)
 *   → product-intel.md     (readable report + ICP draft)
 *
 * USAGE (from project root):  node analyze-products.mjs
 * sharp is optional — used only for image dimensions if available.
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out', '.vercel']);
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx']);
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);

let sharp = null;
try { sharp = (await import('sharp')).default; } catch {}

const R = {
  images: [], productNames: new Set(), prices: [], currencies: new Set(),
  categories: new Set(), materials: new Set(), colors: new Set(),
  sizes: new Set(), trust: {}, leadFields: new Set(), copySamples: [],
  signals: { metaPixel: false, ga4: false, whatsapp: false, cod: false,
             utm: false, reviews: false, freeShip: false, india: false },
  currencyGuess: null, priceBand: null, fileCount: 0,
};

// ---------- collect files ----------
async function walk(dir, out = []) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) await walk(p, out); }
    else out.push(p);
  }
  return out;
}

// ---------- image analysis ----------
async function analyzeImage(p) {
  const ext = extname(p).toLowerCase();
  if (!IMG_EXT.has(ext)) return;
  let size = 0, w = 0, h = 0;
  try { size = (await stat(p)).size; } catch {}
  if (sharp) { try { const m = await sharp(p).metadata(); w = m.width || 0; h = m.height || 0; } catch {} }
  const base = basename(p, ext);
  R.images.push({ file: base + ext, kb: Math.round(size / 1024), w, h, ext });
  // product name heuristic: repeatedly strip trailing -NN / -view tokens
  let stem = base.toLowerCase();
  const viewTok = /[-_](0?\d+|front|back|left|right|side|seated|detail|fabric|lifestyle|hover|main|thumb)$/i;
  while (viewTok.test(stem)) stem = stem.replace(viewTok, '');
  if (stem && stem.length > 1) R.productNames.add(stem);
}

// ---------- text mining ----------
const PRICE_RE = /(?:₹|Rs\.?\s?|INR\s?|\$)\s?(\d[\d,]{1,7})(?:\.\d{2})?/g;
const COLOR_WORDS = ['beige','ivory','blush','wine','espresso','taupe','black','white','navy','maroon','marble','sage','mint','pink','blue','purple','olive','mustard','rust','teal','grey','gray','cream','nude','coral','emerald','burgundy'];
const MATERIAL_WORDS = ['cotton','silk','linen','rayon','chiffon','georgette','crepe','satin','velvet','organza','muslin','viscose','modal','borosilicate','wool','denim'];
const CATEGORY_WORDS = ['coord set','co-ord','kurta','kurti','saree','sari','lehenga','dress','set','suit','dupatta','top','bottom','palazzo','sharara','gown','tunic','skirt','blouse'];
const SIZE_WORDS = ['xs','\\bs\\b','\\bm\\b','\\bl\\b','xl','xxl','xxxl','free size','one size'];

function mine(text, file) {
  const low = text.toLowerCase();
  let m;
  while ((m = PRICE_RE.exec(text))) {
    const val = parseInt(m[1].replace(/,/g, ''), 10);
    if (val >= 99 && val <= 200000) R.prices.push(val);
    if (m[0].includes('₹') || /rs|inr/i.test(m[0])) R.currencies.add('INR');
    if (m[0].includes('$')) R.currencies.add('USD');
  }
  // bare numeric price fields in product data, e.g.  price: 3499 , mrp:"4299"
  if (/product|schema|shop|catalog|item|data/i.test(file)) {
    let pm; const BARE = /(?:price|mrp|amount|cost|sellingprice|salePrice)\s*[:=]\s*["']?(\d{3,6})/gi;
    while ((pm = BARE.exec(text))) {
      const val = parseInt(pm[1], 10);
      if (val >= 199 && val <= 200000) R.prices.push(val);
    }
    if (/pricecurrency\s*[:=]\s*["']inr|currency\s*[:=]\s*["']inr/i.test(low)) R.currencies.add('INR');
  }
  for (const c of COLOR_WORDS) if (low.includes(c)) R.colors.add(c);
  for (const mt of MATERIAL_WORDS) if (low.includes(mt)) R.materials.add(mt);
  for (const cat of CATEGORY_WORDS) if (low.includes(cat)) R.categories.add(cat);
  for (const s of SIZE_WORDS) { try { if (new RegExp(s).test(low)) R.sizes.add(s.replace(/\\b/g,'').toUpperCase()); } catch {} }
  // signals
  if (/fbq\(|connect\.facebook/.test(low)) R.signals.metaPixel = true;
  if (/gtag\(|g-[a-z0-9]{6,}|googletagmanager/.test(low)) R.signals.ga4 = true;
  if (/whatsapp|wa\.me|api\.whatsapp/.test(low)) R.signals.whatsapp = true;
  if (/cash on delivery|\bcod\b/.test(low)) R.signals.cod = true;
  if (/utm_source|utm_campaign/.test(low)) R.signals.utm = true;
  if (/review|rating|aggregaterating|testimonial/.test(low)) R.signals.reviews = true;
  if (/free shipping|free delivery/.test(low)) R.signals.freeShip = true;
  if (/pincode|postalpincode|₹|\binr\b|india/.test(low)) R.signals.india = true;
  // lead fields — from the capture component / api
  if (/leads\/create|leadcapture/i.test(file)) {
    for (const f of ['name','email','phone','pincode','city','state','address','utm','device','referrer','geo','coupon','segment'])
      if (low.includes(f)) R.leadFields.add(f);
  }
  // grab a few descriptive copy lines (metadata/product descriptions)
  const descs = text.match(/(description|subtitle|tagline|story|about)\s*[:=]\s*["'`]([^"'`]{25,180})["'`]/gi);
  if (descs) for (const d of descs.slice(0, 3)) {
    const t = d.replace(/^(description|subtitle|tagline|story|about)\s*[:=]\s*["'`]/i, '').replace(/["'`]$/, '');
    if (R.copySamples.length < 12) R.copySamples.push(t.trim());
  }
}

// ---------- run scan ----------
console.log('🔎 Reading project (read-only)…');
const files = await walk(ROOT);
for (const p of files) {
  const ext = extname(p).toLowerCase();
  if (IMG_EXT.has(ext) && p.includes('product')) { await analyzeImage(p); continue; }
  if (!CODE_EXT.has(ext)) continue;
  if ((await stat(p)).size > 800 * 1024) continue; // skip huge files
  R.fileCount++;
  const rel = p.slice(ROOT.length + 1);
  if (/product|shop|schema|lead|layout|page|catalog|item|copy|content|data/i.test(rel)) {
    try { mine(await readFile(p, 'utf8'), rel); } catch {}
  }
}

// ---------- derive ----------
R.prices.sort((a, b) => a - b);
if (R.prices.length) {
  const min = R.prices[0], max = R.prices[R.prices.length - 1];
  const mid = R.prices[Math.floor(R.prices.length / 2)];
  R.priceBand = { min, median: mid, max, count: R.prices.length };
}
R.currencyGuess = R.currencies.has('INR') ? 'INR (₹)' : R.currencies.has('USD') ? 'USD ($)' : 'unknown';
const heavy = R.images.filter(i => i.ext === '.png' || i.ext === '.jpg' ? i.kb > 300 : false).length;

// ---------- ICP synthesis ----------
function band(median) {
  if (median == null) return 'unknown';
  if (median < 1500) return 'value / mass-premium';
  if (median < 4000) return 'accessible-premium';
  if (median < 9000) return 'premium';
  return 'luxury';
}
const catList = [...R.categories];
const isEthnic = catList.some(c => /coord|kurt|saree|lehenga|suit|dupatta|sharara/i.test(c));
const positioning = band(R.priceBand?.median);
const median = R.priceBand?.median ?? null;

const icp = {
  headline: `${positioning} ${isEthnic ? 'Indian ethnic/contemporary womenswear' : 'D2C apparel'} buyer`,
  demographics: {
    gender: 'Predominantly women (self + gifting)',
    ageCore: positioning === 'luxury' ? '28–45' : '22–38',
    geo: R.signals.india ? 'India — metro + tier-1/2 cities (pincode-served)' : 'primary market unclear',
    device: 'Mobile-first (majority of paid social traffic)',
    income: positioning === 'premium' || positioning === 'luxury'
      ? 'Upper-middle to affluent; discretionary fashion spend'
      : 'Middle to upper-middle; considered purchases',
  },
  psychographics: [
    'Values aesthetics, craftsmanship and a distinct visual identity over fast-fashion churn',
    'Shops occasion + everyday-elevated (festive, work, gifting)',
    'Responsive to editorial/lookbook storytelling, not hard discounting',
    'Trusts social proof — reviews, real-customer photos, founder story',
  ],
  buyingBehavior: {
    discovery: R.signals.metaPixel ? 'Instagram/Facebook ads + organic reels; influencer/UGC' : 'social + search',
    trigger: 'Festive/wedding season, restocks, new-drop scarcity, first-order discount',
    objection: 'Fit/size uncertainty, fabric quality online, delivery trust',
    incentive: `${R.signals.freeShip ? 'Free shipping, ' : ''}${R.signals.cod ? 'COD, ' : ''}first-order 10% welcome code, WhatsApp support`,
    aov: median ? `~₹${median.toLocaleString('en-IN')} median item; sets/bundles lift basket` : 'unknown',
  },
  dataYouAlreadyCapture: [...R.leadFields],
  bestChannels: [
    R.signals.metaPixel ? 'Meta (IG/FB) — Advantage+ shopping, broad + creative testing' : 'Meta (set up Pixel first)',
    'Instagram organic — reels, styling, before/after fit',
    R.signals.whatsapp ? 'WhatsApp — abandoned-cart + order updates (you capture phone+consent)' : 'WhatsApp flows (high ROI for India D2C)',
    R.signals.ga4 ? 'Google — retarget + brand search' : 'Google (add GA4 to unlock)',
  ],
  segmentsToBuild: [
    'First-time visitor (welcome code) — you already trigger this',
    'Real-intent (name/phone given, no purchase) → WhatsApp nudge',
    'Repeat buyer / high-AOV → early access to drops',
    'Festive-season lookalike off purchasers (needs Pixel purchase events)',
  ],
};

// ---------- write JSON ----------
await writeFile('product-intel.json', JSON.stringify({ ...R,
  productNames: [...R.productNames], currencies: [...R.currencies],
  categories: [...R.categories], materials: [...R.materials],
  colors: [...R.colors], sizes: [...R.sizes], leadFields: [...R.leadFields],
  icp }, null, 2));

// ---------- write Markdown ----------
const md = `# Rose & Co — Product Intelligence & Ideal Customer Profile
_Generated ${new Date().toLocaleString()} · read-only scan of ${R.fileCount} files_

## 1. What you sell (detected)
- **Products found:** ${R.productNames.size} (${[...R.productNames].slice(0,12).join(', ') || '—'})
- **Categories:** ${[...R.categories].join(', ') || 'not detected'}
- **Materials:** ${[...R.materials].join(', ') || 'not detected'}
- **Colors/palette:** ${[...R.colors].join(', ') || 'not detected'}
- **Sizes:** ${[...R.sizes].join(', ') || 'not detected'}

## 2. Pricing
- **Currency:** ${R.currencyGuess}
- **Price band:** ${R.priceBand ? `₹${R.priceBand.min.toLocaleString('en-IN')} – ₹${R.priceBand.max.toLocaleString('en-IN')} (median ~₹${R.priceBand.median.toLocaleString('en-IN')}, ${R.priceBand.count} price points)` : 'not detected'}
- **Positioning tier:** **${positioning}**

## 3. Images
- **Product images:** ${R.images.length} (${R.images.filter(i=>i.ext==='.webp').length} webp, ${R.images.filter(i=>i.ext==='.png').length} png, ${R.images.filter(i=>i.ext==='.jpg'||i.ext==='.jpeg').length} jpg)
- **Still-heavy (>300KB) rasters:** ${heavy}
${sharp ? '' : '- _(install sharp for pixel dimensions)_\n'}

## 4. Marketing & data signals
| Signal | Present |
|---|---|
| Meta Pixel | ${R.signals.metaPixel ? '✅' : '❌'} |
| GA4 / GTM | ${R.signals.ga4 ? '✅' : '❌'} |
| WhatsApp | ${R.signals.whatsapp ? '✅' : '❌'} |
| COD | ${R.signals.cod ? '✅' : '❌'} |
| UTM capture | ${R.signals.utm ? '✅' : '❌'} |
| Reviews | ${R.signals.reviews ? '✅' : '❌'} |
| Free shipping | ${R.signals.freeShip ? '✅' : '❌'} |
| India market | ${R.signals.india ? '✅' : '❌'} |

**Lead fields you capture:** ${[...R.leadFields].join(', ') || 'none detected'}

${R.copySamples.length ? `## 5. Voice samples (from your copy)\n${R.copySamples.map(c=>`- "${c}"`).join('\n')}\n` : ''}

---

# 🎯 Ideal Customer Profile (first draft, from your data)

**${icp.headline}**

## Demographics
- **Who:** ${icp.demographics.gender}
- **Age:** ${icp.demographics.ageCore}
- **Where:** ${icp.demographics.geo}
- **Device:** ${icp.demographics.device}
- **Income:** ${icp.demographics.income}

## Psychographics
${icp.psychographics.map(p=>`- ${p}`).join('\n')}

## Buying behavior
- **Discovers you via:** ${icp.buyingBehavior.discovery}
- **Buys when:** ${icp.buyingBehavior.trigger}
- **Hesitates because:** ${icp.buyingBehavior.objection}
- **Converts with:** ${icp.buyingBehavior.incentive}
- **AOV signal:** ${icp.buyingBehavior.aov}

## Best channels for this ICP
${icp.bestChannels.map(c=>`- ${c}`).join('\n')}

## Segments worth building
${icp.segmentsToBuild.map(s=>`- ${s}`).join('\n')}

---
_This is a data-derived starting point. Refine with your real order data (repeat rate, top SKUs, return reasons) for a production ICP._
`;
await writeFile('product-intel.md', md);

console.log(`\n✅ Done. Scanned ${R.fileCount} files, ${R.images.length} product images.`);
console.log(`   Products: ${R.productNames.size} · prices: ${R.prices.length} · tier: ${positioning}`);
console.log(`   → product-intel.md   (read this)`);
console.log(`   → product-intel.json (raw data)`);
