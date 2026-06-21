import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Curated — a fashion magazine fused with a game." };

export default function AboutPage() {
  return (
    <article className="legal">
      <span className="eyebrow">About</span>
      <h1 className="serif">A magazine you can shop.</h1>
      <p className="lead">Curated is an editorial feed of complete looks — real outfits from real brands, each one ready to wear and ready to shop.</p>
      <p>No endless product grids. Every look is a finished outfit: a dress or a top-and-bottom, the shoes, the bag, the jewelry — chosen to actually go together. Tell us the occasion and a look comes together on screen. Take your taste quiz and your feed learns what you love.</p>
      <p>Tap any piece to shop it at the retailer. We earn a small commission when you buy — at no extra cost to you — which is what keeps the magazine free.</p>
      <style>{`
        .legal{ max-width:720px; margin:0 auto; padding:50px 24px 0; }
        .legal h1{ font-weight:400; font-size:clamp(2rem,4vw,3rem); letter-spacing:-.02em; margin:8px 0 20px; line-height:1.05; }
        .legal .lead{ font-size:18px; color:var(--ink); line-height:1.6; }
        .legal p{ color:var(--ink-soft); line-height:1.7; }
      `}</style>
    </article>
  );
}
