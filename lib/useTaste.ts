"use client";
import { useCallback, useEffect, useState } from "react";

// Taste profile built from the style quiz (and, later, behavior). Scores per aesthetic drive the
// personalized feed and the shareable "Style DNA" result. Stored locally; upgrades on sign-up.
const KEY = "curated-taste";

export interface Taste {
  scores: Record<string, number>; // aesthetic -> affinity
  liked: string[]; // liked look slugs
  done: boolean;
}

const EMPTY: Taste = { scores: {}, liked: [], done: false };

export function readTaste(): Taste {
  if (typeof window === "undefined") return EMPTY;
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return EMPTY;
  }
}

function write(t: Taste) {
  localStorage.setItem(KEY, JSON.stringify(t));
  window.dispatchEvent(new Event("curated-taste-change"));
}

export function topAesthetics(t: Taste, n = 3): { key: string; pct: number }[] {
  const entries = Object.entries(t.scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return entries.slice(0, n).map(([key, v]) => ({ key, pct: Math.round((v / total) * 100) }));
}

export function useTaste() {
  const [taste, setTaste] = useState<Taste>(EMPTY);
  useEffect(() => {
    setTaste(readTaste());
    const refresh = () => setTaste(readTaste());
    window.addEventListener("curated-taste-change", refresh);
    return () => window.removeEventListener("curated-taste-change", refresh);
  }, []);

  const like = useCallback((slug: string, aesthetic: string) => {
    const t = readTaste();
    t.scores[aesthetic] = (t.scores[aesthetic] || 0) + 2;
    if (!t.liked.includes(slug)) t.liked.push(slug);
    write(t);
    setTaste({ ...t });
  }, []);

  const pass = useCallback((aesthetic: string) => {
    const t = readTaste();
    t.scores[aesthetic] = (t.scores[aesthetic] || 0) - 0.5;
    write(t);
    setTaste({ ...t });
  }, []);

  const finish = useCallback(() => {
    const t = readTaste();
    t.done = true;
    write(t);
    setTaste({ ...t });
  }, []);

  const reset = useCallback(() => {
    write(EMPTY);
    setTaste({ ...EMPTY });
  }, []);

  return { taste, like, pass, finish, reset, top: topAesthetics(taste) };
}
