/**
 * One ticker for smooth scroll and scroll-bound animation.
 *
 * Lenis smooths wheel input on fine-pointer devices; touch stays native (syncTouch false). GSAP's
 * ticker drives Lenis, Lenis updates ScrollTrigger, and lagSmoothing is off so the two never fight.
 * Returns a teardown for client-side navigations (astro:before-swap, Next route change).
 *
 * npm i gsap lenis
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export type ScrollSetup = { lenis: Lenis | null; destroy: () => void };

/** Arriving at a #target on a new page: the sections above it can still grow while the page sets itself up (spacers
 *  sized by script, pins, fonts), so one jump lands short. Follow the target until its place holds still for half a
 *  second (at most two seconds), and let go the moment the visitor scrolls. */
function arriveAt(target: HTMLElement, lenis: Lenis | null) {
  let last = NaN, still = 0, frames = 0, stop = false;
  const cancel = () => { stop = true; };
  const opts = { once: true, passive: true } as AddEventListenerOptions;
  addEventListener('wheel', cancel, opts); addEventListener('touchstart', cancel, opts); addEventListener('keydown', cancel, opts);
  const check = () => {
    if (stop || ++frames > 120) return;
    const top = Math.round(target.getBoundingClientRect().top + scrollY);
    if (top !== last) {
      last = top; still = 0;
      if (lenis) { lenis.resize(); lenis.scrollTo(target, { immediate: true, force: true }); }
      else target.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
      ScrollTrigger.update();
    } else if (++still > 30) return;
    requestAnimationFrame(check);
  };
  requestAnimationFrame(check);
}

/** Links that stay on this page. An in-page anchor (`#id`, or `/page/#id` while on /page/) jumps at once and moves
 *  focus. A link to the page you are on (the logo on the home page) scrolls back to the top: a client router sees
 *  the same URL and does nothing, and Lenis would keep its position. Registered in the capture phase so it runs
 *  before the router. */
function anchorHandler(lenis: Lenis | null) {
  return (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!a || a.target || a.hasAttribute('download') || a.getAttribute('href') === '#') return;
    const to = new URL(a.href, location.href);
    if (to.origin !== location.origin || to.pathname !== location.pathname || to.search !== location.search) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const focusOn = (el: HTMLElement) => { if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); };
    if (to.hash) {
      const target = document.getElementById(decodeURIComponent(to.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { immediate: true });
      else target.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
      focusOn(target);
      history.replaceState(history.state, '', to.hash);
      return;
    }
    e.preventDefault();
    if (lenis && !reduce) lenis.scrollTo(0, { duration: Math.min(2, 0.7 + (scrollY / innerHeight) * 0.1), easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: 0, behavior: (reduce ? 'instant' : 'smooth') as ScrollBehavior });
    // A keyboard press (detail 0) moves focus to the top of the page as a navigation would.
    if (e.detail === 0) { const m = document.querySelector<HTMLElement>('main'); if (m) focusOn(m); }
  };
}

export function setupScroll(): ScrollSetup {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tier = document.documentElement.dataset.tier;

  if (!finePointer || reduce || tier === 'low') {
    // Native scroll. ScrollTrigger still works on its own.
    (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());
    const first = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (first) arriveAt(first, null);
    const onClick = anchorHandler(null);
    document.addEventListener('click', onClick, true);
    return {
      lenis: null,
      destroy: () => { document.removeEventListener('click', onClick, true); ScrollTrigger.getAll().forEach((t) => t.kill()); },
    };
  }

  const lenis = new Lenis({ duration: 1.1, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());

  const onClick = anchorHandler(lenis);
  document.addEventListener('click', onClick, true);
  // a page opened at #target (a link from another page, a shared link)
  const first = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (first) arriveAt(first, lenis);

  // A client router (Astro's ClientRouter, a Next route change) swaps the page but keeps this Lenis, which still holds
  // the old position: re-sync it once the new page has set itself up (the frame after page-load, so pinned spacers
  // exist). A new page starts at the top or at its #target; back and forward return to the saved position.
  let navType = '', swapped = false;
  const onBeforeSwap = (e: Event) => { navType = (e as any).navigationType || 'push'; };
  const onAfterSwap = () => { swapped = true; };
  const onPageLoad = () => {
    if (!swapped) return;
    swapped = false;
    requestAnimationFrame(() => {
      lenis.resize();
      const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      if (navType === 'traverse') lenis.scrollTo(history.state?.scrollY ?? scrollY, { immediate: true, force: true });
      else if (target) arriveAt(target, lenis);
      else lenis.scrollTo(0, { immediate: true, force: true });
      ScrollTrigger.update();
    });
  };
  document.addEventListener('astro:before-swap', onBeforeSwap);
  document.addEventListener('astro:after-swap', onAfterSwap);
  document.addEventListener('astro:page-load', onPageLoad);

  // The OS preference can flip while the page is open.
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => { if (mq.matches) destroy(); };
  mq.addEventListener('change', onChange);

  const destroy = () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('astro:before-swap', onBeforeSwap);
    document.removeEventListener('astro:after-swap', onAfterSwap);
    document.removeEventListener('astro:page-load', onPageLoad);
    mq.removeEventListener('change', onChange);
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
  return { lenis, destroy };
}
