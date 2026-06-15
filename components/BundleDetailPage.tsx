import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBundle } from "@/lib/data";
import { LookDetail } from "@/components/LookDetail";

// Shared detail renderer — proves the engine generalizes: looks, kits, collections, gifts all
// flow through ONE component (data-driven taxonomy, never new code per category).
export function BundleDetailPage({
  slug,
  backHref,
  backLabel,
  preview = false,
}: {
  slug: string;
  backHref: string;
  backLabel: string;
  preview?: boolean;
}) {
  const bundle = getPublicBundle(slug, preview);
  if (!bundle) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: bundle.title,
    description: bundle.curatorNote,
    numberOfItems: bundle.items.length,
    itemListElement: bundle.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Product", name: it.title, brand: it.brand },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumb">
        <Link href={backHref}>{backLabel}</Link> <span>/</span> <span>{bundle.title}</span>
      </nav>
      <LookDetail bundle={bundle} />
      <style>{`.crumb{ max-width:1180px; margin:18px auto 0; padding:0 30px; font-size:12.5px; color:var(--ink-mute); display:flex; gap:8px; }
        .crumb a:hover{ color:var(--ink); } .crumb span:last-child{ color:var(--ink-soft); }`}</style>
    </>
  );
}
