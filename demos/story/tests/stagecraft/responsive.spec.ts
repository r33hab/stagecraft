import { test, expect, routes, settle, isMobile } from './fixtures';

const WIDTHS = [320, 375, 414, 640, 768, 1024, 1440];

for (const route of routes) {
  test(`no horizontal overflow ${route}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'width sweep runs once, on the desktop project');
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    const problems: string[] = [];
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(300);
      const over = await page.evaluate(() => {
        const doc = document.documentElement;
        const widest = Math.max(doc.scrollWidth, document.body.scrollWidth);
        // Elements clipped by an overflow-hidden ancestor (marquee tracks, masks) cannot widen the page.
        const clipped = (el: Element) => { let n = el.parentElement; while (n && n !== document.body) { const o = getComputedStyle(n); if (/(hidden|clip|auto|scroll)/.test(o.overflowX + o.overflow)) return true; n = n.parentElement; } return false; };
        const offenders = Array.from(document.querySelectorAll('body *'))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.right > doc.clientWidth + 1 && getComputedStyle(el).position !== 'fixed' && !clipped(el);
          })
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`);
        return { over: widest - doc.clientWidth, offenders };
      });
      if (over.over > 1) problems.push(`${w}px: +${over.over}px (${over.offenders.join(', ')})`);
    }
    expect(problems, `${route} horizontal overflow`).toEqual([]);
  });

  test(`touch targets ${route}`, async ({ page }, info) => {
    test.skip(!isMobile(info), 'touch targets are checked on mobile projects');
    await page.goto(route, { waitUntil: 'load' });
    await settle(page);
    const result = await page.evaluate(() => {
      const tooSmall: string[] = [];
      const small: string[] = [];
      const inlineParents = new Set(['P', 'LI', 'SPAN', 'TD', 'DD', 'FIGCAPTION', 'SMALL', 'EM', 'STRONG']);
      const els = Array.from(document.querySelectorAll<HTMLElement>('a[href], button, [role="button"], input, select, textarea, summary'));
      for (const el of els) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[aria-hidden="true"]')) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const label = `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`;
        const inline = el.tagName === 'A' && inlineParents.has(el.parentElement?.tagName || '') && cs.display.startsWith('inline');
        if (inline) continue; // inline links in running text are exempt (WCAG 2.5.8)
        if (r.width < 24 || r.height < 24) tooSmall.push(label);
        else if (r.width < 44 || r.height < 44) small.push(label);
      }
      return { tooSmall, small };
    });
    if (result.small.length) console.warn(`[stagecraft] ${route}: ${result.small.length} targets under 44px: ${result.small.slice(0, 8).join('; ')}`);
    expect(result.tooSmall, `${route} targets under 24px`).toEqual([]);
  });
}
