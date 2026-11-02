# Performance: the budgets, and lean versus heavy

Reviewers test on real phones with throttled CPUs. A hero that drops to 18 fps on a mid-range Android,
or a page that takes six seconds to paint, caps the score regardless of how it looks on a studio
monitor. Performance here is not a polish step; it is a design constraint from the first sketch.

## Budgets (enforced by the test suite)

| Metric | Budget | Where measured |
|---|---|---|
| LCP | 2.5 s | mobile-low project, 4x CPU, slow 4G |
| CLS | 0.1 | all projects, after a full scroll and settle |
| INP / long tasks during scroll | no task over 100 ms, total blocking under 300 ms | mobile-low |
| Scroll frame time | p95 under 34 ms (30 fps floor under 4x throttle; 60 fps on device) | mobile-low |
| Initial JS (everything executed before the first scroll) | 170 KB gzip, excluding the lazy 3D chunk | `check-budgets.mjs` and perf spec |
| Lazy 3D chunk | 260 KB gzip, loaded after LCP, only on tier mid and high | `check-budgets.mjs` |
| CSS | 60 KB gzip | `check-budgets.mjs` |
| Fonts above the fold | 2 files, 150 KB total, WOFF2, subset | `check-budgets.mjs` and perf spec |
| Font families | 3 at most | perf spec |
| First-view transfer (mobile) | 2.5 MB; 1.5 MB before LCP | perf spec |
| First-view transfer (desktop) | 6 MB | perf spec |
| Hero image | 250 KB AVIF, `fetchpriority="high"`, explicit dimensions | perf spec |
| Image sequence | 120 frames, 1280 px, under 6 MB total, idle-loaded | manual |
| DOM nodes | 2500 per page | perf spec |
| Preloader | gone within 2.5 s, skipped on repeat visit | motion spec |
| Script hosts | 2 third-party hosts at most on the critical path | smoke spec warning |

Edit `stagecraft.budgets.json` to loosen a budget on purpose and write why in the commit. The tests
print every value, so a report is one `npx playwright test` away.

### Platform (intake Q8)

`"platform"` in the budgets file is `"all"` by default: every budget above gates on mobile-low. A
site that answered Q8 with "on a computer" sets `"desktop-first"`: the mobile-low perf budgets (LCP,
long tasks, frame time, mobile weight) print as warnings and the desktop budgets gate, while
accessibility, reading time, overflow and touch targets still gate on every device. Phones then get
a composed version on purpose, not a broken one.

## Lean versus heavy (calibration)

| Pattern | Lean examples | Heavy examples |
|---|---|---|
| Framed WebGL studio hero | 300 KB JS, 500 KB first view, 2 scripts | 10 to 15 MB first view when 3D assets and video load eagerly |
| Portfolio index | 180 KB JS, 600 KB first view, 250 DOM nodes | 26 MB when every project image is preloaded |
| Webflow or builder marketing page | 220 KB JS, 14 script tags | 1.2 MB with four analytics tags and a chat widget |
| Product story | 540 KB JS, 830 KB first view, 250 DOM nodes | 2 MB first view with 973 KB of JS |

The lean column looks every bit as good as the heavy one. Shipping 15 MB is a choice, not a
requirement of the look.

## Device tiers

`assets/runtime/tier.ts` returns `low | mid | high` from `prefers-reduced-motion`, `saveData`,
`deviceMemory`, `hardwareConcurrency`, pointer type, WebGL2 availability and a one-second frame
probe, and sets `data-tier` on `<html>` before the first paint so CSS can branch too.

| Tier | Gets | Does not get |
|---|---|---|
| low | static end states, CSS fades, poster images, native scroll, looping muted video with a pause control | pinning, scrub, smooth scroll, canvas, filters, custom cursor |
| mid | GSAP timelines and pinning, split text, one canvas effect at DPR 1, video scrub | WebGL post-processing, filters on large areas, smooth scroll on touch |
| high | everything, DPR capped at 1.5 for canvases (2 for crisp 2D), post-processing | animated grain, two WebGL contexts |

Tiering is an *enhancement ladder*, so the low tier must look designed: same type, same colour, same
hero composition, with the still of the scene instead of the scene.

`refineTier` measures a second of frames once the page has loaded and gone idle (median over 34 ms or
90th percentile over 60 ms demotes to low; 22 and 40 ms demote high to mid). Measuring during load
reads parsing, fonts and setup as a slow device: a laptop with a fast GPU in Firefox was demoted that
way. Leave out the second after a scroll jump (a `#link`, End, a dragged scrollbar) and run the window on
for it: a page catching up on a jump is not a slow device either. A demotion can still come after the motion layer has run: pinned stages have set inline
`opacity`, `visibility`, `transform` and `clip-path`, and the low-tier CSS cannot undo inline styles.
Subscribe to the demotion and run the same cleanups as a page change, with each scene's cleanup
clearing its inline styles (`gsap.set(targets, { clearProps: 'all' })`), restoring any element it moved
in the DOM and resetting spacer heights; then put each scene in its finished state, as the static path
would show it. The `firefox` project catches a miss.

## The LCP path

1. The LCP element is the headline or the hero image, never the canvas. Render it in HTML.
2. Fonts: self-hosted WOFF2, subset to the languages used, `font-display: swap` with
   `size-adjust` fallback metrics (or `optional` for display faces), preload only the two faces the
   hero needs. Variable fonts replace weight families (one file instead of four).
3. Hero image: `<picture>` with AVIF and WebP, `width`/`height` set, `fetchpriority="high"`,
   `decoding="async"`, no `loading="lazy"`. Everything below the fold is lazy.
4. Scripts: `type="module"` entry under 170 KB gzip; GSAP and Lenis are in it; three.js, Rive,
   Lottie players, sequences and sound are dynamic imports after `load` + idle.
5. CSS: one file, no `@import` chains, no blocking web-font CSS from third parties.
6. Third parties: analytics and consent after idle; no chat widgets; no tag managers that load
   five more tags (sites have shipped 53 script tags from 8 hosts).
7. `content-visibility: auto` with `contain-intrinsic-size` on below-fold chapters.
8. Preconnect to the one CDN that matters, nothing else.

## Scroll and mobile pitfalls

- `100vh` on phones is the large viewport: hero content hides behind the address bar. Use `100svh`
  for heroes, `100dvh` only for sheets, `100lvh` for fixed canvas backdrops.
- Address-bar resizes fire `resize`: ignore height-only changes under 120 px, or every scroll on
  Android recomputes the scene and stalls.
- `position: fixed` inside a transformed parent is not fixed. Keep pinned elements and the custom
  cursor outside transformed wrappers.
- `will-change` promotes a layer and eats GPU memory; set it right before an animation, remove it
  after; never on images or many elements.
- `backdrop-filter` and large `filter: blur()` repaint every frame; confine to one small element or
  pre-blur the image.
- Passive listeners for wheel, touch and scroll; batch DOM reads before writes; use
  `ResizeObserver`, not `window.resize`, for element sizes.
- iOS: `overscroll-behavior: none` is not enough to stop rubber-banding; fixed full-screen layers
  jump during overscroll, so give the body a background that matches the first chapter.
- Pin spacers change document height after fonts and images load: call
  `ScrollTrigger.refresh()` on `document.fonts.ready` and after the hero image loads.
- A GSAP `pin` inserts its spacer when the trigger is created, after first paint, so everything
  below jumps by the pin distance and CLS can hit 0.8 on a page that is otherwise stable. For
  stages that live on the page from the start (handoffs, dials, scrubbed scenes), reserve the
  distance in CSS instead: a tall spacer element whose height is the scroll distance and a
  `position: sticky; top: 0; height: 100svh` stage inside it, with ScrollTrigger scrubbing against
  the spacer (`start: 'top top', end: 'bottom bottom'`) and no pin. Same feel, zero shift; the
  spacer's CSS height is the estimate, JS refines it on resize.

## 3D and canvas rules

- Start a heavy scene only after the frame-rate check (`refineTier`): a shader compiling or data
  decoding on the main thread during the check reads as a slow device, and the page demotes itself to
  the static tier and tears its motion down. Decode in a worker; compile in parallel where supported.
- Load the scene after LCP, behind `tier !== 'low'`, behind `IntersectionObserver` for scenes
  below the fold; pause the render loop when the canvas is off screen or the tab is hidden.
- DPR: `Math.min(devicePixelRatio, tier === 'high' ? 1.5 : 1)`; textures at 2048 px or under,
  KTX2/Basis compressed; geometry Draco-compressed; dispose on leave.
- `ogl` (14 KB gzip) for a single shader plane or image distortion; `three` (132 KB gzip minimum)
  only for a real scene; `WebGLRenderer` and GLSL, not WebGPU, for marketing sites in 2026.
- Post-processing (bloom, DOF) on tier high only; fake it on mid with a pre-rendered glow image.
- Never render text in the scene; text stays in the DOM.
- Always ship the still: a poster image of the scene's first frame, in the same frame, is what low
  tier, reduced motion and the social preview show.
- Headless test browsers render WebGL with a software rasteriser; black canvases or NaN colours in
  tests are a known trap (`pow(negative)` is NaN on real GPUs). The suite checks that the page is
  not blank *around* the canvas, and `audit` captures real-browser screenshots.

## Intros and the LCP

Text at opacity 0 does not count as painted, so an intro that holds the hero copy back moves LCP
to the end of the intro (1.9 s on mobile-low for a 1.5 s wordmark reveal). Keep the intro under
1.2 s, start bringing the copy in before it ends, and check LCP on mobile-low. Text that is merely
covered by an overlay does count, so a mask over visible copy costs nothing.

## Images and video

- AVIF first, WebP second, JPEG last; `sizes` that match the layout; a 1x and 2x set, nothing above
  2560 px wide.
- Decorative video: `<video autoplay muted loop playsinline preload="metadata" poster>` with an
  H.264 MP4 and a WebM; 1080p at most, 10 s loops under 2.5 MB; paused when off screen; a visible
  pause control (WCAG 2.2.2); not loaded at all on low tier or `saveData`.
- Reduced motion: posters instead of autoplay.

Video as an asset: H.264 MP4 with `+faststart` (plays everywhere), two sizes (1280 and 720 wide)
picked by viewport, a poster on the element, `preload="none"` until the chapter before it, one clip
playing at a time, all paused off screen and on `visibilitychange`, posters only for tier low and
reduced motion. Scrubbing video by scroll needs a keyframe on every frame and triples the size;
loop clips and let the scroll cut between them instead.

## Consent dialogs

A consent modal on first view covers the hero in the first screenshot anyone takes and tanks the LCP
measurement. If analytics need consent, use a small bottom-left card, not a modal; load analytics
only after consent and after idle; never cover the headline or the primary action.

## Measuring locally

```bash
npm run build && node scripts/check-budgets.mjs --dist dist
npx playwright test --project=mobile-low tests/perf.spec.ts
npx lhci autorun   # optional, needs Chrome; config in lighthouserc.json
```
Run perf tests on the production build (`preview`), never on the dev server (dev servers serve
unbundled modules and skew every number).

## Software GL

Before any WebGL scene, call `softwareGl()` from `assets/runtime/tier.ts`: a software renderer
(SwiftShader, llvmpipe, most headless browsers and some virtual machines) draws a scene at a few
frames per second however small it is, so those visitors get the still and the DOM version. The
test suite runs headless, which means the suite measures the static path of a 3D page; check the
scene itself in a real browser with the GPU on.
