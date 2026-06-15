import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
const FILE = path.join(process.cwd(), "data", "bundle-state.json");

async function read(): Promise<Record<string, string>> {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return {}; }
}

export async function GET() {
  return NextResponse.json(await read());
}

// Body: { slug, state: "published" | "draft" | "archived" }
export async function POST(req: Request) {
  try {
    const { slug, state } = (await req.json()) as { slug: string; state: string };
    if (!slug || !["published", "draft", "archived"].includes(state)) {
      return NextResponse.json({ error: "slug + valid state required" }, { status: 400 });
    }
    const all = await read();
    all[slug] = state;
    try {
      await fs.writeFile(FILE, JSON.stringify(all, null, 2));
    } catch (e: any) {
      if (["EROFS", "EACCES", "EPERM"].includes(e?.code)) {
        return NextResponse.json({ error: "Read-only filesystem (production). Edit data/bundle-state.json locally and redeploy." }, { status: 503 });
      }
      throw e;
    }
    return NextResponse.json({ ok: true, states: all });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
