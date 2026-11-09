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

    // The hero image is judged at first view, before any scrolling: the LCP element when it is an image, otherwise
    // the first visible image of 200 x 200 px or more in the viewport. Hidden or later images (a poster in a closed
    // panel further down) are not the hero.
    const heroImg = await page.evaluate(() => {
      const sc = (window as any).__sc;
      const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const shown = (i: HTMLImageElement) => { const r = i.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.width * r.height > 40000 && (i as any).checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }) !== false; };
      const imgs = Array.from(document.images).filter(shown);
      const byLcp = sc?.lcpEl?.startsWith('IMG') ? imgs.find((i) => sc.lcpEl.endsWith(i.currentSrc.split('/').pop() || '\u0000')) : undefined;
      const i = byLcp || imgs[0];
      if (!i) return null;
      return { src: i.currentSrc.split('/').pop()?.slice(0, 48), lazy: i.loading === 'lazy', fetchpriority: (i as any).fetchPriority || 'auto', hasSize: !!(i.getAttribute('width') && i.getAttribute('height')) || getComputedStyle(i).aspectRatio !== 'auto', bytes: (res.find((r) => r.name === i.currentSrc) as any)?.transferSize || 0 };
    });

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
        if (/\.(woff2?|ttf|otf)$/.test(u)) return 'font';      // before css: @font-face files have initiatorType 'css'
        if (/\.css$/.test(u) || r.initiatorType === 'css') return 'css';
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
      // Metric-matched fallback faces (local() with size-adjust) are not downloads; they do not count.
      try { (document as any).fonts.forEach((f: FontFace) => { if (f.status === 'loaded' && !/fallback/i.test(f.family)) families.add(f.family.replace(/["']/g, '')); }); } catch {}
      return {
        lcp: Math.round(sc.lcp), lcpEl: sc.lcpEl, cls: +sc.cls.toFixed(3), longTasks: sc.longTasks as number[],
        by, domNodes: document.getElementsByTagName('*').length, families: [...families], html: Math.round((nav?.transferSize || 0) / 1024),
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

    const screens = await page.evaluate(() => Math.round((document.documentElement.scrollHeight / innerHeight) * 10) / 10);
    const rows = [
      ['project', info.project.name], ['route', route], ['load (ms)', loadMs], ['LCP (ms)', `${m.lcp} ${m.lcpEl ? '← ' + m.lcpEl : ''}`], ['CLS', m.cls],
      ['long tasks during scroll', `${longDuring.length} (max ${longMax} ms, blocking ${longTotal} ms)`], ['frame p50 / p95 (ms)', `${p50.toFixed(1)} / ${p95.toFixed(1)}`],
      ['HTML', `${m.html} KB`], ['scripts initial / lazy', `${initialScriptKb} / ${lazyScriptKb} KB (${scriptFiles.length} files)`], ['css', `${kb('css')} KB`],
      ['fonts', `${kb('font')} KB (${m.by.font?.n || 0} files, families: ${m.families.join(', ') || 'none loaded'})`], ['images', `${kb('image')} KB (${m.by.image?.n || 0})`], ['media', `${kb('media')} KB (${m.by.media?.n || 0})`],
      ['total first view', `${Math.round(total)} KB`], ['DOM nodes', m.domNodes], ['hero image', heroImg ? `${heroImg.src} ${fmtKb(heroImg.bytes)} lazy=${heroImg.lazy} fetchpriority=${heroImg.fetchpriority} sized=${heroImg.hasSize}` : 'none in first viewport'],
      ['scroll length (screens)', screens], ['unmeasured cross-origin resources', unmeasured],
    ];
    console.log(`\n[stagecraft perf] ${route} (${info.project.name})\n` + rows.map(([k, v]) => `  ${String(k).padEnd(32)} ${v}`).join('\n'));
    if (scriptFiles.length) console.log('  largest scripts: ' + scriptFiles.slice(0, 5).map((f) => `${f.name} ${f.kb}KB`).join(', '));

    const soft = (cond: boolean, msg: string) => { if (!cond) console.warn(`[stagecraft] ${route}: ${msg}`); };
    if (!low) { if (B.scrollScreens) expect(screens, 'scroll length in screens (see ux.md, page map)').toBeLessThanOrEqual(B.scrollScreens); else soft(screens <= 12, `scroll length ${screens} screens; past 12 a landing usually wants a page map (ux.md), set budgets.scrollScreens to enforce`); }

    expect(m.cls, 'CLS').toBeLessThanOrEqual(B.cls);
    expect(initialScriptKb, 'initial script KB').toBeLessThanOrEqual(B.scriptKb);
    expect(Math.max(0, ...scriptFiles.filter((f) => lazyRe.test(f.name) && cfg.lazyChunks?.length).map((f) => f.kb)), 'largest lazy chunk KB').toBeLessThanOrEqual(B.lazyChunkKb);
    expect(kb('css'), 'CSS KB').toBeLessThanOrEqual(B.cssKb);
    expect(m.families.length, `font families (${m.families.join(', ')})`).toBeLessThanOrEqual(B.fontFamilies);
    expect(kb('font'), 'font KB').toBeLessThanOrEqual(B.fontKb);
    expect(m.domNodes, 'DOM nodes').toBeLessThanOrEqual(B.domNodes);
    if (heroImg) {
      expect(heroImg.lazy, 'hero image is lazy-loaded').toBeFalsy();
      expect(heroImg.hasSize, 'hero image has width/height or aspect-ratio').toBeTruthy();
      soft(heroImg.fetchpriority === 'high', 'hero image has no fetchpriority="high"');
      if (heroImg.bytes) expect(Math.round(heroImg.bytes / 1024), 'hero image KB').toBeLessThanOrEqual(B.heroImageKb);
    }
    if (low) {
      // A desktop-first site (intake Q8, "platform": "desktop-first") shows phones a composed version on purpose:
      // its mobile budgets warn instead of failing. Everything else still gates.
      const atMost = (v: number, max: number, msg: string) => (cfg.platform === 'desktop-first' ? soft(v <= max, `${msg}: ${v} over ${max} (desktop-first: warning)`) : expect(v, msg).toBeLessThanOrEqual(max));
      atMost(m.lcp, B.lcpMs, 'LCP (ms) on throttled mobile');
      atMost(longMax, B.longTaskMaxMs, 'longest task during scroll (ms)');
      atMost(longTotal, B.longTaskTotalMs, 'total blocking during scroll (ms)');
      atMost(p95, B.frameP95Ms, 'frame time p95 (ms) while scrolling');
      atMost(kb('image'), B.imageKbMobile, 'image KB on mobile');
      atMost(Math.round(total), B.totalKbMobile, 'total first-view KB on mobile');
    } else {
      soft(m.lcp <= B.lcpMs, `desktop LCP ${m.lcp} ms over ${B.lcpMs}`);
      expect(Math.round(total), 'total first-view KB on desktop').toBeLessThanOrEqual(B.totalKbDesktop);
    }
    soft(unmeasured === 0, `${unmeasured} cross-origin resources report no size (missing Timing-Allow-Origin); budgets may be under-counted`);
    void isMobile;
  });
}
