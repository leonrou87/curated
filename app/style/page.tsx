import type { Metadata } from "next";
import { getAllBundles, toClientBundles } from "@/lib/data";
import { StyleStudio } from "@/components/StyleStudio";

export const metadata: Metadata = { title: "Style me", description: "Describe the occasion in plain language and watch a coherent look assemble — tuned to your taste." };

export default function StylePage() {
  return <StyleStudio bundles={toClientBundles(getAllBundles())} />;
}
