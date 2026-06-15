"use client";
import Link from "next/link";
import type { EnrichedBundle } from "@/lib/types";
import { useSaved } from "@/lib/useSaved";
import { LookCard } from "./LookCard";

export function SavedGrid({ bundles }: { bundles: EnrichedBundle[] }) {
  const { list } = useSaved();
  const saved = bundles.filter((b) => list.includes(b.slug));

  return (
    <div className="saved">
      <header className="s-head">
        <h1 className="serif">Your closet</h1>
        <p className="s-blurb">Saved looks & kits. Stored locally for now — they’ll follow your account once you sign in.</p>
      </header>
      {saved.length === 0 ? (
        <div className="s-empty">
          <p>Nothing saved yet.</p>
          <Link href="/looks" className="s-cta">Browse looks →</Link>
        </div>
      ) : (
        <div className="s-grid">{saved.map((b) => <LookCard key={b.id} bundle={b} />)}</div>
      )}
      <style>{`
        .saved{ max-width:1240px; margin:0 auto; padding:36px 24px 0; }
        .s-head h1{ font-weight:400; font-size:clamp(2rem,3.4vw,3rem); letter-spacing:-.02em; margin:0; }
        .s-blurb{ color:var(--ink-soft); margin:10px 0 0; }
        .s-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:28px; }
        .s-empty{ margin-top:60px; text-align:center; color:var(--ink-soft); display:flex; flex-direction:column; gap:14px; align-items:center; }
        .s-cta{ color:var(--accent-soft); }
        @media (max-width:1000px){ .s-grid{ grid-template-columns:repeat(3,1fr); } }
        @media (max-width:760px){ .s-grid{ grid-template-columns:repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
