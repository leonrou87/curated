import { NextResponse } from "next/server";
import { readOverrides, writeOverrides, type OfferOverride } from "@/lib/affiliate-config";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readOverrides());
}

// Merge or clear a single product's override. Body: { productId, override | null }
export async function POST(req: Request) {
  try {
    const { productId, override } = (await req.json()) as {
      productId: string;
      override: OfferOverride | null;
    };
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
    const all = await readOverrides();
    if (override === null) delete all[productId];
    else all[productId] = { ...all[productId], ...override };
    await writeOverrides(all);
    return NextResponse.json({ ok: true, overrides: all });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to save" }, { status: 500 });
  }
}
