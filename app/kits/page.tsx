import type { Metadata } from "next";
import { getBundlesByType, toClientBundles } from "@/lib/data";
import { BundleBrowser } from "@/components/BundleBrowser";

export const metadata: Metadata = { title: "Kits", description: "Activity kits — golf, coffee, desk, home-gym — built by the same engine." };

export default function KitsPage() {
  return <BundleBrowser bundles={toClientBundles(getBundlesByType("kit"))} title="Kits" blurb="Activity setups — coffee, desk, home gym, golf. Same bundle engine, real gear." />;
}
