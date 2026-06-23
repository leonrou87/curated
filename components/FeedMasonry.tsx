import type { EnrichedBundle } from "@/lib/types";
import { LookCard } from "./LookCard";

// Varied-height editorial masonry (not a uniform grid). Sizes vary by position for magazine
// rhythm; an "editorial break" cover can be injected by the caller between sections.
export function FeedMasonry({ bundles }: { bundles: EnrichedBundle[] }) {
  return (
    <div className="masonry">
      {bundles.map((b, i) => {
        const size = i % 7 === 0 ? "tall" : i % 5 === 3 ? "tall" : "md";
        return (
          <div key={b.id} className={"masonry-item " + size}>
            <LookCard bundle={b} size={size as any} />
          </div>
        );
      })}
      <style dangerouslySetInnerHTML={{ __html: `
        .masonry{ columns: 3 280px; column-gap:18px; }
        .masonry-item{ break-inside:avoid; margin-bottom:18px; }
        @media (max-width:900px){ .masonry{ columns:2 240px; } }
        @media (max-width:560px){ .masonry{ columns:1; } }
      ` }} />
    </div>
  );
}
