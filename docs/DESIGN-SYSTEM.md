# DESIGN-SYSTEM.md
### The visual + motion language for "Curated" — how it looks, moves, and feels

> **Purpose for the implementing agent:** This is buildable as-is. It defines the design
> philosophy, tokens (color, type, space, radius, elevation, motion), the core component specs,
> the signature **assemble-on-screen reveal**, the **shoppable image pins**, the **tactile
> builder**, mobile gestures, and accessibility/performance rules. Implement tokens as CSS
> variables + a Tailwind theme extension. Build a living `/styleguide` route that renders every
> token and component. **Bar: SSENSE × Aimé Leon Dore × a great print magazine — never a
> typical shopping/affiliate grid.**

---

## 0. PHILOSOPHY (the five rules everything obeys)

1. **The look is the hero.** Imagery dominates; chrome recedes. The UI is a quiet gallery frame
   around loud, beautiful clothes/products.
2. **Editorial, not e-commerce.** Magazine rhythm and confidence — varied layouts, generous
   negative space, real typographic point of view. Never a monotonous card grid.
3. **Motion is personality.** Smooth, physical, purposeful. Every key action has a small moment
   of delight. Nothing janky, nothing gratuitous.
4. **The image is the interface.** You shop by tapping items *on the photo*, you build by
   *arranging*, you discover by *swiping*. Direct manipulation over forms.
5. **Premium = fast + quiet + intentional.** Restraint over decoration. Speed is a feature you
   can feel. Every value is a token; nothing is ad-hoc.

---

## 1. COLOR TOKENS

Default theme is a **deep, gallery-neutral dark** so product imagery pops; a **paper-light**
theme is a first-class alternate. Keep brand chrome nearly monochrome + ONE restrained accent;
let the merchandise supply the color.

```css
:root {
  /* ---- Dark (default) ---- */
  --bg:            #0E0E0F;   /* near-black, slightly warm */
  --surface:       #161617;   /* cards / sheets */
  --surface-2:     #1F1F21;   /* raised / hover */
  --line:          #2A2A2D;   /* hairlines, 1px borders */
  --ink:           #F4F2EE;   /* primary text (warm white, not pure) */
  --ink-soft:      #B9B6AF;   /* secondary text */
  --ink-mute:      #7E7B75;   /* tertiary / captions */

  --accent:        #C8612F;   /* terracotta — the ONLY brand accent. Used sparingly. */
  --accent-soft:   #E08A5A;
  --accent-ink:    #0E0E0F;   /* text on accent */

  --positive:      #5B8C6E;   /* coherence-good, in-stock */
  --warning:       #C9A14A;   /* coherence-caution */
  --danger:        #B4544A;   /* dead link, error */

  --overlay-grad:  linear-gradient(180deg, transparent 40%, rgba(0,0,0,.72) 100%);
}

[data-theme="light"] {
  --bg:        #F6F3EE;   /* warm paper */
  --surface:   #FFFFFF;
  --surface-2: #EFEAE2;
  --line:      #E0D9CE;
  --ink:       #17150F;
  --ink-soft:  #4A463D;
  --ink-mute:  #847E70;
  --accent:    #B4501F;
  --accent-soft:#D06E3C;
  --accent-ink:#FFFFFF;
}
```
**Usage law:** accent appears on ≤ ~5% of any screen (one CTA, the coherence meter fill, an active
pin). Never accent-on-accent. Status colors only for status, never decoration.

---

## 2. TYPOGRAPHY

Two families. A **display serif** for editorial headlines (the magazine voice) + a **clean
grotesque sans** for UI/body. One mono for prices/specs gives a subtle "spec sheet" texture.

```
Display serif:  "Canela", "Ogg", or fallback "Fraunhall"/Playfair-class  → headlines, look titles
UI sans:        "Suisse Int'l" / "Inter" / "Geist"                        → everything functional
Mono accent:    "Söhne Mono" / "Geist Mono"                               → prices, sizes, specs
```
(Implementing agent: use freely-licensed stand-ins — **Fraunces** (display serif), **Inter**
(sans), **Geist Mono** — wired so the human can swap in licensed faces by changing two variables.)

**Type scale** (fluid, `clamp()`; 1.25 major-third on desktop, tightens on mobile):
```css
--t-display: clamp(2.5rem, 6vw, 5rem);     /* hero look titles, editorial covers */
--t-h1:      clamp(2rem, 4vw, 3.25rem);
--t-h2:      clamp(1.5rem, 2.6vw, 2.25rem);
--t-h3:      1.5rem;
--t-body:    1.0625rem;   /* 17px, comfortable editorial reading */
--t-small:   0.9375rem;
--t-caption: 0.8125rem;   /* captions, disclosures */
--leading-tight: 1.05;    /* display */
--leading-body:  1.55;
--tracking-display: -0.02em;  /* serif display, slightly tight */
--tracking-ui: 0;
--tracking-caps: 0.08em;      /* small caps labels */
```
- Display serif set **tight tracking, tight leading**, large — it should feel like a cover.
- Labels/eyebrows: UI sans, UPPERCASE, `--tracking-caps`, `--ink-mute`.
- Prices/sizes: mono, tabular numbers.

---

## 3. SPACE, RADIUS, ELEVATION, GRID

```css
/* 4px base; generous by default (editorial breathing room) */
--s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px;
--s-7:48px; --s-8:64px; --s-9:96px; --s-10:128px;

--r-sm:6px; --r-md:12px; --r-lg:20px; --r-xl:28px; --r-pill:999px;
/* imagery uses small radius or none (gallery); chips/buttons use pill or --r-md */

--e-1: 0 1px 2px rgba(0,0,0,.30);
--e-2: 0 6px 24px rgba(0,0,0,.34);
--e-3: 0 18px 60px rgba(0,0,0,.45);   /* sheets, the reveal card */
/* dark theme leans on contrast + hairlines more than shadows */
```
**Grid:** 12-col desktop, 8-col tablet, 4-col mobile; gutter `--s-5`; max content width ~1240px,
but **hero/editorial blocks break out full-bleed**. Deliberately vary block heights to avoid grid
monotony (magazine rhythm): alternate full-bleed hero → 2-up → asymmetric 1/3–2/3 → full-bleed.

---

## 4. MOTION TOKENS (the soul)

```css
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);    /* enters, reveals — confident settle */
--ease-inout:  cubic-bezier(0.65, 0, 0.35, 1);   /* page transitions */
--spring:      /* use Framer Motion spring */ { stiffness: 420, damping: 34, mass: 0.9 };
--dur-fast: 140ms; --dur-base: 240ms; --dur-slow: 420ms; --dur-reveal: 900ms;
```
**Principles:** ease-out for things appearing; springs for anything draggable/tactile; stagger
children by 40–60ms for the "assembling" feel; ALWAYS honor `prefers-reduced-motion` (swap
transforms for instant + a soft opacity fade).

Use **Framer Motion** (`layout`, `AnimatePresence`, shared layout transitions) as the motion lib.

---

## 5. SIGNATURE MOMENT — THE ASSEMBLE-ON-SCREEN REVEAL

When NL styling / visual search / "generate a look" returns a result, do NOT pop a finished card.
**Assemble it theatrically** — this is the shareable magic.

Sequence (total ~900ms, skippable, reduced-motion → simple fade):
```
0ms     Backdrop dims; a soft spotlight vignette blooms (--overlay-grad) center-stage.
80ms    The hero/lifestyle image fades+scales in from 1.04 → 1.00 (--ease-out, 420ms).
260ms   Slot pieces (top, bottom, shoes, bag, accessory) fly IN from the edges to their
        flat-lay positions, staggered 55ms each, slight rotation settle via --spring.
        Each piece lands with a 1px accent ring pulse + a faint tick.
640ms   The look title (display serif) wipes up from a mask; price range counts up (mono).
760ms   "Why it works" fades in line-by-line (2–3 lines, 60ms stagger).
820ms   Shoppable pins bloom on the hero image (scale 0→1, --spring), then settle to resting.
```
- Build as a single `<LookReveal>` orchestrator using staggered Framer variants.
- Provide `prefersReducedMotion` branch: hero fade (180ms) + everything else instant.
- The reveal is also the **share asset**: capture the final frame for OG image / "share this look."

---

## 6. SHOPPABLE IMAGE PINS (the image is the interface)

On every look hero/lifestyle image, overlay tappable pins anchored to item coordinates.
```
Pin resting:   12px dot, --ink @ 85% with a 2px --bg ring + subtle --e-1; gentle breathing
               (scale 1.0↔1.08, 2.4s, ease-inout) so users notice it's interactive.
Pin hover/tap: expands to a card popover (--surface, --r-md, --e-2): thumbnail, title, brand,
               price (mono), "Shop" CTA (accent). Connector line from dot to card.
Active state:  the corresponding flat-lay item + builder slot highlight in sync (shared state).
Mobile:        long-press peeks all pins (dim image, pins glow); tap opens the item sheet.
```
- Pin coordinates stored per look item as `{x%, y%}` (from curation or vision detection).
- Pins must be keyboard-navigable (Tab between pins, Enter opens) and have aria-labels.
- Never let pins clutter: max ~6 visible; cluster overflow into a "+N" pin.

---

## 7. THE TACTILE BUILDER (Polyvore reborn)

Feel: arranging a moodboard / dressing a figure. Direct, physical, satisfying.
```
Layout:  left = the "stage" (the look as a flat-lay / on-figure composition);
         right (desktop) / bottom-sheet (mobile) = the swap tray of ranked alternates per slot.
Drag:    spring-follow cursor/touch (slight lag + scale 1.06 while dragging, --e-3 lift).
Drop:    slot shows a glowing accept-zone; piece SNAPS in with a spring overshoot + tick.
Swap:    old piece crossfades out as new crossfades in (--dur-base); price re-tickers (mono).
Coherence meter: a slim vertical/horizontal bar, fill animates to new score (§ from coherence
         engine). Color: --danger→--warning→--positive across 0→72→100. One-line tip appears
         below on sharp drops ("a neutral shoe would balance this"). GUIDE, never block.
"Fix it for me": runs repair() once; the swapped piece animates in via the same snap.
Save:    the assembled look LITERALLY FLIES to the closet icon (shared-layout transition,
         shrinks along an arc), closet badge bumps. Tiny haptic on mobile.
```
- All builder interactions ≤ one frame of input latency; scorer is pure + memoized to hit 60fps.
- Empty slots show a tasteful dashed ghost with the slot's role label (small caps, --ink-mute).

---

## 8. CORE COMPONENTS (specs the agent builds into `/styleguide`)

- **LookCard (editorial):** full-bleed image, gradient scrim (`--overlay-grad`), title in display
  serif bottom-left, price range (mono) + occasion eyebrow (small caps). Hover: image scales 1.03,
  scrim deepens, a thin accent underline wipes under the title. NOT a boxed product card.
- **FeedMasonry:** varied-height editorial masonry (not uniform grid). Inject full-bleed
  "editorial breaks" (trend drops, this-week covers) every ~6 items for magazine rhythm.
- **ItemRow (flat-lay breakdown):** thumbnail, title/brand, role tag, price (mono), Shop CTA;
  hovering syncs the matching image pin + builder slot.
- **AffiliateCTA:** the only outbound button style. Accent fill, label "Shop {brand}", arrow that
  nudges right on hover. Always `rel="sponsored nofollow"`, new tab. **Disclosure caption sits
  directly above the FIRST AffiliateCTA on any view** (compliance + honesty).
- **CoherenceMeter:** §7. Reusable in builder + on auto-gen looks (shows the look's score subtly).
- **StyleSwiper (onboarding):** full-screen style cards, swipe right=love / left=pass, springy
  card stack, progress dots. Feels like a game, not a form.
- **NLPromptBar:** oversized, centered, serif placeholder ("Dress me for a fall outdoor
  wedding…"); on submit → triggers the Reveal. Recent prompts as quiet chips below.
- **Sheet / Drawer:** mobile bottom-sheets with rubber-band drag, `--e-3`, rounded `--r-xl` top.
- **PriceRange (mono):** "$$–$$$" tier glyphs + a real range when compliant; "updated {time}".
- **DisclosureBanner:** quiet, honest, persistent footer + the above-CTA inline caption.

---

## 9. MOBILE — GESTURE-NATIVE (the primary canvas)

- **Feed:** vertical scroll of full-bleed looks; **swipe up** = next look (story-like), **double-tap**
  = save (heart blooms), **swipe right** on a look = add to closet, **long-press** = peek pins.
- **Builder:** bottom swap-tray; drag pieces up onto the stage; pinch to zoom the flat-lay.
- **Reveal** plays full-screen on mobile — maximal drama on the small canvas.
- Thumb-reachable primary actions; nav as a minimal bottom bar (Feed / Style / Build / Closet /
  You). Hide chrome on scroll-down, reveal on scroll-up.
- Every gesture has a visible affordance the first time (coachmark, once).

---

## 10. IMAGERY RULES (it's a visual product — protect the feel)

- Consistent treatment: prefer clean/neutral backgrounds for flat-lays; lifestyle heroes for
  covers. Subtle uniform grade so a mixed-source catalog still feels curated.
- `next/image` everywhere: responsive sizes, AVIF/WebP, **blur-up placeholders**, priority on hero,
  lazy + fade-in (`--dur-base`) for the rest. Aspect-ratio boxes to prevent layout shift.
- Seed/sample images clearly flagged for the human to replace with licensed/PA-API imagery.
- Never stretch/crop a garment awkwardly; respect aspect ratios; pad with `--surface` if needed.

---

## 11. ACCESSIBILITY & PERFORMANCE (part of "premium," not an afterthought)

- **Reduced motion:** full alternate path (fades/instant) for the reveal, builder, pins, feed.
- **Contrast:** body text ≥ AA on every surface; verify accent CTA contrast in both themes.
- **Keyboard:** pins, swatches, builder swaps, swiper all operable; visible focus rings (accent,
  2px, offset). Skip-to-content. Logical tab order following the editorial reading order.
- **Screen readers:** every look image has descriptive alt; pins have item aria-labels; the
  coherence meter announces score changes politely (aria-live).
- **Performance budget:** LCP < 2.5s on 4G, CLS ~0, hero priority-loaded; route-level code-split;
  the builder's scorer memoized; target Lighthouse ≥ 95 perf / 100 a11y on key routes.

---

## 12. DELIVERABLES FOR THIS DOC

1. `tokens.css` (all variables, both themes) + Tailwind theme extension consuming them.
2. `/styleguide` route rendering: palette, type scale, spacing, radii, elevations, motion demos,
   and every component in §8 with live states.
3. `<LookReveal>` orchestrator (§5) with reduced-motion branch — the signature moment.
4. `<ShoppablePins>` (§6), `<LookBuilder>` (§7), `<StyleSwiper>`, `<NLPromptBar>` (§8).
5. A short Figma-less "feel test": the `/looks/[slug]` page must be demoably *breathtaking* before
   any scaling work (per master build order milestone 2).

— end DESIGN-SYSTEM.md —
