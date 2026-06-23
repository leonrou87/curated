"use client";
import { useState } from "react";
import type { EnrichedItem } from "@/lib/types";
import { fmtCents } from "@/lib/format";
import { AffiliateCTA } from "./AffiliateCTA";

// The image is the interface — tappable pins anchored to item coords. Keyboard-navigable,
// aria-labelled, synced with the breakdown rows via activeId. Reveal-staggered by index.
export function ShoppablePins({
  items,
  visible,
  activeId,
  setActiveId,
  reduced,
}: {
  items: EnrichedItem[];
  visible: boolean;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  reduced: boolean;
}) {
  const [openPin, setOpenPin] = useState<string | null>(null);

  return (
    <div className={"pins" + (visible ? " show" : "")}>
      {items.map((it, i) => {
        const id = it.productId;
        const open = openPin === id;
        return (
          <button
            key={id}
            className={"pin" + (activeId === id ? " active" : "") + (open ? " open" : "")}
            style={{ left: it.pin.x + "%", top: it.pin.y + "%", transitionDelay: reduced ? "0ms" : 60 * i + "ms" }}
            onMouseEnter={() => setActiveId(id)}
            onMouseLeave={() => setActiveId(null)}
            onFocus={() => setActiveId(id)}
            onBlur={() => setActiveId(null)}
            onClick={() => setOpenPin(open ? null : id)}
            aria-label={`${it.role}: ${it.brand} ${it.title}, ${fmtCents(it.priceCents)}`}
            aria-expanded={open}
          >
            <span className="pin-dot" />
            {open && (
              <span className="pin-card" onClick={(e) => e.stopPropagation()}>
                <span className="pc-sw" style={{ background: it.swatch }}>
                  {it.image && /* eslint-disable-next-line @next/next/no-img-element */ (
                    <img src={it.image} alt="" loading="lazy" />
                  )}
                </span>
                <span className="pc-meta">
                  <span className="eyebrow pc-role">{it.role}</span>
                  <span className="pc-brand">{it.brand}</span>
                  <span className="pc-title">{it.title}</span>
                  <span className="mono pc-price">{fmtCents(it.priceCents)}</span>
                </span>
                <span className="pc-cta" onClick={(e) => e.stopPropagation()}>
                  <AffiliateCTA offer={it.bestOffer} brand={it.brand} productId={it.productId} />
                </span>
              </span>
            )}
          </button>
        );
      })}
      <style dangerouslySetInnerHTML={{ __html: `
        .pins{ position:absolute; inset:0; opacity:0; transition:opacity .5s ease; pointer-events:none; }
        .pins.show{ opacity:1; pointer-events:auto; }
        .pin{ position:absolute; transform:translate(-50%,-50%) scale(.4); opacity:0;
          background:none; border:none; cursor:pointer; z-index:5;
          transition:transform .5s var(--ease-out), opacity .4s ease; }
        .pins.show .pin{ transform:translate(-50%,-50%) scale(1); opacity:1; }
        .pin-dot{ display:block; width:14px; height:14px; border-radius:50%;
          background:rgba(244,242,238,.92); box-shadow:0 0 0 2px rgba(14,14,15,.55), 0 2px 8px rgba(0,0,0,.4);
          animation:breathe 2.6s var(--ease-inout) infinite; }
        @keyframes breathe{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        .pin.active .pin-dot, .pin.open .pin-dot{ background:var(--accent);
          box-shadow:0 0 0 2px rgba(14,14,15,.6), 0 0 0 6px color-mix(in srgb, var(--accent) 25%, transparent); animation:none; }
        .pin-card{ position:absolute; left:50%; bottom:24px; transform:translateX(-50%);
          width:230px; background:var(--surface); border:1px solid var(--line); border-radius:12px;
          padding:11px; display:flex; gap:10px; align-items:center; text-align:left;
          box-shadow:var(--e-3); animation:pop .28s var(--ease-out); z-index:9; }
        @keyframes pop{ from{opacity:0; transform:translateX(-50%) translateY(6px) scale(.96)} to{opacity:1; transform:translateX(-50%) translateY(0) scale(1)} }
        .pin-card::after{ content:""; position:absolute; left:50%; bottom:-6px; width:10px; height:10px;
          transform:translateX(-50%) rotate(45deg); background:var(--surface); border-right:1px solid var(--line); border-bottom:1px solid var(--line); }
        .pc-sw{ width:42px; height:52px; border-radius:6px; flex:none; overflow:hidden; position:relative; }
        .pc-sw img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .pc-meta{ display:flex; flex-direction:column; gap:1px; min-width:0; }
        .pc-role{ font-size:9.5px; }
        .pc-brand{ font-size:12px; color:var(--ink-soft); }
        .pc-title{ font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; }
        .pc-price{ font-size:12.5px; margin-top:2px; }
        .pc-cta{ align-self:flex-end; }
      ` }} />
    </div>
  );
}
