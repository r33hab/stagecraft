# Critique: the rubric, the review pass and the anti-patterns

Run this before showing anything. Score honestly; a 3 is "a competent agency would ship it", a 5
is "people will screenshot it". Anything under 3 on any axis means another pass before delivery.

## Rubric (1 to 5 each)

| Axis | 1 | 3 | 5 |
|---|---|---|---|
| **Concept** | a template with the brand swapped in | a clear direction executed consistently | one idea you can say in a sentence, carried by one object through every chapter |
| **Frame** | needs motion to look designed; type and boxes only | the hero still is strong and shows the subject | any frame from the scroll shows the subject's material with one clear focal point and a type scale with real contrast |
| **Choreography** | effects bolted on, everything fades up, chapters restart | motion has a hierarchy and one signature moment | a carrier through the chapters, every change a moving edge with overlap, copy holds, nothing competes with the signature |
| **Craft** | default fonts, pure black, cards with shadows | tokens, fluid type, considered colour, one easing family | type, colour, spacing, easing and copy all read as one hand |
| **Performance** | over budget on phones | within budget on mobile-low | lean: under half the budgets, scene lazy, 60 fps on device |
| **Usability** | hidden nav, hijacked scroll, no focus ring, copy you cannot read in time | floor met (keyboard, reduced motion, contrast, 320 px, reading spec green) | the accessible path is as designed as the main one |

Stamp the scores at the top of the delivery note and in a comment at the top of the main stylesheet:
`/* stagecraft critique: C4 F4 Ch5 Cr4 P5 U4 */`.

## The review pass (do it, do not imagine it)

1. Static frame: capture the hero at 1440 and 390 with animations disabled (`visual.spec.ts`
   does this); look at the two images.
2. Watch it: `node <skill>/scripts/frames.mjs <url>`. Open every contact sheet; open single frames at
   full size on both sides of every chapter change. Read `verdict.md`.
3. Reading: `reading.spec.ts` green on desktop (copy holds, no empty screens, no stacked copy).
4. Throttle: run `perf.spec.ts` on `mobile-low`; read the printed table.
5. Reduced motion: run the `reduced-motion` project; open the site with the OS setting on.
6. Keyboard only: Tab from the top to the footer; everything reachable, everything visible.
7. Real device when possible; say which device was used.
8. Scroll length: read `scroll length (screens)` from the perf table. Over 12 on the landing,
   raise Q6 of the intake (a page map, `ux.md`) instead of adding chapters.

Compare what you watched with `docs/concept.md` (concept, carrier, signature) and with the numbers
in `craft.md`, and say plainly where the result falls short. A delivery note that only lists what
passed is not a critique.

## Anti-patterns (the things that read as generated)

Layout and visual
- Hero with a gradient blob, three feature cards with icons, a testimonial carousel, a CTA band:
  the default rhythm.
- Cards with `rounded-2xl` and a drop shadow for everything; glassmorphism panels; purple-to-blue
  gradients; neon glow on text.
- Pure `#000` on a page that is not a screen; cold grey `#888` body text.
- Inter or Roboto at 400 everywhere; six type sizes; display and body too close in size.
- A grotesk headline with one phrase swapped into an italic serif in the accent colour ("Sites that
  convert, *beautifully.*"): the most common generated headline. One voice per headline.
- Fake browser chrome around screenshots, fake phone frames, fake terminal windows.
- Stock photos of people pointing at laptops; AI-generated imagery with the tell-tale sheen.
- Invented metrics, logos, quotes and awards.
- Props from a metaphor for the product's name (a stage, tickets and spotlights for a tool called
  "stage-something") instead of the product's own material: it reads as a costume.
- A consent modal over the hero.

Motion
- Everything fades up on scroll with the same stagger ("fade-up fatigue").
- Copy that is gone before it can be read: scrubbed out, swapped on a stage in under 0.75 vp, or
  carried by a track that moves faster than the scroll. Measured by `reading.spec.ts`.
- A chapter change that fades to an empty colour, or two full backgrounds crossfading.
- Copy stacked on copy during a slide or a crossfade.
- A page that restarts every section: no carrier, each chapter a new layout with nothing in common.
- A loader over 4 s, a gate (cookie, audio, age) before the hook, the loader replayed on internal
  links, a page transition that holds the old page before it moves.
- The generic horizontal gallery: a 1:1 rail of cards with no lead-in and no exit.
- `scrub: 0.8` on top of Lenis (media trails); two smooth-scroll libraries; locomotive-scroll.
- Scroll hijack or snap on text pages; horizontal scroll on touch.
- Custom cursor on touch; a custom cursor next to the native one, or trailing it by a few frames;
  magnetic buttons on touch; hover-only information.
- Animated grain; blur animations on large areas; `filter` in scroll handlers.
- 3D assembled from primitives (boxes and planes with screenshots on them, extruded letters, a torus
  knot), however lit; flat-shaded or unlit 3D with no environment map.
- A floating letter, logo, blob or abstract object as the hero: an ornament that tells nothing about
  the subject.
- A "dive" that scales one flat layer until it is a giant silhouette, or a frame that tilts like a
  card: there is no camera, so there is no depth. Move a camera in a 3D scene inside a frame that grows
  flat (`craft.md`, "A camera move into the object"). A push that ends in the model's surface reads as a render
  (soft texels filling the screen): stop while the feature is sharp and hand over through it.
- A natural phenomenon rendered as the hero (an aurora, an ocean, fire, clouds, a sky): live it reads as
  a cartoon however it is lit, and light drawn as strokes reads as a barcode. Use footage, or an object
  that renders (`craft.md` section 7).
- Scenery with no hand: zigzag mountains, gradient-stripe skies, a flat disc for a moon, a cabin floating
  on a slope.
- Screen recordings of a site played full bleed behind another site's copy: two interfaces stack.
- Content stuck at opacity 0; pinned sections that overlap the next chapter.
- `will-change: transform` on 200 elements; debug panels (Tweakpane, lil-gui, stats.js) shipped.

Performance and UX
- 10 to 26 MB first views from eager preloading of every project image.
- 50 script tags from 8 hosts; four analytics vendors; a chat widget.
- Fonts from a third-party CSS endpoint on the critical path; five font families.
- `100vh` heroes with the CTA under the address bar.
- The whole site on one page: every topic a chapter, twenty screens of scroll, the comparison or
  the pricing buried at the end. The landing promises and routes; pages deliver (`ux.md`).
- Body copy at 8 to 12 px on a big stage; labels at 25 to 40 % opacity on dark.
- Focus rings removed; nav behind a hamburger on desktop for no reason; a 404 that is the host's
  default page.
- Lorem ipsum in a screenshot.
- Previews drawn as grey bars, empty tiles and placeholder boxes where the real work could be
  shown: film it or show the artefact (`craft.md` section 11).

## Common fixes, ranked by how often they are needed

1. Hold the copy: lengthen the stage state, pin the statement, slow the track (stepped track,
   `craft.md` section 4), or let it scroll off instead of fading.
2. Close the gap between chapters: the next chapter arrives over the current one (frame window,
   slab, curtain) with 0.3 to 0.5 vp of overlap.
3. Hide the custom cursor on touch (`(pointer: coarse)`) and make it track 1:1.
4. Lazy-load project images and media (the 15 to 26 MB cases).
5. Add `prefers-reduced-motion` handling (missing on roughly half of the WebGL-heavy sites).
6. Move the consent UI off the hero; cut the loader to 2 to 4 s and skip it on repeat visits.
7. Remove debug UI; cap the pixel ratio of canvases; replace `100vh` with `100svh`.
