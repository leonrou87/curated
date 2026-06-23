import type { EnrichedBundle } from "./types";

// Editorial "edits" — curated cross-cutting collections defined as filters over the look catalog
// (no extra data; they recompute as the catalog grows). Each is a shoppable magazine feature.
export interface CollectionDef {
  slug: string;
  title: string;
  kicker: string;
  blurb: string;
  accent: string;
  match: (b: EnrichedBundle) => boolean;
}

const vibe = (b: EnrichedBundle) => String(b.brief.vibe || "");
const occ = (b: EnrichedBundle) => String(b.brief.occasion || "");

export const COLLECTIONS: CollectionDef[] = [
  { slug: "wedding-season", title: "Wedding Season", kicker: "Guest-ready", accent: "#9C8B6E",
    blurb: "Every invite on the calendar, sorted. Polished, photo-ready looks for the ceremony, the cocktail hour, and the dance floor.",
    match: (b) => occ(b) === "wedding-guest" || occ(b) === "event" || vibe(b) === "quiet-luxury" || vibe(b) === "old-money" },
  { slug: "the-vacation-edit", title: "The Vacation Edit", kicker: "Out of office", accent: "#88A4B8",
    blurb: "Linen, ease, and golden-hour color. Everything you'd pack for somewhere warmer — and the walk home from the water.",
    match: (b) => b.brief.season === "summer" || vibe(b) === "coastal" || vibe(b) === "tomato-girl" || occ(b) === "vacation" },
  { slug: "the-workwear-edit", title: "The Workwear Edit", kicker: "Desk to dinner", accent: "#3A4A5E",
    blurb: "Sharp, deliberate, and never stuffy. Office-ready tailoring with enough edge to carry into the evening.",
    match: (b) => occ(b) === "work" || vibe(b) === "office-siren" || vibe(b) === "modern-classic" },
  { slug: "date-night", title: "Date Night", kicker: "After dark", accent: "#7A2E2E",
    blurb: "A little intent, a little romance. Looks that read confident across the table without trying too hard.",
    match: (b) => occ(b) === "evening" || occ(b) === "dinner" || vibe(b) === "coquette" || vibe(b) === "mob-wife" },
  { slug: "monochrome", title: "Monochrome", kicker: "One color, done right", accent: "#1A1A1A",
    blurb: "All black, or all one tone — where the whole story is texture and proportion. Endlessly chic, impossible to get wrong.",
    match: (b) => vibe(b) === "all-black" || vibe(b) === "minimalist" },
  { slug: "quiet-luxury", title: "The Quiet Luxury Capsule", kicker: "Stealth wealth", accent: "#9C8B6E",
    blurb: "Tonal, elevated, and free of logos — pieces that look expensive because they're *considered*, not loud.",
    match: (b) => vibe(b) === "quiet-luxury" || vibe(b) === "old-money" || (vibe(b) === "clean-girl" && b.brief.budgetTier === "premium") },
  { slug: "the-weekend-uniform", title: "The Weekend Uniform", kicker: "Off duty", accent: "#6E7A6E",
    blurb: "The easy stuff that still looks considered. Errands, brunch, and doing nothing at all — in something good.",
    match: (b) => occ(b) === "weekend" || occ(b) === "brunch" || vibe(b) === "off-duty" || vibe(b) === "blokecore" },
  { slug: "the-mens-edit", title: "The Men's Edit", kicker: "For him", accent: "#5E6B4E",
    blurb: "Considered menswear from heritage tailoring to off-duty ease — complete outfits, not a wall of products.",
    match: (b) => b.brief.gender === "men" },
];

export const collectionBySlug = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);
