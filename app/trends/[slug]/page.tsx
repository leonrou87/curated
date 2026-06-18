import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBundlesByType } from "@/lib/data";
import { LookCard } from "@/components/LookCard";
import { ShareButton } from "@/components/ShareButton";
import { AESTHETICS, aestheticOf } from "@/lib/aesthetics";

export const dynamicParams = true;
export function generateStaticParams() {
  const vibes = new Set(getBundlesByType("look").map((b) => String(b.brief.vibe || "")));
  return [...vibes].filter(Boolean).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = aestheticOf(params.slug);
  return {
    title: `${a.name} — the edit`,
    description: a.blurb,
    openGraph: {
      title: `${a.name} · Curated`,
      description: a.blurb,
      images: [{ url: `/og?type=look&t=${encodeURIComponent(a.name)}&a=${a.key}`, width: 1200, height: 630 }],
    },
  };
}

export default function TrendPage({ params }: { params: { slug: string } }) {
  const a = AESTHETICS[params.slug];
  const all = getBundlesByType("look").filter((b) => String(b.brief.vibe) === params.slug);
  const looks = all.slice(0, 60);
  if (!a && !all.length) notFound();
  const aes = a || aestheticOf(params.slug);

  return (
    <div className="trend">
      <nav className="crumb"><Link href="/trends">Trends</Link> <span>/</span> <span>{aes.name}</span></nav>
      <header className="tp-head" style={{ ["--ac" as any]: aes.accent }}>
        <span className="eyebrow">Aesthetic</span>
        <h1 className="serif tp-title">{aes.name}</h1>
        <p className="tp-tag">{aes.tagline}</p>
        <p className="tp-blurb">{aes.blurb}</p>
        <div className="tp-actions">
          <span className="eyebrow">{all.length} looks</span>
          <ShareButton title={`${aes.name} — Curated`} text={aes.blurb} path={`/trends/${aes.key}`} variant="chip" />
        </div>
      </header>
      <div className="tp-grid">
        {looks.map((b) => <LookCard key={b.id} bundle={b} />)}
      </div>
      <style>{`
        .trend{ max-width:1240px; margin:0 auto; padding:18px 24px 0; }
        .crumb{ font-size:12.5px; color:var(--ink-mute); display:flex; gap:8px; margin-bottom:20px; }
        .crumb a:hover{ color:var(--ink); } .crumb span:last-child{ color:var(--ink-soft); }
        .tp-head{ border-left:3px solid var(--ac); padding:4px 0 4px 22px; max-width:720px; }
        .tp-title{ font-weight:400; font-size:clamp(2.4rem,5vw,4rem); letter-spacing:-.02em; margin:8px 0 6px; color:var(--ac); }
        .tp-tag{ color:var(--ink); font-size:18px; margin:0 0 10px; }
        .tp-blurb{ color:var(--ink-soft); line-height:1.6; margin:0; }
        .tp-actions{ display:flex; align-items:center; gap:16px; margin-top:18px; }
        .tp-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:36px; }
        @media (max-width:1000px){ .tp-grid{ grid-template-columns:repeat(3,1fr); } }
        @media (max-width:680px){ .tp-grid{ grid-template-columns:repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
