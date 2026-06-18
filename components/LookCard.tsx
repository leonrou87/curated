import Link from "next/link";
import type { EnrichedBundle } from "@/lib/types";
import { fmtRange } from "@/lib/format";
import { aestheticOf } from "@/lib/aesthetics";
import { BundleCover } from "./BundleCover";

const TYPE_PATH: Record<string, string> = {
  look: "/looks", kit: "/kits", collection: "/collections", gift: "/gifts",
};

// Editorial cover card — full-bleed collage, hairline frame, mono credit line, serif title that
// underlines on hover, an index/coherence stamp. Reads like a magazine plate, not a product box.
export function LookCard({ bundle, size = "md", index }: { bundle: EnrichedBundle; size?: "md" | "tall" | "wide"; index?: number }) {
  const href = `${TYPE_PATH[bundle.type] ?? "/looks"}/${bundle.slug}`;
  const aes = aestheticOf(String(bundle.brief.vibe || bundle.brief.occasion));
  const credit = [bundle.brief.gender, aes.name].filter(Boolean).join("  /  ");

  return (
    <Link href={href} className={"lookcard " + size}>
      <div className="lc-img">
        <BundleCover bundle={bundle} />
        <span className="lc-frame" />
        {index != null && <span className="index lc-index">N°{String(index).padStart(2, "0")}</span>}
        <span className="lc-coh mono"><i />{bundle.coherence.score.toFixed(0)}</span>
        <div className="lc-overlay">
          <span className="eyebrow lc-credit">{credit}</span>
          <h3 className="serif lc-title">{bundle.title}</h3>
          <span className="mono lc-price">{fmtRange(bundle.totalLowCents, bundle.totalHighCents)} · {bundle.items.length} pieces</span>
        </div>
      </div>
      <style>{`
        .lookcard{ display:block; position:relative; overflow:hidden; aspect-ratio:4/5; background:var(--surface); }
        .lookcard.tall{ aspect-ratio:3/5; }
        .lookcard.wide{ aspect-ratio:16/11; }
        .lc-img{ position:absolute; inset:0; }
        .lc-frame{ position:absolute; inset:10px; border:1px solid rgba(243,237,225,.22); z-index:4; pointer-events:none; transition:inset .5s var(--ease-out), border-color .4s ease; }
        .lookcard:hover .lc-frame{ inset:14px; border-color:rgba(243,237,225,.4); }
        .lookcard :where(.cover-scene){ transition:transform .7s var(--ease-out); }
        .lookcard:hover :where(.cover-scene){ transform:scale(1.045); }
        .lc-index{ position:absolute; top:20px; left:20px; z-index:5; mix-blend-mode:difference; color:#fff; }
        .lc-coh{ position:absolute; top:18px; right:18px; z-index:5; font-size:10.5px; color:var(--ink);
          display:inline-flex; align-items:center; gap:5px; letter-spacing:.04em; }
        .lc-coh i{ width:5px; height:5px; border-radius:50%; background:var(--positive); box-shadow:0 0 0 3px color-mix(in srgb,var(--positive) 22%, transparent); }
        .lc-overlay{ position:absolute; left:0; right:0; bottom:0; padding:24px; z-index:5; }
        .lc-credit{ display:block; color:var(--ink-soft); margin-bottom:9px; font-size:.7rem; }
        .lc-title{ font-weight:430; font-style:italic; font-size:clamp(1.25rem,1.9vw,1.8rem); line-height:1.0;
          letter-spacing:-.015em; margin:0 0 9px; position:relative; display:inline; padding-bottom:3px;
          background:linear-gradient(var(--accent),var(--accent)) left bottom / 0% 1.5px no-repeat; transition:background-size .45s var(--ease-out); }
        .lookcard:hover .lc-title{ background-size:100% 1.5px; }
        .lc-price{ display:block; font-size:11px; color:var(--ink-soft); letter-spacing:.02em; }
      `}</style>
    </Link>
  );
}
