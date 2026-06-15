import type { Metadata } from "next";
import { getPublicBundle, getBundlesByType } from "@/lib/data";
import { BundleDetailPage } from "@/components/BundleDetailPage";

export function generateStaticParams() {
  return getBundlesByType("gift").map((b) => ({ slug: b.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const b = getPublicBundle(params.slug, true);
  return b ? { title: b.title, description: b.curatorNote } : { title: "Gift not found" };
}
export default function GiftPage({ params, searchParams }: { params: { slug: string }; searchParams: { preview?: string } }) {
  return <BundleDetailPage slug={params.slug} backHref="/gifts" backLabel="Gifts" preview={searchParams.preview === "1"} />;
}
