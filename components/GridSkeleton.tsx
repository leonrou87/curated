// Server-rendered placeholder for browse/grid routes — shows instantly while data streams in.
export function GridSkeleton({ count = 12, label = "Loading looks" }: { count?: number; label?: string }) {
  return (
    <div className="skq" aria-busy="true" aria-label={label}>
      <div className="skq-head">
        <span className="sk sk-eyebrow" />
        <span className="sk sk-title" />
      </div>
      <div className="skq-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div className="skq-card" key={i}>
            <span className="sk sk-img" />
            <span className="sk sk-line w70" />
            <span className="sk sk-line w40" />
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .skq{ max-width:1240px; margin:0 auto; padding:40px 24px 0; }
        .skq-head{ display:flex; flex-direction:column; gap:12px; margin-bottom:30px; }
        .skq-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:20px; }
        .skq-card{ display:flex; flex-direction:column; gap:9px; }
        .sk{ display:block; background:var(--surface-2); border-radius:2px; position:relative; overflow:hidden; }
        .sk::after{ content:""; position:absolute; inset:0; transform:translateX(-100%);
          background:linear-gradient(90deg, transparent, color-mix(in srgb, var(--ink) 6%, transparent), transparent);
          animation:shimmer 1.4s infinite; }
        @keyframes shimmer{ 100%{ transform:translateX(100%); } }
        .sk-eyebrow{ height:11px; width:120px; } .sk-title{ height:34px; width:min(360px,70%); }
        .sk-img{ aspect-ratio:4/5; width:100%; } .sk-line{ height:12px; } .w70{ width:70%; } .w40{ width:40%; }
        @media (prefers-reduced-motion: reduce){ .sk::after{ animation:none; } }
      ` }} />
    </div>
  );
}
