"use client";
import { useState } from "react";

// Prominent editorial email capture for the landing page. Reuses the /api/subscribe endpoint
// (Supabase + Gmail), with a honeypot and graceful no-op when email env isn't configured.
export function NewsletterCTA({ source = "home" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setBusy(true);
    try {
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source, hp }) });
      setDone(true);
    } catch {}
    setBusy(false);
  };

  return (
    <section className="nl" aria-label="Newsletter">
      <div className="nl-inner">
        <span className="eyebrow">The Curated Dispatch</span>
        <h2 className="serif nl-h">A new look in your inbox,<br />every week.</h2>
        <p className="nl-sub">The best complete outfits, seasonal edits, and the pieces worth buying — no spam, unsubscribe anytime.</p>
        {done ? (
          <p className="nl-done" role="status">You’re on the list. Welcome to Curated. ✦</p>
        ) : (
          <form className="nl-form" onSubmit={subscribe}>
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="nl-hp" value={hp} onChange={(e) => setHp(e.target.value)} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email address" required />
            <button type="submit" disabled={busy}>{busy ? "…" : "Subscribe"}</button>
          </form>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .nl{ max-width:var(--max); margin:var(--s-10) auto 0; padding:0 24px; }
        .nl-inner{ border:1px solid var(--line); background:var(--surface); padding:clamp(36px,6vw,72px) clamp(24px,5vw,64px); text-align:center; position:relative; overflow:hidden; }
        .nl-inner::before{ content:""; position:absolute; inset:0; background:radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%); pointer-events:none; }
        .nl-h{ font-weight:400; font-style:italic; font-size:clamp(1.8rem,4vw,2.9rem); line-height:1.05; letter-spacing:-.02em; margin:12px 0 12px; }
        .nl-sub{ color:var(--ink-soft); max-width:52ch; margin:0 auto 26px; line-height:1.6; }
        .nl-form{ display:flex; gap:10px; max-width:480px; margin:0 auto; }
        .nl-hp{ display:none; }
        .nl-form input[type=email]{ flex:1; background:var(--bg); border:1px solid var(--line); color:var(--ink); padding:14px 16px; font-size:15px; }
        .nl-form input[type=email]:focus{ border-color:var(--accent); outline:none; }
        .nl-form button{ flex:none; background:var(--accent); color:var(--accent-ink); border:none; padding:14px 28px; cursor:pointer;
          font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; }
        .nl-form button:hover:not(:disabled){ background:var(--accent-soft); } .nl-form button:disabled{ opacity:.6; cursor:default; }
        .nl-done{ font-family:var(--mono); font-size:13px; letter-spacing:.04em; color:var(--accent-soft); }
        @media (max-width:480px){ .nl-form{ flex-direction:column; } }
      ` }} />
    </section>
  );
}
