"use client";
import { useCallback, useEffect, useState } from "react";

// A shopping bag across retailers. Since every item checks out at its own store, the "cart" is a
// saved list you click through one retailer at a time. Stored locally (upgrades to an account later).
export interface CartItem {
  id: string;
  brand: string;
  title: string;
  image: string | null;
  priceCents: number | null;
  url: string; // affiliate/outbound URL
  bought?: boolean;
}

const KEY = "curated-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("curated-cart-change"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(readCart());
    const refresh = () => setItems(readCart());
    window.addEventListener("curated-cart-change", refresh);
    return () => window.removeEventListener("curated-cart-change", refresh);
  }, []);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const add = useCallback((item: CartItem) => {
    const cur = readCart();
    if (cur.some((i) => i.id === item.id)) return;
    const next = [...cur, { ...item, bought: false }];
    write(next); setItems(next);
  }, []);

  const addMany = useCallback((list: CartItem[]) => {
    const cur = readCart();
    const ids = new Set(cur.map((i) => i.id));
    const next = [...cur, ...list.filter((i) => !ids.has(i.id)).map((i) => ({ ...i, bought: false }))];
    write(next); setItems(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = readCart().filter((i) => i.id !== id);
    write(next); setItems(next);
  }, []);

  const toggle = useCallback((item: CartItem) => {
    const cur = readCart();
    const next = cur.some((i) => i.id === item.id) ? cur.filter((i) => i.id !== item.id) : [...cur, { ...item, bought: false }];
    write(next); setItems(next);
  }, []);

  const setBought = useCallback((id: string, bought: boolean) => {
    const next = readCart().map((i) => (i.id === id ? { ...i, bought } : i));
    write(next); setItems(next);
  }, []);

  const clear = useCallback(() => { write([]); setItems([]); }, []);

  const total = items.reduce((s, i) => s + (i.priceCents ?? 0), 0);
  return { items, has, add, addMany, remove, toggle, setBought, clear, total };
}
