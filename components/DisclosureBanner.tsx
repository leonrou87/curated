import Link from "next/link";
import { FTC_DISCLOSURE } from "@/lib/offers";

// Persistent, honest footer disclosure (compliance). The inline above-CTA caption lives in
// AffiliateCTA / the breakdown list.
export function DisclosureBanner() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <span className="foot-brand">CURATED</span>
        <p className="foot-disc">{FTC_DISCLOSURE}</p>
        <nav className="foot-nav">
          <Link href="/disclosure">Disclosure</Link>
          <Link href="/about">About</Link>
          <Link href="/styleguide">Styleguide</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
      <style>{`
        .foot{ border-top:1px solid var(--line); margin-top:var(--s-10); }
        .foot-inner{ max-width:var(--max-content,1240px); margin:0 auto; padding:28px 24px;
          display:flex; gap:20px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
        .foot-brand{ font-family:var(--mono); letter-spacing:.3em; font-size:12px; }
        .foot-disc{ font-size:11.5px; color:var(--ink-mute); max-width:560px; line-height:1.5; margin:0; }
        .foot-nav{ display:flex; gap:18px; font-size:12.5px; color:var(--ink-soft); }
        .foot-nav a:hover{ color:var(--ink); }
      `}</style>
    </footer>
  );
}
