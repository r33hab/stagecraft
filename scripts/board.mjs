#!/usr/bin/env node
/**
 * The reference board: frames from public sites that set the bar, and pairs of your frame next to theirs.
 *
 *   node <skill>/scripts/board.mjs capture <url> [--name site] [--shots 10] [--wait 8] [--step 900] [--out .stagecraft/board]
 *   node <skill>/scripts/board.mjs pair <your frame> <reference frame> [--out .stagecraft/board/pairs/name.png]
 *
 * capture  opens the site in Chromium on the real GPU at 1440 x 900, waits for its intro, then scrolls it
 *          with wheel events (so sites that hijack the scroll still advance) and saves a full-size PNG
 *          per step to <out>/<name>/NN.png, plus index.md listing them.
 * pair     puts two frames side by side at full size, yours on the left, with their file names, so the
 *          difference in material, light and composition is judged on one image. Open it at 100 %.
 *
 * The board is a bar for quality and a source of technique: never copy a layout, an asset or copy.
 * Run from a project folder where Playwright resolves (`npm i -D @playwright/test`).
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const [cmd, ...args] = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const req = createRequire(path.join(process.cwd(), 'noop.js'));
let pw; try { pw = req('playwright'); } catch { pw = req('@playwright/test'); }

const launch = async () => {
  // the installed Chrome draws WebGL on the GPU and plays H.264; fall back to the bundled Chromium
  try { return await pw.chromium.launch({ channel: 'chrome', headless: false, args: ['--window-position=-2400,0'] }); }
  catch { return await pw.chromium.launch({ args: ['--enable-gpu', '--use-angle=metal'] }); }
};

if (cmd === 'capture') {
  const url = positional[0];
  if (!/^https?:/.test(url || '')) { console.error('usage: board.mjs capture <url> [--name site] [--shots 10] [--wait 8] [--step 900]'); process.exit(1); }
  const name = opt('name', new URL(url).hostname.replace(/^www\./, '').replace(/\W+/g, '-'));
  const out = path.resolve(opt('out', '.stagecraft/board'), name);
  const shots = +opt('shots', 10), wait = +opt('wait', 8) * 1000, step = +opt('step', 900);
  mkdirSync(out, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(wait);
  await page.mouse.move(720, 450);
  const rows = [];
  for (let i = 0; i < shots; i++) {
    const file = `${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(out, file) });
    rows.push(`| ${file} | ${i * step} px of wheel |`);
    // several small wheel events, as a hand scrolls, then time for the scene to settle
    for (let k = 0; k < 6; k++) { await page.mouse.wheel(0, step / 6); await page.waitForTimeout(110); }
    await page.waitForTimeout(1100);
  }
  await browser.close();
  writeFileSync(path.join(out, 'index.md'), `# ${name}\n\nSource: ${url}\nCaptured: ${new Date().toISOString().slice(0, 10)} at 1440 x 900.\nReference for quality and technique only; nothing here is copied into the build.\n\n| Frame | Position |\n|---|---|\n${rows.join('\n')}\n`);
  console.log(`board: ${shots} frames in ${path.relative(process.cwd(), out)}; open each at full size and write docs/bar.md`);
} else if (cmd === 'pair') {
  const [mine, ref] = positional;
  if (!mine || !ref || !existsSync(mine) || !existsSync(ref)) { console.error('usage: board.mjs pair <your frame> <reference frame> [--out file.png]'); process.exit(1); }
  const out = path.resolve(opt('out', path.join('.stagecraft/board/pairs', `${path.basename(mine, path.extname(mine))}--${path.basename(ref, path.extname(ref))}.png`)));
  mkdirSync(path.dirname(out), { recursive: true });
  const uri = (f) => `data:image/${path.extname(f).slice(1).replace('jpg', 'jpeg') || 'png'};base64,${readFileSync(f).toString('base64')}`;
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2912, height: 960 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>body{margin:0;background:#111;color:#ddd;font:14px ui-monospace,Menlo,monospace;display:flex;gap:16px;padding:8px;width:max-content}
    figure{margin:0}img{display:block;height:900px;width:auto}figcaption{padding:8px 2px}</style>
    <figure><img src="${uri(mine)}"><figcaption>YOURS · ${path.basename(mine)}</figcaption></figure>
    <figure><img src="${uri(ref)}"><figcaption>REFERENCE · ${path.basename(ref)}</figcaption></figure>`);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  await (await page.$('body')).screenshot({ path: out });
  await browser.close();
  console.log(`pair: ${path.relative(process.cwd(), out)}; open at 100 % and name the three largest differences in material, light and composition`);
} else {
  console.error('usage: board.mjs capture <url> … | board.mjs pair <your frame> <reference frame> …'); process.exit(1);
}
