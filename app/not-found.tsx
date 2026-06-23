import Link from "next/link";

const DESTS = [
  { href: "/looks", label: "The Feed", note: "Every look, fresh" },
  { href: "/style", label: "Style Me", note: "Tell us the occasion" },
  { href: "/collections", label: "Collections", note: "Edits by theme" },
  { href: "/quiz", label: "Style Quiz", note: "Find your aesthetic" },
];

export default function NotFound() {
  return (
    <div className="nf">
      <span className="eyebrow">Error 404</span>
      <h1 className="serif">That look got away.</h1>
      <p className="nf-sub">The page you were after isn’t here — but there’s plenty more worth a scroll.</p>
      <div className="nf-grid">
        {DESTS.map((d) => (
          <Link key={d.href} href={d.href} className="nf-card">
            <span className="serif nf-label">{d.label}</span>
            <span className="nf-note">{d.note}</span>
            <span className="nf-arrow">→</span>
          </Link>
        ))}
      </div>
      <p className="nf-back"><Link href="/">← Back to the feed</Link></p>
      <style dangerouslySetInnerHTML={{ __html: `
        .nf{ max-width:760px; margin:0 auto; padding:80px 24px 0; text-align:center; }
        .nf h1{ font-weight:400; font-style:italic; font-size:clamp(2.2rem,5vw,3.4rem); letter-spacing:-.02em; margin:10px 0 14px; }
        .nf-sub{ color:var(--ink-soft); max-width:48ch; margin:0 auto; line-height:1.6; }
        .nf-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin:38px 0 30px; text-align:left; }
        .nf-card{ position:relative; border:1px solid var(--line); padding:20px 22px; background:var(--surface); transition:.2s; }
        .nf-card:hover{ border-color:var(--accent); transform:translateY(-2px); }
        .nf-label{ display:block; font-style:italic; font-size:1.4rem; }
        .nf-note{ display:block; color:var(--ink-mute); font-size:13px; margin-top:3px; }
        .nf-arrow{ position:absolute; top:20px; right:22px; color:var(--accent-soft); }
        .nf-back a{ color:var(--accent-soft); }
        @media (max-width:540px){ .nf-grid{ grid-template-columns:1fr; } }
      ` }} />
    </div>
  );
}
