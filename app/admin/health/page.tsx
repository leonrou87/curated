import { getAllProducts } from "@/lib/data";
import { resolveBestOffer } from "@/lib/offers";
import { LinkHealth } from "@/components/admin/LinkHealth";

export const dynamic = "force-dynamic";

export default function HealthPage() {
  const targets = getAllProducts()
    .slice(0, 24)
    .map((p) => {
      const o = resolveBestOffer(p);
      return { id: p.id, label: `${p.brand} · ${p.title}`, url: o?.affiliateUrl ?? p.canonicalUrl };
    });
  return <LinkHealth targets={targets} />;
}
