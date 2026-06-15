# Curated

A personalized, editorial styling & shopping companion. An editorial feed of complete **looks**
(outfits) and **kits** (golf, coffee, desk, home-gym) — each a curated bundle whose items link out
to retailers via affiliate links. Describe what you need in plain language and watch a coherent
look *assemble on screen*; mix-and-match in a tactile **builder** with live "does this work
together" feedback.

> Affiliate revenue is invisible infrastructure beneath a product about taste, personalization, and
> interactivity. It should never feel like an affiliate site.

This app was implemented from the design + data package in `/docs` (DECISIONS, COHERENCE-ENGINE,
DESIGN-SYSTEM, MILESTONE-2, NEXT_STEPS). It is a **zero-key demo**: the whole site runs on first
`npm run dev` with no API keys — seed data + the deterministic coherence scorer.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build (all bundle pages are statically generated)
npm run compliance   # CI lint — fails on a non-compliant outbound affiliate link
node scripts/test-coherence.mjs   # parity check: ported scorer reproduces every stored score
```

## What's built

| Route | What it is |
|---|---|
| `/` | Personalized editorial feed (cover hero, this-week drops, varied-height masonry) |
| `/style` | **Natural-language styling** → the assemble reveal (zero-key deterministic matcher) |
| `/looks`, `/kits`, `/collections`, `/gifts` | Faceted browsers (occasion / vibe / gender / season / budget) |
| `/looks/[slug]` (+ kits/collections/gifts) | ★ The hero page — assemble reveal, **shoppable image pins**, why-it-works, compliant breakdown, coherence transparency, save-flight |
| `/builder` | The tactile builder with **live coherence** — swap a slot, the real scorer re-runs, the meter animates, "Fix it for me" greedily repairs |
| `/saved` | Your closet (logged-out, localStorage; upgrades to an account later) |
| `/styleguide` | Living design system — every token + component rendered live |
| `/disclosure`, `/about` | FTC disclosure + the product story |
| **`/admin`** | **Control room** — affiliate-network setup, link manager, approval queue, link-health |

## Admin console (`/admin`)

A real, working back office — no database needed (persists to JSON in `data/`):

- **Affiliate networks** — paste your Sovrn / Amazon / ShareASale / CJ / Impact IDs + analytics.
  Saved IDs immediately **wrap every outbound link** site-wide (verified end-to-end).
- **Link manager** — override any product's offer: force a network, paste a direct affiliate URL, flag stock.
- **Approval queue** — quality-gate (coherence ≥72 + link-health + originality; images flagged for human replacement) and publish / unpublish / archive. Unpublished bundles 404 publicly (admin can preview with `?preview=1`).
- **Link health** — checks outbound URLs live; finds dead links that silently kill revenue.

**→ See [`AFFILIATE-SETUP.md`](AFFILIATE-SETUP.md) for exactly which programs to sign up for and where to paste each ID.**

## Architecture

- **One coherence brain** — `lib/coherence.ts` is a pure, deterministic TS port of the reference
  `scorer.js` (8 weighted rules + hard constraints, threshold 72). The **same** function powers the
  live builder and (conceptually) batch generation. `scripts/test-coherence.mjs` proves it
  reproduces all 25 stored bundle scores.
- **Offer-centric monetization** — `lib/offers.ts` `resolveBestOffer()` ranks offers
  (Sovrn/Skimlinks → Amazon PA-API, gated by the 3-sale rule with a graceful no-op → direct).
  Components never hardcode a network.
- **Compliance is acceptance criteria** — the FTC disclosure sits above the first affiliate link on
  every page; every outbound link is `rel="sponsored nofollow"` + new tab (centralized in
  `AffiliateCTA`); `npm run compliance` fails the build on a violation.
- **Data-driven taxonomy** — looks, kits, collections and gifts all flow through one
  `BundleDetailPage`/`Builder`/feed. The non-fashion verticals (golf/coffee/desk/home-gym) prove the
  engine generalizes with **data, not new code**.
- **Design tokens** — `app/globals.css` holds both themes (dark default + paper light) as CSS
  variables; Tailwind consumes them. Fonts (Fraunces / Inter / Geist Mono) are swappable via two vars.

## Stack

Next.js (App Router, TypeScript) · Tailwind + CSS-variable tokens · zero runtime deps beyond React.
Seed catalog: `data/seed-bundles.json` (86 products / 25 bundles, all scorer-validated).

## Notes & honest scope

- Hero/flat-lay images in the seed are **flagged placeholders**. Until a human drops in
  licensed/PA-API imagery, covers render as a curated CSS composition built from each bundle's real
  product colors (`BundleCover`). Swap for `next/image` when imagery lands.
- Affiliate IDs are `PLACEHOLDER` (via Sovrn). Add real IDs in `.env` (see `.env.example`).
- This implementation focuses on the heart of the spec — the feed, the breathtaking look page, the
  live-coherence builder, NL styling, and compliant monetization. Accounts/Auth, the pipeline
  service, Prisma persistence, visual search, the admin approval queue, and price/stock alerts are
  scaffolded in the docs and types but not wired here. See `docs/NEXT_STEPS.md` for the go-live
  runbook (signups, keys, legal).
