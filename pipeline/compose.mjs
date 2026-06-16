// compose.mjs — greedy coherence composer. Takes the real product pool (catalog-real.json) and
// the reference scorer, and assembles coherent looks (score >= 72). Output: data/seed-real.json
// ({products, bundles, _meta}) which the app serves. This is the "one brain" generating real looks.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { scoreComposition, THRESHOLD } = require("../scripts/scorer.reference.js");

const catalog = JSON.parse(readFileSync(path.join(__dirname, "..", "data", "catalog-real.json"), "utf8")).products;
const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));
const pool = (slot) => catalog.filter((p) => p.slotRoles[0] === slot);

// briefs we want looks for (women — most ingested inventory is womenswear)
const BRIEFS = [
  { key: "summer-linen-brunch", occasion: "brunch", vibe: "relaxed-elevated", season: "summer", targetFormality: 3, gender: "women", title: "Summer Brunch" },
  { key: "garden-event-guest", occasion: "wedding-guest", vibe: "quiet-luxury", season: "summer", targetFormality: 4, gender: "women", title: "Garden Event Guest" },
  { key: "minimalist-date-night", occasion: "date-night", vibe: "minimalist", season: "all", targetFormality: 4, gender: "women", title: "Minimalist Date Night" },
  { key: "smart-workday", occasion: "work", vibe: "modern-classic", season: "all", targetFormality: 4, gender: "women", title: "Smart Workday" },
  { key: "weekend-easy", occasion: "weekend", vibe: "off-duty", season: "all", targetFormality: 2, gender: "women", title: "Weekend Easy" },
  { key: "autumn-tonal-layers", occasion: "everyday", vibe: "tonal", season: "fall", targetFormality: 3, gender: "women", title: "Autumn Tonal Layers" },
  { key: "city-evening-black", occasion: "evening", vibe: "all-black", season: "all", targetFormality: 4, gender: "women", title: "City Evening, All Black" },
  { key: "vacation-neutrals", occasion: "vacation", vibe: "coastal", season: "summer", targetFormality: 2, gender: "women", title: "Vacation Neutrals" },
];

const seasonOk = (p, season) => !season || season === "all" || p.styling.seasons.includes(season) || p.styling.seasons.includes("all");
const scorable = (p, slotId) => ({ id: p.id, brand: p.brand, inStock: p.inStock, slotId, styling: p.styling });

// pick the candidate that maximizes the running score for `slot`
function bestFor(items, slot, brief, used, season) {
  const cands = pool(slot).filter((p) => p.inStock && seasonOk(p, season) && !used.has(p.id));
  let best = null, bestScore = -1;
  for (const c of cands) {
    const trial = [...items.map((i) => scorable(byId[i.productId], i.slotId)), scorable(c, slot)];
    const r = scoreComposition(trial, brief, {});
    if (r.score > bestScore) { bestScore = r.score; best = c; }
  }
  return best;
}

function colorWord(p) { return p.styling.color.family; }
function noteFor(items, res, brief) {
  const hero = byId[items.find((i) => i.slotId === "anchor")?.productId] || byId[items[0].productId];
  const others = items.filter((i) => i.productId !== hero.id).map((i) => byId[i.productId]);
  const temp = hero.styling.color.undertone === "warm" ? "warm" : hero.styling.color.undertone === "cool" ? "cool" : "neutral";
  const formalityWord = brief.targetFormality >= 4 ? "polished" : brief.targetFormality >= 3 ? "smart-casual" : "easy, off-duty";
  const scheme = res.scheme.replace(/-/g, " ");
  const supportNames = others.map((p) => `${colorWord(p)} ${p.category}`).join(" and ");
  return `The ${colorWord(hero)} ${hero.category} leads a ${scheme} palette kept tonal throughout — ${supportNames} stay in the same ${temp} register. It lands at a ${formalityWord} register for ${brief.occasion.replace(/-/g, " ")}.`;
}

const used = new Set();
const bundles = [];
const usedProductIds = new Set();

function makeLook(brief, archetype, idx) {
  let items = [];
  if (archetype === "dress") {
    const anchor = pool("anchor").filter((p) => p.inStock && seasonOk(p, brief.season) && Math.abs(p.styling.formality - brief.targetFormality) <= 1 && !used.has(p.id))[idx];
    if (!anchor) return null;
    used.add(anchor.id);
    items.push({ productId: anchor.id, slotId: "anchor", role: "dress" });
  } else {
    const top = pool("top").filter((p) => p.inStock && seasonOk(p, brief.season) && p.styling.weight !== "statement" && !used.has(p.id))[idx];
    const bottom = pool("bottom").filter((p) => p.inStock && seasonOk(p, brief.season) && !used.has(p.id))[idx];
    if (!top || !bottom) return null;
    used.add(top.id); used.add(bottom.id);
    items.push({ productId: top.id, slotId: "top", role: "top" });
    items.push({ productId: bottom.id, slotId: "bottom", role: "bottom" });
  }
  for (const slot of ["shoes", "bag"]) {
    const pick = bestFor(items, slot, brief, used, brief.season);
    if (pick) { used.add(pick.id); items.push({ productId: pick.id, slotId: slot, role: slot }); }
  }
  if (items.length < 3) return null;
  const res = scoreComposition(items.map((i) => scorable(byId[i.productId], i.slotId)), brief, {});
  if (!res.passed || res.score < THRESHOLD) {
    items.forEach((i) => used.delete(i.productId)); // release for another attempt
    return null;
  }
  items.forEach((i) => usedProductIds.add(i.productId));
  const hero = byId[items.find((i) => i.slotId === "anchor")?.productId] || byId[items[0].productId];
  const prices = items.map((i) => byId[i.productId].offers[0].priceSnapshot);
  const lo = prices.reduce((a, b) => a + b, 0);
  const slug = `${brief.key}-${archetype}-${idx + 1}`;
  return {
    id: `rb_${bundles.length + 1}`,
    slug,
    type: "look",
    title: `${brief.title}`,
    brief: { occasion: brief.occasion, vibe: brief.vibe, gender: brief.gender, budgetTier: hero.styling.priceTier, season: brief.season, targetFormality: brief.targetFormality },
    heroImage: hero.imageUrls[0],
    flatLayImage: null,
    curatorNote: noteFor(items, res, brief),
    estPriceLow: Math.round(lo * 0.85),
    estPriceHigh: Math.round(lo * 1.15),
    coherence: { score: res.score, passed: res.passed, hardViolations: res.hardViolations, ruleScores: res.ruleScores, scheme: res.scheme, heroItemId: hero.id },
    state: "published",
    generatedBy: "greedy",
    featured: bundles.length === 0,
    items: items.map((i) => ({ ...i, note: null, variant: "core", swapAlternates: [] })),
  };
}

// generate several looks per brief, mixing dress + separates archetypes
for (const brief of BRIEFS) {
  let made = 0;
  for (let idx = 0; idx < 14 && made < 4; idx++) {
    const arch = idx % 3 === 2 ? "separates" : "dress";
    const look = makeLook(brief, arch, idx);
    if (look) { bundles.push(look); made++; }
  }
}

const usedProducts = catalog.filter((p) => usedProductIds.has(p.id));
const out = {
  products: catalog, // keep full real pool so the builder has rich, real swap alternates
  bundles,
  _meta: { source: "real-shopify-ingest + greedy-composer", generated: "build-time", counts: { products: catalog.length, bundles: bundles.length, usedProducts: usedProducts.length }, note: "Real products + images from public Shopify catalogs; looks composed by the coherence scorer (threshold 72)." },
};
writeFileSync(path.join(__dirname, "..", "data", "seed-real.json"), JSON.stringify(out, null, 2));
console.log(`Composed ${bundles.length} real looks from ${usedProducts.length} products.`);
for (const b of bundles) console.log(`  ${b.coherence.score.toFixed(0)}  ${b.coherence.scheme.padEnd(18)} ${b.title} — ${b.items.length} items ($${Math.round(b.estPriceLow/100)}-${Math.round(b.estPriceHigh/100)})`);
