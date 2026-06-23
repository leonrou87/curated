import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/" className="admin-brand">CURATED <span>admin</span></Link>
        <AdminNav />
        <Link href="/" className="admin-back">← Back to site</Link>
      </aside>
      <div className="admin-main">{children}</div>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-shell{ display:grid; grid-template-columns:230px 1fr; min-height:calc(100vh - 56px); }
        .admin-side{ border-right:1px solid var(--line); padding:24px 18px; display:flex; flex-direction:column; gap:6px;
          position:sticky; top:56px; align-self:start; height:calc(100vh - 56px); }
        .admin-brand{ font-family:var(--mono); letter-spacing:.28em; font-size:12px; margin-bottom:18px; }
        .admin-brand span{ color:var(--accent-soft); letter-spacing:.1em; }
        .admin-back{ margin-top:auto; font-size:12.5px; color:var(--ink-mute); }
        .admin-back:hover{ color:var(--ink); }
        .admin-main{ padding:30px 34px 60px; max-width:1100px; }
        @media (max-width:760px){ .admin-shell{ grid-template-columns:1fr; } .admin-side{ position:static; height:auto; flex-direction:row; flex-wrap:wrap; align-items:center; } .admin-back{ margin:0; } }
      ` }} />
    </div>
  );
}
