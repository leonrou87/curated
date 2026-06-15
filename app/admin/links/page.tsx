import { getAllProducts } from "@/lib/data";
import { resolveBestOffer } from "@/lib/offers";
import { readOverrides } from "@/lib/affiliate-config";
import { LinkManager, type LinkRow } from "@/components/admin/LinkManager";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const products = getAllProducts();
  const rows: LinkRow[] = products.map((p) => {
    const o = resolveBestOffer(p);
    return {
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      network: o?.network ?? "—",
      merchant: o?.merchant ?? p.brand,
      url: o?.affiliateUrl ?? p.canonicalUrl,
    };
  });
  return <LinkManager rows={rows} initialOverrides={await readOverrides()} />;
}
