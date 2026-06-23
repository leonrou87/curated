import type { Metadata } from "next";
import Link from "next/link";
import { getBundlesByType } from "@/lib/data";
import { BundleCover } from "@/components/BundleCover";
import { COLLECTIONS } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Collections",
  description: "Editorial edits — Wedding Season, The Vacation Edit, Date Night, Monochrome and more. Complete looks, curated by theme.",
};

export default function CollectionsPage() {
  const looks = getBundlesByType("look");
  const items = COLLECTIONS.map((c) => {
    const matched = looks.filter((b) => c.match(b));
    const cover = matched.find((b) => b.items.some((i) => i.image)) ?? matched[0];
    return { c, cover, count: matched.length };
  }).filter((x) => x.cover);

  return (
    <div className="cols">
      <header className="cl-head">
        <span className="eyebrow">The Edits</span>
        <h1 className="serif">Collections</h1>
        <p className="cl-blurb">Curated by theme, not by brand — complete looks for the moments on your calendar and the moods you’re after.</p>
      </header>
      <div className="cl-grid">
        {items.map(({ c, cover, count }, i) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="cl-card">
            <div className="cl-img"><BundleCover bundle={cover!} /></div>
            <span className="index cl-idx">N°{String(i + 1).padStart(2, "0")}</span>
            <div className="cl-overlay" style={{ borderColor: c.accent }}>
              <span className="eyebrow">{c.kicker} · {count} looks</span>
              <span className="serif cl-name">{c.title}</span>
            </div>
          </Link>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cols{ max-width:1240px; margin:0 auto; padding:36px 24px 0; }
        .cl-head h1{ font-weight:400; font-style:italic; font-size:clamp(2rem,3.8vw,3.4rem); letter-spacing:-.02em; margin:8px 0 0; }
        .cl-blurb{ color:var(--ink-soft); max-width:62ch; margin:10px 0 0; }
        .cl-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:30px; }
        .cl-card{ position:relative; aspect-ratio:4/5; overflow:hidden; }
        .cl-img{ position:absolute; inset:0; }
        .cl-card :where(.cover-scene){ transition:transform .6s var(--ease-out); }
        .cl-card:hover :where(.cover-scene){ transform:scale(1.05); }
        .cl-idx{ position:absolute; top:18px; left:18px; z-index:5; mix-blend-mode:difference; color:#fff; }
        .cl-overlay{ position:absolute; left:0; right:0; bottom:0; z-index:5; padding:22px; border-bottom:3px solid var(--accent); }
        .cl-overlay .eyebrow{ color:var(--ink-soft); }
        .cl-name{ display:block; font-style:italic; font-size:1.9rem; line-height:1.0; margin-top:6px; }
        @media (max-width:860px){ .cl-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:520px){ .cl-grid{ grid-template-columns:1fr; } }
      ` }} />
    </div>
  );
}
