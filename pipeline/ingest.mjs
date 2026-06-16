// ingest.mjs — pull REAL products from Shopify-class retailers (bulk products.json, no auth) and
// map them to our Product schema with derived styling + GENDER + accessories. Output:
// data/catalog-real.json.  Run: node pipeline/ingest.mjs
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "data", "catalog-real.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// gender: "auto" derives per-product from product_type/tags; otherwise fixed for the brand.
const BRANDS = [
  // —— WOMEN ——
  { base: "https://www.marinelayer.com", brand: "Marine Layer", gender: "auto", keep: ["dress", "top", "bottom", "outerwear"] },
  { base: "https://www.cuyana.com", brand: "Cuyana", gender: "women", keep: ["bag", "top", "bottom", "dress"] },
  { base: "https://www.rothys.com", brand: "Rothy's", gender: "women", keep: ["shoes", "bag"] },
  { base: "https://www.gorjana.com", brand: "Gorjana", gender: "women", keep: ["accessories"] },
  { base: "https://www.missoma.com", brand: "Missoma", gender: "women", keep: ["accessories"] },
  { base: "https://jenny-bird.com", brand: "Jenny Bird", gender: "women", keep: ["accessories"] },
  // —— MEN ——
  { base: "https://www.taylorstitch.com", brand: "Taylor Stitch", gender: "men", keep: ["top", "bottom", "outerwear", "shoes", "bag", "accessories"] },
  { base: "https://waxlondon.com", brand: "Wax London", gender: "men", keep: ["top", "bottom", "outerwear", "shoes"] },
  // —— UNISEX ——
  { base: "https://www.allbirds.com", brand: "Allbirds", gender: "auto", keep: ["shoes"] },
];

const COLOR_LUT = {
  black: ["black", "#1A1A1A", "neutral", "neutral"], jet: ["black", "#161616", "neutral", "neutral"], noir: ["black", "#161616", "neutral", "neutral"], onyx: ["black", "#1A1A1A", "neutral", "neutral"],
  white: ["white", "#F2EFE8", "neutral", "neutral"], ivory: ["cream", "#EDE6D6", "warm", "neutral"], cream: ["cream", "#E8DFC8", "warm", "neutral"], oat: ["cream", "#DCD2BC", "warm", "neutral"], bone: ["cream", "#E3DAC7", "warm", "neutral"], natural: ["cream", "#DED3BC", "warm", "neutral"], ecru: ["cream", "#E0D7C2", "warm", "neutral"],
  beige: ["beige", "#CDBA99", "warm", "neutral"], stone: ["beige", "#C2B5A0", "warm", "neutral"], sand: ["beige", "#C9B79A", "warm", "neutral"], taupe: ["beige", "#A99A88", "warm", "neutral"], khaki: ["tan", "#B3A074", "warm", "neutral"], tan: ["tan", "#B89968", "warm", "neutral"], camel: ["camel", "#A67C4E", "warm", "accent"], caramel: ["camel", "#A9743F", "warm", "accent"],
  brown: ["brown", "#6F4E32", "warm", "accent"], chocolate: ["brown", "#4E3526", "warm", "accent"], espresso: ["brown", "#3D2A1E", "warm", "neutral"], cognac: ["brown", "#8A4B2A", "warm", "accent"], mocha: ["brown", "#5C4434", "warm", "accent"],
  olive: ["olive", "#6B6A3A", "warm", "statement"], sage: ["green", "#9CA98A", "cool", "accent"], green: ["green", "#3F6B4E", "cool", "statement"], forest: ["green", "#2C4A36", "cool", "statement"], emerald: ["green", "#2F6E50", "cool", "statement"],
  navy: ["navy", "#27324A", "cool", "neutral"], blue: ["blue", "#3E5C86", "cool", "statement"], denim: ["blue", "#4A6079", "cool", "accent"], indigo: ["navy", "#2A3252", "cool", "statement"], cobalt: ["blue", "#2E4D8E", "cool", "statement"],
  grey: ["grey", "#8B8A86", "neutral", "neutral"], gray: ["grey", "#8B8A86", "neutral", "neutral"], charcoal: ["charcoal", "#3A3A3C", "neutral", "neutral"], slate: ["grey", "#6E737A", "cool", "neutral"],
  pink: ["pink", "#D7A2A8", "cool", "accent"], blush: ["pink", "#E2BFB8", "warm", "accent"], rose: ["pink", "#C98B8B", "warm", "accent"], mauve: ["pink", "#B493A0", "cool", "accent"],
  red: ["red", "#A23A2E", "warm", "statement"], burgundy: ["burgundy", "#5E2A2E", "warm", "statement"], wine: ["burgundy", "#5A2733", "cool", "statement"], rust: ["orange", "#9E4A2C", "warm", "statement"], terracotta: ["orange", "#A8552F", "warm", "statement"], orange: ["orange", "#C8612F", "warm", "statement"], clay: ["orange", "#9E5B3E", "warm", "accent"],
  mustard: ["yellow", "#C49A3A", "warm", "accent"], yellow: ["yellow", "#D2B24A", "warm", "accent"], gold: ["yellow", "#C8A951", "warm", "accent"], brass: ["yellow", "#B6912F", "warm", "accent"],
  silver: ["grey", "#B6B8BB", "cool", "accent"], purple: ["purple", "#5B4A77", "cool", "statement"], lavender: ["purple", "#9F95B8", "cool", "accent"], plum: ["purple", "#5A3A55", "cool", "statement"], teal: ["teal", "#2F6E6A", "cool", "statement"],
};
function deriveColor(text) {
  const t = (text || "").toLowerCase();
  for (const key of Object.keys(COLOR_LUT)) {
    if (t.includes(key)) { const [family, primaryHex, undertone, role] = COLOR_LUT[key]; return { primaryHex, family, undertone, role, value: 50, chroma: 30 }; }
  }
  return { primaryHex: "#9C9389", family: "beige", undertone: "neutral", role: "neutral", value: 55, chroma: 12 };
}

function classify(type, title) {
  const s = `${type} ${title}`.toLowerCase();
  const has = (...w) => w.some((x) => s.includes(x));
  // jewelry + accessories first (so "ring" etc. don't fall through)
  if (has("necklace", "earring", "ring", "bracelet", "anklet", "pendant", "charm", "huggie", "hoop", "cuff", "signet")) return { slot: "accessories", category: "jewelry", formality: 3, weight: "basic", volume: "slim" };
  if (has("sunglass", "belt", "wallet", "cap", "hat", "beanie", "scarf", "tie", "watch", "cardholder", "card holder", "gloves")) return { slot: "accessories", category: "accessories", formality: 3, weight: "basic", volume: "slim" };
  if (has("dress", "jumpsuit", "gown")) return { slot: "anchor", category: "dress", formality: 4, weight: "statement", volume: "flowy" };
  if (has("blazer", "suit jacket", "sport coat", "overcoat", "topcoat", "trench", "coat", "parka", "jacket", "outerwear")) return { slot: "outerwear", category: "outerwear", formality: 4, weight: "statement", volume: "regular" };
  if (has("sweater", "knit", "cardigan", "pullover", "crewneck")) return { slot: "top", category: "knitwear", formality: 3, weight: "supporting", volume: "regular" };
  if (has("shirt", "blouse", "top", "tee", "tank", "polo", "henley", "vest")) return { slot: "top", category: "top", formality: 2, weight: "supporting", volume: "regular" };
  if (has("trouser", "pant", "chino", "slack")) return { slot: "bottom", category: "bottom", formality: 3, weight: "supporting", volume: "regular" };
  if (has("jean", "denim")) return { slot: "bottom", category: "bottom", formality: 2, weight: "supporting", volume: "regular" };
  if (has("skirt")) return { slot: "bottom", category: "bottom", formality: 3, weight: "supporting", volume: "flowy" };
  if (has("short")) return { slot: "bottom", category: "bottom", formality: 1, weight: "basic", volume: "regular" };
  if (has("heel", "pump", "sandal")) return { slot: "shoes", category: "shoes", formality: 4, weight: "supporting", volume: "slim" };
  if (has("loafer", "flat", "mule", "ballet", "derby", "oxford", "brogue", "dress shoe")) return { slot: "shoes", category: "shoes", formality: 3, weight: "supporting", volume: "slim" };
  if (has("boot")) return { slot: "shoes", category: "shoes", formality: 3, weight: "supporting", volume: "regular" };
  if (has("sneaker", "shoe", "trainer", "runner")) return { slot: "shoes", category: "shoes", formality: 2, weight: "basic", volume: "regular" };
  if (has("tote", "bag", "clutch", "crossbody", "satchel", "purse", "backpack", "duffle", "weekender")) return { slot: "bag", category: "bag", formality: 3, weight: "supporting", volume: "regular" };
  return null;
}

function deriveGender(brandGender, type, tags, title) {
  if (brandGender !== "auto") return brandGender;
  const s = `${type} ${tags} ${title}`.toLowerCase();
  if (/wom[ae]n|ladies|female/.test(s)) return "women";
  if (/\bmen('?s)?\b|male|guy/.test(s)) return "men";
  return "unisex";
}

const priceTierOf = (c) => (c < 8000 ? "budget" : c < 25000 ? "mid" : "premium");
const brandTierOf = (c) => (c < 6000 ? 2 : c < 15000 ? 3 : c < 40000 ? 4 : 5);
function seasonsOf(text) {
  const t = (text || "").toLowerCase();
  if (/linen|seersucker|poplin|short|tank|sandal/.test(t)) return ["summer"];
  if (/wool|cashmere|coat|flannel|fleece|boot|knit|sweater|corduroy|tweed/.test(t)) return ["fall", "winter"];
  return ["all"];
}
const patternOf = (t) => (/stripe|plaid|floral|print|check|gingham|polka|leopard|paisley|fair isle/.test((t || "").toLowerCase()) ? "bold" : "solid");
function colorOptionValue(p) {
  const opt = (p.options || []).find((o) => /colou?r/i.test(o.name));
  return opt && opt.values?.length ? opt.values[0] : p.title;
}

async function fetchJson(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok) return null;
    const txt = await r.text();
    if (txt.trim().startsWith("<")) return null;
    return JSON.parse(txt);
  } catch { return null; }
}

async function ingestBrand(b) {
  const out = [];
  const data = await fetchJson(`${b.base}/products.json?limit=250`);
  if (!data?.products) { console.log(`  ⚠ ${b.brand}: bulk JSON unavailable`); return out; }
  for (const p of data.products) {
    const cls = classify(p.product_type || "", p.title || "");
    if (!cls) continue;
    const slotKey = cls.slot === "anchor" ? "dress" : cls.slot;
    if (b.keep && !b.keep.includes(slotKey)) continue;
    const variant = (p.variants || [])[0];
    if (!variant) continue;
    const cents = Math.round(parseFloat(variant.price || "0") * 100);
    if (!cents || cents < 1500) continue;
    const img = (p.images || [])[0]?.src;
    if (!img || !/cdn\.shopify\.com|\.jpg|\.png|\.webp/i.test(img)) continue;
    const imgName = decodeURIComponent((img.split("/").pop() || "").replace(/[._-]/g, " "));
    const color = deriveColor(`${colorOptionValue(p)} ${p.title} ${imgName}`);
    const gender = deriveGender(b.gender, p.product_type || "", (p.tags || []).join(" "), p.title || "");
    const url = `${b.base}/products/${p.handle}`;
    // outerwear maps onto the 'top' slot for the scorer (layering piece), keeps category for display
    const slotId = cls.slot === "outerwear" ? "top" : cls.slot;
    out.push({
      id: `r_${b.brand.toLowerCase().replace(/[^a-z]/g, "")}_${p.id}`,
      title: p.title.replace(/\s+/g, " ").trim(), brand: b.brand, gender,
      category: cls.category, subcategory: null, canonicalUrl: url,
      imageUrls: (p.images || []).slice(0, 4).map((i) => i.src),
      inStock: (p.variants || []).some((v) => v.available !== false),
      offers: [{ network: "sovrn", merchant: b.brand, affiliateUrl: url, rawUrl: url, priceTier: priceTierOf(cents), priceSnapshot: cents, currency: "USD", inStock: true, commissionEst: 0.08, status: "active" }],
      slotRoles: [slotId],
      styling: {
        formality: cls.formality, dressCodes: [], color, pattern: patternOf(`${p.title} ${imgName}`), texture: [],
        silhouette: cls.volume, volume: cls.volume === "flowy" ? "regular" : cls.volume === "slim" ? "slim" : "regular",
        weight: cls.weight, seasons: seasonsOf(`${p.title} ${(p.tags || []).join(" ")}`), weather: [],
        brand: b.brand, brandTier: brandTierOf(cents), priceTier: priceTierOf(cents), slotRoles: [slotId],
      },
    });
  }
  console.log(`  ✓ ${b.brand}: ${out.length} usable`);
  return out;
}

const all = [];
for (const b of BRANDS) all.push(...(await ingestBrand(b)));
const seen = new Set();
const deduped = all.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));

const stats = {};
for (const p of deduped) {
  const k = `${p.gender}/${p.slotRoles[0]}`;
  stats[k] = (stats[k] || 0) + 1;
}
writeFileSync(OUT, JSON.stringify({ products: deduped, _meta: { source: "shopify-ingest", generated: "build-time", stats } }, null, 2));
console.log(`\nWrote ${deduped.length} real products → data/catalog-real.json`);
const byGender = {};
deduped.forEach((p) => (byGender[p.gender] = (byGender[p.gender] || 0) + 1));
console.log("By gender:", byGender);
console.log("By gender/slot:", stats);
