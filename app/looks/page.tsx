import type { Metadata } from "next";
import { getLooksForBrowse } from "@/lib/data";
import { BundleBrowser } from "@/components/BundleBrowser";

export const metadata: Metadata = { title: "Looks", description: "Browse 1,000+ complete, coherence-validated looks by aesthetic, occasion, gender and budget." };

export default function LooksPage() {
  return <BundleBrowser bundles={getLooksForBrowse()} title="Looks" blurb="Over a thousand complete outfits — every one validated by the coherence engine. Filter by aesthetic, occasion and budget." />;
}
