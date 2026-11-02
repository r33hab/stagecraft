#!/usr/bin/env node
/**
 * Watch a page the way a visitor meets it, and keep the evidence.
 *
 *   node <skill>/scripts/frames.mjs http://localhost:4321/ [--out .stagecraft/frames] [--speed 500] [--max 90] [--intro 5] [--mobile]
 *
 * Opens the page in Chromium on the real GPU, records the intro, then scrolls at a steady reading pace
 * (500 px/s by default) while recording at 10 fps and sampling every large text block. Writes:
 *   sheets/*.jpg      contact sheets (4 columns; intro 0.2 s apart, scroll 0.3 s apart), needs ffmpeg
 *   frames/           the single frames, frames.csv maps each to time and scroll position
 *   timeline.md       when each block becomes readable, how long it holds, how it leaves
 *   verdict.md        the reading rules: copy gone before it held, never readable, empty screens
 * Look at every sheet before calling a site done; open single frames at full size around each transition.
 * Run from the project folder so Playwright resolves (`npm i -D @playwright/test`).
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const url = args.find((a) => /^https?:/.test(a));
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
if (!url) { console.error('usage: frames.mjs <url> [--out dir] [--speed px/s] [--max s] [--intro s] [--mobile]'); process.exit(1); }
const req = createRequire(path.join(process.cwd(), 'noop.js'));
let pw; try { pw = req('playwright'); } catch { pw = req('@playwright/test'); }
const OUT = path.resolve(opt('out', '.stagecraft/frames'));
const SPEED = +opt('speed', 500), MAX = +opt('max', 90) * 1000, INTRO = +opt('intro', 5) * 1000, MOBILE = args.includes('--mobile');
const MIN_HOLD = +opt('min-hold', 0.6);
rmSync(OUT, { recursive: true, force: true });
for (const d of ['frames', 'sheets']) mkdirSync(path.join(OUT, d), { recursive: true });

const SAMPLER = () => {
  const S = (window.__frames = { wheel: 0, rows: [], els: [], t0: performance.now() });
  addEventListener('wheel', (e) => { S.wheel += e.deltaY; }, { capture: true, passive: true });
  const own = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
  const pick = () => {
    for (const el of document.querySelectorAll('h1, h2, h3, h4, p, blockquote, li, span, div, a, figcaption')) {
      if (S.els.length > 220) break;
      if (S.els.includes(el) || el.closest('[aria-hidden="true"]')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (!(/^H[12]$/.test(el.tagName) || (own(el) && fs >= 26) || (el.tagName === 'P' && el.textContent.trim().length > 40))) continue;
      if (S.els.some((p) => p.contains(el))) continue;
      S.els.push(el);
    }
  };
  const op = (el) => { let o = 1, n = el; while (n && n !== document.documentElement) { const cs = getComputedStyle(n); o *= +cs.opacity; if (cs.visibility === 'hidden' || cs.display === 'none') return 0; n = n.parentElement; } return o; };
  let last = 0, k = 0;
  const loop = (now) => {
    if (now - last >= 66) {
      last = now; if (k++ % 15 === 0) pick();
      const vw = innerWidth, vh = innerHeight, row = { t: Math.round(now - S.t0), y: Math.round(scrollY), w: Math.round(S.wheel), e: [] };
      S.els.forEach((el, i) => {
        if (!el.isConnected) return;
        const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
        const f = (Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))) / (r.width * r.height);
        if (f > 0) row.e.push([i, +f.toFixed(2), +op(el).toFixed(2), Math.round(r.left)]);
      });
      S.rows.push(row);
    }
    requestAnimationFrame(loop);
  };
  addEventListener('DOMContentLoaded', () => requestAnimationFrame(loop));
};

const gpu = process.platform === 'darwin' ? ['--use-angle=metal'] : ['--use-gl=angle'];
const browser = await pw.chromium.launch({ channel: 'chromium', args: [...gpu, '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
const ctx = await browser.newContext(MOBILE ? { ...pw.devices['iPhone 13'], deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await ctx.addInitScript(SAMPLER);
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const rows = []; let phase = 'intro', lastKept = 0, n = 0, curY = 0, curW = 0; const t0 = Date.now();
cdp.on('Page.screencastFrame', async (f) => {
  try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {}
  const now = Date.now(); if (now - lastKept < 100) return; lastKept = now;
  const file = `frames/${String(++n).padStart(5, '0')}.jpg`;
  writeFileSync(path.join(OUT, file), Buffer.from(f.data, 'base64'));
  rows.push([file, now - t0, phase, curY, curW]);
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, maxWidth: 1280, maxHeight: 900 });
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(INTRO);
phase = 'scroll';
const vp = page.viewportSize();
await page.mouse.move(vp.width - 3, Math.round(vp.height / 2));
const step = (SPEED * 50) / 1000, start = Date.now(); let still = 0;
while (Date.now() - start < MAX) {
  if (MOBILE) await page.evaluate((s) => window.scrollBy(0, s), step); else await page.mouse.wheel(0, step);
  await page.waitForTimeout(50);
  const [y, w, max] = await page.evaluate(() => [Math.round(scrollY), Math.round(window.__frames.wheel), document.documentElement.scrollHeight - innerHeight]);
  curY = y; curW = w;
  if (max > 50 && y >= max - 2) { if (++still > 30) break; } else still = 0;
}
await page.waitForTimeout(800);
await cdp.send('Page.stopScreencast');
const data = await page.evaluate(() => ({ rows: window.__frames.rows, vh: innerHeight, labels: window.__frames.els.map((e) => ({ tag: e.tagName, fs: Math.round(parseFloat(getComputedStyle(e).fontSize)), txt: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60) })) }));
await browser.close();
writeFileSync(path.join(OUT, 'frames.csv'), 'file,ms,phase,scrollY,wheel\n' + rows.map((r) => r.join(',')).join('\n'));

// contact sheets
const sheets = [];
const ff = (() => { try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
for (const [ph, every] of [['intro', 2], ['scroll', 3]]) {
  const fr = rows.filter((r) => r[2] === ph).filter((_, i) => i % every === 0);
  for (let k = 0; k * 16 < fr.length && ff; k++) {
    const part = fr.slice(k * 16, k * 16 + 16), list = path.join(OUT, 'sheets', '.list.txt'), name = `${ph}-${String(k + 1).padStart(2, '0')}.jpg`;
    writeFileSync(list, part.map((r) => `file '${path.join(OUT, r[0])}'\nduration 1`).join('\n'));
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'scale=480:-1,tile=4x4:padding=6:color=white', '-frames:v', '1', path.join(OUT, 'sheets', name)]);
    sheets.push(`| sheets/${name} | ${(part[0][1] / 1000).toFixed(1)}-${(part.at(-1)[1] / 1000).toFixed(1)} s | scrollY ${part[0][3]}-${part.at(-1)[3]} |`);
    rmSync(list);
  }
}

// timeline and verdict
const virt = Math.max(...data.rows.map((r) => r.y)) < 100, vh = data.vh, pos = (r) => (virt ? r.w : r.y);
const per = {};
for (const r of data.rows) for (const [i, f, o, left] of r.e) (per[i] = per[i] || []).push({ p: pos(r), t: r.t, f, o, left });
const lines = [], early = [], never = [];
for (const [i, arr] of Object.entries(per)) {
  const L = data.labels[i]; if (!L) continue;
  let s = null, first = null, exit = '';
  for (const x of arr) { const ok = x.o >= 0.9 && x.f >= 0.6; if (ok && !first) first = x; if (ok && !s) s = x; if (!ok && s) { exit = x.f >= 0.6 ? 'faded/masked in place' : 'left the view'; break; } }
  const end = s && exit ? arr[arr.indexOf(arr.find((x) => x.t > s.t && !(x.o >= 0.9 && x.f >= 0.6)))] : arr.at(-1);
  const hold = s ? (end.p - s.p) / vh : 0;
  const big = L.fs >= 26 || /^H[12]$/.test(L.tag);
  if (big && s && s.p > 5 && exit && hold < MIN_HOLD) early.push(`"${L.txt}" held ${hold.toFixed(2)} vp, then ${exit} at ${(end.p / vh).toFixed(1)} vp`);
  if (big && !s && (arr.at(-1).p - arr[0].p) / vh >= 1) never.push(`"${L.txt}" in view ${((arr.at(-1).p - arr[0].p) / vh).toFixed(1)} vp, never readable`);
  lines.push([(arr[0].p / vh).toFixed(2), s ? (s.p / vh).toFixed(2) : '-', hold.toFixed(2), s ? `${s.t - arr[0].t}` : 'never', exit || 'still readable', L.fs, L.tag, L.txt.replace(/\|/g, '/')]);
}
lines.sort((a, b) => +a[0] - +b[0]);
const blanks = [];
// a sample with no readable large block and no readable paragraph for > 0.5 s of scroll is worth a look
let b0 = null;
for (const r of data.rows) { const any = r.e.some(([, f, o]) => f >= 0.5 && o >= 0.5); if (!any) b0 = b0 || r; else if (b0) { if (r.t - b0.t > 500) blanks.push(`${r.t - b0.t} ms with no readable copy from ${(pos(b0) / vh).toFixed(1)} vp (check the frames: imagery may carry it)`); b0 = null; } }
writeFileSync(path.join(OUT, 'timeline.md'), `# Timeline (${virt ? 'virtual scroll, wheel px' : 'native scroll'} / viewport, ${SPEED} px/s)\n\n| seen at vp | readable from | hold vp | entry ms | exit | px | tag | text |\n|---|---|---|---|---|---|---|---|\n${lines.map((l) => `| ${l.join(' | ')} |`).join('\n')}\n`);
const verdict = `# Reading verdict\n\n${early.length + never.length ? 'Fix before delivery.' : 'Copy holds.'}\n\n## Gone before it held ${MIN_HOLD} vp (${early.length})\n${early.map((x) => `- ${x}`).join('\n')}\n\n## Never readable (${never.length})\n${never.map((x) => `- ${x}`).join('\n')}\n\n## Stretches without readable copy (${blanks.length})\n${blanks.map((x) => `- ${x}`).join('\n')}\n\n## Sheets\n| sheet | time | scroll |\n|---|---|---|\n${sheets.join('\n')}\n`;
writeFileSync(path.join(OUT, 'verdict.md'), verdict);
console.log(verdict.split('\n## Sheets')[0]);
console.log(`frames: ${rows.length}, sheets: ${sheets.length}${ff ? '' : ' (install ffmpeg for contact sheets)'}, out: ${OUT}`);
