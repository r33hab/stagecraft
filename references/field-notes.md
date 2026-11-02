# Field notes: what the winners do and how they build it

Observed in November 2026 on public sites that won daily, monthly or yearly awards, or honourable
mentions, by opening them in a browser (desktop 1440 x 900 and a 390 px phone), screenshotting the
scroll at seven positions, and reading the runtime: globals, fonts, bundles, bytes. Each note pairs
*what you see* with *how it is made*, so a direction can be reproduced rather than imitated. URLs are
public sites, listed so they can be studied again; they are references for technique, never for
copying.

Read the ones that match the chosen direction; skim the rest once.

## Studio with a framed 3D hero (Volume)
`lusion.co`. Pale lavender page (`#f0f1fa`), a rounded dark "card" in which glossy blue, black and
white pipe-cross objects tumble in WebGL; `+` marks at the corners; "SCROLL TO EXPLORE" under it;
then a giant grotesk headline ("Bold Ideas, Brought to Life") and a right-aligned paragraph. Pill
buttons for "Let's talk" and "Menu". **Built**: Astro shell, 2 scripts (298 KB), custom WebGL engine
(OGL-sized, shader-heavy), virtual scroll (the document is one viewport tall; wheel drives the
scene), `hardwareConcurrency` check, `requestVideoFrameCallback` for video textures, 39 `will-change`
uses. Fonts: Aeonik (3 cuts) + IBM Plex Mono + a custom mono. Tokens: 12-column grid with a 2 vw gap,
radius 20 px, padding `max(5vw, 40px)`. Lesson: the 3D lives in a frame with margins, so the page
still has typography and air around it; on the phone the same frame holds the same scene.

## Driver platform, yearly award winner (Poster meets Playground)
`landonorris.com`. Cream page, portrait of the driver with a wireframe helmet rendered over the
face and topographic contour lines (WebGL on fine pointers); a lime "Store" pill; a "Next race" card
bottom-left. Chapter "helmets": a dark grid of helmet photos with name and year labels in lime.
Footer: a dark rounded panel with a tab notch, a signature SVG, a condensed caps line "ALWAYS
BRINGING THE FIGHT" with two words in a lime serif italic, sponsor logo marquee, "Business
enquiries" pill. **Built**: Webflow with embedded GSAP (ScrollTrigger, SplitText, Flip), Lenis, a
Three/OGL layer, Rive badges; 133 images, 131 lazy, 69 AVIF/WebP; 108 marquee elements; 15 viewports
tall; 171 KB scripts. Tokens: dark green `#282c20`, cream `#f4f4ed`, lime `#d2ff00`, orange
`#ff6b00`; `--cubic-default: cubic-bezier(.65,.05,0,1)`, `--duration-default: .75s`; type scale
from 4 rem to a 7.9 rem "impact" size; radii 1 / 3 / 6.25 rem; a fluid container
`clamp(992px, 100vw, 1920px)` with a design width of 1728. Fonts: Brier (serif display) + Mona
Sans Variable. Lesson: a no-code builder can win when GSAP, Lenis and lazy images are wired in by
hand; the design-width scaling token keeps the poster composition intact at any size.

## Luxury car, one-day story (Cinema)
`spykercars.com/c8-preliator`. Black preloader: the script logo, a ring of speedometer ticks and a
counter. Then full-bleed CG stills of a teal car at a villa, later a mountain road, scrubbed by
scroll with a small dial and a timecode readout at the bottom: the scroll is a day of ownership.
**Built**: Next.js (shadcn-style OKLCH tokens), Lenis, an OGL WebGL layer with four stacked
full-viewport canvases, Rive; 47 viewports tall; `fetchpriority` on 6 elements; preloads for images,
fonts and scripts; container queries; `prefers-reduced-motion` in CSS. Fonts: Swiss 721 (four
weights) + PT Serif + Futura PT Condensed. Weight: 2 MB first view, 973 KB of scripts. Flaws: custom
cursor visible on the phone; a white cookie modal over the hero. Lesson: the timecode and dial turn
scroll into a timeline; the budget shows the cost of stacking canvases.

## Agency with a sound gate (Afterglow)
`emotion-agency.com`. Lavender gate (`#f5efff`): serif wordmark with a violet "o", a mono caps
tagline, two pills "Enter with audio" / "Enter without audio". Inside: deep purple ink `#2a1647`,
violet `#9047ff` accent. **Built**: Nuxt, Lenis, GSAP (ScrollTrigger, SplitText, Flip), Three shaders,
Rive, `startViewTransition`; device gating on `hardwareConcurrency`, `deviceMemory`, `pointer:
coarse`; DPR capped (`Math.min(devicePixelRatio, ...)` eleven times); video scrubbing via
`requestVideoFrameCallback`; virtual scroll. Fonts: IBM Plex Mono (body and labels) + PP Neue
Montreal + a custom light serif with italic. Weight: 10 MB first view (3D and video assets). Lesson:
the audio choice is a gate, defaults to silent, and doubles as the brand moment; mono as the body
face is a legitimate voice.

## Creative director portfolio (Quiet)
`brandonyasin.com`. Warm off-white `#f8f6f2`, text `#111`. Four-column header: name, script logo,
MENU / CONTACT, LOCAL TIME with a tiny clock dial. Hero: two overlapping project photos floating in
the centre, nothing else; then one horizontal row of four project tiles with caps labels. The
palette shifts with the time of day. **Built**: Nuxt, Lenis, native CSS `animation-timeline`,
`backdrop-filter`, `dvh`, custom `--lvh`/`--svh` props, `--bg-brightness` for the time-of-day shift;
no GSAP. Fonts: Neue Haas Unica + Helvetica Now Variable. Weight: 26 MB (16 MB of preloaded images),
the heaviest studied. Lesson: whitespace and one move are enough for a daily award; the eager
preloading is the thing to not copy.

## AI product on paper (Blueprint meets Specimen)
`heronaiapp.com`. Warm paper with faint grain. Loader: an architectural elevation drawing that draws
itself (SVG stroke), an orange rule sweeping up with "90 %", a mono spec block (TYPE / FOUNDED /
FOCUS / LOCATION) and a numbered boot log (001 INITIALIZE CORE SYSTEM ... 008). After load the
drawing becomes a stippled render with trees; mono nav with dotted grid and `+` corner marks; orange
"Contact us"; condensed caps headline "AN AI AGENT THAT WORKS INSIDE YOUR DESIGN TOOLS" reveals
under the frame. **Built**: Webflow, GSAP 3.12 with 41 live ScrollTriggers (1 scrubbed), Lenis,
Barba, an OGL shader background, SplitText, Flip; gating on `hardwareConcurrency`, `deviceMemory`,
`pointer: coarse`; `--loading-logo-dasharray` and `--mask-percent` custom properties drive the
loader and reveals; 76 running animations at rest (idle motion). Tokens: `#fa3600` orange, `#282828`
ink, `#b3b3af` lines, `--size--max-screen-height: calc(100dvh - 1.6rem)`. Fonts: BT Grotesk (4
weights) + Geist Mono. 17 scripts incl. three analytics tags. Flaw: cursor visible on touch. Lesson:
the loader is the content (the drawing), so no time feels wasted.

## Physics explainer (Specimen, dark)
`chladni-plate-experiment.vercel.app`. Near-black `#07070a`, cream `#f3eee3`, brass `#d0a955`.
Instrument Serif display ("Sixteen ways a plate can be still"), Geist body, Geist Mono caps labels
(FIGURES, SQUARE · POINT-DRIVEN, 242 HZ ON THE REFERENCE PLATE), pill buttons (EN BG, PAUSE PLATE,
SOUND). A live WebGL sand-plate simulation stays sticky on the right while a two-column grid of
figure cards scrolls on the left; each card: rounded dark surface, blurred nodal-line image, mono
label, serif title, two lines of body, mono footnote. Phone: one column, sticky top nav. **Built**:
Next.js, Lenis, Three shaders, Rive, `startViewTransition`; 250 DOM nodes; 540 KB scripts, 833 KB
total; preloads for 5 fonts and 4 images; `prefers-reduced-motion` in CSS. Token system: `--ink-950
.. --paper-100 .. --brass-400`, semantic `--bg / --fg / --fg-muted / --line / --surface / --ring /
--scrim`, fluid type `clamp(1.1rem, 1rem + .4vw, 1.3rem)` up to `clamp(2.2rem, 1.6rem + 2.4vw,
3.6rem)`. Lesson: a complete token model and a sticky instrument beside scrolling cards is a
reusable chapter type.

## Product story with humour (Afterglow meets Cinema)
`oryzo.ai`. Hero: a photoreal 3D desk from above (green cutting mat with a ruler grid, pencils, a
knife, a paperclip), a cork coaster centred, huge cream condensed "ORYZO" top-left with the eyebrow
"MADE FOR MUGS. BUILT FOR TABLES.", a glass credit card bottom-left, a vertical side tab "ORYZO-1
MODEL", a "SCROLL TO CONTINUE" chevron, a video thumbnail. Chapter two: black-brown vignette, giant
white "it's wearable" with a dashed viewfinder rectangle in which the coaster is sharp while the type
behind blurs (depth of field as a mask). Chapter three: a thermal-camera purple and orange scene, a
vertical temperature scale on the right (CREATIVE T=10 / BALANCED T=1 / DETERMINISTIC T=0.1), a
formula card "Thermal Diffusion Model: a visualization, not a warranty". Every chapter changes the
palette. **Built**: Astro + custom engine: Three shaders, SplitText (151 hits), Flip, Rive,
preloader; gating on `hardwareConcurrency`, `isMobile`, `isTouch`; DPR cap; 63 viewports tall; 6
canvases; 17 `<picture>` elements with AVIF/WebP; 2 muted loop videos; 63 `will-change`. Tokens: a
16-column grid as CSS variables (`--grid-span-1 .. 16`, `--site-padding-x: 3.125vw`), cream
`#ffedd7` on `#100904`. Fonts: Halyard Display and Text (variable) + Literata + DM Mono. Weight: 15
MB (7.5 MB images, 7 MB 3D assets). Lesson: spec-sheet seriousness plus a joke per chapter; the
viewfinder mask is a cheap, memorable signature; the weight is the cost of eager 3D.

## Robotics fund as a journal (Editorial meets Swiss)
`mecha-xyz.webflow.io`. First frame: white page with only the black geometric wordmark. Then a
three-column editorial layout: a sticky left index (INVESTMENTS 01 TOMORROW RECYCLING / 02 AESCAPE /
03 THE NON-FICTION REVOLUTION, active item underlined), photo plus isometric circuit line drawing on
the right, a pill tag, a big serif headline, boxed tab nav top-right, a crimson "Join the revolution"
card fixed bottom-right. **Built**: Webflow with GSAP 3.15 and 108 live ScrollTriggers (8 scrubbed),
Lenis, SplitText, Flip, DrawSVG; 93 images (91 lazy), 11 small muted WebM product loops; 221 KB
scripts; `prefers-reduced-motion` handled. Webflow token system: heading-large 5 rem / 0.92 /
-0.02 em, title-large 2.25 rem / 1.16 / -0.04 em. Fonts: Neue Haas Grotesk + Flecha (serif).
Lesson: a sticky index beside scrolling chapters reads as a journal; line drawings that draw
themselves (DrawSVG) carry the technical tone.

## Education story as a painted world (Volume)
`why.zero.university`. Full-bleed painterly WebGL: a green and blue hand pointing over grey-green
water, a glowing cursor orb, the "zero" wordmark as rough paint. Chapters bring their own fonts
(13 faces declared, 2 loaded at start, the rest lazy per chapter). **Built**: Vite, Three/OGL
shaders (505 uniforms), scrub (46 hits), four pins, Rive, `requestVideoFrameCallback`, DPR cap,
`pointer: coarse`; virtual scroll; 329 KB scripts, 6.3 MB total. Fonts: Supply Sans + PP Supply
Mono first, serif and script faces per chapter. Lesson: per-chapter font loading keeps the first
paint lean on a site that eventually uses many voices.

## Framer studio (Poster, dark)
`madebykota.com`. Hero: a wall of tilted website screenshots receding into black, pill nav (logo
pill, hamburger pill, "Get in touch" pill), a big white headline with inline image chips between the
words, "Official Framer Expert" badge, "Available for new projects", a rotated "Scroll for more".
Chapter two: a laptop mockup with a circular magnifier lens showing a template close-up, numbered
ring ticks 1 to 5 around it as a dial carousel, giant "AUREA", "Agency / $99". **Built**: Framer
runtime, Lenis-style smoothing, 87 running animations at load, native `animation-timeline` and
view transitions from the runtime, 61 `will-change`; 6 MP4 videos; 3 font preloads (TWK Lausanne 300
/ 400 / 500); 1.25 MB. Lesson: inline image chips inside a headline and a dial carousel are two
small signature moves; 87 idle animations is the cost of a builder.

## Minimal studio on a Swiss grid (Swiss)
`signal-a.studio`. All white, hairline rules. Six equal nav columns with underlines (HOME with a
dot, CASE STUDIES, ARCHIVE, ABOUT, CONTACT, FOLLOW) in mono; a time and city block (15:10 CET, WARSAW
BERLIN). A justified statement headline mixing an ultralight serif and a heavy grotesk ("SIGNAL-A
IS AN AWARD-WINNING INTERFACE & EXPERIENCE DESIGN STUDIO ..."), three justified mono columns of
taglines, a black showreel block. Footer: rule-divided columns, a giant marquee of the name in three
cuts (serif italic, bold grotesk, "S—A" separators). **Built**: Webflow, GSAP 3.15 (ScrollTrigger
loaded, used on inner pages), Lenis, Rive strings; only 37 KB of scripts transferred, 903 DOM nodes;
no canvas. Tokens: mono 13 px, body 19 px, site margin 40 px, gap 25 px, stroke 1 px, mono
line-height 130 %. Fonts: GT America Mono 300 as the body face + Neue Haas Grotesk Text/Display +
PP Editorial New 100/200. Flaw: cursor on touch. Lesson: the lightest page in the set won a daily
award on type and grid alone.

## Design-engineer index page (Archive, dark)
`mikewilcockdesign.com/work`. Near-black `#111010`, warm off-white `#edeae4`. Top bar: logo,
"MANCHESTER, UK / 14:10", nav with a blue active dot, blue pill "START A PROJECT". Giant condensed
"WORK" with mono "(05)"; LIST / GRID toggle pill; a table: #, PROJECT in big grotesk, TYPE, ROLE,
YEAR in mono caps, hairline rows. **Built**: Next.js, Lenis, scrub strings, `startViewTransition`,
`prefers-reduced-motion`, Rive; 253 DOM nodes; 598 KB total, 179 KB scripts; preloads 3 fonts, the
entry script and 2 images; `fetchpriority` on 3. Fonts: Archivo (variable, upright and italic) +
Geist Mono. Flaw: cursor on touch. Lesson: the index with a count and a LIST / GRID toggle is the
archive pattern in its purest form.

## Portfolio with a lit world (Volume)
`guillaumecolombel.fr`. A WebGL desert valley with a glowing pink-red monolith, spiky plants, and
big white condensed caps "CLARTÉ WORLD" with outlined neighbouring titles receding left and right: a
3D carousel of projects inside a landscape; a sound toggle bottom-right. **Built**: Nuxt, custom
WebGL, `startViewTransition`, matter.js, `prefers-reduced-motion`, `pointer: coarse`; two colours in
CSS (`--black #050404`, `--ivory #f0ebe2`); 107 KB scripts, 1.8 MB video, 3.3 MB total; 260 DOM nodes.
Fonts: Neue Montreal 400 / 500 only. Lesson: two CSS colours and one font; the scene does the rest.

## Racing driver (Poster)
`nickho-motorsports.nl`. Black and white photo hero (driver in helmet beside the car), a giant
condensed "98" centred, a stat column left (87 car number, podiums, 92 circuits) with digits
scrambling in, a quote top-right, "NICK HO" condensed bottom-left, a yellow square hamburger, "TBA"
next race bottom-right, vertical hairlines across the hero. Later: a light grey sheet with a ghosted
watermark logo, then "GALLERY" in 30 vw condensed grey caps behind tilted scattered photo cards.
**Built**: Webflow, GSAP 3.15 with 97 live ScrollTriggers (46 scrubbed), Lenis, Three r128 (a
scroll-driven 360° helmet viewer), HLS hero video; 67 images (66 lazy, 39 AVIF/WebP); 14 scripts from
8 hosts (326 KB); `prefers-reduced-motion` handled. Tokens: heading xlarge 10 rem / 1, section
padding 5 / 8 / 10.5 / 12 rem. Fonts: Anton + Helvetica. Flaw: cursor on touch; 8 script hosts.
Lesson: the number as the hero, stats that scramble in, and a photo stack over a watermark word.

## Webflow studio in retro print (Playground meets Monolith)
`neutomni.com`. Hero: full-bleed red `#cf1830` with the wordmark cut like a stencil from white
blocks, a white band, five slide dots. Next: sky blue with tilted white ticket cards (Essentials,
Growth) with serif italic headings, red text, a dashed tear line, mono "PRICE STARTS AT: $2,500", a
barcode and a "100 % ORIGINAL AND HUMAN-MADE" stamp; a red ticket rotated in 3D on the right. Body
text is red on white; blue accent `#6db1f0`. **Built**: Webflow, GSAP 3.15 (10 triggers, 1 pin, 1
scrub), Lenis, SplitText, Flip, MorphSVG; 24 viewports; a full-viewport canvas and an autoplay muted
hero video; `prefers-reduced-motion` handled. Fonts: Editorial New (serif) + Vazirmatn (variable
sans) + Fira Code + an italic cut. Tokens: h1 52 px, h2 118 px, jumbo 52 px, text 16 px / 120 %.
Lesson: physical ephemera (tickets, barcodes, stamps) as the component language.

## Typographic experiment (Kinetic meets Swiss)
`format.obys.agency`. Black page, a full-width wordmark built from white blocks with 45° cuts, a
white caption bar, a centred white spec card (1.1 Usage / 1.2 Geometry / 1.3 Perception / 1.4
Balance with three keywords each), a clock dial. Later: huge white caps "THE FORMAT IS PART OF THE
BIGGER IDEA" where words warp along a curve and letters skew as they scroll, a big white disc, a
sticky index on the right, "(Advice)" cards. **Built**: Vite, Lenis, GSAP ScrollTrigger, native
`animation-timeline`, mix-blend, clip-path; `pointer: coarse` and `isTouch` gating; only 85 KB of
scripts but 579 KB of CSS and 1.5 MB of images; 27 AVIF/WebP. Tokens worth copying: `--s:
calc(100vw / 1440)` as the design unit; semantic roles (`--color-plate`, `--color-plate-ink`,
`--color-dial`, `--color-hand`, `--color-note #e0ddbf`); z-index layers (`--layer-header 0`,
`--layer-content 1`, `--layer-burst 10`, `--layer-curtain 50`); `--parallax: 70`, `--drift: .07`; 8
columns, margin 20, gutter 20, content width 1400. Fonts: one custom sans. Lesson: a design-unit
scale and named z-layers make a poster-like site predictable.

## Furniture maker (Atelier)
`floema.com`. Warm off-white `#f2efea`, ink `#241f21`, pill tab nav (PRODUTOS / SOBRE /
SUSTENTABILIDADE / JORNAL / PT). Hero: small product photos scattered around the centre that gather
on scroll; then 3D-rendered products on cream with colour swatches and a heading with an inline
product thumbnail ("Urban (51)"). **Built**: Nuxt + a headless CMS, Lenis, an OGL layer with three
canvases, one GSAP pin, `startViewTransition`, `prefers-reduced-motion`; 65 images (none lazy, no
AVIF), 496 KB scripts, 3.7 MB total; five analytics and consent scripts. Tokens: a 24-column grid
with fluid gap `clamp(14px, 9.71px + 1.1vw, 28px)` and margin `clamp(16px, 10.15px + 1.5vw, 36px)`;
`--computed-100vh`, `--lvh/--dvh/--svh` props; `--native-scrollbar-width`. Font: one custom family.
Flaw: a full consent modal covered the hero on both captures. Lesson: the constellation-to-grid hero
and the inline thumbnail in a heading; the consent modal is the thing to avoid.

## Campaign microsite (Playground, cartoon 3D)
`secure-the-unknown.cyera.com`. Full-bleed flat-shaded purple space scene (a planet with windows,
floating crystals, lime accents), white grotesk headline "Know Your Data. Control Your AI. Secure the
Unknown." with the last word in a lighter weight, a white pill "Request a demo", a black cookie card
bottom-right. **Built**: custom bundle with OGL (558 hits), Theatre.js timelines, SplitText, Rive;
`hardwareConcurrency` gating; canvas at 2160 x 1350 (DPR 1.5 cap); 62 KB scripts at load plus lazy
bundles; 1 MB first view; four ad and analytics tags. Fonts: Haffer + Season (both variable). Flaw:
cursor on touch. Lesson: a one-page campaign can be 1 MB with a 3D hero when the scene is lazy and
the DPR is capped.

## Studio with a photo-led hero (Cinema meets Quiet)
`exoape.com`. Full-bleed photograph (a basilica at blue hour), white giant grotesk "Digital Design
Experience" set at 16 vw crossing the bottom edge of the viewport and travelling up on scroll while
the photo stays; a short paragraph mid-left; "Scroll to explore"; later a second paragraph and a
mini sitemap over the photo. **Built**: Nuxt, bundled GSAP (SplitText, ScrollTrigger), virtual
scroll, 8 muted loop videos; 118 KB scripts, 473 KB first view. Tokens: `--color-off-white #f8f8f8`,
`--color-story #070707`, `--color-sand #e0ccbb`, alpha steps `-02 -04 -06 -08`; display scale in vw
(`--font-s-h0: 25.6vw`, h1 16 vw, letter-spacing -0.4 vw). Font: Lausanne 300 / 400 / 500. Lesson:
type travelling over a fixed photograph is a two-layer effect that costs nothing.

## Gated studios (what not to copy)
`unseen.co` (blush gate with cartoon eyes, "Enter" pill, "Enter without audio") and
`emotion-agency.com` both put a click gate before any content. Juries do pass through, but the LCP
measurement and every social preview show the gate. If a gate is wanted, keep the headline under it
in the DOM and let it lift automatically after the real load.

## Cross-site numbers worth remembering

- Scripts on the lean winners: 85 to 330 KB; on the heavy ones 540 to 970 KB.
- First view: 0.5 to 1.3 MB on the lean half; 2 to 26 MB on the heavy half.
- GSAP in roughly two thirds, Lenis in two thirds, a WebGL layer in half, SplitText in a third,
  Rive strings in a third (mostly badges), view transitions in a quarter, native scroll-driven CSS in
  a fifth.
- Fonts: two families is the mode; a mono face for metadata on more than half; variable fonts common.
- Six of twenty-three left the custom cursor visible on the phone; four shipped debug panels.
- Every lean winner rendered its headline in HTML; every heavy one made the visitor wait for assets.
