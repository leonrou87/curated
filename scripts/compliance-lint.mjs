#!/usr/bin/env node
// compliance-lint — fails the build on a non-compliant outbound link.
// Rule (from DECISIONS.md §5 / README §3): every outbound shopping <a> must carry
// rel="sponsored nofollow" and target="_blank". We allow exactly one sanctioned component
// (AffiliateCTA) to render outbound links, and assert it hardcodes the required attrs.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const exts = new Set([".tsx", ".ts", ".jsx", ".js"]);
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (["node_modules", ".next", ".git"].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(p.slice(p.lastIndexOf(".")))) files.push(p);
  }
})(ROOT);

const violations = [];

// 1) the sanctioned attrs (source of truth) must require the compliant rel + new tab
const offers = readFileSync(join(ROOT, "lib/offers.ts"), "utf8");
if (!/rel:\s*["'`]sponsored nofollow["'`]/.test(offers) || !/target:\s*["'`]_blank["'`]/.test(offers)) {
  violations.push("lib/offers.ts AFFILIATE_LINK_ATTRS must set rel='sponsored nofollow' + target='_blank'.");
}
// ...and the CTA must consume them
const cta = readFileSync(join(ROOT, "components/AffiliateCTA.tsx"), "utf8");
if (!/AFFILIATE_LINK_ATTRS\.rel/.test(cta) || !/AFFILIATE_LINK_ATTRS\.target/.test(cta)) {
  violations.push("AffiliateCTA.tsx must apply AFFILIATE_LINK_ATTRS.rel + AFFILIATE_LINK_ATTRS.target.");
}

// 2) no other component may render a bare external <a href="http..."> without the attrs
const httpAnchor = /<a\b[^>]*href=["'`]https?:\/\//gi;
for (const f of files) {
  if (f.endsWith("AffiliateCTA.tsx")) continue;
  const src = readFileSync(f, "utf8");
  let m;
  while ((m = httpAnchor.exec(src))) {
    const tag = src.slice(m.index, src.indexOf(">", m.index) + 1);
    if (!/sponsored/.test(tag) || !/nofollow/.test(tag) || !/_blank/.test(tag)) {
      // ignore non-shopping links (e.g. fonts) — only flag those that look like merchant/affiliate URLs
      if (/affiliate|sovrn|amazon|shareasale|impact|go\.|merchant|shop/i.test(tag)) {
        violations.push(`${f.replace(ROOT + "/", "")}: outbound link missing rel="sponsored nofollow" target="_blank".`);
      }
    }
  }
}

if (violations.length) {
  console.error("✗ Compliance lint failed:\n" + violations.map((v) => "  - " + v).join("\n"));
  process.exit(1);
}
console.log("✓ Compliance lint passed — all outbound affiliate links carry rel=\"sponsored nofollow\" + new tab.");
