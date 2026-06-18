"use client";
import { useMemo, useState } from "react";
import type { EnrichedBundle } from "@/lib/types";
import { LookCard } from "./LookCard";
import { titleCase } from "@/lib/format";
import { useGender, genderMatch } from "@/lib/useGender";

// gender is controlled by the top-level nav switch, so it's not a facet here.
type Facet = "vibe" | "occasion" | "budgetTier" | "season";
const FACETS: Facet[] = ["vibe", "occasion", "season", "budgetTier"];

// Faceted browser — filters are data-driven from each bundle's brief (no per-category code).
export function BundleBrowser({ bundles, title, blurb }: { bundles: EnrichedBundle[]; title: string; blurb: string }) {
  const [active, setActive] = useState<Partial<Record<Facet, string>>>({});
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "coherence">("featured");
  const [limit, setLimit] = useState(48);
  const { gender } = useGender();

  const genderScoped = useMemo(() => bundles.filter((b) => genderMatch(gender, b.brief.gender)), [bundles, gender]);

  const options = useMemo(() => {
    const map: Record<Facet, Set<string>> = { occasion: new Set(), vibe: new Set(), budgetTier: new Set(), season: new Set() };
    for (const b of genderScoped) for (const f of FACETS) {
      const v = (b.brief as any)[f];
      if (v) map[f].add(String(v));
    }
    return map;
  }, [genderScoped]);

  const filtered = useMemo(() => {
    const list = genderScoped.filter((b) => FACETS.every((f) => !active[f] || String((b.brief as any)[f]) === active[f]));
    const s = [...list];
    if (sort === "price-asc") s.sort((a, b) => a.totalLowCents - b.totalLowCents);
    else if (sort === "price-desc") s.sort((a, b) => b.totalLowCents - a.totalLowCents);
    else if (sort === "coherence") s.sort((a, b) => b.coherence.score - a.coherence.score);
    else s.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return s;
  }, [genderScoped, active, sort]);

  const toggle = (f: Facet, v: string) => { setLimit(48); setActive((a) => ({ ...a, [f]: a[f] === v ? undefined : v })); };
  const shown = filtered.slice(0, limit);

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
              <span className="eyebrow">{f === "budgetTier" ? "Budget" : f === "vibe" ? "Aesthetic" : titleCase(f)}</span>
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

      <div className="b-toolbar">
        <span className="b-count eyebrow">{filtered.length} look{filtered.length === 1 ? "" : "s"}</span>
        <label className="b-sort">
          <span className="eyebrow">Sort</span>
          <select value={sort} onChange={(e) => { setLimit(48); setSort(e.target.value as any); }}>
            <option value="featured">Featured</option>
            <option value="coherence">Most coherent</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="b-grid">
        {shown.map((b) => <LookCard key={b.id} bundle={b} />)}
      </div>
      {limit < filtered.length && (
        <div className="b-more">
          <button onClick={() => setLimit((l) => l + 48)}>Show more — {filtered.length - limit} left</button>
        </div>
      )}

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
        .b-toolbar{ display:flex; justify-content:space-between; align-items:center; margin:18px 0; }
        .b-sort{ display:flex; align-items:center; gap:8px; }
        .b-sort select{ background:var(--surface); border:1px solid var(--line); color:var(--ink); border-radius:999px; padding:7px 12px; font-size:13px; font-family:var(--sans); cursor:pointer; }
        .b-more{ display:flex; justify-content:center; margin:32px 0 0; }
        .b-more button{ background:var(--surface); border:1px solid var(--line); color:var(--ink); padding:13px 28px; border-radius:999px; font-size:14px; cursor:pointer; transition:.2s; }
        .b-more button:hover{ border-color:var(--accent); color:var(--accent-soft); }
        .b-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
        @media (max-width:1000px){ .b-grid{ grid-template-columns:repeat(3,1fr); } }
        @media (max-width:760px){ .b-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:480px){ .b-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
