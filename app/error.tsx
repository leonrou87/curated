"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="erp">
      <span className="eyebrow">Something slipped</span>
      <h1 className="serif">A thread came loose.</h1>
      <p className="erp-sub">An unexpected error stopped this page from loading. It’s on us — try again, or head back to the feed.</p>
      <div className="erp-actions">
        <button onClick={reset} className="erp-retry">Try again</button>
        <Link href="/" className="erp-home">← Back to the feed</Link>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .erp{ max-width:620px; margin:0 auto; padding:90px 24px 0; text-align:center; }
        .erp h1{ font-weight:400; font-style:italic; font-size:clamp(2rem,4.4vw,3rem); letter-spacing:-.02em; margin:10px 0 14px; }
        .erp-sub{ color:var(--ink-soft); line-height:1.6; max-width:46ch; margin:0 auto; }
        .erp-actions{ display:flex; gap:14px; justify-content:center; align-items:center; margin-top:28px; }
        .erp-retry{ background:var(--accent); color:var(--accent-ink); border:none; padding:13px 26px; cursor:pointer;
          font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; }
        .erp-retry:hover{ background:var(--accent-soft); }
        .erp-home{ color:var(--accent-soft); font-size:14px; }
      ` }} />
    </div>
  );
}
