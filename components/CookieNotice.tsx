"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Lightweight, honest cookie notice. Analytics here is first-party + aggregate and affiliate
// cookies are set by the retailers on click — so this is informational + dismissible, not a gate.
const KEY = "curated-cookie-consent";

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true); } catch {}
  }, []);
  const accept = () => {
    try { localStorage.setItem(KEY, new Date().toISOString()); } catch {}
    setShow(false);
  };
  if (!show) return null;
  return (
    <div className="cookie" role="dialog" aria-label="Cookie notice">
      <p>
        We use cookies for basic, privacy-friendly analytics, and our shopping links may set
        affiliate cookies at the retailer. See our <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <button onClick={accept}>Got it</button>
      <style dangerouslySetInnerHTML={{ __html: `
        .cookie{ position:fixed; left:16px; right:16px; bottom:16px; z-index:60; max-width:640px; margin:0 auto;
          display:flex; align-items:center; gap:16px; background:var(--surface); border:1px solid var(--line);
          padding:14px 18px; box-shadow:var(--e-3); }
        .cookie p{ margin:0; font-size:12.5px; color:var(--ink-soft); line-height:1.5; }
        .cookie p a{ color:var(--accent-soft); }
        .cookie button{ flex:none; background:var(--accent); color:var(--accent-ink); border:none; padding:11px 20px;
          font-family:var(--mono); font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; }
        .cookie button:hover{ background:var(--accent-soft); }
        @media (max-width:560px){ .cookie{ flex-direction:column; align-items:stretch; text-align:left; } }
      ` }} />
    </div>
  );
}
