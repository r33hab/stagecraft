import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { applyTier, refineTier, softwareGl, type Tier } from '../lib/stagecraft/tier';
import { initReveals } from '../lib/stagecraft/reveal';
import { setupScroll } from '../lib/stagecraft/lenis-gsap';
import { stageDefaults, flight, REST, EYE, type Stage } from '../lib/kino/shot';

gsap.registerPlugin(ScrollTrigger);

type Direction = { name: string; feel: string; bg: string; fg: string; accent: string; face: string; weight: number; caps: boolean; sample: string };

const tier: Tier = applyTier();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = !reduce && tier !== 'low';
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const scroll = setupScroll();
// One frame-rate check per page load, before anything heavy starts (a shader compile would read as a slow device).
const tierCheck = refineTier(tier);

// Per-page teardown for client-side navigation (Astro ClientRouter).
let cleanups: Array<() => void> = [];
let demoted: Array<() => void> = [];   // run after the teardown when the device is demoted to low
const later = (fn: () => void) => cleanups.push(fn);

/* Hero: the skill builds a launch page for the Halde 8, a restored 1958 cine camera, around a live render of the real
   object. Brief, intake, static frame (dashed blocks; the camera drawn in ink, from its base up), tokens (the studio and
   the lit camera wipe in across the drawing, the serif title), motion (the camera turns on its stand, the footage
   counter runs, the title changes), tests. When the visitor scrolls, the camera swings round and flies into its lens. */
function heroStage() {
  const root = document.querySelector<HTMLElement>('[data-build]');
  if (!root) return null;
  const q = (s: string) => root.querySelector<HTMLElement>(s)!;
  const qa = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s));
  const frame = q('[data-build-frame]'), page = q('[data-build-page]'), blocks = qa('[data-build-block]');
  const bars = qa('[data-build-bars]'), words = qa('[data-build-word]');
  const clock = q('[data-bn-clock]'), dots = qa('[data-bn-dot]');
  // The stage's state is animated from the start; the renderer adopts it once it has loaded (after first paint).
  const ws = stageDefaults();
  ws.anchors = EYE;   // projected every frame: the journey opens the page out of the eyepiece's glass
  let world: Stage = null;
  const brief = q('[data-build-brief]'), qs = qa('[data-build-q] li'), consoleEl = q('[data-build-console]'), ticks = qa('[data-build-tick]');
  const steps = qa('[data-build-steps] li');
  const pvStep = root.querySelector<HTMLElement>('[data-pv-step]'), stepNames = steps.map((s) => s.textContent || '');
  const step = (i: number) => () => { steps.forEach((s, k) => s.classList.toggle('is-active', k === i)); if (pvStep) pvStep.textContent = `0${i + 1} ${stepNames[i]} · ${i + 1} of 6`; };
  const nextWord = q('[data-bn-next]'), text1 = q('[data-bn-text]'), text2 = q('[data-bn-next-text]');
  // the footage counter of the camera: feet of film run through it
  const time = { m: 0 };
  const showTime = () => { clock.textContent = `FT ${String(Math.round(time.m)).padStart(2, '0')}`; };
  const dot = (i: number) => () => dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
  // The camera's turn: the build's own (sp.v) plus the scroll flight's (turn), so neither overwrites the other.
  const sp = { v: 0 };
  let turn = 0, mark = -1;   // mark: the build step the page shows
  const applySpin = () => { ws.spin = sp.v + turn; };

  const finished = () => {
    // The jump to the finished night is instant: no 2 s colour transitions on every line of the drawing (that much
    // repainting lands right on the start of the dive).
    page.classList.add('is-instant');
    page.classList.add('is-tokens', 'is-motion');
    requestAnimationFrame(() => requestAnimationFrame(() => page.classList.remove('is-instant')));
    gsap.set(blocks, { opacity: 1, y: 0 }); gsap.set(words, { yPercent: 0 });
    Object.assign(ws, { wire: 0, wipe: 1, draw: 1, light: 1 }); sp.v = -0.5; applySpin();
    gsap.set([brief, ...qs], { opacity: 0 }); gsap.set(consoleEl, { opacity: 1, y: 0 }); gsap.set(ticks, { '--tick': 1 } as any);
    gsap.set(words, { yPercent: -110 }); gsap.set(nextWord, { yPercent: 0 }); gsap.set(text1, { autoAlpha: 0 }); gsap.set(text2, { autoAlpha: 1 });
    time.m = 25; showTime(); dot(1)(); step(5)(); mark = 5;
  };
  if (!motion) { page.classList.add('no-world'); finished(); return null; }

  // Every start state is set explicitly, so a repeat starts clean.
  const initial = () => {
    page.classList.remove('is-tokens', 'is-motion'); step(0)(); dot(0)(); mark = 0;
    gsap.set(brief, { opacity: 0, y: 14 }); gsap.set(qs, { opacity: 0, x: -10 }); gsap.set(blocks, { opacity: 0, y: 12 });
    gsap.set(bars, { opacity: 1 }); gsap.set(words, { yPercent: 110 });
    Object.assign(ws, { wire: 1, wipe: 0, draw: 0, light: 1, dive: 0 }); Object.assign(ws.shot, REST); sp.v = 0; applySpin();
    gsap.set(consoleEl, { opacity: 0, y: 10 }); gsap.set(ticks, { '--tick': 0 } as any);
    gsap.set(nextWord, { yPercent: 110 }); gsap.set(text1, { autoAlpha: 1 }); gsap.set(text2, { autoAlpha: 0 });
    time.m = 0; showTime();
  };
  initial();
  // The build's state that is not a tween (the step list, the page's classes, the rail dot) follows the playhead from
  // labels, so the build can be scrubbed both ways: the scroll winds it on, scrolling back unwinds it.
  const syncMarks = () => {
    const t = tl.time(), L = tl.labels;
    let s = 0; for (let i = 1; i <= 5; i++) if (t >= L[`s${i}`]) s = i;
    if (s === mark) return;
    mark = s; step(s)(); dot(s >= 4 ? 1 : 0)();
    page.classList.toggle('is-tokens', s >= 3); page.classList.toggle('is-motion', s >= 4);
  };
  const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.4, defaults: { ease: 'power3.out' }, onUpdate: () => syncMarks(), onRepeat: initial });
  tl.to(brief, { opacity: 1, y: 0, duration: 0.6 })
    .to({}, { duration: 1.3 })
    .addLabel('s1')
    .to(qs, { opacity: 1, x: 0, duration: 0.35, stagger: 0.3 })
    .to({}, { duration: 1 })
    .addLabel('s2')
    .to([brief, ...qs], { opacity: 0, y: -16, duration: 0.35, ease: 'power2.in', stagger: 0.02 })
    .to(blocks, { opacity: 1, y: 0, duration: 0.45, stagger: 0.1 }, '-=0.1')
    // the camera draws itself in ink, from its base up
    .to(ws, { draw: 1, duration: 2.2, ease: 'power1.inOut' }, '<')
    .to({}, { duration: 0.4 })
    .addLabel('s3')
    // the studio and the lit camera cross the drawing: a moving edge, left to right
    .to(ws, { wipe: 1, duration: 1.5, ease: 'power2.inOut' }, '<')
    .set(bars, { opacity: 0 }, '+=0.35')
    .to(words, { yPercent: 0, duration: 1.1, ease: 'expo.out' }, '<')
    .to({}, { duration: 1.4 })
    .addLabel('s4')
    .to(time, { m: 25, duration: 2.6, ease: 'power1.inOut', onUpdate: showTime })
    .to(sp, { v: -0.5, duration: 2.6, ease: 'power2.inOut', onUpdate: applySpin }, '<')
    .to(words, { yPercent: -110, duration: 0.6, ease: 'power3.in' }, '<')
    .to(text1, { autoAlpha: 0, duration: 0.4 }, '<')
    .to(nextWord, { yPercent: 0, duration: 1.1, ease: 'expo.out' }, '>-0.1')
    .to(text2, { autoAlpha: 1, duration: 0.6 }, '<+0.2')
    .addLabel('night')
    .to({}, { duration: 0.6 })
    .addLabel('s5')
    .to(consoleEl, { opacity: 1, y: 0, duration: 0.4 })
    .to(ticks, { '--tick': 1, duration: 0.3, stagger: 0.22, ease: 'back.out(2.5)' } as any)
    .addLabel('done')
    .to({}, { duration: 1.6 });

  let visible = true, hidden = document.hidden, held = false, replaying = false, worldOn = true, from = 0;
  // The world renders while the frame shows it: on screen, tab visible, and not covered by a door preview.
  const sync = () => {
    (visible && !hidden && (!held || replaying) ? tl.play() : tl.pause());
    const covered = !['night', 'method', 'suite', undefined].includes(frame.dataset.pv);
    (visible && !hidden && worldOn && !covered ? world?.play() : world?.pause());
  };
  // The page's studio background and the edge line follow the same wipe as the model.
  let lastWipe = -1;
  // Text the edge crosses is painted in two colours split at the edge: light over the studio, ink over the paper.
  const splitEls = qa('.bn__brand, .bn__times span, .bn__hud > span:first-child, .bn__clock, .bn__swap > *');
  const syncWipe = () => {
    if (ws.wipe === lastWipe) return;
    lastWipe = ws.wipe; page.style.setProperty('--wipe', ws.wipe.toFixed(4));
    const crossing = ws.wipe > 0.002 && ws.wipe < 0.998;
    page.classList.toggle('is-wiping', crossing);
    page.classList.toggle('is-lit', ws.wipe >= 0.998);
    if (!crossing) return;
    const pb = page.getBoundingClientRect(), edge = pb.left + ws.wipe * pb.width;
    for (const el of splitEls) { const r = el.getBoundingClientRect(); el.style.setProperty('--edge', `${(((edge - r.left) / Math.max(1, r.width)) * 100).toFixed(2)}%`); }
  };
  gsap.ticker.add(syncWipe);
  later(() => gsap.ticker.remove(syncWipe));
  // Load the world after first paint; until then the timeline runs over the paper page.
  const canvas = root.querySelector<HTMLCanvasElement>('[data-bn-world]')!;
  // three.js and the renderer are a separate chunk, fetched only here
  const loadWorld = () => import('../lib/kino/stage').then(({ createStage }) => createStage(canvas, canvas.dataset.src!, tier === 'high' ? 'high' : 'mid', ws)).then((w) => {
    world = w;
    if (!w) { page.classList.add('no-world'); return; }
    page.classList.add('has-world'); sync();
  }).catch(() => page.classList.add('no-world'));
  // after the device check: on a device that cannot hold the frame rate the poster stays
  // (and never on a software renderer: the scene would run on the CPU)
  tierCheck.then((next) => { if (next === 'low' || softwareGl()) page.classList.add('no-world'); else loadWorld(); });
  const io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); sync(); }, { threshold: 0.1 });
  io.observe(frame);
  const onVis = () => { hidden = document.hidden; sync(); };
  document.addEventListener('visibilitychange', onVis);
  const ready = Promise.race([(document as any).fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 900))]);
  ready.then(() => setTimeout(sync, 350));

  if (finePointer) {
    const hero = root.closest<HTMLElement>('.hero') || root;
    const onMove = (e: PointerEvent) => {
      if (held) return;
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / innerWidth, y = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      gsap.to(frame, { rotateY: x * 9, rotateX: -y * 7, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
      // and the view of the camera turns a little with the pointer: an object on a stand, not a picture
      gsap.to(ws.look, { x: x * 1.4, y: -y * 1.2, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
    };
    hero.addEventListener('pointermove', onMove, { passive: true });
    later(() => hero.removeEventListener('pointermove', onMove));
  }
  later(() => { tl.kill(); world?.destroy(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); });
  // A device demoted after start shows what the static path shows: the finished page over the poster.
  demoted.push(() => { page.classList.add('no-world'); finished(); });
  // Scrolling into the journey shows the finished night (the frame then grows into the dark intake);
  // scrolling back to the top restarts the build. The Method door replays the build in the docked frame.
  return {
    // The scroll flight, p 0..1: the picture recentres, the camera turns round on its stand, the view swings onto the
    // eyepiece and pushes toward it. (While the build plays, the build owns the turn.)
    fly: (p: number) => {
      const f = flight(p);
      ws.shot.sx = f.sx; ws.dive = f.dive; turn = f.turn; applySpin();
      if (p > 0) { gsap.killTweensOf(ws.look); ws.look.x = 0; ws.look.y = 0; }
    },
    // the journey pauses the world while the intake covers it, and resumes it at the dock
    setWorld: (on: boolean) => { if (worldOn === on) return; worldOn = on; sync(); },
    // the render size: the frame's own size at rest; once it starts to grow, the size it will have on the full screen
    // (set once, so the canvas is never reallocated while the frame scales)
    setRes: (k: number) => { if (Math.abs(ws.resScale - k) > 0.01) ws.resScale = k; },
    sync: () => sync(),
    // the eyepiece on screen, in px: its centre, the radius of its glass and of its ring (null without the live scene)
    eye: () => {
      const s = ws.screen;
      if (!world || !s[0]?.on || !s[2]) return null;
      const r = canvas.getBoundingClientRect(), at = (i: number) => [r.left + s[i].x * r.width, r.top + s[i].y * r.height];
      const [x, y] = at(0), g = at(1), k = at(2);
      return { x, y, glass: Math.hypot(g[0] - x, g[1] - y), ring: Math.hypot(k[0] - x, k[1] - y) };
    },
    replay: (on: boolean) => {
      if (replaying === on) return;
      replaying = on;
      if (on) { initial(); tl.restart(); } else { tl.pause(); finished(); }
      sync();
    },
    // The scroll winds the build on to its end (k 0..1), from wherever it was when the scroll began, so the camera is
    // never cut in; scrolling back unwinds it, and back at the top it plays on from there.
    wind: (k: number) => {
      const h = k > 0;
      if (h !== held) {
        held = h;
        if (h) { from = Math.min(tl.time(), tl.labels.done); gsap.to(frame, { rotateX: 0, rotateY: 0, duration: 0.4, overwrite: 'auto' }); }
        sync();
      }
      if (h && !replaying) tl.time(from + (tl.labels.done - from) * k);
    },
  };
}

/* The journey: the frame rides a sticky stage. It builds a page in the hero, expands to full bleed, hosts the
   questions sideways, then docks beside the doors as a live preview. Durations are pixels of scroll. */
type StageCtl = { wind: (k: number) => void; replay: (on: boolean) => void; fly: (p: number) => void; setWorld: (on: boolean) => void; setRes: (k: number) => void; sync: () => void; eye: () => { x: number; y: number; glass: number; ring: number } | null };
function journey(stageCtl: StageCtl | null) {
  const spacer = document.querySelector<HTMLElement>('[data-journey]');
  const stage = spacer?.querySelector<HTMLElement>('[data-journey-stage]');
  if (!spacer || !stage || !motion) return;
  const q = (sel: string) => stage.querySelector<HTMLElement>(sel)!;
  const copy = q('[data-journey-copy]'), steps = q('[data-build-steps]'), frame = q('[data-build-frame]'), slot = q('[data-build-slot]');
  const scene = q('[data-build-scene]'), pv = q('[data-build-pv]'), jq = q('[data-journey-q]'), track = q('[data-hz-track]'), rail = q('[data-hz-progress]');
  const jd = q('[data-journey-doors]'), dock = q('[data-dock-slot]');
  const cap = spacer.querySelector<HTMLElement>('[data-dive-cap]')!;
  const pvCtl = dockPreviews(frame, stage, stageCtl);
  const stageSky = stageCtl;
  // The docked frame leans into the page.
  const tilt = { rotateY: -9, rotateX: 4 };
  const html = document.documentElement;
  html.classList.add('has-journey');
  stage.append(frame);
  // The eye at the eyepiece: an eyecup that darkens the world around it (above the frame, under the intake) and the
  // viewfinder's frame lines over the intake while it opens out of the glass.
  const cup = document.createElement('i'); cup.className = 'eyecup'; cup.setAttribute('aria-hidden', 'true'); stage.append(cup);
  const vf = document.createElement('i'); vf.className = 'vf'; vf.setAttribute('aria-hidden', 'true');
  vf.innerHTML = '<b></b><b></b><b></b><b></b><i class="vf__x"></i><span class="vf__l">16 fps</span><span class="vf__r">FT 25</span>';
  jq.prepend(vf);
  let irisTick: (() => void) | null = null;
  const panels = track.children.length;
  const vh = () => innerHeight, vw = () => innerWidth;
  const rect = (el: HTMLElement) => { const r = el.getBoundingClientRect(), b = stage.getBoundingClientRect(); return { left: r.left - b.left, top: r.top - b.top, width: r.width, height: r.height }; };
  const distance = () => Math.max(0, track.scrollWidth - vw());
  let tl: gsap.core.Timeline | null = null;
  const build = () => {
    tl?.scrollTrigger?.kill(); tl?.kill();
    gsap.set([jq, jd], { autoAlpha: 0 }); gsap.set(track, { x: 0 }); gsap.set([copy, steps], { autoAlpha: 1, y: 0 }); gsap.set(scene, { opacity: 1 }); gsap.set(pv, { opacity: 0 });
    gsap.set(track.querySelectorAll('.hz__n'), { xPercent: 0 });
    // The frame keeps its hero size and moves by transform only (no layout, no layout shift): cover on expand, exact on dock.
    const home = rect(slot);
    gsap.set(frame, { left: home.left, top: home.top, width: home.width, height: home.height, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, transformOrigin: '50% 50%', borderRadius: 6 });
    // Centre-origin transforms: cover the viewport on the dive, fit the dock slot at the end.
    const cx = home.left + home.width / 2, cy = home.top + home.height / 2;
    const full = () => ({ x: vw() / 2 - cx, y: vh() / 2 - cy, scale: Math.max(vw() / home.width, vh() / home.height) * 1.02 });
    const fullScale = full().scale;
    const docked = () => { const r = rect(dock); return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy, scale: Math.min(r.width / home.width, r.height / home.height) }; };
    // The flight: the frame grows flat into the screen while the camera inside turns round on its stand and the view
    // swings onto its eyepiece and pushes toward it; the world goes dark around the eyepiece and the questions open
    // out of its glass, seen through the viewfinder.
    const fly = { p: 0 };
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1b1d22';
    const applyFly = () => stageSky?.fly(fly.p);
    const resetCam = () => { fly.p = 0; stageSky?.fly(0); };
    resetCam();
    const rows = Array.from(frame.querySelectorAll<HTMLElement>('.bn__top, .bn__hud, .bn__rail, .build__console')), pageCopy = frame.querySelector<HTMLElement>('.bn__copy')!;
    const introBits = Array.from(jq.querySelectorAll<HTMLElement>('.hz__panel--intro .chapter__head, .hz__panel--intro .h2, .hz__panel--intro .lede'));
    gsap.set(introBits, { y: 0, autoAlpha: 1 });
    // Pixels of scroll per beat. The questions move in steps: each panel holds, then the track glides to the next,
    // so every question is readable for about a viewport instead of sliding past at scroll speed.
    frame.dataset.pv = 'night';
    const kids = Array.from(track.children) as HTMLElement[];
    const stops = kids.map((k) => -Math.min(k.offsetLeft, distance()));
    const d = { hold: vh() * 0.35, expand: vh() * 1.15, push: vh() * 0.8, intro: vh() * 0.85, step: vh() * 0.55, move: vh() * 0.65, dock: vh() * 0.8, end: vh() * 0.7 };
    const slide = d.intro + (kids.length - 1) * (d.move + d.step);
    spacer.style.height = `${vh() + d.hold + d.expand + d.push + slide + d.dock + d.end}px`;
    // The flight starts while the frame is still growing and runs on after it fills the screen.
    const pushAt = d.expand * 0.25, pushLen = d.expand * 0.75 + d.push, pushEnd = pushAt + pushLen;
    gsap.set(jq, { clipPath: 'inset(0px 0px 0px 0px round 0px)', backgroundColor: '' });
    // Moments of the flight (p 0..1) as timeline positions; the eyecup closes over CUP, the intake opens over IRIS.
    const flyAt = (p: number) => `expand+=${pushAt + p * pushLen}`;
    const CUP = [0.72, 0.88], IRIS = [0.86, 1];
    const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    // The eyecup and the iris follow the eyepiece on screen every frame (the renderer projects it; without the live
    // scene they centre on the screen). The iris opens from the glass slowly, then fast, past the farthest corner.
    let irisOn = false;
    if (irisTick) gsap.ticker.remove(irisTick);
    irisTick = () => {
      if (!tl) return;
      const p = (tl.time() - d.hold - pushAt) / pushLen;
      if (p < CUP[0] || p > 1.02) {
        if (irisOn) { irisOn = false; cup.style.opacity = '0'; vf.style.opacity = '0'; jq.style.clipPath = 'inset(0px 0px 0px 0px round 0px)'; }
        return;
      }
      irisOn = true;
      const b = stage.getBoundingClientRect(), e = stageCtl?.eye();
      const x = (e ? e.x : b.left + b.width / 2) - b.left, y = (e ? e.y : b.top + b.height / 2) - b.top;
      const ring = e ? e.ring : b.height * 0.16, glass = e ? e.glass : b.height * 0.06;
      const o = smooth(IRIS[0], IRIS[1], p), far = Math.hypot(Math.max(x, b.width - x), Math.max(y, b.height - y));
      const r = glass + (far - glass) * o * o;
      cup.style.opacity = smooth(CUP[0], CUP[1], p).toFixed(3);
      cup.style.setProperty('--ex', `${x.toFixed(1)}px`); cup.style.setProperty('--ey', `${y.toFixed(1)}px`); cup.style.setProperty('--er', `${ring.toFixed(1)}px`);
      jq.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
      vf.style.setProperty('--ix', `${x.toFixed(1)}px`); vf.style.setProperty('--iy', `${y.toFixed(1)}px`); vf.style.setProperty('--ir', `${r.toFixed(1)}px`);
      vf.style.opacity = (1 - smooth(0.97, 1.02, p)).toFixed(3);
    };
    gsap.ticker.add(irisTick);
    // State follows the playhead (the timeline's own update), so it is right however the visitor arrives: a wheel,
    // a jump, a reload halfway down or a link back to the top.
    let hideAt = Infinity;
    tl = gsap.timeline({ defaults: { ease: 'none' },
      onUpdate: () => {
        if (!tl) return;
        const t = tl.time(), L = tl.labels;
        stageCtl?.wind(Math.min(1, Math.max(0, t / (d.hold + pushAt))));   // the build is at its end as the flight starts
        stageCtl?.setRes(t > d.hold * 0.25 && t < hideAt ? fullScale : 1);
        stageCtl?.setWorld(t < hideAt || t >= (L.dock ?? Infinity) - d.dock * 0.2);
        pvCtl.dock(t >= (L.end ?? Infinity) - d.dock * 0.12);
        let n = 0; stops.forEach((_, i) => { if (t >= (L[`q${i}`] ?? Infinity) - d.move * 0.5) n = i; });
        // the counter follows the question numbers: the intro counts toward 01, the closing panel stays on the last
        if (rail) rail.textContent = String(Math.min(stops.length - 2, Math.max(1, n))).padStart(2, '0');
      },
      scrollTrigger: { trigger: spacer, start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
    tl.addLabel('hold', 0).to({}, { duration: d.hold })
      .addLabel('expand')
      // The copy rides up and is covered by the growing frame; it never fades on its own.
      .to(copy, { y: -vh() * 0.18, duration: d.expand, ease: 'power1.in' }, 'expand')
      .to(steps, { y: vh() * 0.1, duration: d.expand }, 'expand')
      // The frame grows flat into the screen while the camera inside does the moving: it turns round, and the view swings
      // onto the eyepiece and pushes toward it.
      .to(frame, { ...full(), borderRadius: 0, duration: d.expand, ease: 'power3.inOut' }, 'expand')
      .to(rows, { autoAlpha: 0, duration: d.expand * 0.18 }, `expand+=${d.expand * 0.12}`)
      .to(pageCopy, { yPercent: -70, autoAlpha: 0, duration: d.expand * 0.35, ease: 'power2.in' }, `expand+=${d.expand * 0.2}`)
      .to(fly, { p: 1, duration: pushLen, ease: 'none', onUpdate: applyFly }, `expand+=${pushAt}`)
      // A caption holds while the camera flies (in once the frame fills the screen), then hands over to the intake.
      .fromTo(cap, { autoAlpha: 0, y: vh() * 0.05 }, { autoAlpha: 1, y: 0, duration: vh() * 0.1, ease: 'power3.out' }, `expand+=${d.expand * 0.84}`)
      .to(cap, { autoAlpha: 0, y: -vh() * 0.04, duration: vh() * 0.07, ease: 'power2.in' }, flyAt(0.85))
      // The eyecup closes round the eyepiece, then the intake opens out of its glass (irisTick) and its copy rises.
      .set([copy, steps], { autoAlpha: 0 }, `expand+=${d.expand}`)
      .set(jq, { autoAlpha: 1, backgroundColor: ink }, flyAt(IRIS[0]))
      .fromTo(introBits, { y: vh() * 0.05, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: d.intro * 0.22, stagger: d.intro * 0.04, ease: 'power3.out' }, flyAt(0.95))
      .addLabel('slide', `expand+=${pushEnd}`)
      .addLabel('q0', 'slide')
      .to({}, { duration: d.intro }, 'slide');
    // Stepped track: glide (power2.inOut), then hold. Each panel number drifts a little against its panel for depth.
    let at = d.hold + pushAt + pushLen + d.intro;
    // the scene stops rendering once the intake covers it
    hideAt = d.hold + pushEnd;
    tl.set(scene, { opacity: 0 }, hideAt);
    stops.forEach((x, i) => {
      if (i === 0) return;
      tl!.to(track, { x, duration: d.move, ease: 'power2.inOut' }, at);
      const nOut = kids[i - 1].querySelector('.hz__n'), nIn = kids[i].querySelector('.hz__n');
      if (nOut) tl!.to(nOut, { xPercent: -35, duration: d.move, ease: 'power2.in' }, at);
      if (nIn) tl!.fromTo(nIn, { xPercent: 45 }, { xPercent: 0, duration: d.move, ease: 'power2.out' }, at);
      tl!.addLabel(`q${i}`, at + d.move);
      at += d.move + d.step;
    });
    tl.addLabel('dock', at)
      // The carrier comes back: the docked frame shows the night page again; a door preview replaces it only on hover.
      .add(() => resetCam(), 'dock')
      .set([...rows, pageCopy], { autoAlpha: 1, yPercent: 0 }, 'dock')
      .set(scene, { opacity: 1 }, 'dock')
      .to(frame, { ...docked(), ...tilt, borderRadius: 6, duration: d.dock, ease: 'power2.inOut' }, 'dock')
      .to(jq, { clipPath: () => { const r = rect(dock); return `inset(${r.top}px ${vw() - r.left - r.width}px ${vh() - r.top - r.height}px ${r.left}px round 6px)`; }, duration: d.dock * 0.7, ease: 'power2.inOut' }, 'dock')
      .to(pv, { opacity: 1, duration: d.dock * 0.3 }, `dock+=${d.dock * 0.55}`)
      .set(jq, { autoAlpha: 0 }, `dock+=${d.dock * 0.85}`)
      .to(jd, { autoAlpha: 1, duration: d.dock * 0.5 }, `dock+=${d.dock * 0.25}`)
      .addLabel('end', `dock+=${d.dock}`)
      .to({}, { duration: d.end });
  };
  build();
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = window.setTimeout(() => { build(); ScrollTrigger.refresh(); }, 150); };
  addEventListener('resize', onResize, { passive: true });
  (document as any).fonts?.ready?.then(() => { build(); ScrollTrigger.refresh(); });
  later(() => {
    removeEventListener('resize', onResize); tl?.kill(); html.classList.remove('has-journey');
    if (irisTick) gsap.ticker.remove(irisTick);
    cup.remove(); vf.remove();
    // Leave the static layout exactly as the HTML wrote it (a tier demoted to low falls back to it).
    pvCtl.destroy();
    gsap.set([jq, jd, track, frame, copy, steps, scene, pv, cap, ...Array.from(stage.querySelectorAll('.hz__n, .bn__sky, .bn__top, .bn__hud, .bn__rail, .bn__copy, .build__console, .hz__panel--intro *'))], { clearProps: 'all' });
    spacer.style.height = ''; slot.append(frame);
  });
}

/* The docked frame. By default it plays a reel of the sites the skill built (filmed loops, one at a time, lazy);
   each door swaps in a real preview: the build replayed, the sixteen directions on a ring, the suite's
   measurements over the page they measured, and both builds of one brief side by side. Every swap is a wipe. */
function dockPreviews(frame: HTMLElement, stage: HTMLElement, stageCtl: StageCtl | null) {
  const pane = (k: string) => frame.querySelector<HTMLElement>(`.pv--${k}`);
  const panes: Record<string, HTMLElement | null> = { reel: pane('reel'), method: pane('method'), directions: pane('directions'), suite: pane('suite'), compare: pane('compare') };
  const overlay = new Set(['night', 'method', 'suite']); // the night page shows under these
  const items = Array.from(frame.querySelectorAll<HTMLElement>('[data-reel-item]'));
  const vids = items.map((el) => el.querySelector('video')!);
  const rows = Array.from(stage.querySelectorAll<HTMLElement>('[data-reel-go]'));
  const bars = rows.map((r) => r.querySelector<HTMLElement>('.ex__bar b')!);
  const thumbs = Array.from(stage.querySelectorAll<HTMLImageElement>('[data-thumb]'));
  const cmpVids = Array.from(frame.querySelectorAll<HTMLVideoElement>('[data-cmp-film]'));
  const cmpTitle = frame.querySelector<HTMLElement>('[data-cmp-title]');
  const titles = rows.map((r) => r.querySelector('.ex__name')?.textContent || '');
  const cmpData: Array<Record<'skill' | 'base', string[][]>> = JSON.parse(frame.querySelector('[data-cmp-data]')?.textContent || '[]');
  const films = vids.map((v) => v.dataset.film!);
  // Each site holds for the length of its film (they are 8 to 10 s loops), within 6 to 11 s.
  const hold = (v: HTMLVideoElement) => (Number.isFinite(v.duration) && v.duration > 0 ? Math.min(11, Math.max(6, v.duration - 0.5)) : 8);
  // Nothing loads until the frame first docks: the films are not part of the first view.
  let cur = 'night', docked = false, armed = false, hover: string | null = null, inView = true, idx = 0;
  let timer: gsap.core.Tween | null = null;
  const size = () => (frame.getBoundingClientRect().width * Math.min(devicePixelRatio, 2) > 760 ? 960 : 600);
  const load = (v: HTMLVideoElement, film: string) => { if (!armed) return; const src = `${film}-${size()}.mp4`; if (!v.src.endsWith(src)) { v.src = src; v.preload = 'auto'; } };
  const play = (v: HTMLVideoElement) => { v.play().catch(() => {}); };
  const reelOn = () => cur === 'reel' && docked && inView && !document.hidden;

  const cue = (i: number, wipe: boolean) => {
    const prev = idx; idx = (i + items.length) % items.length;
    timer?.kill(); bars.forEach((b) => gsap.set(b, { scaleX: 0 }));
    rows.forEach((r, k) => r.classList.toggle('is-on', k === idx));
    items.forEach((el, k) => gsap.set(el, { zIndex: k === idx ? 2 : 1 }));
    const v = vids[idx]; load(v, films[idx]); v.currentTime = 0;
    if (reelOn()) play(v);
    load(vids[(idx + 1) % items.length], films[(idx + 1) % items.length]);
    const settle = () => items.forEach((el, k) => { if (k !== idx) { gsap.set(el, { clipPath: 'inset(0% 0% 0% 100%)' }); vids[k].pause(); } });
    if (wipe && prev !== idx) gsap.fromTo(items[idx], { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', overwrite: true, onComplete: settle });
    else { gsap.set(items[idx], { clipPath: 'inset(0% 0% 0% 0%)' }); settle(); }
    timer = gsap.to(bars[idx], { scaleX: 1, duration: hold(v), ease: 'none', paused: !reelOn(), onComplete: () => cue(idx + 1, true) });
    // The real length is known once the film's metadata arrives: stretch the bar to it.
    if (!Number.isFinite(v.duration) || !v.duration) v.addEventListener('loadedmetadata', () => { if (timer && vids[idx] === v) timer.duration(hold(v)); }, { once: true });
  };
  const syncReel = () => { const on = reelOn(); if (on) { load(vids[idx], films[idx]); play(vids[idx]); timer?.play(); } else { vids.forEach((v) => v.pause()); timer?.pause(); } };

  const boxes = Array.from(frame.querySelectorAll<HTMLElement>('[data-suite-box]'));
  const placeBoxes = () => boxes.forEach((b) => {
    const el = frame.querySelector<HTMLElement>(b.dataset.suiteBox!);
    if (!el) return;
    let x = 0, y = 0, n: HTMLElement | null = el;
    while (n && n !== frame) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
    const pad = 4;
    Object.assign(b.style, { left: `${x - pad}px`, top: `${y - pad}px`, width: `${el.offsetWidth + pad * 2}px`, height: `${el.offsetHeight + pad * 2}px` });
  });
  const suiteOn = (on: boolean) => {
    if (!on) return;
    placeBoxes();
    gsap.fromTo(boxes, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.12, ease: 'power3.out', delay: 0.35 });
    gsap.fromTo(frame.querySelectorAll('.suite__bar > *, .suite__meta'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.07, ease: 'power2.out', delay: 0.6 });
  };
  const cmpOn = (on: boolean) => {
    if (!on) { cmpVids.forEach((v) => v.pause()); return; }
    const [a, b] = cmpVids;
    load(a, films[idx]); load(b, `${films[idx]}-base`); a.currentTime = 0; b.currentTime = 0; play(a); play(b);
    if (cmpTitle) cmpTitle.textContent = titles[idx];
    const pair = cmpData[idx];
    if (pair) frame.querySelectorAll<HTMLElement>('[data-cmp-m]').forEach((dl) => { dl.innerHTML = (pair[dl.dataset.cmpM as 'skill' | 'base'] || []).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join(''); });
  };

  const show = (next: string) => {
    if (next === cur) return;
    const prev = cur; cur = next; frame.dataset.pv = next;
    const pIn = panes[next], pOut = panes[prev];
    if (pIn) { gsap.set(pIn, { zIndex: 3, visibility: 'visible' }); gsap.fromTo(pIn, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'expo.inOut', overwrite: true }); }
    if (pOut) {
      gsap.set(pOut, { zIndex: 2 });
      // Going back to the page underneath: the pane leaves with the same edge. Otherwise the new pane covers it first.
      if (overlay.has(next)) gsap.to(pOut, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.85, ease: 'expo.inOut', overwrite: true, onComplete: () => { if (cur !== prev) gsap.set(pOut, { visibility: 'hidden' }); } });
      else gsap.to(pOut, { duration: 0.85, overwrite: true, onComplete: () => { if (cur !== prev) gsap.set(pOut, { visibility: 'hidden', clipPath: 'inset(0% 0% 0% 100%)' }); } });
    }
    stageCtl?.replay(next === 'method'); stageCtl?.sync();
    suiteOn(next === 'suite'); cmpOn(next === 'compare'); syncReel();
  };
  const target = () => (docked ? hover || 'reel' : 'night');

  const doors = Array.from(stage.querySelectorAll<HTMLElement>('[data-door]'));
  const onEnter = (e: Event) => { hover = (e.currentTarget as HTMLElement).dataset.door || null; show(target()); };
  const onLeave = () => { hover = null; show(target()); };
  doors.forEach((a) => { a.addEventListener('pointerenter', onEnter); a.addEventListener('focus', onEnter); a.addEventListener('pointerleave', onLeave); a.addEventListener('blur', onLeave); });
  const onRow = (e: Event) => { const k = rows.indexOf(e.currentTarget as HTMLElement); if (k < 0) return; hover = null; show(target()); if (k !== idx) cue(k, true); };
  rows.forEach((r) => { r.addEventListener('pointerenter', onRow); r.addEventListener('focusin', onRow); });
  const io = new IntersectionObserver((es) => { inView = es.some((x) => x.isIntersecting); syncReel(); if (!inView) cmpVids.forEach((v) => v.pause()); else if (cur === 'compare') cmpVids.forEach(play); }, { threshold: 0.15 });
  io.observe(frame);
  const onVis = () => syncReel();
  document.addEventListener('visibilitychange', onVis);
  cue(0, false);

  return {
    dock: (on: boolean) => { if (on === docked) return; docked = on; if (on && !armed) { armed = true; thumbs.forEach((t) => { t.src = t.dataset.thumb!; }); load(vids[idx], films[idx]); load(vids[(idx + 1) % items.length], films[(idx + 1) % items.length]); } show(target()); },
    destroy: () => {
      timer?.kill(); io.disconnect(); document.removeEventListener('visibilitychange', onVis);
      doors.forEach((a) => { a.removeEventListener('pointerenter', onEnter); a.removeEventListener('focus', onEnter); a.removeEventListener('pointerleave', onLeave); a.removeEventListener('blur', onLeave); });
      rows.forEach((r) => { r.removeEventListener('pointerenter', onRow); r.removeEventListener('focusin', onRow); r.classList.remove('is-on'); });
      [...vids, ...cmpVids].forEach((v) => { v.pause(); v.removeAttribute('src'); v.load(); });
      thumbs.forEach((t) => t.removeAttribute('src'));
      gsap.set([...Object.values(panes).filter(Boolean) as HTMLElement[], ...items, ...bars, ...boxes], { clearProps: 'all' });
      frame.dataset.pv = 'night'; stageCtl?.replay(false);
    },
  };
}

/* Directions dial: a sticky stage; the card re-themes per step with a short crossfade. */
function directionsStage() {
  const wrap = document.querySelector<HTMLElement>('[data-dir-stage]');
  const json = document.querySelector<HTMLScriptElement>('[data-directions]');
  if (!wrap || !json) return;
  const dirs: Direction[] = JSON.parse(json.textContent || '[]');
  const card = wrap.querySelector<HTMLElement>('[data-card]')!;
  const sample = wrap.querySelector<HTMLElement>('[data-card-sample]')!;
  const nEl = wrap.querySelector<HTMLElement>('[data-card-n]')!;
  const nameEl = wrap.querySelector<HTMLElement>('[data-card-name]')!;
  const tokensEl = wrap.querySelector<HTMLElement>('[data-card-tokens]')!;
  const stageName = wrap.querySelector<HTMLElement>('[data-stage-name]')!;
  const stageFeel = wrap.querySelector<HTMLElement>('[data-stage-feel]')!;
  const progress = wrap.querySelector<HTMLElement>('[data-stage-progress]')!;
  const items = Array.from(wrap.querySelectorAll<HTMLElement>('[data-dir-btn]'));
  const sw = { bg: wrap.querySelector<HTMLElement>('[data-sw="bg"]')!, fg: wrap.querySelector<HTMLElement>('[data-sw="fg"]')!, accent: wrap.querySelector<HTMLElement>('[data-sw="accent"]')! };
  let current = -1;
  const apply = (i: number) => {
    const d = dirs[i];
    card.style.setProperty('--card-bg', d.bg); card.style.setProperty('--card-fg', d.fg); card.style.setProperty('--card-accent', d.accent);
    sample.textContent = d.sample; sample.dataset.face = d.face; sample.dataset.caps = String(d.caps); sample.style.fontWeight = String(d.weight);
    nEl.textContent = `${String(i + 1).padStart(2, '0')} / ${dirs.length}`; nameEl.textContent = d.name; tokensEl.textContent = `${d.bg} ${d.fg} ${d.accent}`;
    sw.bg.style.background = d.bg; sw.fg.style.background = d.fg; sw.accent.style.background = d.accent;
    stageName.textContent = d.name; stageFeel.textContent = d.feel; progress.textContent = `${String(i + 1).padStart(2, '0')} / ${dirs.length}`;
    items.forEach((b, k) => b.classList.toggle('is-active', k === i));
  };
  const show = (i: number) => {
    if (i === current) return;
    current = i;
    if (!motion) { apply(i); return; }
    gsap.timeline()
      .to([sample, stageName, stageFeel], { opacity: 0, y: -8, duration: 0.14, ease: 'power2.in', stagger: 0.02 })
      .add(() => apply(i))
      .to([sample, stageName, stageFeel], { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out', stagger: 0.03 });
  };
  show(0);
  if (!motion) { items.forEach((b, i) => b.addEventListener('click', () => show(i))); return; }
  const spacer = wrap.closest<HTMLElement>('[data-dir-spacer]') || wrap;
  const st = ScrollTrigger.create({
    trigger: spacer, start: 'top top', end: 'bottom bottom', scrub: 0.3,
    onUpdate: (self) => show(Math.min(dirs.length - 1, Math.floor(self.progress * dirs.length))),
  });
  items.forEach((b, i) => b.addEventListener('click', () => { const y = st.start + ((i + 0.5) / dirs.length) * (st.end - st.start); window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }); }));
}

/* Sticky stack: covered cards recede. */
function stack() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-stack-card]'));
  if (!cards.length || !motion) return;
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, { scale: 0.96, ease: 'none', scrollTrigger: { trigger: next, start: 'top 80%', end: 'top 20%', scrub: true } });
  });
}

/* Counters that run once when the console comes into view. */
function counters() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
  if (!els.length) return;
  const run = (el: HTMLElement) => {
    const to = parseFloat(el.dataset.count || '0'); const dp = parseInt(el.dataset.dp || '0', 10);
    if (!motion) { el.textContent = to.toFixed(dp); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.4, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(dp); } });
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target); } }), { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
  later(() => io.disconnect());
}

let menuTl: gsap.core.Timeline | null = null;
function setMenu(open: boolean) {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const panel = document.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !panel) return;
  const html = document.documentElement;
  const bg = panel.querySelector<HTMLElement>('[data-menu-bg]')!;
  const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-item]'));
  const label = btn.querySelector<HTMLElement>('[data-menu-label]');
  btn.setAttribute('aria-expanded', String(open));
  if (label) label.textContent = open ? 'Close' : 'Menu';
  html.classList.toggle('menu-open', open);
  menuTl?.kill();
  if (open) {
    panel.hidden = false; panel.inert = false;
    if (motion) {
      menuTl = gsap.timeline()
        .fromTo(bg, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.65, ease: 'expo.inOut' })
        .fromTo(items, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' }, '-=0.3');
    }
    (panel.querySelector<HTMLElement>('[data-menu-link]') || panel)?.focus();
  } else {
    // Focus returns at once (keyboard users should not wait for the animation); the panel is inert while it leaves.
    btn.focus(); panel.inert = true;
    const done = () => { panel.hidden = true; panel.inert = false; };
    if (motion) menuTl = gsap.timeline({ onComplete: done }).to(items, { y: -16, opacity: 0, duration: 0.25, stagger: 0.02, ease: 'power2.in' }).to(bg, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'expo.inOut' }, '-=0.1');
    else done();
  }
}
function menu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const panel = document.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !panel) return;
  // the button's own state decides, so a click while the menu is still leaving opens it again
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  panel.querySelector('[data-menu-close]')?.addEventListener('click', () => setMenu(false));
  panel.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  // keep Tab inside the open menu
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button')).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); btn.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); btn.focus(); }
  });
}
document.addEventListener('keydown', (e) => { const panel = document.querySelector<HTMLElement>('[data-menu]'); if (e.key === 'Escape' && panel && !panel.hidden) setMenu(false); });

/* Header away on the way down, back on the way up (and always near the top). */
let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY, html = document.documentElement;
  if (y < 120 || y < lastY - 4) html.classList.remove('top-away');
  else if (y > lastY + 4) html.classList.add('top-away');
  lastY = y;
}, { passive: true });

function marquees() {
  document.querySelectorAll<HTMLButtonElement>('[data-marquee-pause]').forEach((b) => {
    b.addEventListener('click', () => {
      const paused = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', String(!paused));
      b.closest('.marquee')?.toggleAttribute('data-paused', !paused);
      b.textContent = paused ? 'Pause' : 'Play';
    });
  });
}

/* One cursor for the session; the element is swapped per page. It replaces the native cursor and tracks it 1:1. */
let cursorEl: HTMLElement | null = null;
if (finePointer && motion) {
  const html = document.documentElement;
  const interactive = 'a, button, [role="button"], summary, label';
  const fields = 'input, textarea, select, [contenteditable]';
  addEventListener('pointermove', (e) => {
    if (!cursorEl) return;
    cursorEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    if (!html.classList.contains('has-cursor')) { html.classList.add('has-cursor'); cursorEl.classList.remove('is-hidden'); }
  }, { passive: true });
  addEventListener('pointerover', (e) => { const t = e.target as Element; cursorEl?.classList.toggle('is-hover', !!t.closest?.(interactive)); cursorEl?.classList.toggle('is-field', !!t.closest?.(fields)); }, { passive: true });
  html.addEventListener('pointerleave', () => cursorEl?.classList.add('is-hidden'));
  html.addEventListener('pointerenter', () => cursorEl?.classList.remove('is-hidden'));
  addEventListener('keydown', (e) => { if (e.key === 'Tab') { html.classList.remove('has-cursor'); cursorEl?.classList.add('is-hidden'); } });
}

/* Without the journey (reduced motion, low tier) the sites are three still cards: the posters, lazy, no motion. */
function stillThumbs() {
  if (document.documentElement.classList.contains('has-journey')) return;
  document.querySelectorAll<HTMLImageElement>('[data-thumb]').forEach((t) => { t.loading = 'lazy'; t.decoding = 'async'; if (!t.getAttribute('src')) t.src = t.dataset.thumb!; });
}

let navigated = false;
function init() {
  const html = document.documentElement;
  applyTier(tier);
  html.classList.add('js');
  if (!motion) html.classList.add('is-static');
  if (scroll.lenis) html.classList.add('lenis', 'lenis-smooth');
  html.classList.remove('menu-open');
  cursorEl = document.querySelector<HTMLElement>('[data-cursor]');
  initReveals();
  const stageCtl = heroStage(); journey(stageCtl); directionsStage(); stack(); counters(); menu(); marquees(); stillThumbs();
  (document as any).fonts?.ready?.then(() => ScrollTrigger.refresh());
  if (navigated) { navigated = false; document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }); }
}

let booted = false;
const boot = () => { if (booted) return; booted = true; init(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
document.addEventListener('astro:page-load', boot);
document.addEventListener('astro:before-swap', () => {
  cleanups.forEach((f) => f()); cleanups = []; demoted = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
  booted = false; navigated = true;
});
// A tier demoted after start (a device that cannot hold the frame rate) falls back to the static layout:
// tear the motion layer down so no scene keeps an inline hidden state the low-tier CSS cannot undo.
tierCheck.then((next) => {
  if (next !== 'low' || tier === 'low') return;
  cleanups.forEach((f) => f()); cleanups = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
  scroll?.destroy?.();
  document.documentElement.classList.add('is-static');
  demoted.forEach((f) => f()); demoted = [];
  stillThumbs();
});
