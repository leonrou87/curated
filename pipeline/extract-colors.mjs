// extract-colors.mjs — sample the real garment color from each product image (center crop, ignore
// white/black studio background) and rewrite styling.color accurately. Fixes mislabeled palettes.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, "..", "data", "catalog-real.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const data = JSON.parse(readFileSync(FILE, "utf8"));

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}
const toHex = (r, g, b) => "#" + [r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")).join("");

function classify(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  const hex = toHex(r, g, b);
  const warm = h >= 18 && h <= 65;
  // neutral: low chroma OR very light/dark — classify by lightness (+ warm tint → cream/beige/tan)
  if (s < 0.2 || l > 0.86 || l < 0.12) {
    let family;
    if (l < 0.15) family = "black";
    else if (l < 0.32) family = "charcoal";
    else if (l < 0.58) family = warm && s > 0.1 ? "brown" : "grey";
    else if (l < 0.74) family = warm ? "tan" : "grey";
    else if (l < 0.86) family = warm ? "beige" : "grey";
    else family = warm && s > 0.05 ? "cream" : "white";
    const ut = warm && s > 0.08 ? "warm" : "neutral";
    return { primaryHex: hex, family, undertone: ut, role: "neutral", value: Math.round(l * 100), chroma: Math.round(s * 100) };
  }
  // brown / olive / camel — warm low-light or low-sat warm hues
  if (h >= 20 && h <= 50 && l < 0.45) return col(hex, "brown", "warm", "accent", l, s);
  if (h >= 20 && h <= 50 && l < 0.65 && s < 0.5) return col(hex, "tan", "warm", "neutral", l, s);
  if (h >= 50 && h <= 90 && l < 0.5 && s < 0.6) return col(hex, "olive", "warm", "statement", l, s);
  let family, undertone, role = s > 0.45 ? "statement" : "accent";
  if (h < 15 || h >= 345) { family = l < 0.35 ? "burgundy" : "red"; undertone = "warm"; }
  else if (h < 45) { family = "orange"; undertone = "warm"; }
  else if (h < 70) { family = "yellow"; undertone = "warm"; }
  else if (h < 160) { family = "green"; undertone = "cool"; }
  else if (h < 195) { family = "teal"; undertone = "cool"; }
  else if (h < 255) { family = l < 0.32 ? "navy" : "blue"; undertone = "cool"; if (family === "navy") role = "neutral"; }
  else if (h < 295) { family = "purple"; undertone = "cool"; }
  else { family = "pink"; undertone = "warm"; }
  return col(hex, family, undertone, role, l, s);
}
const col = (primaryHex, family, undertone, role, l, s) => ({ primaryHex, family, undertone, role, value: Math.round(l * 100), chroma: Math.round(s * 100) });

// is this pixel likely human skin? (excludes faces/arms/legs in worn-garment shots)
function isSkin(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  return h >= 5 && h <= 45 && s >= 0.18 && s <= 0.68 && l >= 0.4 && l <= 0.86 && r > g && g > b;
}
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
async function dominant(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error("http " + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  const W = 64;
  const { data: px, info } = await sharp(buf, { failOn: "none" }).rotate()
    .resize(W, W, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels, w = info.width, h = info.height;
  const at = (x, y) => { const i = (y * w + x) * ch; return [px[i], px[i + 1], px[i + 2]]; };
  // estimate background from the four corners
  const corners = [];
  for (let dy = 0; dy < 5; dy++) for (let dx = 0; dx < 5; dx++) {
    corners.push(at(dx, dy), at(w - 1 - dx, dy), at(dx, h - 1 - dy), at(w - 1 - dx, h - 1 - dy));
  }
  const bg = corners.reduce((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0]).map((v) => v / corners.length);
  // mode of quantized colors, excluding background, skin and near-black
  const Q = 26, buckets = new Map();
  for (let i = 0; i < px.length; i += ch) {
    const R = px[i], G = px[i + 1], B = px[i + 2];
    if (dist([R, G, B], bg) < 46) continue;       // background
    if (R < 16 && G < 16 && B < 16) continue;       // void
    if (isSkin(R, G, B)) continue;                  // model skin
    const key = `${Math.round(R / Q)}|${Math.round(G / Q)}|${Math.round(B / Q)}`;
    let e = buckets.get(key);
    if (!e) { e = { r: 0, g: 0, b: 0, n: 0 }; buckets.set(key, e); }
    e.r += R; e.g += G; e.b += B; e.n++;
  }
  let best = null;
  for (const e of buckets.values()) if (!best || e.n > best.n) best = e;
  if (!best || best.n < 6) return classify(bg[0], bg[1], bg[2]); // garment ~= background tone
  return classify(best.r / best.n, best.g / best.n, best.b / best.n);
}

const products = data.products;
let done = 0, failed = 0;
const CONC = 14;
async function worker(slice) {
  for (const p of slice) {
    try {
      const c = await dominant(p.imageUrls[0]);
      p.styling.color = { ...p.styling.color, ...c };
    } catch { failed++; }
    if (++done % 150 === 0) console.log(`  ${done}/${products.length}…`);
  }
}
const chunks = Array.from({ length: CONC }, (_, k) => products.filter((_, i) => i % CONC === k));
await Promise.all(chunks.map(worker));

writeFileSync(FILE, JSON.stringify(data, null, 2));
const fams = {};
products.forEach((p) => (fams[p.styling.color.family] = (fams[p.styling.color.family] || 0) + 1));
console.log(`\nRe-colored ${products.length - failed}/${products.length} products (${failed} failed).`);
console.log("Families:", Object.entries(fams).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join("  "));
