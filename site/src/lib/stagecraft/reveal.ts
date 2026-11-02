/**
 * In-view reveals that can never leave content hidden.
 *
 *  - CSS hides `[data-reveal]` only under `html.js`, so no-JS renders everything.
 *  - IntersectionObserver adds `.is-visible` once; children of `[data-reveal-group]` get `--i`
 *    for a staggered transition-delay.
 *  - A timeout makes every element visible 2.5 s after it was observed, whatever happened.
 *  - Under reduced motion everything is visible immediately.
 *
 * Pair with assets/runtime/motion.css. Where native scroll-driven animations are supported the
 * CSS takes over and this script is a no-op for those elements.
 */
export function initReveals(root: ParentNode = document, timeoutMs = 2500) {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!els.length) return () => {};
  const show = (el: HTMLElement) => el.classList.add('is-visible');

  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    els.forEach(show);
    return () => {};
  }

  // stagger index for groups
  for (const group of Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-group]'))) {
    Array.from(group.children).forEach((child, i) => (child as HTMLElement).style.setProperty('--i', String(i)));
  }

  const timers = new WeakMap<Element, number>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        show(e.target as HTMLElement);
        io.unobserve(e.target);
        const t = timers.get(e.target);
        if (t) clearTimeout(t);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  );

  for (const el of els) {
    if (el.classList.contains('is-visible')) continue;
    io.observe(el);
    // safety net: whatever the observer thinks, the content shows up
    timers.set(el, window.setTimeout(() => { show(el); io.unobserve(el); }, timeoutMs));
  }
  return () => io.disconnect();
}
