# Motion: the system and the recipes

Motion on these sites is choreography, not decoration: it has a director (the story), a vocabulary
(tokens), two layers (CSS first, GSAP for sequences) and a floor (reduced motion, low tier). Read
`story.md` for *what* moves when; this file is *how*.

## Tokens

Declare once in `:root` and use everywhere; the tests read them too.

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);        /* expo-out: reveals, slides */
  --ease-in-out: cubic-bezier(0.65, 0.05, 0, 1);    /* the "award" curve: wipes, curtains, pins */
  --ease-spring: linear(0, 0.3 10%, 0.8 25%, 1.05 40%, 0.98 55%, 1 70%); /* Playground only */
  --dur-fast: 0.25s;   /* hovers, toggles */
  --dur-base: 0.6s;    /* reveals */
  --dur-slow: 1.1s;    /* curtains, mask reveals, hero lines */
  --stagger: 60ms;     /* per line or row */
  --reveal-y: 24px;    /* translate distance for reveals; never more than 10 % of the element */
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-base: 0.2s; --dur-slow: 0.3s; --stagger: 0ms; --reveal-y: 0px; }
}
```

Rules of thumb: hovers under 300 ms; reveals 400 to 700 ms; big moves 900 to 1200 ms; staggers 40 to
80 ms and never more than 12 items (after that, reveal the group). Animate only `transform`,
`opacity`, `clip-path` and registered custom properties. `filter`, `backdrop-filter`, `box-shadow`,
`width`, `height`, `top`, `left`, `font-size` and `letter-spacing` are off the table for anything
scroll-bound.

## Two layers

**Layer 1, CSS.** Hovers, toggles, in-view reveals, marquees, theme crossfades, view transitions.
Zero JS cost, runs on the compositor, degrades for free. Use native scroll-driven animations where
supported, behind `@supports`, with an IntersectionObserver fallback (`assets/runtime/reveal.ts`).

**Layer 2, GSAP (core + ScrollTrigger, SplitText, Flip when needed).** Sequenced timelines, pinned
stages, scrubbed scenes, split-text lines, FLIP layout changes. GSAP 3.13+ is free for commercial
work including these plugins. Import only what is used.

**Smooth scroll (Lenis)** is optional and only on fine-pointer devices with no reduced-motion
preference; touch stays native. Drive Lenis and ScrollTrigger from one ticker
(`assets/runtime/lenis-gsap.ts`), never two rAF loops.

**Canvas / WebGL** is layer 3 and lives in `performance.md` because its rules are budget rules.

## Reduced motion: reduce, do not remove

`prefers-reduced-motion: reduce` means: no parallax, no scroll-scrubbed movement of large areas, no
autoplay video, no infinite loops, no spring overshoot, no scramble; keep opacity fades up to 300 ms,
keep colour changes, keep layout. Content must be fully visible at rest. JS reads the preference
live (`matchMedia(...).addEventListener('change')`) and kills ScrollTriggers and Lenis when it flips.
Lenis 1.3.26+ pauses itself; your own loops will not.

## The never-stuck rule

The most common bug on animated sites: content hidden at `opacity: 0` waiting for a trigger that
never fires (the observer threshold was wrong, the element was taller than the viewport, the
pin spacer moved it, the tab was in the background). Three defences, all mandatory:

1. Hidden-at-rest styles apply only when `html.js` is present, so no-JS renders everything.
2. Every reveal has a timeout fallback: 2.5 s after the element enters the DOM it becomes visible
   whatever the observer said (`reveal.ts` does this).
3. The test suite scrolls the whole page and fails if any text, heading, image or `[data-reveal]`
   inside the viewport is still under 0.9 opacity, hidden, or clipped away by a mask
   (`motion.spec.ts`). Two escape hatches, both deliberate: content inside a pinned stage
   (`.pin-spacer` from GSAP, or `[data-stage]`) may be hidden as long as the stage shows some
   other text at that scroll position, and `data-allow-hidden` marks copy that is hidden by
   design (the later states of a stage, a hover-only caption). Never put it on the first state.

With GSAP use `gsap.from()` only inside a ScrollTrigger with `immediateRender: false`, or prefer
`gsap.set()` + `gsap.to()`, and use `once: true` for reveals.

## Recipes

### Reveal (CSS first, observer fallback)

```css
html.js [data-reveal] { opacity: 0; transform: translateY(var(--reveal-y)); }
html.js [data-reveal].is-visible,
html.no-io [data-reveal] { opacity: 1; transform: none; transition: opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out); }
@supports (animation-timeline: view()) {
  html.js [data-reveal] {
    opacity: 1; transform: none;                     /* let the timeline own it */
    animation: reveal both linear;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }
  @keyframes reveal { from { opacity: 0; transform: translateY(var(--reveal-y)); } to { opacity: 1; transform: none; } }
}
@media (prefers-reduced-motion: reduce) { html.js [data-reveal] { animation: none; opacity: 1; transform: none; } }
```
Stagger children with `[data-reveal-group] > *` and `transition-delay: calc(var(--i) * var(--stagger))`
set by the observer. Firefox has no scroll-driven animations as of late 2026, so the observer path
is the real path for about one visitor in eight; test both.

### Headline by line

Split by line, not by character, for anything longer than one word (character splits are a
signature move for one headline at most). Wrap each line in an overflow-hidden mask and translate
the inner span from 110 % to 0 with `--ease-out` and `--stagger`. SplitText (`type: "lines"`,
`mask: "lines"`) does this and re-splits on resize; roll back to plain text under reduced motion.
Wait for `document.fonts.ready` before splitting or the lines are wrong.

### Pinned stage with scrubbed content

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({
  scrollTrigger: { trigger: '.stage', start: 'top top', end: '+=300%', pin: true, scrub: 0.6, anticipatePin: 1 },
});
tl.to('.stage__object', { rotateY: 180, ease: 'none' }, 0)
  .to('.stage__copy--1', { autoAlpha: 0 }, 0.3)
  .to('.stage__copy--2', { autoAlpha: 1 }, 0.35)
  .to('.stage__copy--2', { autoAlpha: 0 }, 0.65)
  .to('.stage__copy--3', { autoAlpha: 1 }, 0.7);
```
`end: '+=300%'` means three viewports of scroll for three states. Keep pinned sections under five
viewports. On mobile and low tier, kill the trigger and lay the three copies out vertically with
the object static (`ScrollTrigger.matchMedia` or `gsap.matchMedia()`).

### Horizontal chapters (Horizon)

```ts
const track = document.querySelector('.track')!;
const panels = gsap.utils.toArray<HTMLElement>('.track > .panel');
gsap.to(track, {
  x: () => -(track.scrollWidth - innerWidth),
  ease: 'none',
  scrollTrigger: { trigger: '.track-wrap', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), pin: true, scrub: 0.5, invalidateOnRefresh: true },
});
```
Below 900 px or on touch: no transform, panels stack vertically. Keyboard: panels contain focusable
content, so `scroll-padding` and a visible focus ring are needed; ScrollTrigger keeps the document
scrollable, so Tab still works. Test it (`motion.spec.ts` tabs through and checks every focused
element is on screen).

### Sticky stack

```css
.stack { display: grid; }
.stack > .card { position: sticky; top: 0; min-height: 100svh; }
```
Add a scrubbed `scale: 0.94` and `filter: brightness(0.7)` on the covered card only on tier high
(filter is expensive); mid tier gets the stack without the dimming.

### Sequence and video scrub

Image sequence: at most 120 frames, 1280 px wide, AVIF or WebP, decoded into `ImageBitmap`s after
first paint, drawn on a canvas sized to the element with DPR capped at 1.5; the scroll progress maps
to frame index with `Math.round`. Preload only the first 10 frames before the gate lifts, the rest
in idle time; show a poster until frame 0 is ready.

Video scrub: a muted, `playsinline` MP4 encoded with a keyframe every frame (`-g 1`) so seeking is
instant; set `currentTime` from scroll progress, throttled to the display rate with
`requestVideoFrameCallback`. Safari seeks slowly on long files: keep scrubbed clips under 8 s.

Low tier and reduced motion: a poster image and, if there is one, the same clip as a normal looping
muted video with a pause control.

### Marquee

```css
.marquee { overflow: hidden; mask: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.marquee__track { display: flex; gap: 2rem; width: max-content; animation: marquee 30s linear infinite; }
.marquee:hover .marquee__track, .marquee:focus-within .marquee__track { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .marquee__track { animation: none; } }
```
Duplicate the content once so `-50 %` loops seamlessly. Speed 30 to 60 px/s. Since it runs longer
than five seconds it needs a pause control for WCAG 2.2.2: hover and focus pause it, and a visible
pause button is required when it carries meaning (logos are meaning).

### Magnetic button and custom cursor (fine pointer only)

Both are wrapped in `if (matchMedia('(hover: hover) and (pointer: fine)').matches)`. Magnetic: on
`pointermove` within 80 px, translate the button by 25 % of the offset with a 0.3 s expo tween; reset
on leave. Cursor: a 12 px dot plus a 40 px ring, `mix-blend-mode: difference`, following the pointer
with a 0.15 s lerp; `data-cursor="view"` elements enlarge the ring with a label. The native cursor
stays visible (`cursor: auto`) on form fields and the custom one hides there. Never on touch: the
test checks `[data-cursor]` is not visible when the pointer is coarse.

### Page transitions

Astro: `<ClientRouter />` with `transition:name` on the shared element (the preview image of a case
study) and `transition:persist` on the header. Next.js 16: React `<ViewTransition>` on the layout
and `transitionTypes` on links. Plain MPA: `@view-transition { navigation: auto; }` in CSS gives
cross-document transitions in Chromium and Safari for free, Firefox gets a hard cut. Reduced motion:
`::view-transition-group(*) { animation-duration: 0.01s }` but keep a crossfade for the root.
Smooth scroll libraries must be re-initialised after a client-side swap and killed before it.

### Preloader

```ts
const gate = document.querySelector<HTMLElement>('[data-preloader]')!;
if (sessionStorage.getItem('gate')) gate.remove();                 // repeat visit: no gate
else {
  const start = performance.now();
  const lift = () => { gate.classList.add('is-done'); sessionStorage.setItem('gate', '1'); };
  Promise.race([ready /* fonts + hero media + scene */, new Promise(r => setTimeout(r, 2500))])
    .then(() => setTimeout(lift, Math.max(0, 600 - (performance.now() - start))));
}
```
`.is-done` runs the lift animation and then sets `visibility: hidden`. The gate element has
`aria-hidden="true"` and `inert`; the content behind it is in the DOM and is the LCP element. The
test fails if the gate is still visible after `preloaderMs` (2.5 s by default) or if it shows on a
second navigation within the same context.

### Grain

A static SVG `feTurbulence` tile as a `background-image` on a fixed, pointer-events-none layer at 3 to
6 % opacity. Do not animate it; animated grain (changing `seed` each frame) is a full-screen repaint
on every frame and is the single biggest frame-time killer seen on award entries.

### Theme per chapter

```html
<section data-theme="ink"> ... </section>
```
```css
[data-theme="ink"] { --bg: #0e0e10; --fg: #f3eee3; }
[data-theme="paper"] { --bg: #f3eee3; --fg: #1b1d22; }
```
Tokens swap at the section boundary; for a crossfade, register `--bg` with `@property` and scrub the
root value over 40 % of a viewport with ScrollTrigger `onUpdate`, or use `animation-timeline: view()`
on the section.

### Text decode (Specimen, Kinetic)

Replace characters with random glyphs from a fixed set and resolve left to right over 600 ms; run it
once on enter, never on hover for body text, never under reduced motion. Keep the final text in the
DOM from the start (set `aria-label` to the final text, animate a `aria-hidden` twin) so screen
readers and search see real copy.

## Lenis and GSAP together

`assets/runtime/lenis-gsap.ts` is the canonical setup: one `gsap.ticker`, `lenis.on('scroll',
ScrollTrigger.update)`, `lagSmoothing(0)`, `anchors: true`, touch left native, and it only runs when
`(hover: hover) and (pointer: fine)` and no reduced motion. Anchor links and skip links call
`lenis.scrollTo(target, { immediate: true })` and move focus.

## Cleanup

Kill every ScrollTrigger and timeline on page leave (`astro:before-swap`, Next route change), remove
pointer listeners, cancel rAF loops, pause videos out of view (IntersectionObserver), and `dispose()`
WebGL resources. A site that leaks triggers across client-side navigations degrades to a slideshow
after three pages.
