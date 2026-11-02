# Colour

High-end sites use fewer colours than they appear to: near-black and near-white, one accent, warm greys,
and then the *media* supplies the colour. Chapter-shift sites change the whole palette per chapter
but still obey the one-accent rule inside each chapter.

## Token model

Semantic tokens, with raw values behind them, in OKLCH so lightness steps are even and the accent
can be rotated by hue for variations.

```css
:root {
  /* raw */
  --ink-950: oklch(14% 0.01 270);
  --ink-800: oklch(22% 0.01 270);
  --paper-100: oklch(96% 0.012 80);
  --paper-200: oklch(92% 0.016 80);
  --accent-500: oklch(78% 0.19 120);      /* lime; rotate hue for red 25, blue 265, violet 300 */
  /* semantic */
  --bg: var(--paper-100);
  --bg-raised: var(--paper-200);
  --fg: var(--ink-950);
  --fg-muted: color-mix(in oklch, var(--fg) 62%, transparent);
  --fg-faint: color-mix(in oklch, var(--fg) 40%, transparent);
  --line: color-mix(in oklch, var(--fg) 12%, transparent);
  --line-strong: color-mix(in oklch, var(--fg) 24%, transparent);
  --accent: var(--accent-500);
  --accent-ink: var(--ink-950);           /* text colour on the accent */
  --scrim: color-mix(in oklch, var(--ink-950) 72%, transparent);
  --ring: color-mix(in oklch, var(--accent) 70%, transparent);
}
[data-theme="ink"] { --bg: var(--ink-950); --bg-raised: var(--ink-800); --fg: var(--paper-100); }
```

Every colour in components references a semantic token. A raw value inside a component is a bug:
it breaks chapter themes and dark mode at once.

One trap: a derived token (`--fg-muted`, `--line`) declared on `:root` is computed with the
`:root` value of `--fg`, not the chapter's. Inside a `[data-theme="paper"]` chapter the muted text
then stays "64 % of the dark-theme foreground" and vanishes on paper. Declare derived tokens on
every scope that redefines the base, e.g. `:root, [data-theme] { --fg-muted: color-mix(...) }`,
placed after the theme blocks, so each chapter recomputes them from its own `--fg`.

## Palettes seen on high-end sites

| Name | bg | fg | accent | Notes |
|---|---|---|---|---|
| Ink and lime | `#282c20` | `#f4f4ed` | `#d2ff00` | dark green instead of black; lime on cream for CTAs |
| Lavender signal | `#f5efff` | `#2a1647` | `#9047ff` | light with a deep purple ink; one violet |
| Paper and pen | `#f2f0ea` | `#282828` | `#fa3600` | grain at 4 %; hairlines `#b3b3af` |
| Night and brass | `#07070a` | `#f3eee3` | `#d0a955` | brass only on rules and one word |
| Cork and cream | `#100904` | `#ffedd7` | chapter glow | palette shifts per chapter |
| Pale cell | `#f0f1fa` | `#000` | `#1a2ffb` and `#c1ff00` | two accents allowed because they live inside the 3D |
| Stencil red | `#cf1830` | `#fff` | `#6db1f0` | red as the base, text in red on white elsewhere |
| Warm off-white | `#f8f6f2` | `#111` | none | the Quiet palette |
| Studio black | `#111010` | `#edeae4` | `#2f6bff` | one blue dot for the active state |

Near-black beats `#000` on a page (`#08090a`, `#0d0e13`, `#111010`); true black belongs to Cinema
where the page is a screen. Warm greys (`#e4e0db`, `#cdc6be`) beat cold greys for editorial tone.

## Contrast floor

Body text 4.5:1, large text (24 px, or 19 px bold) 3:1, UI boundaries 3:1, focus ring 3:1 against
its surroundings. Check text over media on three frames (start, middle, end of a video; three stops
of a gradient). `fg-muted` at 62 % of the ink on paper is about 4.6:1; do not go fainter for body
copy. The accessibility spec runs axe with colour-contrast enabled and fails on serious issues.

## Dark and light

Support both when the direction is neutral (Specimen, Swiss, Archive, Quiet): tokens under
`@media (prefers-color-scheme: dark)` and a `data-theme` override with a toggle that persists. Keep
the accent the same in both; shift `--bg` and `--fg` only. Directions with a fixed mood (Luxe
dark, Atelier paper, Cinema black) ship one scheme and set `color-scheme` accordingly so form
controls match.

## Chapter-shift colour

Give each chapter `data-theme` and tokens; register `--bg` and `--fg` with `@property` so they can
crossfade; the header reads the chapter under it with an IntersectionObserver and swaps its own
theme (or uses `mix-blend-mode: difference` for a logo that always contrasts). Keep the accent fixed
across chapters unless the direction is Afterglow, where the accent *is* the chapter.

## Variations by colour alone

Rotating the accent hue, swapping ink for paper, and switching between warm and cold neutrals
produces a visibly different site with no layout change. Use this for the cheapest "show me another
version" request; do not sell it as a different direction.
