# Affiliate setup — exactly what to sign up for, and where to paste it

Everything below plugs into the **admin console** at **`/admin`** (start the app, then open
`http://localhost:3000/admin`). You paste IDs in **Admin → Affiliate networks**; the site
immediately wraps every outbound link with them. No code changes, no redeploy.

> **The one-sentence version:** sign up for **Sovrn/Skimlinks** (monetizes everything on day one),
> add your **Amazon Associates** tag (start the 3-sale clock), then add **direct networks**
> (ShareASale / CJ / Impact) over time for your highest-traffic brands.

---

## The strategy (why this order)

Affiliate income has a cold-start problem: most premium programs want traffic/sales before they
approve you, and Amazon will *close* your account if you don't make 3 sales in 180 days. So we
**layer** it:

1. **Sovrn/Skimlinks first** — one signup auto-affiliates links across *thousands* of merchants.
   Approval is fast and doesn't require existing sales. This is what makes the site earn on day one.
2. **Amazon Associates** — huge catalog, but gated. Add the tag now to start the clock; the code
   gracefully no-ops Amazon until you're established, and Sovrn covers Amazon links meanwhile.
3. **Direct networks** (ShareASale, CJ, Impact) — 2–4× the commission for specific brands, but each
   needs its own approval. Add them once you see which brands actually convert.

The app's `resolveBestOffer()` automatically picks the best-paying available network per product,
so you never have to hand-route links.

---

## 1. Sovrn Commerce (Skimlinks) — DO THIS FIRST

- **Site:** https://www.sovrn.com/commerce/  (or https://skimlinks.com — same company)
- **Sign up.** You'll need your site name/URL. Approval is usually quick and does **not** require
  existing sales.
- **Get your Publisher / Site ID** from the dashboard.
- **Paste it:** Admin → Affiliate networks → *Sovrn Commerce / Skimlinks* → **Publisher / Site ID**.
- **Result:** every outbound product link is now wrapped through Sovrn and earns commission across
  thousands of merchants — including, for many retailers, Amazon.

## 2. Amazon Associates — start the clock now

- **Site:** https://affiliate-program.amazon.com/
- **Sign up.** You'll get an **Associate tag** like `yourtag-20`.
- **Paste it:** Admin → Affiliate networks → *Amazon Associates* → **Associate tag**, and enable it.
- ⚠️ **The 3-sale rule:** make **3 qualifying sales within 180 days** or the account is closed.
  Share a few looks, do light SEO. The site does **not** depend on Amazon — Sovrn carries you.
- **PA-API (Product Advertising API)** is granted only **after** those 3 sales. Once you have it,
  add the access key + secret + region (Admin form has fields, or use `.env`). Until then the
  Amazon adapter no-ops gracefully.
- ⚠️ **Never cache Amazon prices** except via PA-API. The app shows price tiers/ranges by design —
  keep it that way.
- ⚠️ Amazon forbids "Amazon" (or anything confusingly similar) in your **brand/domain**. Pick a
  clean name before you apply.

## 3. Direct / premium networks — add over time

Each is a separate signup + approval. Add them once you know your top brands; commissions are
often 2–4× Sovrn's.

| Network | Site | Paste into Admin field | Good for |
|---|---|---|---|
| **ShareASale** | https://www.shareasale.com/info/ | *ShareASale → Affiliate ID* | Many DTC + mid-market fashion brands |
| **CJ Affiliate** | https://www.cj.com/ | *CJ Affiliate → Website ID (PID)* | Large/established brands |
| **Impact.com** | https://impact.com/ | *Impact.com → Account SID* | Lots of modern DTC programs |
| **Awin / Rakuten** | awin.com · rakutenadvertising.com | (add like the others — see note) | Brand-by-brand, EU breadth |

> Adding a brand-new network beyond the five built in = ~10 lines: add it to
> `data/affiliate-config.json`, add a `case` in `lib/affiliate-wrap.ts` with that network's link
> format, and (optionally) a form field in `components/admin/NetworkSettings.tsx`.

## 4. Analytics (your conversion signal) — strongly recommended

Affiliate-click events are how you'll see what's working (real sales data lags by days/weeks).

- **GA4:** create a property at https://analytics.google.com → paste the **Measurement ID**
  (`G-XXXXXXX`) into Admin → Affiliate networks → *Site → GA4 measurement ID*.
- **Plausible** (lighter, privacy-friendly): https://plausible.io → paste your **domain**.
- Either one auto-injects on the next page load. The "Shop" buttons already push an
  `affiliate_click` event with the product + network.

---

## How the admin console maps to all this

| Page | What you do there |
|---|---|
| **`/admin`** | Overview + go-live checklist + which networks are live |
| **`/admin/networks`** | Paste every ID/tag/key above. Saves to `data/affiliate-config.json` |
| **`/admin/links`** | Override any product's offer — force a network, or paste a **direct affiliate URL** you negotiated with a brand |
| **`/admin/approvals`** | Quality-gate + publish/unpublish/archive bundles. Nothing goes public without your approval |
| **`/admin/health`** | Check outbound links live; find dead links that silently kill revenue |

---

## Where the IDs are stored

- Console edits → `data/affiliate-config.json` (network IDs, analytics, site) and
  `data/offer-overrides.json` (per-product link overrides) and `data/bundle-state.json` (publish state).
- These files are git-ignored-safe to commit for non-secret IDs, **but** keep **PA-API secrets** and
  any private keys in `.env` (see `.env.example`) — never commit those. The config reader falls back
  to `.env` for secrets, so you can split: public IDs in the console, secrets in env.

## Compliance is already handled (don't undo it)

- FTC disclosure sits **above** the first affiliate link on every page + a `/disclosure` page.
- Every outbound link is `rel="sponsored nofollow"` and opens in a new tab.
- `npm run compliance` fails the build if any link violates this — keep it in CI.
- Amazon's required "As an Amazon Associate…" text is in the disclosure block.

## After it's earning

See `docs/NEXT_STEPS.md` for the full go-live runbook (domain, Postgres, Vercel deploy, cron for
link-health, legal review). The short list: pick a name + domain → Sovrn + Amazon → deploy + analytics
+ cron → replace placeholder images → confirm disclosures → make one look page breathtaking → scale
content through the approval queue toward whatever converts.
