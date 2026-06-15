import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Link-health loop (on-demand). Checks each URL and reports active | stale | dead.
// Dead/stale offers should auto-swap to a BundleItem.swapAlternate in the full pipeline.
async function check(url: string): Promise<{ url: string; status: string; code: number | null }> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    let res: Response;
    try {
      res = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal });
      // some servers reject HEAD — retry GET
      if (res.status >= 400 && res.status !== 405) {
        res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal });
      }
    } finally {
      clearTimeout(t);
    }
    const code = res.status;
    const status = code < 400 ? "active" : code === 404 || code === 410 ? "dead" : "stale";
    return { url, status, code };
  } catch {
    return { url, status: "dead", code: null };
  }
}

export async function POST(req: Request) {
  try {
    const { urls } = (await req.json()) as { urls: string[] };
    if (!Array.isArray(urls)) return NextResponse.json({ error: "urls[] required" }, { status: 400 });
    const limited = urls.slice(0, 40);
    const results = await Promise.all(limited.map(check));
    return NextResponse.json({ ok: true, results, checkedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
