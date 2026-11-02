# Performance: the budgets and how winners actually weigh

Juries test on real phones with throttled CPUs. A hero that drops to 18 fps on a mid-range Android,
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

## How the studied winners weigh (calibration)

| Pattern | Lean examples | Heavy examples |
|---|---|---|
| Framed WebGL studio hero | 300 KB JS, 500 KB first view, 2 scripts | 10 to 15 MB first view when 3D assets and video load eagerly |
| Portfolio index | 180 KB JS, 600 KB first view, 250 DOM nodes | 26 MB when every project image is preloaded |
| Webflow or builder marketing page | 220 KB JS, 14 script tags | 1.2 MB with four analytics tags and a chat widget |
| Product story | 540 KB JS, 830 KB first view, 250 DOM nodes | 2 MB first view with 973 KB of JS |

The lean column won the same awards as the heavy column. Shipping 15 MB is a choice, not a
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
   five more tags (a studied site shipped 53 script tags from 8 hosts).
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

## 3D and canvas rules

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

## Images and video

- AVIF first, WebP second, JPEG last; `sizes` that match the layout; a 1x and 2x set, nothing above
  2560 px wide.
- Decorative video: `<video autoplay muted loop playsinline preload="metadata" poster>` with an
  H.264 MP4 and a WebM; 1080p at most, 10 s loops under 2.5 MB; paused when off screen; a visible
  pause control (WCAG 2.2.2); not loaded at all on low tier or `saveData`.
- Reduced motion: posters instead of autoplay.

## Consent dialogs

A consent modal on first view covers the hero in the screenshot the jury takes and tanks the LCP
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
