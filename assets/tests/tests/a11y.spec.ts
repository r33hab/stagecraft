import AxeBuilder from '@axe-core/playwright';
import { test, expect, cfg, routes, settle, scrollThrough } from './fixtures';

for (const route of routes) {
  test(`axe ${route}`, async ({ page }, info) => {
    test.skip(info.project.name === 'firefox' || info.project.name === 'mobile-webkit', 'axe runs on the Chromium projects');
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    await scrollThrough(page, 600, 40);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .disableRules(cfg.axe?.disableRules ?? [])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const minor = results.violations.filter((v) => !(v.impact === 'serious' || v.impact === 'critical'));
    if (minor.length) console.warn(`[stagecraft] ${route}: ${minor.length} minor/moderate axe issues: ${minor.map((v) => v.id).join(', ')}`);
    const report = serious.map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`);
    expect(report, `${route} serious/critical accessibility violations`).toEqual([]);
  });

  test(`keyboard ${route}`, async ({ page }, info) => {
    test.skip(info.project.use.isMobile === true, 'keyboard order is checked on desktop projects');
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);

    const focusableCount = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((el) => {
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden' && !el.closest('[aria-hidden="true"]');
      }).length,
    );
    const steps = Math.min(focusableCount + 3, 90);
    const invisible: string[] = [];
    const noRing: string[] = [];
    const seen: string[] = [];
    let skipLinkWorked: boolean | null = null;

    const readFocus = () =>
      page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        // A visible focus style is an outline or a box-shadow on the focused element (or on a wrapper it labels).
        const wrap = el.querySelector(':scope > *') as HTMLElement | null;
        const hasRing = (s: CSSStyleDeclaration) => (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow !== 'none' && s.boxShadow !== '');
        const ring = hasRing(cs) || (!!wrap && hasRing(getComputedStyle(wrap)));
        const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
        const opacity = (() => { let o = 1; let n: HTMLElement | null = el; while (n && n !== document.body) { o *= parseFloat(getComputedStyle(n).opacity || '1'); n = n.parentElement; } return o; })();
        const label = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`;
        const href = el.getAttribute('href') || '';
        return { label, inView, visible: cs.visibility !== 'hidden' && opacity > 0.5 && r.width > 0 && r.height > 0, ring, href, isSkip: /skip/i.test(label) && href.startsWith('#') };
      });

    for (let i = 0; i < steps; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(40);
      let f = await readFocus();
      // A focused element may still be revealing or scrolling into view; give it a moment before judging.
      if (f && (!f.inView || !f.visible)) { await page.waitForTimeout(800); f = await readFocus(); }
      if (!f) continue;
      seen.push(f.label);
      if (!f.inView || !f.visible) invisible.push(f.label);
      if (!f.ring) noRing.push(f.label);
      if (i === 0 && f.isSkip) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
        skipLinkWorked = await page.evaluate((href) => {
          const target = document.querySelector(href);
          const active = document.activeElement;
          return !!target && (active === target || !!target.contains(active));
        }, f.href);
      }
    }
    expect(seen.length, 'keyboard reaches focusable elements').toBeGreaterThan(0);
    if (skipLinkWorked !== null) expect(skipLinkWorked, 'skip link moves focus to its target').toBeTruthy();
    expect(invisible, `${route}: focused elements that are off screen or hidden`).toEqual([]);
    expect(noRing, `${route}: focused elements with no visible focus style`).toEqual([]);
  });

  test(`menu escape ${route}`, async ({ page }, info) => {
    test.skip(info.project.use.isMobile === true);
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    const btn = page.locator(cfg.selectors.menuButton).first();
    test.skip((await btn.count()) === 0 || !(await btn.isVisible()), 'no visible menu button marked with the configured selector at this viewport');
    await btn.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const focusBack = await page.evaluate((sel) => document.activeElement === document.querySelector(sel), cfg.selectors.menuButton);
    expect(focusBack, 'Escape closes the menu and returns focus to the button').toBeTruthy();
  });
}
