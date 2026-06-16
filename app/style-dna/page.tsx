import type { Metadata } from "next";
import Link from "next/link";
import { getBundlesByType } from "@/lib/data";
import { LookCard } from "@/components/LookCard";
import { ShareButton } from "@/components/ShareButton";
import { aestheticOf } from "@/lib/aesthetics";
import { dnaOgUrl } from "@/lib/og";

// Shareable Style-DNA result page — reads the result from the URL so a shared link renders the
// friend's DNA card (dynamic OG) and lets them shop the matching looks + take the quiz themselves.
function parseTop(sp: Record<string, string | undefined>) {
  const top: { key: string; pct: number }[] = [];
  for (let n = 1; n <= 3; n++) {
    const k = sp[`a${n}`];
    if (k) top.push({ key: k, pct: Number(sp[`p${n}`]) || 0 });
  }
  return top;
}

export function generateMetadata({ searchParams }: { searchParams: Record<string, string | undefined> }): Metadata {
  const top = parseTop(searchParams);
  const a = top[0] ? aestheticOf(top[0].key) : aestheticOf("quiet-luxury");
  const title = `My Style DNA is ${a.name}`;
  const og = dnaOgUrl(top.length ? top : [{ key: "quiet-luxury", pct: 50 }]);
  return {
    title,
    description: `${a.tagline}. Take the Curated style quiz and find yours.`,
    openGraph: { title, description: a.blurb, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: a.blurb, images: [og] },
  };
}

export default function StyleDnaPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const top = parseTop(searchParams);
  const a1 = top[0] ? aestheticOf(top[0].key) : null;
  const keys = new Set(top.map((t) => t.key));
  const recs = getBundlesByType("look").filter((b) => keys.has(String(b.brief.vibe))).slice(0, 8);
  const sharePath = `/style-dna?${new URLSearchParams(Object.fromEntries(top.slice(0, 3).flatMap((t, n) => [[`a${n + 1}`, t.key], [`p${n + 1}`, String(t.pct)]]))).toString()}`;

  return (
    <div className="dna">
      <span className="eyebrow">Style DNA</span>
      <h1 className="serif dna-title" style={{ color: a1 && a1.accent !== "#1A1A1A" ? a1.accent : "var(--ink)" }}>{a1?.name || "Curated"}</h1>
      {a1 && <p className="dna-tag">{a1.tagline} — {a1.blurb}</p>}
      <div className="dna-bars">
        {top.map((t) => {
          const a = aestheticOf(t.key);
          return (
            <div className="dna-bar" key={t.key}>
              <span>{a.name}</span>
              <span className="dna-track"><i style={{ width: `${t.pct}%`, background: a.accent }} /></span>
              <span className="mono">{t.pct}%</span>
            </div>
          );
        })}
      </div>
      <div className="dna-actions">
        <Link href="/quiz" className="dna-cta">Take the quiz →</Link>
        <ShareButton title={a1 ? `My Style DNA is ${a1.name}` : "My Style DNA"} text="What's your Style DNA? Take the Curated quiz." path={sharePath} />
      </div>

      {recs.length > 0 && (
        <section className="dna-recs">
          <span className="eyebrow">Looks in this aesthetic</span>
          <div className="dna-grid">{recs.map((b) => <LookCard key={b.id} bundle={b} />)}</div>
        </section>
      )}

      <style>{`
        .dna{ max-width:760px; margin:0 auto; padding:46px 24px 0; text-align:center; }
        .dna-title{ font-weight:400; font-size:clamp(2.6rem,7vw,4.4rem); letter-spacing:-.02em; margin:10px 0 10px; }
        .dna-tag{ color:var(--ink-soft); max-width:54ch; margin:0 auto 26px; line-height:1.6; }
        .dna-bars{ max-width:420px; margin:0 auto; display:flex; flex-direction:column; gap:11px; text-align:left; }
        .dna-bar{ display:grid; grid-template-columns:130px 1fr 44px; gap:12px; align-items:center; font-size:14px; color:var(--ink-soft); }
        .dna-track{ height:8px; background:var(--surface-2); border-radius:999px; overflow:hidden; }
        .dna-track i{ display:block; height:100%; border-radius:999px; }
        .dna-actions{ display:flex; gap:14px; justify-content:center; align-items:center; margin:30px 0 0; }
        .dna-cta{ background:var(--accent); color:var(--accent-ink); padding:13px 24px; border-radius:999px; font-weight:500; font-size:14.5px; }
        .dna-cta:hover{ background:var(--accent-soft); }
        .dna-recs{ margin-top:64px; }
        .dna-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:14px; }
        @media (max-width:640px){ .dna-grid{ grid-template-columns:repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
