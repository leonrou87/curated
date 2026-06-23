import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllBundles, toClientBundles } from "@/lib/data";
import { StyleStudio } from "@/components/StyleStudio";

export const metadata: Metadata = { title: "Style me", description: "Search by occasion, aesthetic, piece or mood — and watch a coherent look come together, tuned to your taste." };

export default function StylePage() {
  return (
    <Suspense fallback={null}>
      <StyleStudio bundles={toClientBundles(getAllBundles())} />
    </Suspense>
  );
}
