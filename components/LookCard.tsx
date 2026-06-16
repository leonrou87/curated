import Link from "next/link";
import type { EnrichedBundle } from "@/lib/types";
import { fmtRange, titleCase } from "@/lib/format";
import { BundleCover } from "./BundleCover";

const TYPE_PATH: Record<string, string> = {
  look: "/looks", kit: "/kits", collection: "/collections", gift: "/gifts",
};

// Editorial card — full-bleed cover, gradient scrim, serif title bottom-left, mono price range,
// small-caps occasion eyebrow. NOT a boxed product card.
export function LookCard({ bundle, size = "md" }: { bundle: EnrichedBundle; size?: "md" | "tall" | "wide" }) {
  const href = `${TYPE_PATH[bundle.type] ?? "/looks"}/${bundle.slug}`;
  const eyebrow = [bundle.brief.gender, bundle.brief.vibe || bundle.brief.occasion, bundle.brief.activity]
    .filter(Boolean)
    .map((s) => titleCase(String(s)))
    .slice(0, 2)
    .join(" · ");

  return (
    <Link href={href} className={"lookcard " + size}>
      <div className="lc-img">
        <BundleCover bundle={bundle} />
        <div className="lc-overlay">
          {eyebrow && <span className="eyebrow lc-eyebrow">{eyebrow}</span>}
          <h3 className="serif lc-title">{bundle.title}</h3>
          <span className="mono lc-price">{fmtRange(bundle.totalLowCents, bundle.totalHighCents)}</span>
        </div>
        <span className="lc-coh mono" title={`Coherence ${bundle.coherence.score}`}>
          <i /> {bundle.coherence.score.toFixed(0)}
        </span>
      </div>
      <style>{`
        .lookcard{ display:block; position:relative; border-radius:4px; overflow:hidden;
          aspect-ratio:4/5; background:var(--surface); }
        .lookcard.tall{ aspect-ratio:3/5; }
        .lookcard.wide{ aspect-ratio:16/10; }
        .lc-img{ position:absolute; inset:0; }
        .lookcard :where(.cover-scene){ transition:transform .6s var(--ease-out); }
        .lookcard:hover :where(.cover-scene){ transform:scale(1.04); }
        .lc-overlay{ position:absolute; left:0; right:0; bottom:0; padding:20px; z-index:3; }
        .lc-eyebrow{ display:block; color:var(--ink-soft); margin-bottom:6px; }
        .lc-title{ font-weight:400; font-size:clamp(1.1rem,1.6vw,1.5rem); line-height:1.05;
          letter-spacing:-.01em; margin:0 0 8px; position:relative; display:inline; }
        .lc-title::after{ content:""; position:absolute; left:0; right:100%; bottom:-4px; height:1.5px;
          background:var(--accent); transition:right .4s var(--ease-out); }
        .lookcard:hover .lc-title::after{ right:0; }
        .lc-price{ font-size:13px; color:var(--ink-soft); }
        .lc-coh{ position:absolute; top:12px; right:12px; z-index:3; font-size:11px; color:var(--ink);
          background:color-mix(in srgb, var(--bg) 55%, transparent); backdrop-filter:blur(6px);
          padding:4px 9px; border-radius:999px; display:inline-flex; align-items:center; gap:5px; }
        .lc-coh i{ width:6px; height:6px; border-radius:50%; background:var(--positive); }
      `}</style>
    </Link>
  );
}
