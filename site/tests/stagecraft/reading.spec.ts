import { test, expect, cfg, routes, settle, slug } from './fixtures';

/**
 * Reading check. Scrolls each route at a steady reading pace and watches every large text block,
 * the way a visitor meets the page. It fails when:
 *  - copy stops being readable before it has held for `minHoldVp` viewports of scroll, however
 *    it goes: faded, masked or clipped in place, or carried off by a track or parallax that moves
 *    faster than the scroll (ordinary scrolling holds a block for about one viewport);
 *  - a block sits in view for a whole viewport of scroll and never becomes readable;
 *  - the viewport shows nothing (no visible text, under 5 % media) for longer than `maxBlankMs`:
 *    a transition with an empty middle;
 *  - two large blocks overlap on screen, both visible, with nothing opaque between them: a
 *    crossfade or slide that stacks copy.
 * Copy that is readable at load is exempt from the hold rule: the visitor reads it before scrolling.
 * Fixed or sticky chrome (a header or nav that is fixed or sticky, or [data-chrome]) does not count as
 * content for the empty-screen rule.
 * Mark deliberate exceptions with `data-allow-hidden`. Desktop Chromium only.
 */

const R = { speed: 500, minHoldVp: 0.6, minFontPx: 26, maxBlankMs: 400, maxCollisions: 0, ...((cfg as any).reading || {}) };

const SAMPLER = (o: { minFontPx: number }) => {
  const S: any = ((window as any).__reading = { wheel: 0, rows: [], els: [] as Element[], t0: 0 });
  addEventListener('wheel', (e) => { S.wheel += (e as WheelEvent).deltaY; }, { capture: true, passive: true });
  const own = (el: Element) => [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent || '').trim().length > 1);
  const skip = (el: Element) => !!el.closest('[aria-hidden="true"], [data-allow-hidden], [data-preloader], noscript, template');
  const pick = () => {
    for (const el of Array.from(document.querySelectorAll('h1, h2, h3, h4, p, blockquote, li, span, div, a, figcaption, dd'))) {
      if (S.els.length > 220) break;
      if (S.els.includes(el) || skip(el)) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      const heading = /^H[12]$/.test(el.tagName);
      if (!(heading || (own(el) && fs >= o.minFontPx))) continue;
      if (S.els.some((p: Element) => p.contains(el))) continue;
      S.els.push(el);
    }
  };
  const vis = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return null;
    const vw = innerWidth, vh = innerHeight;
    const raw = (Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))) / (r.width * r.height);
    if (raw <= 0) return { r, raw: 0, shown: 0, op: 0 };
    let op = 1, n: Element | null = el, box = { l: r.left, t: r.top, rr: r.right, b: r.bottom };
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      op *= +cs.opacity;
      if (cs.visibility === 'hidden' || cs.display === 'none') op = 0;
      if (n !== el && /(hidden|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
        const p = n.getBoundingClientRect();
        box = { l: Math.max(box.l, p.left), t: Math.max(box.t, p.top), rr: Math.min(box.rr, p.right), b: Math.min(box.b, p.bottom) };
      }
      if (cs.clipPath && cs.clipPath !== 'none' && /inset\((?:9\d|100)%/.test(cs.clipPath)) op = 0;
      n = n.parentElement;
    }
    const clipped = Math.max(0, Math.min(box.rr, vw) - Math.max(box.l, 0)) * Math.max(0, Math.min(box.b, vh) - Math.max(box.t, 0));
    return { r, raw, shown: clipped / (r.width * r.height), op };
  };
  // Fixed or sticky chrome (a site header, a nav bar, anything marked data-chrome) is not content.
  const chrome = (el: Element) => {
    if (el.closest('[data-chrome]')) return true;
    let n: Element | null = el.closest('header, nav, [role="banner"], [role="navigation"]');
    while (n) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') return true; n = n.parentElement?.closest('header, nav, [role="banner"], [role="navigation"]') ?? null; }
    return false;
  };
  const anything = () => {
    const vw = innerWidth, vh = innerHeight;
    let media = 0;
    for (const m of Array.from(document.querySelectorAll('img, video, canvas, svg, picture'))) {
      if (m.closest('[data-cursor]') || chrome(m)) continue;
      const v = vis(m); if (!v || v.op < 0.5) continue;
      media += (Math.max(0, Math.min(v.r.right, vw) - Math.max(v.r.left, 0)) * Math.max(0, Math.min(v.r.bottom, vh) - Math.max(v.r.top, 0))) / (vw * vh);
      if (media > 0.05) return true;
    }
    for (const t of Array.from(document.querySelectorAll('h1, h2, h3, h4, p, li, a, button, span, label, dd, dt, td, figcaption, small, code'))) {
      if (!own(t) || t.closest('[aria-hidden="true"]') || chrome(t)) continue;
      const v = vis(t); if (v && v.op >= 0.5 && v.shown >= 0.5) return true;
    }
    return false;
  };
  const collide = (rows: any[]) => {
    const out: string[] = [];
    const live = rows.filter((x) => x.op >= 0.35 && x.shown >= 0.3);
    for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
      const a = live[i], b = live[j];
      const A = S.els[a.i] as Element, B = S.els[b.i] as Element;
      if (A.contains(B) || B.contains(A)) continue;
      const l = Math.max(a.r.left, b.r.left), t = Math.max(a.r.top, b.r.top), rr = Math.min(a.r.right, b.r.right), bb = Math.min(a.r.bottom, b.r.bottom);
      if (rr <= l || bb <= t) continue;
      const inter = (rr - l) * (bb - t), small = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      if (inter < small * 0.15) continue;
      let hitA = false, hitB = false, covered = false;
      // Walk the stack from the top. Once one block is hit, anything opaque before the other block
      // (its own card included) covers it: that is a stack, not a collision.
      for (const e of document.elementsFromPoint((l + rr) / 2, (t + bb) / 2)) {
        if (A.contains(e)) hitA = true;
        if (B.contains(e)) hitB = true;
        if (hitA && hitB) break;
        if ((hitA || hitB) && !A.contains(e) && !B.contains(e) && !(e.contains(A) && e.contains(B))) {
          const bg = getComputedStyle(e).backgroundColor.match(/[\d.]+/g);
          if (bg && (bg.length < 4 || +bg[3] >= 0.85) && bg.length >= 3) { covered = true; break; }
        }
      }
      if (!covered) out.push(`${(A.textContent || '').trim().slice(0, 30)} / ${(B.textContent || '').trim().slice(0, 30)}`);
    }
    return out;
  };
  let last = 0, k = 0;
  const loop = (now: number) => {
    if (S.on && now - last >= 50) {
      last = now;
      if (k++ % 20 === 0) pick();
      const rows: any[] = [];
      S.els.forEach((el: Element, i: number) => { if (!el.isConnected) return; const v = vis(el); if (v && v.raw > 0) rows.push({ i, raw: +v.raw.toFixed(2), shown: +v.shown.toFixed(2), op: +v.op.toFixed(2), r: v.r }); });
      const row: any = { t: Math.round(now - S.t0), y: Math.round(scrollY), w: Math.round(S.wheel), e: rows.map(({ r, ...x }) => x) };
      if (k % 4 === 0) { row.any = anything(); row.hit = collide(rows); }
      S.rows.push(row);
    }
    requestAnimationFrame(loop);
  };
  addEventListener('DOMContentLoaded', () => requestAnimationFrame(loop));
};

function judge(data: any, vh: number) {
  const virt = Math.max(...data.rows.map((r: any) => r.y)) < 100;
  const pos = (r: any) => (virt ? r.w : r.y);
  const per: Record<number, any[]> = {};
  for (const r of data.rows) for (const e of r.e) (per[e.i] = per[e.i] || []).push({ ...e, p: pos(r), t: r.t });
  const early: string[] = [], never: string[] = [];
  for (const [i, arr] of Object.entries(per)) {
    const label = data.labels[+i] || `#${i}`;
    let start: any = null, ever = false;
    for (const x of arr) {
      const readable = x.op >= 0.9 && x.shown >= 0.6;
      if (readable) { ever = true; if (!start) start = x; continue; }
      if (start) {
        const held = (x.p - start.p) / vh;
        const how = x.raw >= 0.6 ? 'in place' : 'carried off';
        if (start.p > 5 && held < R.minHoldVp) early.push(`"${label}" readable for ${held.toFixed(2)} vp, then ${how} (at ${(x.p / vh).toFixed(1)} vp)`);
        start = null;
      }
    }
    const span = (arr[arr.length - 1].p - arr[0].p) / vh;
    if (!ever && span >= 1 && arr.some((x) => x.raw >= 0.9)) never.push(`"${label}" in view for ${span.toFixed(1)} vp, never readable`);
  }
  const blanks: string[] = [];
  let b0: any = null;
  for (const r of data.rows.filter((r: any) => 'any' in r)) {
    if (!r.any) { if (!b0) b0 = r; }
    else if (b0) { const ms = r.t - b0.t; if (ms > R.maxBlankMs) blanks.push(`${ms} ms empty from ${(pos(b0) / vh).toFixed(1)} vp`); b0 = null; }
  }
  const hits = new Map<string, number>();
  for (const r of data.rows) for (const h of r.hit || []) hits.set(h, (hits.get(h) || 0) + 1);
  const collisions = [...hits].filter(([, n]) => n >= 2).map(([h, n]) => `${h} (${n} samples)`);
  return { early, never, blanks, collisions, virt };
}

for (const route of routes) {
  test(`reading: copy holds, no empty frames, no stacked copy ${route}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'pace and pins are checked once, on desktop Chromium');
    test.setTimeout(200_000);
    await page.addInitScript(SAMPLER, { minFontPx: R.minFontPx });
    await page.goto(route, { waitUntil: 'load' });
    await settle(page, 1500);
    await page.evaluate(() => { const S = (window as any).__reading; S.t0 = performance.now(); S.on = true; });
    // Wheel from the right edge so the pointer never hovers content (hover swaps would read as copy leaving).
    { const v = page.viewportSize()!; await page.mouse.move(v.width - 3, Math.round(v.height / 2)); }
    const step = (R.speed * 50) / 1000, t0 = Date.now();
    let still = 0;
    while (Date.now() - t0 < 150_000) {
      await page.mouse.wheel(0, step);
      await page.waitForTimeout(50);
      const [y, max] = await page.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight]);
      if (max > 50 && y >= max - 2) { if (++still > 30) break; } else still = 0;
      if (max <= 50 && Date.now() - t0 > 90_000) break;
    }
    const data = await page.evaluate(() => { const S = (window as any).__reading; S.on = false; return { rows: S.rows, labels: S.els.map((e: Element) => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)) }; });
    const vh = page.viewportSize()!.height;
    const v = judge(data, vh);
    const report = [
      `[stagecraft reading] ${route} (${v.virt ? 'virtual' : 'native'} scroll, ${R.speed} px/s)`,
      `  gone before it could be read (under ${R.minHoldVp} vp): ${v.early.length}`, ...v.early.map((s) => `    ${s}`),
      `  never readable: ${v.never.length}`, ...v.never.map((s) => `    ${s}`),
      `  empty stretches: ${v.blanks.length}`, ...v.blanks.map((s) => `    ${s}`),
      `  stacked copy: ${v.collisions.length}`, ...v.collisions.map((s) => `    ${s}`),
    ].join('\n');
    console.log(report);
    await info.attach(`reading-${slug(route)}.txt`, { body: report, contentType: 'text/plain' });
    expect(v.early, 'copy that is gone before it has held long enough to read').toEqual([]);
    expect(v.never, 'copy that is in view but never becomes readable').toEqual([]);
    expect(v.blanks, 'moments where the screen shows nothing').toEqual([]);
    expect(v.collisions.length, 'large copy stacked on other copy').toBeLessThanOrEqual(R.maxCollisions);
  });
}
