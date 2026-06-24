import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Curated handles your data — in plain language." };

export default function PrivacyPage() {
  return (
    <article className="legal">
      <span className="eyebrow">Legal</span>
      <h1 className="serif">Privacy Policy</h1>
      <p className="lead">Short version: we collect almost nothing, we never sell your data, and most of what powers the site lives in your own browser.</p>

      <h2 className="serif">What stays on your device</h2>
      <p>Your bag, saved looks, style-quiz results, and theme/gender preferences are stored in your browser’s local storage — on your device, not our servers. Clear your browser data and they’re gone.</p>

      <h2 className="serif">What you choose to share</h2>
      <p>If you subscribe to the newsletter or send a message through our contact form, we store the email address (and your message) so we can reply and send what you asked for. That’s it. We don’t sell or rent it, and you can unsubscribe or ask us to delete it any time via <a href="/contact">our contact page</a>.</p>

      <h2 className="serif">Analytics</h2>
      <p>We use lightweight, first-party analytics to understand which looks and pages are popular, in aggregate. We don’t run third-party advertising trackers, and we don’t build advertising profiles of you.</p>

      <h2 className="serif">Affiliate links &amp; cookies</h2>
      <p>When you tap a “Shop” link, you leave Curated for the retailer’s own site. That retailer or its affiliate network may set a cookie to credit us if you buy — this is how the site stays free. Those cookies and that data are governed by the retailer’s privacy policy, not ours. See our <a href="/disclosure">affiliate disclosure</a>.</p>

      <h2 className="serif">Your choices</h2>
      <p>You can use the entire site without an account. To remove a newsletter signup or a contact message from our records, just <a href="/contact">message us</a>. To clear on-device data, clear your browser storage for this site.</p>

      <h2 className="serif">Children</h2>
      <p>Curated isn’t directed at children under 13 and we don’t knowingly collect their information.</p>

      <h2 className="serif">Changes</h2>
      <p>If this policy changes, we’ll update this page. Questions? <a href="/contact">Get in touch</a>.</p>

      <style dangerouslySetInnerHTML={{ __html: `
        .legal{ max-width:720px; margin:0 auto; padding:50px 24px 0; }
        .legal h1{ font-weight:400; font-style:italic; font-size:clamp(2rem,4vw,3rem); letter-spacing:-.02em; margin:8px 0 20px; }
        .legal h2{ font-weight:400; font-size:1.4rem; margin:34px 0 10px; }
        .legal .lead{ font-size:18px; color:var(--ink); line-height:1.6; margin:0 0 20px; }
        .legal p{ color:var(--ink-soft); line-height:1.7; margin:0 0 16px; } .legal a{ color:var(--accent-soft); }
      ` }} />
    </article>
  );
}
