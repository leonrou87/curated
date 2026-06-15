"use client";
import { useState } from "react";

interface Target { id: string; label: string; url: string }
interface Result { url: string; status: string; code: number | null }

export function LinkHealth({ targets }: { targets: Target[] }) {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [running, setRunning] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    try {
      const urls = targets.map((t) => t.url);
      const res = await fetch("/api/admin/link-health", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls }) });
      const data = await res.json();
      if (res.ok) {
        const map: Record<string, Result> = {};
        for (const r of data.results) map[r.url] = r;
        setResults(map);
        setCheckedAt(data.checkedAt);
      }
    } finally { setRunning(false); }
  };

  const counts = Object.values(results).reduce(
    (a, r) => { a[r.status] = (a[r.status] ?? 0) + 1; return a; },
    {} as Record<string, number>
  );

  return (
    <div className="lh">
      <header className="lh-head">
        <div>
          <span className="eyebrow">Admin · link health</span>
          <h1 className="serif">Link health</h1>
          <p className="lh-sub">Dead links silently kill affiliate revenue. This checks each outbound URL live; in production this runs on a cron and auto-swaps dead offers to a backup alternate. Checks the first {targets.length} offers.</p>
        </div>
        <button className="lh-run" onClick={run} disabled={running}>{running ? "Checking…" : "Run check"}</button>
      </header>

      {checkedAt && (
        <div className="lh-summary">
          <span className="pill ok">{counts.active ?? 0} active</span>
          <span className="pill warn">{counts.stale ?? 0} stale</span>
          <span className="pill bad">{counts.dead ?? 0} dead</span>
          <span className="lh-time">checked {new Date(checkedAt).toLocaleTimeString()}</span>
        </div>
      )}

      <div className="lh-list">
        {targets.map((t) => {
          const r = results[t.url];
          return (
            <div key={t.id} className="lh-row">
              <span className="lh-label">{t.label}</span>
              <span className="mono lh-url" title={t.url}>{t.url}</span>
              <span className={"lh-status " + (r ? r.status : "idle")}>
                {r ? `${r.status}${r.code ? " · " + r.code : ""}` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        .lh-head{ display:flex; justify-content:space-between; align-items:flex-start; gap:20px; }
        .lh-head h1{ font-weight:400; font-size:clamp(1.6rem,2.6vw,2.2rem); margin:6px 0 0; }
        .lh-sub{ color:var(--ink-soft); max-width:64ch; margin:10px 0 0; font-size:14px; }
        .lh-run{ background:var(--accent); color:var(--accent-ink); border:none; padding:11px 20px; border-radius:999px; font-size:14px; font-weight:500; cursor:pointer; white-space:nowrap; }
        .lh-run:disabled{ opacity:.6; }
        .lh-summary{ display:flex; gap:10px; align-items:center; margin:20px 0 12px; }
        .pill{ font-family:var(--mono); font-size:12px; padding:4px 12px; border-radius:999px; }
        .pill.ok{ background:color-mix(in srgb,var(--positive) 22%, transparent); color:var(--positive); }
        .pill.warn{ background:color-mix(in srgb,var(--warning) 20%, transparent); color:var(--warning); }
        .pill.bad{ background:color-mix(in srgb,var(--danger) 22%, transparent); color:var(--danger); }
        .lh-time{ font-size:12px; color:var(--ink-mute); }
        .lh-list{ border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; margin-top:8px; }
        .lh-row{ display:grid; grid-template-columns:1.2fr 2fr 0.7fr; gap:14px; align-items:center; padding:11px 16px; font-size:13px; }
        .lh-row + .lh-row{ border-top:1px solid var(--line); }
        .lh-url{ font-size:11.5px; color:var(--ink-mute); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .lh-status{ font-family:var(--mono); font-size:12px; text-align:right; }
        .lh-status.active{ color:var(--positive); } .lh-status.stale{ color:var(--warning); } .lh-status.dead{ color:var(--danger); } .lh-status.idle{ color:var(--ink-mute); }
        @media (max-width:640px){ .lh-row{ grid-template-columns:1fr auto; } .lh-url{ display:none; } }
      `}</style>
    </div>
  );
}
