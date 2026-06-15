// scorer.js — reference implementation of the COHERENCE-ENGINE.md scorer (fashion RuleSet)
// Pure, deterministic. Used to validate seed bundles before emitting them.

const HUE = { red:0, orange:30, yellow:60, green:120, teal:170, blue:220, navy:225,
  purple:280, pink:330, burgundy:350 };
const NEUTRAL_FAMILIES = new Set(['black','white','grey','gray','beige','navy','olive','brown','cream','tan','charcoal','camel']);

const clamp01 = x => Math.max(0, Math.min(1, x));
const median = a => { const s=[...a].sort((x,y)=>x-y); const m=s.length>>1;
  return s.length%2 ? s[m] : (s[m-1]+s[m])/2; };

function hueDistance(a, b) {
  if (a == null || b == null) return 0;
  let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d;
}

const WEIGHTS = { R1:0.22, R2:0.22, R3:0.16, R4:0.10, R5:0.12, R6:0.10, R7:0.05, R8:0.03 };
const THRESHOLD = 72;

function scoreComposition(items, brief, profile = {}) {
  const hard = [];
  // ---- hard constraints ----
  for (const it of items) {
    if (profile.colorDislikes?.includes(it.styling.color.family)) hard.push(`H2 dislike:${it.id}`);
    if (profile.brandsAvoided?.includes(it.brand)) hard.push(`H3 brand:${it.id}`);
    if (!it.inStock) hard.push(`H6 oos:${it.id}`);
  }

  const f = items.map(i => i.styling.formality);
  const nonNeutral = items.filter(i => i.styling.color.role !== 'neutral'
    && !NEUTRAL_FAMILIES.has(i.styling.color.family));
  const neutrals = items.filter(i => i.styling.color.role === 'neutral'
    || NEUTRAL_FAMILIES.has(i.styling.color.family));
  const statements = items.filter(i => i.styling.color.role === 'statement');
  const accents = items.filter(i => i.styling.color.role === 'accent');

  // ---- R1 formality cohesion ----
  const spread = Math.max(...f) - Math.min(...f);
  let R1 = clamp01(1 - spread / 3);
  if (brief.targetFormality != null) {
    R1 *= clamp01(1 - Math.abs(median(f) - brief.targetFormality) / 2);
  }
  const formalityCapped = spread >= 3;

  // ---- R2 color scheme ----
  const hues = [...new Set(nonNeutral.map(i => HUE[i.styling.color.family]).filter(h=>h!=null))];
  let R2, scheme;
  if (statements.length <= 1 && accents.length <= 1 && neutrals.length >= Math.ceil(items.length/2)) {
    R2 = 1.0; scheme = 'neutral-anchored';
  } else if (nonNeutral.length > 0 && new Set(nonNeutral.map(i=>i.styling.color.family)).size === 1) {
    R2 = 1.0; scheme = 'monochrome';
  } else if (hues.length > 1 && Math.max(...hues) - Math.min(...hues) <= 60) {
    R2 = 0.95; scheme = 'analogous';
  } else if (hues.length === 2 && hueDistance(hues[0], hues[1]) >= 150 && statements.length === 1) {
    R2 = 0.9; scheme = 'complementary-accent';
  } else {
    R2 = clamp01(1 - 0.25 * (hues.length - 1) - (statements.length >= 2 ? 0.30 : 0));
    scheme = 'mixed';
  }

  // ---- R3 one-hero ----
  const heroes = items.filter(i => i.styling.weight === 'statement');
  let R3, heroItemId = null;
  if (heroes.length === 1) { R3 = 1.0; heroItemId = heroes[0].id; }
  else if (heroes.length === 0) R3 = 0.6;
  else R3 = Math.max(0, 1 - 0.4 * (heroes.length - 1));

  // ---- R4 undertone ----
  const ut = nonNeutral.map(i => i.styling.color.undertone);
  const warm = ut.filter(t => t === 'warm').length, cool = ut.filter(t => t === 'cool').length;
  let R4 = (warm === 0 || cool === 0) ? 1.0 : 1 - 0.5 * (Math.min(warm, cool) / items.length);

  // ---- R5 proportion ----
  const volMap = { slim:-1, regular:0, voluminous:1 };
  const topB = items.find(i => ['top','anchor'].includes(i.slotId));
  const botB = items.find(i => i.slotId === 'bottom');
  let R5 = 1.0;
  if (topB && botB) {
    const s = (volMap[topB.styling.volume]||0) + (volMap[botB.styling.volume]||0);
    R5 = Math.abs(s) <= 1 ? 1.0 : 0.6;
  }

  // ---- R6 season ----
  const consistent = items.filter(i => !brief.season || i.styling.seasons.includes(brief.season)
    || i.styling.seasons.includes('all')).length;
  let R6 = consistent / items.length;

  // ---- R7 pattern load ----
  const bolds = items.filter(i => i.styling.pattern === 'bold').length;
  let R7 = bolds <= 1 ? 1.0 : bolds === 2 ? 0.5 : 0.0;

  // ---- R8 budget tier ----
  const tiers = items.map(i => i.styling.brandTier);
  const tspread = Math.max(...tiers) - Math.min(...tiers);
  let R8 = brief.highLow ? 1.0 : clamp01(1 - (tspread - 1) / 3);

  const ruleScores = { R1, R2, R3, R4, R5, R6, R7, R8 };
  let score = 100 * Object.entries(WEIGHTS).reduce((s, [k, w]) => s + ruleScores[k] * w, 0);
  if (formalityCapped) score = Math.min(score, 60);
  score = Math.round(score * 10) / 10;

  const passed = hard.length === 0 && score >= THRESHOLD;
  return { score, passed, hardViolations: hard, ruleScores, scheme, heroItemId };
}

module.exports = { scoreComposition, THRESHOLD };
