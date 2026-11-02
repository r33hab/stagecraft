# Typography

Type carries most of the design on sites of this calibre. The pattern is stable:
one or two families, rarely three; a self-hosted grotesk as the workhorse; a serif or a mono as the
accent; a variable font where weight animates; display sizes in `vw` or `clamp()`; and metadata in
mono caps with tracking. Default system fonts and the usual "AI" picks (Inter at 400 for everything,
Roboto, Poppins) read as unconsidered; Inter is fine only as a deliberate product-site choice.

## Choosing

| Role | Count | Picks (free) | Premium swap (by style, for a brand licence) |
|---|---|---|---|
| Workhorse sans | 1 | Inter Tight, Archivo, Manrope, Hanken Grotesk, Geist, Public Sans, Figtree | Neue Montreal / Neue Haas / Aeonik / Lausanne / Suisse / Diatype style |
| Display | 0 or 1 | Bricolage Grotesque, Archivo Black, Anton, Oswald, Syne, Unbounded, Fraunces, Instrument Serif, Playfair Display | Druk / Monument / Editorial New / Saol / Canela style |
| Mono (metadata, labels, specs) | 0 or 1 | Geist Mono, JetBrains Mono, IBM Plex Mono, Space Mono, Fragment Mono | GT America Mono / Replica Mono style |
| Variable for kinetic axes | 1 | Fraunces, Roboto Flex, Inter (opsz, wght), Bricolage Grotesque | any with `wght` and `wdth` axes |

Pairing rules that hold:
- Grotesk + serif is the editorial pairing when each sets whole roles: the serif the headings or the
  long text, the grotesk the rest. Never one phrase of a grotesk headline swapped into the serif.
- Grotesk + mono is the technical pairing.
- Condensed caps display + plain sans is the poster pairing.
- Serif display + light grotesk is the luxury pairing.
- Mono as the *body* face is a legitimate direction (Swiss and Specimen), at 15 to 17 px, line-height 1.5.
- Two loud faces (a condensed display and a kinetic variable) cancel each other.

## Scale

Fluid everywhere; no media-query jumps for type.

```css
:root {
  --text-xs: 0.72rem;
  --text-sm: 0.85rem;
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.1rem, 1rem + 0.4vw, 1.3rem);
  --text-xl: clamp(1.5rem, 1.2rem + 1.2vw, 2.2rem);
  --text-2xl: clamp(2.2rem, 1.6rem + 2.4vw, 3.6rem);
  --text-display: clamp(3rem, 1rem + 8vw, 9rem);      /* 8 vw headline */
  --text-hero: clamp(3.5rem, 16vw, 18rem);            /* type-as-hero, Monolith / Poster */
  --leading-tight: 0.92; --leading-snug: 1.1; --leading-body: 1.5;
  --tracking-display: -0.02em; --tracking-caps: 0.08em;
}
```

Display type above 5 vw gets `line-height` 0.9 to 1.0 and `letter-spacing` -0.02 to -0.04 em;
`text-wrap: balance` on headlines, `text-wrap: pretty` on paragraphs (both progressive). Body
measure 60 to 70 ch. Body never under 16 px on phones; mono labels never under 11 px.

A design-unit scale is a good alternative for poster-like layouts: `--s: calc(100vw / 1440)` and
every size as a multiple of `--s`, clamped at both ends, so the composition scales as one object.

## Loading

- Self-host WOFF2 only. Subset per language with `glyphhanger` or `pyftsubset`; a Latin subset
  of a variable font is usually 40 to 90 KB.
- `font-display: swap` for text faces with `size-adjust`, `ascent-override`, `descent-override`
  on the fallback (`@font-face { font-family: "Inter Tight Fallback"; src: local("Arial"); ... }`) so
  the swap does not shift layout. `font-display: optional` for display faces that are purely a
  flourish.
- Preload only the two faces used in the first viewport:
  `<link rel="preload" as="font" type="font/woff2" href="/fonts/x.woff2" crossorigin>`.
- Wait for `document.fonts.ready` before splitting text or measuring lines.
- Astro and Next both have font pipelines (`astro:assets` fonts API, `next/font`) that subset and
  generate fallback metrics; use them instead of manual `@font-face` when available.

## Rules reviewers notice

- A heading is one family, one colour, roman: emphasis by size, weight or a line break. The headline
  in a grotesk with its last phrase in an italic serif and the accent colour is the most recognisable
  generated-landing tell; high-end sites hold one typographic voice per line.
- Caps labels have tracking; lowercase labels do not.
- One size for all body copy; hierarchy comes from weight and space, not six sizes.
- Numbers in tables and stats use `font-variant-numeric: tabular-nums`.
- Real copy. Lorem ipsum in a screenshot is a disqualifier; use `[copy to confirm]` placeholders in
  the brand voice instead, and never invent metrics, clients or quotes.
- `hanging-punctuation` and `text-wrap: balance` on quotes; hyphenation on narrow columns
  (`hyphens: auto` with `lang` set).
- Type on video or busy imagery sits on a scrim (gradient at 40 to 60 %) or a blurred duplicate of
  the image, and the contrast is checked on three frames.
