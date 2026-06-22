import { NextResponse } from "next/server";
import { insertRow, dbEnabled } from "@/lib/supabase-admin";
import { sendMail, emailEnabled, emailShell } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

export async function POST(req: Request) {
  try {
    const { email, source, hp } = (await req.json()) as { email?: string; source?: string; hp?: string };
    if (hp) return NextResponse.json({ ok: true }); // honeypot — silently accept bots
    const addr = (email || "").trim().toLowerCase();
    if (!isEmail(addr)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

    if (dbEnabled()) {
      const r = await insertRow("curated_subscribers", { email: addr, source: source || "footer" }, { upsertOn: "email" });
      if (!r.ok && r.status !== 409) {
        return NextResponse.json({ error: "Could not save — try again." }, { status: 502 });
      }
    }

    if (emailEnabled()) {
      await sendMail({
        to: addr,
        subject: "You're on the list — Curated",
        html: emailShell("Welcome to the Edit.", `
          <p>Thanks for subscribing. Once a week we'll send the best new looks and the aesthetics worth knowing — nothing else.</p>
          <p style="margin-top:18px;"><a href="https://curated.kytepush.com/quiz" style="color:#e89262;">Take the 60-second style quiz →</a> and your feed will learn what you love.</p>`),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
