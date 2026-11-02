import { test, expect, cfg, routes, settle, scrollToFraction, slug } from './fixtures';

for (const route of routes) {
  test(`visual ${route}`, async ({ page }, info) => {
    test.skip(!/^(desktop|mobile-low)$/.test(info.project.name), 'baselines are kept for desktop and mobile-low');
    await page.goto(route, { waitUntil: 'load' });
    await settle(page, 1500);
    // Mask only what is painted on screen. A hidden or faded video or canvas still has a box (Playwright counts an
    // element at opacity 0 as visible), and masking it would paint over whatever covers it, even the whole page.
    const tagMask = (sel: string) => page.evaluate((sel) => {
      document.querySelectorAll('[data-sc-mask]').forEach((el) => el.removeAttribute('data-sc-mask'));
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue;
        let o = 1, shown = true;
        for (let n: HTMLElement | null = el; n; n = n.parentElement) { const cs = getComputedStyle(n); o *= +cs.opacity; if (cs.visibility === 'hidden' || cs.display === 'none') shown = false; }
        // on top somewhere: the centre or a quadrant centre shows this element, not something covering it
        const onTop = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].some(([fx, fy]) => {
          const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width * fx)), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height * fy));
          const top = document.elementFromPoint(x, y);
          return !!top && (el === top || el.contains(top));
        });
        if (shown && o > 0.05 && onTop) el.setAttribute('data-sc-mask', '');
      }
    }, sel);
    const masked = `${cfg.selectors.dynamic}, video, canvas, iframe`;
    const mask = [page.locator('[data-sc-mask]')];
    await tagMask(masked);
    await expect(page).toHaveScreenshot(`${slug(route)}-top.png`, { mask, fullPage: false });
    await scrollToFraction(page, 0.5, 1800);
    await tagMask(masked);
    await expect(page).toHaveScreenshot(`${slug(route)}-mid.png`, { mask, fullPage: false });
  });
}
