import type { Metadata } from "next";
import { Suspense } from "react";
import { getBundlesByType, getSearchProducts } from "@/lib/data";
import { SearchView } from "@/components/SearchView";

export const metadata: Metadata = { title: "Search", description: "Search looks, brands, aesthetics and pieces." };

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchView looks={getBundlesByType("look")} products={getSearchProducts()} />
    </Suspense>
  );
}
