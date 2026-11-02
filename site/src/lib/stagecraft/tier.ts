/**
 * Device tiering. Decide once, before the first paint, what this device can carry.
 *
 *   low  : static end states, CSS fades, posters, native scroll
 *   mid  : GSAP timelines and pinning, one canvas effect at DPR 1, no smooth scroll on touch
 *   high : everything, canvases at DPR 1.5
 *
 * The synchronous part (`detectTier`) is cheap enough to inline in <head> so CSS can branch on
 * `html[data-tier]` immediately. `refineTier` samples real frame times for a second and can only
 * demote, never promote, so a laggy high-end device gets the lighter path.
 */
export type Tier = 'low' | 'mid' | 'high';

/** Software GL (SwiftShader, llvmpipe, headless) renders a scene at a few frames per second: no WebGL scene there. */
export function softwareGl(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    return /swiftshader|llvmpipe|software|mesa offscreen/i.test(r);
  } catch { return true; }
}

export function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!nav.connection?.saveData;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType || '');
  const mem = nav.deviceMemory ?? 8;      // Chromium only; others report as capable
  const cores = nav.hardwareConcurrency ?? 8;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const webgl2 = (() => { try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch { return false; } })();

  if (reduce || saveData || slowNet || mem <= 2 || cores <= 2 || !webgl2) return 'low';
  if (mem <= 4 || cores <= 4 || coarse) return 'mid';
  return 'high';
}

export function applyTier(tier: Tier = detectTier()): Tier {
  document.documentElement.dataset.tier = tier;
  document.documentElement.classList.add('js');
  if (!('IntersectionObserver' in window)) document.documentElement.classList.add('no-io');
  return tier;
}

/** Sample frame times for `ms`; returns the p95 frame time in milliseconds. */
export function probeFrames(ms = 1000): Promise<number> {
  return new Promise((resolve) => {
    const d: number[] = [];
    let last = performance.now();
    const end = last + ms;
    const tick = (t: number) => {
      d.push(t - last);
      last = t;
      if (t < end) requestAnimationFrame(tick);
      else {
        d.sort((a, b) => a - b);
        resolve(d[Math.floor(d.length * 0.95)] ?? 16);
      }
    };
    requestAnimationFrame(tick);
  });
}

/** Demote the tier if the device cannot hold the frame rate while idle. Measures an idle page, not a loading one: it
 *  waits for the load event and a quiet moment, so parsing, fonts and setup are not read as a slow device. Then the
 *  median and the 90th percentile of a second of frames decide: a device whose typical frame is slow, or whose bad
 *  frames are very bad, steps down. Start heavy work (a 3D scene) only after it resolves. */
export async function refineTier(current: Tier): Promise<Tier> {
  if (current === 'low') return current;
  if (document.readyState !== 'complete') await new Promise((r) => addEventListener('load', r, { once: true }));
  await new Promise((r) => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(r, { timeout: 1500 }) : setTimeout(r, 400)));
  const d = await sampleFrames(1000);
  const p50 = d[Math.floor(d.length * 0.5)] ?? 16, p90 = d[Math.floor(d.length * 0.9)] ?? 16;
  const next: Tier = p50 > 34 || p90 > 60 ? 'low' : (p50 > 22 || p90 > 40) && current === 'high' ? 'mid' : current;
  if (next !== current) document.documentElement.dataset.tier = next;
  return next;
}

/** Frame intervals over `ms`, sorted ascending. The second after a scroll jump (a #link, the End key, a dragged
 *  scrollbar) is left out and the window runs on for it (three times `ms` at most): a page catching up on a jump is not
 *  a slow device, and reading it as one sent a laptop GPU in Firefox to the static page. */
export function sampleFrames(ms = 1000): Promise<number[]> {
  return new Promise((resolve) => {
    const d: number[] = [];
    let last = performance.now(), y = scrollY, skip = 0, end = last + ms;
    const limit = last + ms * 3;
    const tick = (t: number) => {
      if (Math.abs(scrollY - y) > innerHeight * 0.75) skip = 60;
      y = scrollY;
      if (skip > 0) { skip--; end = Math.min(limit, end + (t - last)); } else d.push(t - last);
      last = t;
      if (t < end) requestAnimationFrame(tick); else resolve(d.sort((a, b) => a - b));
    };
    requestAnimationFrame(tick);
  });
}

/** Pixel ratio cap for canvases by tier. */
export function dprFor(tier: Tier): number {
  return Math.min(devicePixelRatio || 1, tier === 'high' ? 1.5 : 1);
}

/** React to the OS preference flipping while the page is open. */
export function onReducedMotionChange(cb: (reduce: boolean) => void) {
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', (e) => cb(e.matches));
  return mq.matches;
}
