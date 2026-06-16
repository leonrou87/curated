import type { EnrichedBundle } from "@/lib/types";

// Seed hero/flat-lay images are flagged placeholders (data/_meta). Until a human drops in
// licensed/PA-API imagery, we render a curated CSS cover built from the bundle's REAL product
// colors — so the catalog still feels intentional and on-palette. Swap for <Image> later.
export function BundleCover({
  bundle,
  className = "",
  withFigure = true,
}: {
  bundle: EnrichedBundle;
  className?: string;
  withFigure?: boolean;
}) {
  const swatches = bundle.items.map((i) => i.swatch);
  const hero = bundle.items.find((i) => i.isHero && i.image) ?? bundle.items.find((i) => i.image) ?? bundle.items.find((i) => i.isHero) ?? bundle.items[0];
  const base = hero?.swatch ?? "#6b6256";
  const stops = swatches.slice(0, 4);
  const heroImg = hero?.image ?? null;

  return (
    <div className={"cover-scene " + className} aria-hidden style={{ ["--base" as any]: base }}>
      <div
        className="cs-wash"
        style={{
          background: `radial-gradient(120% 100% at 32% 8%, ${tint(base, 26)} 0%, ${shade(base, 14)} 46%, ${shade(base, 52)} 100%)`,
        }}
      />
      {heroImg ? (
        // real product photo — the garment is the hero (DESIGN-SYSTEM §0.1)
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cs-photo" src={heroImg} alt="" loading="lazy" decoding="async" />
      ) : bundle.isFashion && withFigure ? (
        <div className="cs-figure" style={{ background: `linear-gradient(165deg, ${tint(base, 22)}, ${base} 48%, ${shade(base, 38)})` }} />
      ) : (
        <div className="cs-grid">
          {stops.map((s, i) => (
            <span key={i} style={{ background: s }} />
          ))}
        </div>
      )}
      <div className="cs-grain" />
      <div className="cs-scrim" />
      <style>{`
        .cover-scene{ position:absolute; inset:0; overflow:hidden; }
        .cs-wash{ position:absolute; inset:0; }
        .cs-photo{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 30%; }
        .cs-figure{ position:absolute; left:50%; bottom:0; width:36%; height:80%;
          transform:translateX(-50%);
          border-radius:46% 46% 28% 28% / 58% 58% 42% 42%;
          box-shadow:inset -18px -10px 40px rgba(0,0,0,.34), inset 14px 8px 30px rgba(255,240,215,.18); }
        .cs-grid{ position:absolute; inset:12% 14%; display:grid; gap:8px;
          grid-template-columns:repeat(2,1fr); }
        .cs-grid span{ border-radius:8px; box-shadow:inset 0 0 24px rgba(0,0,0,.28); }
        .cs-grain{ position:absolute; inset:0; opacity:.05; mix-blend-mode:overlay;
          background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>"); }
        .cs-scrim{ position:absolute; inset:0; background:linear-gradient(180deg, transparent 38%, rgba(0,0,0,.66) 100%); }
      `}</style>
    </div>
  );
}

// tiny hex shade/tint helpers (no deps)
function clampByte(n: number) { return Math.max(0, Math.min(255, Math.round(n))); }
function parse(hex: string) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function toHex([r, g, b]: number[]) {
  return "#" + [r, g, b].map((n) => clampByte(n).toString(16).padStart(2, "0")).join("");
}
export function shade(hex: string, pct: number) {
  const [r, g, b] = parse(hex);
  const f = 1 - pct / 100;
  return toHex([r * f, g * f, b * f]);
}
export function tint(hex: string, pct: number) {
  const [r, g, b] = parse(hex);
  const f = pct / 100;
  return toHex([r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f]);
}
