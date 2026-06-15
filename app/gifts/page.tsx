import type { Metadata } from "next";
import { getBundlesByType } from "@/lib/data";
import { BundleBrowser } from "@/components/BundleBrowser";

export const metadata: Metadata = { title: "Gifts", description: "Gift-ready bundles by recipient and budget." };

export default function GiftsPage() {
  return <BundleBrowser bundles={getBundlesByType("gift")} title="Gifts" blurb="Ready-to-give bundles, by recipient and budget." />;
}
