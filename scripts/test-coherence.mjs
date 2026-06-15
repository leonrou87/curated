// Parity check: re-score every published bundle with the reference scorer and confirm it
// reproduces the stored coherence snapshot. (lib/coherence.ts is a line-for-line TS port.)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { scoreComposition } = require("./scorer.reference.js");
const seed = require("../data/seed-bundles.json");

const byId = Object.fromEntries(seed.products.map((p) => [p.id, p]));
let pass = 0, fail = 0;
for (const b of seed.bundles) {
  if (b.state !== "published") continue;
  const items = b.items.map((it) => {
    const p = byId[it.productId];
    return { id: p.id, brand: p.brand, inStock: p.inStock, slotId: it.slotId, styling: p.styling };
  });
  const res = scoreComposition(items, b.brief || {}, {});
  const stored = b.coherence.score;
  const ok = Math.abs(res.score - stored) < 0.05 && res.passed === b.coherence.passed;
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${b.slug}: recomputed ${res.score} (${res.scheme}) vs stored ${stored}`); }
}
console.log(`\nCoherence parity: ${pass} passed, ${fail} mismatched of ${pass + fail} bundles.`);
process.exit(fail > 0 ? 1 : 0);
