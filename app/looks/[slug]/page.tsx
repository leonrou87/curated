import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicBundle, getBundlesByType, getRelatedLooks } from "@/lib/data";
import { LookDetail } from "@/components/LookDetail";
import { lookOgUrl } from "@/lib/og";

// 1000+ looks → render on demand and cache, rather than prebuilding every page at build time.
export const dynamicParams = true;
export function generateStaticParams() {
  return getBundlesByType("look").filter((b) => b.featured).map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const b = getPublicBundle(params.slug, true);
  if (!b) return { title: "Look not found" };
  const og = lookOgUrl(b);
  return {
    title: b.title,
    description: b.curatorNote,
    openGraph: { title: b.title, description: b.curatorNote, type: "article", images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: b.title, description: b.curatorNote, images: [og] },
  };
}

export default function LookPage({ params, searchParams }: { params: { slug: string }; searchParams: { preview?: string } }) {
  const bundle = getPublicBundle(params.slug, searchParams.preview === "1");
  if (!bundle) notFound();

  // structured data — ItemList of the products (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: bundle.title,
    description: bundle.curatorNote,
    numberOfItems: bundle.items.length,
    itemListElement: bundle.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: it.title,
        brand: it.brand,
        offers: it.priceCents
          ? { "@type": "Offer", price: (it.priceCents / 100).toFixed(2), priceCurrency: "USD" }
          : undefined,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumb">
        <Link href="/looks">Looks</Link> <span>/</span> <span>{bundle.title}</span>
      </nav>
      <LookDetail bundle={bundle} related={getRelatedLooks(bundle.slug, String(bundle.brief.vibe), String(bundle.brief.gender), 4)} />
      <style>{`.crumb{ max-width:1180px; margin:18px auto 0; padding:0 30px; font-size:12.5px; color:var(--ink-mute); display:flex; gap:8px; }
        .crumb a:hover{ color:var(--ink); } .crumb span:last-child{ color:var(--ink-soft); }`}</style>
    </>
  );
}
