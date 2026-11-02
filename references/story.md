# Story: how a scroll becomes a narrative

Scroll is the timeline. The visitor controls the pace, the page supplies the beats. Sites that
of this calibre share a grammar: a gate, a statement, chapters with one idea each, transitions that
are scroll-bound rather than click-bound, a climax, and an ending that is designed rather than a
footer that happens. This file is that grammar with recipes.

## The arc

The arc below is one page's. A site with several subjects gets a page map first (`ux.md`, "Page
map"): the landing carries the signature and the doors, each door opens a page with its own arc.
On an ambitious page the chapters are not sections stacked under each other; they are phases of
one scene, carried by one object (`choreography.md`, move 21).



| Beat | Length | Job | Typical content |
|---|---|---|---|
| **Gate** | 0 to 1.5 s | hide asset init, set the tone | loader as a brand moment: counter, boot log, hairline, bloom; or no gate at all (SSR content, product sites) |
| **Statement** | 1 viewport | say the one thing | one declarative sentence over one live object; name, dateline, CTA |
| **Promise** | 0.5 to 1 viewport | why keep scrolling | a second sentence, a scroll cue, a metadata strip |
| **Chapters** | 3 to 6, each 1 to 4 viewports | one idea per chapter | see chapter types |
| **Climax** | 2 to 5 viewports | the signature moment | the 3D disassembly, the scrubbed film, the kinetic sentence, the gallery fan-out |
| **Resolution** | 1 viewport | the ask | contact, buy, read, download; said once, big |
| **Ending** | 0.5 to 1 viewport | a designed close | a footer that repeats the statement, a marquee of the name, the credits |

Pacing rule: alternate **dense** chapters (grids, lists, specs) with **air** chapters (one sentence,
full-bleed media). Two dense chapters in a row read as a brochure; two air chapters in a row read as
filler. Marquees and rules are rhythm breaks between them.

Signature rule: one moment per site gets the budget. Every other animation exists to protect it:
smaller, shorter, quieter. "Everything moves, so nothing matters" is the most common failure in
submissions that stall in the mid 7s.

## Gate recipes

- **Counter**: `000` to `100` in mono, driven by real asset progress (fonts, hero media, scene);
  never a fake timer. Finish with a clip-path lift of the curtain.
- **Boot log**: six to eight mono lines appear in sequence (`001 INITIALISE`, `002 LOAD MODELS`),
  tied to real steps; a progress rule sweeps across.
- **Hairline**: a 1 px rule grows from 0 to 100 % width, then the headline reveals through it.
- **Bloom**: the background lightens from black to the first chapter colour over 0.8 s.
- **No gate**: when content is server-rendered and the hero asset is an image, skip the gate and
  reveal the headline by line as soon as fonts are ready.

Hard rules: the gate never lasts longer than the real load; hard cap 2.5 s, then it lifts whatever
the state; on a repeat visit in the same session it is skipped (`sessionStorage` flag); it is never
a reason to delay the LCP element (render the headline under the curtain, so LCP happens early); a
"skip" is available to keyboard and screen readers (the curtain is `aria-hidden`, the content
behind is already in the DOM). An audio choice gate ("enter with sound / without") is fine for
Cinema and Volume only, and must default to silent.

## Statement recipes

- **Type over object**: headline at 8 to 16 vw, object (3D, photo, drawing) behind or beside;
  headline arrives by line (SplitText or CSS) with a 60 ms stagger after fonts load.
- **Framed scene**: the object in a rounded card with margins and corner marks; headline below the
  fold edge so it moves on the first scroll.
- **Portrait with overlay**: a person with a wireframe or drawn overlay that only the WebGL tier
  gets; others get the still.
- **Statement wall**: a justified paragraph in two weights filling the width; local time and city in
  mono in a corner (a cheap signal that the site is alive).

Every statement has: exactly one `h1`, real copy, a visible primary action within the first
viewport, and nothing under the mobile address bar (`100svh`, not `100vh`).

## Chapter types

| Type | What it looks like | Motion | Use when |
|---|---|---|---|
| **Index** | table or list of items with metadata columns, a count `(05)` | row stagger, hover preview, FLIP toggle | work, products, chapters |
| **Spotlight** | one item per viewport, large media, short caption | mask reveal, scale 1.08 to 1, caption line reveal | case studies, products |
| **Stage** | a pinned stage where content swaps while the visitor scrolls (product stories) | scrubbed keyframes bound to progress; copy swaps at thresholds 0.2 / 0.5 / 0.8 | explaining a product in 3 states |
| **Sequence** | image sequence or video scrubbed by scroll | scrub with `requestVideoFrameCallback` or canvas frames | film-like reveals |
| **Specs** | a two-column spec sheet with mono labels | decode or counter per row | hardware, tools |
| **Proof** | logos, quotes, numbers that exist | marquee at 40 px/s, pause on hover, counters | credibility; never invent the numbers |
| **Manifesto** | 3 to 5 sentences, one per viewport, huge | line reveals; type weight follows scroll velocity on Kinetic | studios, campaigns |
| **Gallery** | scattered or tilted cards over a watermark word | fan-out on enter, parallax 20 % on the watermark | photography, sport, events |
| **Timeline** | a horizontal or vertical rail with dated beats | the rail draws, beats pop | history, roadmaps |
| **Thermal / mood** | the chapter changes the whole palette and light | palette crossfade, blur confined to one element | Afterglow, Cinema |
| **Contact** | the ask, big, with a real email and a form that works | nothing moves except the hover state | every site |
| **Credits** | who made it, type and tools, year | a slow marquee of the name | ending |

Chapter checklist: one `h2`, one idea, one motion pattern, a static end state that is complete
(disable JS and the chapter must still read), and a background or theme token change if the
direction uses chapter-shift colour.

## Transitions between chapters

Scroll-bound beats cut: the visitor should never see a hard edge between chapters unless the
direction is Monolith or Poster (where the cut is the style).

- **Clip-path wipe**: the next chapter's background is a fixed layer revealed by `clip-path: inset()`
  scrubbed over the last 30 % of the previous chapter.
- **Theme crossfade**: `data-theme` on the chapter sets tokens; a scroll-bound tween of the root
  `--bg` and `--fg` over 40 % of a viewport (use `@property` so the custom properties interpolate).
- **Sticky stack**: chapters are `position: sticky; top: 0` cards, each scaling to 0.95 and dimming
  as the next covers it.
- **Pinned handoff**: pin the stage, scrub the content, release; the release must align with the
  next chapter's top (no gap, no overlap; test for layout stability after the pin spacer settles).
- **Curtain (between pages)**: a full-viewport panel slides over, the route swaps, the panel lifts;
  with the View Transitions API the panel is `::view-transition-old(root)`; keep the header
  persistent so it does not flash.

## Progress affordances

Long stories need a sense of place: a chapter counter `03 / 07`, a thin top rule that fills, a side
dot column, a dial with a readout, a timecode. One of these, not three. It must be reachable by
keyboard (links to chapter anchors) and must not cover content on phones.

## Product-story variant

For "Product or company": the statement is the product doing one thing; chapters are **Stage**
chapters where the same UI or object changes state as the visitor scrolls, with the copy on the
side swapping at thresholds; proof follows; the resolution is a dual CTA. Keep the palette
restrained with one accent, honour reduced motion by showing all states stacked.

## Long-read variant

For "Story or report": reading comfort wins. Measure 60 to 70 ch, 18 to 20 px body, chapters with
sticky titles, data shown as the visitor arrives at it (charts draw once, then stay), a progress rule,
a table of contents that is keyboard reachable, and print styles. Motion is a seasoning: reveals
under 0.5 s, no parallax on text, no pinning longer than one viewport.

## Sound

Only when the direction asks for it (Cinema, Volume, Playground). Default muted, a visible toggle,
no autoplay with sound, respect `prefers-reduced-motion` as "no sound" too, and nothing depends on
hearing it.

## Ending

The last viewport is designed: a repeat of the statement, a giant contact line, a marquee of the
name in two cuts of the type, the credits, and the legal links in mono. A footer that is just links
is the sign the story ran out before the page did.
