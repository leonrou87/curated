"use client";
import { useCallback, useEffect, useState } from "react";

// Zero-key, logged-out saves: session-scoped Closet in localStorage. Upgrades to a real
// SavedItem on sign-up in the full app. Emits an event so the Nav badge stays in sync.
const KEY = "curated-saved";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useSaved(slug?: string) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(read());
    const refresh = () => setList(read());
    window.addEventListener("curated-saved-change", refresh);
    return () => window.removeEventListener("curated-saved-change", refresh);
  }, []);

  const saved = slug ? list.includes(slug) : false;

  const toggle = useCallback(
    (s?: string) => {
      const target = s ?? slug;
      if (!target) return;
      const cur = read();
      const next = cur.includes(target) ? cur.filter((x) => x !== target) : [...cur, target];
      localStorage.setItem(KEY, JSON.stringify(next));
      setList(next);
      window.dispatchEvent(new Event("curated-saved-change"));
    },
    [slug]
  );

  return { saved, list, toggle };
}
