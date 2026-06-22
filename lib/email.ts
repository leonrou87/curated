import "server-only";
import nodemailer from "nodemailer";

// Transactional email via Gmail SMTP (App Password). Creds live in env only:
//   GMAIL_USER, GMAIL_APP_PASSWORD. Absent → emailEnabled() is false and senders no-op.
export function emailEnabled(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

let _transport: nodemailer.Transporter | null = null;
function transport() {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host: process.env.GMAIL_SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.GMAIL_SMTP_PORT || 465),
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "") },
  });
  return _transport;
}

const FROM_NAME = "Curated";

export async function sendMail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!emailEnabled()) return { ok: false, skipped: true as const };
  const from = `${FROM_NAME} <${process.env.GMAIL_USER}>`;
  await transport().sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  });
  return { ok: true as const };
}

// The address support/contact submissions are delivered to.
export const SUPPORT_TO = process.env.SUPPORT_TO || process.env.GMAIL_USER || "";

// Minimal branded email shell (dark, editorial, inline styles for mail clients).
export function emailShell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#100f0d;font-family:Georgia,'Times New Roman',serif;color:#f3ede1;">
  <div style="max-width:560px;margin:0 auto;padding:40px 28px;">
    <div style="font-family:monospace;letter-spacing:6px;font-size:13px;color:#b8b0a0;">C U R A T E D</div>
    <h1 style="font-style:italic;font-weight:400;font-size:28px;margin:22px 0 16px;color:#f3ede1;">${title}</h1>
    <div style="font-size:16px;line-height:1.6;color:#cfc7b8;">${body}</div>
    <hr style="border:none;border-top:1px solid #2e2a23;margin:30px 0 16px;" />
    <div style="font-size:12px;color:#7d7565;">Curated · curated.kytepush.com — a magazine you can shop.</div>
  </div></body></html>`;
}
