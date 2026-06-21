// data.ts — loads the seed catalog and enriches bundles for the UI. SERVER-ONLY. Zero-key:
// everything the site shows comes from data/seed-bundles.json + the deterministic scorer + offer
// resolver. Config is statically imported (bundled, serverless-safe) and overlaid with env vars,
// so production affiliate IDs come from Vercel env at build time. When set, outbound URLs are
// wrapped here before they ever reach the browser.
import "server-only";
import seed from "@/data/seed-bundles.json";
import seedReal from "@/data/seed-real.json";
import seedKits from "@/data/seed-kits.json";
import affiliateConfigJson from "@/data/affiliate-config.json";
import offerOverridesJson from "@/data/offer-overrides.json";
import bundleStateJson from "@/data/bundle-state.json";
import type {
  EnrichedBundle, EnrichedItem, Product, RawBundle, Offer,
} from "./types";
import { resolveBestOffer } from "./offers";
import { wrapAffiliate } from "./affiliate-wrap";
import { applyEnvOverlay } from "./affiliate-config";
import type { AffiliateConfig, OfferOverride } from "./affiliate-config";
import type { ScorableItem } from "./coherence";

// Catalog = REAL Shopify products (with real images, prices, affiliate URLs) + the original seed
// products (which power the non-fashion kits/collections/gifts). Bundles = real composed looks
// (published) + original kits/collections/gifts; the original placeholder LOOKS are hidden (draft).
const rawProducts = [
  ...(seedReal.products as unknown as Product[]),
  ...(seedKits.products as unknown as Product[]),
  ...(seed.products as unknown as Product[]),
];
const rawBundles: RawBundle[] = [
  ...(seedReal.bundles as unknown as RawBundle[]), // real composed looks
  ...(seedKits.bundles as unknown as RawBundle[]), // real kits (coffee/desk/gym/golf)
  // original seed bundles were placeholder imagery — archive them all (superseded by real data)
  ...(seed.bundles as unknown as RawBundle[]).map((b) => ({ ...b, state: "archived" } as RawBundle)),
];

// committed JSON (live-edited locally by the admin console) overlaid with env vars (production).
const CONFIG: AffiliateConfig = applyEnvOverlay(affiliateConfigJson as unknown as AffiliateConfig);
const OVERRIDES = offerOverridesJson as unknown as Record<string, OfferOverride>;
const BUNDLE_STATE = bundleStateJson as unknown as Record<string, string>;

// effective state = admin override (if any) else the seed state
function effectiveState(b: RawBundle): string {
  return BUNDLE_STATE[b.slug] ?? b.state;
}

// Apply admin overrides + wrap each offer's URL with the configured network IDs.
function applyConfig(p: Product): Product {
  const ov = OVERRIDES[p.id];
  let offers = p.offers.map((o) => ({
    ...o,
    status: ov?.status ?? o.status,
    inStock: ov?.inStock ?? o.inStock,
    affiliateUrl: wrapAffiliate(o.affiliateUrl, o.network, CONFIG),
  }));
  // a pasted direct/affiliate URL from the console wins (used verbatim, already a real link)
  if (ov?.affiliateUrl) {
    offers = [
      {
        network: ov.network ?? "direct",
        merchant: ov.merchant ?? p.brand,
        affiliateUrl: ov.affiliateUrl,
        rawUrl: p.canonicalUrl,
        priceTier: p.styling.priceTier,
        inStock: ov.inStock ?? p.inStock,
        status: ov.status ?? "active",
        commissionEst: 0.25,
      } as Offer,
      ...offers,
    ];
  }
  return { ...p, offers };
}

const products = rawProducts.map(applyConfig);
const PRODUCTS_BY_ID = new Map(products.map((p) => [p.id, p]));

export const AFFILIATE_CONFIG = CONFIG;

// Shoppable-pin coordinates by slot (% on a 16:10 hero). Fashion looks read as a figure;
// non-fashion kits read as a flat-lay grid (assigned by index below).
const FASHION_PINS: Record<string, { x: number; y: number }> = {
  anchor: { x: 49, y: 47 },
  top: { x: 49, y: 38 },
  bottom: { x: 49, y: 70 },
  shoes: { x: 45, y: 90 },
  bag: { x: 69, y: 62 },
  accessories: { x: 55, y: 22 },
};

function flatLayPin(index: number, total: number): { x: number; y: number } {
  // even grid across the frame for kit/flat-lay compositions
  const cols = Math.min(total, 3);
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = ((col + 0.5) / cols) * 100;
  const y = ((row + 0.5) / rows) * 88 + 6;
  return { x: Math.round(x), y: Math.round(y) };
}

const FASHION_CATEGORIES = new Set([
  "dress", "top", "bottom", "shoes", "bag", "accessories", "outerwear", "suit", "knitwear",
]);

function offerPrice(o: Offer | null): number | null {
  return o?.priceSnapshot ?? null;
}

export function enrichBundle(raw: RawBundle): EnrichedBundle {
  const total = raw.items.length;
  const isFashion =
    raw.type === "look" ||
    raw.items.some((i) => FASHION_CATEGORIES.has(PRODUCTS_BY_ID.get(i.productId)?.category ?? ""));

  const items: EnrichedItem[] = raw.items.map((it, index) => {
    const product = PRODUCTS_BY_ID.get(it.productId)!;
    const bestOffer = product ? resolveBestOffer(product) : null;
    const pin = isFashion
      ? FASHION_PINS[it.slotId] ?? flatLayPin(index, total)
      : flatLayPin(index, total);
    return {
      ...it,
      product,
      brand: product?.brand ?? "—",
      title: product?.title ?? it.productId,
      priceCents: offerPrice(bestOffer),
      swatch: product?.styling?.color?.primaryHex ?? "#555",
      image: product?.imageUrls?.find((u) => /^https?:\/\//.test(u)) ?? null,
      isHero: product?.id === raw.coherence?.heroItemId || product?.styling?.weight === "statement",
      pin,
      bestOffer,
    };
  });

  const dominantCategory = mode(items.map((i) => i.product?.category ?? "misc"));

  return {
    ...raw,
    items,
    totalLowCents: raw.estPriceLow,
    totalHighCents: raw.estPriceHigh,
    category: dominantCategory,
    isFashion,
  };
}

function mode(arr: string[]): string {
  const counts = new Map<string, number>();
  for (const a of arr) counts.set(a, (counts.get(a) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "misc";
}

// ---------- public accessors ----------
// Memoized — enriching 1000+ bundles is done once per process (config/state are build-time static).
let _allCache: EnrichedBundle[] | null = null;
export function getAllBundles(): EnrichedBundle[] {
  if (_allCache) return _allCache;
  _allCache = rawBundles
    .filter((b) => effectiveState(b) === "published")
    .map(enrichBundle);
  return _allCache;
}

// Admin view — every bundle with its effective state + computed quality-gate flags.
export interface AdminBundleRow {
  slug: string;
  type: string;
  title: string;
  state: string;
  coherence: number;
  gate: { coherence: boolean; images: boolean; linkHealth: boolean; originality: boolean; passed: boolean };
}
export function getAdminBundles(): AdminBundleRow[] {
  return rawBundles.map((b) => {
    const en = enrichBundle(b);
    const imagesOk = false; // seed images are flagged placeholders (data/_meta) — a human must replace
    const linkHealthOk = en.items.every((i) => i.bestOffer && i.bestOffer.status !== "dead");
    const coherenceOk = b.coherence.score >= 72 && b.coherence.passed;
    const originalityOk = true;
    return {
      slug: b.slug,
      type: b.type,
      title: b.title,
      state: effectiveState(b),
      coherence: b.coherence.score,
      gate: {
        coherence: coherenceOk,
        images: imagesOk,
        linkHealth: linkHealthOk,
        originality: originalityOk,
        passed: coherenceOk && linkHealthOk && originalityOk, // images intentionally gate human review
      },
    };
  });
}

export function getBundlesByType(type: RawBundle["type"]): EnrichedBundle[] {
  return getAllBundles().filter((b) => b.type === type);
}

// Strip the heavy per-item `product` before handing bundles to client components (the UI only needs
// image/swatch/brand/title/price/etc.). Keeps the client payload small at 1000+ looks.
export function toClientBundles(bs: EnrichedBundle[]): EnrichedBundle[] {
  return bs.map((b) => ({
    ...b,
    items: b.items.map(({ product, ...rest }) => rest),
  }));
}

export function getLooksForBrowse(): EnrichedBundle[] {
  return toClientBundles(getBundlesByType("look"));
}

// "You might also like" — same aesthetic + gender first, then same gender, then anything.
export function getRelatedLooks(slug: string, vibe?: string, gender?: string, n = 4): EnrichedBundle[] {
  const all = getBundlesByType("look").filter((b) => b.slug !== slug);
  const seenHero = new Set<string>();
  const pickDistinct = (list: EnrichedBundle[], out: EnrichedBundle[]) => {
    for (const b of list) {
      if (out.length >= n) break;
      const h = b.coherence.heroItemId || b.items[0]?.productId || b.slug;
      if (seenHero.has(h) || out.includes(b)) continue;
      seenHero.add(h); out.push(b);
    }
  };
  const out: EnrichedBundle[] = [];
  pickDistinct(all.filter((b) => b.brief.vibe === vibe && b.brief.gender === gender), out);
  pickDistinct(all.filter((b) => b.brief.gender === gender), out);
  pickDistinct(all, out);
  return toClientBundles(out.slice(0, n));
}

export function getBundleBySlug(slug: string): EnrichedBundle | null {
  const raw = rawBundles.find((b) => b.slug === slug);
  return raw ? enrichBundle(raw) : null;
}

// Public detail access: only published bundles are reachable (unless previewing from admin).
export function getPublicBundle(slug: string, preview = false): EnrichedBundle | null {
  const raw = rawBundles.find((b) => b.slug === slug);
  if (!raw) return null;
  if (!preview && effectiveState(raw) !== "published") return null;
  return enrichBundle(raw);
}

export function getAllProducts(): Product[] {
  return products;
}

// Slim, client-friendly product index for search (real, in-stock, image-bearing products only).
export interface SearchProduct {
  id: string; brand: string; title: string; category: string; gender: string;
  image: string; priceCents: number | null; url: string;
}
export function getSearchProducts(): SearchProduct[] {
  const out: SearchProduct[] = [];
  for (const p of products) {
    const img = p.imageUrls?.find((u) => /^https?:\/\//.test(u));
    if (!img || !p.inStock) continue;
    const o = resolveBestOffer(p);
    out.push({
      id: p.id, brand: p.brand, title: p.title, category: p.category,
      gender: (p as any).gender || "unisex", image: img,
      priceCents: o?.priceSnapshot ?? null, url: o?.affiliateUrl ?? p.canonicalUrl,
    });
  }
  return out;
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS_BY_ID.get(id);
}

// Map an enriched item to the scorer's ScorableItem (one brain, one shape).
export function toScorable(p: Product, slotId: string): ScorableItem {
  return {
    id: p.id,
    brand: p.brand,
    inStock: p.inStock,
    slotId,
    styling: {
      formality: p.styling.formality,
      color: {
        family: p.styling.color.family,
        role: p.styling.color.role,
        undertone: p.styling.color.undertone,
      },
      weight: p.styling.weight,
      volume: p.styling.volume,
      seasons: p.styling.seasons,
      pattern: p.styling.pattern,
      brandTier: p.styling.brandTier,
    },
  };
}

export const SEED_META = (seed as any)._meta;
