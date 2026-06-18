"use client";
import { useEffect, useState } from "react";
import type { EnrichedBundle } from "@/lib/types";
import { rankLooks, rememberPrompt, recentPrompts } from "@/lib/match";
import { LookDetail } from "./LookDetail";
import { LookCard } from "./LookCard";
import { useTaste } from "@/lib/useTaste";
import { aestheticOf } from "@/lib/aesthetics";

const SUGGESTIONS = [
  "fall outdoor wedding, quiet luxury",
  "minimalist date night, all black",
  "first day at a new office, navy",
  "men's smart casual for a dinner",
  "affordable weekend brunch, summer",
];

// NL styling → the assemble reveal. Intent-aware + taste-personalized ranking over the full catalog.
export function StyleStudio({ bundles }: { bundles: EnrichedBundle[] }) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [results, setResults] = useState<EnrichedBundle[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const { taste, top } = useTaste();

  useEffect(() => { setRecent(recentPrompts()); }, []);

  const run = (q: string) => {
    setResults(rankLooks(q, bundles, taste));
    setSubmitted(q);
    rememberPrompt(q);
    setRecent(recentPrompts());
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) run(query.trim());
  };

  const hero = results[0];
  const more = results.slice(1, 9);
  const tasteName = top[0] ? aestheticOf(top[0].key).name : null;

  return (
    <div className="studio">
      <section className="prompt-wrap">
        <span className="eyebrow">Natural-language styling</span>
        <h1 className="serif prompt-h1">Tell me the occasion.</h1>
        <form className="prompt-bar" onSubmit={onSubmit}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Dress me for a fall outdoor wedding…"
            aria-label="Describe what you need"
          />
          <button type="submit" aria-label="Assemble a look">Assemble →</button>
        </form>
        <div className="suggest">
          {(recent.length ? recent : SUGGESTIONS).map((s) => (
            <button key={s} className="sug" onClick={() => { setQuery(s); run(s); }}>{s}</button>
          ))}
        </div>
        {tasteName && (
          <p className="taste-hint">✦ Personalizing to your taste — <b>{tasteName}</b>. <a href="/quiz">Retake the quiz</a> to refine.</p>
        )}
      </section>

      {submitted && (
        hero ? (
          <section className="result">
            <p className="result-note">
              For “<b>{submitted}</b>” — your best match{tasteName ? ", tuned to your taste" : ""}.
            </p>
            <LookDetail key={hero.slug + submitted} bundle={hero} />
            {more.length > 0 && (
              <div className="alts">
                <span className="eyebrow">Other directions</span>
                <div className="alts-grid">
                  {more.map((b) => <LookCard key={b.id} bundle={b} />)}
                </div>
              </div>
            )}
          </section>
        ) : (
          <p className="empty">No coherent match yet — try one of the prompts above, or broaden the brief.</p>
        )
      )}

      <style>{`
        .studio{ max-width:1180px; margin:0 auto; padding:40px 24px 0; }
        .prompt-wrap{ text-align:center; padding:30px 0 10px; }
        .prompt-h1{ font-weight:400; font-size:clamp(2.2rem,5vw,4rem); letter-spacing:-.02em; margin:8px 0 26px; }
        .prompt-bar{ display:flex; gap:8px; max-width:680px; margin:0 auto; background:var(--surface);
          border:1px solid var(--line); border-radius:999px; padding:6px 6px 6px 22px; }
        .prompt-bar input{ flex:1; background:none; border:none; color:var(--ink); font-family:var(--serif);
          font-size:18px; outline:none; }
        .prompt-bar input::placeholder{ color:var(--ink-mute); font-style:italic; }
        .prompt-bar button{ background:var(--accent); color:var(--accent-ink); border:none; border-radius:999px;
          padding:12px 22px; font-size:14px; font-weight:500; cursor:pointer; white-space:nowrap; transition:.2s; }
        .prompt-bar button:hover{ background:var(--accent-soft); }
        .taste-hint{ font-size:13px; color:var(--ink-soft); margin-top:16px; } .taste-hint a{ color:var(--accent-soft); }
        .suggest{ display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:18px; }
        .sug{ font-size:12.5px; color:var(--ink-soft); background:none; border:1px solid var(--line);
          padding:7px 14px; border-radius:999px; cursor:pointer; transition:.2s; }
        .sug:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .result{ margin-top:30px; border-top:1px solid var(--line); padding-top:20px; }
        .result-note{ text-align:center; color:var(--ink-soft); font-size:14px; margin:0 0 6px; }
        .alts{ max-width:1180px; margin:50px auto 0; }
        .alts-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:14px; }
        .empty{ text-align:center; color:var(--ink-soft); margin-top:40px; }
        @media (max-width:760px){ .alts-grid{ grid-template-columns:repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
