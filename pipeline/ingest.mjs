// ingest.mjs — pull REAL products from Shopify-class retailers (bulk products.json, no auth)
// and map them to our Product schema with derived styling metadata. Output: data/catalog-real.json.
// Run: node pipeline/ingest.mjs
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "data", "catalog-real.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Curated Shopify brands that span the slots we need. Each entry filters by product type.
const BRANDS = [
  { base: "https://www.marinelayer.com", brand: "Marine Layer", keep: ["dress", "top", "bottom"] },
  { base: "https://www.cuyana.com", brand: "Cuyana", keep: ["bag", "top", "bottom", "dress"] },
  { base: "https://www.allbirds.com", brand: "Allbirds", keep: ["shoes"] },
  { base: "https://kotn.com", brand: "Kotn", keep: ["top", "bottom", "dress"] },
  { base: "https://us.frankandoak.com", brand: "Frank And Oak", keep: ["top", "bottom", "dress", "shoes"] },
  { base: "https://www.vuori.com", brand: "Vuori", keep: ["top", "bottom"] },
  { base: "https://www.rothys.com", brand: "Rothy's", keep: ["shoes", "bag"] },
  { base: "https://www.quince.com", brand: "Quince", keep: ["top", "bottom", "dress", "bag", "shoes"] },
];

// ---- color name → family/hex/undertone/role ----
const COLOR_LUT = {
  black: ["black", "#1A1A1A", "neutral", "neutral"], jet: ["black", "#161616", "neutral", "neutral"],
  white: ["white", "#F2EFE8", "neutral", "neutral"], ivory: ["cream", "#EDE6D6", "warm", "neutral"],
  cream: ["cream", "#E8DFC8", "warm", "neutral"], oat: ["cream", "#DCD2BC", "warm", "neutral"],
  bone: ["cream", "#E3DAC7", "warm", "neutral"], natural: ["cream", "#DED3BC", "warm", "neutral"],
  beige: ["beige", "#CDBA99", "warm", "neutral"], stone: ["beige", "#C2B5A0", "warm", "neutral"],
  sand: ["beige", "#C9B79A", "warm", "neutral"], khaki: ["tan", "#B3A074", "warm", "neutral"],
  tan: ["tan", "#B89968", "warm", "neutral"], camel: ["camel", "#A67C4E", "warm", "accent"],
  brown: ["brown", "#6F4E32", "warm", "accent"], chocolate: ["brown", "#4E3526", "warm", "accent"],
  espresso: ["brown", "#3D2A1E", "warm", "neutral"], mocha: ["brown", "#5C4434", "warm", "accent"],
  olive: ["olive", "#6B6A3A", "warm", "statement"], sage: ["green", "#9CA98A", "cool", "accent"],
  green: ["green", "#3F6B4E", "cool", "statement"], forest: ["green", "#2C4A36", "cool", "statement"],
  navy: ["navy", "#27324A", "cool", "neutral"], blue: ["blue", "#3E5C86", "cool", "statement"],
  denim: ["blue", "#4A6079", "cool", "accent"], indigo: ["navy", "#2A3252", "cool", "statement"],
  grey: ["grey", "#8B8A86", "neutral", "neutral"], gray: ["grey", "#8B8A86", "neutral", "neutral"],
  charcoal: ["charcoal", "#3A3A3C", "neutral", "neutral"], slate: ["grey", "#6E737A", "cool", "neutral"],
  pink: ["pink", "#D7A2A8", "cool", "accent"], blush: ["pink", "#E2BFB8", "warm", "accent"],
  rose: ["pink", "#C98B8B", "warm", "accent"], red: ["red", "#A23A2E", "warm", "statement"],
  burgundy: ["burgundy", "#5E2A2E", "warm", "statement"], wine: ["burgundy", "#5A2733", "cool", "statement"],
  rust: ["orange", "#9E4A2C", "warm", "statement"], terracotta: ["orange", "#A8552F", "warm", "statement"],
  orange: ["orange", "#C8612F", "warm", "statement"], mustard: ["yellow", "#C49A3A", "warm", "accent"],
  yellow: ["yellow", "#D2B24A", "warm", "accent"], gold: ["yellow", "#C8A951", "warm", "accent"],
  purple: ["purple", "#5B4A77", "cool", "statement"], lavender: ["purple", "#9F95B8", "cool", "accent"],
  teal: ["teal", "#2F6E6A", "cool", "statement"], taupe: ["beige", "#A99A88", "warm", "neutral"],
  cognac: ["brown", "#8A4B2A", "warm", "accent"], caramel: ["camel", "#A9743F", "warm", "accent"],
  clay: ["orange", "#9E5B3E", "warm", "accent"], ecru: ["cream", "#E0D7C2", "warm", "neutral"],
  noir: ["black", "#161616", "neutral", "neutral"], onyx: ["black", "#1A1A1A", "neutral", "neutral"],
  cobalt: ["blue", "#2E4D8E", "cool", "statement"], emerald: ["green", "#2F6E50", "cool", "statement"],
  plum: ["purple", "#5A3A55", "cool", "statement"], mauve: ["pink", "#B493A0", "cool", "accent"],
};
function deriveColor(text) {
  const t = (text || "").toLowerCase();
  for (const key of Object.keys(COLOR_LUT)) {
    if (t.includes(key)) {
      const [family, primaryHex, undertone, role] = COLOR_LUT[key];
      return { primaryHex, family, undertone, role, value: 50, chroma: 30 };
    }
  }
  return { primaryHex: "#9C9389", family: "beige", undertone: "neutral", role: "neutral", value: 55, chroma: 12 };
}

// ---- product_type / title → slot + category + formality + weight ----
function classify(type, title) {
  const s = `${type} ${title}`.toLowerCase();
  const has = (...w) => w.some((x) => s.includes(x));
  if (has("dress", "jumpsuit", "gown")) return { slot: "anchor", category: "dress", formality: 4, weight: "statement", volume: "flowy" };
  if (has("blazer", "suit", "coat", "trench", "jacket", "outerwear")) return { slot: "top", category: "outerwear", formality: 4, weight: "statement", volume: "regular" };
  if (has("sweater", "knit", "cardigan", "pullover")) return { slot: "top", category: "knitwear", formality: 3, weight: "supporting", volume: "regular" };
  if (has("shirt", "blouse", "top", "tee", "tank", "polo", "henley")) return { slot: "top", category: "top", formality: 2, weight: "supporting", volume: "regular" };
  if (has("trouser", "pant", "chino", "slack")) return { slot: "bottom", category: "bottom", formality: 3, weight: "supporting", volume: "regular" };
  if (has("jean", "denim")) return { slot: "bottom", category: "bottom", formality: 2, weight: "supporting", volume: "regular" };
  if (has("skirt")) return { slot: "bottom", category: "bottom", formality: 3, weight: "supporting", volume: "flowy" };
  if (has("short")) return { slot: "bottom", category: "bottom", formality: 1, weight: "basic", volume: "regular" };
  if (has("heel", "pump", "sandal")) return { slot: "shoes", category: "shoes", formality: 4, weight: "supporting", volume: "slim" };
  if (has("loafer", "flat", "mule", "ballet")) return { slot: "shoes", category: "shoes", formality: 3, weight: "supporting", volume: "slim" };
  if (has("boot")) return { slot: "shoes", category: "shoes", formality: 3, weight: "supporting", volume: "regular" };
  if (has("sneaker", "shoe", "trainer", "runner")) return { slot: "shoes", category: "shoes", formality: 2, weight: "basic", volume: "regular" };
  if (has("tote", "bag", "clutch", "crossbody", "satchel", "purse")) return { slot: "bag", category: "bag", formality: 3, weight: "supporting", volume: "regular" };
  if (has("earring", "necklace", "ring", "bracelet", "jewelry", "hat", "scarf", "belt", "sunglass")) return { slot: "accessories", category: "accessories", formality: 3, weight: "basic", volume: "slim" };
  return null; // unrecognized — skip
}

const SLOT_TO_TYPE = { dress: "dress", top: "top", bottom: "bottom", shoes: "shoes", bag: "bag", accessories: "accessories" };

function priceTierOf(cents) { return cents < 8000 ? "budget" : cents < 25000 ? "mid" : "premium"; }
function brandTierOf(cents) { return cents < 6000 ? 2 : cents < 15000 ? 3 : cents < 40000 ? 4 : 5; }
function seasonsOf(text) {
  const t = (text || "").toLowerCase();
  if (/linen|seersucker|poplin|short|tank|sandal/.test(t)) return ["summer"];
  if (/wool|cashmere|coat|flannel|fleece|boot|knit|sweater/.test(t)) return ["fall", "winter"];
  return ["all"];
}
function patternOf(text) {
  return /stripe|plaid|floral|print|check|gingham|polka|leopard|paisley/.test((text || "").toLowerCase()) ? "bold" : "solid";
}

function colorOptionValue(p) {
  const opt = (p.options || []).find((o) => /colou?r/i.test(o.name));
  if (opt && opt.values && opt.values.length) return opt.values[0];
  return p.title;
}

async function fetchJson(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok) return null;
    const txt = await r.text();
    if (txt.trim().startsWith("<")) return null; // HTML, not JSON
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function handleOf(p, base) {
  return `${base}/products/${p.handle}`;
}

async function ingestBrand(b) {
  const out = [];
  const data = await fetchJson(`${b.base}/products.json?limit=250`);
  if (!data || !Array.isArray(data.products)) {
    console.log(`  ⚠ ${b.brand}: bulk JSON unavailable (skipped)`);
    return out;
  }
  for (const p of data.products) {
    const cls = classify(p.product_type || "", p.title || "");
    if (!cls) continue;
    if (b.keep && !b.keep.includes(cls.slot === "anchor" ? "dress" : cls.slot)) continue;
    const variant = (p.variants || [])[0];
    if (!variant) continue;
    const cents = Math.round(parseFloat(variant.price || "0") * 100);
    if (!cents || cents < 1500) continue; // skip socks/swatches/freebies
    const img = (p.images || [])[0]?.src;
    if (!img || !/cdn\.shopify\.com|\.jpg|\.png|\.webp/i.test(img)) continue;
    const colorText = colorOptionValue(p);
    const imgName = decodeURIComponent((img.split("/").pop() || "").replace(/[._-]/g, " "));
    const color = deriveColor(`${colorText} ${p.title} ${imgName}`);
    const url = handleOf(p, b.base);
    out.push({
      id: `r_${b.brand.toLowerCase().replace(/[^a-z]/g, "")}_${p.id}`,
      title: p.title.replace(/\s+/g, " ").trim(),
      brand: b.brand,
      category: cls.category,
      subcategory: null,
      canonicalUrl: url,
      imageUrls: (p.images || []).slice(0, 4).map((i) => i.src),
      inStock: (p.variants || []).some((v) => v.available !== false),
      offers: [{
        network: "sovrn", merchant: b.brand,
        affiliateUrl: url, rawUrl: url,
        priceTier: priceTierOf(cents), priceSnapshot: cents, currency: "USD",
        inStock: true, commissionEst: 0.08, status: "active",
      }],
      slotRoles: [cls.slot],
      styling: {
        formality: cls.formality, dressCodes: [], color,
        pattern: patternOf(`${p.title} ${imgName}`), texture: [], silhouette: cls.volume,
        volume: cls.volume === "flowy" ? "regular" : cls.volume === "slim" ? "slim" : "regular",
        weight: cls.weight, seasons: seasonsOf(`${p.title} ${(p.tags || []).join(" ")}`),
        weather: [], brand: b.brand, brandTier: brandTierOf(cents),
        priceTier: priceTierOf(cents), slotRoles: [cls.slot],
      },
    });
  }
  console.log(`  ✓ ${b.brand}: ${out.length} usable products`);
  return out;
}

const all = [];
for (const b of BRANDS) {
  const items = await ingestBrand(b);
  all.push(...items);
}

// de-dupe by id, cap per (brand,slot) for variety
const seen = new Set();
const deduped = all.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));

const bySlot = {};
for (const p of deduped) {
  const slot = p.slotRoles[0];
  bySlot[slot] = (bySlot[slot] || 0) + 1;
}

writeFileSync(OUT, JSON.stringify({ products: deduped, _meta: { source: "shopify-ingest", generated: "build-time", bySlot } }, null, 2));
console.log(`\nWrote ${deduped.length} real products → data/catalog-real.json`);
console.log("By slot:", bySlot);
