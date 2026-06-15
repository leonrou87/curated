import { NextResponse } from "next/server";
import { readConfig, writeConfig, type AffiliateConfig } from "@/lib/affiliate-config";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readConfig());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AffiliateConfig;
    if (!body || !body.networks) {
      return NextResponse.json({ error: "Invalid config payload" }, { status: 400 });
    }
    await writeConfig(body);
    return NextResponse.json({ ok: true, config: await readConfig() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to save" }, { status: 500 });
  }
}
