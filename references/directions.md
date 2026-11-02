# Directions: sixteen starting points and a remix system

A direction is a complete recipe: surface, type, colour, layout grammar, motion signature, hero,
mobile translation, cost. Pick one, or remix along the axes at the end. Two briefs should never get
the same direction twice in a row; keep a note in `.stagecraft/log.json` (`{ "used": ["Monolith", ...] }`)
and rotate.

Every direction is calibrated on sites that juries rewarded in the last year. The common thread:
one or two type families, near-black instead of pure black, one accent, a mono face for metadata,
warm greys over cold ones, and a single signature moment that the rest of the page protects.

Type names below are free faces (Google Fonts or Fontsource) that carry the direction. Premium
swaps are named by *style* so a brand licence can replace them without changing the design.

---

## 1. Monolith
**Feel.** A wall of type. Black and off-white, one hot accent, hard cuts, nothing decorative.
**Good for.** Launches, studios with attitude, anything that must shout once.
**Type.** Display: a heavy grotesk or condensed (Archivo Black, Anton, Bricolage Grotesque 800). Text: Archivo or Inter Tight. Mono for labels (JetBrains Mono).
**Colour.** `--ink #111010`, `--paper #edeae4`, accent one of `#d2ff00` lime, `#ff4c41` red, `#1a2ffb` blue. No gradients.
**Layout.** 12-column grid with the headline spanning all of it at 12 to 18 vw. Sections are full-bleed blocks, alternating ink and paper. Rules (1 px) instead of cards.
**Motion.** Clip-path wipes between blocks; headline arrives by line with a 0.9 s power4 ease; marquee of one phrase; counters on stats. No parallax.
**Hero.** Headline fills the viewport; a single line of mono metadata top-left; CTA as a pill bottom-right.
**Mobile.** Headline wraps to 3 to 4 lines at 16 vw; blocks stack; marquee stays.
**Cost.** Low. Fonts 2, JS CSS + GSAP core.
**Avoid.** Gradients, shadows, more than one accent.

## 2. Editorial
**Feel.** A magazine spread: a serif that talks, a grotesk that explains, columns, captions, pull quotes.
**Good for.** Studios, portfolios with written case studies, reports, cultural sites.
**Type.** Display: Instrument Serif or Fraunces (premium swap: an "Editorial New" style). Text: Inter Tight or Manrope. Mono: IBM Plex Mono for folios and captions.
**Colour.** Warm paper `#f3eee3`, ink `#1b1d22`, one muted accent (brass `#d0a955` or oxblood `#390205`).
**Layout.** 6 or 12 columns; text measure 60 to 70 ch; images bleed on one side; running folio (section number, page title) pinned at the top; footnotes in the margin on wide screens.
**Motion.** Slow fades (0.6 s) and line reveals; images parallax at most 6 % of their height; sticky chapter titles; view transitions that keep the folio in place.
**Hero.** A statement set in the serif at 7 to 9 vw over paper, a dateline in mono, an image bleeding off the right edge below the fold line.
**Mobile.** One column, folio collapses to a thin top bar, pull quotes become full-width blocks.
**Cost.** Low.
**Avoid.** Italic headings as decoration, drop caps on every paragraph, serif body text below 18 px.

## 3. Cinema
**Feel.** Full-bleed film or CG stills; scroll is the timeline; a dial or timecode marks progress.
**Good for.** Cars, products with a "day in the life", documentaries, travel, campaigns with footage.
**Type.** Condensed caps for titles (Oswald, Anton, Barlow Condensed), a humanist sans for copy (Source Sans 3), mono for timecodes.
**Colour.** True black `#000` is allowed here (it is a screen, not a page), white at 90 %, one warm accent lifted from the footage.
**Layout.** Letterboxed stage pinned for several viewports; copy appears in a lower-third band; chapters separated by a hard black frame.
**Motion.** Scrubbed video or image sequence driven by scroll (see `motion.md`, "Sequence and video scrub"); a thin progress dial with a readout; chapter titles mask-in from the band.
**Hero.** Preloader as a dial counting to 100 over black (under 1.5 s), then the first still with the title in condensed caps; "scroll" cue with a chevron.
**Mobile.** Sequence becomes a poster-first muted video or three stills; stage is `100svh`; copy band is static.
**Cost.** High. Media budget dominates; keep sequences under 120 frames at 1280 px, AVIF or WebP.
**Avoid.** Autoplay with sound, text over busy frames without a scrim, scrubbing on touch without a static fallback.

## 4. Specimen
**Feel.** A technical sheet: mono labels, corner marks, grid ticks, coordinates, boot logs, readouts. The site presents itself as an instrument.
**Good for.** Developer tools, hardware, AI products, design-engineer portfolios, science.
**Type.** Mono carries the identity (Geist Mono, JetBrains Mono, IBM Plex Mono); a neutral grotesk for headlines (Geist, Inter Tight); optional serif for one human sentence (Instrument Serif).
**Colour.** Ink `#07070a` or paper `#f2f0ea`; a signal accent (`#fa3600` orange, `#0ae448` green); hairlines at 12 % alpha.
**Layout.** Visible grid: `+` marks at section corners, dotted rules, numbered sections `01 / 08`, metadata columns (TYPE / FOUNDED / LOCATION), a status line in the footer.
**Motion.** Text decodes (scramble to final), lines draw with stroke-dashoffset, counters, a progress rule that sweeps across the viewport; hovers switch a label's bracket state `[ ]` to `[x]`.
**Hero.** A big drawing or product render with a "spec block" bottom-right and a one-line headline bottom-left; the loader is a boot log.
**Mobile.** Grid marks shrink to the corners, metadata becomes a 2-column list, decode effects shorten to 300 ms.
**Cost.** Low to mid.
**Avoid.** Fake data readouts, more than one decode on screen at once, terminal green on black.

## 5. Atelier
**Feel.** Warm, hand-made, paper and grain, soft rounded corners, drawn lines; slow easing, nothing snaps.
**Good for.** Furniture, food, craft brands, studios that want to feel human, non-profits.
**Type.** A friendly grotesk (Hanken Grotesk, Figtree, Outfit) plus a soft serif (Fraunces at low optical size) or a script for one word only (Caveat, used once).
**Colour.** Paper `#f5f1ea`, clay `#c76f4a`, moss `#4c7036`, ink `#241f21`; two tints of paper for sections.
**Layout.** Generous whitespace, images in rounded frames (12 to 20 px), scattered product thumbnails that gather into a grid on scroll, captions in sentence case.
**Motion.** Drift (slow, 1.2 s, sine ease), images float a few px with the cursor, SVG lines draw in, a static grain overlay at 4 % (never animated on low tier).
**Hero.** A loose constellation of small photos around a short headline; the photos settle into place as the visitor scrolls.
**Mobile.** Constellation becomes a 2-column staggered grid; drift turns off; grain stays.
**Cost.** Low to mid (image-heavy; enforce AVIF and sizes).
**Avoid.** Beige on beige without contrast, blur-heavy backdrops, more than one script word.

## 6. Afterglow
**Feel.** Dark with light coming from inside: luminous gradients, glow, depth of field, thermal palettes; every chapter changes colour temperature.
**Good for.** Launches, product stories with an object to light, music, AI products that want atmosphere.
**Type.** A wide or geometric sans for the big word (Outfit, Urbanist, Syne), a readable sans for copy (Inter Tight), mono for specs.
**Colour.** Base near-black `#100904` or deep violet `#160923`; per-chapter glow (amber `#ff8a3d`, violet `#9047ff`, teal `#3dd6c3`); text in cream `#ffedd7`.
**Layout.** Centred stage with a dashed "viewfinder" frame where the object is sharp and the type behind it blurs; chapter copy in a left column; a vertical scale on the right.
**Motion.** Scroll-scrubbed blur and glow (a CSS filter on a small element, or a shader on tier high), huge word that passes behind the object, palette crossfades between chapters.
**Hero.** A dark room, one lit object, one huge word; the loader is a slow bloom.
**Mobile.** No filter animation; the glow is a pre-rendered image; chapter palettes still switch.
**Cost.** Mid to high. Filters and blur are the trap: confine to one small layer.
**Avoid.** Purple-to-blue gradient blobs behind cards, glassmorphism panels, glow on text.

## 7. Swiss
**Feel.** The modular grid on display: hairline columns, justified statements in two weights, numbered everything, mono timestamps, one red.
**Good for.** Agencies, consultancies, architecture, anything that sells rigour.
**Type.** A neo-grotesk (Inter Tight, Archivo, Public Sans; premium swap: a "Neue Haas" style) in two weights, mono for the small stuff (Space Mono, GT America Mono style). An ultralight serif for one contrasting line is allowed (Instrument Serif 400 at large size).
**Colour.** White, black, one red `#d10b11` or one blue. No greys lighter than `#8a8a8a` for text.
**Layout.** 6 equal nav columns with underlines; statement headlines justified full width mixing light serif and heavy grotesk words; three justified mono columns below; footer repeats the grid.
**Motion.** Elements slide along grid lines (x or y only), rules draw in, the name scrolls as a marquee in three cuts of the type; everything 0.5 s, expo ease.
**Hero.** The statement itself, plus local time and city in mono top-right.
**Mobile.** Nav becomes a 2-row grid; statement wraps; justification turns off below 600 px.
**Cost.** Low.
**Avoid.** Rotated text, drop shadows, more than two weights.

## 8. Playground
**Feel.** Colour, stickers, tickets, stamps, bouncy springs, things you can drag; cartoon 3D is welcome.
**Good for.** Games, events, consumer apps, agencies with humour, kids and culture.
**Type.** A chunky display (Bricolage Grotesque, Rubik Mono One used sparingly, Unbounded), rounded sans for text (Nunito, Figtree), mono for receipts and barcodes.
**Colour.** Two saturated primaries plus paper: sky `#6fb3f2` and red `#cf1830`; or lime and violet. Full-bleed colour per section.
**Layout.** Cards as tickets with dashed tear lines and barcodes, tilted 2 to 6 degrees, stacked; stickers on corners; a sound toggle.
**Motion.** Springs (overshoot 1.2), draggable cards (with keyboard alternative), hover wobble, confetti once (and only once), physics only on tier high.
**Hero.** A full-bleed colour block with the wordmark cut like a stencil, and slide dots.
**Mobile.** Tilt stays, drag becomes a swipe-able list with buttons, springs shorten.
**Cost.** Mid.
**Avoid.** Comic Sans energy without craft, more than three colours, motion that never settles.

## 9. Luxe
**Feel.** Slow, dark or cream, one metallic, product photography with room to breathe, serif display at scale.
**Good for.** Jewellery, watches, cars, hospitality, real estate, perfume.
**Type.** A high-contrast serif for display (Playfair Display, Cormorant, Instrument Serif), a quiet grotesk for copy (Inter Tight 300 to 400), tracked-out caps for labels.
**Colour.** Black `#0b0b0b` or cream `#f3eee3`, metallic accent (brass `#d0a955`, silver `#c9c9c9`) used only on rules and one word.
**Layout.** Centred compositions, 1 product per viewport, captions far below the image, horizontal case studies on desktop with a vertical fallback.
**Motion.** Mask reveals (clip-path inset) at 1.2 s, images scale from 1.08 to 1, fades at 0.8 s; nothing bounces; cursor becomes a small ring on fine pointers only.
**Hero.** One product, one serif line, a tracked label and a thin rule; loader is a hairline that grows.
**Mobile.** Horizontal case studies become vertical; image scale reveals stay.
**Cost.** Low to mid (photography weight).
**Avoid.** Gold gradients, script fonts, cursive "luxury" clichés, ultra-thin type under 300.

## 10. Volume
**Feel.** The page is a 3D object or world. Scroll moves the camera; the DOM is a thin layer of labels.
**Good for.** Studios that do 3D, hardware, campaign microsites, portfolios that want to be remembered.
**Type.** One sans only (Aeonik style: Manrope, Inter Tight) and one mono. Type stays small; the scene is the voice.
**Colour.** Two tokens in CSS (`--ink`, `--ivory`); everything else lives in the scene.
**Layout.** A rounded "card" viewport for the scene on wide screens (so the page still has margins), corner `+` marks, a "scroll to explore" cue, labels in the margins.
**Motion.** Camera on a scroll-bound spline, object rotates or disassembles on scroll, hover changes material; page transitions are a curtain that hides the scene swap.
**Hero.** The scene, framed, with a short headline below the fold that arrives when the scene settles.
**Mobile and low tier.** A looping poster video or a still of the same scene inside the same frame, same headline. The site must look designed, not degraded.
**Cost.** High. WebGL chunk loads after first paint; tier-gated; DPR capped; see `performance.md`.
**Avoid.** Shipping the scene before the headline, requiring WebGL to render any text, infinite loaders.

## 11. Archive
**Feel.** An index. Lists, tables, counts in parentheses, hover previews, hairline rows; the work speaks, the chrome is tiny.
**Good for.** Portfolios with many projects, designers, photographers, type foundries.
**Type.** A grotesk for project names at 3 to 6 vw (Archivo, Inter Tight), mono for the table columns (Geist Mono), count badges in mono `(05)`.
**Colour.** Ink and paper, one accent for the active state (blue dot `#2f6bff`). Dark or light.
**Layout.** Table header `# / PROJECT / TYPE / ROLE / YEAR`; rows are the whole-width links; LIST / GRID toggle; preview image follows the cursor on fine pointers, appears inline on touch.
**Motion.** Rows reveal with a 40 ms stagger; the preview image crossfades with a 0.3 s scale; the grid toggle uses a FLIP transition; case-study pages open with a shared-element view transition of the preview.
**Hero.** The word "WORK" at 20 vw with the count, the table starts immediately.
**Mobile.** Columns collapse to name + year, preview inline under the active row.
**Cost.** Low.
**Avoid.** Thumbnails grid as the only view, hover-only information, rows under 44 px tall on touch.

## 12. Poster
**Feel.** Every section is a poster: a giant word, a tilted photo stack, a stamp; the page is a wall of posters you scroll past.
**Good for.** Sport, music, events, personal brands, launches with attitude.
**Type.** Condensed caps at 25 to 35 vw (Anton, Bebas Neue, Oswald 700), a plain sans for details (Helvetica-like: Inter, Arimo).
**Colour.** Black, white, one team colour; a light grey sheet for the gallery wall.
**Layout.** Photo cards scattered and rotated (3 to 8 degrees) over a watermark word; stat columns with digits that scramble in; a yellow square menu button.
**Motion.** Scroll-snapping between posters is allowed on desktop (and only here); digits scramble on enter; cards fan out on scroll; parallax of the watermark at 20 % speed.
**Hero.** Monochrome photo, a huge number or word, three stats in a column, a quote top-right.
**Mobile.** No snapping; posters stack; cards fan less; stats become a row.
**Cost.** Low to mid.
**Avoid.** Snap on long text pages, more than one watermark per screen.

## 13. Kinetic
**Feel.** Type is the subject. Letters warp along paths, stretch on scroll speed, split and recombine; the copy is still readable at rest.
**Good for.** Type foundries, motion designers, launches with a short message, cultural campaigns.
**Type.** A variable font with real axes to animate (Fraunces, Roboto Flex, Inter with `opsz` and `wght`, Bricolage Grotesque); one mono for annotations.
**Colour.** Ink `#222` and paper, one accent for a single word.
**Layout.** Centre stage for one or two sentences at 8 to 14 vw; an index column at the right; advice cards below.
**Motion.** Scroll velocity maps to `font-weight` or `font-stretch` (clamped, eased back to rest); words set on an SVG path that straightens on scroll; letters scramble into place once; nothing moves after the visitor stops scrolling for 300 ms.
**Hero.** A modular wordmark built from blocks (SVG) that assembles, then the first sentence.
**Mobile.** Axis animation capped to weight only; path text becomes straight; same copy.
**Cost.** Mid (variable font 100 to 300 KB; subset it).
**Avoid.** Text that never settles, animating `font-size` (layout thrash), letterspacing animation on body copy.

## 14. Blueprint
**Feel.** Drawings that draw themselves: elevations, isometric circuits, diagrams on paper with an orange pen.
**Good for.** Architecture, hardware, engineering firms, product explainers, reports.
**Type.** A clean grotesk (Inter Tight, Hanken Grotesk), mono for dimension labels (Geist Mono), a serif for the one human line (Fraunces).
**Colour.** Paper `#f2f0ea` with 4 % grain, ink `#282828`, pen orange `#fa3600`, hairlines `#b3b3af`.
**Layout.** Drawing on the left two thirds, labelled spec table right; dotted grid; sections numbered `001`; a progress line sweeps the page as the loader.
**Motion.** Stroke-dashoffset drawing (1.2 s per element, staggered), labels fade after their line finishes, a rendered image crossfades over the line drawing when the chapter completes.
**Hero.** The main elevation drawing itself, then its rendered version; headline in condensed caps below.
**Mobile.** Drawings scale to width, spec table becomes two columns, drawing time halves.
**Cost.** Low (SVG), as long as SVGs are optimised under 150 KB each.
**Avoid.** Over-detailed SVGs (thousands of nodes), animating `filter`, drawing every icon.

## 15. Horizon
**Feel.** Chapters side by side: a pinned stage that scrolls horizontally with a progress rail; the vertical scroll still drives everything.
**Good for.** Timelines, product tours, portfolios with 4 to 8 highlights, stories with a chronology.
**Type.** A grotesk with a wide cut for chapter titles (Archivo Expanded, Syne), text sans, mono chapter numbers.
**Colour.** Chapter-shifting backgrounds (each chapter owns a colour), ink constant.
**Layout.** The horizontal track is exactly one viewport tall; chapters are 100 vw panels with a 12-column inner grid; a bottom rail shows `03 / 07`.
**Motion.** Vertical scroll scrubs the track's `translateX`; chapter titles pin for 20 % of their panel; images parallax inside panels at 10 %.
**Hero.** Panel 00 is a vertical statement; the track starts after it.
**Mobile.** The track unrolls into vertical panels (same content, same order); the rail becomes a side dot column. Never horizontal on touch.
**Cost.** Mid.
**Avoid.** Using Horizon for everything: it is the most copied pattern of the decade. Use it when the content is a sequence.

## 16. Quiet
**Feel.** Almost nothing: two colours, one type size for body, whitespace as the design, one move.
**Good for.** Individuals, small studios, architects, writers, anything that sells taste.
**Type.** One sans (Inter Tight, Helvetica-like) at two sizes, or one serif; no display size above 4 vw.
**Colour.** Off-white `#f8f6f2` and `#111`, nothing else; or two colours in CSS and that is all.
**Layout.** 4-column header (name / logo / menu / local time), floating pair of images centred, a single row of project tiles, a sitemap footer.
**Motion.** One: the images drift apart on scroll, or the time ticks, or a palette shifts with the time of day. Everything else is instant.
**Hero.** Two overlapping photographs floating in the centre, a 2-line intro, nothing else.
**Mobile.** Header stacks to two rows, images stack, the one move stays.
**Cost.** Lowest.
**Avoid.** Adding a second move. If it needs more, it is not Quiet.

---

## Remix axes

When none fits, or when asked for "more variations", pick one value per axis. Each new combination
gets its own name (two words, e.g. "Paper Cinema", "Glass Archive") and a one-paragraph recipe in the
same format as above before any code is written.

| Axis | Values |
|---|---|
| Surface | paper, ink, screen (true black), glass (one blurred layer), film grain, canvas (3D) |
| Type voice | grotesk, serif, mono-led, condensed caps, variable kinetic, modular wordmark |
| Motion temperament | cut (instant), glide (0.5 s expo), scrub (scroll-bound), spring (overshoot), drift (slow sine) |
| Colour stance | mono + one accent, duotone, chapter-shift, full colour, time-of-day |
| Hero object | type, photograph, 3D object, drawing, product UI, video still |
| Navigation | pill row, 6-column rules, hamburger pill, index list, vertical tabs |
| Chapter rhythm | statement / proof / contact; chaptered story; index + detail; single scene |

Rules for remixing: at most one "expensive" value (canvas surface, scrub temperament with media, 3D
object) per site unless Q3 is Cinematic; never two type voices that both want to be loud (condensed
caps + variable kinetic); chapter-shift colour needs at least 3 chapters.

## Variations protocol ("show me three")

1. Pick three directions (or remixes) that differ on at least three axes each.
2. For each, write a hero sketch in six lines: surface and colour, the type and the exact headline
   as it would read, where the hero object sits, the one signature moment, what the phone version
   shows, and the cost tier.
3. Present the three as a short table, recommend one, and ask which to build. If the person asked
   for "variations" of an existing site, keep its content and brand assets fixed and vary only the
   axes.
4. After the pick, record it in `.stagecraft/log.json` and build. Keep the other two sketches in
   `docs/design-directions.md` in the project so they are not lost.
