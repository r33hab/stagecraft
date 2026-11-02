import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { applyTier, refineTier, type Tier } from '../lib/stagecraft/tier';
import { initReveals } from '../lib/stagecraft/reveal';
import { setupScroll } from '../lib/stagecraft/lenis-gsap';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

let teardown: Array<() => void> = [];
const on = <K extends keyof DocumentEventMap>(t: EventTarget, k: string, fn: any, opts?: any) => { t.addEventListener(k, fn, opts); teardown.push(() => t.removeEventListener(k, fn, opts)); };

function scramble(tier: Tier, reduce: boolean) {
  const els = document.querySelectorAll<HTMLElement>('[data-scramble]');
  if (!els.length || reduce || tier === 'low') return;
  const glyphs = '0123456789';
  els.forEach((el) => {
    const final = el.textContent || '';
    const run = () => {
      const start = performance.now();
      const dur = 700;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const settled = Math.floor(p * final.length);
        el.textContent = final.split('').map((c, i) => (i < settled || c === ' ' ? c : glyphs[Math.floor(Math.random() * glyphs.length)])).join('');
        if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { run(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    teardown.push(() => { io.disconnect(); el.textContent = final; });
  });
}

function lapStage(tier: Tier, reduce: boolean) {
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  if (!stage) return;
  const track = stage.querySelector<SVGPathElement>('[data-track]')!;
  const sectorLine = Array.from(stage.querySelectorAll<SVGPathElement>('[data-sector-line]'));
  const trail = stage.querySelector<SVGPathElement>('[data-trail]');
  const marker = stage.querySelector<SVGGElement>('[data-marker]')!;
  const speedEl = stage.querySelector<HTMLElement>('[data-speed]')!;
  const gearEl = stage.querySelector<HTMLElement>('[data-gear]')!;
  const timeEl = stage.querySelector<HTMLElement>('[data-laptime]')!;
  const cards = Array.from(stage.querySelectorAll<HTMLElement>('.sector-card'));
  const sectors = cards.map((c) => parseFloat(c.querySelector('b')!.textContent || '0'));
  const total = sectors.reduce((a, b) => a + b, 0);

  if (reduce || tier === 'low') {
    // Static end state: the lap is drawn, the marker sits on the line, readouts show the best lap.
    track.style.strokeDashoffset = '0';
    sectorLine.forEach((l) => { l.style.strokeDashoffset = '0'; l.style.opacity = '1'; });
    speedEl.textContent = '352';
    gearEl.textContent = '8';
    timeEl.textContent = fmt(total);
    cards.forEach((c) => c.classList.add('is-set'));
    return;
  }

  // Speed profile over the lap (0..1 -> km/h), a plausible curve with three big braking zones.
  const speedAt = (p: number) => {
    const zones = [0.08, 0.3, 0.52, 0.7, 0.88];
    let v = 330;
    for (const z of zones) { const d = Math.abs(p - z); if (d < 0.06) v -= (1 - d / 0.06) * 210; }
    return Math.round(Math.max(95, Math.min(352, v)));
  };
  const gearAt = (v: number) => (v > 300 ? 8 : v > 260 ? 7 : v > 220 ? 6 : v > 180 ? 5 : v > 140 ? 4 : v > 110 ? 3 : 2);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: stage, start: 'top top', end: '+=320%', pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true },
  });
  // 0 to 0.2: the track draws; 0.2 to 1: the lap.
  tl.to(track, { strokeDashoffset: 0, ease: 'none', duration: 0.2 }, 0);
  tl.set(sectorLine, { opacity: 1 }, 0.2);
  tl.to(sectorLine, { strokeDashoffset: 0, ease: 'none', duration: 0.8 }, 0.2);
  tl.to(marker, { motionPath: { path: track, align: track, alignOrigin: [0.5, 0.5] }, ease: 'none', duration: 0.8, immediateRender: false }, 0.2);
  // A short bright trail rides just behind the car: one dash of the same path, offset with the progress.
  if (trail) { tl.set(trail, { opacity: 1 }, 0.2); tl.fromTo(trail, { strokeDashoffset: 0.045 }, { strokeDashoffset: -0.955, ease: 'none', duration: 0.8, immediateRender: false }, 0.2); }
  tl.eventCallback('onUpdate', () => {
    const p = Math.max(0, (tl.progress() - 0.2) / 0.8);
    const v = speedAt(p);
    speedEl.textContent = String(v);
    gearEl.textContent = p === 0 ? 'N' : String(gearAt(v));
    timeEl.textContent = fmt(total * p);
    cards.forEach((c, i) => c.classList.toggle('is-set', p >= (i + 1) / cards.length - 0.001));
  });
  teardown.push(() => { tl.scrollTrigger?.kill(); tl.kill(); });
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, '0')}`;
}

function calendarRail(tier: Tier, reduce: boolean) {
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  if (!rail || reduce || tier === 'low') return;
  const tween = gsap.to(rail, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.cal', start: 'top 75%', end: 'bottom 75%', scrub: 0.4 } });
  teardown.push(() => { tween.scrollTrigger?.kill(); tween.kill(); });
}

function menu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const panel = document.getElementById('menu-panel');
  if (!btn || !panel) return;
  const close = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) (panel.querySelector<HTMLElement>('[data-menu-link]') || close)?.focus();
    else btn.focus();
  };
  on(btn, 'click', () => set(panel.hidden));
  if (close) on(close, 'click', () => set(false));
  panel.querySelectorAll('[data-menu-link]').forEach((a) => on(a, 'click', () => set(false)));
  on(document, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape' && !panel.hidden) set(false); });
  teardown.push(() => { document.documentElement.style.overflow = ''; });
}

function marquees() {
  document.querySelectorAll<HTMLButtonElement>('[data-marquee-pause]').forEach((b) => {
    on(b, 'click', () => {
      const paused = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', String(!paused));
      b.closest('.marquee')?.toggleAttribute('data-paused', !paused);
      b.textContent = paused ? 'Pause' : 'Play';
    });
  });
}


function cursor(tier: Tier) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || tier === 'low') return;
  const c = document.querySelector<HTMLElement>('[data-cursor]');
  if (!c) return;
  const html = document.documentElement;
  const move = (e: PointerEvent) => { c.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`; if (!html.classList.contains('has-cursor')) { html.classList.add('has-cursor'); c.classList.remove('is-hidden'); } };
  const over = (e: PointerEvent) => { const t = e.target as Element; c.classList.toggle('is-hover', !!t.closest?.('a, button, [role="button"], summary, label')); c.classList.toggle('is-field', !!t.closest?.('input, textarea, select, [contenteditable]')); };
  const leave = () => c.classList.add('is-hidden'), enter = () => c.classList.remove('is-hidden');
  const key = (e: KeyboardEvent) => { if (e.key === 'Tab') { html.classList.remove('has-cursor'); c.classList.add('is-hidden'); } };
  addEventListener('pointermove', move, { passive: true }); addEventListener('pointerover', over, { passive: true }); html.addEventListener('pointerleave', leave); html.addEventListener('pointerenter', enter); addEventListener('keydown', key);
  teardown.push(() => { removeEventListener('pointermove', move); removeEventListener('pointerover', over); html.removeEventListener('pointerleave', leave); html.removeEventListener('pointerenter', enter); removeEventListener('keydown', key); html.classList.remove('has-cursor'); });
}

function init() {
  const tier = applyTier();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scroll = setupScroll();
  teardown.push(scroll.destroy);
  teardown.push(initReveals());
  scramble(tier, reduce);
  lapStage(tier, reduce);
  calendarRail(tier, reduce);
  menu();
  marquees();
  cursor(tier);
  (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());
  refineTier(tier);
}

function destroy() {
  teardown.forEach((fn) => { try { fn(); } catch {} });
  teardown = [];
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', destroy);

// The sign-up has no server behind it (a demo): it confirms in place and sends nothing. Delegated, so it holds after a
// client-side page swap (data-astro-reload keeps the router off it); without script the form is a GET to its own
// anchor with no named fields, so nothing leaves.
document.addEventListener('submit', (e) => {
  const f = (e.target as Element | null)?.closest<HTMLFormElement>('form[data-signup]');
  if (!f) return;
  e.preventDefault();
  const done = f.querySelector<HTMLElement>('[data-signup-done]');
  if (done) done.textContent = "You're on the list. This is a demo site, so nothing was sent.";
  f.classList.add('is-done');
}, true);   // capture: before a client router can take the submit
