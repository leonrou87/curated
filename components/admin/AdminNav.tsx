"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/networks", label: "Affiliate networks" },
  { href: "/admin/links", label: "Link manager" },
  { href: "/admin/approvals", label: "Approval queue" },
  { href: "/admin/health", label: "Link health" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav">
      {ITEMS.map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={"an-item" + (active ? " on" : "")}>{i.label}</Link>
        );
      })}
      <style>{`
        .admin-nav{ display:flex; flex-direction:column; gap:2px; }
        .an-item{ font-size:13.5px; color:var(--ink-soft); padding:9px 12px; border-radius:var(--r-md); transition:.15s; }
        .an-item:hover{ color:var(--ink); background:var(--surface); }
        .an-item.on{ color:var(--ink); background:var(--surface); border:1px solid var(--line); }
        @media (max-width:760px){ .admin-nav{ flex-direction:row; flex-wrap:wrap; } }
      `}</style>
    </nav>
  );
}
