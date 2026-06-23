"use client";
import Link from "next/link";
import { useRecentlyViewed } from "@/lib/useRecentlyViewed";
import { SafeImg } from "./SafeImg";
import { fmtCents } from "@/lib/format";

// Renders only when there's history — a horizontal rail of the looks you've opened.
export function RecentlyViewed({ excludeSlug, title = "Recently viewed" }: { excludeSlug?: string; title?: string }) {
  const recent = useRecentlyViewed(excludeSlug);
  if (recent.length < 2) return null;
  return (
    <section className="rv" aria-label={title}>
      <div className="rv-head"><span className="eyebrow">Pick up where you left off</span><h2 className="serif rv-h">{title}</h2></div>
      <div className="rv-rail">
        {recent.map((r) => (
          <Link key={r.slug} href={`/looks/${r.slug}`} className="rv-card">
            <span className="rv-img"><SafeImg src={r.image} alt={r.title} loading="lazy" /></span>
            <span className="rv-title">{r.title}</span>
            {r.price ? <span className="rv-price mono">{fmtCents(r.price)}</span> : null}
          </Link>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .rv{ max-width:var(--max); margin:var(--s-10) auto 0; padding:0 24px; }
        .rv-h{ font-weight:400; font-style:italic; font-size:clamp(1.5rem,3vw,2.2rem); letter-spacing:-.02em; margin:6px 0 18px; }
        .rv-rail{ display:flex; gap:16px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:8px; -webkit-overflow-scrolling:touch; }
        .rv-rail::-webkit-scrollbar{ height:0; }
        .rv-card{ flex:0 0 auto; width:180px; scroll-snap-align:start; }
        .rv-img{ display:block; position:relative; aspect-ratio:4/5; background:var(--surface-2); overflow:hidden; border:1px solid var(--line); }
        .rv-img img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .45s var(--ease-out); }
        .rv-card:hover .rv-img img{ transform:scale(1.05); }
        .rv-title{ display:block; font-size:13.5px; line-height:1.35; margin-top:9px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .rv-price{ display:block; font-size:12px; color:var(--ink-mute); margin-top:2px; }
      ` }} />
    </section>
  );
}
