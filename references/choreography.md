# Choreography: the moves

The moves that make a scroll feel directed, each with the exact mechanics. A site uses three to
five of them, one as the signature. Every move has a low-tier and reduced-motion form that is
still designed. Read `motion.md` for tokens and the never-stuck rule; this file is the vocabulary.

Notation: "progress" is the pinned ScrollTrigger's 0 to 1. "vh of scroll" is how much the visitor
scrolls while the stage is pinned (`end: '+=300%'` is three viewports).

## 1. Vertical to horizontal handoff

The one people call "sick" when it is right: the page scrolls down, then without a jolt the next
chapter travels sideways, then the page scrolls down again. Numbers in `craft.md`, section 4.

1. **The lead-in.** The horizontal chapter arrives through an edge, not a cut: the hero frame grows
   into a window that already shows the chapter (move 2), or a slab rises over the previous section.
   The chapter's intro holds 0.5 vp before the track moves.
2. **The track.** Either a stepped track (panels exactly 100vw; per panel hold 0.55 vp, glide 0.65 vp
   `power2.inOut`; the panel number drifts against its panel) or a continuous rail (`x: -(trackWidth
   - innerWidth)`, `ease: 'none'`, `end: '+=' + distance`, `scrub: true` with Lenis) with depth inside
   it: items drift 4rem against the track through `containerAnimation`, images pan in their frames,
   one element counter-pins. Never a panel that shows half of the next panel's headline.
3. **The exit.** The last panel is the next chapter's edge (a panel in the next chapter's colour that
   wipes in as the final step) or the frame docks beside the next section; the vertical scroll
   resumes with no gap and no overlap.

Extras: a progress rail (`03 / 07`) that counts whole steps, the header switching theme per panel.
Touch and low tier: the track unrolls vertically with the same order; never horizontal on touch.
Keyboard: every panel's links remain in DOM order; Tab still works because the document scrolls.

## 2. Frame to full bleed (the window)

A framed element (a card with margins, a device screen, the hero's preview) grows to fill the
viewport, and the next chapter shows through a window that follows the frame's edges, so by the time
the frame fills the screen the visitor is already inside the next chapter. Scrub the frame's
transform (`x`, `y`, `scale` to cover) over 0.8 to 1 vp `power2.inOut`; each frame read the frame's
rect and set the next chapter's `clip-path: inset(top right bottom left round 6px)` to match; open
the window 30 % into the zoom, drop it at the end. The page copy beside the frame is covered by the
growing window rather than faded. Reverse it to leave a scene, or dock the frame beside the next
section as a live preview. Content inside a plain frame (no window) counter-scales so the subject
stays the same size.

## 3. Pinned stage with state swaps

The stage stays, the object changes state, the copy swaps (product stories, specs, the lap). The
object changes *continuously* across progress; only copy is discrete. Reading time rule: each state
is at least 1.2 vp of scroll and its copy is readable for at least 0.75 vp of it. Copy never
overlaps copy: the outgoing line exits (0.1 vp) before the incoming one rises (the imagery may
overlap, the copy may not). The copy sits in a fixed lower third or side column so it never jumps.
For a pin of more than four states, play each state's copy as a time-based reveal when its range is
entered, so a fast flick still lands every state (`craft.md`, "Long pins").

## 4. Camera dolly through a scene

A 3D (or layered 2D) scene where scroll moves the camera along a path: `camera.position`
interpolated along a `CatmullRomCurve3` with `lookAt` on a second curve, both driven by progress
through GSAP (`gsap.to(proxy, { t: 1, scrollTrigger })`). Layered 2D version: three to five
absolutely positioned layers translated at different rates (background 20 %, mid 50 %, foreground
100 %) plus a blur on the nearest layer only on tier high. The copy rides on a fixed layer.

## 5. Object disassembly and reassembly

A hero object that comes apart on scroll and goes back together. For a real product make it an
exploded view: the model split into its own parts (`scripts/explode-gltf.mjs`), each leaving along an
axis of the body in layers, outermost first, while the shot frames the whole spread (`craft.md`
section 7, "An exploded view"). Scattering is for type and particles: each piece gets a random
direction vector at build time; progress scrubs `position = origin + dir * progress * spread` and a
rotation; pieces are `InstancedMesh` past about 50. Reassembly is the same tween reversed, or into a
new arrangement (the pieces become a different word).

## 6. Type that enters the scene

Big type that stops being a label and becomes an object: it scales from 1 to 6 while blurring and
fading as the visitor scrolls "through" it into the next chapter, or it sits behind the hero
object with a depth-of-field mask (a dashed viewfinder frame inside which the object is sharp and
the type is blurred). Mechanics: `transform: scale()` and `opacity` only, the blur pre-baked as a
second copy of the text with `filter: blur(8px)` crossfaded in (never an animated `filter` on the
live text).

## 7. Curtain and clip-path chapter wipes

The next chapter's background is a fixed layer revealed by a scrubbed `clip-path: inset(100% 0 0
0)` to `inset(0 0 0 0)` (bottom-up), or `circle()` from a point (the hero object, the cursor) for a
"zoom into the object" cut. Between pages the same wipe runs on a full-viewport panel with the
View Transitions API or a 700 ms timeline that swaps the route at its midpoint.

## 8. Sticky stack

Cards with `position: sticky; top: 0`, each 100 svh; as the next covers the previous, the covered
card scales to 0.94 and dims (`opacity` on an overlay, not `filter`). Good for 3 to 6 case studies
or steps; the last card releases into the footer.

## 9. Sequence and video scrub

An image sequence (≤ 120 frames) or a keyframe-every-frame MP4 scrubbed by progress for
"film-like" reveals: turntables, unboxings, a landscape changing. `requestVideoFrameCallback` for
video; `ImageBitmap` frames drawn to a canvas for sequences; a poster until frame 0 is ready;
posters only on low tier.

## 10. Kinetic headline

Variable-font axes bound to scroll velocity (`wght` 400 to 800 over ±2 vh/s, eased back to rest in
300 ms), or words set on an SVG path that straightens as the chapter arrives, or letters that
scramble into place once. The text is final and selectable at rest; never animate `font-size`.

## 11. Scramble and counters

Numbers and labels that decode on entry (Specimen), counters that run to a value (stats), a lap
time that ticks with progress. One run on enter, never on hover for body copy, never under
reduced motion. Final text in the DOM for screen readers.

## 12. Draw-on

SVG strokes with `stroke-dasharray` and `stroke-dashoffset` scrubbed or triggered: circuit maps,
elevations, diagrams, signatures. Labels fade in when their line completes. The rendered image
crossfades over the drawing when the chapter completes.

## 13. Hover previews and image trails

A preview that follows the cursor (quickTo on x/y with 0.3 s power3) and crossfades per row;
or an image trail where each pointer move past a threshold drops a scaled, rotated copy that fades
out over 800 ms (cap at 8 live copies). Fine pointers only; inline on touch.

## 14. Magnetic and elastic

Buttons that pull toward the cursor within 80 px (25 % of the offset, 0.3 s expo), menus whose
items lag behind the cursor (each with a slightly longer duration), a cursor ring that grows on
hover targets. Fine pointers only.

## 15. Marquee and ticker

A rhythm break between dense chapters: 30 to 60 px/s, duplicated content for a seamless loop,
pause on hover and focus, a visible pause control when the content carries meaning.

## 16. Theme turn

The palette turns at a chapter boundary by a moving edge: the next chapter's colour arrives as a
rising slab, a growing circle or the frame window (`craft.md`, section 2), and the header reads the
chapter under it. When text must flip from dark to light in place, register `--bg` and `--fg` with
`@property` and turn them through grey over 0.4 vp so no frame fails contrast. Afterglow turns the
colour temperature of the scene (shader uniforms) at the same time.

## 17. Gate that is content

A loader that is the first chapter: the hero drawing draws itself, the mark assembles from the
brand's tiles, the counter is the real asset progress. 1.5 to 2.5 s (the budget), up to 4 s only with
a reason; skipped on repeat; the headline under it already in the DOM; its last beat is the hero's
first state. A gate the visitor acts on (draw the brand's initial, hold to enter) is only acceptable
when the act is the brand's idea; cookie, audio and age prompts never stand in front of the hook.

## 18. Logo becomes a window

Type as a mask: the wordmark sits huge on a blank page, liquefies or breathes for a beat, then one
counter (the bowl of a P, the eye of an O) opens into a slit through which the world behind is
visible; the slit widens with scroll until the letterforms are gone and the scene fills the
viewport. Mechanics: the scene (video, image or canvas) is a full-bleed layer under an SVG
`<mask>` built from the letter paths; scroll scrubs the mask's inner shape from the counter to
the full viewport (`clip-path` on a wrapper when the shape is a rectangle or circle, an SVG mask
with a scaled path when it is a letter). The liquid breathing is a displacement shader on tier
high, a `feTurbulence` + `feDisplacementMap` SVG filter on mid (small area only), nothing on low.

## 19. Pre-rendered objects as video

The cinema-grade look of real-time 3D without a real-time engine: render the object offline
(turntables, folds, explosions, characters) to short WebM clips with alpha (VP9) and an MP4
fallback, loop them in `<video>` or scrub them with `requestVideoFrameCallback`, and composite
them over the page with blend modes. A light WebGL layer (OGL) adds interaction: distortion on
hover, parallax, a shader transition between clips. This is how the most produced sites get a
hundred "3D" objects onto a page that still loads; the budget is in the media, not the script.

## 20. The ending

The last viewport is designed: the statement returns at poster size, the name runs as a marquee in
two cuts, the contact line is the biggest text on the page, the credits are set in mono. The footer
is where many sites give up; this one does not.

## 21. One object, one journey

The move that separates a captivating site from a well-made one. One object (the product, the
scene, a stage, a frame) is on screen from the first viewport to the last, and the scroll carries
it through every chapter: it expands to full bleed and becomes the stage for the next chapter, it
hosts the chapters that move sideways, it shrinks and docks beside the index as a live preview,
it turns to reveal a face, it opens. No chapter is a separate section that fades in beneath the
previous one; every chapter is a camera move on the same object, and the visitor never loses it.

Mechanics: one sticky stage (`position: sticky; top: 0; height: 100svh`) inside a spacer whose
height is the sum of the phases, reserved in CSS before first paint (`html.js .journey { height:
calc(…) }`) so nothing shifts when the script arrives; the chapters absolutely positioned on the
stage with `autoAlpha` 0 until their phase; the object appended to the stage at init and placed by
rect (left, top, width, height) so it leaves its hero slot without a jump; one GSAP timeline with
durations in pixels of scroll (hold, expand, swap, slide, dock, end) scrubbed by one ScrollTrigger
(`start: 'top top', end: 'bottom bottom', scrub: 0.8`); `invalidateOnRefresh` off and a rebuild
on resize instead, since the rects change; labels per phase so `onUpdate` can read the current
phase (pause an idle animation inside the object while it is not the subject, drive a progress
rail). Container units inside the object (`container-type: inline-size`, `cqw`) make its contents
scale with the frame as it grows. Low tier, reduced motion and no JS get the plain flow: the
object in its slot, the chapters stacked.

## Hooks: the first second

Before the first chapter there is one frame that decides whether the visitor scrolls. The hooks
that work, in order of how often they appear on the sites people remember:

1. **The wordmark as a window** (move 18): the name alone, huge, and the subject visible through
   the letters; then the letters grow past the edges and the subject fills the frame.
2. **A face or an object under light**: a portrait with something drawn over it (a wireframe
   helmet, contour lines), a product on a turntable, an object whose material reads at once.
3. **A gate the visitor acts on**: draw a shape, hold a key, click to enable sound; the act is the
   first interaction and it belongs to the world.
4. **A designed loader**: a mono readout, file paths, a progress line, the subject loading behind
   it; capped at 2.5 s and skipped on repeat visits.
5. **A lighting change**: the page opens lit, then the house goes down and a spot finds the headline,
   with the cue called in a corner. Cheap, fast (under 1.2 s), and the headline is the lit object, so
   LCP does not wait for it.

A headline and a lede, however well set, are not a hook; they are what the hook earns the right
to show.

## Building a sequence

Pick the signature first (usually 1, 4, 5 or 9). Give it the budget: the lazy chunk, the longest
pin, the best materials. Surround it with two or three supporting moves from 10 to 18. Every other
chapter uses reveals only. Then run the review pass with motion disabled: if the page still reads,
the choreography is serving the story.
