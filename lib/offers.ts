// offers.ts — offer-centric monetization. Components NEVER hardcode a network.
// resolveBestOffer() ranks Offers; layer order: Sovrn/Skimlinks (default) → Amazon PA-API
// (gated, graceful no-op without creds) → direct networks. Carries the link-health status.
import type { Offer, Product } from "./types";

const NETWORK_RANK: Record<string, number> = {
  sovrn: 5, // default breadth, solves cold-start
  shareasale: 4,
  cj: 4,
  impact: 4,
  direct: 3,
  amazon: 2, // gated behind the 3-sale rule; deprioritized until creds present
  manual: 1,
};

const AMAZON_CREDS_PRESENT = Boolean(process.env.AMAZON_PA_API_KEY); // graceful no-op without

function priceFit(o: Offer): number {
  // light priceFit proxy: in-stock & has a snapshot ranks higher
  let s = o.inStock ? 1 : 0.2;
  if (o.priceSnapshot) s += 0.1;
  return s;
}

export function resolveBestOffer(product: Product): Offer | null {
  const candidates = product.offers.filter((o) => {
    if (o.status === "dead") return false;
    if (o.network === "amazon" && !AMAZON_CREDS_PRESENT) return false; // gated
    return true;
  });
  if (!candidates.length) {
    // fall back to any active offer even if amazon-gated, so the demo always has a CTA
    const any = product.offers.find((o) => o.status !== "dead");
    return any ?? product.offers[0] ?? null;
  }
  return candidates
    .map((o) => ({
      o,
      // commissionEst × inStock × priceFit, then network preference as tiebreak
      score: (o.commissionEst ?? 0.05) * (o.inStock ? 1 : 0.25) * priceFit(o) +
        (NETWORK_RANK[o.network] ?? 0) / 100,
    }))
    .sort((a, b) => b.score - a.score)[0].o;
}

// Required compliance attributes for any outbound affiliate link.
export const AFFILIATE_LINK_ATTRS = {
  rel: "sponsored nofollow",
  target: "_blank" as const,
};

export const FTC_DISCLOSURE =
  "Curated earns commission on items you buy through these links, at no extra cost to you. As an Amazon Associate we earn from qualifying purchases.";

// Whether an offer's affiliate URL points at Amazon (drives Amazon-required disclosure text).
export function isAmazon(offer: Offer | null): boolean {
  if (!offer) return false;
  return offer.network === "amazon" || /amazon\./i.test(offer.affiliateUrl);
}
