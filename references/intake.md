# Intake: questions nobody can answer wrong

The brief decides the stack, the direction and the motion budget. The person answering is usually
not a front-end engineer, so the questions ask about their *situation*, never about tools. A wrong
tool choice is the most expensive mistake on a site like this (a client-rendered app for a brochure,
a no-code builder that cannot be tested, a dead scroll library), so the skill makes that choice from
the answers below and states it in one line. Framework names appear in the conversation only if the
person asks.

Four core questions, and two more (Q5, Q6) whenever the brief is ambitious or has more than one
subject. Four is the size of one `AskUserQuestion` call, not a cap: ask what the brief leaves
open, in rounds of at most four, every option safe, the recommended option first. If the brief
already answers a question, skip it. If the person says "just build it", take every default and
say which defaults you took. The answers are what make the result look made for them rather than
generated, so a question the brief leaves open is worth asking.

## Facts to collect silently first

Read the brief, the repo and any attached files for these before asking anything. Ask only for
what is missing *and* material; otherwise proceed with a clearly marked placeholder.

| Fact | Where it usually is | If missing |
|---|---|---|
| Name and one-line "what it is" | brief, README, package.json | ask in plain words ("What is it, in one sentence?") |
| Audience and the one action you want from them | brief | assume "contact / buy / read on" by site type |
| Existing brand (logo, colours, fonts) | repo assets, brand PDF, screenshots | none: the direction supplies them |
| Content on hand (copy, photos, video, 3D model) | attachments, `public/`, CMS | placeholders labelled `[copy to confirm]`, never invented metrics |
| Existing codebase | the working directory | greenfield |
| Languages | brief | one |
| Analytics / consent needs | brief | none; note that a consent dialog on first view is a design problem, see `ux.md` |

## The questions

### Q1. What is the site for?

| Option | Means | Drives |
|---|---|---|
| **Launch or campaign** | one page, one moment, one thing to announce or sell | one-page story, heaviest motion allowed, hard end CTA |
| **Portfolio or studio** | show work and the people behind it | index + case studies, image-led, transitions between pages matter |
| **Product or company** | explain an offer across several pages and convert | pinned product stages, proof sections, forms, CMS likely |
| **Story or report** | a long read with chapters (annual report, documentary, explainer, launch essay) | chaptered scroll, progress rail, data as narrative, reading comfort first |

### Q2. Who updates it after launch?

| Option | Means | Drives |
|---|---|---|
| **A developer, rarely** (recommended) | content lives in the repo | static build, content files, no CMS runtime |
| **Non-developers, often** | needs an editor with preview | static build + headless CMS |
| **It lives in an existing codebase** | fit into what is there | keep their framework, add the motion layer in its idiom |

### Q3. How far should the motion go?

| Option | Means | Drives |
|---|---|---|
| **Expressive** (recommended) | typography, reveals, transitions and one signature moment do the work; no 3D | GSAP + CSS, full performance budget met on every tier |
| **Cinematic** | 3D, video or full scroll scenes are welcome | WebGL or video path, loaded after first paint, gated by device tier, with a 2D fallback that is still good |
| **Composed** | calm, fast, premium restraint | CSS-first motion, one or two moves, lightest page |

No option produces a bad site. "Cinematic" still ships a fast 2D version to a low-end phone; "Composed"
still has a signature moment.

### Q4. Pick a feel

Offer three or four directions from `directions.md`, pre-filtered by Q1 and Q3, each as a plain
two-line description of what the visitor would see (no jargon), plus a last option
**"Show me three and I'll choose"**. When they pick that, run the variations protocol in
`directions.md` and present three contrasting static hero sketches in words before building.

### Q5. What is the one thing worth showing?

Ask this whenever Q3 is Expressive or Cinematic, or the brief says wow, award, immersive, cinematic
or memorable. It fixes the signature moment before any code, and it keeps the signature attached
to the subject. The answer is always *content*: the product, the place, the data, the mechanism,
the work. A hero that shows an ornament (a floating letter, a logo, an abstract blob, a generic
object) has no story and fails this question whatever its material pipeline.

| Option | Means | The skill then ships |
|---|---|---|
| **The product itself** | there is a physical or digital thing to show (a car, a ring, an interface, a building) | a material-based three.js hero of that thing (`assets/runtime/hero-scene.ts` with the product's outline or model), lazy, tier-gated, with a still for low tier; scroll turns, opens or explains it |
| **The place or the moment** | a landscape, a sky, a night, a room, a race | a full-screen scene (shader or pre-rendered video) whose parameters the scroll owns (moves 9, 19); the copy is the narration |
| **How it works** | a mechanism, a route, a process, a method | a scrubbed transformation: draw-on, disassembly, a stage whose states are the steps (moves 3, 5, 12) |
| **The body of work** | many projects, chapters or products | a journey: a handoff into horizontal chapters, an index with live previews, a camera through the collection (moves 1, 4, 13) |

"Surprise me" is allowed: pick the one the content supports best and say which. If none of the
four applies, the site has no signature and the skill says so instead of inventing an object.

### Q6. How should people move through it?

Ask this when the content has more than one subject (a product and a method and a team and a
comparison), or when the brief lists more than six sections. One long scroll is a fine answer for
a launch with one thing to say; for anything with several subjects it buries the one a visitor
came for behind twenty screens, and every stage multiplies that.

| Option | Means | Drives |
|---|---|---|
| **A landing that routes into pages** (recommended for several subjects) | the landing carries the signature, the claim and the doors; each subject is its own page | page map in `ux.md`, shared-element transitions from door to page, nav as the index |
| **One page, one scroll** | one story, read top to bottom | the arc in `story.md`; chapters capped by the reading-time rule; scroll length printed by the suite |
| **Chapters as pages** | each chapter is a full page and the move between them is the choreography | page transitions as camera moves (`choreography.md`), a progress rail across pages, keyboard next and previous |

The suite prints `scroll length (screens)` for every route; past 12 on a landing it warns, and
the skill brings this question back rather than adding chapters.

### Q7. What is there to show?

Ask this on every brief that is Expressive or Cinematic. The material decides how the frames are
filled; motion moves the material and cannot stand in for it.

| Option | Means | The skill then does |
|---|---|---|
| **Photography or illustration** | a shoot, a library, commissioned art, at least a dozen strong frames | builds the chapters on the images: full bleed to card, collage at three depths, masks, windows; asks for the originals, never stock |
| **The product or a model of it** | the object itself to photograph, a GLB, a scan or CAD export, or a CC0 scan of the same kind of object | `assets/runtime/hero-scene.ts` loads it under studio light as the carrier; or it is rendered once and shipped as a loop or a baked image sequence (`stack.md`, "Sourcing assets") |
| **Footage or the work itself** | video, a product demo, pages or an app that can be recorded | `scripts/film.mjs` films the pages as seamless loops; the clips play inside a frame that is the carrier, or full bleed when filmed text-free (`stack.md`, "Filming the work") |
| **Nothing yet** | no imagery exists | the skill works with what can be made honestly: the work drawn (a wireframe that becomes the finished page, line art that draws itself), type at display scale over a strong colour system, CC0 scans when the subject is a physical thing; it never builds the subject from primitives and never invents imagery that pretends to be the client's |

Then three rules that follow from the answer, whatever it is (numbers in `craft.md`):

- **A hook in the first three seconds.** The subject moving before anything to read: a loader that
  is the first scene and becomes the hero, or no loader.
- **A carrier through the chapters.** One thing stays and changes; chapters arrive over each other by
  a moving edge, never by fading to an empty colour.
- **Details from the subject only.** A spec readout for a product with specs, a signature for a
  person, labels on the objects in a scene. Props borrowed from a metaphor for the name (a theatre
  for a product called "stage", a ship for one called "harbour") are decoration and read as a costume.

### Q8. Where will people mostly see it?

Ask it whenever the brief does not say. "Fine on a phone" in a brief is an answer; so is a link that
will be shared on social media (phones). Never assume every site must run its full version on a
cheap phone: a showcase for a desktop audience can spend more on the computer and show a composed
version on phones.

| Option | Means | The skill then does |
|---|---|---|
| **On a computer** | a showcase, a tool or a studio site most people open at a desk | the full experience on desktop (WebGL scenes, longer pins, hover); phones get a composed version with the same copy and the same page map (still frames, shorter stages, no heavy scene); the budgets file says `"platform": "desktop-first"`, so the mobile-low perf budgets warn instead of failing; accessibility, reading time and layout on phones still gate |
| **Everywhere, about equally** (default) | most marketing and story sites | one design that works on both; every budget gates on mobile-low as written in `performance.md` |
| **Mostly on phones** | a campaign shared on social, an event, a product people meet on the go | design at 390 px first, touch gestures before hover, no pinned horizontal sections, WebGL only as a poster or video; budgets as written, and the desktop layout is the phone design given room |

## From answers to decisions

### Stack (never asked, always stated in one line)

| Q2 | Q1 | Q3 | Stack |
|---|---|---|---|
| existing codebase | any | any | their framework; motion layer in its idiom (see `stack.md`, "Fitting into an existing codebase") |
| developer | launch or campaign | expressive or composed | Astro, static, zero islands unless needed |
| developer | launch or campaign | cinematic with a whole-page 3D scene | Vite + TypeScript, one page, scene lazy-loaded |
| developer | portfolio or studio | any | Astro + content collections + client router transitions |
| developer | story or report | any | Astro + MDX chapters |
| developer | product or company | any | Astro + content collections; Next.js only if the brief mentions accounts, dashboards or an app |
| non-developers | any | any | Astro + headless CMS (Sanity by default; Keystatic when "a few pages and Git is fine") |
| non-developers | product or company with accounts or an app | any | Next.js + headless CMS, animation isolated in lazy client islands |

State it like: "I'll build this as a static site with a content folder you edit as Markdown; it is
the fastest option for phones and the simplest to host." If they push back or name a tool, use their
tool and keep every budget and test.

### Direction shortlist by Q1 and Q3

| | Composed | Expressive | Cinematic |
|---|---|---|---|
| Launch or campaign | Quiet, Luxe, Swiss | Monolith, Kinetic, Poster, Afterglow | Volume, Cinema, Playground |
| Portfolio or studio | Archive, Quiet, Editorial | Specimen, Swiss, Monolith, Atelier | Volume, Horizon, Cinema |
| Product or company | Swiss, Atelier, Blueprint | Specimen, Editorial, Afterglow | Cinema, Volume |
| Story or report | Editorial, Quiet | Blueprint, Atelier, Kinetic | Cinema, Horizon |

### Motion tier ceiling

| Q3 | Allowed on tier high | Allowed on tier mid | Allowed on tier low |
|---|---|---|---|
| Composed | CSS transitions, 1 scrubbed scene, view transitions | same | fades only |
| Expressive | GSAP timelines, pinning, split text, smooth scroll (fine pointer only), 1 canvas effect | GSAP without smooth scroll, no canvas | CSS reveals, no pinning |
| Cinematic | everything incl. WebGL and video scrub | WebGL at DPR 1, no post-processing, or poster video | poster image or video, CSS reveals |

Tier detection is in `assets/runtime/tier.ts`; budgets are in `performance.md`.

## Example exchanges

**Open brief.** "Make me a site for my photography studio, something that wins awards."
Collect: name, work samples in the repo? none. Ask Q2 and Q3 only (Q1 is answered: portfolio), and
Q4 with Archive, Editorial, Cinema, Quiet or "show me three". Say the stack in one line after.

**Over-specified brief.** "Build a Next.js landing page with Framer Motion and a Spline hero."
Do not ask. Say: "Done as asked. Two notes: the 3D hero will load after the first paint and fall
back to a still on low-end phones so the page stays fast, and I'll add the test suite so we can see
the budgets." Then build with their tools.

**Vague mood.** "Dark, techy, premium."
Map to Specimen or Afterglow or Luxe; show the three as two-line sketches; let them pick.
