// Mira Solberg is a fictional person; every project here is invented for the demo.

export const person = {
  name: 'Mira Solberg',
  title: 'Design engineer',
  city: 'Oslo',
  tz: 'Europe/Oslo',
  available: 'March 2027',
  email: 'hello@mirasolberg.example',
  statement: 'I build the part of the product people actually touch: the interface, the motion, the details that make it feel finished.',
  since: 'Studio of one since 2022; before that five years at a product studio.',
  tools: 'TypeScript, React, Astro, GSAP, Figma.',
  aside: 'Talks at two meet-ups a year. Reads typography books on trains.',
  principles: ['Measure on a cheap phone.', 'Motion explains or it goes.', 'Ship the accessible version first.'],
};

export type Project = { n: string; slug: string; title: string; client: string; year: number; role: string; line: string; kind: string; accent: string };

export const work: Project[] = [
  { n: '01', slug: 'ledger', title: 'Ledger', client: 'Fintech', year: 2026, role: 'Design engineer', line: 'A transaction timeline that reads like a receipt and scrolls like one.', kind: 'receipt', accent: '#2f6bff' },
  { n: '02', slug: 'meridian', title: 'Meridian', client: 'Mapping start-up', year: 2026, role: 'Motion and front-end', line: 'Route animations that explain the route instead of decorating it.', kind: 'route', accent: '#e4572e' },
  { n: '03', slug: 'kaldt', title: 'Kaldt', client: 'Outdoor brand', year: 2025, role: 'Front-end lead', line: 'A product configurator with zero spinners.', kind: 'configurator', accent: '#2a9d8f' },
  { n: '04', slug: 'tide', title: 'Tide', client: 'Calendar app', year: 2025, role: 'Design engineer', line: 'Drag that feels like paper: physics tuned on 40 phones.', kind: 'calendar', accent: '#8a5cf6' },
  { n: '05', slug: 'brygge', title: 'Brygge', client: 'Hospitality group', year: 2024, role: 'Front-end', line: 'Booking in three taps, measured not assumed.', kind: 'booking', accent: '#c98a2e' },
  { n: '06', slug: 'skarv', title: 'Skarv', client: 'Timing hardware', year: 2024, role: 'Design engineer', line: 'A dashboard that stays readable at 40 km/h.', kind: 'dashboard', accent: '#15161a' },
  { n: '07', slug: 'nord', title: 'Nord', client: 'Publisher', year: 2023, role: 'Front-end', line: "A reading experience that respects the reader's thumb.", kind: 'reader', accent: '#b8432f' },
  { n: '08', slug: 'spor', title: 'Spor', client: 'Transit authority', year: 2023, role: 'Design engineer', line: 'Live departures with a one-second budget.', kind: 'departures', accent: '#1f7a4d' },
];

export const ledger = {
  problem: 'Statements were a wall of rows; people could not find one payment.',
  role: 'Design engineer, with one designer and two back-end engineers, eleven weeks.',
  craft: 'A timeline grouped by day with a sticky date rail, amounts set in tabular figures, category colour as a thin edge rather than a chip, a search that filters as you type without layout shift, keyboard navigation through rows, and reduced-motion variants of every transition.',
  outcome: "Support tickets about 'finding a payment' dropped by half in the first month, measured by the client's support team.",
  rows: [
    { day: 'Mon 27 Oct', items: [['Kaffebrenneriet', 'Food', '-48.00'], ['Ruter månedskort', 'Transport', '-879.00'], ['Salary', 'Income', '+41,200.00']] },
    { day: 'Tue 28 Oct', items: [['Meny', 'Groceries', '-612.40'], ['Spotify', 'Subscriptions', '-129.00']] },
    { day: 'Wed 29 Oct', items: [['Vinmonopolet', 'Groceries', '-289.90'], ['Oslo Kino', 'Culture', '-170.00'], ['Fjellsport', 'Outdoor', '-1,499.00']] },
    { day: 'Thu 30 Oct', items: [['Bysykkel', 'Transport', '-49.00'], ['Deli de Luca', 'Food', '-112.00']] },
    { day: 'Fri 31 Oct', items: [['Rent', 'Housing', '-14,500.00'], ['Elkjøp', 'Hardware', '-2,290.00'], ['Refund: Elkjøp', 'Income', '+2,290.00']] },
  ],
};
