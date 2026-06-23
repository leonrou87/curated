"use client";
import { useMemo, useState } from "react";
import type { Brief, Product } from "@/lib/types";
import { scoreComposition, coherenceTip, type ScorableItem } from "@/lib/coherence";
import { CoherenceMeter } from "./CoherenceMeter";
import { AffiliateCTA } from "./AffiliateCTA";
import { resolveBestOffer, FTC_DISCLOSURE } from "@/lib/offers";
import { fmtCents, titleCase } from "@/lib/format";

interface Slot { slotId: string; productId: string }

function scorable(p: Product, slotId: string): ScorableItem {
  return {
    id: p.id, brand: p.brand, inStock: p.inStock, slotId,
    styling: {
      formality: p.styling.formality,
      color: { family: p.styling.color.family, role: p.styling.color.role, undertone: p.styling.color.undertone },
      weight: p.styling.weight, volume: p.styling.volume, seasons: p.styling.seasons,
      pattern: p.styling.pattern, brandTier: p.styling.brandTier,
    },
  };
}

// The tactile builder with LIVE coherence. Swap a slot → the ONE scorer re-runs → meter animates,
// total re-prices, a one-line tip appears on dips. "Fix it for me" runs a greedy repair.
export function Builder({
  catalog,
  initial,
  brief,
  title,
}: {
  catalog: Product[];
  initial: Slot[];
  brief: Brief;
  title: string;
}) {
  const [slots, setSlots] = useState<Slot[]>(initial);
  const [activeSlot, setActiveSlot] = useState<string>(initial[0]?.slotId ?? "");
  const [bump, setBump] = useState<string | null>(null);

  const byId = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);

  // candidate alternates per slot: catalog products that can fill this slot
  const alternates = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const s of slots) {
      const list = catalog.filter(
        (p) => p.slotRoles.includes(s.slotId) && p.id !== s.productId
      );
      map.set(s.slotId, list);
    }
    return map;
  }, [slots, catalog]);

  const items = slots.map((s) => byId.get(s.productId)).filter(Boolean) as Product[];
  const scorables = slots.map((s) => scorable(byId.get(s.productId)!, s.slotId));
  const result = useMemo(() => scoreComposition(scorables, brief), [slots]); // eslint-disable-line
  const tip = coherenceTip(result);
  const total = slots.reduce((sum, s) => {
    const o = resolveBestOffer(byId.get(s.productId)!);
    return sum + (o?.priceSnapshot ?? 0);
  }, 0);

  const swap = (slotId: string, productId: string) => {
    setSlots((prev) => prev.map((s) => (s.slotId === slotId ? { ...s, productId } : s)));
    setBump(slotId);
    setTimeout(() => setBump(null), 420);
  };

  // greedy repair: for each slot, try every alternate, keep the swap that most improves the score.
  const fixItForMe = () => {
    let cur = slots;
    let best = scoreComposition(cur.map((s) => scorable(byId.get(s.productId)!, s.slotId)), brief).score;
    for (const s of cur) {
      const alts = catalog.filter((p) => p.slotRoles.includes(s.slotId));
      for (const alt of alts) {
        const trial = cur.map((x) => (x.slotId === s.slotId ? { ...x, productId: alt.id } : x));
        const score = scoreComposition(trial.map((t) => scorable(byId.get(t.productId)!, t.slotId)), brief).score;
        if (score > best + 0.1) { best = score; cur = trial; }
      }
    }
    setSlots(cur);
    setBump("all");
    setTimeout(() => setBump(null), 500);
  };

  return (
    <div className="builder">
      <header className="bld-head">
        <div>
          <span className="eyebrow">The builder · live coherence</span>
          <h1 className="serif">{title}</h1>
        </div>
        <button className="fix" onClick={fixItForMe}>✦ Fix it for me</button>
      </header>

      <div className="bld-grid">
        {/* stage */}
        <section className="stage" aria-label="Composition">
          <div className="stage-items">
            {items.map((p, i) => {
              const slot = slots[i];
              const offer = resolveBestOffer(p);
              return (
                <button
                  key={slot.slotId}
                  className={"tile" + (activeSlot === slot.slotId ? " on" : "") + (bump === slot.slotId || bump === "all" ? " bump" : "")}
                  onClick={() => setActiveSlot(slot.slotId)}
                >
                  <span className="tile-sw" style={{ background: p.styling.color.primaryHex }}>
                    {p.imageUrls?.[0]?.startsWith("http") && /* eslint-disable-next-line @next/next/no-img-element */ (
                      <img src={p.imageUrls[0]} alt="" loading="lazy" />
                    )}
                  </span>
                  <span className="tile-meta">
                    <span className="eyebrow">{titleCase(slot.slotId)}</span>
                    <span className="tile-brand">{p.brand}</span>
                    <span className="tile-title">{p.title}</span>
                    <span className="mono tile-price">{fmtCents(offer?.priceSnapshot ?? null)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="stage-foot">
            <span className="mono stage-total">{fmtCents(total)} <i>total</i></span>
            <span className="eyebrow">{result.scheme}</span>
          </div>
        </section>

        {/* right rail: meter + swap tray */}
        <aside className="rail">
          <div className="rail-meter">
            <CoherenceMeter score={result.score} tip={tip} />
            {result.passed ? (
              <span className="pass ok">✓ Publishable</span>
            ) : (
              <span className="pass no">Below threshold (72)</span>
            )}
          </div>

          <div className="tray">
            <span className="eyebrow tray-head">Swap {titleCase(activeSlot)}</span>
            <div className="tray-items">
              {(alternates.get(activeSlot) ?? []).slice(0, 10).map((p) => {
                const trial = slots.map((x) => (x.slotId === activeSlot ? { ...x, productId: p.id } : x));
                const trialScore = scoreComposition(trial.map((t) => scorable(byId.get(t.productId)!, t.slotId)), brief).score;
                const cur = byId.get(slots.find((s) => s.slotId === activeSlot)!.productId)!;
                const delta = Math.round((trialScore - result.score) * 10) / 10;
                return (
                  <button key={p.id} className={"swatch-card" + (p.id === cur.id ? " current" : "")} onClick={() => swap(activeSlot, p.id)}>
                    <span className="sc-sw" style={{ background: p.styling.color.primaryHex }}>
                      {p.imageUrls?.[0]?.startsWith("http") && /* eslint-disable-next-line @next/next/no-img-element */ (
                        <img src={p.imageUrls[0]} alt="" loading="lazy" />
                      )}
                    </span>
                    <span className="sc-meta">
                      <span className="sc-brand">{p.brand}</span>
                      <span className="sc-title">{p.title}</span>
                    </span>
                    <span className={"sc-delta" + (delta > 0 ? " up" : delta < 0 ? " down" : "")}>
                      {p.id === cur.id ? "current" : delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "±0"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* shop the build */}
      <section className="shop">
        <p className="disclosure">{FTC_DISCLOSURE}</p>
        <ul className="shop-rows">
          {items.map((p, i) => (
            <li key={slots[i].slotId}>
              <span className="sr-sw" style={{ background: p.styling.color.primaryHex }}>
                {p.imageUrls?.[0]?.startsWith("http") && /* eslint-disable-next-line @next/next/no-img-element */ (
                  <img src={p.imageUrls[0]} alt="" loading="lazy" />
                )}
              </span>
              <span className="sr-name">{p.brand} · {p.title}</span>
              <span className="mono sr-price">{fmtCents(resolveBestOffer(p)?.priceSnapshot ?? null)}</span>
              <AffiliateCTA offer={resolveBestOffer(p)} brand={p.brand} productId={p.id} />
            </li>
          ))}
        </ul>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .builder{ max-width:1240px; margin:0 auto; padding:34px 24px 0; }
        .bld-head{ display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; }
        .bld-head h1{ font-weight:400; font-size:clamp(1.6rem,2.6vw,2.4rem); letter-spacing:-.01em; margin:6px 0 0; }
        .fix{ background:none; border:1px solid var(--accent); color:var(--accent-soft); padding:11px 18px;
          border-radius:999px; font-size:13.5px; cursor:pointer; transition:.2s; }
        .fix:hover{ background:var(--accent); color:var(--accent-ink); }
        .bld-grid{ display:grid; grid-template-columns:1.4fr 1fr; gap:24px; margin-top:24px; }
        .stage{ background:var(--surface); border:1px solid var(--line); border-radius:var(--r-lg); padding:18px; }
        .stage-items{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        .tile{ display:flex; gap:12px; text-align:left; background:var(--bg); border:1px solid var(--line);
          border-radius:var(--r-md); padding:12px; cursor:pointer; transition:.2s; align-items:center; }
        .tile:hover{ border-color:var(--ink-mute); }
        .tile.on{ border-color:var(--accent); }
        .tile.bump{ animation:tilebump .42s var(--ease-out); }
        @keyframes tilebump{ 0%{transform:scale(.96)} 60%{transform:scale(1.03)} 100%{transform:scale(1)} }
        .tile-sw{ width:42px; height:54px; border-radius:7px; flex:none; overflow:hidden; position:relative; }
        .tile-sw img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .tile-meta{ display:flex; flex-direction:column; gap:1px; min-width:0; }
        .tile-brand{ font-size:13px; color:var(--ink-soft); }
        .tile-title{ font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .tile-price{ font-size:12.5px; margin-top:3px; }
        .stage-foot{ display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:14px; border-top:1px solid var(--line); }
        .stage-total{ font-size:16px; } .stage-total i{ font-style:normal; color:var(--ink-mute); font-size:12px; }

        .rail{ display:flex; flex-direction:column; gap:18px; }
        .rail-meter{ background:var(--surface); border:1px solid var(--line); border-radius:var(--r-lg); padding:18px; }
        .pass{ display:inline-block; margin-top:12px; font-size:12px; }
        .pass.ok{ color:var(--positive); } .pass.no{ color:var(--warning); }
        .tray{ background:var(--surface); border:1px solid var(--line); border-radius:var(--r-lg); padding:18px; }
        .tray-head{ display:block; margin-bottom:12px; }
        .tray-items{ display:flex; flex-direction:column; gap:8px; max-height:380px; overflow:auto; }
        .swatch-card{ display:grid; grid-template-columns:36px 1fr auto; gap:11px; align-items:center;
          background:var(--bg); border:1px solid var(--line); border-radius:var(--r-md); padding:9px; cursor:pointer; text-align:left; transition:.15s; }
        .swatch-card:hover{ border-color:var(--ink-mute); }
        .swatch-card.current{ border-color:var(--accent); }
        .sc-sw{ width:36px; height:44px; border-radius:6px; flex:none; overflow:hidden; position:relative; }
        .sc-sw img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .sc-meta{ display:flex; flex-direction:column; min-width:0; }
        .sc-brand{ font-size:12.5px; color:var(--ink-soft); }
        .sc-title{ font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sc-delta{ font-family:var(--mono); font-size:12px; color:var(--ink-mute); }
        .sc-delta.up{ color:var(--positive); } .sc-delta.down{ color:var(--danger); }

        .shop{ max-width:760px; margin:46px auto 0; }
        .disclosure{ font-size:12px; color:var(--ink-mute); line-height:1.5; padding:12px 14px; border:1px solid var(--line); border-radius:10px; margin:0 0 14px; }
        .shop-rows{ list-style:none; margin:0; padding:0; }
        .shop-rows li{ display:grid; grid-template-columns:34px 1fr auto auto; gap:14px; align-items:center; padding:12px 4px; }
        .shop-rows li + li{ border-top:1px solid var(--line); }
        .sr-sw{ width:34px; height:42px; border-radius:6px; flex:none; overflow:hidden; position:relative; }
        .sr-sw img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .sr-name{ font-size:14px; } .sr-price{ font-size:13.5px; }
        @media (max-width:900px){ .bld-grid{ grid-template-columns:1fr; } .stage-items{ grid-template-columns:1fr; } }
      ` }} />
    </div>
  );
}
