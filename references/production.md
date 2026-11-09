# Production: the bar, the route and the gates

A site lands at the level of its references and its material, not at the level of its code. This file
is the step between the concept and the build for every brief that is Cinematic, 3D, or says award,
wow or "like the winning ones". It fixes three things before any scene is built: the bar the result
is judged against, the production route that can reach that bar, and the gates where the person
sees work and says yes or no.

It exists because the failure is predictable. Without it, a builder that can write code produces
what code produces alone: terrain from a heightmap, trees from cones, lines from tubes, a sky from a
gradient. Each round is then judged against the round before ("better than last time") and never
against the bar, and a day goes by. The rules below cost an hour and save that day.

## Contents

1. The bar: a reference board
2. The route: how the frames get made
3. What a browser cannot draw live
4. The gates: style frame, vertical slice, then the rest
5. Asking for access
6. Judging against the bar
7. Hard-won mechanics

## 1. The bar: a reference board

Before the concept is final, collect four to eight frames from two or three public sites at the level
the brief asks for. Ask the person for sites they would like theirs to stand next to (intake Q9); if
they have none, propose three by what they do (a product on a studio set, small art-directed scenes
with designed transitions, one scrubbed film) and let them pick.

```bash
node <skill>/scripts/board.mjs capture https://example.com/ --name example --shots 10
```

It opens each site on the real GPU, scrolls it with wheel events, and saves full-size frames to
`.stagecraft/board/<name>/`. Look at every frame at full size and write `docs/bar.md`:

- what the frames have in common, in plain words: the materials, how many things are on screen, where
  the light comes from, what the background is, how type sits on the image, what moves;
- three to five rules the build must keep because of it ("one monochrome material family", "every
  scene is one object on a dark ground", "transitions pass through fog, never cut");
- what the reference does that this brief will not attempt, and why.

The board is a bar for quality and a source of technique. Never copy a layout, an asset or copy from
it (`SKILL.md`, safety rails).

## 2. The route: how the frames get made

Pick one route per scene from this table and write it in `docs/concept.md` next to the signature.
The question is never "what can be coded", it is "what would a studio use to make this frame".

| The frame shows | Route | Needs | Ships as |
|---|---|---|---|
| The client's product, place or people | photography or footage of the real thing | the originals, or a shoot | images, video loops |
| A hard-surface object (a device, a machine, a vehicle, a tool) | a real model (CAD, scan, CC0, licensed) on a studio set, live | the model | GLB + HDRI, `hero-scene.ts` |
| An object nobody has a model of | a generated model from a style frame or photos, cleaned in Blender | a 3D generation service, Blender | GLB with baked light |
| A world, a landscape, weather, crowds, nature | rendered offline, or generated video, never live | Blender with scanned assets, or a video model | image sequence or video |
| A move between two scenes | generated or rendered video between a first and a last frame | a video model with first and last frame control, or Blender | image sequence, scrubbed |
| An interface, a site, an app | filmed (`scripts/film.mjs`) | the running thing | video loops |
| A diagram of how something works | drawn: line art, a section, an exploded view of a real model | the model or a drawing | SVG, or the model's own edges |
| Nothing but words | type at display scale over a colour system | fonts | HTML |

Rules that follow:

- **Live WebGL is for what must react**: an object the visitor turns, opens, takes apart, hovers. A
  scene the visitor only watches is footage, and footage looks better and costs less.
- **Generated material is material.** A model from Tripo, Rodin, Meshy or Hunyuan3D, a move from Kling,
  Veo or Runway, a style frame from an image model: all of them are legitimate routes when the brief
  has no assets, as long as the result is the subject (not an ornament), is checked at full size, and
  is disclosed where the page claims anything about reality. These services change monthly: look up
  what is current, which have an API, and what a generation costs, before proposing one.
- **Generated models need a pass in Blender** before a browser: reduce to a budget (20 to 80 k
  triangles for a hero), unwrap, bake the light and ambient occlusion into the textures, name the
  parts, export GLB with meshopt and WebP (`stack.md`, "Sourcing assets").
- **A style frame from an image model is a target, not an asset**: it shows the person where the
  build is going. Whatever ships must be made by a route that can hit it.
- **One visual language.** Realistic terrain, glowing sci-fi lines, a contour map and boxed labels in
  one frame is four languages. Choose one material family and one way of drawing information, in
  `docs/bar.md`, before modelling anything.

## 3. What a browser cannot draw live

Say so at the intake, not after three attempts. Rendered live at a quality that stands next to the
board, these do not work, at any budget a page can pay:

- forests, grass, snowfields, mountains and whole landscapes as the subject;
- water, clouds, fog banks, fire, lightning and aurora as the subject;
- a "drone flight" over a real place;
- crowds, animals, faces.

They work as footage, as an offline render, as a painted or illustrated world with one hand, or as a
small stylised model that makes no claim to realism. A procedural version (a heightmap with a
texture, cones for trees, a tube for a river) reads as a tech demo however it is lit, and no shader
pass rescues it. When the brief asks for one of these, the route is row four or five of the table.

## 4. The gates: style frame, vertical slice, then the rest

Three stops where the person looks and answers. Nothing after a gate is built before the gate is
passed. With "just build it", still make each artefact and judge it against the board yourself, and
say in the delivery note which gate decisions you took.

1. **Style frame.** One still of the hero scene at the target quality, made by the chosen route (a
   Blender render with the real assets, a photograph, a generated frame marked as a target). Put it
   beside the closest board frame:
   `node <skill>/scripts/board.mjs pair .stagecraft/style/hero.png .stagecraft/board/<name>/03.png`
   Show the pair and ask: is this the level and the look? If no still can be made that holds up
   next to the board, the site will not either: change the route or the concept now.
2. **Vertical slice.** One scene finished end to end in the browser: the hook, the scene at its stop,
   its signature interaction, one transition out, with real copy, on the real GPU. Capture it with
   `frames.mjs`, pair three frames with the board, show them. Polishing happens here, once.
3. **The rest**, built to the slice. Each further scene is paired with the board before the next.

At every gate say what is weakest before the person has to find it. Never describe your own frames
as impressive, beautiful or good-looking: say what changed and what still falls short.

## 5. Asking for access

The route often needs something the session does not have: a key for a 3D or video generation
service, a font licence, the client's photographs, a model from the manufacturer. Ask for it, in one
message, with what it buys and a rough cost, and wait. Do not quietly fall back to what can be coded
without it; that fallback is the failure this file exists to stop.

- Keys go in environment variables (`TRIPO_API_KEY`, `FAL_KEY`, …), never in the conversation or
  the repo.
- Name a paid route and a free one where both exist (a generated model; a CC0 scan of the same kind
  of object), and say what the free one costs in fidelity.
- Each generation costs money: state the plan (how many frames, models, seconds of video) and get a
  yes before spending.
- If access is refused, say what the site can honestly be without it (row eight is always
  available) and let the person choose. Do not attempt the expensive look with cheap means.

## 6. Judging against the bar

- **Full size or not at all.** Contact sheets are for structure and timing only. Every judgment
  about quality is made on a 1:1 frame; thumbnails hide exactly the crudeness a visitor sees.
- **Against the board, not against yesterday.** "Better than the last version" is not a finding. Pair
  the frame with a board frame and name the three largest differences in material, light and
  composition.
- **No defects is not quality.** A frame with no seams, no black pixels and no overlapping labels can
  still be amateur. After the bug hunt, ask the board question again.
- **Look at the frame the person will complain about.** Mid-transition, the far end of a scene, the
  moment after a move: check those before the hero.
- **After a fix, re-capture the reported frame**, not a neighbouring one, before saying it is fixed.

## 7. Hard-won mechanics

Each of these cost hours once.

- **Never seek a video per scroll event.** `currentTime` writes decode from the previous keyframe and
  stutter in every browser. Scrubbed motion is an image sequence held in memory (decoded
  `ImageBitmap`s drawn to a canvas, 1280 to 1920 px wide, 24 to 30 frames per second of move, loaded
  one move ahead), or a video that plays natively towards a target time and holds there.
- **The scroll stays in control.** A clip that starts on its own and runs to the next stop takes the
  page away from the visitor. Motion advances when they scroll, stops when they stop, reverses when
  they go back.
- **Footage to live 3D is the hardest cut on the web.** Matching camera, field of view, colour,
  lighting and animation phase frame for frame took a day and still showed. Prefer one medium per
  scene; change medium behind a designed cover (fog, a wipe, darkness, a moving edge), never on a
  bare cut or a crossfade (moving parts ghost).
- **Small scenes, designed transitions.** A few compact art-directed scenes joined by moves beat one
  large world: each can be finished, lit and framed, and nothing far away has to hold up.
- **Compile and upload before the scene is seen.** The first frame of a WebGL scene compiles shaders,
  uploads textures and prefilters the environment: 250 to 450 ms on a laptop. Do it behind the
  previous scene or the cover (`renderer.compileAsync`, `initTexture`), with a timeout so a browser
  that never reports done does not hold the page on its poster.
- **Bloom spreads every broken pixel.** One NaN (a zero-length normal, `pow` of a negative, a
  compressed normal map decoding to zero) becomes a black square with a halo. Clamp what goes into
  `pow` and `normalize`, and when a glow looks wrong, hide each mesh in turn before touching the look.
- **`customProgramCacheKey` per material** when `onBeforeCompile` adds uniforms: three reuses a
  cached program without calling the hook again, and the second material's uniforms stay unbound.
- **A software renderer is not a GPU.** Check the renderer string and give SwiftShader and llvmpipe
  the composed version (`performance.md`, "Software GL").
- **Heavy offline renders block the same GPU.** Frame times measured while Blender renders in the
  background are meaningless; stop it before measuring or showing.
