import type { EnrichedBundle } from "./types";

// Zero-key NL "styling": deterministic keyword scoring of a free-text brief against bundles.
// The LLM path (llm.propose) would only UPGRADE this — the demo must work with no keys.
const STOP = new Set(["a", "an", "the", "for", "to", "with", "in", "of", "and", "me", "my", "i", "im", "need", "want", "dress", "outfit", "look", "something", "wear", "size", "no"]);

export function matchBundles(query: string, bundles: EnrichedBundle[]): EnrichedBundle[] {
  const tokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t));
  if (!tokens.length) return bundles.slice(0, 6);

  const scored = bundles.map((b) => {
    const hay = [
      b.title,
      b.curatorNote,
      b.coherence.scheme,
      ...Object.values(b.brief).map((v) => String(v)),
      ...b.items.map((i) => `${i.brand} ${i.title} ${i.product?.category}`),
    ]
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 2;
      // soft stem match
      else if (t.length > 4 && hay.includes(t.slice(0, 4))) score += 1;
    }
    // gentle boost for explicit brief facet hits
    for (const v of Object.values(b.brief)) {
      const s = String(v).toLowerCase();
      if (tokens.some((t) => s.includes(t))) score += 1.5;
    }
    return { b, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.b);
}
