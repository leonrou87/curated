"use client";
import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", hp: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending"); setErr(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("sent");
    } catch (e: any) {
      setErr(e.message); setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="cf-done">
        <span className="index">✓</span>
        <h2 className="serif">Message sent.</h2>
        <p>Thanks — we’ll reply to <b>{form.email}</b> within a day or two. Check your inbox for a confirmation.</p>
        <style>{doneCss}</style>
      </div>
    );
  }

  return (
    <form className="cf" onSubmit={submit}>
      <div className="cf-row">
        <label className="cf-field"><span className="eyebrow">Name</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
        </label>
        <label className="cf-field"><span className="eyebrow">Email *</span>
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
        </label>
      </div>
      <label className="cf-field"><span className="eyebrow">Subject</span>
        <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="What's this about?" />
      </label>
      <label className="cf-field"><span className="eyebrow">Message *</span>
        <textarea required rows={6} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="How can we help?" />
      </label>
      {/* honeypot — hidden from humans */}
      <input className="cf-hp" tabIndex={-1} autoComplete="off" value={form.hp} onChange={(e) => set("hp", e.target.value)} aria-hidden />
      {err && <p className="cf-err">{err}</p>}
      <button type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
      <style>{`
        .cf{ display:flex; flex-direction:column; gap:18px; }
        .cf-row{ display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .cf-field{ display:flex; flex-direction:column; gap:8px; }
        .cf-field input, .cf-field textarea{ background:var(--surface); border:1px solid var(--line); padding:13px 16px; color:var(--ink); font-family:var(--sans); font-size:15px; }
        .cf-field input:focus, .cf-field textarea:focus{ outline:none; border-color:var(--accent); }
        .cf-field textarea{ resize:vertical; line-height:1.6; }
        .cf-hp{ position:absolute; left:-9999px; width:1px; height:1px; opacity:0; }
        .cf-err{ color:var(--danger); font-size:14px; margin:0; }
        .cf button{ align-self:flex-start; background:var(--accent); color:var(--accent-ink); border:none; padding:15px 30px; font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; }
        .cf button:hover{ background:var(--accent-soft); } .cf button:disabled{ opacity:.6; cursor:default; }
        @media (max-width:560px){ .cf-row{ grid-template-columns:1fr; } }
      `}</style>
    </form>
  );
}

const doneCss = `
  .cf-done{ text-align:center; padding:30px 0; }
  .cf-done .index{ font-size:1.4rem; color:var(--positive); }
  .cf-done h2{ font-weight:400; font-style:italic; font-size:2rem; margin:12px 0 10px; }
  .cf-done p{ color:var(--ink-soft); max-width:46ch; margin:0 auto; }
`;
