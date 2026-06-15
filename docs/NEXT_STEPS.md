# NEXT_STEPS.md
### Exactly what a human must do to take "Curated" from built → live & earning

> This is the human runbook. The agent builds a site that runs fully on first `npm run dev`
> with ZERO keys (seed data + deterministic composer). Everything below is what only a human
> can do: sign up for programs, supply secrets, add real content, and pass legal review.
> Ordered by priority and by what unblocks what. Check items off as you go.

---

## STAGE 0 — DECISIONS THAT BLOCK THE BUILD (answer these first)
These are the open questions from DECISIONS.md §6. The agent needs them to finish milestone 1.

- [ ] **Brand name + domain.** Pick the real name (replace "Curated"). ⚠️ Amazon's agreement
      forbids "Amazon" (or confusingly similar) in your domain/brand. Buy the domain.
- [ ] **Fonts.** Ship with the licensed-face stand-ins (Fraunces / Inter / Geist Mono) or supply
      your own licensed faces (e.g. Canela / Suisse) to drop in. Stand-ins are fine to launch.
- [ ] **Default theme.** Confirm dark-gallery default + light alternate (recommended).
- [ ] **Launch scope.** Personalization-first with community as a fast-follow (recommended), or
      community in v1? And which non-fashion vertical to polish for the "proves generality"
      milestone — golf, coffee, desk, or home-gym (all four are already seeded).

---

## STAGE 1 — MONETIZATION SIGNUPS (this is where revenue comes from)
Do these in order. Layer 1 alone lets you launch and earn; Amazon can lag.

### 1A. Sovrn Commerce (Skimlinks) — THE DEFAULT LAYER, do this first
- [ ] Apply at sovrn.com (Sovrn //Commerce) or skimlinks.com. Approval is usually fast and does
      NOT require existing sales (unlike Amazon).
- [ ] Get your **publisher/site ID**. Put it in `.env` as `SOVRN_PUBLISHER_ID`.
- [ ] This single integration auto-affiliates outbound links across thousands of merchants —
      it's what makes the site monetized on day one without per-merchant approvals.

### 1B. Amazon Associates — high value, but gated; start the clock now
- [ ] Sign up at affiliate-program.amazon.com. You'll get an **Associate tag** (`yourtag-20`).
      Put it in `.env` as `AMAZON_ASSOC_TAG`.
- [ ] ⚠️ **The 3-sale rule:** you must make **3 qualifying sales within 180 days** or the account
      is closed. So drive a little traffic early. The site is built to NOT depend on Amazon —
      Layer 1 carries you until Amazon is established.
- [ ] **PA-API (Product Advertising API):** access is only granted AFTER those 3 sales. Once you
      have it, add `AMAZON_PAAPI_ACCESS_KEY` + `AMAZON_PAAPI_SECRET` + `AMAZON_PAAPI_REGION` to
      `.env`. Until then, the Amazon adapter no-ops gracefully and Sovrn handles Amazon links.
- [ ] ⚠️ **Never cache Amazon prices/availability** except via PA-API. The code already shows
      price *ranges/tiers* instead — keep it that way.

### 1C. Direct / premium networks — add over time for higher commissions
- [ ] Optional, post-launch: ShareASale, CJ Affiliate, Impact, Awin, or direct brand programs
      for merchants you feature heavily (often 2–4× Sovrn's rate). Each adds an adapter + an ID
      in `.env`. Prioritize the brands in your top-performing bundles.

---

## STAGE 2 — INTELLIGENCE KEYS (optional for launch; better with them)
The site works without these (deterministic composer + "vibe match"). Add to unlock the magic.

- [ ] **LLM provider key** (`LLM_API_KEY` + `LLM_MODEL`) — powers the natural-language styling
      box, the stylist proposer, the "why it works" narration, and auto-tagging in enrich.
      Without it: the greedy composer still produces coherent looks; narration is templated.
- [ ] **Vision provider key** (`VISION_API_KEY`) — powers visual search ("upload a photo → get
      the look") and image-based attribute tagging. Without it: visual search degrades to a
      vibe/keyword match.

---

## STAGE 3 — INFRASTRUCTURE (deploy targets)
- [ ] **Database:** provision managed Postgres (Neon or Supabase free tier is fine to start).
      Put the URL in `.env` as `DATABASE_URL`. Run `npm run db:migrate && npm run db:seed`
      (seeds the 25 validated bundles + 86 products).
- [ ] **Hosting:** connect the repo to **Vercel** (or Netlify). Add all `.env` values to the host's
      env settings. Deploy.
- [ ] **Analytics:** create a **GA4** or **Plausible** property; add `ANALYTICS_ID`. This is how
      you'll see affiliate-click events — your conversion proxy and your only early signal of
      what's working.
- [ ] **Cron:** enable the scheduled jobs (Vercel Cron or similar) for the **link-health loop**
      and **price/availability refresh**. Dead links silently kill affiliate revenue — don't skip.

---

## STAGE 4 — CONTENT (the part that actually determines success)
The seed 25 bundles make the site demoable and credible, but a real business needs depth.

- [ ] **Replace placeholder imagery.** Every seed product/look uses flagged placeholder images.
      Swap in licensed/lifestyle/PA-API imagery (or your own photography). This is the single
      biggest visual-quality lever — the whole design system assumes great images.
- [ ] **Verify/refresh the seed catalog.** The seed products are realistic but illustrative.
      Confirm real products, real merchants, real availability, and let Sovrn/PA-API supply live
      pricing. Prune anything out of stock.
- [ ] **Grow toward depth.** Aim for enough bundles per facet (occasion × gender × vibe) that
      browsing feels rich and SEO has surface area. Use the assisted generation + the **admin
      approval queue** — never auto-publish; the human approval step is what keeps Google from
      flagging thin content. Quality gate is already enforced (coherence ≥72 + originality +
      images + link health).
- [ ] **Seed the community (if launching it).** Publish a handful of looks under a house
      "stylist" profile so the social surfaces aren't empty on day one.

---

## STAGE 5 — LEGAL & COMPLIANCE (do NOT launch without this)
The agent built the mechanisms; a human must turn them on and review them.

- [ ] **FTC affiliate disclosure** is present ABOVE the first affiliate link on every page, plus a
      dedicated `/disclosure` page. Confirm it's visible and unavoidable, not buried.
- [ ] **Amazon required disclosure text** ("As an Amazon Associate I earn from qualifying
      purchases") appears where Amazon links are used. Confirm the associate tag is on every
      Amazon link.
- [ ] **Outbound link attributes:** confirm every affiliate link renders `rel="sponsored nofollow"`
      and opens in a new tab. There's a CI lint that fails the build otherwise — keep it on.
- [ ] **Privacy policy + cookie/consent** (analytics + any affiliate cookies). Add a privacy page;
      add a consent banner if serving EU/UK/CA traffic.
- [ ] **Terms of service** for user accounts / UGC (community publishing) if launching community.
- [ ] **Have a lawyer skim it.** Affiliate + UGC + data collection is exactly the combination
      where a one-hour legal review is cheap insurance. Not legal advice — get your own.

---

## STAGE 6 — PRE-LAUNCH QA (the agent's milestone 11, your sign-off)
- [ ] The flagship `/looks/[slug]` page is genuinely **breathtaking** (the "feel" bar from
      DESIGN-SYSTEM.md). If it's not, fix this before anything else — it's the whole product.
- [ ] The **assemble-on-screen reveal** plays and has a working reduced-motion fallback.
- [ ] The **look builder** swaps feel tactile and the live coherence meter responds correctly.
- [ ] **Shoppable image pins** work on desktop + mobile and are keyboard-accessible.
- [ ] **Lighthouse:** perf ≥95 / a11y 100 on key routes; LCP <2.5s on 4G; CLS ~0.
- [ ] **Affiliate click tracking** fires on every outbound CTA (check GA4/Plausible real-time).
- [ ] **Link-health job** runs and correctly flags/hides a deliberately-broken test offer.
- [ ] **SEO:** sitemap, robots, per-bundle metadata, OG images, and JSON-LD ItemList/Product
      validate (test in Google's Rich Results tool).

---

## STAGE 7 — POST-LAUNCH (first 90 days, in priority order)
- [ ] **Get the 3 Amazon sales** before the 180-day clock runs out (share looks, light SEO,
      maybe a small social push). Unlocks PA-API.
- [ ] **Watch affiliate-click analytics**, not vanity metrics. Double down on the bundle types /
      occasions that actually convert; cut what doesn't.
- [ ] **Scale content via the approval queue** toward the converting categories.
- [ ] **Turn on price-drop / back-in-stock alerts** — the main repeat-conversion engine.
- [ ] **Add 1–2 direct/premium networks** for your highest-traffic brands (better margins).
- [ ] **Launch / grow community** (publish, remix, leaderboards) to compound content + trust.

---

## THE SHORT VERSION (if you read nothing else)
1. Pick a name + domain (no "Amazon" in it). 2. Sign up for **Sovrn/Skimlinks** (instant
monetization) and **Amazon Associates** (start the 3-sale clock). 3. Provision Postgres +
deploy to Vercel + add analytics + turn on cron. 4. Replace placeholder images and verify the
catalog. 5. Confirm disclosures + `rel` attributes + a quick legal review. 6. Make ONE look page
breathtaking, then scale content through the approval queue toward whatever converts.

— end NEXT_STEPS.md —
