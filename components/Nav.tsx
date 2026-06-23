"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGender, type Gender } from "@/lib/useGender";
import { useCart } from "@/lib/useCart";

const LINKS = [
  { href: "/", label: "Feed" },
  { href: "/quiz", label: "Quiz" },
  { href: "/style", label: "Style" },
  { href: "/looks", label: "Looks" },
  { href: "/collections", label: "Edits" },
  { href: "/trends", label: "Trends" },
  { href: "/kits", label: "Kits" },
];

export function Nav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [saved, setSaved] = useState(0);
  const { gender, setGender } = useGender();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  const { items: cart } = useCart();

  useEffect(() => {
    const stored = (localStorage.getItem("curated-theme") as "dark" | "light") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
    const refresh = () => setSaved(JSON.parse(localStorage.getItem("curated-saved") || "[]").length);
    refresh();
    window.addEventListener("curated-saved-change", refresh);
    return () => window.removeEventListener("curated-saved-change", refresh);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("curated-theme", next);
  };

  return (
    <header className="topbar">
      <Link href="/" className="brand">CURATED</Link>
      <div className="gender-seg" role="group" aria-label="Shop by gender">
        {(["women", "men", "all"] as Gender[]).map((g) => (
          <button key={g} className={gender === g ? "on" : ""} onClick={() => setGender(g)} aria-pressed={gender === g}>
            {g === "all" ? "All" : g === "women" ? "Women" : "Men"}
          </button>
        ))}
      </div>
      <form
        className="nav-search"
        onSubmit={(e) => { e.preventDefault(); router.push(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" />
      </form>
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={active ? "active" : ""}>{l.label}</Link>
          );
        })}
      </nav>
      <div className="nav-icons">
        <Link href="/search" className="nav-search-m" aria-label="Search">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        </Link>
        <Link href="/saved" className="closet" aria-label={`Closet, ${saved} saved`}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.8 5.5 5 5c2-.3 3.4.9 4.2 2 .8 1 1.8 1 2.6 0C12.6 5.9 14 4.7 16 5c3.2.5 4.4 4 3 6.8C19.5 16.4 12 21 12 21z" />
          </svg>
          {saved > 0 && <i className="closet-dot" />}
        </Link>
        <Link href="/cart" className="cart" aria-label={`Bag, ${cart.length} items`}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
        </Link>
        <button className="theme-btn" onClick={toggle} aria-label="Toggle theme">{theme === "dark" ? "☀" : "☾"}</button>
        <button className="menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" aria-expanded={menuOpen}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
      {menuOpen && (
        <nav className="nav-sheet" aria-label="Mobile">
          {LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .topbar{ position:sticky; top:0; z-index:40; display:flex; gap:10px;
          align-items:center; padding:13px 26px; background:color-mix(in srgb, var(--bg) 86%, transparent);
          backdrop-filter:blur(16px) saturate(1.2); border-bottom:1px solid var(--line); }
        .brand{ font-family:var(--mono); font-size:13px; letter-spacing:.42em; flex:none; padding-right:4px; }
        .nav-search{ display:flex; align-items:center; gap:8px; background:var(--surface); border:1px solid var(--line);
          border-radius:999px; padding:7px 14px; color:var(--ink-mute); width:200px; margin-left:8px; }
        .nav-search:focus-within{ border-color:var(--accent); }
        .nav-search input{ flex:1; min-width:0; background:none; border:none; outline:none; color:var(--ink); font-size:13px; font-family:var(--sans); }
        .nav-search input::placeholder{ color:var(--ink-mute); }
        @media (max-width:980px){ .nav-search{ width:150px; } }
        @media (max-width:860px){ .nav-search{ display:none; } }
        .gender-seg{ display:inline-flex; gap:1px; background:var(--surface); border:1px solid var(--line); border-radius:999px; padding:2px; margin-left:18px; }
        .gender-seg button{ font-family:var(--sans); font-size:12px; color:var(--ink-soft); background:none; border:none; padding:5px 13px; border-radius:999px; cursor:pointer; transition:.18s; letter-spacing:.02em; }
        .gender-seg button:hover{ color:var(--ink); }
        .gender-seg button.on{ background:var(--ink); color:var(--bg); }
        @media (max-width:680px){ .gender-seg{ margin-left:8px; } .gender-seg button{ padding:5px 10px; } }
        .nav-links{ display:flex; gap:20px; align-items:center; margin-left:auto;
          font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-soft); }
        .nav-links a{ cursor:pointer; transition:color .2s; position:relative; }
        .nav-links a:hover, .nav-links a.active{ color:var(--ink); }
        .nav-links a.active::after{ content:""; position:absolute; left:0; right:0; bottom:-17px; height:2px; background:var(--accent); }
        .nav-icons{ display:flex; gap:16px; align-items:center; margin-left:18px; }
        .menu-btn{ display:none; background:none; border:none; color:var(--ink); font-size:18px; cursor:pointer; line-height:1; padding:2px 4px; }
        .nav-sheet{ position:fixed; top:53px; left:0; right:0; z-index:39; background:var(--bg); border-bottom:1px solid var(--line);
          display:flex; flex-direction:column; padding:8px 26px 18px; font-family:var(--mono); font-size:13px; letter-spacing:.12em; text-transform:uppercase; }
        .nav-sheet a{ padding:13px 0; border-bottom:1px solid var(--line-soft); color:var(--ink-soft); }
        .nav-sheet a:last-child{ border-bottom:none; }
        .nav-sheet a:active{ color:var(--ink); }
        @media (max-width:860px){
          .nav-links{ display:none; }
          .menu-btn{ display:block; }
          .nav-icons{ margin-left:auto; }
        }
        .nav-search-m{ display:none; color:var(--ink-soft); padding:2px; }
        .nav-search-m:hover{ color:var(--ink); }
        @media (max-width:860px){ .nav-search-m{ display:inline-flex; } }
        .closet{ position:relative; color:var(--ink-soft); display:inline-flex; padding:2px; }
        .closet:hover{ color:var(--ink); }
        .closet-dot{ position:absolute; top:-1px; right:-1px; width:6px; height:6px; border-radius:50%; background:var(--accent); }
        .cart{ position:relative; color:var(--ink-soft); display:inline-flex; padding:2px; }
        .cart:hover{ color:var(--ink); }
        .cart-badge{ position:absolute; top:-7px; right:-9px; min-width:15px; height:15px; padding:0 4px; border-radius:999px;
          background:var(--accent); color:var(--accent-ink); font-family:var(--mono); font-size:9px; display:grid; place-items:center; }
        .theme-btn{ background:none; border:1px solid var(--line); color:var(--ink-soft); width:30px; height:30px;
          border-radius:999px; cursor:pointer; font-size:13px; display:grid; place-items:center; }
        .theme-btn:hover{ color:var(--ink); border-color:var(--ink-mute); }
      ` }} />
    </header>
  );
}
