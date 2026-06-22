"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/useCart";
import { AFFILIATE_LINK_ATTRS, FTC_DISCLOSURE } from "@/lib/offers";
import { fmtCents } from "@/lib/format";

export function CartView() {
  const { items, remove, setBought, clear, total } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [step, setStep] = useState(0);

  // group by brand (each retailer checks out separately)
  const byBrand = useMemo(() => {
    const m = new Map<string, typeof items>();
    for (const i of items) { if (!m.has(i.brand)) m.set(i.brand, []); m.get(i.brand)!.push(i); }
    return [...m.entries()];
  }, [items]);

  const boughtCount = items.filter((i) => i.bought).length;

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <span className="index">Empty</span>
        <h1 className="serif">Your bag is empty.</h1>
        <p>Add pieces from any look — then check out store by store.</p>
        <Link href="/looks" className="ce-cta">Browse looks ↗</Link>
        <style>{emptyCss}</style>
      </div>
    );
  }

  // ── CHECKOUT: click through item by item ──
  if (checkout) {
    const it = items[step];
    const done = step >= items.length;
    if (done || !it) {
      return (
        <div className="co-done">
          <span className="index">✓</span>
          <h1 className="serif">That’s the bag.</h1>
          <p>You clicked through all {items.length} pieces. Anything you didn’t grab is still saved.</p>
          <div className="co-actions">
            <button className="btn-line" onClick={() => { setCheckout(false); setStep(0); }}>Back to bag</button>
            <Link href="/looks" className="btn-fill">Keep shopping ↗</Link>
          </div>
          <style>{checkoutCss}</style>
        </div>
      );
    }
    return (
      <div className="co">
        <div className="co-top">
          <button className="co-exit" onClick={() => setCheckout(false)}>✕ Exit checkout</button>
          <span className="mono co-prog">{step + 1} / {items.length}</span>
        </div>
        <div className="co-card">
          <div className="co-img" style={{ background: "#1a1815" }}>
            {it.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.image} alt={it.title} />}
          </div>
          <div className="co-meta">
            <span className="eyebrow">{it.brand}</span>
            <h2 className="serif">{it.title}</h2>
            <span className="mono co-price">{fmtCents(it.priceCents)}</span>
            <p className="co-hint">Opens {it.brand} in a new tab to complete your purchase.</p>
            <a className="co-buy" href={it.url} rel={AFFILIATE_LINK_ATTRS.rel} target={AFFILIATE_LINK_ATTRS.target}
              onClick={() => setBought(it.id, true)}>
              Buy at {it.brand} ↗
            </a>
            <div className="co-nav">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
              <button onClick={() => setBought(it.id, !it.bought)} className={it.bought ? "got on" : "got"}>{it.bought ? "✓ Got it" : "Mark bought"}</button>
              <button onClick={() => setStep((s) => s + 1)}>{step === items.length - 1 ? "Finish →" : "Next →"}</button>
            </div>
          </div>
        </div>
        <div className="co-rail">
          {items.map((x, i) => (
            <button key={x.id} className={"cr-dot" + (i === step ? " cur" : "") + (x.bought ? " done" : "")} onClick={() => setStep(i)} aria-label={x.title} />
          ))}
        </div>
        <style>{checkoutCss}</style>
      </div>
    );
  }

  // ── BAG LIST ──
  return (
    <div className="bagpage">
      <header className="cart-head">
        <div>
          <span className="eyebrow">Your Bag</span>
          <h1 className="serif">{items.length} piece{items.length === 1 ? "" : "s"} · {byBrand.length} store{byBrand.length === 1 ? "" : "s"}</h1>
        </div>
        <div className="cart-sum">
          <span className="mono cart-total">{fmtCents(total)}</span>
          <button className="btn-fill" onClick={() => { setCheckout(true); setStep(0); }}>Check out — click through ↗</button>
        </div>
      </header>
      <p className="disclosure">{FTC_DISCLOSURE} Each piece is bought at its own retailer.</p>

      {byBrand.map(([brand, list]) => (
        <section className="cart-store" key={brand}>
          <header className="cs-head">
            <span className="serif cs-brand">{brand}</span>
            <span className="eyebrow">{list.length} item{list.length === 1 ? "" : "s"}</span>
          </header>
          <hr className="rule" />
          <ul className="cs-items">
            {list.map((it) => (
              <li key={it.id} className={"ci" + (it.bought ? " bought" : "")}>
                <span className="ci-img" style={{ background: "#1a1815" }}>
                  {it.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.image} alt={it.title} loading="lazy" />}
                </span>
                <span className="ci-meta">
                  <span className="ci-title">{it.title}</span>
                  <span className="mono ci-price">{fmtCents(it.priceCents)}{it.bought && <i> · bought</i>}</span>
                </span>
                <a className="ci-buy" href={it.url} rel={AFFILIATE_LINK_ATTRS.rel} target={AFFILIATE_LINK_ATTRS.target} onClick={() => setBought(it.id, true)}>Buy ↗</a>
                <button className="ci-rm" onClick={() => remove(it.id)} aria-label="Remove">✕</button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="cart-foot">
        <button className="ghost" onClick={clear}>Clear bag</button>
        {boughtCount > 0 && <span className="eyebrow">{boughtCount} of {items.length} bought</span>}
      </div>
      <style>{listCss}</style>
    </div>
  );
}

const emptyCss = `
  .cart-empty{ max-width:600px; margin:0 auto; padding:90px 24px; text-align:center; }
  .cart-empty h1{ font-weight:400; font-style:italic; font-size:2.4rem; margin:12px 0 10px; }
  .cart-empty p{ color:var(--ink-soft); margin:0 0 22px; }
  .ce-cta{ font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--accent-soft); }
`;
const listCss = `
  .bagpage{ max-width:920px; margin:0 auto; padding:40px 24px 0; }
  .cart-head{ display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap; }
  .cart-head h1{ font-weight:400; font-style:italic; font-size:clamp(1.7rem,3vw,2.6rem); letter-spacing:-.02em; margin:6px 0 0; }
  .cart-sum{ display:flex; align-items:center; gap:18px; }
  .cart-total{ font-size:18px; }
  .btn-fill{ background:var(--accent); color:var(--accent-ink); border:none; padding:14px 24px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; }
  .btn-fill:hover{ background:var(--accent-soft); }
  .disclosure{ font-family:var(--mono); font-size:11px; color:var(--ink-mute); line-height:1.6; padding:12px 14px; border:1px solid var(--line); margin:18px 0 28px; }
  .cart-store{ margin-bottom:34px; }
  .cs-head{ display:flex; justify-content:space-between; align-items:baseline; }
  .cs-brand{ font-style:italic; font-size:1.4rem; }
  .cs-items{ list-style:none; margin:14px 0 0; padding:0; }
  .ci{ display:grid; grid-template-columns:64px 1fr auto auto; gap:16px; align-items:center; padding:12px 0; }
  .ci + .ci{ border-top:1px solid var(--line-soft); }
  .ci.bought{ opacity:.55; }
  .ci-img{ width:64px; height:80px; overflow:hidden; position:relative; }
  .ci-img img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .ci-meta{ display:flex; flex-direction:column; gap:3px; min-width:0; }
  .ci-title{ font-size:15px; }
  .ci-price{ font-size:13px; color:var(--ink-soft); } .ci-price i{ font-style:normal; color:var(--positive); }
  .ci-buy{ font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink); border:1px solid var(--line); padding:10px 16px; }
  .ci-buy:hover{ border-color:var(--accent); color:var(--accent-soft); }
  .ci-rm{ background:none; border:none; color:var(--ink-mute); cursor:pointer; font-size:13px; padding:6px; }
  .ci-rm:hover{ color:var(--danger); }
  .cart-foot{ display:flex; justify-content:space-between; align-items:center; padding:24px 0 60px; border-top:1px solid var(--line); }
  .cart-foot .ghost{ background:none; border:none; color:var(--ink-mute); font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
  .cart-foot .ghost:hover{ color:var(--danger); }
  @media (max-width:560px){ .ci{ grid-template-columns:54px 1fr auto; } .ci-rm{ grid-column:3; } .ci-buy{ grid-column:2 / -1; justify-self:start; } }
`;
const checkoutCss = `
  .co{ max-width:760px; margin:0 auto; padding:24px 24px 0; }
  .co-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
  .co-exit{ background:none; border:none; color:var(--ink-soft); font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
  .co-exit:hover{ color:var(--ink); }
  .co-prog{ color:var(--ink-mute); font-size:13px; }
  .co-card{ display:grid; grid-template-columns:1fr 1fr; gap:30px; align-items:center; border:1px solid var(--line); padding:24px; }
  .co-img{ aspect-ratio:3/4; overflow:hidden; position:relative; }
  .co-img img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .co-meta h2{ font-weight:400; font-style:italic; font-size:1.7rem; line-height:1.1; margin:8px 0 8px; }
  .co-price{ font-size:16px; color:var(--ink-soft); }
  .co-hint{ font-size:13px; color:var(--ink-mute); margin:14px 0 16px; }
  .co-buy{ display:inline-block; background:var(--accent); color:var(--accent-ink); padding:15px 28px; font-family:var(--mono); font-size:12px; letter-spacing:.12em; text-transform:uppercase; }
  .co-buy:hover{ background:var(--accent-soft); }
  .co-nav{ display:flex; gap:10px; margin-top:22px; }
  .co-nav button{ background:none; border:1px solid var(--line); color:var(--ink-soft); padding:11px 16px; font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
  .co-nav button:hover:not(:disabled){ color:var(--ink); border-color:var(--ink-mute); }
  .co-nav button:disabled{ opacity:.4; cursor:default; }
  .co-nav .got.on{ color:var(--positive); border-color:var(--positive); }
  .co-rail{ display:flex; gap:7px; justify-content:center; margin:26px 0; flex-wrap:wrap; }
  .cr-dot{ width:9px; height:9px; border-radius:50%; border:1px solid var(--ink-mute); background:none; cursor:pointer; padding:0; }
  .cr-dot.cur{ border-color:var(--accent); background:var(--accent); }
  .cr-dot.done{ background:var(--positive); border-color:var(--positive); }
  .co-done{ max-width:560px; margin:0 auto; padding:80px 24px; text-align:center; }
  .co-done .index{ font-size:1.4rem; color:var(--positive); }
  .co-done h1{ font-weight:400; font-style:italic; font-size:2.4rem; margin:12px 0 10px; }
  .co-done p{ color:var(--ink-soft); margin:0 0 24px; }
  .co-actions{ display:flex; gap:12px; justify-content:center; }
  .co-done .btn-fill{ background:var(--accent); color:var(--accent-ink); padding:14px 24px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; }
  .co-done .btn-line{ background:none; border:1px solid var(--line); color:var(--ink-soft); padding:13px 22px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; }
  @media (max-width:600px){ .co-card{ grid-template-columns:1fr; } }
`;
