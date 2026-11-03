import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Budgets, routes and server command live in stagecraft.budgets.json next to this file.
const cfg = JSON.parse(readFileSync(path.resolve(process.cwd(), 'stagecraft.budgets.json'), 'utf8'));
const baseURL: string = process.env.BASE_URL || cfg.baseURL || 'http://localhost:4321';

export default defineConfig({
  testDir: './tests/stagecraft',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFileName}/{arg}{ext}',
  timeout: 120_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: cfg.visual?.maxDiffPixelRatio ?? 0.02,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  fullyParallel: false,
  workers: process.env.CI ? 1 : 2,
  retries: process.env.CI ? 1 : 0,
  updateSnapshots: process.env.CI ? 'none' : 'missing',
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  // Ready when the first route answers, not the bare origin: a site under a base path (GitHub Pages) is a 404 at /.
  webServer: cfg.preview && !process.env.BASE_URL
    ? { command: cfg.preview, url: new URL(cfg.routes?.[0] ?? '/', baseURL).href, reuseExistingServer: true, timeout: 120_000 }
    : undefined,
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // The reviewer's phone: a mid/low Android profile. CPU and network throttling are applied in the
      // perf and motion specs through CDP (see fixtures.ts), because Playwright has no device-level throttle.
      name: 'mobile-low',
      use: { ...devices['Pixel 7'], viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true },
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 14'] },
    },
    {
      // Firefox has no scroll-driven CSS animations: the observer fallback must carry the reveals.
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
    },
  ],
});
