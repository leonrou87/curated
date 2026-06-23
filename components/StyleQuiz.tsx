"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EnrichedBundle } from "@/lib/types";
import { BundleCover } from "./BundleCover";
import { ShareButton } from "./ShareButton";
import { useTaste } from "@/lib/useTaste";
import { aestheticOf } from "@/lib/aesthetics";
import { titleCase } from "@/lib/format";
import { LookCard } from "./LookCard";

export function StyleQuiz({ deck, recommendable }: { deck: EnrichedBundle[]; recommendable: EnrichedBundle[] }) {
  const { taste, like, pass, finish, reset, top } = useTaste();
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState<"like" | "pass" | null>(null);
  const done = i >= deck.length;

  const advance = (action: "like" | "pass") => {
    if (leaving || done) return;
    const b = deck[i];
    const aesthetic = String(b.brief.vibe || b.brief.occasion || "minimalist");
    if (action === "like") like(b.slug, aesthetic);
    else pass(aesthetic);
    setLeaving(action);
    setTimeout(() => { setI((x) => x + 1); setLeaving(null); }, 280);
  };

  useEffect(() => {
    if (done && !taste.done) finish();
  }, [done]); // eslint-disable-line

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") advance("like");
      if (e.key === "ArrowLeft") advance("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // eslint-disable-line

  const recs = useMemo(() => {
    if (!top.length) return [];
    const keys = new Set(top.map((t) => t.key));
    return recommendable.filter((b) => keys.has(String(b.brief.vibe))).slice(0, 8);
  }, [top, recommendable]);

  // ---- RESULT ----
  if (done) {
    const t1 = top[0] ? aestheticOf(top[0].key) : null;
    const sharePath = `/style-dna?${new URLSearchParams(Object.fromEntries(top.slice(0, 3).flatMap((t, n) => [[`a${n + 1}`, t.key], [`p${n + 1}`, String(t.pct)]]))).toString()}`;
    return (
      <div className="quiz-result">
        <span className="eyebrow">Your style DNA</span>
        {t1 ? (
          <>
            <h1 className="serif r-title" style={{ color: t1.accent === "#1A1A1A" ? "var(--ink)" : t1.accent }}>{t1.name}</h1>
            <p className="r-tag">{t1.tagline} — {t1.blurb}</p>
            <div className="r-bars">
              {top.map((t) => {
                const a = aestheticOf(t.key);
                return (
                  <div className="r-bar" key={t.key}>
                    <span className="r-name">{a.name}</span>
                    <span className="r-track"><i style={{ width: `${t.pct}%`, background: a.accent }} /></span>
                    <span className="mono r-pct">{t.pct}%</span>
                  </div>
                );
              })}
            </div>
            <div className="r-actions">
              <ShareButton title={`My Style DNA is ${t1.name}`} text="I took the Curated style quiz — what's yours?" path={sharePath} label="Share my Style DNA" variant="fill" />
              <Link href="/" className="r-feed">See my personalized feed →</Link>
              <button className="r-redo" onClick={() => { reset(); setI(0); }}>Retake</button>
            </div>
          </>
        ) : (
          <>
            <h1 className="serif r-title">Hmm — pick a few you love</h1>
            <button className="r-redo" onClick={() => { reset(); setI(0); }}>Start over</button>
          </>
        )}

        {recs.length > 0 && (
          <section className="r-recs">
            <span className="eyebrow">Picked for your taste</span>
            <div className="r-grid">{recs.map((b) => <LookCard key={b.id} bundle={b} />)}</div>
          </section>
        )}
        <Styles />
      </div>
    );
  }

  // ---- DECK ----
  return (
    <div className="quiz">
      <header className="q-head">
        <span className="eyebrow">Style quiz · 60 seconds</span>
        <h1 className="serif">Love it or leave it.</h1>
        <p className="q-sub">Swipe through — we’ll read your taste and build your feed.</p>
      </header>

      <div className="q-stack">
        {deck.slice(i, i + 3).reverse().map((b, idx, arr) => {
          const isTop = idx === arr.length - 1;
          const depth = arr.length - 1 - idx;
          return (
            <div
              key={b.id}
              className={"q-card" + (isTop && leaving ? " leave-" + leaving : "")}
              style={{ transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`, zIndex: 10 - depth, opacity: depth > 1 ? 0 : 1 }}
            >
              <div className="q-img"><BundleCover bundle={b} /></div>
              <div className="q-meta">
                <span className="eyebrow">{titleCase(String(b.brief.gender))} · {aestheticOf(String(b.brief.vibe)).name}</span>
                <span className="serif q-name">{b.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="q-controls">
        <button className="q-btn pass" onClick={() => advance("pass")} aria-label="Pass">✕</button>
        <span className="q-count mono">{Math.min(i + 1, deck.length)} / {deck.length}</span>
        <button className="q-btn like" onClick={() => advance("like")} aria-label="Love">♥</button>
      </div>
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .quiz, .quiz-result{ max-width:680px; margin:0 auto; padding:36px 24px 0; }
      .q-head{ text-align:center; }
      .q-head h1{ font-weight:400; font-size:clamp(2rem,4vw,3rem); letter-spacing:-.02em; margin:8px 0 6px; }
      .q-sub{ color:var(--ink-soft); margin:0 0 8px; }
      .q-stack{ position:relative; height:520px; margin:24px auto 0; max-width:400px; }
      .q-card{ position:absolute; inset:0; border-radius:14px; overflow:hidden; background:var(--surface); border:1px solid var(--line);
        box-shadow:var(--e-3); transition:transform .35s var(--ease-out), opacity .3s ease; }
      .q-card.leave-like{ transform:translate(120%, -40px) rotate(14deg) !important; opacity:0 !important; }
      .q-card.leave-pass{ transform:translate(-120%, -40px) rotate(-14deg) !important; opacity:0 !important; }
      .q-img{ position:absolute; inset:0; }
      .q-meta{ position:absolute; left:0; right:0; bottom:0; padding:20px; z-index:3; }
      .q-meta .eyebrow{ color:var(--ink-soft); }
      .q-name{ display:block; font-size:1.5rem; line-height:1.05; margin-top:6px; }
      .q-controls{ display:flex; align-items:center; justify-content:center; gap:26px; margin-top:26px; }
      .q-btn{ width:62px; height:62px; border-radius:50%; border:1px solid var(--line); background:var(--surface); cursor:pointer;
        font-size:22px; display:grid; place-items:center; transition:.18s; }
      .q-btn.pass{ color:var(--ink-soft); } .q-btn.pass:hover{ border-color:var(--danger); color:var(--danger); transform:scale(1.08); }
      .q-btn.like{ color:var(--accent-soft); } .q-btn.like:hover{ border-color:var(--accent); color:var(--accent); transform:scale(1.08); background:color-mix(in srgb,var(--accent) 10%, var(--surface)); }
      .q-count{ font-size:13px; color:var(--ink-mute); min-width:54px; text-align:center; }

      .quiz-result{ text-align:center; }
      .r-title{ font-weight:400; font-size:clamp(2.4rem,6vw,4rem); letter-spacing:-.02em; margin:10px 0 8px; }
      .r-tag{ color:var(--ink-soft); max-width:52ch; margin:0 auto 24px; line-height:1.6; }
      .r-bars{ max-width:420px; margin:0 auto; display:flex; flex-direction:column; gap:11px; text-align:left; }
      .r-bar{ display:grid; grid-template-columns:130px 1fr 44px; gap:12px; align-items:center; font-size:14px; }
      .r-name{ color:var(--ink); } .r-track{ height:8px; background:var(--surface-2); border-radius:999px; overflow:hidden; }
      .r-track i{ display:block; height:100%; border-radius:999px; }
      .r-pct{ font-size:13px; color:var(--ink-mute); text-align:right; }
      .r-actions{ display:flex; flex-wrap:wrap; gap:14px; align-items:center; justify-content:center; margin:30px 0 0; }
      .r-feed{ color:var(--ink-soft); font-size:14px; } .r-feed:hover{ color:var(--ink); }
      .r-redo{ background:none; border:none; color:var(--ink-mute); font-size:13px; cursor:pointer; text-decoration:underline; }
      .r-recs{ margin-top:60px; }
      .r-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:14px; }
      @media (max-width:640px){ .r-grid{ grid-template-columns:repeat(2,1fr); } .q-stack{ height:62vh; } }
    ` }} />
  );
}
