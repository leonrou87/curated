// compose.mjs — scaled composer. Generates ~1000 distinct, coherent looks (score >= 72) across
// men + women by walking the real product catalog combinatorially, varying supporting pieces for
// real variety, auto-tagging each with an aesthetic + budget tier. Output: data/seed-real.json.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { scoreComposition, THRESHOLD } = require("../scripts/scorer.reference.js");

const TARGET = Number(process.env.TARGET) || 1800;
const catalog = JSON.parse(readFileSync(path.join(__dirname, "..", "data", "catalog-real.json"), "utf8")).products;
const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));
const ok = (p) => p.inStock && p.imageUrls?.[0]?.startsWith("http");
const inG = (p, g) => p.gender === g || p.gender === "unisex";
const pool = (slot, g) => catalog.filter((p) => p.slotRoles[0] === slot && ok(p) && inG(p, g));

const POOLS = {
  women: { anchor: pool("anchor", "women"), top: pool("top", "women"), bottom: pool("bottom", "women"), shoes: pool("shoes", "women"), bag: pool("bag", "women"), accessories: pool("accessories", "women") },
  men: { anchor: pool("anchor", "men"), top: pool("top", "men"), bottom: pool("bottom", "men"), shoes: pool("shoes", "men"), bag: pool("bag", "men"), accessories: pool("accessories", "men") },
};
const scorable = (p, slotId) => ({ id: p.id, brand: p.brand, inStock: p.inStock, slotId, styling: p.styling });

const NEUTRALS = new Set(["black", "white", "grey", "charcoal", "beige", "navy", "cream", "tan", "camel", "brown"]);
function aestheticFor(items, g, formality, season, idx) {
  const hero = byId[items.find((i) => i.slotId === "anchor")?.productId] || byId[items[0].productId];
  const hf = hero.styling.color.family;
  const fams = items.map((i) => byId[i.productId].styling.color.family);
  const blacks = fams.filter((f) => f === "black" || f === "charcoal").length;
  const neutralShare = fams.filter((f) => NEUTRALS.has(f)).length / fams.length;
  const premium = items.every((i) => byId[i.productId].styling.priceTier !== "budget");
  const hasRedOrange = fams.some((f) => ["red", "orange", "burgundy", "rust"].includes(f));
  const earthy = fams.filter((f) => ["olive", "brown", "tan", "rust", "orange", "camel"].includes(f)).length >= 2;
  const pick = (...opts) => opts[idx % opts.length]; // spread evenly between fitting options
  if (g === "men") {
    if (formality >= 4) return pick(premium ? "old-money" : "modern-classic", "modern-classic", "old-money");
    if (["olive", "green", "navy", "grey"].includes(hf) && season === "fall") return pick("gorpcore", "eclectic-grandpa");
    if (season === "fall" && earthy) return pick("eclectic-grandpa", "gorpcore");
    if (["blue", "navy", "red", "green"].includes(hf)) return pick("blokecore", "minimalist");
    if (neutralShare >= 0.7) return pick("minimalist", "off-duty", "modern-classic");
    return pick("off-duty", "blokecore", "minimalist");
  }
  const heroBlack = hf === "black" || hf === "charcoal";
  if (heroBlack && blacks >= 2) return pick(premium ? "mob-wife" : "all-black", "all-black", "mob-wife");
  if (["pink", "rose", "blush", "mauve"].includes(hf)) return pick("coquette", "clean-girl", "coquette");
  if (formality >= 4) return pick(premium ? "quiet-luxury" : "office-siren", "office-siren", "old-money", "minimalist");
  if (season === "summer" && hasRedOrange) return pick("tomato-girl", "coastal");
  if (season === "summer") return pick("coastal", "clean-girl", "tomato-girl");
  if (earthy) return pick("boho", "eclectic-grandpa", "off-duty");
  if (premium && neutralShare >= 0.6) return pick("old-money", "quiet-luxury", "minimalist");
  if (neutralShare >= 0.6) return pick("clean-girl", "minimalist", "off-duty");
  return pick("minimalist", "off-duty", "clean-girl");
}
const OCCASION = { 4: ["evening", "event", "wedding-guest", "work"], 3: ["everyday", "work", "brunch", "dinner"], 2: ["weekend", "vacation", "everyday"], 1: ["weekend", "lounge"] };
const cap = (s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Editorial, magazine-style look names — varied by mood + color + index (deterministic).
const NAME_BANKS = {
  evening: ["{C}, After Dark", "The {C} Hour", "After Hours in {C}", "{C} & Candlelight", "Nightfall in {C}"],
  elevated: ["Quiet in {C}", "Notes in {C}", "{C} & Restraint", "A Study in {C}", "The {C} Edit"],
  summer: ["{C} & Salt Air", "Holiday in {C}", "{C} by the Sea", "Long Days in {C}", "Sun-Bleached {C}"],
  casual: ["Sunday {C}", "Off-Duty {C}", "{C}, Unhurried", "Weekend in {C}", "{C} on Repeat"],
  work: ["{C}, On the Clock", "The {C} Brief", "Desk to Dinner in {C}", "{C} Means Business"],
};
function lookName(aesthetic, heroColor, formality, season, idx) {
  let bank = "casual";
  if (["mob-wife", "all-black"].includes(aesthetic) || formality >= 4) bank = "evening";
  else if (["quiet-luxury", "old-money", "minimalist", "office-siren", "clean-girl"].includes(aesthetic)) bank = formality >= 4 ? "work" : "elevated";
  else if (season === "summer" || ["coastal", "tomato-girl", "boho"].includes(aesthetic)) bank = "summer";
  const arr = NAME_BANKS[bank];
  return arr[idx % arr.length].replace("{C}", cap(heroColor));
}

function seasonOf(items) {
  const ss = items.flatMap((i) => byId[i.productId].styling.seasons);
  if (ss.includes("fall") || ss.includes("winter")) return "fall";
  if (ss.every((s) => s === "summer" || s === "all") && ss.includes("summer")) return "summer";
  return "all";
}
const TREND_NOTE = {
  "quiet-luxury": "Refined without trying — tonal, elevated, nothing loud.", "old-money": "Heritage polish: muted palette, quiet confidence over labels.",
  "clean-girl": "Slept-in but pulled-together — minimal, glowy, zero clutter.", coastal: "Linen-soft and breezy, built for golden hour by the water.",
  "office-siren": "Sharp, deliberate tailoring with a magnetic edge.", "tomato-girl": "Sun-warmed Mediterranean ease in ripe, summery tones.",
  "mob-wife": "Unapologetic glamour — rich darks, bold attitude.", minimalist: "Quiet, exact and intentional — a few perfect pieces.",
  "all-black": "All black, done right — texture and proportion over color.", "off-duty": "Easy, considered pieces that never look like you tried.",
  boho: "Free-spirited, earthy layers for the festival and the after.", blokecore: "Terrace-casual — sport-adjacent staples, off-hand confidence.",
  gorpcore: "Trail-ready function, styled tonal for the city.", "modern-classic": "Timeless tailoring with a modern, relaxed cut.",
  "eclectic-grandpa": "Cozy, lived-in layers with a wink of pattern.",
};

const bundles = [];
const sigs = new Set();
const usedProductIds = new Set();
let counter = 0;

// pick a varied-but-coherent candidate for a slot (top-K by score, rotated by offset)
function pickVaried(items, slot, g, season, offset) {
  let cands = POOLS[g][slot].filter((p) => p.styling.seasons.includes(season) || p.styling.seasons.includes("all") || season === "all");
  if (cands.length < 4) cands = POOLS[g][slot];
  if (!cands.length) return null;
  const scored = cands.map((c) => {
    const trial = [...items.map((i) => scorable(byId[i.productId], i.slotId)), scorable(c, slot)];
    return { c, s: scoreComposition(trial, {}, {}).score };
  }).sort((a, b) => b.s - a.s);
  const K = Math.min(8, scored.length);
  return scored[offset % K].c;
}

function emit(coreItems, g, offset) {
  const items = [...coreItems];
  const season = seasonOf(items);
  const fill = g === "men" ? ["shoes", "accessories"] : ["shoes", "bag", "accessories"];
  for (const slot of fill) {
    const pick = pickVaried(items, slot, g, season, offset + items.length);
    if (pick && !items.some((i) => i.productId === pick.id)) items.push({ productId: pick.id, slotId: slot, role: slot });
  }
  if (items.length < 3) return false;
  const sig = items.map((i) => i.productId).sort().join("|");
  if (sigs.has(sig)) return false;
  const formality = Math.round(items.reduce((s, i) => s + byId[i.productId].styling.formality, 0) / items.length);
  const res = scoreComposition(items.map((i) => scorable(byId[i.productId], i.slotId)), { targetFormality: formality, season }, {});
  if (!res.passed || res.score < THRESHOLD) return false;
  sigs.add(sig);
  items.forEach((i) => usedProductIds.add(i.productId));
  const hero = byId[items.find((i) => i.slotId === "anchor")?.productId] || byId[items[0].productId];
  const aesthetic = aestheticFor(items, g, formality, season, counter);
  const occ = OCCASION[formality][counter % OCCASION[formality].length];
  const lo = items.reduce((s, i) => s + byId[i.productId].offers[0].priceSnapshot, 0);
  const budget = lo < 25000 ? "budget" : lo < 70000 ? "mid" : "premium";
  const support = items.filter((i) => i.productId !== hero.id).map((i) => `${byId[i.productId].styling.color.family} ${byId[i.productId].category}`).slice(0, 3).join(", ");
  counter++;
  bundles.push({
    id: `rb_${counter}`, slug: `${aesthetic}-${g}-${counter}`, type: "look",
    title: lookName(aesthetic, hero.styling.color.family, formality, season, counter),
    brief: { occasion: occ, vibe: aesthetic, gender: g, budgetTier: budget, season, targetFormality: formality },
    heroImage: hero.imageUrls[0], flatLayImage: null,
    curatorNote: `${TREND_NOTE[aesthetic] || "A coherent, considered take."} The ${hero.styling.color.family} ${hero.category} leads a ${res.scheme.replace(/-/g, " ")} palette; ${support} keep it cohesive for ${occ.replace(/-/g, " ")}.`,
    estPriceLow: Math.round(lo * 0.9), estPriceHigh: Math.round(lo * 1.12),
    coherence: { score: res.score, passed: res.passed, hardViolations: res.hardViolations, ruleScores: res.ruleScores, scheme: res.scheme, heroItemId: hero.id },
    state: "published", generatedBy: "greedy", featured: false,
    items: items.map((i) => ({ ...i, note: null, variant: "core", swapAlternates: [] })),
  });
  return true;
}

// ——— generate (allocate a women/men share so both genders are well represented) ———
const WOMEN_CAP = Math.floor(TARGET * 0.6);
// 1) women dress-anchored looks (a couple supporting variants per dress — avoid over-cloning)
for (const d of POOLS.women.anchor) {
  for (let v = 0; v < 2 && bundles.length < WOMEN_CAP; v++) emit([{ productId: d.id, slotId: "anchor", role: "dress" }], "women", v * 4 + 1);
}
// 2) women separates (top × several bottoms)
const wTops = POOLS.women.top.filter((p) => p.styling.weight !== "statement");
for (let ti = 0; ti < wTops.length && bundles.length < WOMEN_CAP; ti++) {
  for (let k = 0; k < 5 && bundles.length < WOMEN_CAP; k++) {
    const b = POOLS.women.bottom[(ti * 7 + k * 13) % POOLS.women.bottom.length];
    if (!b) continue;
    emit([{ productId: wTops[ti].id, slotId: "top", role: "top" }, { productId: b.id, slotId: "bottom", role: "bottom" }], "women", k * 2);
  }
}
// 3) men separates (top × several bottoms) — fill the rest
const mTops = POOLS.men.top.filter((p) => p.styling.weight !== "statement");
for (let pass = 0; pass < 6 && bundles.length < TARGET; pass++) {
  for (let ti = 0; ti < mTops.length && bundles.length < TARGET; ti++) {
    const k = pass;
    const b = POOLS.men.bottom[(ti * 5 + k * 17) % POOLS.men.bottom.length];
    if (!b) continue;
    emit([{ productId: mTops[ti].id, slotId: "top", role: "top" }, { productId: b.id, slotId: "bottom", role: "bottom" }], "men", k * 3);
  }
}

// interleave so the same anchor/brand never clusters in the grid (deterministic scatter)
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
bundles.sort((a, b) => hash(a.slug) - hash(b.slug));

// feature a strong women + men look up front
const fw = bundles.find((b) => b.brief.gender === "women" && b.items.length >= 4); if (fw) fw.featured = true;
const fm = bundles.find((b) => b.brief.gender === "men" && b.items.length >= 4); if (fm) fm.featured = true;

const byG = bundles.reduce((a, b) => ((a[b.brief.gender] = (a[b.brief.gender] || 0) + 1), a), {});
const byAes = bundles.reduce((a, b) => ((a[b.brief.vibe] = (a[b.brief.vibe] || 0) + 1), a), {});
writeFileSync(path.join(__dirname, "..", "data", "seed-real.json"), JSON.stringify({
  products: catalog, bundles,
  _meta: { source: "real-shopify-ingest + scaled greedy composer", generated: "build-time", counts: { products: catalog.length, bundles: bundles.length, byGender: byG, usedProducts: usedProductIds.size } },
}, null, 2));
console.log(`Composed ${bundles.length} looks — women ${byG.women || 0}, men ${byG.men || 0}; ${usedProductIds.size} products used.`);
console.log("By aesthetic:", Object.entries(byAes).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join("  "));
