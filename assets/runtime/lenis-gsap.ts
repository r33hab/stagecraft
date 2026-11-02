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

/** Skip links and in-page anchors jump at once and move focus, with or without smooth scroll. */
function anchorHandler(lenis: Lenis | null) {
  return (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector<HTMLElement>(a.getAttribute('href')!);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { immediate: true });
    else target.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', a.getAttribute('href'));
  };
}

export function setupScroll(): ScrollSetup {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tier = document.documentElement.dataset.tier;

  if (!finePointer || reduce || tier === 'low') {
    // Native scroll. ScrollTrigger still works on its own.
    (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());
    const onClick = anchorHandler(null);
    document.addEventListener('click', onClick);
    return {
      lenis: null,
      destroy: () => { document.removeEventListener('click', onClick); ScrollTrigger.getAll().forEach((t) => t.kill()); },
    };
  }

  const lenis = new Lenis({ duration: 1.1, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());

  const onClick = anchorHandler(lenis);
  document.addEventListener('click', onClick);

  // The OS preference can flip while the page is open.
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => { if (mq.matches) destroy(); };
  mq.addEventListener('change', onChange);

  const destroy = () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
    document.removeEventListener('click', onClick);
    mq.removeEventListener('change', onChange);
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
  return { lenis, destroy };
}
