---
name: stagecraft
description: "Design and build award-calibre, animated, scroll-driven storytelling websites (launch pages, portfolios, studio and product sites, campaign microsites, long-read reports) that still run smoothly on low-end phones, with a bundled Playwright suite that enforces performance, accessibility, motion and responsive budgets. Use whenever someone wants a site that should wow, raise eyes, win awards, feel cinematic, immersive, kinetic, premium or 'like the award-winning ones'; asks for scroll animations, WebGL or 3D heroes, page transitions, preloaders, scrollytelling, a portfolio or landing page with real craft; asks for several design directions or variations of a page; wants an existing marketing site audited for motion, performance or 'looks generic'; or wants Playwright tests for an animated site. Also use for 'make it less templated', 'add some wow' and 'redesign the landing page' requests, even when no award is mentioned."
version: 1.0.0
---

# Stagecraft

A skill for building the kind of website juries reward: one idea, directed motion, a static frame
that already looks made on purpose, and a page that holds 60 fps on a cheap phone. It encodes what
roughly a hundred award-winning and honourably-mentioned sites actually do (read from their source
and watched in a browser), the budgets that separate the lean winners from the heavy ones, and a
test suite that turns the jury's checklist into assertions.

The bar, in the jury's own weighting: **design 40 %, usability 30 %, creativity 20 %, content 10 %**.
Newcomers over-index on creativity (a WebGL gimmick) and lose the 70 % that is design plus
usability. The three things that separate a 6.5 from a 9 are art direction (take the motion away and
the frames still look designed), choreography (motion has a director, not just a library) and
performance on real devices. Miss one and the site caps in the mid 7s.

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
codebase, languages) from the brief and the repo. Then ask at most four questions from
`references/intake.md` with `AskUserQuestion`: purpose, who edits, how far the motion goes, and a
feel. Never ask about frameworks or libraries; the answers decide the stack and you state it in one
plain sentence. If the person says "just build it", take the recommended defaults and say so.

### 1. Concept, direction, signature moment
Write three lines before any code and keep them in `docs/concept.md`:
- **Concept**: one sentence ("a portfolio that reads like a printed monograph", "a product page that
  is a day of ownership").
- **Direction**: one of the sixteen in `references/directions.md`, or a named remix from its axes.
  Rotate; never the same direction twice in a row (`.stagecraft/log.json`).
- **Signature moment**: the one interaction people will screenshot. Everything else is smaller,
  shorter and quieter to protect it.

When the brief is open or the person asked for options, run the variations protocol in
`directions.md` (three sketches, recommend one, build the pick).

### 2. Stack
From the intake table (`references/intake.md`, then `references/stack.md`): Astro for content sites,
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
3. **Motion layer.** Reveals with `assets/runtime/reveal.ts` (never-stuck guarantee), then the
   chapter transitions, then the signature moment. Recipes in `references/motion.md`. Reduce, do not
   remove, under `prefers-reduced-motion`.
4. **Media.** AVIF/WebP with sizes, posters before video, scenes and sequences as lazy chunks
   behind the tier check, the hero headline rendered in HTML as the LCP element.
5. **Chrome.** Visible nav, skip link, focus ring, 404 page, meta and share image, consent off the
   hero (`references/ux.md`).

Rules that hold in every direction (each one was a real flaw on a studied winner):
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
performance, usability), 1 to 5; anything under 3 gets another pass. Do the juror test for real:
look at the two static hero captures, read the perf table from `mobile-low`, run the reduced-motion
project, tab through the page. Check the anti-pattern list. Then deliver with:

```
Concept: <one sentence>  Direction: <name>  Signature: <moment>
Stack: <one line, why>
Scores: C S Ch Cr P U
Budgets (mobile-low): LCP … CLS … scripts … KB  frame p95 … ms  total … KB
Tests: <passed/failed per spec>, baselines created
Open: <placeholders to fill, assets to supply, anything skipped and why>
```

## Where to read next

| Need | File |
|---|---|
| the questions, defaults and the answer-to-stack tables | `references/intake.md` |
| the sixteen directions, remix axes, variations protocol | `references/directions.md` |
| the arc, chapter types, transitions, gates, endings | `references/story.md` |
| tokens, two layers, reduced motion, never-stuck, recipes with code | `references/motion.md` |
| budgets, tiers, LCP path, mobile pitfalls, 3D rules, how winners weigh | `references/performance.md` |
| pairings, fluid scale, loading | `references/typography.md` |
| token model, palettes from winners, contrast, chapter-shift | `references/color.md` |
| navigation, keyboard, touch, forms, consent, SEO, copy honesty | `references/ux.md` |
| decision table, versions, do-not-use list, wiring per framework | `references/stack.md` |
| the suite: projects, specs, budgets file, reading failures, CI | `references/testing.md` |
| rubric, juror test, anti-patterns, most frequent fixes | `references/critique.md` |
| twenty studied winners: what you see and how it is built | `references/field-notes.md` |

Runtime helpers to copy into a project: `assets/runtime/` (`tier.ts`, `reveal.ts`,
`lenis-gsap.ts`, `motion.css`). Test suite: `assets/tests/`. Scripts: `scripts/add-tests.mjs`,
`scripts/check-budgets.mjs`.

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
- Public sites named in `field-notes.md` are studied for technique; never copy their assets, copy
  or layouts one to one.
