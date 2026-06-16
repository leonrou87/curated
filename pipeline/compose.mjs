// compose.mjs — gender- + trend- + budget-aware greedy composer. Assembles many coherent looks
// (score >= 72) across men's and women's, themed to the hottest aesthetics, with jewelry/accessories.
// Output: data/seed-real.json ({products, bundles, _meta}).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { scoreComposition, THRESHOLD } = require("../scripts/scorer.reference.js");

const catalog = JSON.parse(readFileSync(path.join(__dirname, "..", "data", "catalog-real.json"), "utf8")).products;
const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));
const inGender = (p, g) => p.gender === g || p.gender === "unisex";
const pool = (slot, g) => catalog.filter((p) => p.slotRoles[0] === slot && p.inStock && inGender(p, g) && p.imageUrls?.[0]?.startsWith("http"));

// Hot aesthetics → muse-named briefs. (Aesthetic names, not real people — tasteful + on-trend.)
const BRIEFS = [
  // —— WOMEN ——
  { key: "quiet-luxury", g: "women", title: "The Quiet Luxury Edit", occasion: "wedding-guest", trend: "quiet-luxury", season: "summer", form: 4, budget: "premium", arch: ["dress", "separates"] },
  { key: "old-money-w", g: "women", title: "Old Money Hour", occasion: "evening", trend: "old-money", season: "all", form: 4, budget: "premium", arch: ["dress", "separates"] },
  { key: "clean-girl", g: "women", title: "Clean Girl Uniform", occasion: "everyday", trend: "clean-girl", season: "all", form: 3, budget: "mid", arch: ["separates", "dress"] },
  { key: "coastal-gma", g: "women", title: "Coastal Grandmother", occasion: "vacation", trend: "coastal", season: "summer", form: 2, budget: "mid", arch: ["separates", "dress"] },
  { key: "office-siren", g: "women", title: "Office Siren", occasion: "work", trend: "office-siren", season: "all", form: 4, budget: "mid", arch: ["separates", "dress"] },
  { key: "tomato-girl", g: "women", title: "Tomato Girl Summer", occasion: "brunch", trend: "tomato-girl", season: "summer", form: 2, budget: "budget", arch: ["dress", "separates"] },
  { key: "mob-wife", g: "women", title: "Mob Wife Energy", occasion: "evening", trend: "mob-wife", season: "fall", form: 4, budget: "premium", arch: ["dress", "separates"] },
  { key: "coquette", g: "women", title: "Coquette", occasion: "date-night", trend: "coquette", season: "all", form: 3, budget: "mid", arch: ["dress", "separates"] },
  { key: "scandi-w", g: "women", title: "Scandi Minimalist", occasion: "everyday", trend: "minimalist", season: "all", form: 3, budget: "mid", arch: ["separates", "dress"] },
  { key: "all-black-w", g: "women", title: "All Black Everything", occasion: "evening", trend: "all-black", season: "all", form: 4, budget: "mid", arch: ["dress", "separates"] },
  { key: "weekend-budget-w", g: "women", title: "Weekend Under $300", occasion: "weekend", trend: "off-duty", season: "all", form: 2, budget: "budget", arch: ["separates", "dress"] },
  { key: "boho-w", g: "women", title: "Festival Boho", occasion: "festival", trend: "boho", season: "summer", form: 2, budget: "mid", arch: ["dress", "separates"] },
  // —— MEN ——
  { key: "old-money-m", g: "men", title: "Old Money", occasion: "event", trend: "old-money", season: "all", form: 4, budget: "premium", arch: ["separates"] },
  { key: "clean-minimal-m", g: "men", title: "Clean Minimalist", occasion: "everyday", trend: "minimalist", season: "all", form: 3, budget: "mid", arch: ["separates"] },
  { key: "smart-office-m", g: "men", title: "Smart Office", occasion: "work", trend: "modern-classic", season: "all", form: 4, budget: "mid", arch: ["separates"] },
  { key: "blokecore", g: "men", title: "Blokecore Weekend", occasion: "weekend", trend: "blokecore", season: "all", form: 2, budget: "budget", arch: ["separates"] },
  { key: "gorpcore", g: "men", title: "Gorpcore", occasion: "outdoor", trend: "gorpcore", season: "fall", form: 2, budget: "mid", arch: ["separates"] },
  { key: "coastal-m", g: "men", title: "Coastal Resort", occasion: "vacation", trend: "coastal", season: "summer", form: 2, budget: "mid", arch: ["separates"] },
  { key: "date-sharp-m", g: "men", title: "Date Night, Sharp", occasion: "evening", trend: "minimalist", season: "all", form: 4, budget: "mid", arch: ["separates"] },
  { key: "eclectic-grandpa", g: "men", title: "Eclectic Grandpa", occasion: "weekend", trend: "eclectic-grandpa", season: "fall", form: 3, budget: "mid", arch: ["separates"] },
];

const seasonOk = (p, s) => !s || s === "all" || p.styling.seasons.includes(s) || p.styling.seasons.includes("all");
const budgetOk = (p, b) => !b || b === "mid" || (b === "budget" ? p.styling.priceTier !== "premium" : p.styling.priceTier !== "budget");
const scorable = (p, slotId) => ({ id: p.id, brand: p.brand, inStock: p.inStock, slotId, styling: p.styling });

const SOFT_CAP = 4; // a supporting piece (shoe/bag/jewelry) may appear in up to N looks
const softCount = {};
const softOk = (p) => (softCount[p.id] || 0) < SOFT_CAP;
function bestFor(items, slot, brief) {
  let cands = pool(slot, brief.g).filter((p) => seasonOk(p, brief.season) && budgetOk(p, brief.budget) && softOk(p));
  if (cands.length < 3) cands = pool(slot, brief.g).filter((p) => seasonOk(p, brief.season) && softOk(p));
  if (cands.length < 3) cands = pool(slot, brief.g).filter((p) => softOk(p));
  let best = null, bestScore = -1;
  for (const c of cands) {
    const trial = [...items.map((i) => scorable(byId[i.productId], i.slotId)), scorable(c, slot)];
    const r = scoreComposition(trial, { targetFormality: brief.form, season: brief.season, highLow: brief.budget === "budget" }, {});
    if (r.score > bestScore) { bestScore = r.score; best = c; }
  }
  return best;
}

const TREND_NOTE = {
  "quiet-luxury": "Refined without trying — tonal neutrals, elevated fabrics, and nothing loud.",
  "old-money": "Heritage polish: muted palette, considered tailoring, quiet confidence over logos.",
  "clean-girl": "Slept-in but pulled-together — minimal pieces, glowy neutrals, zero clutter.",
  coastal: "Linen-soft and breezy, built for golden hour by the water.",
  "office-siren": "Sharp, deliberate tailoring with a magnetic edge — power dressing, modernized.",
  "tomato-girl": "Sun-warmed Mediterranean ease — relaxed shapes in ripe, summery tones.",
  "mob-wife": "Unapologetic glamour — rich darks, bold volume, statement attitude.",
  coquette: "Soft and romantic — delicate details, a little flirtation, nothing fussy.",
  minimalist: "Quiet, exact, and intentional — a few perfect pieces doing all the work.",
  "all-black": "All black, done right — the whole interest is in texture and proportion.",
  "off-duty": "Easy off-duty pieces that look considered without trying — and stay under budget.",
  boho: "Free-spirited layers and earthy tones for the festival and the after.",
  blokecore: "Terrace-casual — sport-adjacent staples worn with off-hand confidence.",
  gorpcore: "Trail-ready function styled for the city — technical, tonal, unbothered.",
  "modern-classic": "Timeless office tailoring with a modern, slightly relaxed cut.",
  "eclectic-grandpa": "Cozy, lived-in layers with a wink of pattern — thrifted-feeling, never costume.",
};
const cap = (s) => s.replace(/-/g, " ");
function noteFor(items, res, brief) {
  const hero = byId[items.find((i) => i.slotId === "anchor")?.productId] || byId[items[0].productId];
  const support = items.filter((i) => i.productId !== hero.id).map((i) => `${byId[i.productId].styling.color.family} ${byId[i.productId].category}`).slice(0, 3).join(", ");
  const flavor = TREND_NOTE[brief.trend] || "A considered, coherent take on the brief.";
  return `${flavor} The ${hero.styling.color.family} ${hero.category} leads a ${res.scheme.replace(/-/g, " ")} palette; ${support} keep it cohesive for ${cap(brief.occasion)}.`;
}

const used = new Set();
const bundles = [];
const usedProductIds = new Set();

function makeLook(brief, archetype, idx) {
  const items = [];
  // core pieces are unique across looks; relax budget→season if the pool runs thin
  const core = (slot, extra) => {
    const base = pool(slot, brief.g).filter((p) => extra(p) && !used.has(p.id));
    let c = base.filter((p) => seasonOk(p, brief.season) && budgetOk(p, brief.budget));
    if (c.length <= idx) c = base.filter((p) => seasonOk(p, brief.season));
    if (c.length <= idx) c = base;
    return c[idx];
  };
  if (archetype === "dress") {
    const a = core("anchor", (p) => Math.abs(p.styling.formality - brief.form) <= 1);
    if (!a) return null;
    used.add(a.id); items.push({ productId: a.id, slotId: "anchor", role: "dress" });
  } else {
    const top = core("top", (p) => p.styling.weight !== "statement");
    const bottom = core("bottom", () => true);
    if (!top || !bottom) return null;
    used.add(top.id); used.add(bottom.id);
    items.push({ productId: top.id, slotId: "top", role: "top" }, { productId: bottom.id, slotId: "bottom", role: "bottom" });
  }
  const fillSlots = brief.g === "men" ? ["shoes", "accessories"] : ["shoes", "bag", "accessories"];
  for (const slot of fillSlots) {
    const pick = bestFor(items, slot, brief);
    if (pick) { softCount[pick.id] = (softCount[pick.id] || 0) + 1; items.push({ productId: pick.id, slotId: slot, role: slot }); }
  }
  if (items.length < 3) { items.forEach((i) => used.delete(i.productId)); return null; }
  const res = scoreComposition(items.map((i) => scorable(byId[i.productId], i.slotId)), { targetFormality: brief.form, season: brief.season, highLow: brief.budget === "budget" }, {});
  if (!res.passed || res.score < THRESHOLD) { items.forEach((i) => used.delete(i.productId)); return null; }
  items.forEach((i) => usedProductIds.add(i.productId));
  const hero = byId[items.find((i) => i.slotId === "anchor")?.productId] || byId[items[0].productId];
  const lo = items.reduce((s, i) => s + byId[i.productId].offers[0].priceSnapshot, 0);
  return {
    id: `rb_${bundles.length + 1}`, slug: `${brief.key}-${archetype}-${idx + 1}`, type: "look",
    title: brief.title,
    brief: { occasion: brief.occasion, vibe: brief.trend, gender: brief.g, budgetTier: brief.budget || hero.styling.priceTier, season: brief.season, targetFormality: brief.form },
    heroImage: hero.imageUrls[0], flatLayImage: null, curatorNote: noteFor(items, res, brief),
    estPriceLow: Math.round(lo * 0.85), estPriceHigh: Math.round(lo * 1.15),
    coherence: { score: res.score, passed: res.passed, hardViolations: res.hardViolations, ruleScores: res.ruleScores, scheme: res.scheme, heroItemId: hero.id },
    state: "published", generatedBy: "greedy", featured: false,
    items: items.map((i) => ({ ...i, note: null, variant: "core", swapAlternates: [] })),
  };
}

for (const brief of BRIEFS) {
  let made = 0;
  const want = 6;
  for (let idx = 0; idx < 22 && made < want; idx++) {
    const archetype = brief.arch[idx % brief.arch.length];
    const look = makeLook(brief, archetype, idx);
    if (look) { bundles.push(look); made++; }
  }
}
// feature one women + one men
const fw = bundles.find((b) => b.brief.gender === "women"); if (fw) fw.featured = true;
const fm = bundles.find((b) => b.brief.gender === "men"); if (fm) fm.featured = true;

const out = {
  products: catalog, bundles,
  _meta: { source: "real-shopify-ingest + greedy-composer", generated: "build-time", counts: { products: catalog.length, bundles: bundles.length, byGender: bundles.reduce((a, b) => ((a[b.brief.gender] = (a[b.brief.gender] || 0) + 1), a), {}) } },
};
writeFileSync(path.join(__dirname, "..", "data", "seed-real.json"), JSON.stringify(out, null, 2));
const byG = bundles.reduce((a, b) => ((a[b.brief.gender] = (a[b.brief.gender] || 0) + 1), a), {});
console.log(`Composed ${bundles.length} looks (women ${byG.women || 0}, men ${byG.men || 0}) from ${usedProductIds.size} products.`);
const byTrend = {};
bundles.forEach((b) => (byTrend[b.title] = (byTrend[b.title] || 0) + 1));
Object.entries(byTrend).forEach(([t, n]) => console.log(`  ${String(n).padStart(2)}  ${t}`));
