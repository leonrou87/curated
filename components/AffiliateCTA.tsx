"use client";
import { AFFILIATE_LINK_ATTRS, isAmazon } from "@/lib/offers";
import type { Offer } from "@/lib/types";

// The ONLY outbound button style. Always rel="sponsored nofollow" + new tab. Fires a click
// event (the affiliate-conversion proxy). resolveBestOffer() already picked the network.
export function AffiliateCTA({
  offer,
  brand,
  productId,
  variant = "pill",
}: {
  offer: Offer | null;
  brand: string;
  productId: string;
  variant?: "pill" | "fill";
}) {
  const href = offer?.affiliateUrl || "#";
  const onClick = () => {
    // analytics: affiliate-click is the conversion proxy (GA4/Plausible-configurable)
    try {
      (window as any).dataLayer?.push?.({
        event: "affiliate_click",
        productId,
        network: offer?.network,
        merchant: offer?.merchant,
      });
    } catch {}
  };
  return (
    <a
      className={"acta " + variant}
      href={href}
      rel={AFFILIATE_LINK_ATTRS.rel}
      target={AFFILIATE_LINK_ATTRS.target}
      onClick={onClick}
      data-affiliate="1"
      aria-label={`Shop ${brand}${isAmazon(offer) ? " on Amazon" : ""} (opens in a new tab)`}
    >
      Shop {brand.split(" ")[0]} <b aria-hidden>↗</b>
      <style dangerouslySetInnerHTML={{ __html: `
        .acta{ font-size:12.5px; white-space:nowrap; display:inline-flex; align-items:center; gap:6px;
          border-radius:999px; transition:.2s; cursor:pointer; }
        .acta.pill{ color:var(--ink); border:1px solid var(--line); padding:8px 14px; }
        .acta.pill:hover{ border-color:var(--accent); color:var(--accent-soft); }
        .acta.fill{ background:var(--accent); color:var(--accent-ink); padding:10px 18px; font-weight:500; }
        .acta.fill:hover{ background:var(--accent-soft); }
        .acta b{ font-weight:400; display:inline-block; transition:transform .2s; }
        .acta:hover b{ transform:translateX(2px); }
      ` }} />
    </a>
  );
}
