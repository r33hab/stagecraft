import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { applyTier, refineTier, softwareGl, type Tier } from '../lib/stagecraft/tier';
import { initReveals } from '../lib/stagecraft/reveal';
import { setupScroll } from '../lib/stagecraft/lenis-gsap';
import { stageDefaults, type Stage } from '../lib/kino/shot';
import { chapters as data, anchors, EYE } from '../data/halde';

gsap.registerPlugin(ScrollTrigger);

const tier: Tier = applyTier();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
setupScroll();
initReveals();

const stage = document.querySelector<HTMLElement>('[data-stage]')!;
const canvas = stage.querySelector<HTMLCanvasElement>('[data-world]')!;
const timeEl = stage.querySelector<HTMLElement>('[data-time]')!;
const chapters = Array.from(stage.querySelectorAll<HTMLElement>('[data-ch]'));
const dots = Array.from(stage.querySelectorAll<HTMLElement>('[data-dot]'));
// The stage's state is animated from the start; the renderer (a lazy chunk with three.js) adopts it once it has loaded
// after the device check.
const animated = !(tier === 'low' || reduce);
const ws = stageDefaults();
Object.assign(ws, { spin: -0.5, wire: 0, wipe: 1, draw: 1, anchors }); Object.assign(ws.shot, data[0].shot);
let world: Stage = null;

if (!animated) {
  // Static: six stacked chapters, each with a still of its shot (see global.css), no pin.
  document.documentElement.classList.add('is-static');
  document.documentElement.dataset.tier = 'low';
} else {
  // Only draw while the stage is on screen and the tab is visible.
  let onScreen = true;
  const sync = () => (onScreen && !document.hidden ? world?.play() : world?.pause());
  const io = new IntersectionObserver((es) => { onScreen = es.some((e) => e.isIntersecting); sync(); }, { threshold: 0.01 });
  io.observe(stage);
  document.addEventListener('visibilitychange', sync);


  const seg = chapters.length; // 6 chapters -> 6 segments of the pin
  let lastDot = -1;
  const tl = gsap.timeline({
    scrollTrigger: { trigger: stage, start: 'top top', end: `+=${seg * 170}%`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
    },
    // the footage counter and the rail follow the playhead itself (scrubbed), not the last scroll event
    onUpdate: () => {
      const p = Math.min(seg - 1, tl.time());          // 0..5 across chapters (the ending runs on past 5)
      // the footage counter: 25 feet of film across the six chapters
      const ft = `FT ${String(Math.round((p / (seg - 1)) * 25)).padStart(2, '0')}`;
      if (timeEl.textContent !== ft) timeEl.textContent = ft;
      const active = Math.min(seg - 1, Math.round(p));
      if (active !== lastDot) { lastDot = active; dots.forEach((d, k) => d.classList.toggle('is-active', k === active)); }
    },
  });
  // A device that cannot hold the frame rate is demoted to low after start: tear the motion down and clear its inline
  // styles, so the stacked static chapters (global.css) show instead of copy left hidden by the timeline.
  refineTier(tier).then((next) => {
    if (next !== 'low') {
      // never on a software renderer (the scene would run on the CPU): the poster stays
      if (softwareGl()) return;
      import('../lib/kino/stage').then(({ createStage }) => createStage(canvas, canvas.dataset.src!, next === 'high' ? 'high' : 'mid', ws, { parts: true })).then((w) => { world = w; if (w) { stage.classList.add('has-world'); sync(); } }).catch(() => {});
      return;
    }
    tl.scrollTrigger?.kill(true); tl.kill();
    gsap.set([...chapters, stage, '.scroll-cue'], { clearProps: 'all' });
    document.documentElement.classList.add('is-static');
  });
  // The camera's shot across the chapters (positions in chapter units, 0..5, then the ending to 5.8): it moves between
  // chapters and holds while each one reads. Chapter 4 takes the lit camera apart (each part off along its own axis, outermost first) and wipes
  // the parts and the studio into an exploded drawing on paper; chapter 5 puts it back together in the drawing and wipes
  // it back into the light; after chapter 6 the camera turns round and the page goes in through its eyepiece.
  // (Rebuilt waits for the parts to come home before the camera closes in)
  data.forEach((c, i) => { if (i > 0) tl.to(ws.shot, { ...c.shot, duration: 0.55, ease: 'power2.inOut' }, i + (c.move ?? -0.45)); });
  // (the parts start once the shot has pulled back, so none leaves the frame)
  tl.to(ws, { explode: 1, duration: 0.5, ease: 'none' }, 2.72)                   // apart, in the light (parts ease themselves)
    .set(ws, { wire: 1 }, 3.15)
    .to(ws, { wipe: 0, duration: 0.4, ease: 'power2.inOut' }, 3.2)              // into the exploded drawing
    .to(ws, { explode: 0, duration: 0.4, ease: 'none' }, 3.6)                    // rebuilt, in the drawing
    .to(ws, { wipe: 1, duration: 0.4, ease: 'power2.inOut' }, 4.0)              // back to the light
    .set(ws, { wire: 0 }, 4.42)
    // the ending: the camera turns round on its stand (once Rolling has been read), the view swings onto the eyepiece
    // and pushes toward it; the eyecup and the viewfinder (endTick, below) hand over to the page
    .to(ws, { spin: -0.5 + Math.PI, duration: 0.45, ease: 'power2.inOut' }, 4.95)
    .to(ws, { dive: 1, duration: 0.5, ease: 'none' }, 5.3);                      // ends at 5.8: the timeline's length
  // The studio background and the copy colour follow the wipe.
  let lastWipe = -1;
  // Text that the edge crosses is painted in two colours split at the edge: light over the studio, ink over the paper.
  const splitEls = Array.from(stage.querySelectorAll<HTMLElement>('.ch__title, .ch__text, .stage__model, .stage__time'));
  const syncWipe = () => {
    if (ws.wipe === lastWipe) return;
    lastWipe = ws.wipe; stage.style.setProperty('--wipe', ws.wipe.toFixed(4));
    const crossing = ws.wipe > 0.001 && ws.wipe < 0.999;
    stage.classList.toggle('is-crossing', crossing);
    stage.classList.toggle('is-paper', ws.wipe <= 0.001);
    if (!crossing) return;
    const sb = stage.getBoundingClientRect(), edge = sb.left + ws.wipe * sb.width;
    for (const el of splitEls) { const r = el.getBoundingClientRect(); el.style.setProperty('--edge', `${(((edge - r.left) / Math.max(1, r.width)) * 100).toFixed(2)}%`); }
  };
  gsap.ticker.add(syncWipe);
  // Labels in the scene: each callout is pinned to its point on the camera every frame, and shows while its chapter
  // holds (in after the shot has arrived, out before it leaves); the leader line draws from the part to the label.
  const cos = Array.from(stage.querySelectorAll<HTMLElement>('[data-co]'));
  const pinCallouts = () => {
    if (!world) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    for (const el of cos) {
      const sc = ws.screen[+el.dataset.coAnchor!]; if (!sc) continue;
      el.style.transform = `translate3d(${(sc.x * w).toFixed(1)}px, ${(sc.y * h).toFixed(1)}px, 0)`; el.classList.toggle('is-off', !sc.on);
      // a label that would run off an edge goes to the other side of its part
      const dx0 = +el.dataset.dx!, room = dx0 > 0 ? w - sc.x * w - dx0 : sc.x * w + dx0, flip = room < 210;
      const dx = flip ? -dx0 : dx0;
      if (el.dataset.side !== String(dx)) { el.dataset.side = String(dx); el.style.setProperty('--dx', `${dx}px`); el.classList.toggle('is-left', dx < 0); el.querySelector('line')?.setAttribute('x2', String(dx)); }
    }
  };
  gsap.ticker.add(pinCallouts);
  // The ending, as the landing enters: the world darkens round the eyepiece like an eyecup, then the page opens out of
  // its glass as a growing circle under the viewfinder's frame lines; the viewfinder then leaves with the stage as the
  // next section comes up on the same ink. Both follow the eyepiece on screen (the renderer projects it every frame).
  const cup = document.createElement('i'); cup.className = 'eyecup'; cup.setAttribute('aria-hidden', 'true');
  const vf = document.createElement('i'); vf.className = 'vf'; vf.setAttribute('aria-hidden', 'true');
  vf.innerHTML = '<b></b><b></b><b></b><b></b><i class="vf__x"></i><span class="vf__l">16 fps</span><span class="vf__r">FT 25</span>';
  stage.append(cup, vf);
  const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let ending = false;
  const endTick = () => {
    const d = ws.dive;
    if (d < 0.5) { if (ending) { ending = false; cup.style.opacity = '0'; vf.style.opacity = '0'; vf.style.clipPath = 'circle(0px at 50% 50%)'; } return; }
    ending = true;
    const b = stage.getBoundingClientRect(), r = canvas.getBoundingClientRect(), s = ws.screen;
    const on = !!world && !!s[EYE]?.on && !!s[EYE + 2];
    const at = (i: number) => [r.left + s[i].x * r.width - b.left, r.top + s[i].y * r.height - b.top];
    const [x, y] = on ? at(EYE) : [b.width / 2, b.height / 2];
    const glass = on ? Math.hypot(at(EYE + 1)[0] - x, at(EYE + 1)[1] - y) : b.height * 0.06;
    const ring = on ? Math.hypot(at(EYE + 2)[0] - x, at(EYE + 2)[1] - y) : b.height * 0.16;
    const o = smooth(0.76, 0.94, d), far = Math.hypot(Math.max(x, b.width - x), Math.max(y, b.height - y)), rad = glass + (far - glass) * o * o;
    cup.style.opacity = smooth(0.52, 0.79, d).toFixed(3);
    cup.style.setProperty('--ex', `${x.toFixed(1)}px`); cup.style.setProperty('--ey', `${y.toFixed(1)}px`); cup.style.setProperty('--er', `${ring.toFixed(1)}px`);
    vf.style.opacity = d >= 0.76 ? '1' : '0';
    vf.style.clipPath = `circle(${rad.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
    vf.style.setProperty('--ix', `${x.toFixed(1)}px`); vf.style.setProperty('--iy', `${y.toFixed(1)}px`); vf.style.setProperty('--ir', `${rad.toFixed(1)}px`);
  };
  gsap.ticker.add(endTick);
  data.forEach((c, i) => {
    const group = cos.filter((el) => el.dataset.coChapter === c.id);
    if (!group.length) return;
    tl.fromTo(group, { autoAlpha: 0, '--draw': 0 } as any, { autoAlpha: 1, '--draw': 1, duration: 0.14, stagger: 0.03, ease: 'power2.out' } as any, i + 0.08)
      .to(group, { autoAlpha: 0, duration: 0.08, ease: 'power2.in' }, i + 0.72);
  });
  // Chapter copy: one at a time, crossfading around each chapter mark.
  chapters.forEach((c, i) => {
    // Reading time: each copy holds for ~70 % of its segment. The hand-over is sequential (the old copy has left before
    // the new one rises, 0.02 of a segment apart), so two chapters never stack; the model line above stays meanwhile.
    if (i > 0) tl.fromTo(c, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, i - 0.1);
    tl.to(c, { autoAlpha: 0, y: -12, duration: 0.1, ease: 'power2.in' }, i < seg - 1 ? i + 0.78 : 5.42);
  });
  tl.to('.scroll-cue', { autoAlpha: 0, duration: 0.3 }, 0.2);

  // Rail dots jump to a chapter's position in the pin.
  dots.forEach((d, i) => d.addEventListener('click', (e) => {
    e.preventDefault();
    const st = tl.scrollTrigger!;
    window.scrollTo({ top: st.start + (i / tl.duration()) * (st.end - st.start), behavior: 'instant' as ScrollBehavior });
  }));
  // Header links to chapters do the same.
  document.querySelectorAll<HTMLAnchorElement>('.top__nav a[href^="#"]').forEach((a) => {
    const i = chapters.findIndex((c) => '#' + c.id === a.getAttribute('href'));
    if (i < 0) return;
    a.addEventListener('click', (e) => { e.preventDefault(); const st = tl.scrollTrigger!; window.scrollTo({ top: st.start + (i / tl.duration()) * (st.end - st.start), behavior: 'instant' as ScrollBehavior }); });
  });
  (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    // The view of the camera turns a little with the pointer: an object on a stand, not a picture.
    addEventListener('pointermove', (e) => { gsap.to(ws.look, { x: (e.clientX / innerWidth - 0.5) * 1.6, y: -(e.clientY / innerHeight - 0.5) * 1.2, duration: 1.4, ease: 'power3.out', overwrite: 'auto' }); }, { passive: true });
  }
}

// Custom cursor on fine pointers only (CSS hides it elsewhere).
if (matchMedia('(hover: hover) and (pointer: fine)').matches && tier !== 'low') {
  const c = document.querySelector<HTMLElement>('[data-cursor]');
  if (c) {
    const html = document.documentElement;
    addEventListener('pointermove', (e) => { c.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`; if (!html.classList.contains('has-cursor')) { html.classList.add('has-cursor'); c.classList.remove('is-hidden'); } }, { passive: true });
    addEventListener('pointerover', (e) => { const t = e.target as Element; c.classList.toggle('is-hover', !!t.closest?.('a, button, [role="button"], summary, label')); c.classList.toggle('is-field', !!t.closest?.('input, textarea, select, [contenteditable]')); }, { passive: true });
    html.addEventListener('pointerleave', () => c.classList.add('is-hidden'));
    html.addEventListener('pointerenter', () => c.classList.remove('is-hidden'));
    addEventListener('keydown', (e) => { if (e.key === 'Tab') { html.classList.remove('has-cursor'); c.classList.add('is-hidden'); } });
  }
}
if (!animated) refineTier(tier);

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
