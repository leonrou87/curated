import Link from "next/link";
import { readConfig, liveNetworks, hasId } from "@/lib/affiliate-config";
import { getAllBundles, getAllProducts, SEED_META } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const cfg = await readConfig();
  const live = liveNetworks(cfg);
  const bundles = getAllBundles();
  const products = getAllProducts();
  const offers = products.flatMap((p) => p.offers);

  const checklist = [
    { label: "Pick a brand name + domain (no “Amazon” in it)", done: !!cfg.site.url, href: "/admin/networks" },
    { label: "Connect Sovrn / Skimlinks (instant monetization)", done: hasId("sovrn", cfg.networks.sovrn), href: "/admin/networks" },
    { label: "Add your Amazon Associates tag (start the 3-sale clock)", done: hasId("amazon", cfg.networks.amazon), href: "/admin/networks" },
    { label: "Add analytics (GA4 or Plausible) for click tracking", done: !!(cfg.analytics.ga4 || cfg.analytics.plausibleDomain), href: "/admin/networks" },
    { label: "Run a link-health check on the catalog", done: false, href: "/admin/health" },
    { label: "Replace placeholder imagery with licensed photos", done: false, href: "#" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="adm">
      <header className="adm-head">
        <span className="eyebrow">Admin · control room</span>
        <h1 className="serif">Make it earn.</h1>
        <p className="adm-sub">Wire up affiliate networks, manage links, gate content, and keep links healthy. The site already runs and is fully compliant — this is where you turn on revenue.</p>
      </header>

      <div className="stat-row">
        <Stat n={products.length} label="Products" />
        <Stat n={offers.length} label="Offers" />
        <Stat n={bundles.length} label="Published bundles" />
        <Stat n={live.length} label="Live networks" accent={live.length === 0} />
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="serif">Go-live checklist</h2>
          <span className="mono">{doneCount}/{checklist.length}</span>
        </div>
        <ul className="check">
          {checklist.map((c) => (
            <li key={c.label} className={c.done ? "ok" : ""}>
              <span className="cb">{c.done ? "✓" : ""}</span>
              <Link href={c.href}>{c.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid2">
        <section className="card">
          <h2 className="serif">Affiliate networks</h2>
          <ul className="netlist">
            {Object.entries(cfg.networks).map(([k, n]) => (
              <li key={k}>
                <span className={"dot " + (n.enabled && hasId(k, n) ? "live" : n.enabled ? "pending" : "off")} />
                <span className="net-label">{n.label}</span>
                <span className="net-state mono">{n.enabled && hasId(k, n) ? "live" : n.enabled ? "needs ID" : "off"}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/networks" className="card-cta">Configure networks →</Link>
        </section>

        <section className="card">
          <h2 className="serif">Quick actions</h2>
          <div className="qa">
            <Link href="/admin/links" className="qa-item">Link manager <i>Override any product’s offer, paste a direct link</i></Link>
            <Link href="/admin/approvals" className="qa-item">Approval queue <i>Quality gate before anything goes public</i></Link>
            <Link href="/admin/health" className="qa-item">Link health <i>Find dead links that silently kill revenue</i></Link>
          </div>
        </section>
      </div>

      <p className="adm-foot">
        {SEED_META?.counts?.products} products / {SEED_META?.counts?.bundles} bundles seeded.
        Full step-by-step program setup is in <code>AFFILIATE-SETUP.md</code> and <code>docs/NEXT_STEPS.md</code>.
      </p>

      <style>{`
        .adm-head h1{ font-weight:400; font-size:clamp(1.8rem,3vw,2.6rem); letter-spacing:-.02em; margin:6px 0 0; }
        .adm-sub{ color:var(--ink-soft); max-width:64ch; margin:10px 0 0; }
        .stat-row{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin:26px 0; }
        .card{ background:var(--surface); border:1px solid var(--line); border-radius:var(--r-lg); padding:20px; margin-top:18px; }
        .card-head{ display:flex; justify-content:space-between; align-items:baseline; }
        .card h2{ font-weight:400; font-size:1.25rem; margin:0 0 14px; }
        .check{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:2px; }
        .check li{ display:flex; align-items:center; gap:12px; padding:9px 0; border-top:1px solid var(--line); font-size:14px; color:var(--ink-soft); }
        .check li:first-child{ border-top:none; }
        .check li.ok a{ color:var(--ink); }
        .check a:hover{ color:var(--ink); }
        .cb{ width:20px; height:20px; border-radius:6px; border:1px solid var(--line); display:grid; place-items:center; font-size:12px; color:var(--positive); flex:none; }
        .check li.ok .cb{ border-color:var(--positive); }
        .grid2{ display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .grid2 .card{ margin-top:0; }
        .netlist{ list-style:none; margin:0 0 14px; padding:0; }
        .netlist li{ display:flex; align-items:center; gap:10px; padding:8px 0; font-size:13.5px; }
        .netlist li + li{ border-top:1px solid var(--line); }
        .dot{ width:8px; height:8px; border-radius:50%; flex:none; }
        .dot.live{ background:var(--positive); } .dot.pending{ background:var(--warning); } .dot.off{ background:var(--ink-mute); }
        .net-label{ flex:1; color:var(--ink-soft); } .net-state{ font-size:11px; color:var(--ink-mute); }
        .card-cta{ font-size:13px; color:var(--accent-soft); }
        .qa{ display:flex; flex-direction:column; gap:8px; }
        .qa-item{ display:flex; flex-direction:column; gap:2px; padding:12px 14px; border:1px solid var(--line); border-radius:var(--r-md); font-size:14px; transition:.15s; }
        .qa-item:hover{ border-color:var(--ink-mute); }
        .qa-item i{ font-style:normal; font-size:12px; color:var(--ink-mute); }
        .adm-foot{ margin-top:24px; font-size:12.5px; color:var(--ink-mute); }
        .adm-foot code{ font-family:var(--mono); font-size:11.5px; background:var(--surface); padding:2px 6px; border-radius:5px; }
        @media (max-width:760px){ .stat-row{ grid-template-columns:repeat(2,1fr); } .grid2{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}

function Stat({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <div className="stat">
      <span className="mono stat-n" style={accent ? { color: "var(--warning)" } : undefined}>{n}</span>
      <span className="stat-l">{label}</span>
      <style>{`
        .stat{ background:var(--surface); border:1px solid var(--line); border-radius:var(--r-md); padding:16px; }
        .stat-n{ font-size:28px; display:block; line-height:1; }
        .stat-l{ font-size:12px; color:var(--ink-mute); }
      `}</style>
    </div>
  );
}
