import type { Metadata } from "next";
import { getBundlesByType } from "@/lib/data";
import { BundleBrowser } from "@/components/BundleBrowser";

export const metadata: Metadata = { title: "Kits", description: "Activity kits — golf, coffee, desk, home-gym — built by the same engine that makes the looks." };

export default function KitsPage() {
  return <BundleBrowser bundles={getBundlesByType("kit")} title="Kits" blurb="Activity setups — golf, espresso, desk, home gym. Same bundle engine, a non-fashion vertical. Proof the taxonomy is just data." />;
}
