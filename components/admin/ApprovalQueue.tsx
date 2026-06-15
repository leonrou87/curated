"use client";
import { useState } from "react";
import type { AdminBundleRow } from "@/lib/data";

export function ApprovalQueue({ rows }: { rows: AdminBundleRow[] }) {
  const [states, setStates] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.slug, r.state]))
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "archived">("all");

  const setState = async (slug: string, state: string) => {
    setBusy(slug);
    try {
      const res = await fetch("/api/admin/bundles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, state }) });
      if (res.ok) setStates((s) => ({ ...s, [slug]: state }));
    } finally { setBusy(null); }
  };

  const shown = rows.filter((r) => filter === "all" || states[r.slug] === filter);
  const counts = {
    published: rows.filter((r) => states[r.slug] === "published").length,
    draft: rows.filter((r) => states[r.slug] === "draft").length,
    archived: rows.filter((r) => states[r.slug] === "archived").length,
  };

  return (
    <div className="aq">
      <header className="aq-head">
        <span className="eyebrow">Admin · moderation</span>
        <h1 className="serif">Approval queue</h1>
        <p className="aq-sub">Nothing goes public without passing the quality gate <i>and</i> human approval. Gate = coherence ≥72 + link-health + originality; <b>images</b> stay flagged until you replace the seed placeholders. Changes persist to <code>data/bundle-state.json</code>.</p>
      </header>

      <div className="aq-filters">
        {(["all", "published", "draft", "archived"] as const).map((f) => (
          <button key={f} className={"chip" + (filter === f ? " on" : "")} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}{f !== "all" ? ` · ${counts[f]}` : ` · ${rows.length}`}
          </button>
        ))}
      </div>

      <div className="aq-list">
        {shown.map((r) => {
          const st = states[r.slug];
          return (
            <div key={r.slug} className="aq-row">
              <div className="aq-info">
                <span className="aq-type mono">{r.type}</span>
                <a className="aq-title" href={`/${r.type === "look" ? "looks" : r.type === "kit" ? "kits" : r.type + "s"}/${r.slug}?preview=1`} target="_blank" rel="noopener">{r.title}</a>
                <div className="gate">
                  <Flag ok={r.gate.coherence} label={`coherence ${r.coherence}`} />
                  <Flag ok={r.gate.linkHealth} label="links" />
                  <Flag ok={r.gate.originality} label="original" />
                  <Flag ok={r.gate.images} label="images" warnOnly />
                </div>
              </div>
              <div className="aq-state">
                <span className={"st-badge " + st}>{st}</span>
                <div className="aq-actions">
                  {st !== "published" && <button className="mini pub" disabled={busy === r.slug} onClick={() => setState(r.slug, "published")}>Publish</button>}
                  {st !== "draft" && <button className="mini" disabled={busy === r.slug} onClick={() => setState(r.slug, "draft")}>Unpublish</button>}
                  {st !== "archived" && <button className="mini arc" disabled={busy === r.slug} onClick={() => setState(r.slug, "archived")}>Archive</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .aq-head h1{ font-weight:400; font-size:clamp(1.6rem,2.6vw,2.2rem); margin:6px 0 0; }
        .aq-sub{ color:var(--ink-soft); max-width:70ch; margin:10px 0 0; font-size:14px; }
        .aq-sub code{ font-family:var(--mono); font-size:12px; background:var(--surface); padding:2px 6px; border-radius:5px; }
        .aq-filters{ display:flex; gap:8px; margin:22px 0 16px; flex-wrap:wrap; }
        .chip{ font-size:12.5px; color:var(--ink-soft); background:var(--surface); border:1px solid var(--line); padding:6px 13px; border-radius:999px; cursor:pointer; }
        .chip.on{ background:var(--ink); color:var(--bg); border-color:var(--ink); }
        .aq-list{ border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; }
        .aq-row{ display:flex; justify-content:space-between; align-items:center; gap:16px; padding:14px 18px; }
        .aq-row + .aq-row{ border-top:1px solid var(--line); }
        .aq-info{ display:flex; flex-direction:column; gap:6px; min-width:0; }
        .aq-type{ font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:var(--ink-mute); }
        .aq-title{ font-size:15px; } .aq-title:hover{ color:var(--accent-soft); }
        .gate{ display:flex; gap:8px; flex-wrap:wrap; }
        .aq-state{ display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
        .st-badge{ font-family:var(--mono); font-size:11px; padding:3px 9px; border-radius:999px; text-transform:uppercase; letter-spacing:.06em; }
        .st-badge.published{ background:color-mix(in srgb,var(--positive) 22%, transparent); color:var(--positive); }
        .st-badge.draft{ background:color-mix(in srgb,var(--warning) 20%, transparent); color:var(--warning); }
        .st-badge.archived{ color:var(--ink-mute); border:1px solid var(--line); }
        .aq-actions{ display:flex; gap:6px; }
        .mini{ background:none; border:1px solid var(--line); color:var(--ink-soft); padding:6px 11px; border-radius:999px; font-size:12px; cursor:pointer; }
        .mini:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .mini.pub{ background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
        .mini.arc{ color:var(--danger); }
        @media (max-width:640px){ .aq-row{ flex-direction:column; align-items:flex-start; } .aq-state{ align-items:flex-start; } }
      `}</style>
    </div>
  );
}

function Flag({ ok, label, warnOnly }: { ok: boolean; label: string; warnOnly?: boolean }) {
  const cls = ok ? "ok" : warnOnly ? "warn" : "bad";
  return (
    <span className={"flag " + cls}>
      <i>{ok ? "✓" : warnOnly ? "!" : "✗"}</i> {label}
      <style>{`
        .flag{ display:inline-flex; align-items:center; gap:4px; font-size:11px; color:var(--ink-mute); }
        .flag i{ font-style:normal; }
        .flag.ok i{ color:var(--positive); } .flag.warn i{ color:var(--warning); } .flag.bad i{ color:var(--danger); }
      `}</style>
    </span>
  );
}
