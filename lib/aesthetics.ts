// Shared aesthetic metadata — names, one-liners, and an accent color per trend. Used by the quiz,
// /trends pages, look cards, and the dynamic OG image. One source of truth.
export interface Aesthetic {
  key: string;
  name: string;
  tagline: string;
  blurb: string;
  accent: string; // hex used as the aesthetic's signature color
}

export const AESTHETICS: Record<string, Aesthetic> = {
  "quiet-luxury": { key: "quiet-luxury", name: "Quiet Luxury", tagline: "Stealth wealth, zero logos", blurb: "Refined without trying — tonal neutrals, elevated fabrics, and nothing loud. The whole point is that you can't tell what anything costs.", accent: "#9C8B6E" },
  "old-money": { key: "old-money", name: "Old Money", tagline: "Heritage polish", blurb: "Muted palette, considered tailoring, quiet confidence over labels. Looks inherited, not bought.", accent: "#5E6B4E" },
  "clean-girl": { key: "clean-girl", name: "Clean Girl", tagline: "Slept-in but pulled-together", blurb: "Minimal pieces, glowy neutrals, zero clutter. Effortless on purpose.", accent: "#D8C3A5" },
  coastal: { key: "coastal", name: "Coastal", tagline: "Linen-soft golden hour", blurb: "Breezy linen and easy shapes built for the water and the walk home.", accent: "#88A4B8" },
  "office-siren": { key: "office-siren", name: "Office Siren", tagline: "Power dressing, modernized", blurb: "Sharp, deliberate tailoring with a magnetic edge. Boardroom with intent.", accent: "#7A2E2E" },
  "tomato-girl": { key: "tomato-girl", name: "Tomato Girl", tagline: "Mediterranean summer", blurb: "Sun-warmed, relaxed shapes in ripe, juicy tones. A holiday you can wear.", accent: "#B6402F" },
  "mob-wife": { key: "mob-wife", name: "Mob Wife", tagline: "Unapologetic glamour", blurb: "Rich darks, bold volume, statement attitude. More is more.", accent: "#2A2A2C" },
  coquette: { key: "coquette", name: "Coquette", tagline: "Soft and romantic", blurb: "Delicate details and a little flirtation — pretty, never fussy.", accent: "#D7A2A8" },
  minimalist: { key: "minimalist", name: "Minimalist", tagline: "Quiet, exact, intentional", blurb: "A few perfect pieces doing all the work. Nothing extra.", accent: "#8B8A86" },
  "all-black": { key: "all-black", name: "All Black", tagline: "All black, done right", blurb: "The interest is in texture and proportion, not color. Endlessly chic.", accent: "#1A1A1A" },
  "off-duty": { key: "off-duty", name: "Off-Duty", tagline: "Considered, under budget", blurb: "Easy pieces that look thought-through without trying — and stay affordable.", accent: "#6E7A6E" },
  boho: { key: "boho", name: "Festival Boho", tagline: "Free-spirited layers", blurb: "Earthy tones and easy layers for the festival and the after.", accent: "#9E6B3E" },
  blokecore: { key: "blokecore", name: "Blokecore", tagline: "Terrace-casual", blurb: "Sport-adjacent staples worn with off-hand confidence. Match-day energy.", accent: "#3E5C86" },
  gorpcore: { key: "gorpcore", name: "Gorpcore", tagline: "Trail-ready, city-styled", blurb: "Technical, tonal, unbothered — function as a flex.", accent: "#5A6B3A" },
  "modern-classic": { key: "modern-classic", name: "Modern Classic", tagline: "Timeless, slightly relaxed", blurb: "Office tailoring with a modern cut. Never dated, never trying.", accent: "#3A4A5E" },
  "eclectic-grandpa": { key: "eclectic-grandpa", name: "Eclectic Grandpa", tagline: "Thrifted-feeling layers", blurb: "Cozy, lived-in pieces with a wink of pattern. Charming, never costume.", accent: "#8A6A3A" },
};

export const aestheticOf = (key?: string): Aesthetic =>
  (key && AESTHETICS[key]) || { key: key || "curated", name: key ? key.replace(/-/g, " ") : "Curated", tagline: "", blurb: "", accent: "#C8612F" };
