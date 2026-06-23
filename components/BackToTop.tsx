"use client";
import { useEffect, useState } from "react";

// Floating "back to top" — appears after the user scrolls past a screen or two.
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 1400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      className="btt"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
      <style dangerouslySetInnerHTML={{ __html: `
        .btt{ position:fixed; right:20px; bottom:20px; z-index:55; width:46px; height:46px; border-radius:50%;
          background:var(--surface); border:1px solid var(--line); color:var(--ink); font-size:18px; cursor:pointer;
          box-shadow:var(--e-2); display:flex; align-items:center; justify-content:center; transition:.2s;
          animation:btt-in .25s var(--ease-out); }
        .btt:hover{ border-color:var(--accent); color:var(--accent-soft); transform:translateY(-2px); }
        @keyframes btt-in{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }
        @media (prefers-reduced-motion: reduce){ .btt{ animation:none; } }
        @media (max-width:560px){ .btt{ right:14px; bottom:78px; } }
      ` }} />
    </button>
  );
}
