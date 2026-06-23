import type { SearchProduct } from "./data";

// Gift guides — curated, shoppable product edits (a gift is usually one piece or a kit, not a full
// outfit). Defined as filters over the real product index, so they recompute as the catalog grows.
export interface GiftGuide {
  slug: string;
  title: string;
  kicker: string;
  blurb: string;
  accent: string;
  kit?: string; // if set, this guide is a kit (links to /kits/<slug>)
  match?: (p: SearchProduct) => boolean;
  sort?: (a: SearchProduct, b: SearchProduct) => number;
}

const cat = (p: SearchProduct) => p.category;
const cents = (p: SearchProduct) => p.priceCents ?? 999999;
const ACCESSORY = new Set(["jewelry", "accessories", "bag"]);

export const GIFT_GUIDES: GiftGuide[] = [
  { slug: "under-100", title: "Under $100", kicker: "Thoughtful, not pricey", accent: "#6E9A78",
    blurb: "Small, considered pieces that punch above their price — jewelry, accessories and easy wins.",
    match: (p) => cents(p) <= 10000 && (ACCESSORY.has(cat(p)) || cents(p) >= 3000),
    sort: (a, b) => cents(b) - cents(a) },
  { slug: "under-250", title: "Under $250", kicker: "The sweet spot", accent: "#88A4B8",
    blurb: "Gifts that feel generous without going overboard — leather, fine-ish jewelry, the good basics.",
    match: (p) => cents(p) > 10000 && cents(p) <= 25000, sort: (a, b) => cents(a) - cents(b) },
  { slug: "the-splurge", title: "The Splurge", kicker: "Go big", accent: "#9C8B6E",
    blurb: "Investment pieces and proper treats — the gift they'd never buy themselves.",
    match: (p) => cents(p) > 25000, sort: (a, b) => cents(a) - cents(b) },
  { slug: "for-her", title: "For Her", kicker: "She'll actually wear it", accent: "#D7A2A8",
    blurb: "Jewelry, bags and accessories that finish any look — easy to give, easy to love.",
    match: (p) => (p.gender === "women" || p.gender === "unisex") && ACCESSORY.has(cat(p)), sort: (a, b) => cents(a) - cents(b) },
  { slug: "for-him", title: "For Him", kicker: "Beyond another tie", accent: "#5E6B4E",
    blurb: "Bags, belts and the small upgrades that quietly elevate his everyday.",
    match: (p) => p.gender === "men" && (ACCESSORY.has(cat(p)) || cat(p) === "shoes"), sort: (a, b) => cents(a) - cents(b) },
  { slug: "fine-jewelry", title: "The Jewelry Edit", kicker: "Always a yes", accent: "#C8A951",
    blurb: "Gold, pearls and everyday fine pieces — the gift that never misses.",
    match: (p) => cat(p) === "jewelry", sort: (a, b) => cents(a) - cents(b) },
];

// kit-based guides (link to the kit detail pages)
export const GIFT_KITS = [
  { slug: "coffee-kit-real", title: "The Coffee Lover", kicker: "Home barista", accent: "#8A4B2A" },
  { slug: "desk-kit-real", title: "The Desk Refresh", kicker: "Work, upgraded", accent: "#5A3F2B" },
  { slug: "gym-kit-real", title: "The Home Gym", kicker: "No excuses", accent: "#3A4A5E" },
  { slug: "golf-kit-real", title: "The New Golfer", kicker: "First tee", accent: "#3F6B4E" },
];

export const guideBySlug = (slug: string) => GIFT_GUIDES.find((g) => g.slug === slug);
