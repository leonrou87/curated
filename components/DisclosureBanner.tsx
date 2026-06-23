"use client";
import Link from "next/link";
import { useState } from "react";
import { FTC_DISCLOSURE } from "@/lib/offers";

// Editorial magazine footer — newsletter capture (growth), link columns, disclosure.
export function DisclosureBanner() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setBusy(true);
    try {
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "footer", hp }) });
      (window as any).dataLayer?.push?.({ event: "newsletter_signup" });
      setDone(true);
    } catch {
      setDone(true); // don't block the user on a network hiccup
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="foot">
      <section className="foot-news">
        <div className="fn-copy">
          <span className="eyebrow">The Weekly Edit</span>
          <h3 className="serif">New looks, in your inbox.</h3>
          <p>The best of the week’s drops and the aesthetics worth knowing — once a week, no noise.</p>
        </div>
        {done ? (
          <p className="fn-done">✓ You’re on the list.</p>
        ) : (
          <form className="fn-form" onSubmit={subscribe}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email" required />
            <input className="fn-hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden />
            <button type="submit" disabled={busy}>{busy ? "…" : "Subscribe"}</button>
          </form>
        )}
      </section>

      <hr className="rule" />

      <div className="foot-grid">
        <div className="foot-brand-col">
          <span className="foot-brand">CURATED</span>
          <p className="foot-tag">A magazine you can shop. Complete looks, real pieces, every aesthetic.</p>
        </div>
        <nav className="foot-col">
          <span className="eyebrow">Shop</span>
          <Link href="/looks">Looks</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/trends">Trends</Link>
          <Link href="/kits">Kits</Link>
        </nav>
        <nav className="foot-col">
          <span className="eyebrow">Discover</span>
          <Link href="/quiz">Style Quiz</Link>
          <Link href="/style">Style Me</Link>
          <Link href="/search">Search</Link>
          <Link href="/saved">Closet</Link>
        </nav>
        <nav className="foot-col">
          <span className="eyebrow">About</span>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/disclosure">Disclosure</Link>
        </nav>
      </div>

      <div className="foot-base">
        <p className="foot-disc">{FTC_DISCLOSURE}</p>
        <span className="foot-cr">© {2026} Curated</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .foot{ border-top:1px solid var(--line); margin-top:var(--s-10); padding:0 24px; max-width:var(--max); margin-left:auto; margin-right:auto; }
        .foot-news{ display:flex; justify-content:space-between; align-items:center; gap:32px; flex-wrap:wrap; padding:56px 0 40px; }
        .fn-copy h3{ font-weight:400; font-style:italic; font-size:clamp(1.6rem,3vw,2.4rem); margin:8px 0 8px; letter-spacing:-.02em; }
        .fn-copy p{ color:var(--ink-soft); max-width:42ch; margin:0; font-size:14px; }
        .fn-form{ display:flex; gap:8px; min-width:300px; }
        .fn-form input{ flex:1; background:var(--surface); border:1px solid var(--line); padding:14px 18px; color:var(--ink); font-family:var(--sans); font-size:15px; }
        .fn-form input:focus{ outline:none; border-color:var(--accent); }
        .fn-form button{ background:var(--accent); color:var(--accent-ink); border:none; padding:14px 24px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; }
        .fn-form button:hover{ background:var(--accent-soft); } .fn-form button:disabled{ opacity:.6; }
        .fn-hp{ position:absolute; left:-9999px; width:1px; height:1px; opacity:0; }
        .fn-done{ color:var(--positive); font-family:var(--mono); font-size:13px; }
        .foot-grid{ display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:32px; padding:44px 0; }
        .foot-brand{ font-family:var(--mono); letter-spacing:.34em; font-size:13px; }
        .foot-tag{ color:var(--ink-mute); font-size:13px; max-width:34ch; margin:14px 0 0; line-height:1.6; }
        .foot-col{ display:flex; flex-direction:column; gap:12px; }
        .foot-col a{ font-size:14px; color:var(--ink-soft); } .foot-col a:hover{ color:var(--ink); }
        .foot-col .eyebrow{ margin-bottom:4px; }
        .foot-base{ display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; padding:24px 0 40px; border-top:1px solid var(--line); }
        .foot-disc{ font-size:11px; color:var(--ink-mute); max-width:70ch; margin:0; line-height:1.6; }
        .foot-cr{ font-family:var(--mono); font-size:11px; color:var(--ink-mute); }
        @media (max-width:760px){ .foot-grid{ grid-template-columns:1fr 1fr; } .fn-form{ min-width:0; width:100%; } .foot-news{ gap:18px; } }
      ` }} />
    </footer>
  );
}
