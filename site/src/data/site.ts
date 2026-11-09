export const repo = 'https://github.com/r33hab/stagecraft';
export const version = '1.1.0';

// The sixteen directions, reduced to what a specimen card can show with three loaded faces.
export const directions = [
  { name: 'Monolith', feel: 'A wall of type. Black, off-white, one hot accent, hard cuts.', bg: '#0f0f0e', fg: '#ecebe6', accent: '#ff4d1f', face: 'sans', weight: 800, caps: true, sample: 'Built loud. Shipped fast.' },
  { name: 'Editorial', feel: 'A magazine spread: a serif that talks, a grotesk that explains.', bg: '#f4efe6', fg: '#1c1b19', accent: '#b8873b', face: 'serif', weight: 400, caps: false, sample: 'The quiet chapter, then the loud one.' },
  { name: 'Cinema', feel: 'Full-bleed film; scroll is the timeline; a dial marks progress.', bg: '#050506', fg: '#f1efe9', accent: '#ff9a4a', face: 'sans', weight: 700, caps: true, sample: 'Golden hour, frame by frame.' },
  { name: 'Specimen', feel: 'A technical sheet: mono labels, corner marks, readouts.', bg: '#0b0c0e', fg: '#eceae3', accent: '#ff5a1f', face: 'mono', weight: 500, caps: true, sample: 'Sample 014 · tolerance 0.02 mm' },
  { name: 'Atelier', feel: 'Warm paper, grain, drawn lines; nothing snaps.', bg: '#f3eee6', fg: '#2a2421', accent: '#b9643f', face: 'serif', weight: 400, caps: false, sample: 'Oak, linen and a slow afternoon.' },
  { name: 'Afterglow', feel: 'Dark with light from inside; every chapter changes temperature.', bg: '#120a1f', fg: '#fbe9d6', accent: '#7c5cff', face: 'sans', weight: 800, caps: false, sample: 'Warm light from somewhere inside.' },
  { name: 'Swiss', feel: 'The modular grid on display, justified statements in two weights.', bg: '#ffffff', fg: '#0a0a0a', accent: '#e4002b', face: 'sans', weight: 500, caps: true, sample: 'Grid first. Opinion second.' },
  { name: 'Playground', feel: 'Colour, stickers, tickets, springs, things you can drag.', bg: '#ffd23f', fg: '#1d1d1b', accent: '#2b59ff', face: 'sans', weight: 800, caps: true, sample: 'Drag me somewhere nice.' },
  { name: 'Luxe', feel: 'Slow, cream or black, one metallic, serif at scale.', bg: '#0d0c0b', fg: '#efe8db', accent: '#c9a35b', face: 'serif', weight: 400, caps: false, sample: 'Measured in decades.' },
  { name: 'Volume', feel: 'The page is a 3D object; scroll moves the camera.', bg: '#eef0f6', fg: '#0b0b12', accent: '#3a4cff', face: 'sans', weight: 600, caps: false, sample: 'Turn it over. Look closer.' },
  { name: 'Archive', feel: 'An index: lists, counts in parentheses, hover previews.', bg: '#121212', fg: '#e9e6df', accent: '#4f7dff', face: 'sans', weight: 800, caps: true, sample: 'Index (24)' },
  { name: 'Poster', feel: 'Every section is a poster: a giant word, a tilted photo stack.', bg: '#f1f0ea', fg: '#121212', accent: '#ff3b2f', face: 'sans', weight: 800, caps: true, sample: 'Nº 07' },
  { name: 'Kinetic', feel: 'Type is the subject: letters warp, stretch and recombine.', bg: '#1e1e1e', fg: '#fafafa', accent: '#c8f169', face: 'sans', weight: 400, caps: true, sample: 'Words that move with you' },
  { name: 'Blueprint', feel: 'Drawings that draw themselves, on paper with an orange pen.', bg: '#f1efe8', fg: '#23262b', accent: '#ff5b14', face: 'mono', weight: 500, caps: true, sample: 'Section A-A · scale 1:50' },
  { name: 'Horizon', feel: 'Chapters side by side on a pinned stage with a progress rail.', bg: '#1f2a24', fg: '#eef0e8', accent: '#b8f23a', face: 'sans', weight: 700, caps: true, sample: 'Leg 03 of 07' },
  { name: 'Quiet', feel: 'Two colours, one type size, whitespace as the design, one move.', bg: '#f7f5f1', fg: '#151515', accent: '#151515', face: 'sans', weight: 400, caps: false, sample: 'Less, but on purpose.' },
];

export const questions = [
  { q: 'What is the site for?', a: ['Launch or campaign', 'Portfolio or studio', 'Product or company', 'Story or report'] },
  { q: 'Who updates it after launch?', a: ['A developer, rarely', 'Non-developers, often', 'It lives in an existing codebase'] },
  { q: 'How far should the motion go?', a: ['Expressive', 'Cinematic', 'Composed'] },
  { q: 'Pick a feel', a: ['Three or four directions, in plain words', 'Show me three and I will choose'] },
  { q: 'Where will people mostly see it?', a: ['On a computer', 'Everywhere, about equally', 'Mostly on phones'] },
];

export const build = [
  ['Static frame first', 'Full HTML and CSS with every end state visible. It must already look designed on a 390 px phone before any motion exists.'],
  ['Tier the device', 'A tiny script sets low, mid or high before first paint. Low tier gets the still, the fades and native scroll; high tier gets everything.'],
  ['Motion layer', 'One carrier through the chapters, every change a moving edge, copy that holds long enough to read, then the one signature moment. Reduce under reduced motion; never remove.'],
  ['Media after paint', 'AVIF and sizes, posters before video, scenes and sequences as lazy chunks behind the tier check. The headline is the LCP element.'],
  ['Chrome', 'Visible nav, skip link, focus ring, a designed 404, share image, consent off the hero.'],
  ['Watch, test, deliver', 'The page is filmed at reading pace and judged frame by frame; the suite runs on five browsers; the delivery note carries the numbers.'],
];

export const suite = [
  ['smoke', 'routes load, one h1, lang, title, description, main landmark, no console errors, no failed requests'],
  ['responsive', 'no horizontal overflow at seven widths, touch targets on mobile'],
  ['a11y', 'axe WCAG 2.2 AA at top and after scroll, keyboard order, focus visibility, skip link, menu escape'],
  ['motion', 'never-stuck reveals, layout stability, keyboard scrolling, preloader timing, cursor on touch, reduced motion'],
  ['perf', 'LCP, CLS, long tasks, scroll frame p95, bytes by type, font families, DOM size, hero image on a throttled low-end profile'],
  ['reading', 'scrolls at reading pace and fails copy that leaves before it can be read, empty screens between chapters, and copy stacked on copy'],
  ['visual', 'baselines at top and mid-page on desktop and mobile with animations disabled'],
];

export const budgets = [
  ['LCP', '2.5 s', 'mobile-low, 4x CPU, slow 4G'], ['CLS', '0.1', 'after a full scroll'], ['Initial JS', '170 KB gzip', 'lazy 3D chunk excluded'],
  ['Scroll frame p95', '34 ms', 'under 4x throttle'], ['Fonts above the fold', '2 files, 150 KB', 'WOFF2, subset'], ['First view, mobile', '2.5 MB', '1.5 MB before LCP'],
  ['Preloader', '2.5 s cap', 'skipped on repeat visit'], ['DOM nodes', '2500', 'per page'], ['Scroll length', '12 screens', 'per route; a warning unless set'],
];

export const weights = [
  ['Framed WebGL studio hero', '300 KB JS, 0.5 MB first view', '10 to 15 MB when 3D and video load eagerly'],
  ['Portfolio index', '180 KB JS, 0.6 MB, 250 nodes', '26 MB when every project image is preloaded'],
  ['Builder marketing page', '220 KB JS, 14 script tags', '1.2 MB with four analytics tags and a chat widget'],
  ['Product story', '540 KB JS, 0.8 MB', '2 MB with 973 KB of scripts'],
];

// The landing's doors: each is a page of its own, and the shared element that carries into it.
export const doors = [
  { slug: 'method', name: 'Method', title: 'The order that keeps motion honest', promise: 'Static frame, device tiers, the motion layer, media after paint, chrome, then tests and a critique. Six steps that keep a site fast while it gets ambitious.', meta: '6 steps' },
  { slug: 'directions', name: 'Directions', title: 'Sixteen recipes, side by side', promise: 'From Monolith to Quiet: surface, type, colour, layout, motion signature, hero and mobile translation for each, plus the remix axes that make hundreds more.', meta: '16 directions' },
  { slug: 'suite', name: 'Suite', title: 'The review checklist as assertions', promise: 'Seven specs across five browser projects, run against the production build, with the budgets this site is held to and its own numbers.', meta: '7 specs · 19 budgets' },
  { slug: 'compare', name: 'Compare', title: 'Three briefs, built twice', promise: 'The same brief and the same model, with the skill and without it, measured by the same suite and shown side by side.', meta: '3 pairs, measured' },
];

// The example sites the skill built, filmed as loops for the docked frame on the landing (public/reel/).
export const reel = [
  { slug: 'story', title: 'Halde 8', kind: 'Story · a 1958 cine camera, restored', path: 'demos/story/' },
  { slug: 'nordlys', title: 'Nordlys GP', kind: 'Launch · a racing team, season 2027', path: 'demos/nordlys/' },
  { slug: 'portfolio', title: 'Mira Solberg', kind: 'Portfolio · a design engineer in Oslo', path: 'demos/portfolio/' },
];
