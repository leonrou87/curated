import type { EnrichedBundle } from "./types";
import { AESTHETICS } from "./aesthetics";
import type { Taste } from "./useTaste";

// Smarter, zero-key NL styling. Parses intent (gender, budget, aesthetic, occasion, color) from the
// brief, ranks the catalog, and personalizes with the user's taste profile (memory). The LLM path
// would only refine this — the demo works fully offline.
const STOP = new Set(["a", "an", "the", "for", "to", "with", "in", "of", "and", "me", "my", "i", "im", "need", "want", "dress", "outfit", "look", "looks", "something", "wear", "size", "no", "but", "that", "this", "some", "please", "im", "am", "is", "are", "going"]);

const COLOR_WORDS = ["black", "white", "navy", "blue", "green", "olive", "beige", "cream", "tan", "brown", "grey", "gray", "pink", "red", "burgundy", "orange", "rust", "camel", "charcoal", "purple", "yellow", "gold"];

// Intent dictionary — maps the kinds of things people actually search for (occasions, moods, events,
// dress codes, weather, life moments) onto the underlying aesthetic / occasion / season / formality.
// This is what makes "funeral", "job interview", "beach club", "first date" return great looks.
interface IntentHint { aesthetic?: string; occasion?: string; season?: string; formality?: number; budget?: "budget" | "premium" }
const INTENT: { match: string[]; hint: IntentHint }[] = [
  // —— formal events / dress codes ——
  { match: ["wedding guest", "wedding", "as a wedding"], hint: { occasion: "wedding-guest", formality: 4 } },
  { match: ["black tie", "formal event", "gala", "fundraiser", "opera"], hint: { aesthetic: "old-money", formality: 4, occasion: "evening" } },
  { match: ["cocktail party", "cocktail", "garden party"], hint: { aesthetic: "quiet-luxury", formality: 4, occasion: "evening" } },
  { match: ["funeral", "memorial", "respectful", "mourning"], hint: { aesthetic: "all-black", formality: 4 } },
  { match: ["graduation", "commencement"], hint: { aesthetic: "clean-girl", formality: 3, occasion: "event" } },
  { match: ["baptism", "christening", "communion", "church"], hint: { aesthetic: "old-money", formality: 4 } },
  // —— work ——
  { match: ["job interview", "interview", "new job", "first day", "office", "work meeting", "boardroom", "presentation", "career"], hint: { aesthetic: "office-siren", occasion: "work", formality: 4 } },
  { match: ["work from home", "wfh", "zoom", "home office"], hint: { aesthetic: "minimalist", occasion: "everyday", formality: 3 } },
  { match: ["business casual", "smart casual", "smart office", "client meeting"], hint: { aesthetic: "modern-classic", occasion: "work", formality: 4 } },
  // —— dates / night out ——
  { match: ["first date", "date night", "date", "anniversary", "romantic dinner"], hint: { aesthetic: "coquette", occasion: "evening", formality: 3 } },
  { match: ["dinner party", "dinner", "supper club", "restaurant"], hint: { aesthetic: "quiet-luxury", occasion: "dinner", formality: 3 } },
  { match: ["night out", "club", "bar", "going out", "drinks", "nye", "new years", "new year", "birthday party"], hint: { aesthetic: "mob-wife", occasion: "evening", formality: 4 } },
  { match: ["holiday party", "office party", "christmas party"], hint: { aesthetic: "mob-wife", occasion: "evening", formality: 4 } },
  // —— vacation / weather ——
  { match: ["beach", "beach club", "resort", "vacation", "holiday", "honeymoon", "tropical", "cruise", "poolside", "amalfi", "italy", "greece", "mediterranean"], hint: { aesthetic: "coastal", occasion: "vacation", season: "summer", formality: 2 } },
  { match: ["tomato girl", "italian summer", "riviera"], hint: { aesthetic: "tomato-girl", season: "summer", formality: 2 } },
  { match: ["hot weather", "heatwave", "summer", "warm weather"], hint: { season: "summer", formality: 2 } },
  { match: ["cold weather", "winter", "fall", "autumn", "layering", "cozy"], hint: { season: "fall", aesthetic: "eclectic-grandpa" } },
  { match: ["ski", "apres ski", "mountain", "cabin", "snow"], hint: { aesthetic: "gorpcore", season: "fall" } },
  // —— casual / lifestyle ——
  { match: ["brunch", "coffee run", "errands", "farmers market", "casual"], hint: { aesthetic: "clean-girl", occasion: "brunch", formality: 2 } },
  { match: ["weekend", "off duty", "off-duty", "lazy sunday", "lounge", "running around"], hint: { aesthetic: "off-duty", occasion: "weekend", formality: 2 } },
  { match: ["festival", "concert", "coachella", "rave"], hint: { aesthetic: "boho", season: "summer", formality: 2 } },
  { match: ["gym", "athleisure", "pilates", "workout", "yoga", "tennis", "court"], hint: { aesthetic: "blokecore", formality: 2 } },
  { match: ["travel", "airport", "flight", "long haul"], hint: { aesthetic: "minimalist", formality: 2 } },
  { match: ["gallery", "museum", "art opening", "creative"], hint: { aesthetic: "minimalist", formality: 3 } },
  // —— moods / palettes ——
  { match: ["all black", "head to toe black", "monochrome black"], hint: { aesthetic: "all-black", formality: 3 } },
  { match: ["quiet luxury", "stealth wealth", "understated", "elevated basics"], hint: { aesthetic: "quiet-luxury", formality: 3, budget: "premium" } },
  { match: ["old money", "ivy", "preppy", "heritage", "tailored"], hint: { aesthetic: "old-money", formality: 4 } },
  { match: ["minimal", "minimalist", "clean", "simple", "capsule", "scandi"], hint: { aesthetic: "minimalist", formality: 3 } },
  { match: ["earthy", "neutral tones", "tonal", "beige", "camel", "warm neutrals"], hint: { aesthetic: "clean-girl", formality: 3 } },
  { match: ["effortless", "looks expensive", "put together", "polished"], hint: { aesthetic: "quiet-luxury", formality: 3 } },
  { match: ["edgy", "cool", "downtown", "streetwear"], hint: { aesthetic: "blokecore", formality: 2 } },
  { match: ["soft", "feminine", "pretty", "romantic", "girly"], hint: { aesthetic: "coquette", formality: 3 } },
];

export interface MatchIntent {
  gender: "men" | "women" | null;
  budget: "budget" | "premium" | null;
  aesthetic: string | null;
  occasion: string | null;
  season: string | null;
  formality: number | null;
  colors: string[];
  tokens: string[];
}

export function parseIntent(query: string): MatchIntent {
  const q = query.toLowerCase();
  const gender = /\b(men|man|male|guy|him|his|masculine|menswear|husband|boyfriend)\b/.test(q) ? "men" : /\b(women|woman|female|her|she|feminine|womens|ladies|girl|wife|girlfriend)\b/.test(q) ? "women" : null;
  let budget: MatchIntent["budget"] = /\b(under \$?\d+|budget|cheap|affordable|inexpensive|on a budget|low.?cost|save)\b/.test(q) ? "budget" : /\b(luxury|premium|splurge|high.?end|designer|expensive|investment|treat)\b/.test(q) ? "premium" : null;

  // intent dictionary (longest phrase wins for specificity)
  let aesthetic: string | null = null, occasion: string | null = null, season: string | null = null, formality: number | null = null;
  const hits = INTENT.filter((e) => e.match.some((m) => q.includes(m))).sort((a, b) => Math.max(...b.match.map((m) => m.length)) - Math.max(...a.match.map((m) => m.length)));
  for (const h of hits) {
    aesthetic ??= h.hint.aesthetic ?? null;
    occasion ??= h.hint.occasion ?? null;
    season ??= h.hint.season ?? null;
    formality ??= h.hint.formality ?? null;
    budget ??= h.hint.budget ?? null;
  }
  // explicit aesthetic name in the query overrides
  for (const a of Object.values(AESTHETICS)) {
    if (q.includes(a.key.replace(/-/g, " ")) || q.includes(a.name.toLowerCase())) { aesthetic = a.key; break; }
  }

  const colors = COLOR_WORDS.filter((c) => q.includes(c));
  const tokens = q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t));
  return { gender, budget, aesthetic, occasion, season, formality, colors, tokens };
}

const hayOf = (b: EnrichedBundle) =>
  [b.title, b.brief.vibe, b.brief.occasion, b.brief.gender, b.brief.season, AESTHETICS[String(b.brief.vibe)]?.name, ...b.items.map((i) => `${i.brand} ${i.title}`)]
    .join(" ").toLowerCase();

export function rankLooks(query: string, bundles: EnrichedBundle[], taste?: Taste): EnrichedBundle[] {
  const intent = parseIntent(query);
  let pool = bundles;
  if (intent.gender) pool = pool.filter((b) => b.brief.gender === intent.gender || b.brief.gender === "unisex");

  const hasSignal = intent.tokens.length || intent.aesthetic || intent.colors.length || intent.occasion || intent.season || intent.formality != null || intent.budget;
  if (!hasSignal) {
    return [...pool].sort((a, b) => tasteBoost(b, taste) - tasteBoost(a, taste)).slice(0, 12);
  }

  const scored = pool.map((b) => {
    const hay = hayOf(b);
    let s = 0;
    if (intent.aesthetic && String(b.brief.vibe) === intent.aesthetic) s += 6;
    if (intent.occasion && String(b.brief.occasion) === intent.occasion) s += 4;
    if (intent.season && intent.season !== "all" && b.brief.season === intent.season) s += 2;
    if (intent.formality != null) s += Math.max(0, 2 - Math.abs((b.brief.targetFormality ?? 3) - intent.formality)); // closer formality scores higher
    if (intent.budget && b.brief.budgetTier === intent.budget) s += 3;
    for (const c of intent.colors) if (hay.includes(c)) s += 2;
    for (const t of intent.tokens) if (hay.includes(t)) s += 2; else if (t.length > 4 && hay.includes(t.slice(0, 4))) s += 0.5;
    s += tasteBoost(b, taste);
    return { b, s };
  });
  const ranked = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.b);
  // if the dictionary matched but nothing scored on tokens, still return aesthetic/occasion matches
  return ranked.length ? ranked : [...pool].sort((a, b) => tasteBoost(b, taste) - tasteBoost(a, taste)).slice(0, 8);
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
