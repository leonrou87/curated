import type { Metadata } from "next";
import { getBundlesByType } from "@/lib/data";
import { BundleBrowser } from "@/components/BundleBrowser";

export const metadata: Metadata = { title: "Looks", description: "Browse complete, coherence-validated looks by occasion, vibe, and budget." };

export default function LooksPage() {
  return <BundleBrowser bundles={getBundlesByType("look")} title="Looks" blurb="Complete outfits by occasion, vibe and budget — every one validated by the coherence engine before it ships." />;
}
