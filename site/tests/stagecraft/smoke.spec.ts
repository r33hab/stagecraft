import { test, expect, cfg, routes, settle } from './fixtures';

const ignoreReq = (cfg.ignoreRequests ?? []).map((p) => new RegExp(p, 'i'));
const ignoreCon = (cfg.ignoreConsole ?? []).map((p) => new RegExp(p, 'i'));

for (const route of routes) {
  test(`smoke ${route}`, async ({ page }) => {
    const errors: string[] = [];
    const failed: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' && !ignoreCon.some((r) => r.test(m.text()))) errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('response', (r) => {
      if (r.status() >= 400 && !/favicon/i.test(r.url()) && !ignoreReq.some((x) => x.test(r.url()))) failed.push(`${r.status()} ${r.url()}`);
    });

    const res = await page.goto(route, { waitUntil: 'load' });
    expect(res?.ok(), `${route} responded ${res?.status()}`).toBeTruthy();
    await settle(page);

    await expect(page).toHaveTitle(/\S/);
    expect(await page.locator('html').getAttribute('lang'), 'html[lang]').toMatch(/^[a-z]{2}/i);
    expect(await page.locator('meta[name="description"]').getAttribute('content'), 'meta description').toMatch(/\S/);
    expect(await page.locator('meta[name="viewport"]').count(), 'viewport meta').toBeGreaterThanOrEqual(1);
    expect(await page.locator('h1').count(), 'exactly one h1').toBe(1);
    expect(await page.locator('main').count(), 'a main landmark').toBeGreaterThanOrEqual(1);
    expect((await page.locator('h1').first().innerText()).trim().length, 'h1 has text').toBeGreaterThan(0);

    const thirdParty = await page.evaluate(() => {
      const hosts = new Set<string>();
      for (const s of Array.from(document.scripts)) {
        if (!s.src) continue;
        try { const h = new URL(s.src).host; if (h !== location.host) hosts.add(h); } catch {}
      }
      return [...hosts];
    });
    if (thirdParty.length > cfg.budgets.thirdPartyHosts) {
      console.warn(`[stagecraft] ${route}: ${thirdParty.length} third-party script hosts (budget ${cfg.budgets.thirdPartyHosts}): ${thirdParty.join(', ')}`);
    }

    expect(errors, 'console errors').toEqual([]);
    expect(failed, 'failed requests').toEqual([]);
  });
}
