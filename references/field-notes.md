# Field notes: worked examples of directed sites

Twenty-six short write-ups of scroll-driven sites, each described by what it is for (a racing driver,
a satellite seller, a comic) and not by who made it. They were measured frame by frame at a steady
scroll and read back from their shipped code. Each entry pairs *what you see* with *how it is built*,
so the craft can be reproduced for a new subject.

How to use them: read the two or three entries closest to the brief (same kind of subject, same
kind of carrier), skim the rest once. Borrow mechanisms, never looks: the carrier, the edge, the
hold lengths and the eases transfer; the palette, the mascot and the layout do not. Where an entry
and `craft.md` disagree, `craft.md` wins. Numbers marked "about" are estimates from frames; the rest
come from code. Durations are at a steady 500 px/s scroll on a 1440 x 900 screen; "vp" is one
viewport of scroll.

## Contents
- Product and launch
- People and portfolios
- Studios and agencies
- Stories and worlds
- Tools and SaaS
- Patterns across the notes
- What not to copy

## Product and launch

### 1. A tongue-in-cheek product page for a tabletop object
- **Idea**: one object (a cork coaster) stays on screen for about 21 vp and every chapter re-lights, rotates, blurs and re-frames it.
- **Hook**: a vector mark drawn with anchor points and a conic fill resolves into the object, then the name and one line of copy. Cold load is 4 to 5 s because the first view is about 20 MB.
- **Carrier**: the object in one fixed WebGL canvas; copy rides over it in DOM.
- **Chapter changes**: no edge at all, the object itself changes. Rotation 360 degrees over about 1.4 vp, key light turned 30 to 60 degrees per chapter, background gradient crossfaded over about 0.5 vp while the object turns. One multicolour glow moment is saved for the climax.
- **Text**: a 120 px headline reveals char by char (blur 8 px to 0, 0.3 s each, stagger 0.03), holds 3 to 4.5 vp pinned, then exits char by char from the right with blur trailing. Median readable time 2.5 vp.
- **Craft**: virtual scroll `current += (target - current) * (1 - exp(-12 * dt))`; scroll sets a 0 to 1 uniform per chapter, windowed with a smooth `fit`. Post: low bloom, vignette, blue-noise grain.
- **Numbers**: chapters 1.4 to 3.4 vp; light turn per chapter 30 to 60 degrees; background crossfade 0.5 vp.
- **Do not copy**: text drawn as canvas glyphs (not selectable), the pulsing multicolour glow (photosensitivity), and the 20 MB first view.

### 2. A drone maker's launch page
- **Idea**: one real-time drone model lives in a fixed canvas all page; native scroll picks the frame of its baked animation.
- **Hook**: counter 0 to 100 in about 2 s, then the drone is already in view with a giant white headline word scrolling over it.
- **Carrier**: a glTF with a 1,038-frame baked clip (fly, scan, fold, land), pose follow-lerp 0.03 to 0.08, animation frame lerp about 0.6, a gentle float at 0.28 Hz.
- **Chapter changes**: white editorial sections with 240 px type scroll over and around the canvas; particles morph into terrain behind the drone between chapters.
- **Text**: a pinned capabilities chapter of about 6.8 vp for 3 items; each item plays a time-based timeline on entry with a minimum phase of 1.5 to 4.7 s, so a fast flick still lands each item. Stat strip: three columns on hairlines, the active one dark and the others about 25 % grey, switched by scroll segment, numerals scramble 0.6 s on swap.
- **Craft**: Draco-compressed model, frame ranges mapped to scroll ranges per chapter, six canvases in all (heavy on phones).
- **Numbers**: 0.9 to 2.3 vp per step, 1 vp per stat, 15 to 30 vp total.
- **Do not copy**: 9 to 12 px mono labels and a 3 vp stretch with nothing new.

### 3. A satellite-mission seller as one camera flight
- **Idea**: a fixed three.js stage; the story is progress through it, about 48 vp, almost all pinned, text swapping in place.
- **Hook**: black for 1.2 s, then a dim wireframe-blue satellite fades in (5 % to 100 % over 1.2 s), a two-line headline rises by lines at about 3.6 s, one call to action bottom right. A cookie dialog sits over it, which is the mistake.
- **Carrier**: the 3D scene: satellite, a dotted Earth, one glTF whose parts unfold, fold and gain a fairing wireframe.
- **Chapter changes**: the signature move is a dolly toward the globe, white cloud fog filling the frame for about 0.6 vp, then aerial terrain fading in as the clouds dissolve; terrain dims to black over about 0.8 vp and blueprint lines draw in along three axes. Problem and solution are marked by an eyebrow colour flip (orange to blue).
- **Text**: split lines and words, `y 150% to 0` `expo.out`, stagger 0.04 to 0.06; 95 px keywords, 41 px sentences of about 10 words, one thought per beat. Two edge words enter from opposite screen edges at once (about 0.7 vp). A gap of 0.3 vp of calm Earth glow between beats lets the eye rest.
- **Numbers**: about 1.35 vp per beat, headline holds 0.95 to 1.4 vp, sentence holds about 1.35 vp, Lenis `duration 0.75`, house curve `cubic-bezier(.51,.01,.2,1)`, counters 2 s `power1.inOut`.
- **Do not copy**: a 17 vp benefits stretch of keywords and counters on pins.

### 4. A supplement pouch as a single light
- **Idea**: the whole site is one glowing light and each chapter changes its size and colour (point, room, big white disc, mint field, dark-green disc).
- **Hook**: four photo cuts while the logotype brightens as the progress bar, then a bloom into a lit 3D room with the pouch. It takes about 14 s on a 24.8 MB page, far too long.
- **Carrier**: a fixed full-screen WebGL stage; DOM text fades over it.
- **Chapter changes**: a soft-edged disc grows from about 300 to 1,900 px over 2 to 3 vp and the colour inside is the next theme, so two backgrounds never crossfade.
- **Text**: lines scrub in over about 0.3 vp with 0.15 vp offsets. Chapter titles are readable only 0.12 to 0.22 vp (0.5 to 0.9 s), which is the flaw.
- **Craft**: the pouch is a real 3D object lit in a room, not a screenshot; Lenis lerp 0.1 with touch sync.
- **Numbers**: disc growth 2 to 3 vp, feather 60 to 80 px, Lenis `duration 1.2`.
- **Do not copy**: eight videos on a persistent canvas and a page with a one-viewport document height.

### 5. A vehicle-styling atelier as one scrubbed film
- **Idea**: one camera move through a film of three cars: dolly over the bonnet, through the windscreen, out and over to top-down.
- **Hook**: a typewriter gate (one click), then the film starts under a heat-haze shader.
- **Carrier**: a pre-encoded video decoded frame by frame with WebCodecs and drawn to a canvas by scroll (about 4 vp for the flight; keyframe-dense, decode on demand, flush after about 250 ms idle).
- **Chapter changes**: service panels swap by a rectangle clip growing from the centre of the last sentence; each swap is `clip-path inset(100% 0 0 0)` to `inset(0)` with the image counter-scaling 1.2 to 1, linear, about 0.55 vp.
- **Text**: sentences relay in one screen position and dissolve word by word in arrival order (blur 8 px to 0 at 0.6 s, stagger 0.15). One sentence was readable only 0.25 vp.
- **Craft**: depth-parallax and a point-light shader on stills follow the cursor.
- **Numbers**: services about 8 vp for 6 items, virtual scroll lerp 0.1 to 0.15 with snap.
- **Do not copy**: virtual scroll with a one-viewport page (no scrollbar, no anchors, bad on phones).

## People and portfolios

### 6. A racing driver
- **Idea**: a poster that is also a playground: the portrait is the carrier and the page changes colour around it.
- **Hook**: acid-lime loader with a small mark for about 1.2 s, then the lime splits into two strips that leave top and bottom. Hero is a studio portrait; a real 3D helmet model follows the pointer and its livery sweeps across the face in horizontal bands.
- **Carrier**: the portrait. Scrolling shrinks it into a frame while the page turns dark green and the photo desaturates; a two-line marquee (serif italic in the accent colour over a condensed sans) runs behind it; a signature draws itself over the photo.
- **Chapter changes**: a parallax collage of photos at different depths with small dated captions; cutouts (helmet, head) enter from the frame corners; a horizontal track carries per-item drift.
- **Text**: statement lines revealed by an accent bar sweeping across each line; headings revealed by dark blocks sliding off them; large text holds about 0.97 vp and always leaves by scrolling.
- **Craft**: the 3D helmet is real material, tracked on the pointer; the rest is photography and DOM.
- **Numbers**: Lenis lerp 0.1; eases mostly `power2.out`; reveal trigger `top 90 %` once; clip-path ellipse reveals 0.8 s `power2.out`; track items drift 4rem through `containerAnimation`.
- **Do not copy**: nothing structural; keep the sweep short and the hold long.

### 7. A developer portfolio built on one 3D sigil
- **Idea**: one red winged emblem is the same WebGL object all page: eye mask on a portrait, wings, rotating centrepiece, backdrop.
- **Hook**: a non-linear script counter with plateaus at 17 and 99, about 4.5 s, on the hero colour.
- **Carrier**: the emblem, mounted once; each chapter scrubs only its rotation or position (`rotation.y` to about 10 turns over a 900 % trigger, `scrub 0.4 to 0.8`).
- **Chapter changes**: a dripping edge and a torn-paper edge sweep 0.3 to 0.5 vp; backgrounds go black, blood red, paper, blurred photo while the emblem keeps moving.
- **Text**: blur-in words or chars with random-order stagger (opacity 0, `y 20 to 50`, blur 4 to 10 px, `each 0.04 to 0.05`, `expo.out` 1 to 1.4 s); a 19 rem script word draws its stroke (3 s, stagger 0.11) then lifts. Case studies pin 5.4 to 6 vp.
- **Craft**: one model, no sets; the edge illustrations carry the mood.
- **Numbers**: reveal trigger `top 85 %`, Lenis `duration 1.2` expo-out.
- **Do not copy**: per-word streams readable 1 to 3 s and placeholder text left in the DOM.

### 8. A motion designer with a showreel card
- **Idea**: one tilted showreel card is the carrier; it grows from about 300 x 190 px to full bleed and back, then becomes the next page's hero tile.
- **Hook**: giant variable-font type and a camera-icon cursor on a cream surface; Lenis stays stopped during the intro.
- **Carrier**: the card, scrubbed in width and height.
- **Chapter changes**: page scroll locks at about 3 vp and the wheel (about 15,000 px) drives the project showcase; page transitions carry the card (a flag-warp blob holding the URL text lands as the next hero tile, about 1.2 s).
- **Text**: chars enter `yPercent 115 to 0`, 1.2 s `power3.out`, stagger 0.02, exit `-105 to -210`, 0.6 s, stagger 0.05. Pointer-driven variable-font stretch: even chars weight 1000 to 700 and width 60 to 150, odd the inverse, one value through a 0.2 s `power3` quickTo.
- **Craft**: type is the 2D craft; no WebGL needed.
- **Numbers**: Lenis lerp 0.1; intro up to 10 s on a 64 MB page (too long).
- **Do not copy**: the wheel-locked tail strands scrollbar and keyboard users.

### 9. A designer with a lens cursor
- **Idea**: a coral disc is both cursor and lens: wherever it goes, an alternate blunter version of the same sentence shows inside it.
- **Hook**: a ring loader around the mark, a start pill, then a coral disc scales in and the H1 rises through a mask.
- **Carrier**: the disc and the near-black page of huge caps; native scroll about 10.9 vp.
- **Chapter changes**: a pinned full-width band at the viewport centre with a cloned inverted list clipped to it, so the item inside the band flips colour as the list slides past (`pin: true`, start `top+=50% top+=50%`).
- **Text**: two stacked copy layers; the top layer is clipped by `circle(var(--r) at var(--x) var(--y))`, r 12 to 125 px, 0.4 s `power3.out`, lerp 0.15.
- **Craft**: one small WebGL canvas for a night-sky moment; everything else is CSS.
- **Numbers**: easing `cubic-bezier(.165,.84,.44,1)`; text holds about 0.95 vp.
- **Do not copy**: the lens has no touch equivalent; give a tap or a static alternate line.

### 10. A product designer's playable diorama
- **Idea**: the portfolio index is a world you steer: drive a toy tank to a billboard and open a case study.
- **Hook**: a loader that is itself a mini-game (status lines, a segmented fill, a tiny marker riding the bar); the first load is long (222 models, 7 MB of script).
- **Carrier**: the 3D scene; scroll does nothing on the entry screen.
- **Chapter changes**: a halftone dot grid grows from the corners (grid 80 cells over the diagonal, softness 0.1, about 2 s) while the scene swaps from night street to sunny valley. A skip-the-game plate gives the quick preview: wheel moves a camera spline (800 px per billboard).
- **Text**: almost none; prompts are persistent plates.
- **Craft**: toon shading with stepped light and hatch shadows, slight chromatic fringe on high-contrast edges, bloom only on muzzle flashes and glowing cables that act as wayfinding; saturated grass against warm props.
- **Numbers**: wipe about 2 s; keyboard move, boost and one interact key.
- **Do not copy**: a 26 s cold load and a paragraph left at low contrast for the whole start screen.

### 11. A tribute to a brick-vault engineer
- **Idea**: one warm photograph, then text on black; the reader's scroll is the only clock.
- **Hook**: 1 s black, a 40 x 10 px slit of the photograph at dead centre opens to full bleed (`clip-path inset(48% 46% 48% 46%)` to `inset(0)`, 2 s `power4.inOut`) while two huge words assemble letter by letter at opposite corners. Scroll unlocks at about 3.7 s.
- **Carrier**: the photograph, then a growing vertical timeline line with a spinning tip.
- **Chapter changes**: a black panel rises over the image; each timeline item opens by `clip-path inset(0 0 100% 0)` to `inset(0)` while its image settles (`yPercent -30 to 0`, `sine.inOut`); a footer toggles the theme at 50 % in view with a huge wordmark rising.
- **Text**: 123 px headlines, 53 px statements of 14 to 40 words (each visual line wrapped and faded up with about 0.06 vp between lines), 19 px notes. Statements hold 0.65 to 0.9 vp, acceptable only because nothing else is on screen.
- **Craft**: restraint: one image, two inks, hairline rules. Timeline year brightens from 0.4 to 1 opacity as it passes the centre.
- **Numbers**: about 15.6 vp total, no pins on text.
- **Do not copy**: secondary titles that flash by in 0.04 to 0.13 vp.

## Studios and agencies

### 12. A 3D studio as one virtual-scroll film
- **Idea**: DOM cards and text are windows into one continuous canvas that changes world about every 2,000 wheel px (toy blocks, a ribbon, a reel, a project grid, an astronaut, a tunnel).
- **Hook**: a bar fills with a counter (about 3.4 s), breaks into the studio's letter mark, and a skewed parallelogram wipe (about 0.4 s) lands on the hero.
- **Carrier**: the canvas; DOM rectangles are mirrored into meshes each frame so layout stays in CSS.
- **Chapter changes**: a bridge object. A card warps while a ribbon wraps it; a tablet frame scales until its screen is the viewport while the next scene is already playing inside it, page colour going lavender to black in the last 15 % of the zoom, rotating about 5 degrees.
- **Text**: words fly through the camera (scale 1 to 7 and out to the edges over about 1.6 vp); the hero line stays readable under 2 s, a flaw.
- **Craft**: bloom (threshold 0.1, strength about 0.2), vignette 0.6 to 1.6, blue-noise grain, depth of field; a volumetric lattice tunnel for the climax.
- **Numbers**: about 21 vp total; scene 1.5 to 6 vp; eases `(.35,0,0,1)` and `(.4,0,.1,1)`; a paint-wake buffer follows the cursor.
- **Do not copy**: a 6 vp text-free tunnel and white flashes.

### 13. An events agency made of clip-path geometry
- **Idea**: not a WebGL show; the craft is a polygon "spotlight beam", video cards that inflate to full bleed and service cards that stack.
- **Hook**: a lavender beam polygon opens: `clip-path: polygon(49% 0, 51% 0, var(--poLeft) 100%, var(--poRight) 100%)` on a 110vmax box, scale 0 to 1 in 1.2 s, the two edge variables sweep to 180 % and -100 % (1.2 s, offset 0.3), rotation 40 degrees (1.2 s, offset 1.0), all `power3.inOut`.
- **Carrier**: the beam and the sticky card stack.
- **Chapter changes**: sticky cards, 1 vp each; the covered card scales to 0.95, tilts about 3 degrees and darkens while the next card (top radius 40 px) enters.
- **Text**: `power3.out` reveals, 1.2 s. One 120 px statement fills with colour and cannot be read unless the visitor stops.
- **Craft**: a goo blob cursor that turns into a text-reading disc; one canvas, a dotted globe.
- **Numbers**: a cookie bar covered the bottom third through the whole intro.
- **Do not copy**: a colour-fill statement as the primary claim.

### 14. A web studio selling itself as physical props
- **Idea**: every section is a prop: a cut-out paper logo, paper tickets for pricing, a retro monitor that holds the pricing window.
- **Hook**: scissors cut a dashed line and reveal the logo as they pass (about 6 s, long).
- **Carrier**: a pinned portfolio slideshow, `pin top top`, `end +=3 vp` (1 vp per project), with a left list highlighting the active row and the image sliding up in 0.8 s.
- **Chapter changes**: a window scales 1 to 0.3 while the monitor bezel slides in; white and blue gradient windows swap by scaling. Snap with Lenis `scrollTo(nearest, { lerp: 0.14 })` after the scroll stops.
- **Text**: 118 px serif-italic and grotesk mixed in one headline against 16 px support; lines fade with blur (stagger 0.12, `power2.out`).
- **Craft**: device mockups on real photos; red as the single hue.
- **Numbers**: use `scrub: true` with Lenis (an extra `scrub 0.8` made images trail); Lenis lerp 0.3 on mobile.
- **Do not copy**: an 8.8 vp pin for one line and 9 to 10 px mono microcopy.

### 15. A sports creative studio with a liquid hero
- **Idea**: a WebGL liquid blob acts as a window onto a video collage, then grows until it floods the screen, taking the page from white to black without a section change.
- **Hook**: a dot grows into the blob on the hero colour; counter about 3.4 s.
- **Carrier**: one scene: blob mask, then a camera dolly through planes at z -18 to -65, then the same rock model again in the footer.
- **Chapter changes**: the blob grows about 400 px in about 0.8 s; the background goes through grey (black, dark grey, mid grey, near-white over about 0.8 s) so text contrast never fails; velocity-driven barrel distortion (25 on phones).
- **Text**: 62 px caps statements of 17 words hold about 3.7 s (need about 6); project titles 1.7 s.
- **Craft**: fog 5 to 85, `positionLerp 0.05`; a still-to-blob dot as a loader that is already the hero.
- **Numbers**: 25 preloaded videos; page transition holds about 1.5 s before wiping.
- **Do not copy**: those preloads and the held transition.

### 16. A design-education special as a lesson in container shapes
- **Idea**: the page is the lesson: each chapter changes the shape of its container (tall rectangle, pill, circle, inverted triangle) in strict black, white and grey.
- **Hook**: curtain `scaleY 1 to 0` in 0.9 s `power3.inOut`; logo letters rise 0.95 s `power3.out` stagger 0.085; the whole page zooms from scale 0.136 to 1 over about 3 s.
- **Carrier**: the current shape container, scrubbed (`scrub: true`, `ease: 'none'`), no pins at all.
- **Chapter changes**: each next container enters from the bottom while the previous is 40 to 50 % in view, so the screen is never empty; text sits inside the shape and is cropped by it.
- **Text**: a 190 px wordmark against 8 to 12 px support copy; holds about 0.97 vp.
- **Craft**: SVG letters and clip-path polygons only; no canvas.
- **Numbers**: overlap about 0.5 vp.
- **Do not copy**: support copy at 8 to 12 px.

## Stories and worlds

### 17. A collectibles brand built on illustrated characters
- **Idea**: the brand's own glyph tiles and folder-tab card shape are both the transition and the carrier.
- **Hook**: on white, the loader assembles the wordmark out of the brand's glyph tiles (pill-shaped strokes). The hero is a full-bleed illustrated character close-up with a heavy three-line staggered headline.
- **Carrier**: the hero image shrinks into a card with a notched folder-tab shape (the brand shape), tilts in 3D and slides into a stack. A carousel of character cards on a cylinder collapses to one card that turns edge-on to a sliver; the next world's cards fly in from depth and the main one scales to fill.
- **Chapter changes**: the same tile field sweeps across the screen, covering it in about 0.4 vp, and the scene swaps under it. Painted landscape chapters pan vertically with parallax cloud and mountain layers.
- **Text**: copy blocks fade up from about 30 % opacity and hold about 0.75 vp. The footer wordmark is giant and rises from below.
- **Craft**: one fixed WebGL canvas for the whole page (GSAP ScrollSmoother), textured planes for the cards.
- **Numbers**: tile wipe about 0.4 vp; card tilt 8 to 15 degrees; hold about 0.75 vp.
- **Do not copy**: the characters or tiles; build the equivalent from your own brand shape.

### 18. A venture firm as a single icy WebGL world
- **Idea**: monochrome world; transitions are objects forming and dissolving.
- **Hook**: the hero object (a snow shelter) assembles from a point lattice into solid blocks on terrain, then bursts apart.
- **Carrier**: the descending camera in one scene; virtual scroll.
- **Chapter changes**: portfolio items are crystals floating past the camera, each labelled with mono callouts on leader lines (name, temperature, date, an "explore" cue). The ending is a particle-formed mascot on a ringed pedestal.
- **Text**: only small HUD text; the labels are the copy.
- **Craft**: lattice to solid, points to mascot; leader lines turn the scene into an interface.
- **Numbers**: callouts must stay at 11 px or more and never under 60 % opacity.
- **Do not copy**: a story with no headline at all; keep one readable claim.

### 19. A career-education startup as a painted 3D world
- **Idea**: a stylised 3D hand travels through a painterly world toward a second hand, a reference to a classic painting of two hands.
- **Hook**: an interaction gate asks the visitor to draw the brand's initial (a circle) with the cursor; then a green 3D hand reaches across, company logos float around it as bubbles and editorial serif words sit around the hand.
- **Carrier**: the hand.
- **Chapter changes**: the hand moves through classical columns, a pond, petals and god-rays toward the human hand.
- **Text**: serif words placed around the hand, not blocks.
- **Craft**: 3D plus painted matte layers; mostly virtual scroll.
- **Numbers**: keep the gate under about 3 s with a skip.
- **Do not copy**: a gate before the first look at the subject; show the hand first and make drawing optional.

### 20. An interactive comic about a DJ sheep
- **Idea**: the site is the comic: each section is a panel with a character acting, and a drawn cream cloud blob turns the page.
- **Hook**: a mascot badge cycling faces for 9 to 10 s of blank loading (too long).
- **Carrier**: a 2160 x 1350 WebGL stage of hand-illustrated layers with compressed textures; native scroll plus Lenis.
- **Chapter changes**: cream cloud blobs sweep across as the edge; a pinned creator section of about 7 vp has 2 cards.
- **Text**: word reveals with elastic and back eases; cards enter from `x 100vw`, rotate 8 degrees to 0 over about 1.2 s, started by `onEnter` (`onLeaveBack` resets) rather than scrubbed.
- **Craft**: elastic and back only because the brand is playful; everything else uses output eases.
- **Numbers**: stagger 0.06 to 0.15; the last 8 vp of scroll is dead.
- **Do not copy**: hiding the story behind a read button.

### 21. A planetary-scale AI company as one camera descent
- **Idea**: one real-time world: orbit, clouds, terrain city, data centre, a server blade, the chip, a neural layer, a car dashboard.
- **Hook**: wordmark wipe and a sound gate (a system-boot style prompt); 14 s and 49 MB on a cold load, far too long.
- **Carrier**: the camera, with waypoints, snap bands and a stretch between them (about 24,000 wheel px, virtual scroll).
- **Chapter changes**: noise-threshold burn with an emissive edge, `smoothstep(t - w, t, noise(uv))`, turns one object into the next; a chromatic warp (displacement 0.1, shift speed 4, pulse 0.15) hides scene cuts in about 0.7 s; the finished render shrinks into a card.
- **Text**: random-order letters on the hero; labels at 9 to 12 px mono, about 1 vp readable.
- **Craft**: volumetric light, depth of field, bloom on real models; the product is entered by the camera, not shown beside text.
- **Numbers**: over 30 vp of travel with no progress indicator.
- **Do not copy**: the missing progress cue and tiny labels.

### 22. A design resort printed in two inks
- **Idea**: every image is first translated into a vertical-stripe woodcut pattern (a halftone shader whose bar width follows brightness) and then "developed" into the real render or photo.
- **Hook**: a sheep and a giant wordmark during a 6 to 8 s wait, then a comb or stripe wipe; the hero frames are dropped on phones.
- **Carrier**: the hero shrinks to about 0.3 into a tan card; theme flips between umber and tan at panel edges.
- **Chapter changes**: stripe dissolves (photo to ink to photo), thresholds animated by scroll; a benefits track of scattered rotated prints pins about 7.2 vp for about 8 cards.
- **Text**: chars through a mask at 144 px; a 120-frame image sequence over about 4 vp on desktop only.
- **Craft**: per-cell brightness sampling on a grid, two flat inks, the shader doubles as loader texture.
- **Numbers**: 16 canvases (too many contexts); a cookie bar overlaps content throughout.
- **Do not copy**: the context count and the long wait.

## Tools and SaaS

### 23. An AI app for architects
- **Idea**: one fixed WebGL canvas holds a flat-shaded miniature of an architect's desk; scroll flies the camera from room to drawing to building model.
- **Hook**: a four-icon tile with cell glitches collapses to a bar, becomes a letterbox strip of the hero and grows to a frame, about 2.5 s after load.
- **Carrier**: the canvas box itself, which trades sides with the text (full, left, right).
- **Chapter changes**: a sheet of paper exists in both scenes and folds into the building mass; the scene swaps while it folds. Each feature headline slides in at `x +-100 %`, `rotation +-45 to 0`, 1 s `sine.out`, scrubbed from `top bottom` to `bottom 76 %`, and leaves on the opposite side.
- **Text**: 1.8 vp readable per block; the primary claim was readable only 0.08 vp, a flaw.
- **Craft**: three flat colours plus a hard shadow polygon; noise and vignette only; eases `(.2,0,.1,1)`, `(.8,0,.8,.5)` and `(.333,0,0,1)`.
- **Numbers**: about 23 vp; DPR 1.5 with shadow maps and no low tier.
- **Do not copy**: a cookie bar over the hero and no phone fallback.

### 24. An AI agent for designers drawn as a drafting table
- **Idea**: everything is line art on cream paper (grid, crop marks, mono captions, one orange-red accent) and the product UI is drawn as blueprint wireframes in the same weight.
- **Hook**: the hero building draws itself in line with an orange scan line and status lines, about 4 to 5 s.
- **Carrier**: the drawn page; the accent circle or rectangle moves instead of the colour changing.
- **Chapter changes**: wireframes slide in over a floor plan; an orange block erodes in with a ragged edge; page transitions clip and slide horizontally for about 1 s.
- **Text**: split lines in a mask, `yPercent 100`, 1.2 s `expo.out`, stagger 0.05, trigger `top+=55% bottom` once, then revert the split.
- **Craft**: CSS keyframe stroke draws (0.35 to 0.9 s, delays 0.12 to 1.15 s).
- **Numbers**: median hold 0.94 vp; headline 47 px against 12 px support.
- **Do not copy**: body copy at 12 px and a persistent badge on the right edge.

### 25. A freight-yard operating system
- **Idea**: a 410-frame pre-rendered flight (golden-hour truck at the gate, the yard, a computer-vision wireframe pass, abstract connected smoke) scrubbed by scroll under a three-sentence statement.
- **Hook**: the brand mark, then a lens-slit opening that becomes the frame, about 4.5 s.
- **Carrier**: a canvas with 410 WebP frames at 1440 wide (about 35 KB each, first 40 eager, rest streamed), `drawImage` by `round(progress * (N - 1))`, about 3.2 vp, about 7 px per frame; a separate 409-frame mobile set.
- **Chapter changes**: a white panel with a concave notch rises over the film while the film slows (`yPercent 0 to 50`); then a clean white SaaS page with sticky video steps and dark green at the end.
- **Text**: three sentences of 8 to 12 words at 70 to 82 px in the same screen spot: words arrive in order (about 0.9 vp), hold (0.5 vp), dissolve in arrival order (0.5 vp); frames graded dark under the copy.
- **Craft**: render with one hard sidelight; a green highlight on active words.
- **Numbers**: about 1.9 vp per sentence.
- **Do not copy**: the 4.5 s loader.

### 26. A research agency with a green ribbon
- **Idea**: flat characters ride one hand-drawn green path that scroll draws down the page, past white text cards.
- **Hook**: a scribble draws itself (1.0 s `power1.inOut`) with an elastic dot, minimum 1.5 s, then a green panel rises; skipped on touch.
- **Carrier**: one SVG path; a paused timeline (`drawSVG 5 % to 100 %`, 0.9 s, custom ease; second path linear; shadow fades at 0.95) whose `progress()` is set from a tall wrapper's scroll.
- **Chapter changes**: each section has `border-radius: 40px 40px 0 0` and `margin-top: -40px`, native scroll, sliding over the last with no JS. Page transitions: Swup and view transitions, a colour panel rising in about 0.3 to 0.6 s, after a 1.5 s hold (too long).
- **Text**: block fade-up 0.3 to 0.5 s, no stagger; stat numbers hold 0.9 to 2.1 vp; 140 px against 20 px.
- **Craft**: Rive state-machine characters started by IntersectionObserver, which is what keeps 14 canvases affordable.
- **Numbers**: Lenis lerp 0.1.
- **Do not copy**: nothing structural; hold the page transition under 0.3 s.

## Patterns across the notes
- Hero-to-first-copy is the hook: the subject moves by 3 s; loaders run 1.5 to 4 s and hand their last beat to the hero (a curtain, a zoom from 0.14 to 1, strips leaving top and bottom, a slit becoming the frame).
- One carrier per page. Object, card, frame, portrait or light is mounted once and changed by 0 to 1 uniforms per chapter, windowed so each change owns 0.5 to 1.4 vp.
- The best hand-offs swap the scene at the moment of most distortion: edge-on card, mid-fold sheet, mid-zoom frame, full-screen tile field, fog filling the frame.
- Edges move for 0.3 to 0.8 vp (scroll) or 0.6 to 1.2 s (time); colour that must flip contrast passes through grey over about 0.8 s.
- Pinned stages that survive fast scrolling play a time-based phase of 1.5 to 4.7 s per item on entry; scrubbed long pins blur at speed.
- Text anchored in one screen position over a moving world needs about 1.9 vp per sentence: in 0.9, hold 0.5, out 0.5, 6 to 12 words.
- Display type of 95 to 240 px against 14 to 20 px support is the look; sites that drop support copy under 12 px fail on legibility.
- Reveals cluster at 0.6 to 1.4 s with stagger 0.018 to 0.15 (chars lowest, lines about 0.05, words 0.06 to 0.15); the exit mirrors the entry in arrival order.
- Smoothing converges: Lenis lerp 0.05 to 0.1 or duration 0.75 to 1.2; `scrub: true` with Lenis, 0.4 to 1 without; virtual scroll damping coefficient about 12.
- Page weight splits sites: baked frames (120 to 410 at about 7 px each) cost 4 to 14 MB and work on phones with a smaller set; live 3D with post and videos reaches 20 to 49 MB.
- Pointer layers (lens, goo, paint wake, helmet follow) are the second story but need a tap or static fallback.
- The strongest products are never a picture beside text: the camera or the actor moves with scroll and copy stays in screen space.

## What not to copy
- Loaders over 4 s, 10 to 14 s ones, empty frames while loading, a loader that replays on every internal link.
- Any gate before the hook: cookie bars over the hero, audio gates, age gates, "draw to enter" without a skip.
- Copy readable under a second: primary claims scrubbed out in 0.02 to 0.3 vp, chapter titles under 0.9 s, per-word streams.
- Tiny labels: 8 to 12 px mono at 25 to 40 % opacity on dark, over imagery or on rotated cards.
- 20 MB first views, 6 to 16 canvases, 15 to 25 videos, no low tier and no phone version of the signature move.
- Documents one viewport tall (virtual scroll without scrollbar, anchors or back-to-top) and wheel-locked tails.
- Dead scroll: 6 to 14 vp stretches with nothing new, pins of 8 vp for one line.
- Two full backgrounds crossfading, or a fade to an empty colour.
- Pointer-only magic with no touch equivalent; flashes and pulsing glows; placeholder text left in the page.
