#!/usr/bin/env node
/**
 * Install the stagecraft test suite into a project.
 *
 *   node <skill>/scripts/add-tests.mjs [project-dir] [--base URL] [--preview "cmd"] [--routes "/,/work"] [--force]
 *
 * Copies playwright.config.ts, tests/stagecraft/*, stagecraft.budgets.json, lighthouserc.json and
 * scripts/check-budgets.mjs into the project, merges npm scripts into package.json, and prints the
 * install commands. Existing files are kept unless --force.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, '..', 'assets', 'tests');
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const has = (name) => args.includes(name);
const project = path.resolve(args.find((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--'))) || '.');
const force = has('--force');

if (!existsSync(path.join(project, 'package.json'))) {
  console.error(`No package.json in ${project}. Run inside the site project (or pass its path).`);
  process.exit(1);
}

const copied = [];
const skipped = [];
function copy(src, dest) {
  if (existsSync(dest) && !force) { skipped.push(path.relative(project, dest)); return; }
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest);
  copied.push(path.relative(project, dest));
}

copy(path.join(assets, 'playwright.config.ts'), path.join(project, 'playwright.config.ts'));
copy(path.join(assets, 'lighthouserc.json'), path.join(project, 'lighthouserc.json'));
copy(path.join(here, 'check-budgets.mjs'), path.join(project, 'scripts', 'check-budgets.mjs'));
for (const f of readdirSync(path.join(assets, 'tests'))) {
  if (statSync(path.join(assets, 'tests', f)).isFile()) copy(path.join(assets, 'tests', f), path.join(project, 'tests', 'stagecraft', f));
}

// budgets: merge CLI values into a fresh or existing file
const budgetsPath = path.join(project, 'stagecraft.budgets.json');
const base = JSON.parse(readFileSync(path.join(assets, 'stagecraft.budgets.json'), 'utf8'));
let budgets = existsSync(budgetsPath) && !force ? JSON.parse(readFileSync(budgetsPath, 'utf8')) : base;
if (flag('--base')) budgets.baseURL = flag('--base');
if (flag('--preview')) budgets.preview = flag('--preview');
if (flag('--routes')) budgets.routes = flag('--routes').split(',').map((r) => r.trim()).filter(Boolean);
writeFileSync(budgetsPath, JSON.stringify(budgets, null, 2) + '\n');
copied.push('stagecraft.budgets.json');

// package.json scripts
const pkgPath = path.join(project, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.scripts ??= {};
const scripts = {
  'test:e2e': 'playwright test',
  'test:e2e:ui': 'playwright test --ui',
  'test:perf': 'playwright test --project=mobile-low tests/stagecraft/perf.spec.ts',
  'test:budgets': 'node scripts/check-budgets.mjs --dist dist',
};
for (const [k, v] of Object.entries(scripts)) if (!pkg.scripts[k] || force) pkg.scripts[k] = v;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`stagecraft tests installed in ${project}`);
if (copied.length) console.log('  added:   ' + copied.join(', '));
if (skipped.length) console.log('  kept:    ' + skipped.join(', ') + ' (use --force to overwrite)');
console.log(`
Next:
  npm i -D @playwright/test@^1.64 @axe-core/playwright@^4.14
  npx playwright install chromium firefox webkit
  npm run build && npm run test:budgets && npm run test:e2e

Edit stagecraft.budgets.json: routes, preview command, selectors ([data-preloader], [data-cursor], [data-reveal], [data-menu-button], [data-dynamic]).
Mark videos, canvases, marquees and live clocks with data-dynamic so visual baselines stay stable.
`);
