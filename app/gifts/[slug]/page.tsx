import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSearchProducts } from "@/lib/data";
import { GIFT_GUIDES, guideBySlug } from "@/lib/gifts";
import { GiftGuide } from "@/components/GiftGuide";
import { FTC_DISCLOSURE } from "@/lib/offers";

export function generateStaticParams() {
  return GIFT_GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = guideBySlug(params.slug);
  if (!g) return { title: "Gift guide not found" };
  return {
    title: g.title,
    description: g.blurb,
    openGraph: { title: `${g.title} · Curated Gift Guide`, description: g.blurb, images: [{ url: `/og?type=look&t=${encodeURIComponent(g.title)}&a=quiet-luxury`, width: 1200, height: 630 }] },
  };
}

export default function GiftGuidePage({ params }: { params: { slug: string } }) {
  const g = guideBySlug(params.slug);
  if (!g) notFound();
  let products = getSearchProducts().filter((p) => g.match!(p));
  if (g.sort) products = [...products].sort(g.sort);
  products = products.slice(0, 120);

  return (
    <div className="guide">
      <nav className="crumb"><Link href="/gifts">Gift Guides</Link> <span>/</span> <span>{g.title}</span></nav>
      <header className="gp-head" style={{ ["--ac" as any]: g.accent }}>
        <span className="eyebrow">{g.kicker}</span>
        <h1 className="serif gp-title">{g.title}</h1>
        <p className="gp-blurb">{g.blurb}</p>
        <span className="eyebrow gp-count">{products.length} gifts</span>
      </header>
      <p className="gp-disc">{FTC_DISCLOSURE}</p>
      <GiftGuide products={products} />
      <style dangerouslySetInnerHTML={{ __html: `
        .guide{ max-width:1240px; margin:0 auto; padding:18px 24px 60px; }
        .crumb{ font-size:12.5px; color:var(--ink-mute); display:flex; gap:8px; margin-bottom:22px; }
        .crumb a:hover{ color:var(--ink); } .crumb span:last-child{ color:var(--ink-soft); }
        .gp-head{ border-left:3px solid var(--ac); padding:4px 0 4px 22px; max-width:720px; }
        .gp-title{ font-weight:400; font-style:italic; font-size:clamp(2.2rem,4.6vw,3.6rem); letter-spacing:-.02em; margin:8px 0 8px; color:var(--ac); }
        .gp-blurb{ color:var(--ink-soft); line-height:1.6; margin:0; }
        .gp-count{ display:block; margin-top:14px; }
        .gp-disc{ font-family:var(--mono); font-size:11px; color:var(--ink-mute); line-height:1.6; padding:11px 14px; border:1px solid var(--line); margin:26px 0 24px; }
      ` }} />
    </div>
  );
}
