"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EnrichedBundle } from "@/lib/types";
import type { SearchProduct } from "@/lib/data";
import { LookCard } from "./LookCard";
import { ProductLink } from "./ProductLink";
import { SafeImg } from "./SafeImg";
import { AddToCartButton } from "./AddToCartButton";
import { useGender, genderMatch } from "@/lib/useGender";
import { aestheticOf } from "@/lib/aesthetics";
import { fmtCents } from "@/lib/format";

const QUICK = ["wedding guest", "all black", "quiet luxury", "date night", "linen", "loafers", "blazer", "gold necklace", "office", "weekend"];

function tokens(q: string) {
  return q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 1);
}

export function SearchView({ looks, products }: { looks: EnrichedBundle[]; products: SearchProduct[] }) {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const { gender } = useGender();
  const ts = tokens(q);

  const lookHay = useMemo(
    () => new Map(looks.map((b) => [b.id, [b.title, b.brief.vibe, b.brief.occasion, b.brief.gender, aestheticOf(String(b.brief.vibe)).name, ...b.items.map((i) => `${i.brand} ${i.title}`)].join(" ").toLowerCase()])),
    [looks]
  );

  const matchedLooks = useMemo(() => {
    const scoped = looks.filter((b) => genderMatch(gender, b.brief.gender));
    if (!ts.length) return scoped.slice(0, 12);
    return scoped
      .map((b) => ({ b, s: ts.reduce((a, t) => a + ((lookHay.get(b.id) || "").includes(t) ? 1 : 0), 0) }))
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.b).slice(0, 24);
  }, [looks, ts, gender, lookHay]);

  const matchedProducts = useMemo(() => {
    const scoped = products.filter((p) => gender === "all" || p.gender === "unisex" || p.gender === gender);
    if (!ts.length) return [];
    return scoped
      .map((p) => ({ p, s: ts.reduce((a, t) => a + (`${p.brand} ${p.title} ${p.category} ${p.gender}`.toLowerCase().includes(t) ? 1 : 0), 0) }))
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.p).slice(0, 24);
  }, [products, ts, gender]);

  return (
    <div className="search">
      <div className="s-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search looks, brands, pieces — “wedding guest”, “loafers”, “quiet luxury”…" aria-label="Search" />
        {q && <button className="s-clear" onClick={() => setQ("")} aria-label="Clear">✕</button>}
      </div>
      <div className="s-quick">
        {QUICK.map((k) => <button key={k} className="s-chip" onClick={() => setQ(k)}>{k}</button>)}
      </div>

      {matchedLooks.length > 0 && (
        <section className="s-section">
          <h2 className="serif">{ts.length ? "Looks" : "Start with a look"} <i>{matchedLooks.length}</i></h2>
          <div className="s-looks">{matchedLooks.map((b) => <LookCard key={b.id} bundle={b} />)}</div>
        </section>
      )}

      {matchedProducts.length > 0 && (
        <section className="s-section">
          <h2 className="serif">Pieces <i>{matchedProducts.length}</i></h2>
          <div className="s-prods">
            {matchedProducts.map((p) => (
              <div className="sp-card" key={p.id}>
                <ProductLink offer={{ affiliateUrl: p.url } as any} productId={p.id} merchant={p.brand} className="sp-link" ariaLabel={`Shop ${p.brand} ${p.title}`}>
                  <span className="sp-img"><SafeImg src={p.image} alt={p.title} loading="lazy" /></span>
                  <span className="sp-body">
                    <span className="sp-brand">{p.brand}</span>
                    <span className="sp-title">{p.title}</span>
                    <span className="sp-foot"><span className="mono">{fmtCents(p.priceCents)}</span><span className="sp-cta">Shop ↗</span></span>
                  </span>
                </ProductLink>
                <AddToCartButton item={{ id: p.id, brand: p.brand, title: p.title, image: p.image, priceCents: p.priceCents, url: p.url }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {ts.length > 0 && matchedLooks.length === 0 && matchedProducts.length === 0 && (
        <p className="s-empty">No matches for “{q}”. Try a brand, an occasion, or an aesthetic.</p>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .search{ max-width:1200px; margin:0 auto; padding:30px 24px 0; }
        .s-bar{ display:flex; align-items:center; gap:12px; background:var(--surface); border:1px solid var(--line); border-radius:999px; padding:14px 22px; color:var(--ink-mute); }
        .s-bar:focus-within{ border-color:var(--accent); }
        .s-bar input{ flex:1; background:none; border:none; outline:none; color:var(--ink); font-size:17px; font-family:var(--sans); }
        .s-bar input::placeholder{ color:var(--ink-mute); }
        .s-clear{ background:none; border:none; color:var(--ink-mute); cursor:pointer; font-size:14px; }
        .s-quick{ display:flex; flex-wrap:wrap; gap:8px; margin:16px 0 8px; }
        .s-chip{ font-size:12.5px; color:var(--ink-soft); background:none; border:1px solid var(--line); padding:7px 14px; border-radius:999px; cursor:pointer; transition:.2s; }
        .s-chip:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .s-section{ margin-top:40px; }
        .s-section h2{ font-weight:400; font-size:1.5rem; margin:0 0 16px; display:flex; align-items:baseline; gap:10px; }
        .s-section h2 i{ font-style:normal; font-size:13px; color:var(--ink-mute); }
        .s-looks{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
        .s-prods{ display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:16px; }
        .sp-card{ position:relative; background:var(--surface); border:1px solid var(--line); border-radius:12px; overflow:hidden; transition:.2s; }
        .sp-link{ display:flex; flex-direction:column; }
        .sp-card:hover{ border-color:var(--accent); transform:translateY(-3px); }
        .sp-img{ position:relative; aspect-ratio:3/4; background:var(--surface-2); overflow:hidden; }
        .sp-img img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .4s var(--ease-out); }
        .sp-card:hover .sp-img img{ transform:scale(1.05); }
        .sp-body{ display:flex; flex-direction:column; gap:2px; padding:11px 12px 13px; }
        .sp-brand{ font-size:12px; color:var(--ink-soft); }
        .sp-title{ font-size:13px; line-height:1.3; min-height:2.5em; }
        .sp-foot{ display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:13px; }
        .sp-cta{ color:var(--accent-soft); font-size:12px; }
        .s-empty{ text-align:center; color:var(--ink-soft); margin-top:50px; }
        @media (max-width:900px){ .s-looks{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:520px){ .s-looks{ grid-template-columns:1fr; } }
      ` }} />
    </div>
  );
}
