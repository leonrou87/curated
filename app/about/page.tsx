import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Curated — a fashion magazine fused with a game." };

export default function AboutPage() {
  return (
    <article className="legal">
      <span className="eyebrow">About</span>
      <h1 className="serif">A magazine you can shop, a game you can play.</h1>
      <p className="lead">Curated gives you a personalized, editorial feed of complete looks and kits — each a curated bundle whose pieces link out to retailers.</p>
      <p>Describe what you need in plain language and watch a coherent look assemble on screen. Mix and match in a tactile builder with live “does this work together” feedback. Save, publish, remix.</p>
      <p>Underneath the taste is a real coherence engine: a deterministic scorer that checks formality, color, proportion, season and more, so every look that ships actually makes sense. The same engine runs in the live builder and in batch generation — one brain, two surfaces.</p>
      <p>Affiliate revenue is invisible infrastructure beneath a product about taste, personalization and interactivity. It should never feel like an affiliate site.</p>
      <style>{`
        .legal{ max-width:720px; margin:0 auto; padding:50px 24px 0; }
        .legal h1{ font-weight:400; font-size:clamp(2rem,4vw,3rem); letter-spacing:-.02em; margin:8px 0 20px; line-height:1.05; }
        .legal .lead{ font-size:18px; color:var(--ink); line-height:1.6; }
        .legal p{ color:var(--ink-soft); line-height:1.7; }
      `}</style>
    </article>
  );
}
