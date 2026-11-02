// Nordlys GP is a fictional team. Every name, number and result here is invented for the demo.

export const team = {
  name: 'Nordlys GP',
  tagline: 'We race the dark.',
  base: 'Lillestrøm, Norway',
  founded: 2024,
  car: 'NX-27',
  season: 2027,
};

export const drivers = [
  { num: 27, name: 'Sigrid Haugen', born: 'Bergen, 2001', role: 'Race driver', debut: 2025, starts: 48, podiums: 6, wins: 1, best: 'P1, Monza 2026', bio: 'Karting champion at fourteen, Formula 2 runner-up in her second season, and the first driver signed by the team. Drives late on the brakes and talks early on the radio.' },
  { num: 72, name: 'Teodor Vik', born: 'Tromsø, 1999', role: 'Race driver', debut: 2024, starts: 70, podiums: 3, wins: 0, best: 'P2, Spa 2026', bio: 'Came up through Scandinavian touring cars before single-seaters. The engineers call him the tyre whisperer; he calls it patience.' },
  { num: 9, name: 'Ines Carvalho', born: 'Porto, 2004', role: 'Reserve and development driver', debut: 2027, starts: 0, podiums: 0, wins: 0, best: 'Formula 3 champion 2026', bio: 'The simulator is hers from Monday to Wednesday. She has driven every corner of every circuit on the calendar, twice.' },
];

export const staff = [
  { role: 'Team principal', name: 'Marit Solheim' },
  { role: 'Technical director', name: 'Kjetil Rønning' },
  { role: 'Head of aerodynamics', name: 'Aisha Rahman' },
  { role: 'Race engineer, car 27', name: 'Lars Ekeberg' },
  { role: 'Race engineer, car 72', name: 'Noor Vermeulen' },
  { role: 'Head of strategy', name: 'Tomas Lindgren' },
];

export const stats = [
  { value: 212, label: 'Points, 2026' },
  { value: 9, label: 'Podiums' },
  { value: 1, label: 'Win' },
];

export const car = [
  ['Chassis', 'NX-27 carbon monocoque'],
  ['Power unit', 'Fjordline FE-27 hybrid V6'],
  ['Weight', '798 kg with driver'],
  ['Wheelbase', '3,600 mm'],
  ['Fuel', '100 % sustainable'],
  ['Top speed', '352 km/h (Monza, 2026)'],
  ['Brakes', 'Carbon-carbon, 6-piston'],
  ['Livery', 'Ink, aurora, paper'],
];

export const calendar = [
  ['Australia', 'Melbourne', '14 Mar'], ['China', 'Shanghai', '21 Mar'], ['Japan', 'Suzuka', '4 Apr'], ['Bahrain', 'Sakhir', '18 Apr'],
  ['Saudi Arabia', 'Jeddah', '25 Apr'], ['Miami', 'Miami', '9 May'], ['Emilia-Romagna', 'Imola', '23 May'], ['Monaco', 'Monte Carlo', '30 May'],
  ['Spain', 'Barcelona', '13 Jun'], ['Canada', 'Montréal', '20 Jun'], ['Austria', 'Spielberg', '4 Jul'], ['Great Britain', 'Silverstone', '11 Jul'],
  ['Belgium', 'Spa-Francorchamps', '25 Jul'], ['Hungary', 'Budapest', '1 Aug'], ['Netherlands', 'Zandvoort', '29 Aug'], ['Italy', 'Monza', '5 Sep'],
  ['Azerbaijan', 'Baku', '19 Sep'], ['Singapore', 'Marina Bay', '3 Oct'], ['United States', 'Austin', '17 Oct'], ['Mexico', 'Mexico City', '24 Oct'],
  ['Brazil', 'São Paulo', '7 Nov'], ['Las Vegas', 'Las Vegas', '20 Nov'], ['Qatar', 'Lusail', '28 Nov'], ['Abu Dhabi', 'Yas Marina', '5 Dec'],
] as const;

export const nextRoundIndex = 0;

export const results = [
  { round: 17, gp: 'Azerbaijan', p27: 4, p72: 7, points: 18 },
  { round: 18, gp: 'Singapore', p27: 3, p72: 9, points: 17 },
  { round: 19, gp: 'United States', p27: 6, p72: 5, points: 18 },
  { round: 20, gp: 'Mexico', p27: 2, p72: 8, points: 22 },
  { round: 21, gp: 'Brazil', p27: 5, p72: 12, points: 10 },
  { round: 22, gp: 'Las Vegas', p27: 3, p72: 6, points: 23 },
  { round: 23, gp: 'Qatar', p27: 7, p72: 4, points: 18 },
  { round: 24, gp: 'Abu Dhabi', p27: 2, p72: 5, points: 28 },
];

export const partners = ['Fjordline Energy', 'Halden Composites', 'Aurora Telecom', 'Vik & Sund', 'Polaris Lubricants', 'Skarv Timing', 'Bryggen Bank', 'Nordsjø Logistics'];

export const posters = [
  { k: 'R01 · Melbourne', big: 'Lights out', tone: 'ink', tilt: -4 },
  { k: 'Qualifying', big: 'P3', tone: 'aurora', tilt: 3 },
  { k: 'Monza 2026', big: 'First win', tone: 'paper', tilt: -2 },
  { k: 'Marina Bay', big: 'Night race', tone: 'ink', tilt: 5 },
  { k: 'Car 27', big: '27', tone: 'aurora', tilt: -6 },
  { k: 'Season', big: '24 rounds', tone: 'paper', tilt: 2 },
];

export const lap = {
  circuit: 'Nordlys test circuit, Lillestrøm',
  length: '4.812 km',
  sectors: [28.412, 31.087, 24.655],
  best: '1:24.154',
};
