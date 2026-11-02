import { test, expect, cfg, routes, settle, throttle, isMobile, fmtKb } from './fixtures';

const B = cfg.budgets;

const observerScript = `
(() => {
  const s = (window.__sc = { lcp: 0, lcpEl: null, cls: 0, longTasks: [] });
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { s.lcp = e.renderTime || e.loadTime || e.startTime; s.lcpEl = e.element ? e.element.tagName + (e.url ? ' ' + e.url.split('/').pop() : '') : null; } })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) s.cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) s.longTasks.push(Math.round(e.duration)); })
      .observe({ type: 'longtask', buffered: true });
  } catch {}
})();`;

for (const route of routes) {
  test(`vitals and weight ${route}`, async ({ page }, info) => {
    test.skip(!/desktop|mobile-low/.test(info.project.name), 'perf runs on the Chromium desktop and mobile-low projects');
    const low = info.project.name === 'mobile-low';
    await page.addInitScript(observerScript);
    if (low) await throttle(page, 4);

    const t0 = Date.now();
    await page.goto(route, { waitUntil: 'load' });
    const loadMs = Date.now() - t0;
    await settle(page, 1200);

    // Frame-time sampling while scrolling: start the sampler, scroll from the test, then collect.
    const sampler = page.evaluate(
      (ms) =>
        new Promise<number[]>((resolve) => {
          const d: number[] = [];
          let last = performance.now();
          const end = last + ms;
          const tick = (t: number) => { d.push(t - last); last = t; if (t < end) requestAnimationFrame(tick); else resolve(d); };
          requestAnimationFrame(tick);
        }),
      3500,
    );
    const longBefore = await page.evaluate(() => (window as any).__sc.longTasks.length);
    const started = Date.now();
    while (Date.now() - started < 3200) {
      try { await page.mouse.wheel(0, 240); } catch { await page.evaluate(() => window.scrollBy(0, 240)); }
      await page.waitForTimeout(60);
    }
    const deltas = await sampler;
    deltas.sort((a, b) => a - b);
    const p95 = deltas[Math.floor(deltas.length * 0.95)] ?? 0;
    const p50 = deltas[Math.floor(deltas.length * 0.5)] ?? 0;

    // Force LCP to finalise, then read everything.
    await page.mouse.move(10, 10);
    await page.keyboard.press('Shift');
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const sc = (window as any).__sc;
      const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const cat = (r: PerformanceResourceTiming) => {
        const u = r.name.split('?')[0].toLowerCase();
        if (/\.(js|mjs)$/.test(u) || r.initiatorType === 'script') return 'script';
        if (/\.css$/.test(u) || r.initiatorType === 'css') return 'css';
        if (/\.(woff2?|ttf|otf)$/.test(u)) return 'font';
        if (/\.(avif|webp|png|jpe?g|gif|svg)$/.test(u) || r.initiatorType === 'img') return 'image';
        if (/\.(mp4|webm|m4v|mov|m3u8|ts)$/.test(u) || r.initiatorType === 'video') return 'media';
        return 'other';
      };
      const by: Record<string, { n: number; bytes: number; unmeasured: number; files: { name: string; kb: number }[] }> = {};
      for (const r of res) {
        const c = cat(r);
        by[c] ??= { n: 0, bytes: 0, unmeasured: 0, files: [] };
        by[c].n++;
        const size = r.transferSize || r.encodedBodySize || 0;
        if (!size) by[c].unmeasured++;
        by[c].bytes += size;
        by[c].files.push({ name: r.name.split('/').pop()!.split('?')[0].slice(0, 48), kb: Math.round(size / 1024) });
      }
      for (const k in by) by[k].files.sort((a, b) => b.kb - a.kb);
      const families = new Set<string>();
      try { (document as any).fonts.forEach((f: FontFace) => { if (f.status === 'loaded') families.add(f.family.replace(/["']/g, '')); }); } catch {}
      const lcpImg = (() => {
        const imgs = Array.from(document.images).filter((i) => { const r = i.getBoundingClientRect(); return r.top < innerHeight && r.width * r.height > 40000; });
        const i = imgs[0];
        if (!i) return null;
        return { src: i.currentSrc.split('/').pop()?.slice(0, 48), lazy: i.loading === 'lazy', fetchpriority: (i as any).fetchPriority || 'auto', hasSize: !!(i.getAttribute('width') && i.getAttribute('height')) || getComputedStyle(i).aspectRatio !== 'auto', bytes: (res.find((r) => r.name === i.currentSrc) as any)?.transferSize || 0 };
      })();
      return {
        lcp: Math.round(sc.lcp), lcpEl: sc.lcpEl, cls: +sc.cls.toFixed(3), longTasks: sc.longTasks as number[],
        by, domNodes: document.getElementsByTagName('*').length, families: [...families], html: Math.round((nav?.transferSize || 0) / 1024),
        lcpImg,
      };
    });

    const longDuring = m.longTasks.slice(longBefore);
    const longTotal = longDuring.reduce((a, b) => a + Math.max(0, b - 50), 0);
    const longMax = Math.max(0, ...longDuring);
    const kb = (c: string) => Math.round((m.by[c]?.bytes || 0) / 1024);
    const total = Object.values(m.by).reduce((a, b) => a + b.bytes, 0) / 1024 + m.html;
    const lazyRe = new RegExp((cfg.lazyChunks || []).join('|'), 'i');
    const scriptFiles = m.by.script?.files ?? [];
    const initialScriptKb = scriptFiles.filter((f) => !lazyRe.test(f.name) || !cfg.lazyChunks?.length).reduce((a, f) => a + f.kb, 0);
    const lazyScriptKb = scriptFiles.filter((f) => cfg.lazyChunks?.length && lazyRe.test(f.name)).reduce((a, f) => a + f.kb, 0);
    const unmeasured = Object.values(m.by).reduce((a, b) => a + b.unmeasured, 0);

    const rows = [
      ['project', info.project.name], ['route', route], ['load (ms)', loadMs], ['LCP (ms)', `${m.lcp} ${m.lcpEl ? '← ' + m.lcpEl : ''}`], ['CLS', m.cls],
      ['long tasks during scroll', `${longDuring.length} (max ${longMax} ms, blocking ${longTotal} ms)`], ['frame p50 / p95 (ms)', `${p50.toFixed(1)} / ${p95.toFixed(1)}`],
      ['HTML', `${m.html} KB`], ['scripts initial / lazy', `${initialScriptKb} / ${lazyScriptKb} KB (${scriptFiles.length} files)`], ['css', `${kb('css')} KB`],
      ['fonts', `${kb('font')} KB (${m.by.font?.n || 0} files, families: ${m.families.join(', ') || 'none loaded'})`], ['images', `${kb('image')} KB (${m.by.image?.n || 0})`], ['media', `${kb('media')} KB (${m.by.media?.n || 0})`],
      ['total first view', `${Math.round(total)} KB`], ['DOM nodes', m.domNodes], ['hero image', m.lcpImg ? `${m.lcpImg.src} ${fmtKb(m.lcpImg.bytes)} lazy=${m.lcpImg.lazy} fetchpriority=${m.lcpImg.fetchpriority} sized=${m.lcpImg.hasSize}` : 'none in first viewport'],
      ['unmeasured cross-origin resources', unmeasured],
    ];
    console.log(`\n[stagecraft perf] ${route} (${info.project.name})\n` + rows.map(([k, v]) => `  ${String(k).padEnd(32)} ${v}`).join('\n'));
    if (scriptFiles.length) console.log('  largest scripts: ' + scriptFiles.slice(0, 5).map((f) => `${f.name} ${f.kb}KB`).join(', '));

    const soft = (cond: boolean, msg: string) => { if (!cond) console.warn(`[stagecraft] ${route}: ${msg}`); };

    expect(m.cls, 'CLS').toBeLessThanOrEqual(B.cls);
    expect(initialScriptKb, 'initial script KB').toBeLessThanOrEqual(B.scriptKb);
    expect(Math.max(0, ...scriptFiles.filter((f) => lazyRe.test(f.name) && cfg.lazyChunks?.length).map((f) => f.kb)), 'largest lazy chunk KB').toBeLessThanOrEqual(B.lazyChunkKb);
    expect(kb('css'), 'CSS KB').toBeLessThanOrEqual(B.cssKb);
    expect(m.families.length, `font families (${m.families.join(', ')})`).toBeLessThanOrEqual(B.fontFamilies);
    expect(kb('font'), 'font KB').toBeLessThanOrEqual(B.fontKb);
    expect(m.domNodes, 'DOM nodes').toBeLessThanOrEqual(B.domNodes);
    if (m.lcpImg) {
      expect(m.lcpImg.lazy, 'hero image is lazy-loaded').toBeFalsy();
      expect(m.lcpImg.hasSize, 'hero image has width/height or aspect-ratio').toBeTruthy();
      soft(m.lcpImg.fetchpriority === 'high', 'hero image has no fetchpriority="high"');
      if (m.lcpImg.bytes) expect(Math.round(m.lcpImg.bytes / 1024), 'hero image KB').toBeLessThanOrEqual(B.heroImageKb);
    }
    if (low) {
      expect(m.lcp, 'LCP (ms) on throttled mobile').toBeLessThanOrEqual(B.lcpMs);
      expect(longMax, 'longest task during scroll (ms)').toBeLessThanOrEqual(B.longTaskMaxMs);
      expect(longTotal, 'total blocking during scroll (ms)').toBeLessThanOrEqual(B.longTaskTotalMs);
      expect(p95, 'frame time p95 (ms) while scrolling').toBeLessThanOrEqual(B.frameP95Ms);
      expect(kb('image'), 'image KB on mobile').toBeLessThanOrEqual(B.imageKbMobile);
      expect(Math.round(total), 'total first-view KB on mobile').toBeLessThanOrEqual(B.totalKbMobile);
    } else {
      soft(m.lcp <= B.lcpMs, `desktop LCP ${m.lcp} ms over ${B.lcpMs}`);
      expect(Math.round(total), 'total first-view KB on desktop').toBeLessThanOrEqual(B.totalKbDesktop);
    }
    soft(unmeasured === 0, `${unmeasured} cross-origin resources report no size (missing Timing-Allow-Origin); budgets may be under-counted`);
    void isMobile;
  });
}
