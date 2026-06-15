import type { MetadataRoute } from "next";
import { getAllBundles } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://curated.example";
const TYPE_PATH: Record<string, string> = { look: "looks", kit: "kits", collection: "collections", gift: "gifts" };

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/style", "/looks", "/kits", "/collections", "/gifts", "/builder", "/styleguide", "/disclosure", "/about"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const bundleRoutes = getAllBundles().map((b) => ({
    url: `${BASE}/${TYPE_PATH[b.type]}/${b.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...bundleRoutes];
}
