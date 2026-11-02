# Craft: how directed sites move, in numbers

The mechanics below were measured frame by frame (10 fps captures at a steady 500 px/s scroll) and read
back from the shipped code of sites at the top of the field. They are specs, not moods: use the
numbers as the starting point and change them only for a reason. Three of the rules are enforced by
the suite (`reading.spec.ts`) and by `scripts/frames.mjs`: copy holds before it leaves, the screen is
never empty, and copy never stacks on copy.

Read this before `choreography.md` (which moves to pick) and `motion.md` (the code). When a section
here and a recipe elsewhere disagree, this file wins.

## Contents
1. Continuity: one carrier
2. Chapter changes: a moving edge, never a fade to nothing
3. Text: reveal, hold, leave
4. Pins, stages, camera moves and horizontal sections
5. The loader and the first three seconds
6. Easing, durations and smoothing
7. 2D and 3D that look made
8. The pointer layer
9. Page transitions
10. Pace and length
11. Showing the work: indexes, previews and reels

## 1. Continuity: one carrier

The strongest sites never cut between chapters. One thing stays on screen and every chapter changes
it: its position, scale, rotation, light, backdrop or content. The visitor reads twenty screens as one
shot. Pick the carrier before the chapter list.

| Carrier | Fits | How chapters change it |
|---|---|---|
| The product (model, scan, baked image sequence) | product, launch | rotation, scale, key-light angle, background gradient per chapter |
| A card or tile cut in a brand shape | collections, portfolios, worlds | full bleed shrinks to card, tilts, stacks, flips edge-on and becomes the next card |
| A frame or window | anything with screens, skills, tools | grows to the viewport with the next scene already inside it, docks beside the next section |
| A portrait or hero photograph | people, studios | scales into a frame, desaturates as the page darkens, a drawn signature lands on it |
| A drawn line or ribbon | services, processes | draws with scroll behind the cards it connects |
| A wordmark | studios, brands | fixed with blend mode while content wipes under it; scales into the header |
| A readout panel | specs, stats | pinned while numbers roll and the image behind keeps moving |

Rules:
- The carrier is mounted once, outside the sections. A chapter change never unmounts the scene.
- Swap what the carrier shows at the moment it is most distorted or most covered (mid-flip, edge-on,
  mid-zoom), never while it is still.
- **Frame zoom hand-off.** A framed element grows until it fills the viewport (0.8 to 1 vp of scroll,
  `power2.inOut`); the next chapter shows through a window that follows the frame's edges
  (`clip-path: inset()` read from the frame's rect each frame), so the frame's screen *is* the next
  scene by the time it fills. Page colour changes in the last 15 % of the zoom. Optional: rotate
  about 5 degrees during the zoom.
- **Card choreography.** Full-bleed image to card: scale to 0.6 to 0.75, corner radius 0 to 12 to
  24 px, rotateX or rotateY 8 to 15 degrees with perspective 1200 to 1600 px, then slide into a stack
  behind the next card (each covered card scale 0.95, darken 20 %). Carousel of cards (cylinder,
  rotateY per card) collapses to one card, which turns edge-on to a sliver, and the next world's
  cards fly in from depth (z -800 to 0, stagger 0.08).
- **Hero to card.** The hero image scales to 0.8 (a card that still dominates) or to 0.3 (one card among
  several), radius growing as it shrinks; the next chapter's colour rises behind it with a notch or a
  rounded edge.
- **Bridge object.** When two scenes must differ, put one object in both (a sheet that folds into a
  building, a card that becomes a screen) and make the swap during its move (0.5 to 1 vp).
- **Match cut through an object.** In a single scene, cut by going through something that exists in
  both shots (a lake to a crystal ball, a cloud to terrain, a fingertip flare to a ring, a box that
  rolls 90 degrees so the next face is already showing); the two scenes overlap for 0.3 to 0.7 vp and
  the copy keeps the same screen slot across the cut.
- The same carrier often ends the page: the opening object returns in the footer.

## 2. Chapter changes: a moving edge, never a fade to nothing

Every chapter change has a visible edge that travels: the next chapter arrives *over* the current one.
Two full backgrounds never crossfade, and the screen never shows an empty colour in between.

| Edge | Numbers | No JS? |
|---|---|---|
| Rising slab | next section `border-radius: 40px 40px 0 0`, `margin-top: -40px`, own colour, plain scroll | yes |
| Curtain | current section fixed, `clip-path: inset(0 0 X% 0)` X 0 to 100 over 0.6 vp while the next scrolls up at 1x | CSS scroll timeline or GSAP |
| Growing shape | `clip-path: circle(r)` r 60 px to 150 % over 2 to 3 vp, 60 to 80 px feather; colour inside is the next theme | GSAP or scroll timeline |
| Window | the frame zoom above | GSAP |
| Brand-shape wipe | a field of tiles cut from the brand's own glyph or logo shapes covers the screen in 0.3 to 0.5 vp, the scene swaps under it, the tiles leave | GSAP + SVG or canvas |
| Flood or blob | soft-edged shape rises from the bottom over 0.8 to 1.2 s (page transitions) or 0.8 vp (scroll) | GSAP |
| Torn or drawn edge | an illustrated edge (paper tear, drip, ink) sweeps 0.3 to 0.5 vp | SVG mask |

Rules:
- **Overlap.** The incoming chapter is on screen before the outgoing one leaves: 0.3 to 0.5 vp of
  overlap. Scrubbed chapters overlap their neighbours by about half a viewport.
- **Contrast flips through grey** over about 0.8 s (or 0.4 vp) when text has to change from dark to
  light, so no frame has text at failing contrast.
- **The incoming copy arrives late, not early**: it reveals once the edge has passed its line
  (0.1 to 0.3 vp after), never while the edge still cuts through it.
- The empty-screen rule is enforced: `reading.spec.ts` fails any stretch over 400 ms with no visible
  copy and under 5 % media.

## 3. Text: reveal, hold, leave

### Reveal (pick one family per site, at most two)
| Reveal | Numbers |
|---|---|
| Masked lines | split lines, each in an `overflow: hidden` mask, `yPercent 100 to 0`, 1.2 s `expo.out`, stagger 0.05 to 0.08, trigger at 80 to 90 % of the viewport, once; revert the split afterwards |
| Rising chars | `yPercent 115 to 0`, 1.2 s `power3.out`, stagger 0.02 (display words only, under 25 characters) |
| Blur-in words | `autoAlpha 0, y 30, blur(10px)` to clear, 1.0 s `power3.out`, stagger 0.05; `from: 'random'` for numerals |
| Highlight bar | a bar in the accent colour sweeps across each line (scaleX 0 to 1 from left, then 1 to 0 from right), the line appears under it; 0.8 s `power2.out`, 0.1 s between lines |
| Block wipe | a solid block the size of the word slides off it, 0.6 to 0.8 s `power3.inOut` |
| Scrubbed ink | statement lines go from 25 % to 100 % opacity as they pass 70 % to 40 % of the viewport (scrub); readable from the first frame, gains weight as you read |
| Sequenced block | label first, body +0.3 s, link +0.5 s, media +0.7 s, each 0.6 to 1.0 s |
| Sentence relay | over a fixed scene, sentences take turns in one screen position: words arrive (0.9 vp), the sentence holds (0.5 vp), then dissolves word by word in the order it arrived (0.5 vp) while the next one starts |

Never split long paragraphs into characters, never reveal body copy by scrubbing it in from zero
opacity, never blur more than a headline.

### Hold
At 500 px/s a visitor reads about 4 words per second. Copy has to stay readable long enough:

| Copy | Minimum hold (viewports of scroll while readable) |
|---|---|
| Display headline, 1 to 3 words | 0.75 vp |
| Statement, 4 to 17 words | 1 to 1.4 vp; pin it if the layout would move it faster |
| Paragraph up to 60 words | 1.5 vp, or a normal flow section that scrolls at 1x |
| Primary claim of the page | readable at load or held 1.5 vp; never scrubbed out |
| Captions and labels on a moving stage | the stage's state length, at least 0.75 vp |

`reading.spec.ts` fails any large block that stops being readable within `minHoldVp` (default 0.6)
of becoming readable. Ordinary scrolling holds a block for about one viewport, so a fail means
something removed it early: an opacity tween, a mask, a scrubbed exit, a track moving faster than the
scroll, or a state swap.

### Beats
One idea per beat. A beat of a scene-driven page is about 2 vp: the copy readable for about 1.35 vp,
then about 0.65 vp of transition, with the copy swapped in the same screen slot. Statements of 10 to 40
words need 0.9 to 1.5 vp with nothing else competing; holds of 2 to 3 s only work on an empty field.

### Leave
Copy leaves in one of three ways: it scrolls off, an edge covers it, or it exits after its hold
(chars `yPercent -110`, 0.6 s `power3.out`, stagger 0.03, or the blur-erase: chars blur 0 to 8 px and
fade from the last character back). It never fades in place while the visitor is mid-sentence.

### Scale and density
- Display 118 to 190 px against 14 to 20 px support copy; the contrast between the two sizes is the
  style. Body never under 14 px; labels never under 11 px and never under 60 % opacity.
- One idea per screen: a headline of 2 to 8 words, at most one statement or one short paragraph, a
  label. Two type families plus a mono for labels. A headline speaks in one voice: one family, one
  colour, emphasis by size, weight or a line break.

## 4. Pins, stages, camera moves and horizontal sections

### Pinned stage
- 1 to 1.6 vp per state; a pin that holds one line for 8 vp is too long.
- With Lenis, use `scrub: true` (Lenis already smooths; `scrub: 0.8` on top makes media trail).
  Without Lenis, `scrub` 0.4 to 0.8 for weight, 0.15 for media attached to the pointer of scroll.
- Snap only to states that each hold a full idea: Lenis `scrollTo(nearest, { lerp: 0.14 })` after
  scroll stops, never mid-gesture.
- Prefer a sticky element in a tall spacer (`position: sticky; top: 0` in a section of `n * 100svh`)
  over a GSAP pin when the content allows: no spacer insertion, no layout shift.

### Long pins
A pin of 2 to 7 vp only survives a fast scroll when each of its items plays a time-based animation when
its range is entered (1.2 to 4.7 s minimum per item) instead of being scrubbed: a visitor who flicks
through still sees each item land. Scrubbed long pins collapse to a blur at speed.

### Product as a continuous actor
A fixed canvas plays the product for the whole page, so headlines never need pinning: a baked image
sequence (120 to 410 frames, about 7 px of scroll per frame, webp, drawn to a canvas, `snap: 'frame'`),
a video decoded to the canvas by scroll, a glTF with a baked animation clip scrubbed by ranges, or a
scene whose camera moves between waypoints. Text sits in screen space over it.

### A camera move into the object

The 3D entry: the frame that holds the hero grows flat into the screen (no card tilt: the depth is
inside the frame) while the camera inside it moves, and the next chapter comes up out of what it ends
on.
- Pick the feature a person would look through or into: the eyepiece of a camera (turn the object
  round on its stand to show it), the screen of a device, the window of a building. Entering through a
  lens that faces you reads as going backwards through the optics.
- Two moves over 1.5 to 2 vp: swing round to face the feature and settle the aim on it, then push
  straight in along its axis. Ease both in and out; a back-loaded push cuts to the next chapter before
  the feature has arrived.
- Stop the push while the feature is about a third of the frame: closer, the model's textures go soft
  and the shot reads as a render. Hand over through the feature instead: the world darkens around it
  (an eyecup), then the next chapter opens out of its glass as a growing circle (slowly, then fast, past
  the farthest corner) under the marks of what you look through (a viewfinder's frame lines and centre
  cross), which fade once it fills the screen. Project the feature's centre and rims every frame and
  drive the mask from them.
- Recentre the picture during the swing (an off-centre hero composition moves to centre).
- The move starts while the frame is still growing and runs on after it fills the screen.
- One caption holds through the move (in once the frame fills the screen) and leaves as the world
  darkens, before the next heading rises.
- The renderer adopts a state object the timeline animates from the start, so the build and the
  scroll never wait for the model to load; whatever state they reached is what appears.
- A hero that plays on a loop (a build, a demo) hands over to the scroll without a cut: the scroll
  winds it on from wherever it is to its end by the time the move starts, scrolling back unwinds it,
  and back at the top it plays on from there. Keep its state that is not a tween (a step list, page
  classes) derived from the playhead (labels, read in `onUpdate`), so it scrubs both ways; one-way
  callbacks leave it wrong after a scrub back.

### Horizontal sections (desktop and fine pointers only)
Two forms work; the third (a 1:1 rail of cards with no lead-in and no exit) is the generic one.
1. **Stepped track.** Panels exactly 100vw. Per panel: hold 0.55 vp, glide 0.65 vp `power2.inOut`.
   The panel number drifts against its panel (outgoing `xPercent -35`, incoming `45 to 0`) for depth.
   Every question or claim gets a full screen and a full hold.
2. **Continuous rail with depth.** One tween, `x: -(trackWidth - innerWidth)`, `ease: 'none'`,
   `end: '+=' + distance`, scrub with Lenis; inside it, per-item drift through `containerAnimation`
   (items move 4rem against the track), images pan inside their frames (`object-position` 0 to 100 %
   or an inner `xPercent`), one counter-pinned element that stays while the rest passes.
Both need a **lead-in** (the section's intro holds 0.5 vp before the track moves, ideally arriving
through a frame zoom or a moving edge) and a **designed exit** (the last panel becomes the next
chapter's edge, or a card docks). On touch and on the low tier the track becomes a vertical stack.
Alternative to horizontal: **trade sides**: a fixed media box tweens between full, left and right
(power-out, 1 s), and each text panel enters `x ±100 %` with `rotation ±45 to 0` (1 s `sine.out`,
scrubbed from `top bottom` to `bottom 76%`) on the opposite side.

## 5. The loader and the first three seconds

- The loader is the first scene, not a spinner: the logo drawing itself (stroke draw 1.0 s
  `power1.inOut`), a mark assembling from brand tiles, a counter with plateaus (17, 99) on the hero's
  own colour, a dot that grows into the hero's shape.
- A counter loader holds at 100 for no more than about 1.5 s, then the veil leaves in 0.3 s; a hard
  failsafe (4 s) removes the loader whatever the assets do.
- Total 2 to 4 s on a cold load, minimum 1.5 s if shown at all, skipped on repeat visits and on
  touch when the assets are already there. Hard cap 2.5 s in the budgets unless a reason is written.
- The last beat of the loader is the hero's first state: curtain `scaleY 1 to 0` 0.9 s
  `power3.inOut`; a full-screen colour splits into two strips that leave top and bottom; the page
  zooms from scale 0.14 to 1; the logo moves into the header (`y -15 %`, scale to header size).
- Hero letters rise as the loader leaves (0.95 s `power3.out`, stagger 0.085).
- Nothing blocks the hook: no cookie bar over the hero, no audio gate, no age gate before the first
  frame of the subject. Sound is a toggle in the corner, off by default.
- By 3 s the visitor has seen the subject move. The hero's first motion is about the subject (the
  product turns, the helmet's livery sweeps across the face, the brief becomes a page), not an
  abstract shape.

## 6. Easing, durations and smoothing

One signature curve per site, used for every travelling move; a second, sharper curve for wipes.

| Role | Curves seen at the top of the field |
|---|---|
| Travelling moves (signature) | `cubic-bezier(.35,0,0,1)`, `cubic-bezier(.4,0,.1,1)`, `cubic-bezier(.2,0,.1,1)`, `cubic-bezier(.165,.84,.44,1)`, `expo.out`, `power3.out` |
| In-out moves (frames, cards) | `cubic-bezier(.333,0,0,1)`, `power2.inOut`, `expo.inOut` |
| Wipes and curtains | `cubic-bezier(.65,.05,0,1)`, `cubic-bezier(1,0,0,1)`, `power3.inOut` |
| Exits | `cubic-bezier(.8,0,.8,.5)`, `power2.in` |

| Kind | Duration | Stagger |
|---|---|---|
| UI (hover, toggles, menus) | 0.2 to 0.6 s | 0.05 items |
| Text reveals | 0.6 to 1.4 s | chars 0.014 to 0.03, words and lines 0.05 to 0.12 |
| Scene moves (time-based) | 1 to 3.5 s | 0.08 cards |
| Wipes | 0.6 to 1.2 s | |

Smooth scroll: Lenis `lerp` 0.05 to 0.1 (0.05 feels heavy; below that every correction becomes a
visible slide) or `duration` 0.8 to 1.2 with an expo-out curve; `wheelMultiplier` 0.7 to 1; driven by
`gsap.ticker` with `lagSmoothing(0)`; stopped during the loader; native on touch. Custom virtual
scroll, when the whole page is a canvas: `current += (target - current) * (1 - exp(-12 * dt))`.

## 7. 2D and 3D that look made

What separates a made scene from a demo is material, light and restraint, not polygon count.
- **Real material first.** Photography, illustration, a scan or model of the subject, renders,
  footage of the work. Shapes built from primitives (boxes with screenshots, extruded letters, torus
  knots) read as a tutorial however they are lit, and an abstract ornament says nothing about the
  subject.
- **One object, chapters change its light.** Rotate the key light 30 to 60 degrees per chapter and
  crossfade the background gradient over 0.5 vp while the object turns (360 degrees over 1.4 vp).
- **Post on the high tier only**: bloom at low strength (about 0.2, threshold 0.1), vignette 0.6 to
  1.6, grain as blue-noise dither (static, never animated), depth of field for one focal plane, an
  edge glow for one climax. Mid tier gets the scene without post; low tier gets a still.
- **Cheap looks that hold up on phones**: flat three-colour shading with hard shadow polygons; a
  pre-rendered loop or camera move (6 to 10 s per chapter) as video; a baked image sequence (webp
  frames drawn to a canvas, `snap: 'frame'`) for a product turn; a layered collage (3 depths, speeds
  0.6 to 1.6x, rotations -12 to +20 degrees, items leaving faster than the copy so the copy is alone
  for its last 0.3 vp); cutouts that enter from the frame edges.
- **Choose a subject that renders.** Hard-surface objects (a product, a tool, an instrument, a vehicle)
  under a captured studio light look photographic in a browser. Natural phenomena (an aurora, water,
  fire, clouds, a sky) do not, at any cost a page can pay: rendered live they read as cartoons, and
  no glow fixes it. When the subject is a phenomenon, show it as photography or footage, or tell the
  story through an object that belongs to it.
- **A real model under real light.** A glTF model (CC0 from Poly Haven, or a Khronos sample where the
  licence allows) and an HDRI (Poly Haven), physically based materials, ACES tone mapping, a warm key
  from above, a cool rim from behind, a shadow-only floor. Textures as WebP, 2k on the high tier and 1k
  on mid; the renderer in a lazy chunk loaded after the tier check (`stack.md`, "A product on a studio
  set").
- **The same object as the drawing.** The static frame of the object is the object drawn: its creases
  (`EdgesGeometry`, 28 degrees) and its outline (back faces pushed out along the normals) in ink over
  paper-coloured faces, drawing itself from the base up with a clipping plane. The lit render then
  crosses it with a vertical edge in screen space, and the page background and the copy share that edge
  (text the edge crosses is painted in two colours split at it, light over the studio, ink over paper).
- **Labels in the scene**: mono callouts on leader lines (name, number, date, "explore") pinned to
  objects make a 3D scene read as an interface you can use. Project points on the model to the screen
  every frame and move the DOM labels there; show them while their chapter holds, after the shot has
  arrived, and draw the leader out from the part.
- **An exploded view** shows how the object is made: the lit model comes apart along its own axes, a
  drawing of the parts wipes in, and it goes back together before the camera closes in again. Split the
  model into its connected parts with `scripts/explode-gltf.mjs` (each part's axis, distance and order
  in its node extras; `stack.md`), then:
  - each part leaves along one axis of the body; a part that covers another travels a layer further
    (about a sixth of the object's height per layer); glass and small bits ride with what holds them;
    the body stays;
  - the outermost layer leaves first: stagger the parts over about 0.4 of the move, each on a cubic
    in-out, so going back together the inner parts return first;
  - pull the shot back to frame the whole spread before the parts move (about 1.5 times a chapter
    shot's distance) and close in again only once they are home, or pieces fly out of the frame;
  - an open shell shows its inside: shade back faces dark on the lit model and pale on the drawing,
    only while it is open, so the whole object renders exactly as before;
  - the drawing and the labels travel with the parts: a label's point follows the part it sits on, and
    numbered labels ("01 · Turret") read as an engineering drawing; route the leaders into open space,
    clear of the copy and the HUD, and give them ink over paper;
  - one exploded view per page, in the chapter about how the thing is made.
- **Drawn motion**: line art that draws itself (stroke dash), a signature, a ribbon behind the cards;
  wireframe that becomes the finished object (lattice to solid, sketch to render).
- **Mirror the DOM** when there is WebGL: meshes copy the rect of a DOM element each frame, so layout
  stays in CSS and the effect is a uniform (`u_progress` 0 to 1 per chapter, windowed with
  `fit(ratio, a, b, 0, 1, easeInOut)`).

## 8. The pointer layer

- The custom cursor replaces the native one and tracks it 1:1 (transform set on `pointermove`, no
  lerp loop, no trailing). Fine pointers only.
- A lens: a circle clip (`clip-path: circle(var(--r) at var(--x) var(--y))`) over a second layer of
  copy reveals an alternate line; r 12 px to 125 px over text, 0.4 s `power3.out`.
- Hover previews follow the pointer with a lerp of 0.15 to 0.2 (the preview may trail; the cursor may
  not).
- Pointer magic is extra, never the only way to get information: every lens, preview and drag has a
  tap or a visible fallback on touch.

## 9. Page transitions

- Carry one element across: the door title becomes the page heading (`view-transition-name`), the
  tile becomes the hero, the wordmark stays fixed while content wipes under it.
- Wipe only the content: 0.2 to 0.5 s; the whole transition 0.8 to 1.2 s; the new page's copy uses the
  site's reveal.
- Never replay the loader on an internal link, never hold the old page more than 0.3 s before it moves,
  never reload the document when a client router is available.

## 10. Pace and length

- A page longer than about 8 vp keeps a persistent index on screen: a chapter rail with the current
  name solid and the rest in outline, a section bar, a timeline axis that draws itself. Never 8 to
  11 px mono labels as the only navigation; 12 px at full contrast is the floor.

- A landing with stages runs 10 to 18 viewports at 1440 x 900; a single-scene experience can run
  longer because the scene changes all the way. A page of sections that each hold one idea for under
  a viewport needs fewer sections, not more motion.
- 1 to 1.6 vp per idea on a stage; a chapter that holds one line for more than 3 vp is padding.
- The suite prints `scroll length (screens)` per route; over 12 on a landing, check the page map
  (`ux.md`): route the extra topics to pages and keep the landing to the story.

## 11. Showing the work: indexes, previews and reels

- The work is the material. A preview is the real thing at a glance: a film of the site, the
  specimen itself, the numbers over the page they measured. Grey bars, empty tiles and boxes labelled
  "with" and "without" read as a wireframe left in.
- Many items at scale beat one small box: a staggered grid of the real objects; a ring of cards (16
  cards at 22.5 degrees, radius about 2.6 card widths, pushed back by the radius so the front card is
  full size, `backface-visibility: hidden`, one turn in 40 to 50 s); a reel card leaning into the page
  (`rotateY` -8 to -10 degrees, `rotateX` 3 to 4) with one film playing and a list beside it that shows
  every item with a thumbnail and a progress bar.
- One film at a time. Nothing loads in the first view: the films and thumbnails arm when the panel
  first shows, the next film preloads, everything pauses off screen and in background tabs. Each item
  holds for its own film's length (6 to 11 s).
- Swaps are wipes: an edge crosses the panel in 0.8 to 1.1 s `expo.inOut`. When the panel goes back to
  the page underneath, the outgoing pane leaves with the same edge instead of cutting.
- Each preview proves the claim beside it: the build replayed step by step, the measurements drawn
  over the page (a box on each block, the number on a tag), both builds of one brief side by side with
  their numbers under them, including the ones that do not flatter.
- Film the signature interaction, not only the scroll (`film.mjs --drive`), at the frame's ratio,
  starting where the page is strongest. Watch the film frame by frame before using it: a layout jump
  that lasts 0.2 s in the browser is plain in a loop.
- On a phone the list becomes a three-way switch under the frame. Hover previews are extra: every door
  still opens on a tap.
