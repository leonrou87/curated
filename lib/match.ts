import type { EnrichedBundle } from "./types";
import { AESTHETICS } from "./aesthetics";
import type { Taste } from "./useTaste";

// Smarter, zero-key NL styling. Parses intent (gender, budget, aesthetic, occasion, color) from the
// brief, ranks the catalog, and personalizes with the user's taste profile (memory). The LLM path
// would only refine this — the demo works fully offline.
const STOP = new Set(["a", "an", "the", "for", "to", "with", "in", "of", "and", "me", "my", "i", "im", "need", "want", "dress", "outfit", "look", "looks", "something", "wear", "size", "no", "but", "that", "this", "some", "please", "im", "am", "is", "are", "going"]);

const COLOR_WORDS = ["black", "white", "navy", "blue", "green", "olive", "beige", "cream", "tan", "brown", "grey", "gray", "pink", "red", "burgundy", "orange", "rust", "camel", "charcoal", "purple", "yellow", "gold"];

export interface MatchIntent {
  gender: "men" | "women" | null;
  budget: "budget" | "premium" | null;
  aesthetic: string | null;
  colors: string[];
  tokens: string[];
}

export function parseIntent(query: string): MatchIntent {
  const q = query.toLowerCase();
  const gender = /\b(men|man|male|guy|him|his|masculine|menswear)\b/.test(q) ? "men" : /\b(women|woman|female|her|she|feminine|womens|ladies)\b/.test(q) ? "women" : null;
  const budget = /\b(under \$?\d+|budget|cheap|affordable|inexpensive|on a budget|low.?cost)\b/.test(q) ? "budget" : /\b(luxury|premium|splurge|high.?end|designer|expensive|investment)\b/.test(q) ? "premium" : null;
  let aesthetic: string | null = null;
  for (const a of Object.values(AESTHETICS)) {
    if (q.includes(a.key.replace(/-/g, " ")) || q.includes(a.name.toLowerCase())) { aesthetic = a.key; break; }
  }
  const colors = COLOR_WORDS.filter((c) => q.includes(c));
  const tokens = q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t));
  return { gender, budget, aesthetic, colors, tokens };
}

const hayOf = (b: EnrichedBundle) =>
  [b.title, b.brief.vibe, b.brief.occasion, b.brief.gender, b.brief.season, AESTHETICS[String(b.brief.vibe)]?.name, ...b.items.map((i) => `${i.brand} ${i.title}`)]
    .join(" ").toLowerCase();

export function rankLooks(query: string, bundles: EnrichedBundle[], taste?: Taste): EnrichedBundle[] {
  const intent = parseIntent(query);
  let pool = bundles;
  if (intent.gender) pool = pool.filter((b) => b.brief.gender === intent.gender || b.brief.gender === "unisex");

  if (!intent.tokens.length && !intent.aesthetic && !intent.colors.length) {
    // no strong signal — surface taste-led or featured looks
    return [...pool].sort((a, b) => tasteBoost(b, taste) - tasteBoost(a, taste)).slice(0, 12);
  }

  const scored = pool.map((b) => {
    const hay = hayOf(b);
    let s = 0;
    if (intent.aesthetic && String(b.brief.vibe) === intent.aesthetic) s += 6;
    if (intent.budget && b.brief.budgetTier === intent.budget) s += 3;
    for (const c of intent.colors) if (hay.includes(c)) s += 2;
    for (const t of intent.tokens) if (hay.includes(t)) s += 2; else if (t.length > 4 && hay.includes(t.slice(0, 4))) s += 0.5;
    s += tasteBoost(b, taste);
    return { b, s };
  });
  return scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.b);
}

function tasteBoost(b: EnrichedBundle, taste?: Taste): number {
  if (!taste?.scores) return 0;
  return (taste.scores[String(b.brief.vibe)] || 0) * 0.4;
}

// Recent prompts as lightweight memory.
const RECENT_KEY = "curated-recent-prompts";
export function rememberPrompt(q: string) {
  if (typeof window === "undefined") return;
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const next = [q, ...prev.filter((p) => p !== q)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}
export function recentPrompts(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
