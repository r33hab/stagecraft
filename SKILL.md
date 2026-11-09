---
name: stagecraft
description: "Design and build award-calibre, animated, scroll-driven storytelling websites (launch pages, portfolios, studio and product sites, campaign microsites, long-read reports) that still run smoothly on low-end phones, with a bundled Playwright suite that enforces performance, accessibility, motion and responsive budgets. Use whenever someone wants a site that should wow, raise eyes, win awards, feel cinematic, immersive, kinetic, premium or 'like the award-winning ones'; asks for scroll animations, WebGL or 3D heroes, page transitions, preloaders, scrollytelling, a portfolio or landing page with real craft; asks for several design directions or variations of a page; wants an existing marketing site audited for motion, performance or 'looks generic'; or wants Playwright tests for an animated site. Also use for 'make it less templated', 'add some wow' and 'redesign the landing page' requests, even when no award is mentioned."
version: 1.1.0
---

# Stagecraft

A skill for building websites with one idea, directed motion, a static frame that already looks
made on purpose, and a page that holds 60 fps on a cheap phone. It carries a point of view on art
direction, choreography and performance, budgets that keep a site lean, and a test suite that
turns a reviewer's checklist into assertions.

The bar: design and usability count for far more than novelty. Newcomers over-index on creativity
(a WebGL gimmick) and lose on the fundamentals. The three things that separate a good site from a
remarkable one are art direction (take the motion away and the frames still look designed),
choreography (motion has a director, not just a library) and performance on real devices. Miss one
and the site reads as ordinary.

## Verbs

| Invocation | Does |
|---|---|
| *(default)* "build me …", "design …", "make a site for …" | the **Build flow** below |
| `stagecraft variations [n]` | three (or n) contrasting directions for the same brief or an existing page, as static hero sketches, then build the pick |
| `stagecraft audit <url or path>` | score an existing site on the rubric in `references/critique.md`, run the suite's checks it can run against a URL, return a ranked punch list; no edits |
| `stagecraft test` | add the Playwright suite to the current project, run it, fix what fails |

## Build flow

### 0. Read before asking
Collect the silent facts (name, one-line what, audience, brand assets, content on hand, existing
codebase, languages) from the brief and the repo. Then ask what the brief leaves open from
`references/intake.md` with `AskUserQuestion`, in rounds of at most four: purpose, who edits, how
far the motion goes, a feel, and for an ambitious brief or one with several subjects, what is the
one thing worth showing (Q5), how people should move through it (Q6: one scroll, a landing that
routes into pages, chapters as pages) and what material exists (Q7: photography or illustration, the
product or a model of it, footage or the work itself, or nothing yet). Ask where people will mostly
see it (Q8: on a computer, everywhere about equally, mostly on phones) whenever the brief does not say:
it decides which device gets the full experience and which budgets fail the build. For a Cinematic or
3D brief, or one that names awards, also ask which sites it should stand next to (Q9) and what the
scroll does (Q10). Never ask about frameworks or libraries; the answers
decide the stack and you state it in one plain sentence. If the person says "just build it", take
the recommended defaults, choose the signature and the page map yourself, and say so.

### 1. Concept, carrier, direction, signature moment
Write four lines before any code and keep them in `docs/concept.md`:
- **Concept**: one sentence about the subject, in the subject's own terms ("a portfolio that reads
  like a printed monograph", "a product page that is a day of ownership"). It comes from what the
  subject is and does: its material, its users, its moment. A sentence that would fit any other
  product is a template.
- **Carrier**: the one thing that stays on screen and carries every chapter (`references/craft.md`,
  section 1): the product, a card cut in a brand shape, a frame that becomes a window, a portrait, a
  drawn line, the wordmark, a readout. Chapters change the carrier; they do not replace the page.
- **Direction**: one of the sixteen in `references/directions.md`, or a named remix from its axes.
  Rotate; never the same direction twice in a row (`.stagecraft/log.json`).
- **Signature moment**: the one interaction people will screenshot, chosen with Q5 of the intake. It
  is built on the carrier and made of the subject (the thing itself, how it works, the body of work).
  Everything else is smaller, shorter and quieter to protect it.

**The floor for an ambitious brief.** When Q3 is Expressive or Cinematic, or the brief says wow,
award, immersive or memorable, a page whose sections fade up one after another has not met the brief.
Ship at least, with the numbers from `references/craft.md`:
- a hook in the first three seconds: the subject moving, through a loader that is the first scene
  (2 to 4 s, skipped on repeat) or no loader at all;
- the carrier, mounted once, changed per chapter;
- every chapter change made by a moving edge (frame zoom, rising slab, curtain, growing shape, brand
  wipe), with overlap, and never a frame without content;
- one text reveal family, every block held long enough to read (craft.md, section 3), copy leaving by
  scrolling off or being covered;
- one signature curve and one wipe curve for the whole site;
- a designed ending where the carrier returns;
- the low-tier and reduced-motion version of each.
Real material carries the frames: photography, illustration, the product, footage or drawings of the
work. Shapes built from primitives and abstract ornaments (a floating letter, a blob, a torus) are
not material; leave them out.

When the brief is open or the person asked for options, run the variations protocol in
`directions.md` (three sketches, recommend one, build the pick).

### 1b. The bar, the route and the gates (Cinematic, 3D, or "award" briefs)
Read `references/production.md` and do these before any scene is built. Skipping them is how a
day goes into procedural WebGL that never reaches the bar.
- **The bar.** Capture four to eight frames from two or three sites at the level asked for
  (`scripts/board.mjs capture <url>`), look at them at full size, and write `docs/bar.md`: what the
  frames share and the three to five rules the build keeps because of it.
- **The route.** For each scene, pick how its frames get made from the table in `production.md`
  (photography or footage, a real model on a studio set, a generated model cleaned and baked in
  Blender, an offline render or generated video as an image sequence, a filmed interface, a
  drawing). Live WebGL only for what the visitor operates. Landscapes, forests, water, weather and
  "drone flights" are never drawn live. Ask "what would a studio use for this frame", not "what can
  be coded".
- **Access.** When the route needs a key, a model, a licence or the client's material, ask for it in
  one message with what it buys and the rough cost, and wait. Never fall back silently to what can
  be coded without it.
- **Gate 1, style frame.** One still of the hero scene at target quality, paired with the closest
  board frame (`scripts/board.mjs pair mine.png reference.png`). Show the pair; build nothing more
  until the person says yes. If no still holds up next to the board, change the route or the concept.
- **Gate 2, vertical slice.** One scene finished in the browser (hook, stop, signature, one
  transition out), paired with the board, shown. Then the rest, each scene paired before the next.
At every gate, name the weakest part yourself and never call your own frames impressive.

### 2. Page map and stack
Q6 decides the page map before any chapter list (`references/ux.md`, "Page map"): a landing that
routes into pages with shared-element transitions, one scroll, or chapters as pages. Then the stack
from the intake table (`references/intake.md`, then `references/stack.md`): Astro for content sites,
Vite + TypeScript for a single-scene page, Next.js or Nuxt only when the brief has app features or
the codebase already uses them; GSAP + ScrollTrigger for choreography, Lenis on fine pointers only,
`ogl` for one shader, `three` only for a real scene, loaded after first paint. Nothing from the
"do not use" list. In an existing codebase keep their framework and add the motion layer additively.

### 3. Tokens
Before layout: colour tokens from `references/color.md` (semantic, OKLCH, near-black not pure
black, one accent), a fluid type scale and pairing from `references/typography.md` (one to three
families, a mono for metadata), motion tokens from `references/motion.md` (copy
`assets/runtime/motion.css`), spacing on an 8 px base. Every colour and font in components references
a token; a raw value is a bug.

### 4. Story
Map the page to the arc in `references/story.md`: gate (optional, under 1.5 s, real progress),
statement, promise, three to six chapters of one idea each, climax, resolution, designed ending.
Alternate dense and air chapters. Write the real copy now (no lorem ipsum, no invented numbers;
`[copy to confirm]` placeholders in the brand voice).

### 5. Build in this order
1. **Static frame first.** Full HTML and CSS with every end state visible, no JS. It must already
   look designed on desktop and on a 390 px phone. Screenshot both; if the frame is weak, fix the
   design, not the motion.
2. **Runtime tiering.** `assets/runtime/tier.ts` sets `html[data-tier]` before first paint; CSS and
   JS branch on it (`references/performance.md`).
3. **Motion layer.** The carrier first, then the chapter edges, then the text reveals
   (`assets/runtime/reveal.ts`, never-stuck guarantee), then the signature moment. Numbers from
   `references/craft.md`; moves from `references/choreography.md` (one signature, two or three
   supporting); code in `references/motion.md`; a 3D object only from a real model, loaded by
   `assets/runtime/hero-scene.ts` (sourcing in `references/stack.md`). Reduce, do not remove, under
   `prefers-reduced-motion`.
4. **Media.** AVIF/WebP with sizes, posters before video, scenes and sequences as lazy chunks
   behind the tier check, the hero headline rendered in HTML as the LCP element. When the subject
   is a site, an app or a product UI, film it with `scripts/film.mjs` (seamless loops, two sizes,
   a poster) instead of faking it in a mock-up.
5. **Chrome.** Visible nav, skip link, focus ring, 404 page, meta and share image, consent off the
   hero (`references/ux.md`).

Rules that hold in every direction (each one is a flaw seen often on high-end sites):
- Custom cursor and magnetic effects only on `(hover: hover) and (pointer: fine)`.
- `100svh` heroes; nothing important in the bottom 80 px on phones.
- Animate `transform`, `opacity`, `clip-path` and registered custom properties only; no `filter`
  or `backdrop-filter` on large areas; no animated grain.
- One ticker (`assets/runtime/lenis-gsap.ts`), one rAF loop, cleanup on every navigation.
- A preloader never outlasts the real load, is capped at 2.5 s, is skipped on repeat visits, and
  hides a headline that is already in the DOM.
- Lazy-load everything below the fold; never preload a whole gallery.
- No debug panels, no analytics before idle, at most two third-party script hosts.
- Marquees, autoplay video and looping scenes get a pause control.

### 6. Test
```bash
node <skill>/scripts/add-tests.mjs . --base http://localhost:4321 --preview "npm run preview" --routes "/"
npm i -D @playwright/test@^1.64 @axe-core/playwright@^4.14 && npx playwright install chromium firefox webkit
npm run build && npm run test:budgets && npm run test:e2e
```
The suite (`references/testing.md`) runs five projects (desktop, throttled low-end Android, iPhone
WebKit, Firefox, reduced motion) and checks smoke, responsive widths and touch targets, axe plus
keyboard order and focus visibility, the never-stuck reveal rule, layout stability, keyboard
scrolling, preloader and cursor rules, reduced motion, Core Web Vitals and weight against
`stagecraft.budgets.json`, and visual baselines. Fix the site, not the budgets; loosen a budget
only with a reason in the commit. Run against the production build.

### 7. Critique, then deliver
Score the six axes in `references/critique.md` (concept, static frame, choreography, craft,
performance, usability), 1 to 5; anything under 3 gets another pass. Do the review pass for real:
look at the two static hero captures, read the perf table from `mobile-low`, run the reduced-motion
project, tab through the page. Then watch the motion the way a visitor meets it, for real:

```bash
node <skill>/scripts/frames.mjs http://localhost:4321/ --out .stagecraft/frames
```

It scrolls at a steady reading pace, records every frame, and writes contact sheets, a timeline of
when each block of copy becomes readable and how long it holds, and a verdict. Open every sheet, and
open single frames at full size on both sides of each chapter change. Each question is a blocker:
1. Is every piece of copy readable long enough? (verdict clean; `reading.spec.ts` green)
2. Does any chapter change cut, fade to an empty colour, or stack copy on copy? (a moving edge with
   overlap, `craft.md` section 2)
3. Is the carrier on screen through the chapters, or does the page restart each section?
4. Does every frame show the subject's material (the product, the work, people, drawings of how it
   works), or only type and boxes?
5. Is every big move about the subject? An object that is not the product, the place, the mechanism
   or the work is an ornament: cut it.
6. Next to the board (`docs/bar.md`), does it hold up? Pair three of your frames with board frames
   (`scripts/board.mjs pair`), open each pair at 100 %, and name the three largest differences in
   material, light and composition. "Better than the last version" is not an answer, and a frame
   with no defects can still be amateur. Contact sheets are for timing; quality is judged at 1:1.
7. After a fix, was the reported frame itself re-captured and looked at, not a neighbour?
Compare the sheets with the hook and transitions you planned in `docs/concept.md`; say plainly where
the result falls short.
Fix, re-capture, then check the anti-pattern list and deliver with:

```
Concept: <one sentence>  Direction: <name>  Signature: <moment>
Bar: <the reference sites>  Route: <how the frames were made>  Gates: <who approved the style frame and the slice>
Weakest: <the frame that falls furthest short of the board, and why>
Stack: <one line, why>
Scores: C S Ch Cr P U (and B, the bar, when there is a board)
Budgets (mobile-low): LCP … CLS … scripts … KB  frame p95 … ms  total … KB
Tests: <passed/failed per spec>, baselines created
Open: <placeholders to fill, assets to supply, anything skipped and why>
```

## Where to read next

| Need | File |
|---|---|
| the questions, defaults and the answer-to-stack tables | `references/intake.md` |
| the reference board, production routes (real, generated, rendered, filmed), what cannot be drawn live, the style-frame and vertical-slice gates, asking for access, mechanics that cost hours | `references/production.md` |
| the sixteen directions, remix axes, variations protocol | `references/directions.md` |
| the numbers: carrier, chapter edges, text reveal and hold, pins, horizontal, loader, easing, 2D/3D craft, pointer, page transitions, pace | `references/craft.md` |
| the arc, chapter types, transitions, gates, endings | `references/story.md` |
| tokens, two layers, reduced motion, never-stuck, recipes with code | `references/motion.md` |
| the moves: horizontal handoff, frame to full bleed, stage swaps, camera dolly, disassembly, logo as window, pre-rendered video objects | `references/choreography.md` |
| budgets, tiers, LCP path, mobile pitfalls, 3D rules, lean versus heavy | `references/performance.md` |
| pairings, fluid scale, loading | `references/typography.md` |
| token model, palettes, contrast, chapter-shift | `references/color.md` |
| navigation, keyboard, touch, forms, consent, SEO, copy honesty | `references/ux.md` |
| decision table, versions, do-not-use list, wiring per framework, sourcing models and textures, filming the work | `references/stack.md` |
| the suite: projects, specs, budgets file, reading failures, CI | `references/testing.md` |
| rubric, review pass, anti-patterns, most frequent fixes | `references/critique.md` |
| field notes: techniques seen on public sites, what you see and how it is built | `references/field-notes.md` |

Runtime helpers to copy into a project: `assets/runtime/` (`tier.ts`, `reveal.ts`,
`lenis-gsap.ts`, `motion.css`, and `hero-scene.ts` for a real GLB). Test suite: `assets/tests/`.
Scripts: `scripts/add-tests.mjs`, `scripts/check-budgets.mjs`, `scripts/frames.mjs` (watch a page
frame by frame and judge its reading pace), `scripts/film.mjs` (film a page as a video loop),
`scripts/explode-gltf.mjs` (split a model into parts for an exploded view), `scripts/board.mjs`
(capture reference frames from public sites; pair your frame with a reference at full size).

## Audit flow (`stagecraft audit`)

1. Open the target at 1440 x 900 and 390 x 844 in a real browser; capture the hero and three scroll
   positions; read the runtime (fonts, scripts, bytes, canvases, running animations, cursor on
   touch, reduced-motion handling). The probe in `references/field-notes.md` describes what to read.
2. Score the rubric; list every anti-pattern hit with the fix from `critique.md`; estimate the
   budget gaps from `performance.md`.
3. If the source is available, run the suite against a preview URL with `BASE_URL=…` and attach the
   perf table.
4. Return a ranked punch list: the three changes that move the score most first. Do not edit unless
   asked.

## Safety rails

- In an existing project, never delete routes, components or content; add the motion layer and
  tokens additively and gate new behaviour on new markup. State the files you will touch first.
- Never fabricate metrics, clients, logos, quotes or awards.
- Reference material (brand PDFs, decks, transcripts) is source, not copy to paste verbatim.
- Public sites named in `field-notes.md` are references for technique; never copy their assets, copy
  or layouts one to one.
