import { test, expect, routes, settle, isMobile } from './fixtures';

const WIDTHS = [320, 375, 414, 640, 768, 1024, 1440];

/**
 * Text drawn over other text, on the screen as it is now. Unlike the reading spec (large copy, desktop) it takes every
 * piece of text at any size, decorative and aria-hidden included: labels, chips, rails, cues and the header are
 * where a phone layout collides. A line's box is trimmed by a fifth top and bottom, so tight display leading does not
 * touch. Fixed chrome counts only at the top of the page (`top`): further down, content passing under a see-through
 * header is ordinary scrolling. A pair is a collision when, at the middle of the overlap, nothing opaque lies between
 * the two (the upper one's own background included). Opt out with `data-allow-overlap`.
 */
const COLLISIONS = (top: boolean) => {
  const vw = innerWidth, vh = innerHeight;
  const noClip = (cp: string) => cp === 'none' || /^inset\(\s*(0(px|%)?\s*){1,4}(round[^)]*)?\)$/.test(cp);
  const opaque = (e: Element) => { const c = getComputedStyle(e).backgroundColor.match(/[\d.]+/g); return !!c && c.length >= 3 && (c.length < 4 || +c[3] >= 0.85); };
  const fixed = (el: Element) => { for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) if (n.hasAttribute('data-chrome') || getComputedStyle(n).position === 'fixed') return true; return false; };
  const items: { el: Element; l: number; t: number; r: number; b: number; chrome: boolean }[] = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t = walk.nextNode(); t; t = walk.nextNode()) {
    const el = t.parentElement;
    if (!el || !(t.textContent || '').trim() || el.closest('[data-allow-overlap], script, style, noscript, template')) continue;
    let op = 1, l = 0, tp = 0, r = vw, b = vh, gone = false;
    for (let n: Element | null = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      // masks and wipes are too varied to read reliably: text under a live clip-path is left out
      if (cs.display === 'none' || cs.visibility === 'hidden' || !noClip(cs.clipPath) || (cs.clip && cs.clip !== 'auto')) { gone = true; break; }
      op *= +cs.opacity;
      if (n !== el && /(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflowY)) { const p = n.getBoundingClientRect(); l = Math.max(l, p.left); tp = Math.max(tp, p.top); r = Math.min(r, p.right); b = Math.min(b, p.bottom); }
    }
    if (gone || op < 0.5) continue;
    const range = document.createRange(); range.selectNodeContents(t);
    const chrome = fixed(el);
    for (const q of Array.from(range.getClientRects())) {
      const pad = q.height * 0.2;
      const box = { el, l: Math.max(q.left, l), t: Math.max(q.top + pad, tp), r: Math.min(q.right, r), b: Math.min(q.bottom - pad, b), chrome };
      if (box.r - box.l >= 2 && box.b - box.t >= 2) items.push(box);
    }
  }
  const out = new Set<string>();
  const name = (e: Element) => `"${(e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28)}"`;
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], c = items[j], A = a.el, B = c.el;
    if (A === B || A.contains(B) || B.contains(A) || (!top && (a.chrome || c.chrome))) continue;
    const l = Math.max(a.l, c.l), t = Math.max(a.t, c.t), r = Math.min(a.r, c.r), b = Math.min(a.b, c.b);
    if (r - l < 3 || b - t < 3) continue;
    // Walk the stack at the middle of the overlap from the top: whichever text is met first, anything opaque before
    // the other one (the first one's own box included) covers it.
    let first: Element | null = null, hit = false;
    for (const e of document.elementsFromPoint((l + r) / 2, (t + b) / 2)) {
      const inA = A.contains(e), inB = B.contains(e);
      if (!first) { if (inA || inB) first = inA ? A : B; else if (opaque(e)) break; else continue; }
      if (first === A ? inB : inA) { hit = true; break; }
      if (opaque(e) && !(e.contains(A) && e.contains(B))) break;
    }
    if (hit) out.add(`${name(A)} over ${name(B)} at ${Math.round(l)},${Math.round(t)}`);
  }
  return [...out];
};

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

  // A phone stacks the layout, pins it into one short screen (Safari's small viewport is about 660 px on an iPhone) and
  // wraps labels into each other. Checked at the top through the intro (four looks over about four seconds), then every
  // quarter of a screen down once the scroll-bound motion has caught up: a pinned chapter collides only part of the way.
  test(`no text collisions ${route}`, async ({ page }, info) => {
    test.skip(!isMobile(info), 'phones: the reading spec watches large copy on desktop');
    await page.goto(route, { waitUntil: 'load' });
    await settle(page, 1200);
    const found = new Map<string, number>();
    const look = async (top: boolean) => { const y = await page.evaluate(() => Math.round(scrollY)); for (const s of await page.evaluate(COLLISIONS, top)) if (!found.has(s)) found.set(s, y); };
    for (let i = 0; i < 4; i++) { if (i) await page.waitForTimeout(900); await look(true); }
    const { h, vh } = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, vh: innerHeight }));
    for (let y = Math.round(vh / 4); y < h; y += Math.round(vh / 4)) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), y);
      await page.waitForTimeout(550);
      await look(false);
    }
    expect([...found].map(([s, y]) => `scrollY ${y}: ${s}`), `${route}: text drawn over other text`).toEqual([]);
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
