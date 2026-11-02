# Critique: the rubric, the juror test and the anti-patterns

Run this before showing anything. Score honestly; a 3 is "a competent agency would ship it", a 5
is "people will screenshot it". Anything under 3 on any axis means another pass before delivery.

## Rubric (1 to 5 each)

| Axis | 1 | 3 | 5 |
|---|---|---|---|
| **Concept** | a template with the brand swapped in | a clear direction executed consistently | one idea you can say in a sentence, visible in every chapter |
| **Static frame** | needs motion to look designed | hero screenshot is strong | every chapter screenshot could be a poster |
| **Choreography** | effects bolted on, everything fades up | motion has a hierarchy and one signature moment | transitions feel like camera moves; nothing competes with the signature |
| **Craft** | default fonts, pure black, cards with shadows | tokens, fluid type, considered colour | type, colour, spacing and copy all read as one hand |
| **Performance** | over budget on phones | within budget on mobile-low | lean: under half the budgets, scene lazy, 60 fps on device |
| **Usability** | hidden nav, hijacked scroll, no focus ring | floor met (keyboard, reduced motion, contrast, 320 px) | the accessible path is as designed as the main one |

Stamp the scores at the top of the delivery note and in a comment at the top of the main stylesheet:
`/* stagecraft critique: C4 S4 Ch5 Cr4 P5 U4 */`.

## The juror test (do it, do not imagine it)

1. Static frame: capture the hero at 1440 and 390 with animations disabled (`visual.spec.ts`
   does this); look at the two images.
2. Throttle: run `perf.spec.ts` on `mobile-low`; read the printed table.
3. Transitions: scroll through on `desktop` with the trace on; watch the chapter boundaries and one
   page change.
4. Reduced motion: run the `reduced-motion` project; open the site with the OS setting on.
5. Keyboard only: Tab from the top to the footer; everything reachable, everything visible.
6. Real device when possible; say which device was used.

## Anti-patterns (the things that read as generated)

Layout and visual
- Hero with a gradient blob, three feature cards with icons, a testimonial carousel, a CTA band:
  the default rhythm.
- Cards with `rounded-2xl` and a drop shadow for everything; glassmorphism panels; purple-to-blue
  gradients; neon glow on text.
- Pure `#000` on a page that is not a screen; cold grey `#888` body text.
- Inter or Roboto at 400 everywhere; italic headings; six type sizes.
- Fake browser chrome around screenshots, fake phone frames, fake terminal windows.
- Stock photos of people pointing at laptops; AI-generated imagery with the tell-tale sheen.
- Invented metrics, logos, quotes and awards.
- A consent modal over the hero.

Motion
- Everything fades up on scroll with the same stagger ("fade-up fatigue").
- Parallax on every image; a preloader longer than the load; a loader on every page.
- Scroll hijack or snap on text pages; horizontal scroll on touch.
- The generic horizontal gallery as the only idea.
- Custom cursor on touch; magnetic buttons on touch; hover-only information.
- Animated grain; blur animations on large areas; `filter` in scroll handlers.
- Lottie for everything; a 3D hero that blocks the headline; sound on by default.
- Content stuck at opacity 0; pinned sections that overlap the next chapter.
- Two smooth-scroll libraries; locomotive-scroll; `will-change: transform` on 200 elements.
- Debug panels (Tweakpane, lil-gui, stats.js) shipped to production: seen on four award entries.

Performance and UX
- 10 to 26 MB first views from eager preloading of every project image.
- 50 script tags from 8 hosts; four analytics vendors; a chat widget.
- Fonts from a third-party CSS endpoint on the critical path; five font families.
- `100vh` heroes with the CTA under the address bar.
- Focus rings removed; nav behind a hamburger on desktop for no reason; a 404 that is the host's
  default page.
- Lorem ipsum in a screenshot.

## Common fixes, ranked by how often they were needed on studied sites

1. Hide the custom cursor on touch (`(pointer: coarse)`): present on 6 of 23 probed winners.
2. Lazy-load project images and media (the 15 to 26 MB cases).
3. Add `prefers-reduced-motion` handling (missing on roughly half of the WebGL-heavy entries).
4. Move the consent UI off the hero.
5. Remove debug UI.
6. Cap the pixel ratio of canvases.
7. Replace `100vh` with `100svh`.
