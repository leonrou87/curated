"use client";
import { useState } from "react";

// Native share sheet on mobile (Web Share API), copy-link fallback on desktop, with a toast.
export function ShareButton({
  title,
  text,
  path,
  label = "Share",
  variant = "ghost",
}: {
  title: string;
  text?: string;
  path: string; // relative, e.g. /looks/xyz
  label?: string;
  variant?: "ghost" | "fill" | "chip";
}) {
  const [toast, setToast] = useState<string | null>(null);

  const onShare = async () => {
    const url = typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied");
    } catch {
      setToast(url);
    }
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <button className={"sharebtn " + variant} onClick={onShare} aria-label={label}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      {label}
      {toast && <span className="share-toast">{toast}</span>}
      <style dangerouslySetInnerHTML={{ __html: `
        .sharebtn{ position:relative; display:inline-flex; align-items:center; gap:8px; cursor:pointer; font-family:var(--sans); transition:.2s; }
        .sharebtn.ghost{ font-size:14px; background:none; color:var(--ink-soft); border:1px solid var(--line); padding:13px 20px; border-radius:999px; }
        .sharebtn.ghost:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .sharebtn.fill{ font-size:14.5px; background:var(--accent); color:var(--accent-ink); border:none; padding:14px 24px; border-radius:999px; font-weight:500; }
        .sharebtn.fill:hover{ background:var(--accent-soft); }
        .sharebtn.chip{ font-size:12.5px; background:none; color:var(--ink-soft); border:1px solid var(--line); padding:7px 13px; border-radius:999px; }
        .sharebtn.chip:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .share-toast{ position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%); white-space:nowrap;
          background:var(--ink); color:var(--bg); font-size:12px; padding:6px 11px; border-radius:8px; box-shadow:var(--e-2); }
      ` }} />
    </button>
  );
}
