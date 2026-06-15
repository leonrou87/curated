import Link from "next/link";
import { getAllBundles, getBundlesByType } from "@/lib/data";
import { FeedMasonry } from "@/components/FeedMasonry";
import { LookCard } from "@/components/LookCard";

export default function HomePage() {
  const all = getAllBundles();
  const featured = all.find((b) => b.featured) ?? all[0];
  const looks = getBundlesByType("look");
  const thisWeek = looks.slice(1, 4);
  const rest = all.filter((b) => b.slug !== featured.slug);

  return (
    <div className="home">
      {/* ── editorial cover / hero ── */}
      <section className="cover-hero">
        <Link href={`/looks/${featured.slug}`} className="ch-link">
          <LookCard bundle={featured} size="wide" />
        </Link>
        <div className="ch-aside">
          <span className="eyebrow">For you · this week</span>
          <h1 className="serif ch-h1">Looks worth wearing,<br />assembled with reason.</h1>
          <p className="ch-sub">
            An editorial feed of complete looks and kits. Describe what you need in plain
            language and watch a coherent look assemble — every piece shoppable, nothing random.
          </p>
          <div className="ch-cta">
            <Link href="/style" className="btn-fill">Style me →</Link>
            <Link href="/looks" className="btn-ghost">Browse looks</Link>
          </div>
        </div>
      </section>

      {/* ── this-week drops ── */}
      <section className="strip">
        <header className="strip-head">
          <h2 className="serif">This week’s drops</h2>
          <Link href="/looks" className="strip-more">All looks →</Link>
        </header>
        <div className="strip-grid">
          {thisWeek.map((b) => <LookCard key={b.id} bundle={b} />)}
        </div>
      </section>

      {/* ── the feed ── */}
      <section className="feed">
        <header className="strip-head">
          <h2 className="serif">For you</h2>
          <span className="eyebrow">{rest.length} looks & kits</span>
        </header>
        <FeedMasonry bundles={rest} />
      </section>

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
        .strip-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .feed{ margin-top:var(--s-9); }
        @media (max-width:900px){ .cover-hero{ grid-template-columns:1fr; } .strip-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:560px){ .strip-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
