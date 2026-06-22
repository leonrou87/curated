import { NextResponse } from "next/server";
import { insertRow, dbEnabled } from "@/lib/supabase-admin";
import { sendMail, emailEnabled, emailShell, SUPPORT_TO } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, hp } = (await req.json()) as Record<string, string>;
    if (hp) return NextResponse.json({ ok: true }); // honeypot
    const addr = (email || "").trim().toLowerCase();
    const msg = (message || "").trim();
    if (!isEmail(addr)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    if (msg.length < 5) return NextResponse.json({ error: "Please add a message." }, { status: 400 });
    if (msg.length > 5000) return NextResponse.json({ error: "Message is too long." }, { status: 400 });

    const subj = (subject || "Support request").slice(0, 140);
    const nm = (name || "").slice(0, 120);

    if (dbEnabled()) {
      await insertRow("curated_contact", {
        name: nm || null, email: addr, subject: subj, message: msg,
        user_agent: req.headers.get("user-agent")?.slice(0, 300) || null,
      });
    }

    if (emailEnabled() && SUPPORT_TO) {
      // notify the team
      await sendMail({
        to: SUPPORT_TO,
        replyTo: addr,
        subject: `[Curated Support] ${subj}`,
        html: emailShell("New support message", `
          <p><b>From:</b> ${esc(nm || "—")} &lt;${esc(addr)}&gt;</p>
          <p><b>Subject:</b> ${esc(subj)}</p>
          <p style="margin-top:14px;white-space:pre-wrap;">${esc(msg)}</p>`),
      }).catch(() => {});
      // auto-acknowledge the sender
      await sendMail({
        to: addr,
        subject: "We got your message — Curated",
        html: emailShell("Thanks for reaching out.", `
          <p>We received your message and will get back to you within a day or two.</p>
          <p style="margin-top:14px;color:#7d7565;font-size:14px;">Your note:</p>
          <p style="white-space:pre-wrap;color:#cfc7b8;">${esc(msg)}</p>`),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
