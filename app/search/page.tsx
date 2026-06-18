import type { Metadata } from "next";
import { Suspense } from "react";
import { getBundlesByType, getSearchProducts, toClientBundles } from "@/lib/data";
import { SearchView } from "@/components/SearchView";

export const metadata: Metadata = { title: "Search", description: "Search 1,000+ looks, brands, aesthetics and pieces." };

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchView looks={toClientBundles(getBundlesByType("look"))} products={getSearchProducts()} />
    </Suspense>
  );
}
