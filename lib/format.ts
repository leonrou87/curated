// presentation helpers
// Deterministic thousands separator — toLocaleString() differs between Node (SSR) and the browser,
// which causes hydration mismatches. This is identical on both.
export const fmtNum = (n: number): string =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const fmtCents = (c: number | null | undefined): string =>
  c == null ? "—" : "$" + fmtNum(Math.round(c / 100));

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
