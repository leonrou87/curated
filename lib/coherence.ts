// coherence.ts — the ONE coherence brain (TS port of scripts/scorer.js, COHERENCE-ENGINE.md
// fashion RuleSet). Pure + deterministic. Imported by the live builder AND (conceptually) the
// pipeline. Never fork this logic.
import type { Brief, CoherenceResult } from "./types";

const HUE: Record<string, number> = {
  red: 0, orange: 30, yellow: 60, green: 120, teal: 170, blue: 220,
  navy: 225, purple: 280, pink: 330, burgundy: 350,
};
const NEUTRAL_FAMILIES = new Set([
  "black", "white", "grey", "gray", "beige", "navy", "olive", "brown",
  "cream", "tan", "charcoal", "camel",
]);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
function hueDistance(a: number | null, b: number | null) {
  if (a == null || b == null) return 0;
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

const WEIGHTS: Record<string, number> = {
  R1: 0.22, R2: 0.22, R3: 0.16, R4: 0.1, R5: 0.12, R6: 0.1, R7: 0.05, R8: 0.03,
};
export const THRESHOLD = 72;

// The minimal item shape the scorer needs.
export interface ScorableItem {
  id: string;
  brand: string;
  inStock: boolean;
  slotId: string;
  styling: {
    formality: number;
    color: { family: string; role: string; undertone: string };
    weight: string;
    volume: string;
    seasons: string[];
    pattern: string;
    brandTier: number;
  };
}

export interface Profile {
  colorDislikes?: string[];
  brandsAvoided?: string[];
}

export function scoreComposition(
  items: ScorableItem[],
  brief: Brief = {},
  profile: Profile = {}
): CoherenceResult {
  const hard: string[] = [];
  if (!items.length) {
    return { score: 0, passed: false, hardViolations: ["H0 empty"], ruleScores: {}, scheme: "—", heroItemId: null };
  }

  for (const it of items) {
    if (profile.colorDislikes?.includes(it.styling.color.family)) hard.push(`H2 dislike:${it.id}`);
    if (profile.brandsAvoided?.includes(it.brand)) hard.push(`H3 brand:${it.id}`);
    if (!it.inStock) hard.push(`H6 oos:${it.id}`);
  }

  const f = items.map((i) => i.styling.formality);
  const nonNeutral = items.filter(
    (i) => i.styling.color.role !== "neutral" && !NEUTRAL_FAMILIES.has(i.styling.color.family)
  );
  const neutrals = items.filter(
    (i) => i.styling.color.role === "neutral" || NEUTRAL_FAMILIES.has(i.styling.color.family)
  );
  const statements = items.filter((i) => i.styling.color.role === "statement");
  const accents = items.filter((i) => i.styling.color.role === "accent");

  // R1 formality cohesion
  const spread = Math.max(...f) - Math.min(...f);
  let R1 = clamp01(1 - spread / 3);
  if (brief.targetFormality != null) {
    R1 *= clamp01(1 - Math.abs(median(f) - brief.targetFormality) / 2);
  }
  const formalityCapped = spread >= 3;

  // R2 color scheme
  const hues = [...new Set(nonNeutral.map((i) => HUE[i.styling.color.family]).filter((h) => h != null))];
  let R2: number, scheme: string;
  if (statements.length <= 1 && accents.length <= 1 && neutrals.length >= Math.ceil(items.length / 2)) {
    R2 = 1.0; scheme = "neutral-anchored";
  } else if (nonNeutral.length > 0 && new Set(nonNeutral.map((i) => i.styling.color.family)).size === 1) {
    R2 = 1.0; scheme = "monochrome";
  } else if (hues.length > 1 && Math.max(...hues) - Math.min(...hues) <= 60) {
    R2 = 0.95; scheme = "analogous";
  } else if (hues.length === 2 && hueDistance(hues[0], hues[1]) >= 150 && statements.length === 1) {
    R2 = 0.9; scheme = "complementary-accent";
  } else {
    R2 = clamp01(1 - 0.25 * (hues.length - 1) - (statements.length >= 2 ? 0.3 : 0));
    scheme = "mixed";
  }

  // R3 one-hero
  const heroes = items.filter((i) => i.styling.weight === "statement");
  let R3: number, heroItemId: string | null = null;
  if (heroes.length === 1) { R3 = 1.0; heroItemId = heroes[0].id; }
  else if (heroes.length === 0) R3 = 0.6;
  else R3 = Math.max(0, 1 - 0.4 * (heroes.length - 1));

  // R4 undertone
  const ut = nonNeutral.map((i) => i.styling.color.undertone);
  const warm = ut.filter((t) => t === "warm").length;
  const cool = ut.filter((t) => t === "cool").length;
  const R4 = warm === 0 || cool === 0 ? 1.0 : 1 - 0.5 * (Math.min(warm, cool) / items.length);

  // R5 proportion
  const volMap: Record<string, number> = { slim: -1, regular: 0, voluminous: 1 };
  const topB = items.find((i) => ["top", "anchor"].includes(i.slotId));
  const botB = items.find((i) => i.slotId === "bottom");
  let R5 = 1.0;
  if (topB && botB) {
    const s = (volMap[topB.styling.volume] || 0) + (volMap[botB.styling.volume] || 0);
    R5 = Math.abs(s) <= 1 ? 1.0 : 0.6;
  }

  // R6 season
  const consistent = items.filter(
    (i) => !brief.season || i.styling.seasons.includes(brief.season) || i.styling.seasons.includes("all")
  ).length;
  const R6 = consistent / items.length;

  // R7 pattern load
  const bolds = items.filter((i) => i.styling.pattern === "bold").length;
  const R7 = bolds <= 1 ? 1.0 : bolds === 2 ? 0.5 : 0.0;

  // R8 budget tier
  const tiers = items.map((i) => i.styling.brandTier);
  const tspread = Math.max(...tiers) - Math.min(...tiers);
  const R8 = brief.highLow ? 1.0 : clamp01(1 - (tspread - 1) / 3);

  const ruleScores = { R1, R2, R3, R4, R5, R6, R7, R8 };
  let score = 100 * Object.entries(WEIGHTS).reduce((s, [k, w]) => s + (ruleScores as any)[k] * w, 0);
  if (formalityCapped) score = Math.min(score, 60);
  score = Math.round(score * 10) / 10;

  const passed = hard.length === 0 && score >= THRESHOLD;
  return { score, passed, hardViolations: hard, ruleScores, scheme, heroItemId };
}

// Human-readable rule labels for the builder/meter tips.
export const RULE_LABELS: Record<string, string> = {
  R1: "Formality cohesion",
  R2: "Color scheme",
  R3: "One hero piece",
  R4: "Undertone harmony",
  R5: "Proportion balance",
  R6: "Season fit",
  R7: "Pattern load",
  R8: "Price-tier consistency",
};

// A single, gentle, prioritized tip for the live builder (GUIDE, never block).
export function coherenceTip(res: CoherenceResult): string | null {
  if (res.hardViolations.length) {
    const v = res.hardViolations[0];
    if (v.startsWith("H6")) return "An item is out of stock — swap it to keep the look shoppable.";
    if (v.startsWith("H2")) return "A color here clashes with your dislikes.";
    if (v.startsWith("H3")) return "This includes a brand you'd rather avoid.";
  }
  const entries = Object.entries(res.ruleScores).sort((a, b) => a[1] - b[1]);
  if (!entries.length) return null;
  const [worst, val] = entries[0];
  if (val >= 0.85) return null;
  const tips: Record<string, string> = {
    R1: "Pieces sit at different formality levels — pull one dressier or more casual.",
    R2: "The palette is getting busy — a neutral would calm it down.",
    R3: "No clear hero — let one piece lead and keep the rest supporting.",
    R4: "Warm and cool tones are fighting — commit to one temperature.",
    R5: "Volume is unbalanced — pair a fuller piece with something slimmer.",
    R6: "Something's off-season for this brief.",
    R7: "Too many bold patterns — let one print do the talking.",
    R8: "Price tiers are scattered — tighten the range unless it's intentional high-low.",
  };
  return tips[worst] ?? null;
}
