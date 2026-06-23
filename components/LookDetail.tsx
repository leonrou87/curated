"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { EnrichedBundle } from "@/lib/types";
import { fmtCents, titleCase } from "@/lib/format";
import { FTC_DISCLOSURE } from "@/lib/offers";
import { aestheticOf } from "@/lib/aesthetics";
import { BundleCover } from "./BundleCover";
import { ProductLink } from "./ProductLink";
import { ShareButton } from "./ShareButton";
import { LookCard } from "./LookCard";
import { SafeImg } from "./SafeImg";
import { AddToCartButton } from "./AddToCartButton";
import { useSaved } from "@/lib/useSaved";
import { useCart } from "@/lib/useCart";

const TYPE_PATH: Record<string, string> = { look: "looks", kit: "kits", collection: "collections", gift: "gifts" };

// The hero page. Outfit collage → the note → a big, obviously clickable "Shop the look" grid
// (every product card is a compliant affiliate link) → more like this.
export function LookDetail({ bundle, related = [] }: { bundle: EnrichedBundle; related?: EnrichedBundle[] }) {
  const aesName = aestheticOf(String(bundle.brief.vibe)).name;
  const [revealed, setRevealed] = useState(false);
  const [stage, setStage] = useState(0);
  const [flight, setFlight] = useState(false);
  const reduce = useRef(false);
  const { saved, toggle } = useSaved(bundle.slug);
  const { addMany, items: cartItems } = useCart();
  const allInBag = bundle.items.length > 0 && bundle.items.every((it) => cartItems.some((c) => c.id === it.productId));
  const addLookToBag = () =>
    addMany(bundle.items.map((it) => ({ id: it.productId, brand: it.brand, title: it.title, image: it.image, priceCents: it.priceCents, url: it.bestOffer?.affiliateUrl || "#" })));

  const total = bundle.items.reduce((s, i) => s + (i.priceCents ?? 0), 0);
  const eyebrow = [bundle.brief.gender, bundle.brief.vibe || bundle.brief.occasion]
    .filter(Boolean).map((s) => titleCase(String(s))).join(" · ");

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) { setRevealed(true); setStage(9); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setRevealed(true), 60));
    t.push(setTimeout(() => setStage(2), 380));
    t.push(setTimeout(() => setStage(3), 620));
    return () => t.forEach(clearTimeout);
  }, []);

  const onSave = () => {
    toggle();
    if (!saved && !reduce.current) { setFlight(true); setTimeout(() => setFlight(false), 720); }
  };

  return (
    <div className="ld">
      {/* ── cover: the outfit collage ── */}
      <section className="cover">
        <div className={"cover-img" + (revealed ? " in" : "")}>
          <BundleCover bundle={bundle} />
          <div className="cover-meta">
            <div className={"cm-eyebrow" + (stage >= 2 ? " in" : "")}>{eyebrow}</div>
            <h1 className={"serif cm-title" + (stage >= 2 ? " in" : "")}>
              <span className="cm-title-mask">{bundle.title}</span>
            </h1>
            <div className={"cm-row" + (stage >= 2 ? " in" : "")}>
              <span className="mono cm-price">{fmtCents(total)}<i> the look</i></span>
              <span className="cm-dot">·</span>
              <span className="cm-count">{bundle.items.length} pieces</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── why it works — editorial pull-quote ── */}
      <section className={"why" + (stage >= 3 ? " in" : "")}>
        <span className="eyebrow why-label">The Note</span>
        <p className="serif why-note">{bundle.curatorNote}</p>
      </section>

      {/* ── SHOP THE LOOK — big clickable product cards ── */}
      <section className="shop">
        <header className="shop-head">
          <span className="index">{String(bundle.items.length).padStart(2, "0")} pieces</span>
          <h2 className="serif">Shop the Look</h2>
          <span className="eyebrow">Tap any piece</span>
        </header>
        <hr className="rule shop-rule" />
        <p className="disclosure">{FTC_DISCLOSURE}</p>
        <div className="prod-grid">
          {bundle.items.map((it, i) => (
            <div className="prod-card" key={it.productId}>
              <ProductLink
                offer={it.bestOffer}
                productId={it.productId}
                merchant={it.brand}
                className="pc-link"
                ariaLabel={`Shop ${it.brand} ${it.title}, ${fmtCents(it.priceCents)} (opens in a new tab)`}
              >
                <span className="pc-img" style={{ background: it.swatch }}>
                  {it.image && <SafeImg src={it.image} alt={it.title} loading="lazy" />}
                  <span className="index pc-idx">N°{String(i + 1).padStart(2, "0")}</span>
                  {it.isHero && <span className="pc-hero">★ Hero</span>}
                  <span className="pc-role">{titleCase(it.role)}</span>
                </span>
                <span className="pc-body">
                  <span className="pc-brand">{it.brand}</span>
                  <span className="pc-title">{it.title}</span>
                  <span className="pc-foot">
                    <span className="mono pc-price">{fmtCents(it.priceCents)}</span>
                    <span className="pc-cta">Shop {it.brand.split(" ")[0]} <b aria-hidden>↗</b></span>
                  </span>
                </span>
              </ProductLink>
              <AddToCartButton item={{ id: it.productId, brand: it.brand, title: it.title, image: it.image, priceCents: it.priceCents, url: it.bestOffer?.affiliateUrl || "#" }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── actions ── */}
      <section className="actions">
        <button className="a-primary" onClick={addLookToBag} disabled={allInBag}>
          {allInBag ? "✓ Look in bag" : `Add look to bag · ${bundle.items.length}`}
        </button>
        <Link href={`/builder?from=${bundle.slug}`} className="a-save">Make it yours →</Link>
        <button className={"a-save" + (saved ? " on" : "")} onClick={onSave}>
          <Heart filled={saved} /> {saved ? "Saved" : "Save look"}
        </button>
        <ShareButton title={`${bundle.title} — Curated`} text={bundle.curatorNote} path={`/${TYPE_PATH[bundle.type] ?? "looks"}/${bundle.slug}`} />
        {flight && <span className="flight" />}
      </section>

      {/* ── you might also like ── */}
      {related.length > 0 && (
        <section className="related">
          <header className="shop-head">
            <span className="index">More</span>
            <h2 className="serif">You Might Also Like</h2>
            <span className="eyebrow">{aesName}</span>
          </header>
          <hr className="rule shop-rule" />
          <div className="rel-grid">
            {related.map((b) => <LookCard key={b.id} bundle={b} />)}
          </div>
        </section>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .ld{ padding-bottom:80px; }
        .cover{ padding:0; }
        .cover-img{ position:relative; width:100%; height:min(86vh,820px); margin:0 auto; overflow:hidden;
          opacity:0; transform:scale(1.015); transition:opacity .5s ease, transform .9s var(--ease-out); border-bottom:1px solid var(--line); }
        .cover-img.in{ opacity:1; transform:scale(1); }
        @media (max-width:680px){ .cover-img{ height:78vh; } }
        .cover-meta{ position:absolute; left:0; right:0; bottom:0; padding:clamp(24px,4vw,54px); z-index:6;
          background:linear-gradient(transparent, rgba(16,15,13,.82)); }
        .cm-eyebrow{ font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--ink-soft);
          opacity:0; transform:translateY(8px); transition:.5s var(--ease-out); }
        .cm-eyebrow.in{ opacity:1; transform:none; }
        .cm-title{ font-weight:380; font-style:italic; line-height:.96; letter-spacing:-.025em;
          font-size:clamp(2.6rem,8vw,6.4rem); margin:10px 0 16px; overflow:hidden; }
        .cm-title-mask{ display:inline-block; transform:translateY(105%); transition:transform .8s var(--ease-out); }
        .cm-title.in .cm-title-mask{ transform:none; }
        .cm-row{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; font-family:var(--mono); font-size:12px;
          opacity:0; transform:translateY(8px); transition:.5s var(--ease-out) .08s; }
        .cm-row.in{ opacity:1; transform:none; }
        .cm-price i{ font-style:normal; color:var(--ink-soft); margin-left:5px; }
        .cm-count{ color:var(--ink-soft); }
        .cm-dot{ color:var(--ink-mute); }
        .cm-coh{ display:inline-flex; align-items:center; gap:6px; color:var(--ink-soft); }
        .coh-tick{ width:7px; height:7px; border-radius:50%; background:var(--positive); }

        .why{ max-width:840px; margin:var(--s-9) auto 0; padding:0 30px; text-align:center; opacity:0; transform:translateY(10px); transition:.6s var(--ease-out); }
        .why.in{ opacity:1; transform:none; }
        .why-label{ display:block; margin-bottom:22px; }
        .why-note{ font-size:clamp(1.4rem,2.8vw,2.1rem); line-height:1.4; font-weight:300; letter-spacing:-.015em; margin:0; }
        .why-note::first-letter{ font-size:1.05em; color:var(--accent-soft); }
        .why-credit{ display:block; margin-top:24px; }

        .shop{ max-width:var(--max); margin:var(--s-9) auto 0; padding:0 24px; }
        .shop-head{ display:grid; grid-template-columns:1fr auto 1fr; align-items:baseline; gap:16px; }
        .shop-head .index{ justify-self:start; }
        .shop-head h2{ text-align:center; font-weight:400; font-style:italic; font-size:clamp(1.7rem,3vw,2.6rem); letter-spacing:-.02em; }
        .shop-head .eyebrow{ justify-self:end; }
        .shop-rule{ margin:16px 0 18px; }
        .disclosure{ font-family:var(--mono); font-size:11px; color:var(--ink-mute); line-height:1.6; padding:12px 16px; border:1px solid var(--line); margin:0 0 22px; }
        .prod-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1px; background:var(--line); border:1px solid var(--line); }
        .prod-card{ position:relative; background:var(--surface); transition:.25s; }
        .prod-card:hover{ background:var(--surface-2); }
        .pc-link{ display:flex; flex-direction:column; height:100%; }
        .pc-img{ position:relative; display:block; aspect-ratio:3/4; overflow:hidden; background:var(--bg); }
        .pc-img img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s var(--ease-out); }
        .prod-card:hover .pc-img img{ transform:scale(1.06); }
        .pc-idx{ position:absolute; top:12px; left:12px; mix-blend-mode:difference; color:#fff; }
        .pc-role{ position:absolute; left:12px; bottom:12px; font-family:var(--mono); font-size:9.5px; letter-spacing:.14em; text-transform:uppercase;
          color:var(--ink); background:color-mix(in srgb, var(--bg) 62%, transparent); backdrop-filter:blur(6px); padding:4px 9px; }
        .pc-hero{ position:absolute; right:12px; bottom:12px; font-family:var(--mono); font-size:9.5px; color:var(--accent-ink); background:var(--accent); padding:4px 9px; }
        .pc-body{ display:flex; flex-direction:column; gap:4px; padding:15px 16px 17px; }
        .pc-brand{ font-family:var(--mono); font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-mute); }
        .pc-title{ font-size:15px; line-height:1.3; min-height:2.6em; }
        .pc-foot{ display:flex; align-items:center; justify-content:space-between; margin-top:10px; padding-top:11px; border-top:1px solid var(--line); }
        .pc-price{ font-size:13.5px; }
        .pc-cta{ font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--accent-soft); display:inline-flex; align-items:center; gap:5px; }
        .pc-cta b{ font-weight:400; transition:transform .2s; }
        .prod-card:hover .pc-cta b{ transform:translate(2px,-2px); }

        .actions{ position:relative; max-width:var(--max); margin:40px auto 0; padding:0 24px; display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
        .a-primary{ font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; background:var(--accent); color:var(--accent-ink); padding:15px 28px; transition:.2s; }
        .a-primary:hover{ background:var(--accent-soft); }
        .a-save{ font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; background:none; color:var(--ink-soft); border:1px solid var(--line); padding:14px 22px; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:.2s; }
        .a-save:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .a-save.on{ color:var(--accent-soft); border-color:var(--accent); }
        .flight{ position:absolute; right:80px; top:8px; width:16px; height:16px; border-radius:50%; background:var(--accent); animation:fly .7s cubic-bezier(.5,0,.2,1) forwards; }
        @keyframes fly{ 0%{transform:translate(0,0) scale(1); opacity:1;} 100%{transform:translate(60px,-560px) scale(.3); opacity:0;} }

        .related{ max-width:var(--max); margin:var(--s-9) auto 0; padding:0 24px; }
        .rel-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
        @media (max-width:900px){ .rel-grid{ grid-template-columns:repeat(2,1fr); } }
      ` }} />
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.8 5.5 5 5c2-.3 3.4.9 4.2 2 .8 1 1.8 1 2.6 0C12.6 5.9 14 4.7 16 5c3.2.5 4.4 4 3 6.8C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
