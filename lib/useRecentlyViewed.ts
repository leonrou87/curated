"use client";
import { useEffect, useState } from "react";

// Logged-out "recently viewed" rail. We snapshot a tiny shape at view time (slug/title/image/price)
// so the rail renders straight from localStorage — no need to ship the catalog to the client.
export interface RecentLook { slug: string; title: string; image: string; price?: number }
const KEY = "curated-recent";
const CAP = 12;

function read(): RecentLook[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function recordView(item: RecentLook) {
  if (typeof window === "undefined" || !item.slug || !item.image) return;
  try {
    const cur = read().filter((x) => x.slug !== item.slug);
    const next = [item, ...cur].slice(0, CAP);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("curated-recent-change"));
  } catch {}
}

export function useRecentlyViewed(excludeSlug?: string): RecentLook[] {
  const [list, setList] = useState<RecentLook[]>([]);
  useEffect(() => {
    const refresh = () => setList(read());
    refresh();
    window.addEventListener("curated-recent-change", refresh);
    return () => window.removeEventListener("curated-recent-change", refresh);
  }, []);
  return excludeSlug ? list.filter((x) => x.slug !== excludeSlug) : list;
}
