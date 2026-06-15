# DECISIONS.md
### Architecture, stack, schema, and the personalization + composition model for "Curated"

> **Purpose:** This is the sign-off document the master prompt requires before app code. It locks
> the stack, the data model, the personalization approach, the monetization architecture, and the
> open questions needing a human answer. It is the contract the other docs build against:
> COHERENCE-ENGINE.md (how looks are made), DESIGN-SYSTEM.md (how it feels), and the seed data.
> Read this first; it is the source of truth for shapes and names.

---

## 1. STACK (locked unless you object in review)

| Layer | Choice | Why |
|---|---|---|
| App framework | **Next.js (App Router) + TypeScript** | SSG/ISR for cheap, fast, SEO-strong catalog + dynamic personalized routes. One repo, one language across web + pipeline. |
| Styling | **Tailwind + CSS variables** (tokens from DESIGN-SYSTEM.md) | Token-driven, themeable (dark/light), no ad-hoc values. |
| UI primitives | **shadcn/ui + Radix** | Accessible, unstyled-enough to take our design language. |
| Motion | **Framer Motion** | Shared-layout transitions, springs, the assemble reveal, reduced-motion branch. |
| Icons | **lucide-react** | Consistent, light. |
| DB + ORM | **Postgres + Prisma** (SQLite for local/zero-key dev) | Relational fits the offer/bundle/user graph; Prisma gives typed models shared by web + pipeline. |
| Auth | **Auth.js (NextAuth)** — email magic-link + OAuth | Low-friction accounts for Closet/community; works logged-out first. |
| Pipeline | **TypeScript service in `/pipeline`** (same monorepo, shared Prisma + types) | No type drift between ingest and render. CLI-driven, cron-friendly. |
| LLM | **Model-agnostic provider interface** (`llm.propose`, `llm.enrich`, `llm.narrate`) | Swap models freely; all LLM steps optional with deterministic fallbacks. |
| Vision | **Pluggable vision provider** for visual search + image tagging | Degrades to "vibe match" without keys. |
| Hosting | **Vercel** (web) + managed Postgres (Neon/Supabase) | Note Netlify as alt in README. |
| Analytics | **GA4 or Plausible** (configurable) | Affiliate-click events are the conversion proxy. |
| Monetization | **Layered offer resolution** (Sovrn/Skimlinks default → Amazon PA-API → direct networks) | Solves cold-start + Amazon's 3-sale rule; never single-point-of-failure. Carried from prior specs. |

**Monorepo layout:**
```
/curated
  /web         Next.js app (app/, components/, lib/, public/)
  /pipeline    ingest adapters, enrich, coherence/, composer, cli/
  /packages
    /db        Prisma schema + client (shared)
    /types     shared TS types (Brief, StylingProfile, etc.)
    /coherence the scorer (pure, unit-tested) — imported by BOTH web (builder) and pipeline
  /data        seed CSVs, seed bundle JSON, exported snapshots
  /docs        DECISIONS.md, COHERENCE-ENGINE.md, DESIGN-SYSTEM.md
```
> **Key decision:** the coherence scorer lives in a **shared package** so the live builder (web)
> and batch generation (pipeline) run the *identical* code. One brain, two surfaces.

---

## 2. THE DATA MODEL (full schema — the contract)

Offer-centric (a Product is monetizable via one or more Offers; the frontend never hardcodes a
network). Styling metadata lives on Product. Bundles are scored compositions over slots.

```prisma
// ---------- Catalog ----------
model Product {
  id           String   @id @default(cuid())
  title        String
  brand        String
  category     String
  subcategory  String?
  canonicalUrl String
  imageUrls    String[]
  styling      Json     // StylingProfile (see COHERENCE-ENGINE.md §1)
  slotRoles    String[] // which slots this can fill
  createdAt    DateTime @default(now())
  offers       Offer[]
  bundleItems  BundleItem[]
  @@index([category])
}

model Offer {
  id              String   @id @default(cuid())
  productId       String
  product         Product  @relation(fields:[productId], references:[id])
  network         String   // sovrn | amazon | shareasale | cj | impact | direct | manual
  merchant        String
  affiliateUrl    String
  rawUrl          String
  priceTier       String   // budget | mid | premium
  priceSnapshot   Int?     // cents; ONLY for PA-API-compliant or merchant-fed sources
  currency        String   @default("USD")
  inStock         Boolean  @default(true)
  commissionEst   Float?   // for resolveBestOffer ranking
  status          String   @default("active") // active | stale | dead
  lastCheckedAt   DateTime @default(now())
  @@index([productId])
  @@index([status])
}

// ---------- Bundles (looks/kits/collections/gifts) ----------
model Bundle {
  id            String   @id @default(cuid())
  slug          String   @unique
  type          String   // look | kit | collection | gift
  title         String
  brief         Json     // Brief (occasion, vibe, activity, recipient, gender, budgetTier, season)
  heroImage     String
  flatLayImage  String?
  curatorNote   String   // "why it works" — generated from satisfied constraints
  estPriceLow   Int      // cents
  estPriceHigh  Int
  coherence     Json     // CoherenceResult snapshot (score, ruleScores, heroItemId)
  state         String   @default("draft") // draft | approved | published | archived
  generatedBy   String   // manual | assisted | greedy
  authorId      String?  // null = house-curated; set for UGC
  sourceBundleId String? // remix lineage
  visibility    String   @default("public") // public | private
  featured      Boolean  @default(false)
  publishedAt   DateTime?
  createdAt     DateTime @default(now())
  items         BundleItem[]
  @@index([type, state])
}

model BundleItem {
  id        String  @id @default(cuid())
  bundleId  String
  bundle    Bundle  @relation(fields:[bundleId], references:[id])
  productId String
  product   Product @relation(fields:[productId], references:[id])
  slotId    String  // 'anchor' | 'shoes' | 'bag' | ...
  role      String
  note      String?
  pinX      Float?  // shoppable image pin coords (0..100 %)
  pinY      Float?
  variant   String  @default("core") // core | budget | splurge
  swapAlternates String[] // productIds powering the builder's swap tray
  @@index([bundleId])
}

model SlotDefinition {
  id         String @id @default(cuid())
  bundleType String
  briefMatch Json   // partial Brief this applies to
  slots      Json   // Slot[] (see COHERENCE-ENGINE.md §2)
}

// ---------- Users / personalization ----------
model User {
  id           String @id @default(cuid())
  email        String @unique
  handle       String? @unique
  createdAt    DateTime @default(now())
  profile      StyleProfile?
  saved        SavedItem[]
  bundles      Bundle[]      @relation("AuthoredBundles")
  interactions Interaction[]
  alerts       Alert[]
}

model StyleProfile {
  userId           String  @id
  user             User    @relation(fields:[userId], references:[id])
  genderPresentation String?
  sizes            Json    // {top, bottom, shoe, fitNotes}
  bodyType         String? // optional, respectful, silhouette-guidance only
  budgetBand       String  // budget | mid | premium
  colorLikes       String[]
  colorDislikes    String[] // HARD constraint in the scorer
  styleArchetypes  String[]
  brandsLoved      String[]
  brandsAvoided    String[] // HARD constraint
  currentIntent    String?
  derivedSignals   Json    // learned weights from behavior
  embedding        Float[] // built from liked styles, for retrieval/ranking
  version          Int     @default(1)
  updatedAt        DateTime @updatedAt
}

model SavedItem {
  id       String @id @default(cuid())
  userId   String
  user     User   @relation(fields:[userId], references:[id])
  bundleId String?
  productId String?
  type     String // save | wishlist | owned
  addedAt  DateTime @default(now())
  @@index([userId])
}

model Interaction {
  id       String @id @default(cuid())
  userId   String?
  type     String // view | save | swap | click | publish | rate | buy-intent
  targetId String
  context  Json?
  ts       DateTime @default(now())
  @@index([userId, type])
}

model Alert {
  id        String @id @default(cuid())
  userId    String
  offerId   String
  type      String // price-drop | back-in-stock
  threshold Int?   // cents
  active    Boolean @default(true)
}

model CreatorStats {
  userId      String @id
  saves       Int @default(0)
  remixes     Int @default(0)
  conversions Int @default(0)
  rank        Int?
}

model LinkHealth {
  offerId       String @id
  lastStatus    String
  lastCheckedAt DateTime @default(now())
  failCount     Int @default(0)
}
```

**Shared TS types** (in `/packages/types`) mirror `styling`, `brief`, `coherence`, `slots` Json
blobs so web + pipeline + scorer share one definition. The Json columns are typed at the app edge.

---

## 3. PERSONALIZATION MODEL (decision)

- **StyleProfile drives retrieval + ranking everywhere.** Built from swipe onboarding, refined by
  every Interaction (progressive). Stored as explicit fields + a learned `embedding` + `derivedSignals`.
- **Retrieval:** filter catalog by hard profile constraints (size, dislikes, avoided brands,
  budget). **Ranking:** score candidates by `profileFit (embedding sim) + formalityMatch +
  freshness + socialProof + priceFit + brandLoved`. Explainable: persist top factor per item for
  "why you're seeing this."
- **Logged-out works:** a session-scoped profile; upgrades/persists on sign-up. Never gate value
  behind the form — let users skip and personalize from behavior.
- **The same Brief object** (intent merged with profile) feeds NL styling, visual search, the
  feed, and the composer — one input shape, many surfaces.

---

## 4. COMPOSITION MODEL (decision — defers to COHERENCE-ENGINE.md)

- LLM proposes a slot fill + rationale; the **deterministic scorer validates + repairs**; nothing
  incoherent ships. Zero-key path uses the greedy composer. Identical scorer in builder + batch.
- Publish gate: `coherence.passed && score≥72 && originalityOK && imagesOK && linkHealthOK`.
- Every generated/UGC bundle stores its `CoherenceResult` for ranking, transparency, debugging.

---

## 5. MONETIZATION (decision — carried, restated for the contract)

- **resolveBestOffer(product)** ranks Offers by `commissionEst × inStock × priceFit`. Frontend
  renders the winner; never network-specific code in components.
- **Layer order:** Sovrn/Skimlinks (default, instant breadth, solves cold-start) → Amazon PA-API
  (gated by the 3-sales rule; graceful no-op without creds) → direct networks over time.
- **Link-health loop** flips Offer.status; dead/stale → auto-swap to a BundleItem.swapAlternate,
  else hide item + flag bundle. First-class scheduled job, not an afterthought.
- Compliance is acceptance criteria, not advice: FTC disclosure ABOVE the first affiliate CTA;
  Amazon required disclosure text + tag; `rel="sponsored nofollow"`; no Amazon price caching
  outside PA-API; CI lint fails the build on a non-compliant outbound link.

---

## 6. OPEN QUESTIONS FOR THE HUMAN (answer before/at sign-off)

1. **Fonts:** OK to ship with Fraunces/Inter/Geist Mono as licensed-face stand-ins (swappable via
   two variables)? Or do you have licensed faces (Canela/Suisse) to drop in now?
2. **Default theme:** dark-gallery default with light alternate — confirm? (Recommended.)
3. **Brand name & domain:** "Curated" is a placeholder. Note: Amazon forbids "Amazon" in the
   domain; pick a name now so SEO/OG/structured data are correct from day one.
4. **Launch categories priority:** confirm flagship = Looks, plus ONE non-fashion vertical fully
   for milestone 10 — golf or desk-setup? (Affects which seed kit we polish.)
5. **Community at launch vs. later:** ship publish/remix in v1, or catalog+personalization first
   and community in a fast-follow? (Recommended: personalization first, community fast-follow.)
6. **Secrets timeline:** Sovrn/Skimlinks ID available now? Amazon Associates tag now (PA-API will
   lag the 3-sale rule)? LLM + vision provider keys now or deterministic-only for first demo?

---

## 7. SIGN-OFF CHECKLIST (what "approved" means)
- [ ] Stack accepted (or changes noted).
- [ ] Schema in §2 approved (names/shapes are the contract).
- [ ] Personalization model (§3) approved.
- [ ] Composition model defers to COHERENCE-ENGINE.md — approved.
- [ ] Monetization + compliance (§5) approved.
- [ ] Open questions (§6) answered.
> On approval, proceed to milestone 1 (scaffold + schema + tokens + /styleguide + seed bundles).
> Build milestone 2 (`/looks/[slug]`) to a "breathtaking" bar before scaling.

— end DECISIONS.md —
