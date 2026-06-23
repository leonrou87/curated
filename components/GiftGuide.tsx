"use client";
import { useState } from "react";
import type { SearchProduct } from "@/lib/data";
import { SafeImg } from "./SafeImg";
import { ProductLink } from "./ProductLink";
import { AddToCartButton } from "./AddToCartButton";
import { fmtCents } from "@/lib/format";

// Shoppable product grid for a gift guide — each card is an affiliate link + an add-to-bag overlay.
export function GiftGuide({ products }: { products: SearchProduct[] }) {
  const [limit, setLimit] = useState(40);
  const shown = products.slice(0, limit);
  return (
    <div className="gg">
      <div className="gg-grid">
        {shown.map((p) => (
          <div className="gg-card" key={p.id}>
            <ProductLink offer={{ affiliateUrl: p.url } as any} productId={p.id} merchant={p.brand} className="gg-link" ariaLabel={`Shop ${p.brand} ${p.title}, ${fmtCents(p.priceCents)}`}>
              <span className="gg-img"><SafeImg src={p.image} alt={p.title} loading="lazy" /></span>
              <span className="gg-body">
                <span className="gg-brand">{p.brand}</span>
                <span className="gg-title">{p.title}</span>
                <span className="gg-foot"><span className="mono">{fmtCents(p.priceCents)}</span><span className="gg-cta">Shop ↗</span></span>
              </span>
            </ProductLink>
            <AddToCartButton item={{ id: p.id, brand: p.brand, title: p.title, image: p.image, priceCents: p.priceCents, url: p.url }} />
          </div>
        ))}
      </div>
      {limit < products.length && (
        <div className="gg-more"><button onClick={() => setLimit((l) => l + 40)}>Show more — {products.length - limit} left</button></div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .gg-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:16px; }
        .gg-card{ position:relative; background:var(--surface); border:1px solid var(--line); overflow:hidden; transition:.2s; }
        .gg-card:hover{ border-color:var(--accent); transform:translateY(-3px); }
        .gg-link{ display:flex; flex-direction:column; }
        .gg-img{ position:relative; aspect-ratio:3/4; background:var(--surface-2); overflow:hidden; }
        .gg-img img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .45s var(--ease-out); }
        .gg-card:hover .gg-img img{ transform:scale(1.05); }
        .gg-body{ display:flex; flex-direction:column; gap:3px; padding:12px 13px 14px; }
        .gg-brand{ font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-mute); }
        .gg-title{ font-size:14px; line-height:1.3; min-height:2.6em; }
        .gg-foot{ display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:10px; border-top:1px solid var(--line); font-size:13px; }
        .gg-cta{ font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--accent-soft); }
        .gg-more{ display:flex; justify-content:center; margin-top:34px; }
        .gg-more button{ background:var(--surface); border:1px solid var(--line); color:var(--ink); padding:13px 28px; font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
        .gg-more button:hover{ border-color:var(--accent); color:var(--accent-soft); }
      ` }} />
    </div>
  );
}
