#!/usr/bin/env node
/**
 * icp-engine.mjs — Ideal Customer Profile engine for Rosé & Co.
 *
 * Runs in TWO phases automatically:
 *   PHASE A — HYPOTHESIS (works with zero traffic):
 *     Reads your real products from Prisma and derives an attribute-based ICP
 *     per product + site-wide (price tier → income, occasion → life stage,
 *     colour → aesthetic, etc.). This is a research hypothesis, not evidence.
 *
 *   PHASE B — EVIDENCE (auto-activates once you have real orders):
 *     Cross-references NON-TEST leads vs orders to compute real conversion
 *     rate by segment (device, city, UTM source, returning) and upgrades the
 *     ICP. Until you have enough real data, it clearly says "insufficient".
 *
 * IMPORTANT: your leads/orders today are TEST runs. The script EXCLUDES test
 * data (test emails/phones, TEST coupons, or before --since date) so it never
 * builds an ICP on noise.
 *
 * RUN (from project root, where @prisma/client is generated):
 *   node icp-engine.mjs                         # full run, writes icp-report.md + .json
 *   node icp-engine.mjs --since 2026-03-01      # treat leads/orders before this as test
 *   node icp-engine.mjs --min 30                # min real orders per segment to trust evidence
 *
 * Read-only: it never writes to your database.
 */
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const flag = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const SINCE = flag('--since', null) ? new Date(flag('--since', null)) : null;
const MIN_EVIDENCE = parseInt(flag('--min', '30'), 10); // min real orders before we trust a segment

// ---------------------------------------------------------------- attribute → ICP maps
const PRICE_TIER = (p) =>
  p == null ? 'unknown' :
  p < 1500 ? 'value' :
  p < 4000 ? 'accessible-premium' :
  p < 9000 ? 'premium' : 'luxury';

const TIER_INCOME = {
  value: 'Middle income; price-led, deal-driven',
  'accessible-premium': 'Upper-middle; considered discretionary spend (₹3–5k on an outfit is fine)',
  premium: 'Affluent; buys on design + brand, not price',
  luxury: 'High income; exclusivity-led',
  unknown: 'unclear',
};

const TIER_AGE = { value: '20–32', 'accessible-premium': '24–34', premium: '28–40', luxury: '30–45', unknown: '24–36' };

// occasion keywords → life-stage + intent
const OCCASION_MAP = [
  { k: /roka|engagement|sagai/i, seg: 'Bride-adjacent / getting engaged', intent: 'Her own function — high emotional stakes, will pay for distinct' },
  { k: /sangeet|cocktail|reception/i, seg: 'Wedding-guest circuit', intent: 'Attending many functions; dreads outfit repetition' },
  { k: /diwali|festive|karwa|puja|navratri/i, seg: 'Festive shopper', intent: 'Seasonal spike buyer; gifting + self' },
  { k: /party|evening|night/i, seg: 'Party / evening-out', intent: 'Metro social calendar; Instagram-visible occasions' },
  { k: /work|office|daily|everyday/i, seg: 'Everyday-elevated', intent: 'Repeat-wear utility; lower urgency, higher LTV' },
];

// colour → aesthetic segment (for creative + audience angle)
const COLOR_AESTHETIC = [
  { k: /wine|maroon|burgundy|emerald|navy|espresso|black/i, a: 'Deep/jewel tones — evening, photographs rich indoors' },
  { k: /beige|ivory|nude|cream|blush|sage|mint|taupe/i, a: 'Soft/neutral tones — daytime, minimalist aesthetic' },
  { k: /rust|mustard|olive|teal|marble/i, a: 'Earthy/statement tones — fashion-forward buyer' },
];

// ---------------------------------------------------------------- pure: derive one product's ICP hypothesis
export function deriveProductIcp(p) {
  const tier = PRICE_TIER(p.price);
  const text = `${p.name} ${p.description || ''} ${(p.occasion || []).join(' ')} ${p.color || ''}`;
  const occ = OCCASION_MAP.filter((o) => o.k.test(text));
  const aesthetic = (COLOR_AESTHETIC.find((c) => c.k.test(text)) || {}).a
    || 'Palette unclassified — infer from imagery';
  const discount = p.compareAt && p.price ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;

  const primaryOcc = occ[0] || { seg: 'General occasion-wear', intent: 'Indian function dressing' };

  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    tier,
    hypothesis: {
      whoSheIs: `${TIER_AGE[tier]} woman, ${primaryOcc.seg.toLowerCase()}`,
      income: TIER_INCOME[tier],
      lifeStage: primaryOcc.seg,
      buyingIntent: primaryOcc.intent,
      aesthetic,
      allOccasions: occ.map((o) => o.seg),
      priceSignal: discount > 0
        ? `Anchored at ₹${p.compareAt?.toLocaleString('en-IN')}, sold at ₹${p.price?.toLocaleString('en-IN')} (${discount}% off) — value-framing active`
        : `Full-price ₹${p.price?.toLocaleString('en-IN')} — no discount anchor`,
    },
    metaTargetingSeed: {
      // starting-point interests/behaviours to TEST (not gospel — broad + creative does the real work)
      coreInterests: dedupe([
        'Indian ethnic wear', 'Co-ord sets', 'Wedding guest outfits',
        ...(occ.some(o => /bride/i.test(o.seg)) ? ['Bridal', 'Engagement'] : []),
        ...(occ.some(o => /festive/i.test(o.seg)) ? ['Diwali shopping', 'Festive fashion'] : []),
        ...(tier === 'premium' || tier === 'luxury' ? ['Luxury fashion', 'Designer wear'] : ['Online shopping', 'Fashion deals']),
      ]),
      ageRange: TIER_AGE[tier],
      placements: 'Instagram Reels + Stories, Facebook Feed (mobile-first)',
      creativeAngle: pickAngle(primaryOcc, aesthetic),
    },
  };
}

function pickAngle(occ, aesthetic) {
  if (/bride|engagement/i.test(occ.seg)) return 'Anti-uniform: "the only one in the room in this print" — your own function';
  if (/guest/i.test(occ.seg)) return 'Outfit-repetition fear: never wear the same thing to two functions';
  if (/festive/i.test(occ.seg)) return 'Festive scarcity: limited drop before the season';
  if (/everyday/i.test(occ.seg)) return 'Everyday-luxury: satin that works beyond one event';
  return 'Small-batch craft: hand-painted, 200 pieces, then gone';
}

const dedupe = (a) => [...new Set(a)];

// ---------------------------------------------------------------- pure: site-wide from products
export function deriveSiteIcp(products) {
  const tiers = {};
  const occ = {};
  let priceSum = 0, priceN = 0;
  for (const p of products) {
    const t = PRICE_TIER(p.price); tiers[t] = (tiers[t] || 0) + 1;
    if (p.price) { priceSum += p.price; priceN++; }
    const text = `${p.name} ${p.description || ''} ${(p.occasion || []).join(' ')}`;
    for (const o of OCCASION_MAP) if (o.k.test(text)) occ[o.seg] = (occ[o.seg] || 0) + 1;
  }
  const topTier = Object.entries(tiers).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  const topOcc = Object.entries(occ).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const median = priceN ? Math.round(priceSum / priceN) : null;
  return {
    catalogSize: products.length,
    dominantTier: topTier,
    medianPrice: median,
    coreBuyer: `${TIER_AGE[topTier]} woman, ${(topOcc[0] || 'occasion-wear').toLowerCase()}, ${TIER_INCOME[topTier]}`,
    occasionMix: topOcc,
    tierBreakdown: tiers,
  };
}

// ---------------------------------------------------------------- pure: test-data filter
export function isTestLead(l) {
  const email = (l.email || '').toLowerCase();
  const phone = (l.phone || '').replace(/\D/g, '');
  if (/test|example|mailinator|\+test/.test(email)) return true;
  if (/^(0{6,}|1{6,}|1234567890|9{6,})$/.test(phone)) return true;
  if (/test|dummy|sample/i.test(l.couponCode || l.segment || '')) return true;
  if (SINCE && l.createdAt && new Date(l.createdAt) < SINCE) return true;
  return false;
}

// ---------------------------------------------------------------- pure: evidence-mode conversion by segment
export function conversionBySegment(leads, orders, minEvidence) {
  const realLeads = leads.filter((l) => !isTestLead(l));
  const orderSessions = new Set(orders.map((o) => o.sessionId).filter(Boolean));
  const realOrders = orders.filter((o) => !isTestLead(o));

  if (realOrders.length < minEvidence) {
    return { ready: false, realLeads: realLeads.length, realOrders: realOrders.length, minEvidence };
  }
  const dims = ['deviceType', 'city', 'utmSource', 'isReturning'];
  const out = {};
  for (const dim of dims) {
    const bucket = {};
    for (const l of realLeads) {
      const key = String(l[dim] ?? 'unknown');
      bucket[key] = bucket[key] || { leads: 0, orders: 0 };
      bucket[key].leads++;
      if (orderSessions.has(l.sessionId)) bucket[key].orders++;
    }
    out[dim] = Object.entries(bucket)
      .map(([k, v]) => ({ value: k, leads: v.leads, orders: v.orders, cvr: v.leads ? +(100 * v.orders / v.leads).toFixed(1) : 0 }))
      .filter((r) => r.leads >= 5)
      .sort((a, b) => b.cvr - a.cvr);
  }
  return { ready: true, realLeads: realLeads.length, realOrders: realOrders.length, segments: out };
}

// ---------------------------------------------------------------- main (Prisma runner)
async function main() {
  let PrismaClient;
  try { ({ PrismaClient } = await import('@prisma/client')); }
  catch { console.error('✖ Run from project root (needs @prisma/client).'); process.exit(1); }
  const prisma = new PrismaClient();

  // products (required)
  const products = (await prisma.product.findMany({ where: { active: true } }).catch(() => []))
    .map((p) => ({ ...p, occasion: safeArr(p.occasion), color: p.color, images: undefined }));

  // leads + orders (optional; may be test-only or absent)
  const leads = await tryFind(prisma, ['lead', 'leadCapture', 'leads']);
  const orders = await tryFind(prisma, ['order', 'orders']);

  await prisma.$disconnect();

  const site = deriveSiteIcp(products);
  const perProduct = products.map(deriveProductIcp);
  const evidence = conversionBySegment(leads, orders, MIN_EVIDENCE);

  const out = { generatedAt: new Date().toISOString(), phase: evidence.ready ? 'B (evidence)' : 'A (hypothesis)',
    site, perProduct, evidence };
  await writeFile('icp-report.json', JSON.stringify(out, null, 2));
  await writeFile('icp-report.md', render(out));
  console.log(`\n✅ ICP report written.`);
  console.log(`   Phase: ${out.phase}  ·  products: ${products.length}  ·  real leads: ${evidence.realLeads ?? 0}  ·  real orders: ${evidence.realOrders ?? 0}`);
  console.log(`   → icp-report.md  /  icp-report.json\n`);
}

const safeArr = (v) => { if (Array.isArray(v)) return v; if (typeof v === 'string') { try { const j = JSON.parse(v); return Array.isArray(j) ? j : [v]; } catch { return v ? [v] : []; } } return []; };
async function tryFind(prisma, names) {
  for (const n of names) if (prisma[n]?.findMany) { try { return await prisma[n].findMany(); } catch {} }
  return [];
}

function render(o) {
  const e = o.evidence;
  return `# Rosé & Co — Ideal Customer Profile Engine
_Generated ${new Date(o.generatedAt).toLocaleString()} · **Phase ${o.phase}**_

${o.phase.startsWith('A')
  ? `> ⚠️ **Hypothesis mode.** You have ${e.realOrders || 0} real (non-test) orders — below the ${e.minEvidence} needed to trust behavioural evidence. The profiles below are derived from **product attributes**, not real conversions. They are your *starting hypotheses to test with ad spend*, not proven facts. Once ~${e.minEvidence}+ real orders land, re-run and this upgrades to evidence mode automatically.`
  : `> ✅ **Evidence mode.** Based on ${e.realOrders} real orders / ${e.realLeads} real leads. Segments below are ranked by ACTUAL conversion rate.`}

## Site-wide ICP (hypothesis)
- **Core buyer:** ${o.site.coreBuyer}
- **Dominant tier:** ${o.site.dominantTier} · **median price:** ${o.site.medianPrice ? '₹' + o.site.medianPrice.toLocaleString('en-IN') : 'n/a'}
- **Occasion mix:** ${o.site.occasionMix.join(', ') || 'unclassified'}
- **Catalog:** ${o.site.catalogSize} active products

## Per-product ICP (highest-intent buyer for each)
${o.perProduct.map(p => `### ${p.name}  ·  ₹${(p.price||0).toLocaleString('en-IN')} (${p.tier})
- **Most likely buyer:** ${p.hypothesis.whoSheIs}
- **Life stage / intent:** ${p.hypothesis.lifeStage} — ${p.hypothesis.buyingIntent}
- **Income signal:** ${p.hypothesis.income}
- **Aesthetic:** ${p.hypothesis.aesthetic}
- **Price framing:** ${p.hypothesis.priceSignal}
- **Meta seed → age:** ${p.metaTargetingSeed.ageRange} · **interests:** ${p.metaTargetingSeed.coreInterests.join(', ')}
- **Creative angle:** ${p.metaTargetingSeed.creativeAngle}`).join('\n\n')}

## Behavioural evidence (auto-fills once you have traffic)
${e.ready
  ? Object.entries(e.segments).map(([dim, rows]) => `### By ${dim}\n| ${dim} | leads | orders | CVR |\n|---|---|---|---|\n${rows.map(r=>`| ${r.value} | ${r.leads} | ${r.orders} | ${r.cvr}% |`).join('\n')}`).join('\n\n')
  : `Not enough real orders yet (${e.realOrders || 0}/${e.minEvidence}). Your current leads/orders are test runs and were excluded. **Launch a small ad test, collect real conversions, then re-run** — this section will rank your true highest-converting segments (device, city, UTM source, new vs returning).`}

---
### How to use this now (no real data yet)
1. Treat each product's profile as a **hypothesis to test**, not truth.
2. Launch broad (Advantage+) with the seed interests + creative angle per product.
3. Let the tracking you built collect real conversions.
4. Re-run \`node icp-engine.mjs --since <launch-date>\` → evidence mode reveals who *actually* buys, per segment. That's your real ICP.
`;
}

// only run main if invoked directly (not when imported for tests).
// Use pathToFileURL so this works on Windows (backslashes / C:\ drive) too.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((e) => { console.error('\n✖ ICP engine error:', e?.message || e); process.exit(1); });
}
