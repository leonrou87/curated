"use client";
import { useMemo, useState } from "react";
import type { EnrichedBundle } from "@/lib/types";
import { LookCard } from "./LookCard";
import { titleCase } from "@/lib/format";

type Facet = "occasion" | "vibe" | "gender" | "budgetTier" | "season";
const FACETS: Facet[] = ["occasion", "vibe", "gender", "season", "budgetTier"];

// Faceted browser — filters are data-driven from each bundle's brief (no per-category code).
export function BundleBrowser({ bundles, title, blurb }: { bundles: EnrichedBundle[]; title: string; blurb: string }) {
  const [active, setActive] = useState<Partial<Record<Facet, string>>>({});

  const options = useMemo(() => {
    const map: Record<Facet, Set<string>> = { occasion: new Set(), vibe: new Set(), gender: new Set(), budgetTier: new Set(), season: new Set() };
    for (const b of bundles) for (const f of FACETS) {
      const v = (b.brief as any)[f];
      if (v) map[f].add(String(v));
    }
    return map;
  }, [bundles]);

  const filtered = bundles.filter((b) =>
    FACETS.every((f) => !active[f] || String((b.brief as any)[f]) === active[f])
  );

  const toggle = (f: Facet, v: string) =>
    setActive((a) => ({ ...a, [f]: a[f] === v ? undefined : v }));

  return (
    <div className="browser">
      <header className="b-head">
        <h1 className="serif">{title}</h1>
        <p className="b-blurb">{blurb}</p>
      </header>

      <div className="facets">
        {FACETS.map((f) =>
          options[f].size > 1 ? (
            <div className="facet" key={f}>
              <span className="eyebrow">{titleCase(f === "budgetTier" ? "budget" : f)}</span>
              <div className="chips">
                {[...options[f]].sort().map((v) => (
                  <button key={v} className={"chip" + (active[f] === v ? " on" : "")} onClick={() => toggle(f, v)}>
                    {titleCase(v)}
                  </button>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>

      <div className="b-count eyebrow">{filtered.length} result{filtered.length === 1 ? "" : "s"}</div>
      <div className="b-grid">
        {filtered.map((b) => <LookCard key={b.id} bundle={b} />)}
      </div>

      <style>{`
        .browser{ max-width:1240px; margin:0 auto; padding:36px 24px 0; }
        .b-head h1{ font-weight:400; font-size:clamp(2rem,3.6vw,3.2rem); letter-spacing:-.02em; margin:0; }
        .b-blurb{ color:var(--ink-soft); max-width:60ch; margin:10px 0 0; font-size:15px; }
        .facets{ display:flex; flex-wrap:wrap; gap:22px; margin:28px 0 8px; }
        .facet{ display:flex; flex-direction:column; gap:8px; }
        .chips{ display:flex; flex-wrap:wrap; gap:7px; }
        .chip{ font-size:12.5px; color:var(--ink-soft); background:var(--surface); border:1px solid var(--line);
          padding:6px 13px; border-radius:999px; cursor:pointer; transition:.2s; }
        .chip:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .chip.on{ background:var(--ink); color:var(--bg); border-color:var(--ink); }
        .b-count{ margin:18px 0; }
        .b-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
        @media (max-width:1000px){ .b-grid{ grid-template-columns:repeat(3,1fr); } }
        @media (max-width:760px){ .b-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:480px){ .b-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
