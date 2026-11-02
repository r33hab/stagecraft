import { test, expect, cfg, routes, settle, scrollThrough, scrollToFraction, isMobile } from './fixtures';

/** Elements inside the viewport that are still hidden (opacity, visibility, or masked by an overflow ancestor). */
async function stuckElements(page: import('@playwright/test').Page) {
  return page.evaluate((revealSel) => {
    const sel = `h1, h2, h3, p, li, img, figure, ${revealSel}`;
    const vw = innerWidth, vh = innerHeight;
    type Row = { el: HTMLElement; label: string; shown: boolean; shownLoose: boolean; exempt: boolean; stage: Element | null };
    const rows: Row[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if (el.closest('[aria-hidden="true"], [data-preloader], template, noscript') || el.matches('[hidden]')) continue;
      const exempt = !!el.closest('[data-allow-hidden]');
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const inView = r.bottom > vh * 0.1 && r.top < vh * 0.9 && r.right > 0 && r.left < vw;
      if (!inView) continue;
      // effective opacity and visibility through ancestors; area left after overflow clipping
      let opacity = 1, visible = true;
      const area = r.width * r.height;
      let n: HTMLElement | null = el;
      let vis = { l: r.left, t: r.top, rgt: r.right, b: r.bottom };
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        opacity *= parseFloat(cs.opacity || '1');
        if (cs.visibility === 'hidden' || cs.display === 'none') visible = false;
        if (n !== el && /(hidden|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
          const pr = n.getBoundingClientRect();
          vis = { l: Math.max(vis.l, pr.left), t: Math.max(vis.t, pr.top), rgt: Math.min(vis.rgt, pr.right), b: Math.min(vis.b, pr.bottom) };
        }
        n = n.parentElement;
      }
      const visArea = Math.max(0, vis.rgt - vis.l) * Math.max(0, vis.b - vis.t);
      const ratio = area ? visArea / area : 1;
      const shown = opacity >= 0.9 && visible && ratio >= 0.3;
      const shownLoose = opacity >= 0.5 && visible && ratio >= 0.3;
      const text = (el.textContent || el.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      // A scrubbed stage (GSAP pin wraps it in .pin-spacer; or mark it data-stage) swaps content on
      // purpose: it is fine for one copy to be hidden as long as the stage shows some text.
      const stage = el.closest('[data-stage], .pin-spacer');
      rows.push({ el, label: `${el.tagName.toLowerCase()} "${text}" opacity=${opacity.toFixed(2)} visible=${visible} shown=${Math.round(ratio * 100)}% y=${Math.round(r.top)}`, shown, shownLoose, exempt, stage });
    }
    const stageHasVisible = new Map<Element, boolean>();
    for (const row of rows) if (row.stage) stageHasVisible.set(row.stage, (stageHasVisible.get(row.stage) ?? false) || row.shownLoose);
    return rows
      .filter((row) => !row.shown && !row.exempt && !(row.stage && stageHasVisible.get(row.stage)))
      .map((row) => row.label);
  }, cfg.selectors.reveal);
}

for (const route of routes) {
  test(`never stuck ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    await scrollThrough(page, 280, 110);
    await page.waitForTimeout(800);
    const problems: string[] = [];
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      await scrollToFraction(page, f, 1100);
      const stuck = await stuckElements(page);
      if (stuck.length) problems.push(`at ${Math.round(f * 100)}%: ${stuck.slice(0, 6).join(' | ')}`);
    }
    expect(problems, `${route}: content still hidden after a full scroll (a reveal that never fired)`).toEqual([]);
  });

  test(`layout stable after settle ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    await scrollThrough(page, 600, 40);
    await page.waitForTimeout(1200);
    const h1 = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.waitForTimeout(1500);
    const h2 = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(Math.abs(h2 - h1), `${route}: document height changed from ${h1} to ${h2} after settling (late pin spacers, fonts or images)`).toBeLessThanOrEqual(2);
  });

  test(`keyboard scrolling works ${route}`, async ({ page }, info) => {
    test.skip(isMobile(info));
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    const tall = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 50);
    test.skip(!tall, 'page is one viewport tall (virtual scroll or single screen); keyboard scroll not applicable');
    await page.mouse.click(5, Math.round(900 / 2));
    await page.keyboard.press('End');
    await page.waitForTimeout(900);
    const atEnd = await page.evaluate(() => scrollY);
    expect(atEnd, 'End key scrolls the page').toBeGreaterThan(100);
    await page.keyboard.press('Home');
    await page.waitForTimeout(900);
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(900);
    expect(await page.evaluate(() => scrollY), 'PageDown scrolls the page').toBeGreaterThan(50);
  });

  test(`preloader budget ${route}`, async ({ page }) => {
    const t0 = Date.now();
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const gate = page.locator(cfg.selectors.preloader).first();
    test.skip((await gate.count()) === 0, 'no preloader');
    await expect(gate, `preloader still visible after ${cfg.budgets.preloaderMs} ms`).toBeHidden({ timeout: cfg.budgets.preloaderMs + 200 });
    const took = Date.now() - t0;
    console.log(`[stagecraft] ${route}: preloader lifted after ${took} ms`);
    // Repeat visit in the same context: the gate must be skipped or lift at once.
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const again = page.locator(cfg.selectors.preloader).first();
    if (await again.count()) await expect(again, 'preloader shown again on a repeat visit').toBeHidden({ timeout: 400 });
  });

  test(`custom cursor hidden on touch ${route}`, async ({ page }, info) => {
    test.skip(!isMobile(info));
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    const visibleCursors = await page.evaluate((sel) => {
      return Array.from(document.querySelectorAll<HTMLElement>(sel)).filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05 && r.width > 0 && r.height > 0;
      }).length;
    }, cfg.selectors.cursor);
    expect(visibleCursors, `${route}: custom cursor elements visible on a touch device`).toBe(0);
  });

  test(`reduced motion respected ${route}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'reduced-motion');
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    await scrollToFraction(page, 0.5, 800);
    const report = await page.evaluate(() => {
      const infinite = document.getAnimations().filter((a) => {
        const t = a.effect?.getTiming();
        return a.playState === 'running' && t && t.iterations === Infinity;
      }).length;
      const autoplaying = Array.from(document.querySelectorAll('video')).filter((v) => v.autoplay && !v.paused && !v.ended).length;
      const smooth = document.documentElement.classList.contains('lenis') || document.documentElement.classList.contains('lenis-smooth') || !!(window as any).lenis;
      const prefers = matchMedia('(prefers-reduced-motion: reduce)').matches;
      return { infinite, autoplaying, smooth, prefers };
    });
    expect(report.prefers, 'media query reports reduce').toBeTruthy();
    expect(report.infinite, 'infinite animations still running under reduced motion').toBe(0);
    expect(report.autoplaying, 'videos autoplaying under reduced motion').toBe(0);
    expect(report.smooth, 'smooth-scroll library active under reduced motion').toBeFalsy();
  });
}
