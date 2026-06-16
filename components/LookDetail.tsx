"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { EnrichedBundle } from "@/lib/types";
import { fmtCents, fmtRange, titleCase } from "@/lib/format";
import { RULE_LABELS } from "@/lib/coherence";
import { FTC_DISCLOSURE } from "@/lib/offers";
import { BundleCover } from "./BundleCover";
import { ShoppablePins } from "./ShoppablePins";
import { AffiliateCTA } from "./AffiliateCTA";
import { CoherenceMeter } from "./CoherenceMeter";
import { ShareButton } from "./ShareButton";
import { useSaved } from "@/lib/useSaved";

const TYPE_PATH: Record<string, string> = { look: "looks", kit: "kits", collection: "collections", gift: "gifts" };

// The hero page (MILESTONE-2). Assemble-on-screen reveal → shoppable pins → why-it-works →
// compliant breakdown → coherence transparency → save flight. Reduced-motion → instant.
export function LookDetail({ bundle }: { bundle: EnrichedBundle }) {
  const [revealed, setRevealed] = useState(false);
  const [stage, setStage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [flight, setFlight] = useState(false);
  const reduce = useRef(false);
  const { saved, toggle } = useSaved(bundle.slug);

  const total = bundle.items.reduce((s, i) => s + (i.priceCents ?? 0), 0);
  const eyebrow = [bundle.brief.occasion, bundle.brief.vibe, bundle.brief.gender]
    .filter(Boolean).map((s) => titleCase(String(s))).join(" · ");

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) { setRevealed(true); setStage(9); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setRevealed(true), 80));
    t.push(setTimeout(() => setStage(1), 300)); // pins
    t.push(setTimeout(() => setStage(2), 640)); // title
    t.push(setTimeout(() => setStage(3), 820)); // note
    return () => t.forEach(clearTimeout);
  }, []);

  const onSave = () => {
    toggle();
    if (!saved && !reduce.current) {
      setFlight(true);
      setTimeout(() => setFlight(false), 720);
    }
  };

  return (
    <div className="ld">
      {/* ── cover ── */}
      <section className="cover">
        <div className={"cover-img" + (revealed ? " in" : "")}>
          <BundleCover bundle={bundle} />
          <ShoppablePins
            items={bundle.items}
            visible={stage >= 1}
            activeId={activeId}
            setActiveId={setActiveId}
            reduced={reduce.current}
          />
          <div className="cover-meta">
            <div className={"cm-eyebrow" + (stage >= 2 ? " in" : "")}>{eyebrow}</div>
            <h1 className={"serif cm-title" + (stage >= 2 ? " in" : "")}>
              <span className="cm-title-mask">{bundle.title}</span>
            </h1>
            <div className={"cm-row" + (stage >= 2 ? " in" : "")}>
              <span className="mono cm-price">{fmtCents(total)}<i> total look</i></span>
              <span className="cm-dot">·</span>
              <span className="cm-coh"><i className="coh-tick" /> Coherence {bundle.coherence.score.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── why it works ── */}
      <section className={"why" + (stage >= 3 ? " in" : "")}>
        <span className="eyebrow why-label">Why it works</span>
        <p className="serif why-note">{bundle.curatorNote}</p>
        <span className="mono why-scheme">Palette — {bundle.coherence.scheme}</span>
      </section>

      {/* ── breakdown (compliant) ── */}
      <section className="breakdown">
        <p className="disclosure">{FTC_DISCLOSURE}</p>
        <ul className="rows">
          {bundle.items.map((it) => (
            <li
              key={it.productId}
              className={"row" + (activeId === it.productId ? " active" : "")}
              onMouseEnter={() => setActiveId(it.productId)}
              onMouseLeave={() => setActiveId(null)}
            >
              <span className="r-thumb" style={{ background: it.swatch }}>
                {it.image && /* eslint-disable-next-line @next/next/no-img-element */ (
                  <img src={it.image} alt={it.title} loading="lazy" />
                )}
                {it.isHero && <i className="r-hero" title="Hero piece">★</i>}
              </span>
              <span className="r-main">
                <span className="eyebrow r-role">{titleCase(it.role)}</span>
                <span className="r-brand">{it.brand}</span>
                <span className="r-title">{it.title}</span>
              </span>
              <span className="mono r-price">{fmtCents(it.priceCents)}</span>
              <AffiliateCTA offer={it.bestOffer} brand={it.brand} productId={it.productId} />
            </li>
          ))}
        </ul>
      </section>

      {/* ── actions ── */}
      <section className="actions">
        <Link href={`/builder?from=${bundle.slug}`} className="a-primary">Style this look →</Link>
        <button className={"a-save" + (saved ? " on" : "")} onClick={onSave}>
          <Heart filled={saved} /> {saved ? "Saved" : "Save look"}
        </button>
        <ShareButton
          title={`${bundle.title} — Curated`}
          text={bundle.curatorNote}
          path={`/${TYPE_PATH[bundle.type] ?? "looks"}/${bundle.slug}`}
        />
        {flight && <span className="flight" />}
      </section>

      {/* ── coherence transparency ── */}
      <section className="coh-panel">
        <span className="eyebrow why-label">The score, in the open</span>
        <div className="coh-grid">
          <div className="coh-meter">
            <CoherenceMeter score={bundle.coherence.score} />
            <p className="coh-explain">
              Every published look clears the engine’s threshold (72). This one scored{" "}
              <b>{bundle.coherence.score.toFixed(0)}</b> as a <b>{bundle.coherence.scheme}</b> palette.
            </p>
          </div>
          <ul className="rules">
            {Object.entries(bundle.coherence.ruleScores).map(([k, v]) => (
              <li key={k}>
                <span className="rule-label">{RULE_LABELS[k] ?? k}</span>
                <span className="rule-bar"><i style={{ width: `${(v as number) * 100}%` }} /></span>
                <span className="mono rule-val">{Math.round((v as number) * 100)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Styles />
      <style>{`
        .cover{ padding:18px 18px 0; }
        .cover-img{ position:relative; width:100%; max-width:1180px; margin:0 auto; aspect-ratio:16/10;
          border-radius:4px; overflow:hidden; opacity:0; transform:scale(1.035);
          transition:opacity .5s ease, transform .9s var(--ease-out); }
        .cover-img.in{ opacity:1; transform:scale(1); }
        @media (max-width:680px){ .cover-img{ aspect-ratio:4/5; } }
        .cover-meta{ position:absolute; left:0; bottom:0; padding:26px 30px; z-index:6; }
        .cm-eyebrow{ font-size:11.5px; letter-spacing:.2em; text-transform:uppercase; color:var(--ink-soft);
          opacity:0; transform:translateY(8px); transition:.5s var(--ease-out); }
        .cm-eyebrow.in{ opacity:1; transform:none; }
        .cm-title{ font-weight:400; line-height:.96; letter-spacing:-.02em;
          font-size:clamp(2.6rem,7vw,5.4rem); margin:6px 0 12px; overflow:hidden; }
        .cm-title-mask{ display:inline-block; transform:translateY(105%); transition:transform .7s var(--ease-out); }
        .cm-title.in .cm-title-mask{ transform:none; }
        .cm-row{ display:flex; align-items:center; gap:12px; opacity:0; transform:translateY(8px);
          transition:.5s var(--ease-out) .08s; }
        .cm-row.in{ opacity:1; transform:none; }
        .cm-price{ font-size:15px; } .cm-price i{ font-style:normal; color:var(--ink-mute); font-size:12px; margin-left:5px; }
        .cm-dot{ color:var(--ink-mute); }
        .cm-coh{ display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:var(--ink-soft); }
        .coh-tick{ width:7px; height:7px; border-radius:50%; background:var(--positive); }

        .why{ max-width:760px; margin:46px auto 8px; padding:0 30px; text-align:center;
          opacity:0; transform:translateY(10px); transition:.6s var(--ease-out); }
        .why.in{ opacity:1; transform:none; }
        .why-label{ display:block; margin-bottom:16px; }
        .why-note{ font-size:clamp(1.25rem,2.4vw,1.7rem); line-height:1.45; font-weight:300; letter-spacing:-.01em; margin:0; }
        .why-scheme{ display:inline-block; margin-top:18px; font-size:12px; color:var(--ink-mute); }

        .breakdown{ max-width:760px; margin:40px auto 0; padding:0 24px; }
        .disclosure{ font-size:12px; color:var(--ink-mute); line-height:1.5; padding:12px 14px;
          border:1px solid var(--line); border-radius:10px; margin:0 0 14px; background:color-mix(in srgb, var(--ink) 1.5%, transparent); }
        .rows{ list-style:none; margin:0; padding:0; }
        .row{ display:grid; grid-template-columns:54px 1fr auto auto; gap:16px; align-items:center;
          padding:14px; border-radius:12px; transition:background .25s; }
        .row.active{ background:var(--surface); }
        .row + .row{ border-top:1px solid var(--line); }
        .row.active, .row.active + .row{ border-color:transparent; }
        .r-thumb{ width:54px; height:66px; border-radius:7px; position:relative; flex:none; }
        .r-thumb img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:7px; }
        .r-hero{ position:absolute; top:-7px; right:-7px; width:20px; height:20px; font-size:11px; font-style:normal;
          display:grid; place-items:center; background:var(--accent); color:var(--accent-ink); border-radius:50%; box-shadow:var(--e-1); }
        .r-main{ display:flex; flex-direction:column; gap:1px; min-width:0; }
        .r-role{ font-size:10px; } .r-brand{ font-size:13.5px; color:var(--ink-soft); } .r-title{ font-size:14.5px; }
        .r-price{ font-size:14px; }
        @media (max-width:560px){ .row{ grid-template-columns:48px 1fr auto; } .row .acta{ grid-column:2 / -1; justify-self:start; margin-top:4px; } }

        .actions{ position:relative; max-width:760px; margin:34px auto 0; padding:0 24px; display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
        .a-primary{ font-size:14.5px; background:var(--accent); color:var(--accent-ink); padding:14px 26px; border-radius:999px; font-weight:500; transition:.2s; }
        .a-primary:hover{ background:var(--accent-soft); transform:translateY(-1px); }
        .a-save{ font-size:14px; background:none; color:var(--ink-soft); border:1px solid var(--line);
          padding:13px 20px; border-radius:999px; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:.2s; }
        .a-save:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .a-save.on{ color:var(--accent-soft); border-color:var(--accent); }
        .flight{ position:absolute; right:80px; top:8px; width:16px; height:16px; border-radius:50%; background:var(--accent);
          animation:fly .7s cubic-bezier(.5,0,.2,1) forwards; }
        @keyframes fly{ 0%{transform:translate(0,0) scale(1); opacity:1;} 100%{transform:translate(60px,-560px) scale(.3); opacity:0;} }

        .coh-panel{ max-width:760px; margin:60px auto 0; padding:0 24px; }
        .coh-grid{ display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:16px; align-items:start; }
        .coh-explain{ font-size:13px; color:var(--ink-soft); line-height:1.6; margin:16px 0 0; }
        .rules{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px; }
        .rules li{ display:grid; grid-template-columns:1fr 90px 28px; gap:10px; align-items:center; font-size:12.5px; color:var(--ink-soft); }
        .rule-bar{ height:5px; border-radius:999px; background:var(--surface-2); overflow:hidden; }
        .rule-bar i{ display:block; height:100%; background:var(--positive); border-radius:999px; }
        .rule-val{ font-size:12px; text-align:right; color:var(--ink-mute); }
        @media (max-width:640px){ .coh-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.8 5.5 5 5c2-.3 3.4.9 4.2 2 .8 1 1.8 1 2.6 0C12.6 5.9 14 4.7 16 5c3.2.5 4.4 4 3 6.8C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function Styles() {
  return <style>{`.ld{ padding-bottom:40px; }`}</style>;
}
