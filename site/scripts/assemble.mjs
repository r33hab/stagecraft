#!/usr/bin/env node
/**
 * Assemble the GitHub Pages artifact: the landing site plus every demo under /demos/<name>/.
 *
 *   node scripts/assemble.mjs            # from site/: builds each Astro demo, copies baselines
 *
 * Astro demos (built with the skill) are built with their own base path and copied from dist/.
 * Baseline demos are plain static folders and are copied as they are, minus test tooling.
 */
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demos = path.resolve(site, '..', 'demos');
const out = path.join(site, 'dist', 'demos');
mkdirSync(out, { recursive: true });

const astroDemos = ['nordlys', 'portfolio', 'story'];
const baselines = ['nordlys-baseline', 'portfolio-baseline', 'story-baseline'];
const skip = new Set(['node_modules', 'tests', 'scripts', 'playwright.config.ts', 'stagecraft.budgets.json', 'lighthouserc.json', 'package.json', 'package-lock.json', 'playwright-report', 'test-results', '.gitignore', 'preview.log', 'pw-run1.log']);

for (const name of astroDemos) {
  const dir = path.join(demos, name);
  if (!existsSync(dir)) continue;
  console.log(`\n[assemble] building ${name}`);
  if (!existsSync(path.join(dir, 'node_modules'))) execFileSync('npm', ['ci'], { cwd: dir, stdio: 'inherit' });
  execFileSync('npm', ['run', 'build'], { cwd: dir, stdio: 'inherit' });
  const dest = path.join(out, name);
  rmSync(dest, { recursive: true, force: true });
  cpSync(path.join(dir, 'dist'), dest, { recursive: true });
}

for (const name of baselines) {
  const dir = path.join(demos, name);
  if (!existsSync(dir)) continue;
  const dest = path.join(out, name);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  for (const f of readdirSync(dir)) {
    if (skip.has(f) || f.startsWith('.') || f.endsWith('.log')) continue;   // test logs stay out of the site
    cpSync(path.join(dir, f), path.join(dest, f), { recursive: true });
  }
  console.log(`[assemble] copied ${name} (${readdirSync(dest).length} entries)`);
}
console.log(`\n[assemble] demos in ${out}`);
