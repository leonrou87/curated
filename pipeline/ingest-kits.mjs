// ingest-kits.mjs — real, non-fashion "kits" (coffee / desk / gym / golf) from brand Shopify feeds.
// Proves the bundle engine generalizes beyond fashion with REAL images. Output: data/seed-kits.json.
// Kits use uniform neutral styling so the same coherence scorer passes (utility, not color theory).
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { scoreComposition } = require("../scripts/scorer.reference.js");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const BRANDS = [
  { base: "https://fellowproducts.com", brand: "Fellow", theme: "coffee" },
  { base: "https://ugmonk.com", brand: "Ugmonk", theme: "desk" },
  { base: "https://www.branchfurniture.com", brand: "Branch", theme: "desk" },
  { base: "https://living.fit", brand: "Living.Fit", theme: "gym" },
  { base: "https://www.bellsofsteel.us", brand: "Bells of Steel", theme: "gym" },
  { base: "https://www.repfitness.com", brand: "REP Fitness", theme: "gym" },
  { base: "https://stix.golf", brand: "Stix", theme: "golf" },
  { base: "https://sundaygolf.com", brand: "Sunday Golf", theme: "golf" },
];

// each theme: ordered sub-types with include (any) / exclude (not) keywords + a per-item price cap.
// We pick ONE in-stock product per sub-type for variety and realistic budgets.
const THEMES = {
  coffee: {
    title: "Home Espresso Bar — The Real Setup",
    occasion: "home-espresso", activity: "coffee",
    subtypes: [
      { any: ["grinder", "burr"], not: ["hand", "blade"], max: 25000 },
      { any: ["kettle", "stagg ekg", "corvo"], not: ["matcha", "body", "lid", "replacement", "spare"], max: 20000 },
      { any: ["pour over", "pour-over", "dripper", "aeropress", "v60", "chemex", "prismo", "ratio", "stagg [x", "stagg xf"], not: ["matcha", "machine", "washing", "station", "pad", "limescale", "filter", "kettle", "ekg", "electric"], max: 12000 },
      { any: ["scale", "tally"], not: ["mat", "limescale", "pad"], max: 12000 },
      { any: ["mug", "tumbler", "carafe", "server", "glasses"], not: ["limescale", "pad"], max: 8000 },
    ],
    note: "A complete pour-over setup that actually works together — a precise grinder leads, a gooseneck kettle and brewer follow, and a scale keeps every cup repeatable.",
  },
  desk: {
    title: "Focused WFH Desk Setup",
    occasion: "wfh-desk", activity: "desk",
    subtypes: [
      { any: ["laptop stand", "monitor stand", "riser", "gather"], not: ["pen", "paperweight"], max: 20000 },
      { any: ["organizer", "dock", "tray"], not: ["pen"], max: 8000 },
      { any: ["mousepad", "desk pad", "mat"], not: [], max: 8000 },
      { any: ["cable", "keeper"], not: [], max: 4000 },
      { any: ["pen", "knife", "tool"], not: ["organizer", "stand"], max: 8000 },
    ],
    note: "A calm, tactile desk built around a laptop stand at eye level — an organizer and desk pad anchor the surface, with a few daily tools to finish it.",
  },
  gym: {
    title: "Apartment Home Gym — No Excuses",
    occasion: "home-gym", activity: "gym",
    subtypes: [
      { any: ["kettlebell"], not: ["rack", "set", "pair", "storage", "expansion", "extension", "bottom", "handle", "plate", "kit", "add"], max: 25000 },
      { any: ["resistance band", "build band", "loop band", "power band", "mini band"], not: ["rack", "rope"], max: 6000 },
      { any: ["jump rope"], not: ["rack", "replacement", "cable"], max: 7000 },
      { any: ["foam roller"], not: ["rack"], max: 6000 },
      { any: ["yoga mat", "exercise mat", "fitness mat", "workout mat", "gym mat", "training mat"], not: ["bath", "stone", "door", "platform", "rack"], max: 12000 },
    ],
    note: "A small-space strength kit that covers the basics — an adjustable kettlebell for load, resistance bands and a jump rope for conditioning, plus a mat and roller for floor work and recovery.",
  },
  golf: {
    title: "First-Timer Golf Starter Kit",
    occasion: "golf-starter", activity: "golf",
    subtypes: [
      { any: ["set", "clubs", "package"], not: ["junior", "women", "ladies", "perform 12", "complete 12"], max: 70000 },
      { any: ["bag"], not: ["set", "with bag", "club"], max: 25000 },
      { any: ["ball"], not: ["marker", "towel", "cart", "sleeve"], max: 6000 },
      { any: ["glove"], not: [], max: 4000 },
      { any: ["tee", "towel", "headcover", "marker"], not: [], max: 4000 },
    ],
    note: "Everything a new golfer needs to step onto the course with confidence — a forgiving set leads, with a bag, balls, a glove, and the small accessories that make a round smooth.",
  },
};

const COLOR_LUT = {
  black: ["black", "#1F1F1F", "neutral"], matte: ["charcoal", "#2E2E30", "neutral"], charcoal: ["charcoal", "#33343A", "neutral"],
  white: ["white", "#ECEAE3", "neutral"], grey: ["grey", "#8A8A88", "neutral"], gray: ["grey", "#8A8A88", "neutral"],
  silver: ["grey", "#A7A9AC", "cool"], steel: ["grey", "#8E949B", "cool"], stainless: ["grey", "#9AA0A6", "cool"],
  walnut: ["brown", "#5A3F2B", "warm"], oak: ["tan", "#B89A6A", "warm"], wood: ["brown", "#6B4A30", "warm"],
  natural: ["cream", "#D8CBB0", "warm"], tan: ["tan", "#B69468", "warm"], green: ["green", "#3F6B4E", "cool"],
  blue: ["navy", "#2B3A55", "cool"], navy: ["navy", "#27324A", "cool"], red: ["red", "#9E3B2E", "warm"],
  copper: ["orange", "#9C6239", "warm"], brass: ["yellow", "#B6912F", "warm"], sage: ["green", "#9CA98A", "cool"],
};
function deriveColor(text) {
  const t = (text || "").toLowerCase();
  for (const k of Object.keys(COLOR_LUT)) if (t.includes(k)) { const [family, primaryHex, undertone] = COLOR_LUT[k]; return { primaryHex, family, undertone, role: "neutral", value: 40, chroma: 12 }; }
  return { primaryHex: "#3A3A3C", family: "charcoal", undertone: "neutral", role: "neutral", value: 40, chroma: 8 };
}

async function fetchProducts(base) {
  try {
    const r = await fetch(`${base}/products.json?limit=250`, { headers: { "User-Agent": UA, Accept: "application/json" } });
    const txt = await r.text();
    if (txt.trim().startsWith("<")) return [];
    return JSON.parse(txt).products || [];
  } catch { return []; }
}

const SLOTS = ["anchor", "top", "bottom", "shoes", "accessories"];
function toProduct(p, brand, base, theme, idx) {
  const variant = (p.variants || [])[0];
  const cents = Math.round(parseFloat(variant?.price || "0") * 100);
  const img = (p.images || [])[0]?.src;
  if (!img || !cents || cents < 800) return null;
  const color = deriveColor(`${p.title} ${img.split("/").pop()}`);
  const url = `${base}/products/${p.handle}`;
  return {
    id: `k_${brand.toLowerCase().replace(/[^a-z]/g, "")}_${p.id}`,
    title: p.title.replace(/\s+/g, " ").trim(), brand, category: theme, subcategory: null,
    canonicalUrl: url, imageUrls: (p.images || []).slice(0, 4).map((i) => i.src),
    inStock: (p.variants || []).some((v) => v.available !== false),
    offers: [{ network: "sovrn", merchant: brand, affiliateUrl: url, rawUrl: url, priceTier: cents < 8000 ? "budget" : cents < 25000 ? "mid" : "premium", priceSnapshot: cents, currency: "USD", inStock: true, commissionEst: 0.06, status: "active" }],
    slotRoles: [SLOTS[idx % SLOTS.length]],
    styling: {
      formality: 3, dressCodes: [], color, pattern: "solid", texture: [], silhouette: "regular",
      volume: "regular", weight: idx === 0 ? "statement" : "supporting", seasons: ["all"], weather: [],
      brand, brandTier: 3, priceTier: cents < 8000 ? "budget" : cents < 25000 ? "mid" : "premium", slotRoles: [SLOTS[idx % SLOTS.length]],
    },
  };
}

// gather products per theme across its brands
const byTheme = {};
for (const b of BRANDS) {
  const prods = await fetchProducts(b.base);
  console.log(`  ${b.brand}: ${prods.length} products`);
  (byTheme[b.theme] ??= []).push(...prods.map((p) => ({ p, brand: b.brand, base: b.base })));
}

const allProducts = [];
const bundles = [];

for (const [theme, cfg] of Object.entries(THEMES)) {
  const candidates = byTheme[theme] || [];
  const chosen = [];
  const usedIds = new Set();
  // one product per sub-type: matches an include keyword, no exclude keyword, under the cap, in-stock
  for (const st of cfg.subtypes) {
    const hit = candidates.find(({ p }) => {
      if (usedIds.has(p.id)) return false;
      const t = `${p.title} ${p.product_type}`.toLowerCase();
      const cents = Math.round(parseFloat(p.variants?.[0]?.price || "0") * 100);
      const inStock = (p.variants || []).some((v) => v.available !== false);
      if (!(p.images || [])[0]?.src || cents < 800 || cents > st.max || !inStock) return false;
      if (st.not.some((k) => t.includes(k))) return false;
      return st.any.some((k) => t.includes(k));
    });
    if (hit) { chosen.push(hit); usedIds.add(hit.p.id); }
  }
  if (chosen.length < 3) { console.log(`  ⚠ ${theme}: only ${chosen.length} items, skipped`); continue; }

  const prods = chosen.map((c, i) => toProduct(c.p, c.brand, c.base, theme, i)).filter(Boolean);
  allProducts.push(...prods);
  const items = prods.map((p, i) => ({ productId: p.id, slotId: p.slotRoles[0], role: SLOTS[i % SLOTS.length], note: null, variant: "core", swapAlternates: [] }));
  const scorables = prods.map((p) => ({ id: p.id, brand: p.brand, inStock: p.inStock, slotId: p.slotRoles[0], styling: p.styling }));
  const res = scoreComposition(scorables, { highLow: true }, {});
  const lo = prods.reduce((s, p) => s + p.offers[0].priceSnapshot, 0);
  bundles.push({
    id: `kb_${bundles.length + 1}`, slug: `${theme}-kit-real`, type: "kit", title: cfg.title,
    brief: { occasion: cfg.occasion, activity: cfg.activity, budgetTier: "mid", season: "all" },
    heroImage: prods[0].imageUrls[0], flatLayImage: null, curatorNote: cfg.note,
    estPriceLow: Math.round(lo * 0.9), estPriceHigh: Math.round(lo * 1.1),
    coherence: { score: res.score, passed: res.passed, hardViolations: res.hardViolations, ruleScores: res.ruleScores, scheme: res.scheme, heroItemId: prods[0].id },
    state: "published", generatedBy: "assisted", featured: false, items,
  });
  console.log(`  ✓ ${theme}: ${prods.length} items, coherence ${res.score} ($${Math.round(lo / 100)})`);
}

writeFileSync(path.join(__dirname, "..", "data", "seed-kits.json"), JSON.stringify({ products: allProducts, bundles, _meta: { source: "real brand Shopify feeds (Fellow/Ugmonk/Branch/REP/Stix/Sunday)", generated: "build-time", counts: { products: allProducts.length, bundles: bundles.length } } }, null, 2));
console.log(`\nWrote ${bundles.length} real kits / ${allProducts.length} products → data/seed-kits.json`);
