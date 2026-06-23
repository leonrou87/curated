import type { Metadata } from "next";
import { getBundlesByType, toCardBundles } from "@/lib/data";
import { BundleBrowser } from "@/components/BundleBrowser";

export const metadata: Metadata = { title: "Kits", description: "Activity kits — golf, coffee, desk, home-gym — built by the same engine." };

export default function KitsPage() {
  return <BundleBrowser bundles={toCardBundles(getBundlesByType("kit"))} title="Kits" blurb="Activity setups — coffee, desk, home gym, golf. Same bundle engine, real gear." />;
}
