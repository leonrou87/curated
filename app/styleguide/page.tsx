import type { Metadata } from "next";
import { getBundlesByType } from "@/lib/data";
import { LookCard } from "@/components/LookCard";
import { CoherenceMeter } from "@/components/CoherenceMeter";
import { AffiliateCTA } from "@/components/AffiliateCTA";
import { SEED_META } from "@/lib/data";

export const metadata: Metadata = { title: "Styleguide", description: "The living design system — tokens and components." };

const COLORS = [
  ["--bg", "bg"], ["--surface", "surface"], ["--surface-2", "surface-2"], ["--line", "line"],
  ["--ink", "ink"], ["--ink-soft", "ink-soft"], ["--ink-mute", "ink-mute"],
  ["--accent", "accent"], ["--accent-soft", "accent-soft"],
  ["--positive", "positive"], ["--warning", "warning"], ["--danger", "danger"],
];
const TYPE = [
  ["--t-display", "Display serif — the magazine voice", "serif"],
  ["--t-h1", "Heading 1", "serif"],
  ["--t-h2", "Heading 2", "serif"],
  ["--t-body", "Body — comfortable editorial reading", "sans"],
  ["--t-caption", "Caption / disclosure", "sans"],
];
const SPACE = ["--s-2", "--s-3", "--s-4", "--s-5", "--s-6", "--s-7", "--s-8"];
const RADII = ["--r-sm", "--r-md", "--r-lg", "--r-xl"];

export default function Styleguide() {
  const sample = getBundlesByType("look")[0];
  const fakeOffer = { network: "sovrn", merchant: "Demo", affiliateUrl: "https://go.sovrn.com/demo", priceTier: "mid" as const, inStock: true, status: "active" };

  return (
    <div className="sg">
      <header className="sg-head">
        <span className="eyebrow">Living design system</span>
        <h1 className="serif">Styleguide</h1>
        <p className="sg-sub">
          Every token and component, rendered live. {SEED_META?.counts?.products} products /{" "}
          {SEED_META?.counts?.bundles} bundles seeded; all bundles validated through the coherence
          scorer (threshold 72).
        </p>
      </header>

      <Section title="Color" note="Accent appears on ≤5% of any screen. Status colors only for status.">
        <div className="swatches">
          {COLORS.map(([v, name]) => (
            <div className="sw" key={v}>
              <span className="sw-chip" style={{ background: `var(${v})`, border: name === "bg" ? "1px solid var(--line)" : "none" }} />
              <span className="sw-name">{name}</span>
              <span className="mono sw-var">{v}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography" note="Fraunces (display serif) · Inter (UI sans) · Geist Mono (specs). Swap via two CSS vars.">
        <div className="type-list">
          {TYPE.map(([v, label, fam]) => (
            <p key={v} className={fam} style={{ fontSize: `var(${v})`, lineHeight: 1.1, margin: "6px 0" }}>{label}</p>
          ))}
          <p className="mono" style={{ marginTop: 12 }}>0123456789 · $248 · size 14 · tabular nums</p>
        </div>
      </Section>

      <Section title="Space & Radius">
        <div className="space-row">
          {SPACE.map((v) => (
            <div className="space-item" key={v}>
              <span className="space-box" style={{ width: `var(${v})`, height: `var(${v})` }} />
              <span className="mono">{v}</span>
            </div>
          ))}
        </div>
        <div className="radius-row">
          {RADII.map((v) => (
            <div className="radius-box" key={v} style={{ borderRadius: `var(${v})` }}><span className="mono">{v}</span></div>
          ))}
        </div>
      </Section>

      <Section title="CoherenceMeter" note="Fill + color animate across danger → warning → positive (0 / 72 / 100).">
        <div className="meter-demos">
          <div><CoherenceMeter score={100} /></div>
          <div><CoherenceMeter score={78} tip="A neutral shoe would balance this." /></div>
          <div><CoherenceMeter score={54} tip="Pieces sit at different formality levels." /></div>
        </div>
      </Section>

      <Section title="AffiliateCTA" note="The only outbound style. Always rel='sponsored nofollow' + new tab.">
        <div className="cta-demos">
          <AffiliateCTA offer={fakeOffer} brand="Reformation" productId="demo" />
          <AffiliateCTA offer={fakeOffer} brand="Mejuri" productId="demo" variant="fill" />
        </div>
      </Section>

      <Section title="LookCard (editorial)" note="Full-bleed cover, scrim, serif title, mono price. Not a boxed product card.">
        <div className="card-demo">
          {getBundlesByType("look").slice(0, 3).map((b) => <LookCard key={b.id} bundle={b} />)}
        </div>
      </Section>

      <style>{`
        .sg{ max-width:1080px; margin:0 auto; padding:40px 24px 0; }
        .sg-head h1{ font-weight:400; font-size:clamp(2.2rem,4vw,3.4rem); letter-spacing:-.02em; margin:8px 0 0; }
        .sg-sub{ color:var(--ink-soft); max-width:64ch; margin:12px 0 0; }
        .sg-section{ margin-top:var(--s-9); border-top:1px solid var(--line); padding-top:24px; }
        .sg-section h2{ font-family:var(--serif); font-weight:400; font-size:1.6rem; margin:0; }
        .sg-note{ color:var(--ink-mute); font-size:13px; margin:6px 0 22px; max-width:60ch; }
        .swatches{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; }
        .sw{ display:flex; flex-direction:column; gap:6px; }
        .sw-chip{ height:64px; border-radius:var(--r-md); }
        .sw-name{ font-size:13px; } .sw-var{ font-size:11px; color:var(--ink-mute); }
        .type-list .serif{ font-weight:400; letter-spacing:-.01em; }
        .space-row{ display:flex; gap:20px; align-items:flex-end; flex-wrap:wrap; margin-bottom:24px; }
        .space-item{ display:flex; flex-direction:column; gap:8px; align-items:center; font-size:11px; color:var(--ink-mute); }
        .space-box{ background:var(--accent); border-radius:3px; }
        .radius-row{ display:flex; gap:14px; flex-wrap:wrap; }
        .radius-box{ width:90px; height:90px; background:var(--surface); border:1px solid var(--line); display:grid; place-items:center; font-size:11px; color:var(--ink-mute); }
        .meter-demos{ display:grid; grid-template-columns:repeat(3,1fr); gap:30px; max-width:760px; }
        .cta-demos{ display:flex; gap:14px; align-items:center; }
        .card-demo{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media (max-width:760px){ .meter-demos, .card-demo{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="sg-section">
      <h2>{title}</h2>
      {note && <p className="sg-note">{note}</p>}
      {children}
    </section>
  );
}
