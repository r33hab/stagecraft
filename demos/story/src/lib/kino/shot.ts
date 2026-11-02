/* The shot and the state of the camera stage: no three.js here, so the page can animate the state before the renderer
   (a lazy chunk) has loaded. */
export type StageTier = 'high' | 'mid';
export type Shot = { az: number; el: number; dist: number; ty: number; fov: number; roll: number; sx: number };
export type StageState = {
  shot: Shot; look: { x: number; y: number };
  wire: number;   // 1: the drawing only
  draw: number;   // 0..1: how much of the drawing is drawn (from the base up)
  wipe: number;   // 0..1: screen fraction of the frame left of the edge; the lit model is left of it, the drawing right
  light: number;  // 0: flat, 1: the full studio light
  spin: number;   // turntable, radians
  dive: number;   // 0..1: the camera flies into the centre lens
  explode: number; // 0..1: the parts come off the body along their own axes, outermost first (needs the parts model)
  resScale: number;
  anchors: number[][];                       // points on the model (its own units), for labels in the scene
  screen: { x: number; y: number; on: boolean }[];   // written by the renderer: each anchor as a fraction of the canvas
};
// sx shifts the picture sideways (a fraction of the width; negative moves the camera body right of centre, so the page
// copy has the left side)
export const REST: Shot = { az: -0.62, el: 0.12, dist: 3.25, ty: 0.1, fov: 30, roll: 0, sx: -0.17 };
/** The scroll flight, p 0..1: the picture recentres and the camera swings round to face the turret, then pushes into
 *  the big lens until its glass is the frame. */
export function flight(p: number) { const c = Math.min(1, p / 0.4), e = c * c * (3 - 2 * c); return { sx: REST.sx * (1 - e), dive: p }; }
export const stageDefaults = (): StageState => ({ shot: { ...REST }, look: { x: 0, y: 0 }, wire: 0, draw: 1, wipe: 1, light: 1, spin: 0, dive: 0, explode: 0, resScale: 1, anchors: [], screen: [] });
export type Stage = Awaited<ReturnType<typeof import('./stage').createStage>>;
