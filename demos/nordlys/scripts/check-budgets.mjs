#!/usr/bin/env node
/**
 * Static weight check on a build output. No browser needed.
 *
 *   node scripts/check-budgets.mjs --dist dist [--budgets stagecraft.budgets.json]
 *
 * Reports gzip sizes per asset class, flags scripts that should be lazy, images that should be
 * AVIF/WebP, and fails (exit 1) when the initial script, lazy chunk, CSS or font budgets are over.
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const dist = path.resolve(flag('--dist', 'dist'));
const budgetsPath = path.resolve(flag('--budgets', 'stagecraft.budgets.json'));
if (!existsSync(dist)) { console.error(`dist folder not found: ${dist} (build first)`); process.exit(1); }
const cfg = existsSync(budgetsPath) ? JSON.parse(readFileSync(budgetsPath, 'utf8')) : { budgets: {}, lazyChunks: [] };
const B = { scriptKb: 170, lazyChunkKb: 260, cssKb: 60, fontKb: 150, fontFiles: 2, heroImageKb: 250, ...cfg.budgets };
const lazyRe = cfg.lazyChunks?.length ? new RegExp(cfg.lazyChunks.join('|'), 'i') : null;

const classes = { script: /\.(m?js)$/i, css: /\.css$/i, font: /\.(woff2?|ttf|otf)$/i, image: /\.(avif|webp|png|jpe?g|gif|svg)$/i, media: /\.(mp4|webm|m4v|mov|mp3|ogg)$/i, html: /\.html?$/i };
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else {
      const cls = Object.entries(classes).find(([, re]) => re.test(f))?.[0] || 'other';
      const raw = s.size;
      const gz = /^(script|css|html|font)$/.test(cls) && !/\.woff2?$/i.test(f) ? gzipSync(readFileSync(p), { level: 9 }).length : raw;
      files.push({ rel: path.relative(dist, p), cls, raw, gz, name: f, lazy: cls === 'script' && lazyRe ? lazyRe.test(f) : false });
    }
  }
})(dist);

const kb = (n) => Math.round(n / 1024);
const sum = (arr, k = 'gz') => arr.reduce((a, f) => a + f[k], 0);
const by = (cls) => files.filter((f) => f.cls === cls);
const scripts = by('script');
const initial = scripts.filter((f) => !f.lazy);
const lazy = scripts.filter((f) => f.lazy);
const failures = [];
const warnings = [];

const rows = [
  ['scripts (initial, gzip)', `${kb(sum(initial))} KB in ${initial.length} files`, B.scriptKb],
  ['scripts (lazy chunks, gzip)', `${kb(sum(lazy))} KB in ${lazy.length} files; largest ${kb(Math.max(0, ...lazy.map((f) => f.gz)))} KB`, `${B.lazyChunkKb} per chunk`],
  ['css (gzip)', `${kb(sum(by('css')))} KB in ${by('css').length} files`, B.cssKb],
  ['fonts', `${kb(sum(by('font')))} KB in ${by('font').length} files`, `${B.fontKb} KB, ${B.fontFiles} above the fold`],
  ['images', `${kb(sum(by('image'), 'raw'))} KB in ${by('image').length} files`, ''],
  ['media', `${kb(sum(by('media'), 'raw'))} KB in ${by('media').length} files`, ''],
  ['html (gzip)', `${kb(sum(by('html')))} KB in ${by('html').length} pages`, ''],
];
console.log(`\nstagecraft budgets for ${path.relative(process.cwd(), dist) || '.'}\n`);
for (const [k, v, b] of rows) console.log(`  ${k.padEnd(30)} ${String(v).padEnd(44)} ${b ? 'budget ' + b : ''}`);

if (kb(sum(initial)) > B.scriptKb) failures.push(`initial scripts ${kb(sum(initial))} KB over ${B.scriptKb} KB`);
for (const f of lazy) if (kb(f.gz) > B.lazyChunkKb) failures.push(`lazy chunk ${f.rel} is ${kb(f.gz)} KB (budget ${B.lazyChunkKb})`);
for (const f of initial) if (kb(f.gz) > 120) warnings.push(`${f.rel} is ${kb(f.gz)} KB gzip and not matched by lazyChunks; should it load after first paint?`);
if (kb(sum(by('css'))) > B.cssKb) failures.push(`css ${kb(sum(by('css')))} KB over ${B.cssKb} KB`);
if (kb(sum(by('font'))) > B.fontKb) failures.push(`fonts ${kb(sum(by('font')))} KB over ${B.fontKb} KB`);
for (const f of by('font')) if (!/\.woff2$/i.test(f.name)) warnings.push(`${f.rel}: ship WOFF2 only`);
if (by('font').length > B.fontFiles) warnings.push(`${by('font').length} font files shipped; preload at most ${B.fontFiles}, subset the rest`);
for (const f of by('image')) {
  if (kb(f.raw) > B.heroImageKb) warnings.push(`${f.rel} is ${kb(f.raw)} KB; anything above the fold must be under ${B.heroImageKb} KB`);
  if (/\.(png|jpe?g)$/i.test(f.name) && kb(f.raw) > 100) warnings.push(`${f.rel}: ${kb(f.raw)} KB ${path.extname(f.name).slice(1)}; serve AVIF/WebP`);
}
for (const f of by('html')) if (kb(f.gz) > 120) warnings.push(`${f.rel} is ${kb(f.gz)} KB gzip of HTML; check for inlined data or SSR payloads`);
for (const f of by('media')) if (kb(f.raw) > 3000) warnings.push(`${f.rel} is ${kb(f.raw)} KB; loop clips should stay under 2.5 MB`);

const top = [...files].sort((a, b) => b.gz - a.gz).slice(0, 8);
console.log('\n  largest files:');
for (const f of top) console.log(`    ${kb(f.gz).toString().padStart(6)} KB  ${f.rel}${f.lazy ? '  (lazy)' : ''}`);

if (warnings.length) { console.log('\n  warnings:'); for (const w of warnings) console.log('    - ' + w); }
if (failures.length) { console.log('\n  FAILED:'); for (const w of failures) console.log('    - ' + w); console.log(''); process.exit(1); }
console.log('\n  budgets OK\n');
