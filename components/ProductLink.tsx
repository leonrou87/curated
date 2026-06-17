"use client";
import { AFFILIATE_LINK_ATTRS } from "@/lib/offers";
import type { Offer } from "@/lib/types";

// A whole-card affiliate link — the entire product card is clickable to the retailer. Compliant
// (rel="sponsored nofollow" + new tab) and fires the click event. One link, big tap target.
export function ProductLink({
  offer,
  productId,
  network,
  merchant,
  className = "",
  children,
  ariaLabel,
}: {
  offer: Offer | null;
  productId: string;
  network?: string;
  merchant?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const href = offer?.affiliateUrl || "#";
  const onClick = () => {
    try {
      (window as any).dataLayer?.push?.({ event: "affiliate_click", productId, network: network ?? offer?.network, merchant: merchant ?? offer?.merchant });
    } catch {}
  };
  return (
    <a
      className={className}
      href={href}
      rel={AFFILIATE_LINK_ATTRS.rel}
      target={AFFILIATE_LINK_ATTRS.target}
      onClick={onClick}
      data-affiliate="1"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
