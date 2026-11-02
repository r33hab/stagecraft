import type { Shot } from '../lib/kino/shot';
// The camera's shot per chapter: the stage holds the Halde 8 and the camera around it moves from one to the next.
// move: when the camera starts toward this chapter's shot, in chapters from its mark (default -0.45)
export type Chapter = { id: string; time: string; title: string; text: string; shot: Shot; wire?: number; spin?: number; move?: number };
const S = (az: number, el: number, dist: number, ty: number, sx = -0.18, fov = 30): Shot => ({ az, el, dist, ty, fov, roll: 0, sx });
export const chapters: Chapter[] = [
  { id: 'made', time: '1958', title: '1958', text: 'Built in a workshop in Oslo in 1958, the year 8 mm film came home. Clockwork drive, no battery, sixteen frames a second.', shot: S(-1.1, 0.12, 2.45, 0.06) },
  { id: 'turret', time: 'Turret', title: 'The turret', text: 'Three lenses on one turret: 13 mm wide, 25 mm normal, 38 mm tele. Turn it with your thumb; the viewfinder turns with it.', shot: S(-0.5, 0.05, 1.5, -0.12, -0.2, 28) },
  { id: 'wind', time: 'Wind', title: 'Wind it', text: 'Twelve turns of the key run 25 feet of film: about two minutes of light, one shot at a time.', shot: S(-2.0, 0.18, 2.1, -0.02) },
  { id: 'apart', time: 'Bench', title: 'Taken apart', text: 'Each camera comes to the bench in pieces: 39 parts, cleaned, measured and drawn before anything is replaced.', shot: S(-0.8, 0.2, 3.75, 0.24, -0.16), wire: 1 },
  { id: 'rebuilt', time: 'Rebuilt', title: 'Rebuilt', text: 'New seals, a serviced spring, the original glass. It leaves the bench only when it runs at sixteen frames a second, steady, for a full roll.', shot: S(-0.95, -0.04, 2.15, 0.08), move: -0.2 },
  { id: 'rolling', time: 'Rolling', title: 'Rolling', text: 'Twelve cameras a year. Each one goes out with a roll of film and a promise: we service it for life.', shot: S(-0.5, 0.06, 2.5, 0.04) },
];
export const specs = ['Film: double 8 mm', 'Speeds: 12, 16, 24, 32 fps', 'Lenses: 13, 25, 38 mm f/1.9', 'Drive: clockwork, 25 ft per wind', 'Weight: 1.1 kg', 'Made: Oslo, 1958 / restored 2027'];

// Points on the model (its own units) and the labels pinned to them, per chapter.
// A point on a part that comes off in the exploded view travels with that part.
export const anchors = [[0.0106, 0.0726, 0.0797], [-0.02, 0.06, 0.079], [0.0063, 0.0394, 0.0697], [-0.0372, 0.042, 0.013],
  [-0.012, 0.087, 0.0527], [0.024, 0.135, -0.01], [-0.0336, 0.0616, 0.0047],
  // 7 to 9: the eyepiece (the centre of its glass, the glass's rim, the ring's rim), for the ending
  [-0.0116, 0.1032, -0.047], [-0.0089, 0.1032, -0.047], [-0.0044, 0.1032, -0.047]];
export const EYE = 7;
export type Callout = { chapter: string; anchor: number; text: string; dx: number; dy: number };
export const callouts: Callout[] = [
  { chapter: 'turret', anchor: 0, text: '38 mm · tele', dx: 190, dy: 70 },
  { chapter: 'turret', anchor: 1, text: '25 mm · normal', dx: -170, dy: -110 },
  { chapter: 'turret', anchor: 2, text: '13 mm · wide', dx: 170, dy: 60 },
  { chapter: 'wind', anchor: 3, text: 'Key · 12 turns, 25 ft', dx: -190, dy: -140 },
  { chapter: 'apart', anchor: 4, text: '01 · Turret', dx: 150, dy: -215 },
  { chapter: 'apart', anchor: 0, text: '02 · Glass', dx: 20, dy: -200 },
  { chapter: 'apart', anchor: 5, text: '03 · Viewfinder hood', dx: -180, dy: 30 },
  { chapter: 'apart', anchor: 6, text: '04 · Winding key', dx: -150, dy: -90 },
  { chapter: 'rebuilt', anchor: 0, text: 'Original glass', dx: -60, dy: -190 },
  { chapter: 'rebuilt', anchor: 3, text: 'Serviced spring', dx: -150, dy: -150 },
];
