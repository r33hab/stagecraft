import { test as base, expect, type Page, type CDPSession, type TestInfo } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export type Budgets = {
  baseURL?: string;
  preview?: string;
  routes: string[];
  /** Intake Q8: 'all' (default) gates every budget on mobile-low; 'desktop-first' makes the mobile perf budgets warn. */
  platform?: 'all' | 'desktop-first' | 'phone-first';
  budgets: {
    lcpMs: number; cls: number; longTaskTotalMs: number; longTaskMaxMs: number; frameP95Ms: number;
    scriptKb: number; lazyChunkKb: number; cssKb: number; fontKb: number; fontFiles: number; fontFamilies: number;
    imageKbMobile: number; totalKbMobile: number; totalKbDesktop: number; heroImageKb: number;
    domNodes: number; preloaderMs: number; thirdPartyHosts: number;
  };
  selectors: { preloader: string; cursor: string; reveal: string; menuButton: string; dynamic: string };
  ignoreRequests?: string[];
  ignoreConsole?: string[];
  lazyChunks: string[];
  axe: { disableRules: string[] };
  visual: { maxDiffPixelRatio: number };
};

export const cfg: Budgets = JSON.parse(readFileSync(path.resolve(process.cwd(), 'stagecraft.budgets.json'), 'utf8'));
export const routes: string[] = cfg.routes?.length ? cfg.routes : ['/'];
export const slug = (route: string) => (route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase());

export const isChromium = (info: TestInfo) => info.project.use.defaultBrowserType === 'chromium' || /desktop|mobile-low|reduced-motion/.test(info.project.name);
export const isMobile = (info: TestInfo) => Boolean(info.project.use.isMobile);

/** CPU 4x + slow 4G through the Chrome DevTools Protocol. Chromium only; returns null elsewhere. */
export async function throttle(page: Page, rate = 4): Promise<CDPSession | null> {
  const name = page.context().browser()?.browserType().name();
  if (name !== 'chromium') return null;
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate });
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  return client;
}

/** Fonts ready, preloader gone (or timed out), a short pause for intro timelines. */
export async function settle(page: Page, ms = 600) {
  await page.evaluate(() => (document as any).fonts?.ready ?? Promise.resolve()).catch(() => {});
  const gate = page.locator(cfg.selectors.preloader);
  if (await gate.count()) {
    await gate.first().waitFor({ state: 'hidden', timeout: cfg.budgets.preloaderMs + 1500 }).catch(() => {});
  }
  await page.waitForTimeout(ms);
}

/** Wheel from top to bottom in steps so scroll-bound work runs; falls back to scrollBy where wheel is unsupported. */
export async function scrollThrough(page: Page, step = 320, pause = 90, maxSteps = 500) {
  for (let i = 0; i < maxSteps; i++) {
    const { h, vh, sy } = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, vh: innerHeight, sy: scrollY }));
    if (sy + vh >= h - 2) break;
    try {
      await page.mouse.wheel(0, step);
    } catch {
      await page.evaluate((s) => window.scrollBy({ top: s, behavior: 'instant' as ScrollBehavior }), step);
    }
    await page.waitForTimeout(pause);
    const after = await page.evaluate(() => scrollY);
    if (after === sy) {
      // wheel had no effect (virtual scroll or locked); try native scroll once, then stop.
      await page.evaluate((s) => window.scrollBy({ top: s, behavior: 'instant' as ScrollBehavior }), step);
      await page.waitForTimeout(pause);
      if ((await page.evaluate(() => scrollY)) === sy) break;
    }
  }
}

export async function scrollToFraction(page: Page, f: number, pause = 900) {
  await page.evaluate((fr) => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * fr, behavior: 'instant' as ScrollBehavior }), f);
  await page.waitForTimeout(pause);
}

export function fmtKb(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export const test = base;
export { expect };
