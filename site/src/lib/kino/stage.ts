/* A real camera on a studio set, rendered live: "Vintage Video Camera" by Jenelle van Heerden and James Ray Cock
   (Poly Haven, CC0) under a captured studio light (Poly Haven HDRI, CC0), physically based, tone-mapped like film.
   The same model is the drawing (its creases and outline in ink, drawing themselves upward), the build wipes the lit
   model in across it, and a camera can orbit it and fly toward its eyepiece. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

import { stageDefaults, type StageState, type StageTier } from './shot';
export { stageDefaults, REST, flight } from './shot';
export type { StageState, StageTier, Shot } from './shot';

export async function createStage(canvas: HTMLCanvasElement, base: string, tier: StageTier = 'high', shared?: StageState) {
  const state = shared ?? stageDefaults();
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return null; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  const [gltf, hdr] = await Promise.all([
    new GLTFLoader().loadAsync(`${base}/kino/${tier === 'high' ? 'camera' : 'camera-1k'}.gltf`),
    new HDRLoader().loadAsync(`${base}/kino/studio.hdr`),
  ]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(hdr).texture; hdr.dispose(); pmrem.dispose();
  scene.environment = env;
  scene.environmentRotation.y = 2.2;

  // The model, normalised to a height of 1 and standing on the floor at y = 0.
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model), dim = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
  const k = 1 / dim.y;
  model.scale.setScalar(k);
  model.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);
  const turntable = new THREE.Group(); turntable.add(model); scene.add(turntable);
  const drawPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  // The wipe is a vertical edge in screen space, shared with the page's own background layer, so the studio and the lit
  // model cross the drawing together: lit pixels left of the edge, the drawing right of it.
  const uWipe = { value: 1 }, uRes = { value: new THREE.Vector2(1, 1) };
  const side = (mat: THREE.Material, lit: boolean) => {
    const prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (sh, r) => {
      prev.call(mat, sh, r);
      sh.uniforms.uWipe = uWipe; sh.uniforms.uRes = uRes;
      sh.fragmentShader = 'uniform float uWipe;\nuniform vec2 uRes;\n' + sh.fragmentShader.replace('void main() {', `void main() {\n  if (gl_FragCoord.x ${lit ? '>' : '<='} uWipe * uRes.x) discard;`);
    };
    mat.customProgramCacheKey = () => (lit ? 'lit' : 'ink') + mat.type;
  };
  const meshes: THREE.Mesh[] = [];
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = true; m.receiveShadow = true;
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.envMapIntensity = 1.15; side(mat, true);
    meshes.push(m);
  });

  // The drawing: creases (EdgesGeometry) and an outline (the back faces pushed out along the normals) in ink.
  const ink = new THREE.Color('#1b1d22');
  const lineMat = new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.9, clippingPlanes: [drawPlane] });
  const outlineMat = new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide, clippingPlanes: [drawPlane] });
  outlineMat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normal * 0.0045 / ' + k.toFixed(5) + ';'); };
  side(lineMat, false); side(outlineMat, false);
  const drawing: THREE.Object3D[] = [];
  for (const m of meshes) {
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 28), lineMat);
    const outline = new THREE.Mesh(m.geometry, outlineMat);
    for (const o of [lines, outline]) { o.position.copy(m.position); o.quaternion.copy(m.quaternion); o.scale.copy(m.scale); m.parent!.add(o); drawing.push(o); }
  }
  // the paper behind the drawing: plain faces that only hide what is behind (the drawing reads as a drawing)
  const paperMat = new THREE.MeshBasicMaterial({ color: '#f2f0ea', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, clippingPlanes: [drawPlane] });
  side(paperMat, false);
  for (const m of meshes) { const p = new THREE.Mesh(m.geometry, paperMat); p.position.copy(m.position); p.quaternion.copy(m.quaternion); p.scale.copy(m.scale); m.parent!.add(p); drawing.push(p); }

  // Studio: a key from the upper left, a cool rim from behind, and a floor that only takes the shadow.
  const key = new THREE.DirectionalLight('#fff4e6', 2.2); key.position.set(-2.4, 3.2, 2.2); key.castShadow = true;
  key.shadow.mapSize.set(tier === 'high' ? 2048 : 1024, tier === 'high' ? 2048 : 1024); key.shadow.camera.near = 0.5; key.shadow.camera.far = 10;
  Object.assign(key.shadow.camera, { left: -1.2, right: 1.2, top: 1.2, bottom: -1.2 }); key.shadow.radius = 6; key.shadow.bias = -0.0004;
  const rim = new THREE.DirectionalLight('#bcd4ff', 3.0); rim.position.set(2.5, 1.6, -2.6);
  scene.add(key, rim);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.38 }); side(floorMat, true);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3, 64), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // The eyepiece at the back, where you put your eye when filming (the centre of its glass, found from the glass
  // vertices; it looks out along -z).
  model.updateWorldMatrix(true, true);
  const eyeTarget = model.localToWorld(new THREE.Vector3(-0.0116, 0.1032, -0.047));

  const t0 = performance.now();
  let raf = 0, running = false, w = 0, h = 0, adapt = 1, slow = 0, fast = 0, last = 0;
  const dprCap = tier === 'high' ? 1.75 : 1;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, dprCap);
    let sx = dpr * state.resScale * adapt;
    const cap = innerWidth * innerHeight * dpr * dpr * 1.15, want = canvas.clientWidth * canvas.clientHeight * sx * sx;
    if (want > cap) sx *= Math.sqrt(cap / want);
    const nw = Math.max(1, Math.round(canvas.clientWidth * sx)), nh = Math.max(1, Math.round(canvas.clientHeight * sx));
    if (Math.abs(nw - w) > 1 || Math.abs(nh - h) > 1) { w = nw; h = nh; renderer.setSize(w, h, false); }
  };
  const tmp = new THREE.Vector3();
  const draw = () => {
    size();
    const s = state.shot, el = s.el + state.look.y * 0.08, az = s.az + state.look.x * 0.12;
    const target = new THREE.Vector3(0, 0.5 + s.ty, 0);
    // the shot: an orbit around the camera body ...
    cam.position.set(Math.sin(az) * Math.cos(el) * s.dist, target.y + Math.sin(el) * s.dist, Math.cos(az) * Math.cos(el) * s.dist);
    cam.fov = s.fov;
    // ... blended into a dive toward the eyepiece
    if (state.dive > 0) {
      // Two moves: swing round to face the eyepiece (0 to 0.5), then push straight in along its axis (0.5 to 0.92),
      // stopping while the eyepiece is about a third of the frame: closer, the textures go soft, so the page takes over
      // through the glass there (site.ts). The aim settles on the eyepiece early, so the push is a straight line.
      const d = state.dive, up = new THREE.Vector3(0, 1, 0);
      const lens = tmp.copy(eyeTarget).applyAxisAngle(up, state.spin), axis = new THREE.Vector3(0, 0, -1).applyAxisAngle(up, state.spin);
      const a = Math.min(1, d / 0.5), ea = a * a * (3 - 2 * a), b = Math.min(1, Math.max(0, (d - 0.5) / 0.42)), eb = b * b * (3 - 2 * b);
      const front = lens.clone().addScaledVector(axis, 1.7);   // the whole back of the camera, the eyepiece centred
      const end = lens.clone().addScaledVector(axis, 0.42);
      cam.position.lerp(front, ea).lerp(end, eb);
      target.lerp(lens, Math.min(1, ea * 1.25));
      cam.fov = s.fov + 6 * ea;
    }
    cam.up.set(Math.sin(s.roll), Math.cos(s.roll), 0);
    cam.aspect = w / h;
    if (Math.abs(s.sx) > 1e-4) cam.setViewOffset(w, h, s.sx * w, 0, w, h); else cam.clearViewOffset();
    cam.updateProjectionMatrix(); cam.lookAt(target);
    turntable.rotation.y = state.spin;
    uWipe.value = state.wipe; uRes.value.set(w, h);
    drawPlane.constant = -0.02 + state.draw * 1.08;
    for (const o of drawing) o.visible = state.wire > 0.001;
    key.intensity = 2.2 * state.light; rim.intensity = 3.0 * state.light;
    for (const m of meshes) (m.material as THREE.MeshStandardMaterial).envMapIntensity = 0.35 + 0.8 * state.light;
    (floor.material as THREE.ShadowMaterial).opacity = 0.38 * state.light;
    renderer.render(scene, cam);
    // labels in the scene: project each anchor to the canvas, so the page can pin its callouts to the parts
    if (state.anchors.length) {
      turntable.updateMatrixWorld(true);
      state.anchors.forEach((a, i) => {
        const v = model.localToWorld(tmp.set(a[0], a[1], a[2])).project(cam);
        state.screen[i] = { x: (v.x + 1) / 2, y: (1 - v.y) / 2, on: v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2 };
      });
    }
  };
  const pace = (now: number) => {
    if (last) { const dt = now - last; if (dt > 20) { slow++; fast = 0; } else { fast++; if (dt > 12) slow = Math.max(0, slow - 1); } }
    last = now;
    if (slow > 6) { adapt = Math.max(0.75, adapt * 0.92); slow = 0; }
    if (fast > 180 && adapt < 1) { adapt = Math.min(1, adapt * 1.05); fast = 0; }
  };
  const frame = (now: number) => { if (!running) return; pace(now); draw(); raf = requestAnimationFrame(frame); };
  void t0;
  return {
    state, draw,
    play: () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); } },
    pause: () => { running = false; cancelAnimationFrame(raf); },
    destroy: () => { running = false; cancelAnimationFrame(raf); renderer.dispose(); renderer.forceContextLoss(); },
  };
}
