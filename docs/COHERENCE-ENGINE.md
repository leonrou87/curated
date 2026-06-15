# COHERENCE-ENGINE.md
### The styling-logic spec for "Curated" — how looks/kits get composed and proven to "make sense"

> **Purpose for the implementing agent:** This document is buildable as-is. It defines the
> product styling metadata, the slot system, the scoring math, the LLM↔scorer composition loop,
> the repair loop, the live-builder behavior, and the "why it works" generator. Implement the
> scorer as **deterministic, pure, unit-tested TypeScript** in `/pipeline/lib/coherence/`. The
> LLM is a *proposer and narrator only* — it never has final say on whether a look ships.
> One engine, two surfaces: batch auto-generation AND the live builder call the SAME scorer.

---

## 0. CORE PRINCIPLE

A look is a **scored composition over a slot system**, not a filtered list. Taste is encoded as
constraints. The pipeline is:

```
Brief ──▶ Retrieve candidates per slot ──▶ LLM proposes a fill + rationale
        ──▶ Deterministic Coherence Scorer validates ──▶ Repair loop until it passes
        ──▶ Generate "why it works" from satisfied constraints ──▶ Emit look + variants + alternates
```

If the LLM is unavailable, a deterministic **greedy composer** (Section 8) fills slots so the
product works with zero API keys. The scorer is identical in both paths.

---

## 1. PRODUCT STYLING METADATA (the `StylingProfile` on every Product)

The enrich stage of the pipeline must populate this. Fields are normalized at ingest; missing
fields are inferred (LLM/rules) or defaulted conservatively. **All scoring reads only these.**

```ts
interface StylingProfile {
  // --- formality & dress code ---
  formality: 1 | 2 | 3 | 4 | 5;        // 1 loungewear/athleisure, 2 casual, 3 smart-casual,
                                        // 4 business/cocktail, 5 formal/black-tie
  dressCodes: DressCode[];             // tags a piece is *appropriate* for (may span a range)

  // --- color ---
  color: {
    primaryHex: string;               // dominant color
    secondaryHex?: string;
    family: ColorFamily;              // red|orange|yellow|green|blue|purple|pink|brown|
                                      // black|white|grey|beige|navy|olive|burgundy|...
    undertone: 'warm' | 'cool' | 'neutral';
    role: 'neutral' | 'accent' | 'statement'; // how loud the piece is, color-wise
    value: number;                    // 0 (black) .. 100 (white) lightness
    chroma: number;                   // 0 (greyscale) .. 100 (vivid) saturation/intensity
  };

  // --- form ---
  pattern: 'solid' | 'subtle' | 'bold'; // bold = large/loud print, plaid, graphic
  texture: string[];                  // e.g. ['knit','leather','denim','silk']
  silhouette: 'fitted' | 'relaxed' | 'structured' | 'oversized' | 'flowy';
  volume: 'slim' | 'regular' | 'voluminous'; // for proportion balancing
  weight: 'basic' | 'supporting' | 'statement'; // role in a look's hierarchy (the "hero" axis)

  // --- context ---
  seasons: Season[];                  // ['spring','summer','fall','winter'] (can be all)
  weather: WeatherTag[];              // ['hot','mild','cold','rain'] appropriateness

  // --- commerce / matching ---
  brand: string;
  brandTier: 1 | 2 | 3 | 4;           // 1 value, 2 mid, 3 premium, 4 luxury
  priceTier: 'budget' | 'mid' | 'premium';
  slotRoles: SlotRole[];              // which slots this product can legally fill (see §2)
  embedding?: number[];               // optional vector for similarity/swap ranking
}
```

> **Inference notes:** `value`/`chroma`/`undertone` are computable from `primaryHex` (convert to
> HSL/Lab; undertone via hue bucket + a warm/cool lookup). `role` defaults from `chroma`+`value`:
> high chroma → statement; near-greyscale or beige/navy/white/black → neutral; else accent.

---

## 2. THE SLOT SYSTEM (data-driven; new categories = data, not code)

Each bundle **type × brief** maps to a `SlotDefinition`. Slots declare which `SlotRole` fills
them, whether they're required, and per-slot constraints. Stored as JSON/DB rows.

```ts
type SlotRole =
  // fashion
  | 'anchor'      // the defining garment: dress, suit, or "top+bottom" pairing
  | 'top' | 'bottom' | 'outerwear' | 'shoes' | 'bag' | 'belt'
  | 'accessory'   // jewelry, watch, scarf, hat, sunglasses
  // non-fashion examples
  | 'primary-gear' | 'consumable' | 'apparel' | 'tool' | 'accessory-kit';

interface SlotDefinition {
  bundleType: 'look' | 'kit' | 'collection' | 'gift';
  briefMatch: Partial<Brief>;          // e.g. { occasion:'wedding-guest', gender:'women' }
  slots: Slot[];
}

interface Slot {
  id: string;                          // 'shoes'
  acceptsRoles: SlotRole[];            // ['shoes']
  required: boolean;
  min: number; max: number;            // e.g. accessories min 1 max 2
  constraints?: SlotConstraint[];      // optional per-slot overrides
}
```

**Example — Women / Wedding-guest / look:**
```json
{ "slots": [
  { "id":"anchor",      "acceptsRoles":["anchor","top","bottom"], "required":true,  "min":1,"max":2 },
  { "id":"shoes",       "acceptsRoles":["shoes"],                 "required":true,  "min":1,"max":1 },
  { "id":"bag",         "acceptsRoles":["bag"],                   "required":true,  "min":1,"max":1 },
  { "id":"accessories", "acceptsRoles":["accessory","belt"],      "required":false, "min":1,"max":2 },
  { "id":"layer",       "acceptsRoles":["outerwear"],             "required":false, "min":0,"max":1 }
]}
```

**Example — Golf / starter / kit (proves generality):**
```json
{ "slots": [
  { "id":"clubs",   "acceptsRoles":["primary-gear"], "required":true, "min":1,"max":1 },
  { "id":"balls",   "acceptsRoles":["consumable"],   "required":true, "min":1,"max":1 },
  { "id":"glove",   "acceptsRoles":["apparel"],      "required":true, "min":1,"max":1 },
  { "id":"apparel", "acceptsRoles":["apparel"],      "required":false,"min":1,"max":2 },
  { "id":"extras",  "acceptsRoles":["accessory-kit"],"required":false,"min":1,"max":2 }
]}
```

The fashion **color/formality/proportion** rules below apply to `bundleType:'look'`. Non-fashion
kits swap in their own coherence dimensions (Section 9) but reuse the same scorer scaffold.

---

## 3. THE COHERENCE SCORER (deterministic, the heart of the engine)

Input: a candidate **composition** (one product per filled slot) + the `Brief`.
Output: a `CoherenceResult` with a 0–100 score, per-rule breakdown, and violations.

```ts
interface CoherenceResult {
  score: number;                 // 0..100 weighted
  passed: boolean;               // score >= THRESHOLD && no hard violations
  hardViolations: Violation[];   // any of these => auto-reject regardless of score
  ruleScores: Record<RuleName, { score: number; weight: number; notes: string[] }>;
  heroItemId: string | null;
}
```

### 3.1 Hard constraints (any failure ⇒ `passed=false`, must trigger repair)
- **H1 Size feasibility** — every garment must be available in the user's size (from profile). 
- **H2 Color-dislike** — no item whose `color.family` ∈ `profile.colorDislikes`.
- **H3 Brand-avoid** — no item whose `brand` ∈ `profile.brandsAvoided`.
- **H4 Budget ceiling** — composition total ≤ brief budget band max (with a 10% grace for one item).
- **H5 Required slots filled** — all `required` slots satisfied within min/max.
- **H6 Availability** — every offer `inStock` and link-health `active`.

### 3.2 Soft rules (scored 0–1, then weighted; these are the "taste")

Default weights (sum = 1.0; tune later, store in config):

| Rule | Name | Weight |
|---|---|---|
| R1 | Formality cohesion | 0.22 |
| R2 | Color scheme validity | 0.22 |
| R3 | One-hero hierarchy | 0.16 |
| R4 | Undertone harmony | 0.10 |
| R5 | Proportion / silhouette balance | 0.12 |
| R6 | Season & weather consistency | 0.10 |
| R7 | Pattern load | 0.05 |
| R8 | Budget-tier coherence | 0.03 |

`score = 100 * Σ(ruleScore_i * weight_i)`  →  **THRESHOLD to publish = 72**, builder "good" = 65.

---

#### R1 — Formality cohesion (0.22)
Items in a look should cluster in formality. Spread is the enemy.
```
f = [item.formality for items]
spread = max(f) - min(f)
R1 = clamp01(1 - spread / 3)          // spread 0 →1.0, spread 3 →0.0
HARD-ish: if spread >= 3  → cap whole-look score at 60 (e.g. black-tie shoe + gym short)
```
Brief may set a target formality (cocktail=4); apply a penalty if the look's **median** formality
is >1 away from the target: `R1 *= clamp01(1 - |median(f) - target|/2)`.

#### R2 — Color scheme validity (0.22) — the most important taste rule
Classify the look's colors into one of the accepted schemes; score by best fit.
```
neutrals  = items where color.role == 'neutral'   (black/white/grey/beige/navy/olive/brown)
accents   = items where color.role == 'accent'
statements= items where color.role == 'statement'
hues      = distinct color.family of non-neutral items
```
Accept if it matches ONE of:
- **Neutral-anchored** (most common, safest): `statements ≤ 1` AND `accents ≤ 1`
  AND `neutrals ≥ ceil(items/2)`  → score 1.0
- **Monochrome**: all non-neutral items share one `family` (tonal variation ok) → 1.0
- **Analogous**: all non-neutral hues fall within a 60° arc on the wheel (adjacent families) → 0.95
- **Complementary accent**: exactly 2 non-neutral hues that are ~complementary (150–210° apart)
  AND one of them is the single statement → 0.9
Else partial credit:
```
R2 = 1.0 - 0.25 * (number_of_distinct_nonneutral_hues - 1)   // each extra clashing hue hurts
R2 -= 0.30 if statements >= 2                                  // two loud colors fighting
R2 = clamp01(R2)
```
Map `color.family` → hue degrees once (e.g. red 0, orange 30, yellow 60, green 120, blue 220,
purple 280, pink 330). Browns/beiges/navy/olive count as neutrals for scheme purposes.

#### R3 — One-hero hierarchy (0.16)
A great look has exactly one statement/"hero" piece; everything else supports it.
```
heroes = items where weight == 'statement'
if len(heroes) == 1 → R3 = 1.0,  heroItemId = that item
if len(heroes) == 0 → R3 = 0.6   // safe but a little flat; allowed
if len(heroes) >= 2 → R3 = max(0, 1 - 0.4*(len(heroes)-1))  // competing heroes penalized
```

#### R4 — Undertone harmony (0.10)
```
ut = [item.color.undertone for non-neutral items]   // warm|cool|neutral
if all warm-or-neutral OR all cool-or-neutral → R4 = 1.0
else R4 = 1 - 0.5 * (count of the minority temperature)/items   // mixed warm+cool penalized
```

#### R5 — Proportion / silhouette balance (0.12)
Encourage classic balance: volume on top → leaner bottom (and vice-versa); avoid all-oversized.
```
vols = map volume→{slim:-1, regular:0, voluminous:+1} for top & bottom (or anchor halves)
if |sum(vols)| <= 1 → R5 = 1.0          // balanced
else R5 = 0.6                            // both voluminous or both extreme-slim: still wearable
structured+structured head-to-toe (e.g. blazer+stiff trouser) is fine → no penalty
```

#### R6 — Season & weather consistency (0.10)
```
brief.season ∈ each item.seasons ?  and brief.weather compatible with item.weather ?
R6 = fraction of items consistent with brief season/weather
hard-ish: a heavy wool coat in a 'hot' brief → that item fails consistency (counts 0)
```

#### R7 — Pattern load (0.05)
```
bolds = items where pattern == 'bold'
if bolds <= 1 → R7 = 1.0
if bolds == 2 → R7 = 0.5   (mixing two bold prints: advanced, usually avoid in auto-gen)
if bolds >= 3 → R7 = 0.0
```

#### R8 — Budget-tier coherence (0.03)
```
tiers = brandTier of items
spread = max(tiers)-min(tiers)
R8 = clamp01(1 - (spread-1)/3)   // 1 tier of spread fine; high-low (1&4) allowed but lower score
```
(Intentional high-low can be whitelisted by the LLM proposer setting a `highLow:true` flag that
relaxes R8 to 1.0 — taste can override, transparently.)

---

## 4. THE COMPOSITION LOOP (LLM proposes, scorer disposes)

```ts
async function composeLook(brief: Brief, profile: StyleProfile): Promise<Look> {
  const slotDef = resolveSlotDefinition(brief);
  const candidates = retrieveCandidates(slotDef, brief, profile); // per-slot ranked pools (§5)

  // 1) LLM proposes a fill + rationale + optional flags (highLow, heroSlot)
  let proposal = await llmStylist.propose({ brief, profile, slotDef, candidates });
  // proposal: { fills: {slotId: productId}, rationaleSeed, flags }

  // 2) score + repair (deterministic)
  let result = scoreComposition(proposal.fills, brief, profile);
  let guard = 0;
  while (!result.passed && guard++ < MAX_REPAIRS) {       // MAX_REPAIRS = 12
    proposal.fills = repair(proposal.fills, result, candidates, brief, profile);
    result = scoreComposition(proposal.fills, brief, profile);
  }

  if (!result.passed) return null; // give up cleanly; never ship an incoherent look

  // 3) variants + alternates + narration
  const variants = buildBudgetSplurgeVariants(proposal.fills, candidates, brief);
  const alternates = topAlternatesPerSlot(proposal.fills, candidates, 4); // powers the builder
  const why = generateWhyItWorks(proposal.fills, result, brief); // §6

  return assembleLook({ fills: proposal.fills, variants, alternates, why, score: result });
}
```

### `repair(fills, result, candidates, ...)`
Targeted, not random:
1. Identify the **worst-contributing item** = the item whose removal most increases the score
   (compute marginal Δscore per item; pick the max-improver). 
2. Replace it with the **next candidate in that slot** that (a) fixes the most-violated rule and
   (b) doesn't introduce a hard violation. Prefer candidates near the look's median formality and
   within the established color scheme.
3. If no in-slot candidate helps, relax the *lowest-weight* failing soft rule's expectation and
   retry; never relax hard constraints.

---

## 5. CANDIDATE RETRIEVAL & RANKING (per slot)

```
pool(slot) = catalog.filter(p =>
     p.slotRoles ∩ slot.acceptsRoles  &&
     sizeFits(p, profile) &&  notDisliked(p, profile) &&  inStock(p) &&
     withinSeason(p, brief) &&  brand ∉ profile.brandsAvoided )
rank by:  w1*profileFit + w2*formalityMatch(brief) + w3*availabilityFreshness
          + w4*socialProof(saves/conversions) + w5*priceFit(brief band)
          + w6*brandLoved(profile)
```
`profileFit` uses the product embedding vs. a profile embedding (built from liked styles). Keep
ranking explainable: store the top contributing factor per item for "why you're seeing this."

---

## 6. "WHY IT WORKS" — generated from satisfied constraints (not filler)

Build a templated, constraint-grounded sentence set, then let the LLM smooth it into voice. The
*facts* come from the scorer so the copy is always true.

```
facts = {
  scheme: R2.schemeName,                 // "neutral-anchored with one terracotta accent"
  hero: heroItem.title,                  // "the sculptural terracotta heel"
  formality: describeFormality(median),  // "daytime-wedding appropriate, not stuffy"
  undertone: R4.temperature,             // "kept warm throughout"
  season: brief.season,
  balanceNote: R5.note,                  // "volume up top balanced by a tailored trouser"
}
```
Template seed (LLM rewrites to ~2–3 sentences, expert voice, no fluff):
> "{hero} anchors a {scheme} palette {undertone}. Everything sits at a {formality} register, so
> it reads polished without trying too hard. {balanceNote}."

The LLM must NOT invent facts outside `facts`. If a fact is absent, omit that clause.

---

## 7. LIVE COHERENCE IN THE BUILDER (same scorer, interactive)

On every user swap:
```
onSwap(slotId, newProductId):
   fills[slotId] = newProductId
   result = scoreComposition(fills, brief, profile)     // SAME function
   render coherenceMeter(result.score)                  // 0–100, smooth animated
   if a soft rule dropped sharply → show ONE gentle tip (guide, never block):
       e.g. "That brightens the palette — a neutral shoe would balance it."
   if hard violation (size/dislike) → flag inline, suggest nearest valid alternate
```
- The meter is **guidance, not a gate**. Users can keep an "imperfect" look; we never prevent
  creativity. We only *inform*.
- Provide a **"Fix it for me"** button → runs `repair()` once and animates the swap.
- Cache `scoreComposition` purely (no side effects) so it runs at 60fps on swaps.

---

## 8. NO-LLM FALLBACK (zero-key demo path) — deterministic greedy composer

```
for slot in slotDef.slots (required first):
   pick = argmax over pool(slot) of  rank(p) - coherencePenaltyIfAdded(p, currentFills)
   add pick to fills, respecting min/max
then run repair() to polish.
```
This guarantees the site builds coherent looks on first `npm run dev` with no API keys. The LLM
path simply produces *better taste + better narration*; the floor is always coherent.

---

## 9. GENERALIZING BEYOND FASHION (the engine is a kit engine)

Swap the soft-rule set per `bundleType` via a **RuleSet registry**. Fashion uses R1–R8. A kit
defines its own dimensions but the scaffold (slots, hard constraints, weighted soft rules,
repair loop, why-it-works) is identical.

**Golf-kit RuleSet (example):**
- K1 Skill-level coherence (don't pair pro-blades with a beginner brief) — weight 0.30
- K2 Budget-tier coherence (whole kit in one tier unless "splurge one piece") — 0.20
- K3 Brand harmony (cohesive brand story, not chaotic) — 0.15
- K4 Completeness (covers the real need: clubs+ball+glove+tee) — 0.25
- K5 Aesthetic cohesion (color/style of bag↔apparel) — 0.10

**Desk-setup RuleSet:** ergonomics fit, ecosystem compatibility (Mac/PC, port match),
aesthetic match (wood/white/black theme), completeness (display+input+light+seat+cable mgmt),
budget-tier coherence. Same scaffold, new rules.

> The implementing agent: build `RuleSet` as an interface `{ hardConstraints[], softRules[],
> weights }` and register one per bundleType. The scorer core is rule-agnostic.

---

## 10. DATA / STORAGE

- Persist `CoherenceResult` (score + ruleScores + heroItemId) on each generated `Bundle` for
  transparency, ranking, debugging, and the quality gate.
- Quality gate for publish/UGC: `result.passed && score>=72 && originalityOK && imagesOK &&
  linkHealthOK`.
- Unit-test every rule with fixture compositions (a known-good cocktail look scores >85; a
  sneaker+tux fixture is hard-capped; a 3-bold-print fixture tanks R7). Ship a `coherence.test.ts`.

---

## 11. TUNING & GUARDRAILS

- All weights + thresholds live in `coherence.config.ts` (hot-tunable, versioned).
- Log score distributions of published looks; if median creeps below target, surface for retune.
- The LLM can pass *flags* (highLow, intentionalClash, monochromeOnPurpose) that transparently
  relax specific soft rules — taste may override rules, but the override is explicit and logged.
- NEVER let the LLM override **hard constraints** (size, dislikes, budget ceiling, availability).

— end COHERENCE-ENGINE.md —
