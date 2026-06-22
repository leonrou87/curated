"use client";
import { useCart, type CartItem } from "@/lib/useCart";

// Small "add to bag" toggle, designed to overlay a product image (sibling of the shop link, not
// nested in it). Shows ＋ when not in bag, ✓ when in bag.
export function AddToCartButton({ item, variant = "overlay" }: { item: CartItem; variant?: "overlay" | "inline" }) {
  const { has, toggle } = useCart();
  const inBag = has(item.id);
  return (
    <button
      className={`atc ${variant}` + (inBag ? " on" : "")}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
      aria-label={inBag ? "Remove from bag" : "Add to bag"}
      aria-pressed={inBag}
      title={inBag ? "In your bag" : "Add to bag"}
    >
      {inBag ? "✓" : "＋"}
      {variant === "inline" && <span>{inBag ? "In bag" : "Add to bag"}</span>}
      <style>{`
        .atc{ cursor:pointer; font-family:var(--mono); transition:.18s; display:inline-flex; align-items:center; gap:7px; }
        .atc.overlay{ position:absolute; top:12px; right:12px; z-index:6; width:32px; height:32px; justify-content:center;
          border-radius:999px; border:none; font-size:15px; line-height:1;
          background:color-mix(in srgb, var(--bg) 55%, transparent); backdrop-filter:blur(8px); color:var(--ink); }
        .atc.overlay:hover{ background:var(--accent); color:var(--accent-ink); }
        .atc.overlay.on{ background:var(--accent); color:var(--accent-ink); }
        .atc.inline{ font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-soft);
          border:1px solid var(--line); background:none; padding:10px 16px; }
        .atc.inline:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .atc.inline.on{ color:var(--accent-soft); border-color:var(--accent); }
      `}</style>
    </button>
  );
}
