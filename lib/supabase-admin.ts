import "server-only";

// Server-side Supabase REST via the service key (bypasses RLS). Used for newsletter subscribers
// and contact messages. Creds in env only: SUPABASE_URL, SUPABASE_SERVICE_KEY. Absent → no-op.
const URL = process.env.SUPABASE_URL || "";
const KEY = process.env.SUPABASE_SERVICE_KEY || "";

export function dbEnabled(): boolean {
  return Boolean(URL && KEY);
}

// Insert a row (optionally upsert on a conflict column). Returns the inserted/updated rows.
export async function insertRow(
  table: string,
  row: Record<string, unknown>,
  opts: { upsertOn?: string } = {}
): Promise<{ ok: boolean; status: number; data?: unknown; error?: string }> {
  if (!dbEnabled()) return { ok: false, status: 0, error: "db disabled" };
  const headers: Record<string, string> = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    Prefer: opts.upsertOn ? "resolution=merge-duplicates,return=representation" : "return=representation",
  };
  const qs = opts.upsertOn ? `?on_conflict=${encodeURIComponent(opts.upsertOn)}` : "";
  try {
    const res = await fetch(`${URL}/rest/v1/${table}${qs}`, {
      method: "POST",
      headers,
      body: JSON.stringify(row),
      cache: "no-store",
    });
    const text = await res.text();
    let data: unknown;
    try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }
    return { ok: res.ok, status: res.status, data, error: res.ok ? undefined : String((data as any)?.message || text) };
  } catch (e: any) {
    return { ok: false, status: 0, error: e?.message ?? "fetch failed" };
  }
}
