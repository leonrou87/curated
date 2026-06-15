import type { Metadata } from "next";
import { getPublicBundle, getBundlesByType } from "@/lib/data";
import { BundleDetailPage } from "@/components/BundleDetailPage";

export function generateStaticParams() {
  return getBundlesByType("kit").map((b) => ({ slug: b.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const b = getPublicBundle(params.slug, true);
  return b ? { title: b.title, description: b.curatorNote } : { title: "Kit not found" };
}
export default function KitPage({ params, searchParams }: { params: { slug: string }; searchParams: { preview?: string } }) {
  return <BundleDetailPage slug={params.slug} backHref="/kits" backLabel="Kits" preview={searchParams.preview === "1"} />;
}
