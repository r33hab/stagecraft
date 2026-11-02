# Intake: four questions nobody can answer wrong

The brief decides the stack, the direction and the motion budget. The person answering is usually
not a front-end engineer, so the questions ask about their *situation*, never about tools. A wrong
tool choice is the most expensive mistake on a site like this (a client-rendered app for a brochure,
a no-code builder that cannot be tested, a dead scroll library), so the skill makes that choice from
the answers below and states it in one line. Framework names appear in the conversation only if the
person asks.

Ask with `AskUserQuestion`, at most four questions in one call, every option safe, the recommended
option first. If the brief already answers a question, skip it. If the person says "just build it",
take every default and say which defaults you took.

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

## The four questions

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
