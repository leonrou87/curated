import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBundlesByType, toCardBundles } from "@/lib/data";
import { BundleBrowser } from "@/components/BundleBrowser";
import { COLLECTIONS, collectionBySlug } from "@/lib/collections";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = collectionBySlug(params.slug);
  if (!c) return { title: "Collection not found" };
  return {
    title: c.title,
    description: c.blurb,
    openGraph: { title: `${c.title} · Curated`, description: c.blurb, images: [{ url: `/og?type=look&t=${encodeURIComponent(c.title)}&a=quiet-luxury`, width: 1200, height: 630 }] },
  };
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const c = collectionBySlug(params.slug);
  if (!c) notFound();
  const looks = toCardBundles(getBundlesByType("look").filter((b) => c.match(b)));

  return (
    <div className="collection">
      <nav className="crumb"><Link href="/collections">Collections</Link> <span>/</span> <span>{c.title}</span></nav>
      <BundleBrowser bundles={looks} title={c.title} blurb={c.blurb} />
      <style dangerouslySetInnerHTML={{ __html: `
        .crumb{ max-width:1240px; margin:18px auto 0; padding:0 24px; font-size:12.5px; color:var(--ink-mute); display:flex; gap:8px; }
        .crumb a:hover{ color:var(--ink); } .crumb span:last-child{ color:var(--ink-soft); }
      ` }} />
    </div>
  );
}
