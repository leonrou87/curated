import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service", description: "The terms for using Curated." };

export default function TermsPage() {
  return (
    <article className="legal">
      <span className="eyebrow">Legal</span>
      <h1 className="serif">Terms of Service</h1>
      <p className="lead">By using Curated, you agree to these terms. We’ve kept them readable.</p>

      <h2 className="serif">What Curated is</h2>
      <p>Curated is an editorial styling and discovery site. We assemble complete looks and link out to third-party retailers. We don’t sell products ourselves — every purchase happens on the retailer’s own site, under their terms and policies.</p>

      <h2 className="serif">Prices &amp; availability</h2>
      <p>Prices, availability, and product details are set by the retailers and can change at any time. The figures shown here are estimates and may be out of date; the retailer’s site is always the source of truth at checkout.</p>

      <h2 className="serif">Affiliate relationship</h2>
      <p>We earn commissions on qualifying purchases made through our links, at no extra cost to you. See the <a href="/disclosure">affiliate disclosure</a> for details.</p>

      <h2 className="serif">Acceptable use</h2>
      <p>Curated is for your personal, non-commercial use. Please don’t scrape, copy, resell, or systematically extract the catalog or content, and don’t misuse the site or interfere with its operation.</p>

      <h2 className="serif">No warranty</h2>
      <p>The site and its content are provided “as is,” without warranties of any kind. Styling suggestions are editorial opinion, not professional advice. We don’t guarantee that any product, price, or link is accurate, available, or fit for a particular purpose.</p>

      <h2 className="serif">Limitation of liability</h2>
      <p>To the fullest extent permitted by law, Curated isn’t liable for any indirect or consequential damages arising from your use of the site or any purchase you make at a third-party retailer.</p>

      <h2 className="serif">Changes</h2>
      <p>We may update these terms; continued use means you accept the changes. Questions? <a href="/contact">Contact us</a>.</p>

      <style dangerouslySetInnerHTML={{ __html: `
        .legal{ max-width:720px; margin:0 auto; padding:50px 24px 0; }
        .legal h1{ font-weight:400; font-style:italic; font-size:clamp(2rem,4vw,3rem); letter-spacing:-.02em; margin:8px 0 20px; }
        .legal h2{ font-weight:400; font-size:1.4rem; margin:34px 0 10px; }
        .legal .lead{ font-size:18px; color:var(--ink); line-height:1.6; }
        .legal p{ color:var(--ink-soft); line-height:1.7; } .legal a{ color:var(--accent-soft); }
      ` }} />
    </article>
  );
}
