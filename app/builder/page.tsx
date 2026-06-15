import type { Metadata } from "next";
import { getAllProducts, getBundleBySlug, getBundlesByType } from "@/lib/data";
import { Builder } from "@/components/Builder";

export const metadata: Metadata = {
  title: "Builder",
  description: "Mix and match with live coherence feedback — the same engine that validates every look.",
};

export default function BuilderPage({ searchParams }: { searchParams: { from?: string } }) {
  const fromSlug = searchParams.from;
  const seed =
    (fromSlug && getBundleBySlug(fromSlug)) ||
    getBundlesByType("look").find((b) => b.isFashion) ||
    getBundlesByType("look")[0];

  const initial = seed.items.map((i) => ({ slotId: i.slotId, productId: i.productId }));

  return (
    <Builder
      catalog={getAllProducts()}
      initial={initial}
      brief={seed.brief}
      title={`Styling: ${seed.title}`}
    />
  );
}
