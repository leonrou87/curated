# MILESTONE-2.md
### The breathtaking `/looks/[slug]` page — deep spec + component tree

> This is the page the entire product hinges on. If this one route is breathtaking, the rest of
> the build has a north star; if it's mediocre, nothing downstream matters. Build THIS to a
> "stop and stare" bar before scaling to other routes. A working reference implementation ships
> alongside this doc (the `LookDetail` artifact) — treat it as the visual + interaction target,
> then wire it to real data and the shared coherence package.

---

## 1. THE JOB OF THIS PAGE (one sentence)
Make a person feel a complete, considered look land in front of them — then let them shop every
piece by touching it on the image, swap into the builder, and save it — without ever feeling like
they're on an affiliate site.

---

## 2. THE EXPERIENCE, TOP TO BOTTOM (the intended scroll)

1. **Cover.** Full-bleed lifestyle hero. The look title in display serif overlaps the image
   bottom-left; an occasion eyebrow + price range sit quietly above it. This is a magazine cover,
   not a product page. On entry, the **assemble reveal** plays (DESIGN-SYSTEM.md §5): hero fades
   in, then the shoppable pins bloom onto it one by one, then the title wipes up, then "why it
   works" fades in line by line. Reduced-motion → a calm single fade.

2. **Shoppable hero.** The pins ON the image are the primary shopping interface. Tapping a pin
   opens an item card (thumbnail, brand, title, price, Shop CTA) anchored to the dot, with a
   connector line. Hovering a pin also highlights the matching row in the breakdown below
   (shared hover state). Max ~6 pins; overflow clusters into a "+N".

3. **The breakdown.** Below the cover, the flat-lay item list — each row: image, role tag
   (TOP / SHOES / BAG…), brand + title, price (mono), and the only outbound button style,
   `AffiliateCTA`. **The FTC disclosure sits directly above the first CTA** here. Hovering a row
   highlights its pin on the cover.

4. **Why it works.** The curator note, set as editorial pull-quote text (display serif, generous
   measure). This is the taste signal — it must read like a stylist wrote it, because the
   coherence engine generated it from real satisfied constraints.

5. **Budget ↔ Splurge toggle.** A single control that swaps the look between price variants;
   prices re-ticker, pins/rows crossfade. Same look, two budgets.

6. **Make it yours.** A prominent entry into the **builder** ("Style this look" → opens the
   canvas pre-loaded with these items + alternates). Plus Save (flies to closet) and Share.

7. **Complete the look / you might also like.** Smart upsells + related looks (same engine:
   "people who built this also built…"). Keeps them in the experience.

8. **Quiet footer.** Persistent affiliate disclosure + nav. Honest, unobtrusive.

---

## 3. COMPONENT TREE (build these; names match DESIGN-SYSTEM.md §8)
```
<LookDetail look={Look}>
  <LookReveal>                      // orchestrates the entry animation (§5 design doc)
    <LookCover>
      <HeroImage priority blur />   // next/image, full-bleed, parallax on scroll
      <CoverMeta>                   // eyebrow (occasion) + title (serif) + PriceRange (mono)
      <ShoppablePins items pins>    // the image IS the interface
        <Pin /> × n  → <PinCard />  // popover: thumb, brand, title, price, AffiliateCTA
        <PinCluster +N />
  <LookBreakdown items>
    <DisclosureInline />            // FTC line ABOVE the first AffiliateCTA — compliance
    <ItemRow /> × n                 // image, role tag, brand/title, PriceMono, AffiliateCTA
                                    // hover ⇄ pin highlight (shared state via context/zustand)
  <WhyItWorks note />              // editorial pull-quote; from coherence engine
  <CoherenceBadge score />         // subtle; shows the look is "validated" (taste proof)
  <BudgetSplurgeToggle variants /> // swaps variant; PriceRange re-tickers
  <MakeItYours>
    <Button → /builder?seed=slug>Style this look</Button>
    <SaveButton />                 // shared-layout flight to closet icon
    <ShareButton />                // OG image = the final reveal frame
  <CompleteTheLook upsells />
  <RelatedLooks looks />
  <SiteFooter><DisclosureBanner /></SiteFooter>
```

### State & data
- `look` comes from the DB (seed → Prisma). Pin coords are `BundleItem.pinX/pinY`.
- Shared hover state (pin ⇄ row) via a small context or zustand store — keep it local to the page.
- `resolveBestOffer(item)` decides which network's link each `AffiliateCTA` uses; the component
  never knows the network. Always `rel="sponsored nofollow"`, new tab; fires `useAffiliateClick`.
- Budget/splurge variants come from `BundleItem.variant` groups.
- `<CoherenceBadge>` reads `Bundle.coherence.score` — a quiet trust signal, not a loud number.

---

## 4. MOTION SPEC (the signature — get this right)
- **Entry reveal** (~900ms, skippable, reduced-motion fallback): hero fade+scale 1.04→1.0 →
  pins bloom staggered (spring) → title mask-wipe up → why-it-works lines fade in (60ms stagger).
- **Pin interactions:** resting dots gently breathe (scale 1.0↔1.08, 2.4s) so they read as
  interactive; tap = spring-scale the card in with a connector line.
- **Row ⇄ pin link:** hovering either highlights the other (accent ring pulse).
- **Budget/splurge:** crossfade items + count the price up/down (mono, tabular nums).
- **Save:** the look shrinks along an arc into the closet icon (Framer shared layout); badge bumps.
- Everything honors `prefers-reduced-motion` (transforms → instant + soft opacity).

---

## 5. THE QUALITY BAR (how you know it's "breathtaking")
- A stranger lands on it and says "what is this" — in a good way — before they scroll.
- The image, not a grid of cards, is obviously the thing you interact with.
- The type has a point of view; it doesn't look like a Tailwind starter.
- The reveal earns a screenshot. The save earns a little smile.
- Nothing on screen says "affiliate." Disclosure is honest but the page feels like a magazine.
- Lighthouse: perf ≥95, a11y 100. LCP <2.5s (hero is priority-loaded). CLS ~0. Pins are
  keyboard-navigable with visible focus. Reduced-motion path is calm, not broken.

---

## 6. HOW TO USE THE REFERENCE ARTIFACT
The shipped `LookDetail` artifact is a single self-contained React file using one of the seed
looks. It demonstrates: the cover + shoppable pins, the breakdown with compliant CTAs, why-it-
works, the budget/splurge toggle, the coherence badge, and the core motion (entry reveal, pin
cards, row⇄pin highlight, save). It is intentionally close to production:
- Replace inline sample data with the real `Look` from Prisma/seed-bundles.json.
- Replace the placeholder image blocks with `next/image` + real imagery.
- Swap the hardcoded links for `resolveBestOffer()` + `useAffiliateClick()`.
- Lift the design tokens into `tokens.css` (they already mirror DESIGN-SYSTEM.md).
- Port the motion to Framer Motion in the Next app (the artifact uses CSS/JS so it runs anywhere).

Build the Next version to match or exceed the artifact's feel, then move to milestone 3.

— end MILESTONE-2.md —
