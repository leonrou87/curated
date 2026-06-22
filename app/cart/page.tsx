import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Your Bag", description: "Your saved pieces — check out store by store." };

export default function CartPage() {
  return <CartView />;
}
