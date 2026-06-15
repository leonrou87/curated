import type { Metadata } from "next";
import { getBundlesByType } from "@/lib/data";
import { BundleBrowser } from "@/components/BundleBrowser";

export const metadata: Metadata = { title: "Collections", description: "Capsule collections — a coherent wardrobe in a few pieces." };

export default function CollectionsPage() {
  return <BundleBrowser bundles={getBundlesByType("collection")} title="Collections" blurb="Capsule wardrobes — a handful of pieces that all work together." />;
}
