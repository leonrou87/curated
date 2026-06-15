import type { Metadata } from "next";
import { getPublicBundle, getBundlesByType } from "@/lib/data";
import { BundleDetailPage } from "@/components/BundleDetailPage";

export function generateStaticParams() {
  return getBundlesByType("collection").map((b) => ({ slug: b.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const b = getPublicBundle(params.slug, true);
  return b ? { title: b.title, description: b.curatorNote } : { title: "Collection not found" };
}
export default function CollectionPage({ params, searchParams }: { params: { slug: string }; searchParams: { preview?: string } }) {
  return <BundleDetailPage slug={params.slug} backHref="/collections" backLabel="Collections" preview={searchParams.preview === "1"} />;
}
