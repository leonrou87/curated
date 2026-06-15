// Shared TS types — mirror the Json blobs in DECISIONS.md §2 so web + scorer share one shape.

export type PriceTier = "budget" | "mid" | "premium";

export interface StylingColor {
  primaryHex: string;
  family: string;
  undertone: "warm" | "cool" | "neutral";
  role: "neutral" | "accent" | "statement";
  value?: number;
  chroma?: number;
}

export interface StylingProfile {
  formality: number; // 1..5
  dressCodes: string[];
  color: StylingColor;
  pattern: "solid" | "subtle" | "bold" | string;
  texture: string[];
  silhouette: string;
  volume: "slim" | "regular" | "voluminous" | string;
  weight: "statement" | "supporting" | "basic" | string;
  seasons: string[];
  weather: string[];
  brand: string;
  brandTier: number; // 1..5
  priceTier: PriceTier;
  slotRoles: string[];
}

export interface Offer {
  network: "sovrn" | "amazon" | "shareasale" | "cj" | "impact" | "direct" | "manual" | string;
  merchant: string;
  affiliateUrl: string;
  rawUrl?: string;
  priceTier: PriceTier;
  affiliateUrlIsAmazon?: boolean;
  inStock: boolean;
  priceSnapshot?: number; // cents
  currency?: string;
  commissionEst?: number;
  status: "active" | "stale" | "dead" | string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string | null;
  canonicalUrl: string;
  imageUrls: string[];
  inStock: boolean;
  offers: Offer[];
  slotRoles: string[];
  styling: StylingProfile;
}

export interface Brief {
  occasion?: string;
  vibe?: string;
  activity?: string;
  recipient?: string;
  gender?: string;
  budgetTier?: PriceTier;
  season?: string;
  targetFormality?: number;
  highLow?: boolean;
  colorDislikes?: string[];
  brandsAvoided?: string[];
}

export interface CoherenceResult {
  score: number;
  passed: boolean;
  hardViolations: string[];
  ruleScores: Record<string, number>;
  scheme: string;
  heroItemId: string | null;
}

export interface RawBundleItem {
  productId: string;
  slotId: string;
  role: string;
  note: string | null;
  variant: string;
  swapAlternates: string[];
}

export interface RawBundle {
  id: string;
  slug: string;
  type: "look" | "kit" | "collection" | "gift";
  title: string;
  brief: Brief;
  heroImage: string;
  flatLayImage: string | null;
  curatorNote: string;
  estPriceLow: number;
  estPriceHigh: number;
  coherence: CoherenceResult;
  state: string;
  generatedBy: string;
  featured?: boolean;
  authorId?: string | null;
  items: RawBundleItem[];
}

// ---- Enriched shapes the UI consumes ----
export interface EnrichedItem {
  productId: string;
  slotId: string;
  role: string;
  note: string | null;
  variant: string;
  swapAlternates: string[];
  product: Product;
  // resolved presentation
  brand: string;
  title: string;
  priceCents: number | null;
  swatch: string;
  isHero: boolean;
  pin: { x: number; y: number };
  bestOffer: Offer | null;
}

export interface EnrichedBundle extends Omit<RawBundle, "items"> {
  items: EnrichedItem[];
  totalLowCents: number;
  totalHighCents: number;
  category: string; // dominant product category (fashion vs golf/coffee/...)
  isFashion: boolean;
}
