"use client";
import { scoreColor } from "@/lib/format";

// CoherenceMeter — slim bar, fill animates to score; color danger→warning→positive (0/72/100).
// Reusable on auto-gen looks (subtle) and in the builder (with live tip). aria-live announces.
export function CoherenceMeter({
  score,
  tip,
  compact = false,
}: {
  score: number;
  tip?: string | null;
  compact?: boolean;
}) {
  const color = scoreColor(score);
  return (
    <div className={"meter" + (compact ? " compact" : "")}>
      <div className="meter-head">
        <span className="eyebrow">Coherence</span>
        <span className="meter-score mono" style={{ color }} aria-live="polite">
          {score.toFixed(0)}
        </span>
      </div>
      <div className="meter-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(score)}>
        <div className="meter-fill" style={{ width: `${score}%`, background: color }} />
        <div className="meter-threshold" title="Publish threshold: 72" />
      </div>
      {tip && !compact && <p className="meter-tip">{tip}</p>}
      <style>{`
        .meter{ width:100%; }
        .meter-head{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:7px; }
        .meter-score{ font-size:18px; font-weight:500; }
        .meter.compact .meter-score{ font-size:13px; }
        .meter-track{ position:relative; height:6px; border-radius:999px; background:var(--surface-2); overflow:hidden; }
        .meter.compact .meter-track{ height:4px; }
        .meter-fill{ position:absolute; left:0; top:0; bottom:0; border-radius:999px;
          transition:width .5s var(--ease-out), background .4s ease; }
        .meter-threshold{ position:absolute; left:72%; top:-2px; bottom:-2px; width:1px; background:var(--ink-mute); opacity:.5; }
        .meter-tip{ margin:9px 0 0; font-size:12.5px; color:var(--ink-soft); line-height:1.45; }
      `}</style>
    </div>
  );
}
