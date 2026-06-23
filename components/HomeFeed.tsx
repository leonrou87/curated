"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { EnrichedBundle } from "@/lib/types";
import { LookCard } from "./LookCard";
import { FeedMasonry } from "./FeedMasonry";
import { BundleCover } from "./BundleCover";
import { useGender, genderMatch } from "@/lib/useGender";
import { useTaste } from "@/lib/useTaste";
import { aestheticOf } from "@/lib/aesthetics";
import { fmtNum } from "@/lib/format";

const HOME_PROMPTS = ["wedding guest", "first date", "job interview", "quiet luxury", "all black", "beach vacation", "men's smart casual", "office siren", "coastal grandmother", "under $300"];

export function HomeFeed({ looks, kits, total }: { looks: EnrichedBundle[]; kits: EnrichedBundle[]; total?: number }) {
  const { gender } = useGender();
  const { taste, top } = useTaste();
  const router = useRouter();
  const [ask, setAsk] = useState("");
  const go = (q: string) => router.push(`/style?q=${encodeURIComponent(q)}`);

  const filtered = useMemo(() => looks.filter((b) => genderMatch(gender, b.brief.gender)), [looks, gender]);
  const featured = filtered.find((b) => b.featured) ?? filtered[0];

  const forYou = useMemo(() => {
    if (!taste.done || !top.length) return [];
    const rank = new Map(top.map((t, idx) => [t.key, top.length - idx]));
    return filtered.filter((b) => rank.has(String(b.brief.vibe)))
      .sort((a, b) => (rank.get(String(b.brief.vibe)) || 0) - (rank.get(String(a.brief.vibe)) || 0)).slice(0, 8);
  }, [filtered, taste.done, top]);

  // diversify by hero piece so adjacent cards never repeat the same garment
  const pooled = useMemo(() => {
    const base = filtered.filter((b) => b.slug !== featured?.slug);
    const seen = new Set<string>();
    const unique: EnrichedBundle[] = [];
    const dupes: EnrichedBundle[] = [];
    for (const b of base) {
      const h = b.coherence.heroItemId || b.items[0]?.productId || b.slug;
      if (seen.has(h)) dupes.push(b);
      else { seen.add(h); unique.push(b); }
    }
    return [...unique, ...dupes];
  }, [filtered, featured]);
  const thisWeek = pooled.slice(0, 3);
  const rest = pooled.slice(3, 39);
  const label = gender === "all" ? "Everyone" : gender === "women" ? "Women" : "Men";
  const topName = top[0] ? aestheticOf(top[0].key).name : null;
  if (!featured) return null;
  const fAes = aestheticOf(String(featured.brief.vibe));

  return (
    <div className="home">
      {/* ── MAGAZINE COVER ── */}
      <section className="cover">
        <Link href={`/looks/${featured.slug}`} className="cover-link" aria-label={featured.title} />
        <div className="cover-art"><BundleCover bundle={featured} /></div>
        <div className="cover-grain" />
        <div className="cover-ui">
          <div className="cover-top">
            <span className="eyebrow">Vol. 01</span>
            <span className="eyebrow">The Style Edit — {label}</span>
            <span className="eyebrow">{fmtNum(total ?? pooled.length)} Looks</span>
          </div>
          <h1 className="serif masthead">Curated</h1>
          <div className="cover-bottom">
            <div className="cover-feature">
              <span className="eyebrow">On the cover — {fAes.name}</span>
              <p className="serif cover-line">{featured.title}</p>
            </div>
            <div className="cover-cta">
              {taste.done
                ? <Link href="/style" className="btn-fill">Style me ↗</Link>
                : <Link href="/quiz" className="btn-fill">Find your aesthetic ↗</Link>}
              <Link href="/looks" className="btn-line">Browse the issue</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── style studio: ask for a look ── */}
      <section className="ask">
        <span className="eyebrow">The Style Studio</span>
        <h2 className="serif ask-h">What are you dressing for?</h2>
        <form className="ask-bar" onSubmit={(e) => { e.preventDefault(); if (ask.trim()) go(ask.trim()); }}>
          <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="A fall outdoor wedding · first date · job interview · beach vacation…" aria-label="Describe what you need" />
          <button type="submit">Style me ↗</button>
        </form>
        <div className="ask-chips">
          {HOME_PROMPTS.map((p) => <button key={p} onClick={() => go(p)}>{p}</button>)}
        </div>
      </section>

      {/* ── taste rail ── */}
      {forYou.length > 0 && (
        <Section idx="00" kicker={`Tuned to your taste · ${topName}`} title="For You" href="/quiz" cta="Retake quiz">
          <div className="row4">{forYou.slice(0, 4).map((b, i) => <LookCard key={b.id} bundle={b} index={i + 1} />)}</div>
        </Section>
      )}

      {/* ── this week ── */}
      <Section idx="01" kicker="New this week" title="The Drop" href="/looks" cta="See all">
        <div className="row3">{thisWeek.map((b, i) => <LookCard key={b.id} bundle={b} size="tall" index={i + 1} />)}</div>
      </Section>

      {/* ── statement / pull-quote ── */}
      <section className="statement">
        <span className="index">★</span>
        <p className="serif">Complete outfits, not endless products. Every look is ready to wear and ready to shop — pick a piece, or take the whole thing.</p>
        <Link href="/quiz" className="st-link">Find your aesthetic ↗</Link>
      </section>

      {/* ── the feed ── */}
      <Section idx="02" kicker={`${fmtNum(total ?? pooled.length)} looks, every aesthetic`} title="The Index" href="/looks" cta={`All ${fmtNum(total ?? pooled.length)}`}>
        <FeedMasonry bundles={rest} />
        <div className="feed-more"><Link href="/looks" className="btn-line">Browse all {fmtNum(total ?? pooled.length)} looks</Link></div>
      </Section>

      {/* ── kits ── */}
      {kits.length > 0 && (
        <Section idx="03" kicker="Beyond the wardrobe" title="The Kits" href="/kits" cta="All kits">
          <div className="row4">{kits.slice(0, 4).map((b, i) => <LookCard key={b.id} bundle={b} index={i + 1} />)}</div>
        </Section>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .home{ }
        .cover{ position:relative; height:min(92vh,880px); overflow:hidden; border-bottom:1px solid var(--line); }
        .cover-link{ position:absolute; inset:0; z-index:2; }
        .cover-art{ position:absolute; inset:0; }
        .cover-art :where(.cover-scene){ transform:scale(1.02); transition:transform 8s linear; }
        .cover:hover .cover-art :where(.cover-scene){ transform:scale(1.08); }
        .cover-grain{ position:absolute; inset:0; z-index:1; pointer-events:none;
          background:linear-gradient(180deg, rgba(16,15,13,.55) 0%, transparent 26%, transparent 50%, rgba(16,15,13,.82) 100%); }
        .cover-ui{ position:absolute; inset:0; z-index:3; display:flex; flex-direction:column; justify-content:space-between;
          padding:clamp(20px,4vw,52px); pointer-events:none; }
        .cover-top{ display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid rgba(243,237,225,.2); padding-bottom:16px;
          animation:rise .7s var(--ease-out) both; }
        .cover-top .eyebrow{ color:var(--ink-soft); }
        .masthead{ font-family:var(--serif); font-weight:330; font-size:var(--t-masthead); line-height:.8; letter-spacing:-.03em;
          text-align:center; margin:auto 0; color:var(--ink); text-shadow:0 2px 50px rgba(0,0,0,.5);
          animation:rise 1s var(--ease-out) .12s both; }
        .cover-bottom{ display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap;
          animation:rise .8s var(--ease-out) .28s both; }
        .cover-feature{ max-width:60%; }
        .cover-line{ font-style:italic; font-weight:400; font-size:clamp(1.6rem,3vw,2.8rem); line-height:1.0; letter-spacing:-.02em; margin:8px 0 0; }
        @keyframes rise{ from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:none; } }
        .cover-cta{ display:flex; gap:12px; pointer-events:auto; }
        .btn-fill{ background:var(--accent); color:var(--accent-ink); padding:14px 26px; font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; transition:.2s; }
        .btn-fill:hover{ background:var(--accent-soft); }
        .btn-line{ border:1px solid var(--ink-soft); color:var(--ink); padding:14px 24px; font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; transition:.2s; }
        .btn-line:hover{ background:var(--ink); color:var(--bg); border-color:var(--ink); }

        .ask{ max-width:760px; margin:var(--s-9) auto 0; padding:0 24px; text-align:center; }
        .ask-h{ font-weight:400; font-style:italic; font-size:clamp(1.8rem,3.6vw,3rem); letter-spacing:-.02em; margin:10px 0 22px; }
        .ask-bar{ display:flex; gap:8px; background:var(--surface); border:1px solid var(--line); padding:7px 7px 7px 22px; }
        .ask-bar:focus-within{ border-color:var(--accent); }
        .ask-bar input{ flex:1; min-width:0; background:none; border:none; outline:none; color:var(--ink); font-family:var(--serif); font-style:italic; font-size:17px; }
        .ask-bar input::placeholder{ color:var(--ink-mute); }
        .ask-bar button{ background:var(--accent); color:var(--accent-ink); border:none; padding:13px 22px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; white-space:nowrap; }
        .ask-bar button:hover{ background:var(--accent-soft); }
        .ask-chips{ display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:16px; }
        .ask-chips button{ font-family:var(--serif); font-style:italic; font-size:14px; color:var(--ink-soft); background:none; border:1px solid var(--line); padding:7px 14px; border-radius:999px; cursor:pointer; transition:.18s; }
        .ask-chips button:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .statement{ max-width:1000px; margin:var(--s-10) auto; padding:0 24px; text-align:center; }
        .statement .index{ font-size:1rem; color:var(--accent); }
        .statement p{ font-family:var(--serif); font-weight:300; font-size:clamp(1.5rem,3.4vw,2.6rem); line-height:1.28; letter-spacing:-.015em; margin:18px auto 18px; max-width:24ch; }
        .st-link{ font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--accent-soft); }

        .row4{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
        .row3{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .feed-more{ display:flex; justify-content:center; margin-top:40px; }
        @media (max-width:900px){ .row4{ grid-template-columns:repeat(2,1fr); } .row3{ grid-template-columns:repeat(2,1fr); } .cover-feature{ max-width:100%; } }
        @media (max-width:560px){ .row4, .row3{ grid-template-columns:1fr 1fr; } }
      ` }} />
    </div>
  );
}

// editorial section header with index + hairline
function Section({ idx, kicker, title, href, cta, children }: { idx: string; kicker: string; title: string; href: string; cta: string; children: React.ReactNode }) {
  return (
    <section className="sec">
      <header className="sec-head">
        <div className="sec-left">
          <span className="index">{idx}</span>
          <span className="eyebrow">{kicker}</span>
        </div>
        <h2 className="serif sec-title">{title}</h2>
        <Link href={href} className="sec-cta">{cta} ↗</Link>
      </header>
      <hr className="rule sec-rule" />
      {children}
      <style dangerouslySetInnerHTML={{ __html: `
        .sec{ max-width:var(--max); margin:var(--s-9) auto 0; padding:0 24px; }
        .sec-head{ display:grid; grid-template-columns:1fr auto 1fr; align-items:baseline; gap:16px; }
        .sec-left{ display:flex; align-items:baseline; gap:12px; }
        .sec-title{ text-align:center; font-weight:400; font-style:italic; font-size:clamp(1.8rem,3.2vw,3rem); letter-spacing:-.02em; }
        .sec-cta{ justify-self:end; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-soft); }
        .sec-cta:hover{ color:var(--ink); }
        .sec-rule{ margin:16px 0 26px; }
        @media (max-width:640px){ .sec-head{ grid-template-columns:1fr auto; } .sec-title{ grid-column:1 / -1; grid-row:2; text-align:left; } .sec-cta{ display:none; } }
      ` }} />
    </section>
  );
}
