"use client";
import { useState } from "react";

// Product images point at retailer CDNs that can rotate/expire. On error we hide the <img>, which
// reveals the color-swatch background underneath — so a dead image degrades gracefully, never a
// broken-image icon. A client component, safely renderable inside server components.
export function SafeImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (failed || !props.src) return null;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} alt={props.alt ?? ""} onError={() => setFailed(true)} />;
}
