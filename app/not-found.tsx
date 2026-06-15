import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "90px 24px", textAlign: "center" }}>
      <span className="eyebrow">404</span>
      <h1 className="serif" style={{ fontWeight: 400, fontSize: "2.4rem", margin: "10px 0 16px" }}>That look got away.</h1>
      <p style={{ color: "var(--ink-soft)" }}>The page you were after isn’t here.</p>
      <p style={{ marginTop: 20 }}><Link href="/" style={{ color: "var(--accent-soft)" }}>← Back to the feed</Link></p>
    </div>
  );
}
