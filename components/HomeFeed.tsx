"use client";
import Link from "next/link";
import { useMemo } from "react";
import type { EnrichedBundle } from "@/lib/types";
import { LookCard } from "./LookCard";
import { FeedMasonry } from "./FeedMasonry";
import { useGender, genderMatch } from "@/lib/useGender";
import { useTaste } from "@/lib/useTaste";
import { aestheticOf } from "@/lib/aesthetics";

export function HomeFeed({ looks, kits }: { looks: EnrichedBundle[]; kits: EnrichedBundle[] }) {
  const { gender } = useGender();
  const { taste, top } = useTaste();

  const filtered = useMemo(() => looks.filter((b) => genderMatch(gender, b.brief.gender)), [looks, gender]);
  const featured = filtered.find((b) => b.featured) ?? filtered[0];

  // personalized rail: looks matching the user's top aesthetics from the quiz
  const forYou = useMemo(() => {
    if (!taste.done || !top.length) return [];
    const rank = new Map(top.map((t, idx) => [t.key, top.length - idx]));
    return filtered
      .filter((b) => rank.has(String(b.brief.vibe)))
      .sort((a, b) => (rank.get(String(b.brief.vibe)) || 0) - (rank.get(String(a.brief.vibe)) || 0))
      .slice(0, 8);
  }, [filtered, taste.done, top]);

  const thisWeek = filtered.filter((b) => b.slug !== featured?.slug).slice(0, 3);
  const rest = filtered.filter((b) => b.slug !== featured?.slug);

  const label = gender === "all" ? "Everyone" : gender === "women" ? "Women" : "Men";
  const topName = top[0] ? aestheticOf(top[0].key).name : null;

  if (!featured) return null;

  return (
    <div className="home">
      <section className="cover-hero">
        <Link href={`/looks/${featured.slug}`} className="ch-link">
          <LookCard bundle={featured} size="wide" />
        </Link>
        <div className="ch-aside">
          <span className="eyebrow">For you · {label} · this week</span>
          <h1 className="serif ch-h1">Looks worth wearing,<br />assembled with reason.</h1>
          <p className="ch-sub">
            An editorial feed of complete looks and kits — real pieces from real brands, every one
            validated by the coherence engine. Tell it the occasion and watch a look assemble.
          </p>
          <div className="ch-cta">
            {taste.done ? (
              <Link href="/style" className="btn-fill">Style me →</Link>
            ) : (
              <Link href="/quiz" className="btn-fill">Take the style quiz →</Link>
            )}
            <Link href="/looks" className="btn-ghost">Browse looks</Link>
          </div>
        </div>
      </section>

      {forYou.length > 0 && (
        <section className="strip">
          <header className="strip-head">
            <h2 className="serif">For your taste{topName ? ` · ${topName}` : ""}</h2>
            <Link href="/quiz" className="strip-more">Retake quiz →</Link>
          </header>
          <div className="strip-grid">
            {forYou.slice(0, 4).map((b) => <LookCard key={b.id} bundle={b} />)}
          </div>
        </section>
      )}

      <section className="strip">
        <header className="strip-head">
          <h2 className="serif">This week’s drops</h2>
          <Link href="/looks" className="strip-more">All looks →</Link>
        </header>
        <div className="strip-grid">
          {thisWeek.map((b) => <LookCard key={b.id} bundle={b} />)}
        </div>
      </section>

      <section className="feed">
        <header className="strip-head">
          <h2 className="serif">For you</h2>
          <span className="eyebrow">{rest.length} looks</span>
        </header>
        <FeedMasonry bundles={rest} />
      </section>

      {kits.length > 0 && (
        <section className="strip">
          <header className="strip-head">
            <h2 className="serif">Kits</h2>
            <Link href="/kits" className="strip-more">All kits →</Link>
          </header>
          <div className="strip-grid">
            {kits.slice(0, 4).map((b) => <LookCard key={b.id} bundle={b} />)}
          </div>
        </section>
      )}

      <style>{`
        .home{ max-width:1240px; margin:0 auto; padding:32px 24px 0; }
        .cover-hero{ display:grid; grid-template-columns:1.5fr 1fr; gap:32px; align-items:stretch; }
        .ch-link{ display:block; }
        .ch-aside{ display:flex; flex-direction:column; justify-content:center; gap:18px; padding:8px 0; }
        .ch-h1{ font-weight:400; font-size:clamp(2rem,3.4vw,3.2rem); line-height:1.04; letter-spacing:-.02em; margin:6px 0 0; }
        .ch-sub{ color:var(--ink-soft); font-size:15px; line-height:1.6; max-width:46ch; margin:0; }
        .ch-cta{ display:flex; gap:12px; margin-top:6px; }
        .btn-fill{ background:var(--accent); color:var(--accent-ink); padding:13px 24px; border-radius:999px; font-size:14.5px; font-weight:500; transition:.2s; }
        .btn-fill:hover{ background:var(--accent-soft); transform:translateY(-1px); }
        .btn-ghost{ border:1px solid var(--line); color:var(--ink-soft); padding:13px 22px; border-radius:999px; font-size:14.5px; transition:.2s; }
        .btn-ghost:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .strip{ margin-top:var(--s-9); }
        .strip-head{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:18px; }
        .strip-head h2{ font-weight:400; font-size:clamp(1.4rem,2.2vw,2rem); letter-spacing:-.01em; }
        .strip-more{ font-size:13px; color:var(--ink-soft); } .strip-more:hover{ color:var(--ink); }
        .strip-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
        .feed{ margin-top:var(--s-9); }
        @media (max-width:900px){ .cover-hero{ grid-template-columns:1fr; } .strip-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:560px){ .strip-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
