/**
 * A three.js hero for a site whose subject is a thing: the product, a device, a building, an
 * object. It loads a real model (a GLB from the client, a CAD export, or a CC0 scan; see
 * `references/stack.md`, "Sourcing assets") and gives it studio light, a soft contact shadow, a slow
 * turntable, mouse parallax and a scroll-bound turn and dolly. Never feed it geometry built from
 * primitives: that reads as a tutorial however it is lit.
 *
 * Dynamic-import this after `load`, only when `tier !== 'low'` and not on a software renderer
 * (`softwareGl()` in `tier.ts`); keep a still of the same composition for everyone else.
 *
 *   const hero = await createHeroScene(canvas, { tier, model: '/models/chair.glb' });
 *   hero.setProgress(p);      // 0..1 from ScrollTrigger: turn and dolly
 *   hero.destroy();
 *
 * npm i three
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type HeroOptions = {
  tier: 'mid' | 'high';
  model: string;                 // URL of a .glb
  draco?: string;                // decoder folder when the GLB uses Draco (e.g. '/draco/')
  background?: string | null;    // null = transparent canvas over the page colour
  height?: number;               // object height in world units after fitting (default 2.4)
  offsetX?: number;              // move the object sideways on wide screens to clear the copy
  turntable?: number;            // idle turn, radians per second (default 0.12)
  exposure?: number;             // tone-mapping exposure (default 1)
  onProgress?: (p: number) => void;
};

export async function createHeroScene(canvas: HTMLCanvasElement, o: HeroOptions) {
  const high = o.tier === 'high';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: high, alpha: o.background == null, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, high ? 1.5 : 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposure ?? 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = high;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  if (o.background) scene.background = new THREE.Color(o.background);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
  camera.position.set(0, 0.35, 7);

  // The model, fitted to a known height and centred on the floor.
  const loader = new GLTFLoader();
  if (o.draco) { const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js'); const d = new DRACOLoader(); d.setDecoderPath(o.draco); loader.setDRACOLoader(d); }
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await new Promise<{ scene: THREE.Group }>((res, rej) => loader.load(o.model, res, (e) => e.total && o.onProgress?.(e.loaded / e.total), rej));
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const s = (o.height ?? 2.4) / Math.max(size.y, 1e-6);
  model.scale.setScalar(s);
  model.position.set(-centre.x * s, -box.min.y * s, -centre.z * s);
  model.traverse((n) => { const m = n as THREE.Mesh; if (m.isMesh) { m.castShadow = high; m.receiveShadow = high; } });
  const turn = new THREE.Group(); turn.add(model);
  const rig = new THREE.Group(); rig.add(turn); rig.position.y = -(o.height ?? 2.4) / 2;
  scene.add(rig);

  // Soft contact shadow: a blurred blob on the floor grounds the object on every tier.
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!; const r = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    r.addColorStop(0, 'rgba(0,0,0,0.55)'); r.addColorStop(0.55, 'rgba(0,0,0,0.18)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.scale.set(Math.max(size.x, size.z) * s * 1.5, Math.max(size.x, size.z) * s * 1.5, 1); blob.position.y = 0.002;
  rig.add(blob);

  // Key and rim; the environment does most of the work.
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 4); key.castShadow = high;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd2ff, 0.6); rim.position.set(-4, 2, -5); scene.add(rim);

  let w = 0, h = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (Math.abs(r.width - w) < 2 && Math.abs(r.height - h) < 2) return;
    w = r.width; h = r.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    rig.position.x = w < 900 ? 0 : (o.offsetX ?? 0);
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  const target = { x: 0, y: 0 }, mouse = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => { target.x = (e.clientX / innerWidth - 0.5) * 2; target.y = (e.clientY / innerHeight - 0.5) * 2; };
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', onMove, { passive: true });

  let progress = 0, raf = 0, running = false, last = performance.now(), spin = 0;
  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    spin += dt * (o.turntable ?? 0.12);
    mouse.x += (target.x - mouse.x) * 0.06; mouse.y += (target.y - mouse.y) * 0.06;
    turn.rotation.y = spin + progress * Math.PI * 0.9 + mouse.x * 0.18;
    camera.position.set(mouse.x * 0.25, 0.35 - mouse.y * 0.12 + progress * 0.4, 7 - progress * 2.2);
    camera.lookAt(rig.position.x * 0.5, 0, 0);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  const play = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
  const pause = () => { running = false; cancelAnimationFrame(raf); };
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? play() : pause())), { threshold: 0.02 });
  io.observe(canvas);
  const onVis = () => (document.hidden ? pause() : play());
  document.addEventListener('visibilitychange', onVis);
  play();

  return {
    setProgress: (p: number) => { progress = Math.max(0, Math.min(1, p)); },
    play, pause,
    destroy: () => {
      pause(); io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      removeEventListener('pointermove', onMove);
      scene.traverse((n) => {
        const m = n as THREE.Mesh; m.geometry?.dispose?.();
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => {
          if (!mat) return;
          Object.values(mat).forEach((v) => (v as THREE.Texture)?.isTexture && (v as THREE.Texture).dispose());
          (mat as THREE.Material).dispose();
        });
      });
      shadowTex.dispose(); renderer.dispose();
    },
  };
}
