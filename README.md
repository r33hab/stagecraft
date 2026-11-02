# stagecraft

A Claude Code skill for award-calibre, animated, scroll-driven websites that still run smoothly on
low-end phones, with a bundled Playwright suite that enforces the budgets.

It asks four plain questions (what the site is for, who edits it, how far the motion goes, a feel),
decides the stack itself, picks one of sixteen design directions (or remixes a new one), builds the
static frame first, then the motion layer with device tiering and reduced-motion handling, then
runs a test suite across desktop, a throttled low-end Android profile, iPhone WebKit, Firefox and
reduced motion.

## Install

Copy or symlink this folder into your skills directory:

```bash
git clone https://github.com/r33hab/stagecraft ~/.claude/skills/stagecraft
```

Then in any project: "build me a launch page for …", "stagecraft variations", "stagecraft audit
https://…", or "stagecraft test".

## What is inside

```
SKILL.md                 the flow: intake, concept, stack, tokens, story, build order, test, critique
references/
  intake.md              four questions nobody can answer wrong, answer-to-stack tables
  directions.md          sixteen directions with tokens, motion signatures, mobile translations; remix axes
  story.md               the scroll-narrative grammar: gate, statement, chapters, transitions, ending
  motion.md              motion tokens, CSS-first then GSAP, reduced motion, the never-stuck rule, recipes
  performance.md         budgets, device tiers, the LCP path, mobile pitfalls, 3D rules
  typography.md          pairings, fluid scale, font loading
  color.md               semantic OKLCH tokens, palettes from winning sites, contrast
  ux.md                  navigation, keyboard, touch, forms, consent, SEO, copy honesty
  stack.md               decision table, versions, do-not-use list, wiring per framework
  testing.md             the suite, budgets file, reading failures, CI
  critique.md            rubric, juror test, anti-patterns, most frequent fixes
  field-notes.md         twenty studied winners: what you see and how it is built
assets/
  runtime/               tier.ts, reveal.ts, lenis-gsap.ts, motion.css (copy into a project)
  tests/                 playwright.config.ts, tests/*.spec.ts, stagecraft.budgets.json, lighthouserc.json
scripts/
  add-tests.mjs          installs the suite into a project and wires npm scripts
  check-budgets.mjs      static gzip weight check on a build output
evals/                   example prompts for skill testing
```

## The test suite on its own

The suite works on any site, not only ones built with the skill:

```bash
node ~/.claude/skills/stagecraft/scripts/add-tests.mjs . --base http://localhost:4321 --preview "npm run preview" --routes "/,/work"
npm i -D @playwright/test@^1.64 @axe-core/playwright@^4.14
npx playwright install chromium firefox webkit
npm run build && npm run test:budgets && npm run test:e2e
```

It checks: page basics and console errors; horizontal overflow at seven widths and touch target
size; axe WCAG 2.2 AA, keyboard order, focus visibility, skip link, menu escape; reveals that never
fired (content stuck hidden), layout stability, keyboard scrolling, preloader timing, custom cursor on
touch, reduced motion; LCP, CLS, long tasks, scroll frame times, transfer by type, font families, DOM
size, hero image attributes; and visual baselines on desktop and mobile.

## Licence

MIT, r33hab.
