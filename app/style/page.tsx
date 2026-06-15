import type { Metadata } from "next";
import { getAllBundles } from "@/lib/data";
import { StyleStudio } from "@/components/StyleStudio";

export const metadata: Metadata = {
  title: "Style me",
  description: "Describe the occasion in plain language and watch a coherent look assemble.",
};

export default function StylePage() {
  return <StyleStudio bundles={getAllBundles()} />;
}
