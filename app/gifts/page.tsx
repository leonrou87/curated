import type { Metadata } from "next";
import Link from "next/link";
import { getSearchProducts, getBundleBySlug } from "@/lib/data";
import { GIFT_GUIDES, GIFT_KITS } from "@/lib/gifts";

export const metadata: Metadata = {
  title: "Gift Guides",
  description: "Curated gift guides — Under $100, For Her, For Him, The Jewelry Edit, and the kits worth giving.",
};

export default function GiftsPage() {
  const products = getSearchProducts();
  const guides = GIFT_GUIDES.map((g) => {
    const matched = products.filter((p) => g.match!(p));
    const cover = matched.find((p) => p.image);
    return { g, cover, count: matched.length };
  }).filter((x) => x.cover && x.count >= 4);

  const kits = GIFT_KITS.map((k) => {
    const b = getBundleBySlug(k.slug);
    const img = b?.items.find((i) => i.image)?.image;
    return { k, img, total: b ? `${b.items.length} pieces` : "" };
  }).filter((x) => x.img);

  return (
    <div className="gifts">
      <header className="gf-head">
        <span className="eyebrow">The Gift Guides</span>
        <h1 className="serif">Gifts</h1>
        <p className="gf-blurb">Sorted by budget and by who you’re shopping for — real, in-stock pieces, all one tap to buy.</p>
      </header>

      <div className="gf-grid">
        {guides.map(({ g, cover, count }) => (
          <Link key={g.slug} href={`/gifts/${g.slug}`} className="gf-card">
            <div className="gf-img" style={{ background: "#1a1815" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover!.image!} alt="" loading="lazy" />
            </div>
            <div className="gf-overlay" style={{ borderColor: g.accent }}>
              <span className="eyebrow">{g.kicker} · {count}</span>
              <span className="serif gf-name">{g.title}</span>
            </div>
          </Link>
        ))}
      </div>

      <header className="gf-sub"><hr className="rule" /><span className="eyebrow">Gift a whole setup</span><hr className="rule" /></header>
      <div className="gf-grid kits">
        {kits.map(({ k, img, total }) => (
          <Link key={k.slug} href={`/kits/${k.slug}`} className="gf-card">
            <div className="gf-img" style={{ background: "#1a1815" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img!} alt="" loading="lazy" />
            </div>
            <div className="gf-overlay" style={{ borderColor: k.accent }}>
              <span className="eyebrow">{k.kicker} · {total}</span>
              <span className="serif gf-name">{k.title}</span>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .gifts{ max-width:1240px; margin:0 auto; padding:36px 24px 0; }
        .gf-head h1{ font-weight:400; font-style:italic; font-size:clamp(2rem,3.8vw,3.4rem); letter-spacing:-.02em; margin:8px 0 0; }
        .gf-blurb{ color:var(--ink-soft); max-width:60ch; margin:10px 0 0; }
        .gf-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:28px; }
        .gf-grid.kits{ grid-template-columns:repeat(4,1fr); }
        .gf-card{ position:relative; aspect-ratio:4/5; overflow:hidden; }
        .gf-grid.kits .gf-card{ aspect-ratio:1/1; }
        .gf-img{ position:absolute; inset:0; }
        .gf-img img{ width:100%; height:100%; object-fit:cover; transition:transform .6s var(--ease-out); }
        .gf-card:hover .gf-img img{ transform:scale(1.05); }
        .gf-overlay{ position:absolute; left:0; right:0; bottom:0; z-index:3; padding:20px;
          background:linear-gradient(transparent, rgba(16,15,13,.8)); border-bottom:3px solid var(--accent); }
        .gf-overlay .eyebrow{ color:var(--ink-soft); }
        .gf-name{ display:block; font-style:italic; font-size:1.6rem; line-height:1.0; margin-top:6px; }
        .gf-sub{ display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:16px; margin:var(--s-9) 0 0; }
        @media (max-width:860px){ .gf-grid, .gf-grid.kits{ grid-template-columns:repeat(2,1fr); } }
      ` }} />
    </div>
  );
}
