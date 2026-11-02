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
