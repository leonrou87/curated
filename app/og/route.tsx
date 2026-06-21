import { ImageResponse } from "next/og";
import { aestheticOf } from "@/lib/aesthetics";

export const runtime = "edge";

// Dynamic, on-brand share cards. Every shared look or Style-DNA result renders a beautiful
// 1200x630 preview in iMessage / X / IG. Pure param-driven (no data fetch) → fast + reliable.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "look";
  const BG = "#0E0E0F", INK = "#F4F2EE", SOFT = "#B9B6AF", MUTE = "#7E7B75", LINE = "#2A2A2D", ACCENT = "#C8612F";

  const frame = (children: any, accent = ACCENT) => (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, padding: 64, position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: accent }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: MUTE, fontSize: 22, letterSpacing: 8 }}>
        <div style={{ display: "flex" }}>C U R A T E D</div>
        <div style={{ display: "flex", fontSize: 18 }}>curated.kytepush.com</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>{children}</div>
    </div>
  );

  if (type === "dna") {
    const keys = [searchParams.get("a1"), searchParams.get("a2"), searchParams.get("a3")].filter(Boolean) as string[];
    const pcts = [searchParams.get("p1"), searchParams.get("p2"), searchParams.get("p3")].map((p) => Number(p) || 0);
    const top = keys.length ? aestheticOf(keys[0]) : aestheticOf("quiet-luxury");
    return new ImageResponse(
      frame(
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: SOFT, fontSize: 28, letterSpacing: 4, marginBottom: 12 }}>MY STYLE DNA</div>
          <div style={{ display: "flex", color: INK, fontSize: 86, fontWeight: 700, lineHeight: 1.05, marginBottom: 28 }}>{top.name}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {keys.map((k, i) => {
              const a = aestheticOf(k);
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", width: 220, color: i === 0 ? INK : SOFT, fontSize: 30 }}>{a.name}</div>
                  <div style={{ display: "flex", width: 520, height: 14, background: LINE, borderRadius: 999 }}>
                    <div style={{ display: "flex", width: Math.max(6, (pcts[i] / 100) * 520), height: 14, background: a.accent, borderRadius: 999 }} />
                  </div>
                  <div style={{ display: "flex", marginLeft: 18, color: MUTE, fontSize: 26 }}>{pcts[i]}%</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", marginTop: 30, color: ACCENT, fontSize: 26 }}>What's yours? Take the 60-second style quiz →</div>
        </div>,
        top.accent
      ),
      { width: 1200, height: 630 }
    );
  }

  // type === look
  const title = searchParams.get("t") || "A Curated Look";
  const a = aestheticOf(searchParams.get("a") || undefined);
  const gender = searchParams.get("g") || "";
  const price = searchParams.get("price") || "";
  const coh = searchParams.get("coh") || "";
  const cols = (searchParams.get("c") || "").split(",").filter(Boolean).slice(0, 5);

  return new ImageResponse(
    frame(
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", color: SOFT, fontSize: 26, letterSpacing: 4, marginBottom: 14, textTransform: "uppercase" }}>
          {[gender, a.name].filter(Boolean).join(" · ")}
        </div>
        <div style={{ display: "flex", color: INK, fontSize: 78, fontWeight: 700, lineHeight: 1.04, marginBottom: 30, maxWidth: 980 }}>{title}</div>
        <div style={{ display: "flex", marginBottom: 34 }}>
          {cols.map((c, i) => (
            <div key={i} style={{ display: "flex", width: 96, height: 120, background: c, borderRadius: 12, marginRight: 14 }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", color: SOFT, fontSize: 30 }}>
          {price && <div style={{ display: "flex" }}>{price}</div>}
          {price && <div style={{ display: "flex", margin: "0 18px", color: MUTE }}>·</div>}
          <div style={{ display: "flex", color: SOFT }}>Shop the look ↗</div>
        </div>
      </div>,
      a.accent
    ),
    { width: 1200, height: 630 }
  );
}
