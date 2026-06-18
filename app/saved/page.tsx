import type { Metadata } from "next";
import { getAllBundles, toClientBundles } from "@/lib/data";
import { SavedGrid } from "@/components/SavedGrid";

export const metadata: Metadata = { title: "Closet", description: "Your saved looks and kits." };

export default function SavedPage() {
  return <SavedGrid bundles={toClientBundles(getAllBundles())} />;
}
