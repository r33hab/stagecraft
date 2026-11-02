#!/usr/bin/env node
/**
 * Film a page as a seamless video loop: the asset when the work itself is the subject (a site, an
 * app, a product UI) and there is no footage. Real GPU, screencast frames at JPEG 92, scroll at a
 * steady cadence, ffmpeg encode to H.264 at two sizes plus a poster.
 *
 *   node <skill>/scripts/film.mjs <url> --out public/reel/name
 *        [--scroll 4000] [--ms 12000] [--hold 1200] [--start 0] [--hide "header, .caption"]
 *        [--sizes 1280,720] [--crf 27,29] [--fade 0.7] [--viewport 1440x900]
 *
 * --start   fraction of the page to jump to before filming (0 to 1)
 * --drive   a module whose default export drives the page instead of the steady scroll:
 *           export default async ({ page, ms }) => { ... }   (hover rows, open a view, drag a card)
 *           Film the signature interaction when a scroll would never show it.
 * --hide    CSS selectors to hide while filming: film a text-free version when the clip will sit
 *           behind other copy, so two UIs never stack
 * Needs @playwright/test in the project (it is resolved from the current directory) and ffmpeg.
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
if (!url || !opt('out')) { console.error('usage: film.mjs <url> --out <path/name> [options]'); process.exit(1); }
const out = path.resolve(opt('out'));
const [vw, vh] = opt('viewport', '1440x900').split('x').map(Number);
const sizes = opt('sizes', '1280,720').split(',').map(Number);
const crfs = opt('crf', '27,29').split(',').map(Number);
const scroll = Number(opt('scroll', '4000')), ms = Number(opt('ms', '12000')), holdMs = Number(opt('hold', '1200'));
const start = Number(opt('start', '0')), fade = Number(opt('fade', '0.7')), hide = opt('hide', ''), driveFile = opt('drive', '');
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { console.error('ffmpeg is required (brew install ffmpeg / apt install ffmpeg)'); process.exit(1); }

const require = createRequire(path.join(process.cwd(), 'package.json'));
const { chromium } = require('@playwright/test');
// New headless with the real GPU: the default shell renders WebGL in software, slowly and differently.
const gpu = process.platform === 'darwin' ? ['--use-angle=metal'] : ['--use-gl=angle'];
const browser = await chromium.launch({ channel: 'chromium', args: [...gpu, '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load' });
if (hide) await page.addStyleTag({ content: `${hide} { visibility: hidden !important; }` });
await page.mouse.move(vw - 60, vh - 40);
await page.waitForTimeout(2400);
if (start > 0) { await page.evaluate((f) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), start); await page.waitForTimeout(2200); }

const tmp = `${out}.frames`; if (existsSync(tmp)) rmSync(tmp, { recursive: true }); mkdirSync(tmp, { recursive: true });
const cdp = await ctx.newCDPSession(page); const frames = [];
cdp.on('Page.screencastFrame', async (f) => { frames.push({ d: f.data, t: f.metadata.timestamp }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {} });
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: vw, maxHeight: vh });
await page.waitForTimeout(holdMs);
// A wheel event every 50 ms, eased in and out: smooth-scroll libraries interpolate between them.
const drive = driveFile ? (await import(pathToFileURL(path.resolve(driveFile)).href)).default : null;
const t0 = Date.now(); let done = 0;
if (drive) await drive({ page, ms });
else while (Date.now() - t0 < ms) { const u = (Date.now() - t0) / ms; const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; await page.mouse.wheel(0, scroll * e - done); done = scroll * e; await page.waitForTimeout(50); }
await page.waitForTimeout(holdMs);
await cdp.send('Page.stopScreencast');
await browser.close();

const lines = [];
frames.forEach((f, i) => { const file = path.join(tmp, `${String(i).padStart(5, '0')}.jpg`); writeFileSync(file, Buffer.from(f.d, 'base64')); lines.push(`file '${file}'`, `duration ${Math.max(1 / 60, (frames[i + 1]?.t ?? f.t + 1 / 30) - f.t).toFixed(4)}`); });
lines.push(`file '${path.join(tmp, `${String(frames.length - 1).padStart(5, '0')}.jpg`)}'`);
writeFileSync(path.join(tmp, 'list.txt'), lines.join('\n'));
const raw = path.join(tmp, 'raw.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-fps_mode', 'cfr', '-r', '30', '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-pix_fmt', 'yuv420p', raw]);
const L = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', raw]).toString());
// The tail crossfades into the head, so the loop has no seam.
const loop = `[0:v]split[a][b];[a]trim=start=${fade},setpts=PTS-STARTPTS[a1];[b]trim=0:${fade},setpts=PTS-STARTPTS[b1];[a1][b1]xfade=transition=fade:duration=${fade}:offset=${(L - 2 * fade).toFixed(3)}`;
mkdirSync(path.dirname(out), { recursive: true });
sizes.forEach((w, i) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-filter_complex', `${loop},scale=${w}:-2:flags=lanczos`, '-an', '-c:v', 'libx264', '-crf', String(crfs[i] ?? crfs.at(-1)), '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${out}-${w}.mp4`]));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(fade + 0.2), '-i', raw, '-frames:v', '1', '-vf', `scale=${vw}:-2`, '-q:v', '4', `${out}.jpg`]);
rmSync(tmp, { recursive: true, force: true });
console.log(`filmed ${url}: ${frames.length} frames, ${L.toFixed(1)} s -> ${sizes.map((w) => `${path.basename(out)}-${w}.mp4`).join(', ')}, ${path.basename(out)}.jpg`);
