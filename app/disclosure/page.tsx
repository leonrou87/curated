import type { Metadata } from "next";
import { FTC_DISCLOSURE } from "@/lib/offers";

export const metadata: Metadata = { title: "Affiliate disclosure", description: "How Curated makes money, in plain language." };

export default function DisclosurePage() {
  return (
    <article className="legal">
      <span className="eyebrow">Honesty</span>
      <h1 className="serif">Affiliate disclosure</h1>
      <p className="lead">{FTC_DISCLOSURE}</p>
      <p>Curated is a styling and discovery product. The looks and kits you see are curated for taste and validated for coherence — not chosen because they pay the most. When an item is a good fit, we link to a retailer. If you buy through that link, we may earn a commission at no extra cost to you.</p>
      <h2 className="serif">What this means</h2>
      <ul>
        <li>Every outbound shopping link is marked <code>rel="sponsored nofollow"</code> and opens in a new tab.</li>
        <li>The disclosure above sits over the first shopping link on every page that has one.</li>
        <li>We never cache Amazon prices outside the Product Advertising API; prices update at the retailer.</li>
        <li>Which retailer we send you to is chosen by an offer resolver (availability and fit), never hardcoded.</li>
      </ul>
      <h2 className="serif">As an Amazon Associate</h2>
      <p>Curated is a participant in affiliate programs including the Amazon Associates Program. As an Amazon Associate we earn from qualifying purchases.</p>
      <style dangerouslySetInnerHTML={{ __html: `
        .legal{ max-width:720px; margin:0 auto; padding:50px 24px 0; }
        .legal h1{ font-weight:400; font-size:clamp(2rem,4vw,3rem); letter-spacing:-.02em; margin:8px 0 20px; }
        .legal h2{ font-weight:400; font-size:1.5rem; margin:34px 0 10px; }
        .legal .lead{ font-size:18px; color:var(--ink); line-height:1.6; }
        .legal p{ color:var(--ink-soft); line-height:1.7; }
        .legal ul{ color:var(--ink-soft); line-height:1.8; padding-left:20px; }
        .legal code{ font-family:var(--mono); font-size:13px; background:var(--surface); padding:2px 6px; border-radius:5px; }
      ` }} />
    </article>
  );
}
