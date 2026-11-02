# UX and accessibility floor

Usability is 30 % of a jury score and the easiest 30 % to lose: a nav that hides, a scroll that
fights, a focus ring that vanishes under a custom cursor. Nothing here is optional, and most of it is
checked by the test suite.

## Navigation

- The primary nav is visible on desktop (not behind an icon) unless the direction is Volume or
  Cinema, where a pill "Menu" button is acceptable and the menu opens as a full panel.
- The logo links home; the current page is marked (`aria-current="page"`, and a dot or underline).
- A skip link is the first focusable element and works with smooth scroll (moves focus and scrolls
  immediately). Its target (`<main>`) carries `tabindex="-1"` so browsers can focus it; the
  `lenis-gsap.ts` helper handles the jump with or without smooth scroll.
- Sticky headers shrink or hide on scroll down and return on scroll up; they never cover the focused
  element (`scroll-padding-top` equals the header height).
- Anchor navigation for chapters (progress rails, dots) uses real links.
- Back and forward work after client-side transitions; scroll position restores on back.
- The 404 page is designed (it is a tagged category on award galleries for a reason): same direction,
  one line, a way home.

## Keyboard and focus

- Every interactive element reachable by Tab, in reading order; pinned and horizontal sections
  included (the document stays scrollable, ScrollTrigger does not trap).
- Visible focus: a 2 px ring in `--ring` with a 2 px offset, on `:focus-visible`, never removed; a
  custom cursor must not be the only hover affordance.
- Escape closes menus and dialogs; focus returns to the opener.
- Draggable things (carousels, cards) have buttons too (WCAG 2.5.7).
- Space, PageDown, arrows and End scroll the page; no scroll hijack. Snap only on Poster desktop.

## Touch and small screens

- Targets at least 44 x 44 px (the WCAG minimum is 24 px; 44 is the bar on these sites), rows in index
  lists at least 48 px tall.
- No hover-only content: previews, labels and controls appear on tap or are inline.
- No custom cursor, no magnetic effects, no mouse-parallax on touch (`(pointer: coarse)`).
- Horizontal chapters unroll vertically; marquees and tickers are shorter.
- Works at 320 px wide without horizontal scroll and at 200 % zoom (test at 640 px wide, 2x).
- `100svh` heroes; nothing important inside the bottom 80 px where browser chrome lives.

## Motion and vestibular safety

- `prefers-reduced-motion` honoured in CSS and JS (see `motion.md`): no parallax, no scrubbed
  large movement, no autoplay, no loops, no flashing; fades stay.
- Autoplaying video, marquees and looping scenes longer than 5 s have a pause control (WCAG 2.2.2).
- No more than three flashes per second anywhere (2.3.1), including glitch effects.
- Scroll-linked effects move elements less than 10 % of the viewport per 100 px of scroll.

## Reading

- `lang` on `<html>`; one `h1`; headings in order; landmarks (`header`, `nav`, `main`, `footer`).
- Images with real `alt` (empty for decorative); icons with labels; SVG with `role="img"` and
  `<title>` when meaningful.
- Decoded or scrambled text keeps the final string in the DOM (`aria-label` or visually-hidden copy).
- Contrast per `color.md`; text on media has a scrim.
- Links look like links in body copy (underline or colour plus underline on hover); buttons look
  like buttons.

## Forms and states

- Native inputs with labels (not placeholders as labels), `autocomplete`, inline validation on blur,
  error text linked by `aria-describedby`, a success state that confirms what happened.
- Submit buttons show a loading state and do not double-submit.
- Contact: a real email link alongside any form.
- Empty, loading and error states exist for anything that fetches.

## Consent, analytics, cookies

- No modal over the hero. A small card bottom-left or a bar, after idle, with equal-weight accept
  and decline. Analytics load after consent only; prefer a privacy-first script that needs none.

## SEO and sharing

- Unique `<title>` (name, two to four words) and `meta description` per page; canonical; Open Graph
  and Twitter card with a designed 1200 x 630 image that uses the hero's still (not the canvas);
  `theme-color` matching the first chapter; a favicon set; `robots` and `sitemap`.
- All copy is real HTML text (not canvas, not images of text), so it is indexable and readable.

## Copy honesty

Never invent metrics, clients, logos, testimonials or awards. Use `[copy to confirm]` placeholders,
a labelled grey block for a missing logo, and a different section type if there is no proof to show.
A fabricated "trusted by 50,000 teams" is the fastest way to lose a client's trust and a jury's.

## Internationalisation

If more than one language: `hreflang`, a visible switcher (not flags), fonts with the needed
glyph coverage (CJK and Cyrillic need their own faces), `text-wrap` and hyphenation per language,
dates and numbers localised, RTL mirrored layout when relevant.
