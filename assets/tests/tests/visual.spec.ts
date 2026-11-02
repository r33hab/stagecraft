import { test, expect, cfg, routes, settle, scrollToFraction, slug } from './fixtures';

for (const route of routes) {
  test(`visual ${route}`, async ({ page }, info) => {
    test.skip(!/^(desktop|mobile-low)$/.test(info.project.name), 'baselines are kept for desktop and mobile-low');
    await page.goto(route, { waitUntil: 'load' });
    await settle(page, 1500);
    const mask = [page.locator(cfg.selectors.dynamic), page.locator('video, canvas, iframe')];
    await expect(page).toHaveScreenshot(`${slug(route)}-top.png`, { mask, fullPage: false });
    await scrollToFraction(page, 0.5, 1800);
    await expect(page).toHaveScreenshot(`${slug(route)}-mid.png`, { mask, fullPage: false });
  });
}
