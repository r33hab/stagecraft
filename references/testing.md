# Testing: the suite, how to run it, how to read it

The bundled Playwright suite turns a reviewer's checklist into assertions. It runs against a production
build served locally (or any URL), in five browser projects, and prints the numbers it measured so a
failure reads as a report, not a stack trace.

## Install into a project

```bash
node <skill>/scripts/add-tests.mjs <project-dir> --base http://localhost:4321 --preview "npm run preview" --routes "/,/work,/about"
npm i -D @playwright/test@^1.64 @axe-core/playwright@^4.14
npx playwright install chromium firefox webkit
```

The script copies `playwright.config.ts`, `tests/` and `stagecraft.budgets.json`, adds
`test:e2e`, `test:e2e:ui`, `test:budgets` and `test:perf` scripts to `package.json`, and leaves
existing files alone unless `--force`.

## Projects

| Project | Browser | Why |
|---|---|---|
| `desktop` | Chromium 1440 x 900 | the studio-monitor view; visual baselines |
| `mobile-low` | Chromium, 412 x 823 at DPR 1.75, 4x CPU throttle, slow 4G (CDP) | the reviewer's phone; perf budgets (warnings only when the budgets file says `"platform": "desktop-first"`, intake Q8) |
| `mobile-webkit` | WebKit, iPhone 14 | Safari quirks: `100svh`, video autoplay, seeking |
| `firefox` | Firefox 1440 x 900 | no scroll-driven animations: the observer path must work |
| `reduced-motion` | Chromium 1440 x 900, `reducedMotion: 'reduce'` | the vestibular-safe path |

## Specs

| File | Checks | Fails when |
|---|---|---|
| `smoke.spec.ts` | every route loads; one `h1`; `lang`; title; meta description; `main` landmark; no console errors; no failed requests; third-party script hosts counted | any error or missing basic |
| `responsive.spec.ts` | widths 320, 375, 414, 768, 1024, 1440: no horizontal overflow; 200 % zoom at 640; touch targets 44 px on mobile projects; text not clipped by `overflow: hidden` ancestors (headings) | overflow, tiny targets, clipped heading |
| `a11y.spec.ts` | axe (WCAG 2.2 AA tags) at top and after full scroll; Tab order reaches the footer; every focused element visible on screen and has a visible ring; skip link moves focus; Escape closes a menu if present | serious or critical violations; focus lost or invisible |
| `motion.spec.ts` | never-stuck: after a slow full scroll, no text, heading, image or `[data-reveal]` in view under 0.9 opacity or translated off; page height stable after settle (pin spacers); keyboard scroll works (End, PageDown); preloader gone within budget and skipped on second navigation; custom cursor hidden on touch; reduced-motion project: no running infinite animations, no autoplaying video, no smooth-scroll class | any of those |
| `perf.spec.ts` (Chromium projects) | LCP, CLS, long tasks during scripted scroll, frame-time p95 during scroll, transfer by type (script, css, font, image, media), font families count, DOM nodes, hero image attributes | budget exceeded (`stagecraft.budgets.json`) |
| `reading.spec.ts` (desktop) | scrolls each route at a steady 500 px/s and samples every large text block (26 px and up, and every `h1`/`h2`) 20 times a second: how long it stays readable (opacity 0.9 or more, 60 % or more of it visible through masks and clips), how it leaves, whether the screen ever shows no copy and no media, whether two blocks overlap with nothing opaque between them | a block stops being readable within `reading.minHoldVp` (0.6) viewports of scroll; a block in view for a viewport never becomes readable; an empty screen longer than `reading.maxBlankMs` (400); copy stacked on copy. Copy readable at load is exempt from the hold rule; mark deliberate exceptions `data-allow-hidden`, fixed or sticky `header` and `nav`, or `data-chrome` |
| `visual.spec.ts` | screenshots at top and 50 % on `desktop` and `mobile-low`, animations disabled, `[data-dynamic]`, video and canvas masked where they are painted on top | diff over `maxDiffPixelRatio` (0.02) |

Visual baselines are created on the first local run (the test passes and writes them under
`tests/stagecraft/__screenshots__`); commit them and regenerate on purpose with
`npx playwright test --update-snapshots`. In CI (`CI=1`) a missing baseline fails. Baselines are
per browser and OS: generate them in CI's image when CI runs them.

Markup the suite understands: `data-preloader` (the gate), `data-cursor` (custom cursor),
`data-reveal` (in-view reveals), `data-menu-button` (opens a menu, Escape must close it),
`data-dynamic` (masked in screenshots: clocks, marquees, canvases, video), `data-stage` (a
pinned stage whose copies swap; GSAP's `.pin-spacer` is recognised automatically),
`data-allow-hidden` (copy that is hidden by design; never the first state). All selectors are
configurable in the budgets file.

## Budgets file

```json
{
  "baseURL": "http://localhost:4321",
  "routes": ["/"],
  "budgets": {
    "lcpMs": 2500, "cls": 0.1, "longTaskTotalMs": 300, "longTaskMaxMs": 100, "frameP95Ms": 34,
    "scriptKb": 170, "lazyChunkKb": 260, "cssKb": 60, "fontKb": 150, "fontFiles": 2, "fontFamilies": 3,
    "imageKbMobile": 1200, "totalKbMobile": 2500, "totalKbDesktop": 6000, "heroImageKb": 250,
    "domNodes": 2500, "preloaderMs": 2500, "thirdPartyHosts": 2,
    "scrollScreens": 12          // optional: scroll length per route; without it the suite only warns past 12
  },
  "selectors": { "preloader": "[data-preloader]", "cursor": "[data-cursor]", "reveal": "[data-reveal]", "menuButton": "[data-menu-button]", "dynamic": "[data-dynamic]" },
  "lazyChunks": ["three", "scene", "webgl", "rive", "lottie", "sequence"],
  "axe": { "disableRules": [] },
  "visual": { "maxDiffPixelRatio": 0.02 }
}
```

`lazyChunks` are patterns for the file names of chunks that load after first paint: the static
check (`check-budgets.mjs`) cannot see a dynamic `import()`, so a lazy chunk it does not match counts
as initial script. A three.js stage in `stage.ts` builds to `stage.<hash>.js`: add `"^stage\\."`.

Loosen a budget only with a reason in the commit message. The perf spec prints a table of every
measured value so the numbers go into the delivery note.

## Running

```bash
npm run build
node scripts/check-budgets.mjs --dist dist            # static sizes, no browser
npx playwright test                                   # all projects (starts the preview server)
npx playwright test --project=mobile-low tests/perf.spec.ts
npx playwright test --ui                              # watch mode with traces
npx playwright show-report
```

Always test the production build. Dev servers serve unbundled modules and inflate every number.

## Reading failures

- **never-stuck** lists the elements: fix the trigger (threshold, `once`, `immediateRender`), not the
  test.
- **height unstable** after settle: a pin spacer or a late font changed layout; call
  `ScrollTrigger.refresh()` after `document.fonts.ready` and hero image load.
- **frame p95 over budget**: look for `filter`, `backdrop-filter`, animated grain, layout reads in
  rAF, `will-change` on many elements, a canvas at full DPR.
- **LCP over budget**: the LCP element is probably behind the gate or is the canvas; render the
  headline in HTML, preload the hero image, cut the entry chunk.
- **script over budget**: the 3D or Lottie chunk is in the entry; dynamic-import it after `load`.
- **axe colour-contrast**: muted text over paper or text over media without a scrim.
- **focus not visible**: a custom cursor or a `outline: none` reset.

## CI

```yaml
- run: npm ci && npx playwright install --with-deps
- run: npm run build
- run: node scripts/check-budgets.mjs --dist dist
- run: npx playwright test --reporter=github
- uses: actions/upload-artifact@v4
  if: failure()
  with: { name: playwright-report, path: playwright-report }
```

Optional Lighthouse CI (`lighthouserc.json` is bundled): `npx lhci autorun` after the build gives
the familiar score and a second LCP measurement.

## WebGL needs the real GPU

The suite's projects run in the default headless shell, which renders WebGL with SwiftShader:
slowly, and with different numerics from Metal and real drivers (undefined GLSL such as `pow` on a
negative base or `smoothstep` with reversed edges can render on one and go black on the other). To
look at a scene the way visitors see it, launch the full Chromium in new headless with the GPU on:

```js
chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
```

(`--use-gl=angle` instead of Metal on Linux and Windows.) Check the renderer string through
`WEBGL_debug_renderer_info` before trusting a screenshot.

## Watching a page frame by frame

`node <skill>/scripts/frames.mjs <url> [--out .stagecraft/frames] [--speed 500] [--mobile]` records
the intro and a steady-pace scroll at 10 fps on the real GPU and writes contact sheets (4 columns,
0.2 s apart for the intro, 0.3 s apart for the scroll), the single frames with their scroll position,
a timeline of every large text block (when it becomes readable, how long it holds, how it leaves) and
a verdict with the same rules as `reading.spec.ts`. It is the review the suite cannot do: look at the
sheets, then open single frames at full size on both sides of every chapter change. Needs ffmpeg for
the sheets; the timeline and verdict work without it.

## Manual review pass (not automatable)

1. Kill motion in your head: screenshot the hero on desktop and phone. Does the static frame look
   made on purpose?
2. Watch the transitions between chapters and pages, not the pages.
3. Scroll fast, then slow: does anything judder or never settle?
4. Toggle reduced motion in the OS: is the site still designed?
5. Open it on a real mid-range Android over mobile data.
