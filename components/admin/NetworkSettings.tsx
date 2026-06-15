"use client";
import { useState } from "react";
import type { AffiliateConfig } from "@/lib/affiliate-config";

// Fields each network exposes in the form.
const FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  sovrn: [{ key: "publisherId", label: "Publisher / Site ID", placeholder: "e.g. 123456" }],
  amazon: [
    { key: "associateTag", label: "Associate tag", placeholder: "yourtag-20" },
    { key: "paapiAccessKey", label: "PA-API access key (after 3 sales)", placeholder: "AKIA…" },
    { key: "paapiSecret", label: "PA-API secret", placeholder: "••••••" },
    { key: "region", label: "PA-API region", placeholder: "us-east-1" },
  ],
  shareasale: [{ key: "affiliateId", label: "Affiliate ID", placeholder: "e.g. 987654" }],
  cj: [{ key: "websiteId", label: "Website ID (PID)", placeholder: "e.g. 100200300" }],
  impact: [{ key: "accountSid", label: "Account SID", placeholder: "IRxxxx" }],
};

export function NetworkSettings({ initial }: { initial: AffiliateConfig }) {
  const [cfg, setCfg] = useState<AffiliateConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setNet = (k: string, field: string, value: string | boolean) =>
    setCfg((c) => ({ ...c, networks: { ...c.networks, [k]: { ...c.networks[k], [field]: value } } }));

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg("Saved. Outbound links now wrap with your IDs — reload a look page to see it.");
    } catch (e: any) {
      setMsg("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ns">
      <header className="ns-head">
        <div>
          <span className="eyebrow">Admin · networks</span>
          <h1 className="serif">Affiliate networks</h1>
          <p className="ns-sub">Paste the IDs you get when you sign up. Saved to <code>data/affiliate-config.json</code>; the offer resolver wraps every outbound link with them. Sovrn alone monetizes the whole catalog on day one.</p>
        </div>
        <button className="ns-save" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
      </header>

      <section className="site-card">
        <h2 className="serif">Site</h2>
        <div className="row2">
          <Field label="Brand name" value={cfg.site.name} onChange={(v) => setCfg((c) => ({ ...c, site: { ...c.site, name: v } }))} placeholder="Curated" />
          <Field label="Domain / URL (no “Amazon” in it)" value={cfg.site.url} onChange={(v) => setCfg((c) => ({ ...c, site: { ...c.site, url: v } }))} placeholder="https://yourbrand.com" />
        </div>
        <div className="row2">
          <Field label="GA4 measurement ID" value={cfg.analytics.ga4} onChange={(v) => setCfg((c) => ({ ...c, analytics: { ...c.analytics, ga4: v } }))} placeholder="G-XXXXXXX" />
          <Field label="Plausible domain" value={cfg.analytics.plausibleDomain} onChange={(v) => setCfg((c) => ({ ...c, analytics: { ...c.analytics, plausibleDomain: v } }))} placeholder="yourbrand.com" />
        </div>
      </section>

      {Object.entries(cfg.networks).map(([k, n]) => (
        <section key={k} className="net-card">
          <div className="net-card-head">
            <label className="toggle">
              <input type="checkbox" checked={n.enabled} onChange={(e) => setNet(k, "enabled", e.target.checked)} />
              <span className="serif">{n.label}</span>
            </label>
            <span className={"badge " + (n.enabled ? (FIELDS[k]?.some((f) => (n as any)[f.key]) ? "live" : "pending") : "off")}>
              {n.enabled ? (FIELDS[k]?.some((f) => (n as any)[f.key]) ? "live" : "needs ID") : "off"}
            </span>
          </div>
          <p className="net-note">{n.note}</p>
          <div className="net-fields">
            {FIELDS[k]?.map((f) => (
              <Field key={f.key} label={f.label} value={(n as any)[f.key] ?? ""} placeholder={f.placeholder}
                onChange={(v) => setNet(k, f.key, v)} mono />
            ))}
          </div>
        </section>
      ))}

      {msg && <p className={"ns-msg" + (msg.startsWith("Error") ? " err" : "")}>{msg}</p>}
      <button className="ns-save bottom" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>

      <style>{`
        .ns-head{ display:flex; justify-content:space-between; align-items:flex-start; gap:20px; }
        .ns-head h1{ font-weight:400; font-size:clamp(1.6rem,2.6vw,2.2rem); margin:6px 0 0; }
        .ns-sub{ color:var(--ink-soft); max-width:60ch; margin:10px 0 0; font-size:14px; }
        .ns-sub code{ font-family:var(--mono); font-size:12px; background:var(--surface); padding:2px 6px; border-radius:5px; }
        .ns-save{ background:var(--accent); color:var(--accent-ink); border:none; padding:11px 20px; border-radius:999px; font-size:14px; font-weight:500; cursor:pointer; white-space:nowrap; }
        .ns-save:hover{ background:var(--accent-soft); } .ns-save:disabled{ opacity:.6; cursor:default; }
        .ns-save.bottom{ margin-top:20px; }
        .site-card, .net-card{ background:var(--surface); border:1px solid var(--line); border-radius:var(--r-lg); padding:20px; margin-top:18px; }
        .site-card h2{ font-weight:400; font-size:1.1rem; margin:0 0 12px; }
        .row2{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:6px; }
        .net-card-head{ display:flex; justify-content:space-between; align-items:center; }
        .toggle{ display:flex; align-items:center; gap:10px; cursor:pointer; }
        .toggle .serif{ font-size:1.1rem; }
        .toggle input{ width:16px; height:16px; accent-color:var(--accent); }
        .badge{ font-family:var(--mono); font-size:11px; padding:3px 9px; border-radius:999px; }
        .badge.live{ background:color-mix(in srgb,var(--positive) 22%, transparent); color:var(--positive); }
        .badge.pending{ background:color-mix(in srgb,var(--warning) 20%, transparent); color:var(--warning); }
        .badge.off{ color:var(--ink-mute); border:1px solid var(--line); }
        .net-note{ font-size:12.5px; color:var(--ink-mute); margin:8px 0 14px; max-width:70ch; }
        .net-fields{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .ns-msg{ margin-top:16px; font-size:13px; color:var(--positive); }
        .ns-msg.err{ color:var(--danger); }
        @media (max-width:680px){ .row2, .net-fields{ grid-template-columns:1fr; } .ns-head{ flex-direction:column; } }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <label className="field">
      <span className="field-l">{label}</span>
      <input className={mono ? "mono" : ""} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <style>{`
        .field{ display:flex; flex-direction:column; gap:6px; }
        .field-l{ font-size:12px; color:var(--ink-mute); }
        .field input{ background:var(--bg); border:1px solid var(--line); border-radius:var(--r-md); padding:10px 12px; color:var(--ink); font-size:13.5px; font-family:var(--sans); }
        .field input.mono{ font-family:var(--mono); }
        .field input:focus{ outline:none; border-color:var(--accent); }
      `}</style>
    </label>
  );
}
