# Curated — Master Build Brief & Handoff README
### The single entry point. Read this first; it routes you through everything else.

> **You are the implementing agent (Claude Code / max studio).** This repo contains a complete
> design + data package for a personalized styling & shopping companion monetized invisibly via
> affiliate links. Your job: build the pipeline AND the website, following the docs below in
> order. Do not improvise the architecture — it's already decided. Spend your energy on
> execution quality, especially the *feel* and the *coherence of looks*.

---

## 0. WHAT THIS PRODUCT IS (in one paragraph)
A user opens Curated and gets a personalized, editorial feed of complete **looks** (outfits by
occasion/vibe/gender) and **kits** (golf, coffee, desk, home-gym), each a curated bundle whose
items link out to retailers via affiliate links. They can describe what they need in plain
language ("fall outdoor wedding, size 14, no yellow") and watch a coherent look *assemble on
screen*; they can mix-and-match in a tactile **builder** with live "does this work together"
feedback; they can save, publish, and remix. It must feel like a fashion magazine fused with a
game — never like an affiliate site. Affiliate revenue is invisible infrastructure beneath a
product about taste, personalization, and interactivity.

---

## 1. THE THREE THINGS THAT MUST BE WORLD-CLASS
Give each equal energy. A fast pretty site with dumb looks fails; smart looks in an ugly site fails.
1. **How it FEELS** → `docs/DESIGN-SYSTEM.md` (editorial, tactile, motion-rich, gallery-grade).
2. **How looks are MADE** → `docs/COHERENCE-ENGINE.md` (a real scorer so every look makes sense).
3. **PERSONALIZATION + COMMUNITY** → `docs/DECISIONS.md` §3 (it learns you; users grow the catalog).

---

## 2. READ THESE IN THIS ORDER (the doc map)
| # | Doc | What it gives you | When you need it |
|---|-----|-------------------|------------------|
| 1 | `docs/DECISIONS.md` | Stack, full Prisma schema, personalization & monetization model, open questions | Before any code. It's the contract. |
| 2 | `docs/COHERENCE-ENGINE.md` | Product styling metadata, slot system, the scoring math, LLM↔scorer loop, repair, live-builder behavior | Building the scorer + composer (shared package) |
| 3 | `docs/DESIGN-SYSTEM.md` | Tokens (color/type/space/motion), components, the reveal, shoppable pins, the builder, a11y/perf | Building any UI |
| 4 | `data/seed-bundles.json` | 25 validated bundles / 86 products across all 4 categories | Seeding the DB (milestone 1) |
| 5 | `scripts/scorer.js` + `scripts/build-seed-full.js` | Reference scorer + regeneratable seed pipeline | Porting the scorer to TS; extending seed data |
| 6 | `docs/NEXT_STEPS.md` | The human go-live runbook (signups, keys, legal) | Hand back to the human at the end |
| 7 | `docs/MILESTONE-2.md` | Deep spec + reference implementation of the `/looks/[slug]` page | The "make it breathtaking" milestone |

---

## 3. GROUND RULES (non-negotiable)
- **Zero-key demo:** the whole site must run on first `npm run dev` with NO API keys — seed data
  + the deterministic greedy composer + reduced "vibe match". LLM/vision only *upgrade* it.
- **One coherence brain:** the scorer lives in `packages/coherence` and is imported by BOTH the
  pipeline (batch generation) and the web app (live builder). Never fork the logic.
- **Offer-centric monetization:** components never hardcode a network. `resolveBestOffer()` picks.
  Layer order: Sovrn/Skimlinks (default) → Amazon PA-API (gated by 3-sale rule, graceful no-op) →
  direct networks. Carry the link-health loop as first-class.
- **Compliance is acceptance criteria:** FTC disclosure ABOVE the first affiliate link on every
  page; `rel="sponsored nofollow"` + new tab on every outbound link; never cache Amazon prices
  outside PA-API; a CI lint fails the build on a non-compliant link.
- **Data-driven taxonomy:** new categories (fashion or not) = new data, never new code. The
  builder/feed/scorer already generalize — prove it with one non-fashion vertical fully.
- **Never auto-publish:** generated + UGC bundles pass the quality gate (coherence ≥72 +
  originality + images + link-health) AND a human approval queue before going public.

---

## 4. MONOREPO LAYOUT (build to this)
```
/curated
  /web                 Next.js (App Router, TS, Tailwind) — the site
    /app               routes (see §6)
    /components        design-system components (see DESIGN-SYSTEM.md §8)
    /lib               offer resolver, analytics, seo, hooks
  /pipeline            ingest adapters, enrich, composer, cli (cron-friendly)
  /packages
    /db                Prisma schema (from DECISIONS.md §2) + client
    /types             shared TS types (Brief, StylingProfile, CoherenceResult, Slot…)
    /coherence         the scorer (pure, unit-tested) — imported by web + pipeline
  /data                seed-bundles.json, seed CSVs, exported snapshots
  /docs                all .md docs
  /scripts             scorer.js, build-seed-full.js, setup/seed/deploy helpers
  .env.example         every secret documented (see NEXT_STEPS.md)
  README.md            this file
```

---

## 5. BUILD ORDER (commit at each milestone; STOP at 0 for sign-off)
```
0. DECISIONS.md + DESIGN-SYSTEM.md + COHERENCE-ENGINE.md + schema → get human sign-off.
   Answer the open questions in DECISIONS.md §6 first.
1. Scaffold monorepo + Prisma schema + design tokens + /styleguide + seed the 25 bundles.
   (Zero-key: site has real, coherent, monetized data with no API keys.)
2. ★ The breathtaking look page: /looks/[slug] with shoppable pins + the reveal + compliant
   affiliate UX. Build to a "breathtaking" bar BEFORE scaling. (See docs/MILESTONE-2.md.)
3. Coherence engine v1 (port scorer.js → packages/coherence in TS) + composer generating looks.
4. StyleProfile + swipe onboarding + profile-driven feed ranking (the personalized home).
5. The look-builder canvas with LIVE coherence (drag/swap/snap, live re-price, save).
6. Natural-language styling (flagship #1) wired to the engine + the assemble reveal.
7. Accounts + Closet/Saved + publish/remix + creator profiles (community v1, quality-gated).
8. Visual search (flagship #2: image → shoppable).
9. Retention (price-drop/back-in-stock alerts, smart upsells) + ratings/leaderboards/trends.
10. One NON-FASHION category fully (golf/coffee/desk/home-gym are seeded) to prove generality.
11. SEO/structured data/sitemap + analytics/click tracking + full a11y + Lighthouse + deploy +
    hand NEXT_STEPS.md back to the human.
```

---

## 6. ROUTE MAP
```
PUBLIC/APP
  /                 personalized editorial feed (FeedMasonry; "For You" + this-week drops)
  /onboarding       swipe-to-like StyleSwiper → builds StyleProfile
  /style            natural-language styling box → the reveal
  /visual-search    image in → shoppable look
  /builder          the tactile mix-and-match canvas + live coherence meter
  /looks            faceted look browser (gender/occasion/vibe/budget, URL-encoded)
  /looks/[slug]     ★ the hero page (MILESTONE-2.md)
  /kits  /kits/[slug]          activity kits (same bundle engine)
  /collections  /gifts         same engine
  /u/[handle]       creator profile (community)
  /closet  /saved   per-user saves & wishlist
  /trends  /search  discovery
  /styleguide       living design-system gallery
  /disclosure  /about  legal + FTC disclosure
ADMIN
  /admin            approval queue, moderation, link-health dashboard
```

---

## 7. DEFINITION OF DONE (per the human's sign-off)
- The `/looks/[slug]` page is genuinely breathtaking; the reveal + pins + builder feel great.
- Looks shown are coherent (scorer-validated); "why it works" reads like a stylist wrote it.
- Fully demoable with zero keys; LLM/vision degrade gracefully.
- Monetization is invisible + compliant; click tracking fires; link-health runs.
- Lighthouse perf ≥95 / a11y 100 on key routes; LCP <2.5s; CLS ~0.
- One non-fashion category proves the engine generalizes.
- NEXT_STEPS.md handed back with every human to-do checked or clearly flagged.

> Start at milestone 0. Read DECISIONS.md now. Push back on anything you think is wrong before
> building — but the bar is execution excellence on a plan that's already been thought through.
