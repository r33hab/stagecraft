#!/usr/bin/env node
/**
 * Read each demo's final suite log and write the measured numbers into src/data/compare.json.
 *
 *   node scripts/compare-metrics.mjs        # from site/, expects demos/<name>/pw-final.log
 *
 * Numbers come from the mobile-low project's perf table for the first route, the axe result for
 * that route, the reduced-motion and cursor checks, and the summary line.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demos = path.resolve(site, '..', 'demos');
const dataPath = path.join(site, 'src', 'data', 'compare.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

function metricsFor(dir) {
  const log = path.join(demos, dir, 'pw-final.log');
  if (!existsSync(log)) { console.warn(`[compare] no log for ${dir}`); return {}; }
  const t = readFileSync(log, 'utf8');
  const m = {};
  const perf = t.match(/\[stagecraft perf\] (\S+) \(mobile-low\)\n([\s\S]*?)\n\n/);
  if (perf) {
    const block = perf[2];
    const num = (label) => { const r = block.match(new RegExp(`${label}\\s+([\\d.]+)`)); return r ? parseFloat(r[1]) : undefined; };
    m.lcpMs = num('LCP \\(ms\\)');
    m.cls = num('CLS');
    const scripts = block.match(/scripts initial \/ lazy\s+(\d+) \/ (\d+) KB/);
    if (scripts) m.scriptKb = parseInt(scripts[1], 10);
    const total = block.match(/total first view\s+(\d+) KB/);
    if (total) m.totalKb = parseInt(total[1], 10);
    const frame = block.match(/frame p50 \/ p95 \(ms\)\s+[\d.]+ \/ ([\d.]+)/);
    if (frame) m.frameP95 = parseFloat(frame[1]);
    const fam = block.match(/families: ([^)]+)\)/);
    if (fam) m.fontFamilies = fam[1].trim() === 'none loaded' ? 0 : fam[1].split(',').filter((f) => !/fallback/i.test(f)).length;
  }
  const firstRoute = (perf && perf[1]) || '/';
  // axe on mobile-low for the first route: count serious/critical ids in its failure block, 0 if it passed
  const axePass = new RegExp(`✓\\s+\\d+ \\[mobile-low\\] › [^\\n]*axe ${firstRoute.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')} `).test(t);
  if (axePass) m.axeSerious = 0;
  else {
    const block = t.match(new RegExp(`\\d+\\) \\[mobile-low\\] › [^\\n]*axe ${firstRoute.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')} [^\\n]*\\n([\\s\\S]*?)(?=\\n\\s+\\d+\\) \\[|\\n\\s+\\d+ failed)`));
    m.axeSerious = block ? (block[1].match(/\((serious|critical)\)/g) || []).length : undefined;
  }
  const summary = t.match(/(\d+) failed[\s\S]*?(\d+) passed|(\d+) passed/);
  if (summary) {
    const failed = summary[1] ? parseInt(summary[1], 10) : 0;
    const passed = parseInt(summary[2] || summary[3], 10);
    m.testsPassed = `${passed} / ${passed + failed}`;
  }
  m.reducedMotion = !/✘\s+\d+ \[reduced-motion\] › [^\n]*reduced motion respected/.test(t);
  m.budgets = /✓\s+\d+ \[mobile-low\] › [^\n]*vitals and weight/.test(t);
  m.cursorTouch = /✘\s+\d+ \[mobile-low\] › [^\n]*custom cursor hidden on touch/.test(t);
  const hosts = t.match(/third-party script hosts \(budget \d+\)/) ? parseInt((t.match(/: (\d+) third-party script hosts/) || [])[1] || '0', 10) : 0;
  m.thirdParty = hosts;
  return m;
}

for (const d of data.demos) {
  d.skill.metrics = metricsFor(d.id);
  d.baseline.metrics = metricsFor(`${d.id}-baseline`);
  console.log(d.id, JSON.stringify(d.skill.metrics), JSON.stringify(d.baseline.metrics));
}
writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log('wrote', dataPath);
