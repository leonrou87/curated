"use client";
import { useCallback, useEffect, useState } from "react";

// Top-level Women / Men / All preference, persisted and shared across the nav, feed and browser.
export type Gender = "all" | "women" | "men";
const KEY = "curated-gender";

export function readGender(): Gender {
  if (typeof window === "undefined") return "all";
  const v = localStorage.getItem(KEY) as Gender | null;
  return v === "women" || v === "men" ? v : "all";
}

export function useGender() {
  const [gender, setGenderState] = useState<Gender>("all");
  useEffect(() => {
    setGenderState(readGender());
    const refresh = () => setGenderState(readGender());
    window.addEventListener("curated-gender-change", refresh);
    return () => window.removeEventListener("curated-gender-change", refresh);
  }, []);

  const setGender = useCallback((g: Gender) => {
    localStorage.setItem(KEY, g);
    setGenderState(g);
    window.dispatchEvent(new Event("curated-gender-change"));
  }, []);

  return { gender, setGender };
}

// matches a bundle's gender against the preference (kits/unisex always show)
export function genderMatch(pref: Gender, bundleGender?: string): boolean {
  if (pref === "all") return true;
  if (!bundleGender || bundleGender === "unisex") return true;
  return bundleGender === pref;
}
