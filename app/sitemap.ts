import type { MetadataRoute } from "next";
import { getAllBundles } from "@/lib/data";
import { COLLECTIONS } from "@/lib/collections";
import { AESTHETICS } from "@/lib/aesthetics";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://curated.kytepush.com";
const TYPE_PATH: Record<string, string> = { look: "looks", kit: "kits", collection: "collections", gift: "gifts" };

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/quiz", "/style", "/looks", "/trends", "/collections", "/kits", "/search", "/about", "/contact", "/disclosure"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const collectionRoutes = COLLECTIONS.map((c) => ({ url: `${BASE}/collections/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  const trendRoutes = Object.keys(AESTHETICS).map((k) => ({ url: `${BASE}/trends/${k}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  // only published looks/kits (archived placeholders excluded by getAllBundles)
  const bundleRoutes = getAllBundles()
    .filter((b) => b.type === "look" || b.type === "kit")
    .map((b) => ({ url: `${BASE}/${TYPE_PATH[b.type]}/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.5 }));
  return [...staticRoutes, ...collectionRoutes, ...trendRoutes, ...bundleRoutes];
}
