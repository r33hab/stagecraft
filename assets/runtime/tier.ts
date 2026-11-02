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

/** Demote the tier if the device cannot hold 50 fps while idle. Call after the first paint. */
export async function refineTier(current: Tier): Promise<Tier> {
  if (current === 'low') return current;
  const p95 = await probeFrames(1000);
  const next: Tier = p95 > 40 ? 'low' : p95 > 24 && current === 'high' ? 'mid' : current;
  if (next !== current) document.documentElement.dataset.tier = next;
  return next;
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
