import type { EnrichedBundle } from "./types";
import { fmtRange } from "./format";

// Build the dynamic OG image URL for a bundle (relative — resolved via metadataBase).
export function lookOgUrl(b: EnrichedBundle): string {
  const cols = b.items.map((i) => i.swatch).slice(0, 5).join(",");
  const p = new URLSearchParams({
    type: "look",
    t: b.title,
    a: String(b.brief.vibe || ""),
    g: String(b.brief.gender || ""),
    price: fmtRange(b.totalLowCents, b.totalHighCents),
    coh: b.coherence.score.toFixed(0),
    c: cols,
  });
  return `/og?${p.toString()}`;
}

export function dnaOgUrl(top: { key: string; pct: number }[]): string {
  const p = new URLSearchParams({ type: "dna" });
  top.slice(0, 3).forEach((t, i) => {
    p.set(`a${i + 1}`, t.key);
    p.set(`p${i + 1}`, String(t.pct));
  });
  return `/og?${p.toString()}`;
}
