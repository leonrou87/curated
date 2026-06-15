// presentation helpers
export const fmtCents = (c: number | null | undefined): string =>
  c == null ? "—" : "$" + Math.round(c / 100).toLocaleString();

export const fmtRange = (lo: number, hi: number): string =>
  lo === hi ? fmtCents(lo) : `${fmtCents(lo)}–${fmtCents(hi)}`;

export const tierGlyph = (tier?: string): string =>
  tier === "premium" ? "$$$" : tier === "mid" ? "$$" : "$";

export const titleCase = (s: string): string =>
  s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// score → coherence color across danger → warning → positive (0 / 72 / 100)
export function scoreColor(score: number): string {
  if (score >= 85) return "var(--positive)";
  if (score >= 72) return "var(--warning)";
  return "var(--danger)";
}
