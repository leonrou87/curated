"use client";
import { useMemo, useState } from "react";
import type { OfferOverride } from "@/lib/affiliate-config";

export interface LinkRow {
  id: string;
  title: string;
  brand: string;
  category: string;
  network: string;
  merchant: string;
  url: string;
}

const NETWORKS = ["sovrn", "amazon", "shareasale", "cj", "impact", "direct"];

export function LinkManager({ rows, initialOverrides }: { rows: LinkRow[]; initialOverrides: Record<string, OfferOverride> }) {
  const [overrides, setOverrides] = useState(initialOverrides);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<OfferOverride>({});
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => rows.filter((r) => `${r.title} ${r.brand} ${r.category}`.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  const startEdit = (r: LinkRow) => {
    setEditing(r.id);
    setDraft(overrides[r.id] ?? { network: r.network, merchant: r.merchant });
  };

  const save = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, override: draft }) });
      const data = await res.json();
      if (res.ok) { setOverrides(data.overrides); setEditing(null); }
    } finally { setBusy(false); }
  };

  const clear = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, override: null }) });
      const data = await res.json();
      if (res.ok) { setOverrides(data.overrides); setEditing(null); }
    } finally { setBusy(false); }
  };

  return (
    <div className="lm">
      <header className="lm-head">
        <div>
          <span className="eyebrow">Admin · links</span>
          <h1 className="serif">Link manager</h1>
          <p className="lm-sub">Every product’s resolved outbound offer. Override the network, paste a direct/affiliate URL, or flag stock. Saved to <code>data/offer-overrides.json</code>; the resolver prefers your override.</p>
        </div>
        <input className="lm-search" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
      </header>

      <div className="lm-table">
        <div className="lm-row lm-th">
          <span>Product</span><span>Network</span><span>Outbound URL</span><span></span>
        </div>
        {filtered.map((r) => {
          const ov = overrides[r.id];
          const isEditing = editing === r.id;
          return (
            <div key={r.id} className={"lm-row" + (ov ? " has-ov" : "")}>
              <span className="lm-prod">
                <b>{r.brand}</b> {r.title}
                <i className="lm-cat">{r.category}{ov ? " · overridden" : ""}</i>
              </span>
              {isEditing ? (
                <>
                  <span>
                    <select value={draft.network} onChange={(e) => setDraft((d) => ({ ...d, network: e.target.value }))}>
                      {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </span>
                  <span className="lm-edit">
                    <input placeholder="Paste affiliate/direct URL (optional)" value={draft.affiliateUrl ?? ""} onChange={(e) => setDraft((d) => ({ ...d, affiliateUrl: e.target.value || undefined }))} />
                    <label className="lm-stock"><input type="checkbox" checked={draft.inStock !== false} onChange={(e) => setDraft((d) => ({ ...d, inStock: e.target.checked }))} /> in stock</label>
                  </span>
                  <span className="lm-actions">
                    <button className="mini save" onClick={() => save(r.id)} disabled={busy}>Save</button>
                    {ov && <button className="mini clear" onClick={() => clear(r.id)} disabled={busy}>Reset</button>}
                    <button className="mini" onClick={() => setEditing(null)}>Cancel</button>
                  </span>
                </>
              ) : (
                <>
                  <span className="mono lm-net">{ov?.network ?? r.network}</span>
                  <span className="mono lm-url" title={ov?.affiliateUrl ?? r.url}>{ov?.affiliateUrl ?? r.url}</span>
                  <span className="lm-actions"><button className="mini" onClick={() => startEdit(r)}>Edit</button></span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .lm-head{ display:flex; justify-content:space-between; align-items:flex-start; gap:20px; }
        .lm-head h1{ font-weight:400; font-size:clamp(1.6rem,2.6vw,2.2rem); margin:6px 0 0; }
        .lm-sub{ color:var(--ink-soft); max-width:62ch; margin:10px 0 0; font-size:14px; }
        .lm-sub code{ font-family:var(--mono); font-size:12px; background:var(--surface); padding:2px 6px; border-radius:5px; }
        .lm-search{ background:var(--bg); border:1px solid var(--line); border-radius:999px; padding:10px 16px; color:var(--ink); font-size:13.5px; min-width:200px; }
        .lm-search:focus{ outline:none; border-color:var(--accent); }
        .lm-table{ margin-top:22px; border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; }
        .lm-row{ display:grid; grid-template-columns:1.4fr 0.8fr 2fr 0.9fr; gap:14px; align-items:center; padding:12px 16px; font-size:13px; }
        .lm-row + .lm-row{ border-top:1px solid var(--line); }
        .lm-th{ background:var(--surface); color:var(--ink-mute); font-size:11px; text-transform:uppercase; letter-spacing:.08em; }
        .lm-row.has-ov{ background:color-mix(in srgb, var(--accent) 5%, transparent); }
        .lm-prod{ display:flex; flex-direction:column; } .lm-prod b{ font-weight:500; } .lm-cat{ font-style:normal; font-size:11px; color:var(--ink-mute); }
        .lm-net{ font-size:12px; color:var(--ink-soft); }
        .lm-url{ font-size:11.5px; color:var(--ink-mute); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .lm-actions{ display:flex; gap:6px; justify-content:flex-end; }
        .mini{ background:none; border:1px solid var(--line); color:var(--ink-soft); padding:6px 11px; border-radius:999px; font-size:12px; cursor:pointer; }
        .mini:hover{ color:var(--ink); border-color:var(--ink-mute); }
        .mini.save{ background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
        .mini.clear{ color:var(--danger); border-color:var(--danger); }
        .lm-edit{ display:flex; flex-direction:column; gap:6px; }
        .lm-edit input{ background:var(--bg); border:1px solid var(--line); border-radius:var(--r-sm); padding:7px 10px; color:var(--ink); font-size:12px; font-family:var(--mono); }
        .lm-stock{ font-size:11px; color:var(--ink-mute); display:flex; align-items:center; gap:6px; }
        select{ background:var(--bg); border:1px solid var(--line); border-radius:var(--r-sm); padding:7px 8px; color:var(--ink); font-size:12px; }
        @media (max-width:760px){ .lm-row{ grid-template-columns:1fr; } .lm-url{ display:none; } }
      `}</style>
    </div>
  );
}
