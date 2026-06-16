import type { Metadata } from "next";
import Link from "next/link";
import { getBundlesByType } from "@/lib/data";
import { BundleCover } from "@/components/BundleCover";
import { aestheticOf } from "@/lib/aesthetics";

export const metadata: Metadata = {
  title: "Trends",
  description: "The aesthetics defining the season — Quiet Luxury, Old Money, Mob Wife, Clean Girl and more, each a shoppable editorial.",
};

export default function TrendsPage() {
  const looks = getBundlesByType("look");
  const byVibe = new Map<string, typeof looks>();
  for (const b of looks) {
    const v = String(b.brief.vibe || "minimalist");
    if (!byVibe.has(v)) byVibe.set(v, []);
    byVibe.get(v)!.push(b);
  }
  const trends = [...byVibe.entries()]
    .map(([key, list]) => ({ a: aestheticOf(key), list }))
    .sort((x, y) => y.list.length - x.list.length);

  return (
    <div className="trends">
      <header className="t-head">
        <span className="eyebrow">The season, decoded</span>
        <h1 className="serif">Trends</h1>
        <p className="t-blurb">The aesthetics everyone’s wearing — each one a complete, shoppable edit. Find your vibe and build the whole look.</p>
      </header>
      <div className="t-grid">
        {trends.map(({ a, list }) => (
          <Link key={a.key} href={`/trends/${a.key}`} className="t-card">
            <div className="t-img"><BundleCover bundle={list[0]} /></div>
            <div className="t-overlay" style={{ borderColor: a.accent }}>
              <span className="serif t-name">{a.name}</span>
              <span className="t-tag">{a.tagline}</span>
              <span className="eyebrow t-count">{list.length} looks</span>
            </div>
          </Link>
        ))}
      </div>
      <style>{`
        .trends{ max-width:1240px; margin:0 auto; padding:36px 24px 0; }
        .t-head h1{ font-weight:400; font-size:clamp(2rem,3.6vw,3.2rem); letter-spacing:-.02em; margin:8px 0 0; }
        .t-blurb{ color:var(--ink-soft); max-width:60ch; margin:10px 0 0; }
        .t-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:28px; }
        .t-card{ position:relative; aspect-ratio:4/5; border-radius:6px; overflow:hidden; }
        .t-img{ position:absolute; inset:0; }
        .t-card :where(.cover-scene){ transition:transform .6s var(--ease-out); }
        .t-card:hover :where(.cover-scene){ transform:scale(1.05); }
        .t-overlay{ position:absolute; left:0; right:0; bottom:0; padding:20px; z-index:3; border-bottom:3px solid var(--accent); }
        .t-name{ display:block; font-size:1.7rem; line-height:1.05; }
        .t-tag{ display:block; color:var(--ink-soft); font-size:13px; margin-top:4px; }
        .t-count{ display:block; margin-top:8px; color:var(--ink-mute); }
        @media (max-width:860px){ .t-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:520px){ .t-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
