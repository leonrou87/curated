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
    getBundlesByType("look").find((b) => b.isFashion && b.items.every((i) => i.image)) ||
    getBundlesByType("look")[0];

  const initial = seed.items.map((i) => ({ slotId: i.slotId, productId: i.productId }));

  // Slim the client payload: only the slots in this look need swap alternates. Cap ~24/slot of
  // in-stock products (prefer real-image ones), plus the look's own items.
  const slots = new Set(seed.items.map((i) => i.slotId));
  const all = getAllProducts();
  const keepIds = new Set(seed.items.map((i) => i.productId));
  const perSlot: Record<string, number> = {};
  const catalog = all.filter((p) => {
    if (keepIds.has(p.id)) return true;
    const slot = p.slotRoles[0];
    if (!slots.has(slot) || !p.inStock || !p.imageUrls?.[0]?.startsWith("http")) return false;
    perSlot[slot] = (perSlot[slot] ?? 0) + 1;
    return perSlot[slot] <= 24;
  });

  return (
    <Builder
      catalog={catalog}
      initial={initial}
      brief={seed.brief}
      title={`Styling: ${seed.title}`}
    />
  );
}
