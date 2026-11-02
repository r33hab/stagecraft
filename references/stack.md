# Stack: what to build with, and what to avoid

Versions are as of November 2026; check `npm view <pkg> version` before pinning. The skill's
intake decides the row below; the person never has to.

## Decision table

| Situation | Build | Reason |
|---|---|---|
| Existing codebase | their framework | the motion layer adapts; see the last section |
| Launch page, portfolio, studio, story, company site; developer-maintained | **Astro 7** (static output, content collections, `<ClientRouter />` for page transitions, image pipeline with AVIF) | HTML-first, zero JS by default, islands only where motion needs them, best Core Web Vitals for content sites |
| One-page cinematic experience where the whole page is one scene | **Vite 8 + TypeScript** (no framework) | smallest runtime, one bundle, the scene is the app |
| Non-developers edit content often | **Astro 7 + Sanity** (or Keystatic for a few pages in Git) | editor with preview, static output stays |
| Product site that also has accounts, dashboards, an app shell | **Next.js 16** (App Router, React `<ViewTransition>`) + headless CMS | app features; keep GSAP and Lenis inside lazily loaded client components |
| Vue team | **Nuxt 4** | same shape as Next for Vue |
| Svelte team | **SvelteKit 3** | same shape; Svelte transitions cover many reveals natively |

## Libraries

| Need | Use | Size (gzip) | Notes |
|---|---|---|---|
| Timelines, scroll scenes, pinning, split text, FLIP | `gsap` 3.15 (core, `gsap/ScrollTrigger`, `gsap/SplitText`, `gsap/Flip`) | core 28 KB, ScrollTrigger 18 KB, SplitText 4 KB | free for commercial use since 3.13 (Webflow "no charge" licence; not OSI, licence scanners may flag it) |
| Smooth scroll on desktop | `lenis` 1.3 | 8 KB | touch stays native (`syncTouch` false); respects reduced motion since 1.3.26; one ticker with GSAP |
| Tiny declarative animations in React or vanilla | `motion` 14 (`motion` / `motion/react`) | 3 to 18 KB | fine for UI; GSAP for scroll choreography |
| Springs, drag, SVG draw and morph, text split, in one modular engine | `animejs` 4.5 (`animate`, `createTimeline`, `stagger`, `onScroll`, `createDraggable`, `spring`, `svg`, `text`, `createScope`) | 13 KB for `animate` alone, 33 KB with most modules, 41 KB full | MIT; ESM and tree-shakable; the alternative to GSAP when the site needs physics or drag, see below |
| Shader plane, image distortion, gradient mesh | `ogl` 1.0 | 14 KB | small and stable; the right tool for one effect |
| Real 3D scene | `three` r187 (`WebGLRenderer`, GLSL) + `postprocessing` 6 on tier high | 132 KB minimum | lazy chunk; R3F 9 + drei 10 only when the site is React |
| Animated vector illustration | `@lottiefiles/dotlottie-web` | 50 KB | `lottie-web` is in maintenance; Rive runtime is 149 KB and only worth it for interactive state machines |
| Page transitions | Astro `ClientRouter`, Next `<ViewTransition>`, or native `@view-transition` for MPA | 0 | `swup` 4 or `@unseenco/taxi` 2 when a vanilla MPA needs JS transitions |
| Physics | `@dimforge/rapier` | large | Playground on tier high only |
| Sound | `howler` | 8 KB | muted by default, visible toggle |
| Images at build | Astro `<Image>` / `sharp` | build only | AVIF + WebP + sizes |
| Fonts | Astro fonts API / `next/font` / Fontsource | | subset, fallback metrics |

### Do not use

- **Locomotive Scroll** (superseded by Lenis), **Barba.js** (stale since 2024; use view transitions
  or swup), **Theatre.js** (stale since 2024), **ScrollMagic**, **AOS**, **wow.js**, **jQuery**.
- **Gatsby** and **Create React App** (unmaintained), a client-rendered SPA for a content site.
- **Webflow** or **Framer** unless the person explicitly wants to edit visually: no test suite can
  run on them in CI, no code ownership, and exports are partial. When they are required, keep the
  custom code in a repo, add GSAP through the embed, and run the published URL through the
  `stagecraft audit` checks instead of the suite.
- **Spline** embeds on marketing pages (heavy runtime, poor on low-end phones); export a GLB and
  render it with three, or ship a video.
- **WebGPU** as the primary renderer (85 % support and a separate code path); it is opt-in on
  tier high with a WebGL fallback.
- Two rAF loops (Lenis and GSAP each ticking): one ticker.
- CSS-in-JS runtime styling for a content site.

## GSAP or anime.js

Both drive the same choreography; pick one per site, never both. GSAP (with ScrollTrigger) is the
default for scroll scenes: pinning, scrub with smoothing, `invalidateOnRefresh`, Flip, and the
mature `SplitText`. anime.js 4 earns its place when the site needs what GSAP charges for or lacks:

- **Spring easing** on real physics (`spring({ mass, stiffness, damping, velocity })`): buttons
  that settle, cards that land, a dial that overshoots and returns. GSAP has no spring.
- **Draggable with physics** (`createDraggable` with `container`, `snap`, `releaseEase`, velocity):
  a Playground direction's stickers and tickets, a horizontal strip you can throw.
- **SVG** `createDrawable` (draw-on without measuring path lengths), `morphTo` (shape to shape, same
  point count handled for you), `createMotionPath`; the Blueprint direction in three calls.
- **`stagger` on grids** (`{ grid: [cols, rows], from: 'center', axis }`) with jitter and
  per-target modifiers: a wall of tiles that ripples from the hovered one.
- **`text.split`** into lines, words and characters with accessible wrapping, `scrambleText` for
  the Specimen direction's readouts.
- **`onScroll`** observers with `sync` modes (play once, scrub, smooth scrub) when the site has no
  pinned scenes; for pins and long scrubbed scenes stay with ScrollTrigger.
- **`createScope`** with media queries and a one-call `revert()`: the cleanest teardown for
  client-side page transitions.
- A **three.js adapter** that animates object transforms, materials and uniforms with the same
  timeline API.

Import only what the page uses; `animate` alone is 13 KB gzip, most of the engine 33 KB. Keep the
single-ticker rule: with Lenis, drive anime through its engine (`engine.update` from the GSAP or
Lenis ticker) or let Lenis run native-timed.

## Install commands

Astro:
```bash
npm create astro@latest site -- --template minimal --typescript strict --no-install
cd site && npm i && npm i gsap lenis && npm i -D @playwright/test @axe-core/playwright
node <skill>/scripts/add-tests.mjs . --base http://localhost:4321 --preview "npm run preview"
```

Vite:
```bash
npm create vite@latest site -- --template vanilla-ts && cd site && npm i && npm i gsap lenis
```

Next.js:
```bash
npx create-next-app@latest site --ts --app --src-dir --no-tailwind --eslint && cd site && npm i gsap lenis
```

## Wiring motion into each stack

**Astro.** Motion code lives in `src/scripts/*.ts` imported by the layout with `<script>` (bundled,
module, deferred). Re-run inits on `astro:page-load`, kill on `astro:before-swap`. Islands only for
stateful UI (a menu, a form); GSAP does not need a framework island.

**Vite.** `main.ts` boots `tier.ts`, then the gate, then motion; the scene is `import('./scene')`
after `load`.

**Next.js.** A `'use client'` `<Motion>` component mounted in the root layout that initialises
Lenis and ScrollTrigger inside `useEffect` with `gsap.context` and cleans up; scenes in
`dynamic(() => import('./Scene'), { ssr: false })` rendered only when `tier !== 'low'`.

**Nuxt / SvelteKit.** The same shape with `onMounted` / `onMount` and the route-change hooks.

## A three.js scene that looks made

Only when the subject is a thing (`intake.md`, Q5 and Q7) and a real model of it exists. What makes
a scene read as made is the model first, then light and materials, then motion:

- **The model** is a GLB of the product, a CAD export, or a CC0 scan of the same kind of object.
  Never primitives: boxes, planes with screenshots on them, extruded type and torus knots read as a
  tutorial however they are lit.
- **Light** from an environment map (`RoomEnvironment` through `PMREMGenerator`, or a CC0 HDRI),
  one key light with soft shadows on tier high, a cool rim; ACES tone mapping, sRGB output.
- **Grounding**: a contact shadow under the object on every tier, a shadow-catching floor on high.
- **Motion**: a slow turntable so it never stops dead, mouse parallax on fine pointers, the scroll
  turning and dollying it through GSAP; paused off screen and on `visibilitychange`.
- **Delivery**: the chunk dynamic-imported after `load`, only when `tier !== 'low'` and not on a
  software renderer (`softwareGl()`); the same composition as a still for everyone else.

`assets/runtime/hero-scene.ts` does all of this for a GLB URL (`createHeroScene(canvas, { tier,
model })`, Draco and meshopt supported). When the object does not need to react to the visitor,
render it in Blender instead and ship the footage: the quality of an offline render at the cost
of a video.

## Sourcing assets

The asset floor (`intake.md`, Q7) is met with real material, not built from nothing. Free libraries
first, and only what the licence allows in a public repo:

| Need | Where | Licence |
|---|---|---|
| Scanned props, furniture, devices, plants | Poly Haven models (glTF and .blend at 1k to 8k) | CC0 |
| PBR textures: concrete, plaster, wood, metal, fabric | Poly Haven textures, ambientCG | CC0 |
| HDRI lighting and reflections | Poly Haven HDRIs | CC0 |
| Stylised low-poly kits | Kenney, Quaternius | CC0 |
| Specific products, vehicles, characters | Sketchfab (filter on downloadable and licence) | per model: CC0, CC-BY (credit in the repo) or paid; check every file |

- Poly Haven has an API: `https://api.polyhaven.com/assets?t=models` lists assets with tags and
  `https://api.polyhaven.com/files/<id>` gives the file URLs per format and resolution. Send a
  `User-Agent` header; requests without one get 403.
- Pick the 1k or 2k glTF for real time, 2k to 4k for offline renders. Check the scale in metres and
  the facing direction before placing anything.
- Optimise for the web with `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt
  --texture-compress webp`; a hero model lands at 1 to 4 MB, loaded after first paint.
- Offline renders: Blender runs headless (`blender -b -P scene.py -- out.png`), builds the scene
  from the same assets through its Python API and renders with Cycles on the GPU (Metal, CUDA,
  OptiX). Check every frame at 100 % for noise, contact shadows and scale before it ships; a render
  that would not pass as a photograph is worse than no render.
- Record the source and licence of every asset in the repo (`ASSETS.md` or the README).

## A product on a studio set

The hero of a product, a tool or an instrument is the real object, rendered live (`craft.md`
section 7). Measured on the stagecraft site: an 18 k-triangle model with 2k PBR textures, a 512 x 256
HDRI and one soft shadow renders at 120 fps at 2x on a laptop GPU, full screen.
- **Assets.** Poly Haven models (CC0) through their API (`api.polyhaven.com/files/<id>`, send a
  User-Agent): take the glTF at 2k, convert the JPEG textures to WebP (about 1.3 MB for three maps at 2k,
  0.36 MB at 1k) and make a second `.gltf` that points at the 1k set for the mid tier. Downsample the
  HDRI to 512 x 256 (`ffmpeg -vf scale=512:256`, 0.37 MB): it lights, it is never seen. Credit both.
- **Load.** three.js (`GLTFLoader`, `HDRLoader`, `PMREMGenerator`) in a dynamic `import()` after the
  tier check, never in the first view's bundle (about 157 KB gzip). Keep the shot and state types in a
  separate module with no three.js import, so the page animates the state before the renderer exists.
- **Shots.** Describe each chapter as an orbit (azimuth, elevation, distance, target height, field of
  view) plus a sideways view offset (`setViewOffset`) that puts the object right of centre for copy on
  the left; tween the numbers between chapters.
- **Points on the model.** Find features from the geometry once (the glass material's vertices
  clustered for lens centres, the outermost points of a side for a key) and keep them in model units for
  the camera move and the labels.
- **Parts for an exploded view.** `node <skill>/scripts/explode-gltf.mjs model.gltf model-parts.gltf`
  splits the model into one mesh per connected part and writes each part's axis, distance and order
  into its node extras (GLTFLoader puts them in `userData`); copy the `.gltf` for the 1k textures, and
  `--spread 0.84,0.84,1` tightens the sideways and upward spread for a wide frame. At runtime keep each
  part's rest position, give it a delay of `rank * 0.42` and move it to
  `rest + dir * dist * easeInOutCubic((explode - delay) / 0.52)`. The parts share their materials:
  patch each material's shader once, not once per mesh. Parent the drawing (lines, outline, paper) to
  each part so it comes apart too, and lift the drawing's clipping plane once it is drawn, or the parts
  that rise above the body are cut off. 39 parts with their drawing are about 160 draw calls, fine on
  the high and mid tiers.
- Software renderers and low tier get a still of each shot rendered from the same scene.

## Filming the work

When the subject is the work itself (a site, an app, a product interface), film it rather than
draw a mock-up of it. `scripts/film.mjs <url> --out public/reel/name` opens the page on the real
GPU, scrolls it at a steady cadence (a wheel event every 50 ms, eased, so smooth-scroll libraries
interpolate), captures screencast frames at JPEG 92 and encodes seamless H.264 loops at 1280 and
720 wide plus a poster.

- `--hide "header, .caption"` films a text-free version for a clip that will sit behind other copy.
  A recording of a site played full bleed behind another site's text stacks two interfaces; either
  film it text-free or show it inside a frame.
- Clips of 10 to 15 s, 0.5 to 1.2 MB at 1280 wide; one playing at a time, `preload="none"` until the
  chapter before it, paused off screen, posters for low tier and reduced motion.
- For interaction (hover previews, toggles), pass `--drive drive.mjs`: its default export gets
  `{ page, ms }` and moves the pointer instead of the steady scroll. Glide it in small steps so a
  custom cursor moves like a hand.
- Film at the frame's own ratio (`--viewport 1200x960` for a 5:4 frame) so nothing is cropped, and
  start where the page is strongest (`--start`), not at the top by habit.
- H.264 does not play in Playwright's bundled Chromium. Check video in installed Chrome
  (`channel: 'chrome'`), Firefox or WebKit before calling a reel broken or working.

## Fitting into an existing codebase

1. Read the stack and the design tokens first; reuse their fonts, colours and spacing variables.
2. Add the motion layer additively: a `motion/` folder, the tokens from `motion.md`, `tier.ts`,
   `reveal.ts`; no changes to routing or data.
3. Add the test suite with `add-tests.mjs` pointed at their preview command; set budgets to their
   current numbers plus the targets, and tighten over time.
4. Do not change a working path to fix another; gate new behaviour on new markup
   (`data-reveal`, `data-theme`) so untouched pages are untouched.

## Hosting

Static output goes anywhere (Cloudflare Pages, Netlify, Vercel, Railway static, S3). Make sure
the host serves AVIF and WOFF2 with long cache headers and Brotli; the test suite measures transfer
size, so compression is part of the budget.
