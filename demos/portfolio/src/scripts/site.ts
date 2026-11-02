import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { applyTier, refineTier, type Tier } from '../lib/stagecraft/tier';
import { initReveals } from '../lib/stagecraft/reveal';
import { setupScroll } from '../lib/stagecraft/lenis-gsap';

gsap.registerPlugin(ScrollTrigger, Flip);

let teardown: Array<() => void> = [];
const on = (t: EventTarget, k: string, fn: any, opts?: any) => { t.addEventListener(k, fn, opts); teardown.push(() => t.removeEventListener(k, fn, opts)); };

function clock() {
  const el = document.querySelector<HTMLElement>('[data-time]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' });
  const tick = () => { el.textContent = fmt.format(new Date()).replace(':', ' '); };
  tick();
  const id = setInterval(tick, 15000);
  teardown.push(() => clearInterval(id));
}

function previews(tier: Tier, reduce: boolean) {
  const preview = document.querySelector<HTMLElement>('[data-preview]');
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-row]'));
  if (!preview || !rows.length) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || tier === 'low') return;
  const x = gsap.quickTo(preview, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(preview, 'y', { duration: 0.35, ease: 'power3' });
  let current: HTMLElement | null = null;
  const show = (row: HTMLElement) => {
    if (current === row) return;
    current = row;
    const tile = row.querySelector('.tile');
    if (!tile) return;
    preview.replaceChildren(tile.cloneNode(true));
    preview.classList.add('is-on');
    rows.forEach((r) => r.classList.toggle('is-active', r === row));
  };
  const hide = () => { current = null; preview.classList.remove('is-on'); rows.forEach((r) => r.classList.remove('is-active')); };
  on(document, 'pointermove', (e: PointerEvent) => { x(e.clientX); y(e.clientY); }, { passive: true });
  rows.forEach((row) => {
    on(row, 'pointerenter', () => show(row));
    on(row, 'pointerleave', hide);
    on(row, 'focus', () => { const r = row.getBoundingClientRect(); if (reduce) return; x(r.right - 160); y(r.top + r.height / 2); show(row); });
    on(row, 'blur', hide);
  });
  teardown.push(hide);
}

function viewToggle(reduce: boolean) {
  const index = document.querySelector<HTMLElement>('[data-index]');
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-view]'));
  if (!index || !buttons.length) return;
  let saved: string | null = null;
  try { saved = sessionStorage.getItem('view'); } catch {}
  const apply = (view: string, animate: boolean) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    const rows = index.querySelectorAll('.row');
    if (animate && !reduce) {
      const state = Flip.getState(rows);
      // The drawings wait until the rows have landed: mid-morph they would show at the wrong size.
      const tiles = index.querySelectorAll('.row .tile');
      gsap.set(tiles, { autoAlpha: 0 });
      // absolute: true takes the rows out of flow while they move; hold the container's height and ease it to the
      // new one, or the list collapses for a moment and everything below jumps up into view.
      const from = index.offsetHeight;
      index.classList.toggle('is-grid', view === 'grid');
      const to = index.offsetHeight;
      gsap.fromTo(index, { height: from }, { height: to, duration: 0.6, ease: 'power3.inOut' });
      // Release the height when the last staggered row lands, not when the height tween ends.
      Flip.from(state, { duration: 0.6, ease: 'power3.inOut', stagger: 0.02, absolute: true, onComplete: () => { gsap.set(index, { clearProps: 'height' }); gsap.to(tiles, { autoAlpha: 1, duration: 0.35, stagger: 0.03, ease: 'power2.out', clearProps: 'opacity,visibility' }); ScrollTrigger.refresh(); } });
    } else {
      index.classList.toggle('is-grid', view === 'grid');
      ScrollTrigger.refresh();
    }
    try { sessionStorage.setItem('view', view); } catch {}
  };
  if (saved === 'grid') apply('grid', false);
  buttons.forEach((b) => on(b, 'click', () => apply(b.dataset.view!, true)));
}

function ledgerDemo() {
  const root = document.querySelector<HTMLElement>('[data-ledger]');
  if (!root) return;
  const q = root.querySelector<HTMLInputElement>('[data-ledger-q]')!;
  const empty = root.querySelector<HTMLElement>('[data-ledger-empty]')!;
  const days = Array.from(root.querySelectorAll<HTMLElement>('[data-day]'));
  const rows = () => Array.from(root.querySelectorAll<HTMLElement>('.ledger__row:not([hidden])'));
  const filter = () => {
    const term = q.value.trim().toLowerCase();
    let any = false;
    days.forEach((d) => {
      let shown = 0;
      d.querySelectorAll<HTMLElement>('.ledger__row').forEach((r) => { const hit = !term || (r.dataset.text || '').includes(term); r.hidden = !hit; if (hit) shown++; });
      d.hidden = shown === 0;
      any ||= shown > 0;
    });
    empty.hidden = any;
  };
  on(q, 'input', filter);
  on(root, 'keydown', (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const list = rows();
    const i = list.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'ArrowDown' ? list[Math.min(list.length - 1, i + 1)] : list[Math.max(0, i - 1)];
    if (next) { e.preventDefault(); next.focus(); }
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
  clock();
  previews(tier, reduce);
  viewToggle(reduce);
  ledgerDemo();
  cursor(tier);
  (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());
  refineTier(tier);
}
function destroy() { teardown.forEach((fn) => { try { fn(); } catch {} }); teardown = []; }

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', destroy);
