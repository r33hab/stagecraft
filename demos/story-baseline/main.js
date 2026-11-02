import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const $ = (s) => document.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DBG = new URLSearchParams(location.search);

/* ---------- Timeline: per-property keyframes, t in chapters (chapter c = t c..c+1) ---------- */
const TL = {
  yaw:  [[0,-1.2],[.8,-.5],[1,.5],[1.8,.3],[2,1.5],[2.8,1.75],[3,.7],[3.8,.95],[4,.95],[4.8,.3],[5,0],[5.8,-.12],[6,-.5],[7,.35],[8,.7]],
  pitch:[[0,.1],[1,.04],[2,.1],[3,.25],[4,.25],[5,0],[6,.12],[8,.15]],
  dist: [[0,2.7],[.8,2.3],[1,2.1],[1.8,1.9],[2,2.3],[2.8,2.2],[3,3.8],[3.8,4.2],[4,4.2],[4.8,2.5],[5,1.7],[5.8,1.6],[6,2.7],[7,3.1],[8,4.0]],
  sx:   [[0,.2],[.8,.2],[1,-.2],[1.8,-.2],[2,.2],[2.8,.2],[3,-.2],[3.8,-.2],[4,.2],[4.8,.2],[5,-.2],[5.8,-.2],[6,0],[8,0]],
  sy:   [[0,0],[5.8,0],[6,.17],[7,.17],[7.9,.34]],
  ex:   [[0,0],[3,0],[3.45,1],[4,1],[4.65,0],[8,0]],
  tu:   [[0,0],[1.2,0],[1.4,2.094],[1.55,2.094],[1.75,4.189],[5,4.189],[5.35,6.283],[8,6.283]],
  fl:   [[0,0],[5.05,0],[5.2,1],[5.95,1],[6.3,0],[8,0]],
  gx:   [[0,.62],[1,.36],[2,.62],[3,.36],[4,.62],[5,.36],[6,.5],[8,.5]]
};
function sample(track, t) {
  if (t <= track[0][0]) return track[0][1];
  for (let i = 1; i < track.length; i++) {
    if (t <= track[i][0]) {
      const [t0, v0] = track[i - 1], [t1, v1] = track[i];
      return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0));
    }
  }
  return track[track.length - 1][1];
}

/* ---------- Scroll -> t ---------- */
const chaps = [...document.querySelectorAll('.chap')];
const specs = $('#specs'), ending = $('#join');
let target = 0, cur = 0, vh = innerHeight, scrollY0 = 0;
function computeT() {
  vh = innerHeight;
  let t = 0;
  for (let i = 0; i < chaps.length; i++) {
    const r = chaps[i].getBoundingClientRect();
    if (r.top <= 0) t = i + clamp(-r.top / (r.height - vh));
  }
  const rs = specs.getBoundingClientRect();
  if (rs.top <= 0) t = 6 + clamp(-rs.top / (rs.height - vh)) * 0.9 + 0;
  if (rs.top <= 0 && rs.bottom < vh * 1.0) t = 6.9;
  const re = ending.getBoundingClientRect();
  if (re.top < vh) t = Math.max(t, 6.9 + clamp(1 - re.top / vh) * 1.0);
  return t;
}

/* ---------- HUD / copy ---------- */
const names = ['1958', 'The turret', 'Wind it', 'Taken apart', 'Rebuilt', 'Rolling'];
const copies = chaps.map((c) => c.querySelector('.copy'));
const ticks = $('#ticks');
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2, l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('x1', 60 + Math.sin(a) * 46); l.setAttribute('y1', 60 - Math.cos(a) * 46);
  l.setAttribute('x2', 60 + Math.sin(a) * 52); l.setAttribute('y2', 60 - Math.cos(a) * 52);
  ticks.appendChild(l);
}
const twelve = $('#twelve');
for (let i = 0; i < 12; i++) twelve.appendChild(document.createElement('li'));
const lensItems = [...document.querySelectorAll('#lenses li')];
const specItems = [...document.querySelectorAll('#speclist li')];
const E = { hudchap: $('#hudchap'), hudname: $('#hudname'), hudframe: $('#hudframe'), hudft: $('#hudft'), gauge: $('#gaugefill'),
  wturns: $('#wturns'), wft: $('#wft'), wtime: $('#wtime'), needle: $('#needle'), pcount: $('#pcount'), tbar: $('#tbar'), tlabel: $('#tlabel'),
  flick: $('#flicker') };

function updateUI(t, dt) {
  const ci = clamp(Math.floor(t), 0, 5);
  copies.forEach((el, i) => {
    const l = clamp(t - i);
    const inn = i === 0 ? 1 : ease(l / 0.12), out = 1 - ease((l - 0.8) / 0.15);
    const o = (t < i || t > i + 1.05) ? 0 : Math.min(inn, out);
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translateY(${((1 - o) * 18).toFixed(1)}px)`;
    chaps[i].classList.toggle('in', o > 0.25);
  });
  if (t < 6) { E.hudchap.textContent = String(ci + 1).padStart(2, '0') + ' / 06'; E.hudname.textContent = names[ci]; }
  else if (t < 6.95) { E.hudchap.textContent = 'Specs'; E.hudname.textContent = 'Halde 8'; }
  else { E.hudchap.textContent = 'Fin'; E.hudname.textContent = 'The next twelve'; }
  const total = 6.95, frac = clamp(t / total);
  E.gauge.style.height = (100 - frac * 100).toFixed(1) + '%';
  E.hudft.textContent = Math.max(0, 25 - frac * 25).toFixed(1) + ' ft';
  E.hudframe.textContent = String(Math.floor(t * 960)).padStart(6, '0');
  // chapter 2: lenses
  const tu = sample(TL.tu, t); const lens = tu < 1.05 ? 0 : tu < 3.14 ? 1 : 2;
  lensItems.forEach((li, i) => li.classList.toggle('on', t >= 1 && t < 2.1 && i === lens || (i === 2 && t >= 1.7 && t < 2.1)));
  // chapter 3: wind
  const w = clamp((t - 2.12) / 0.6), turns = Math.round(w * 12 * 10) / 10;
  E.wturns.textContent = Math.floor(turns);
  E.wft.textContent = (w * 25).toFixed(1);
  const secs = Math.round(w * 120); E.wtime.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  E.needle.style.transform = `rotate(${(turns * 360).toFixed(1)}deg)`;
  // chapter 4: parts
  E.pcount.textContent = Math.round(clamp((t - 3.05) / 0.4) * 41);
  // chapter 5: bench test
  const bt = clamp((t - 4.35) / 0.5);
  E.tbar.style.transform = `scaleX(${bt})`;
  E.tlabel.textContent = (bt > 0.02 ? (15.6 + 0.4 * ease(bt) + (bt < 1 ? Math.sin(t * 90) * 0.12 * (1 - bt) : 0)) : 0).toFixed(1) + ' fps';
  // chapter 6: twelve dots
  const n = Math.round(clamp((t - 5.2) / 0.5) * 12);
  [...twelve.children].forEach((li, i) => li.classList.toggle('on', i < n));
  // specs
  const sp = clamp((t - 6.02) / 0.8);
  specItems.forEach((li, i) => li.classList.toggle('on', sp > (i + 0.2) / 6));
  document.documentElement.style.setProperty('--gx', (sample(TL.gx, t) * 100).toFixed(1) + '%');
}

/* ---------- Three ---------- */
const canvas = $('#stage');
let renderer, scene, camera, rig, spin, parts = [], turretGroup, spot, ready = false;
const loaderEl = $('#loader'), lnum = $('#leadnum'), lpct = $('#loadpct');
let loadFrac = 0;
const mgr = new THREE.LoadingManager();
mgr.onProgress = (u, l, n) => { loadFrac = l / n; lpct.textContent = Math.round(loadFrac * 100); lnum.textContent = Math.max(1, 8 - Math.floor(loadFrac * 8)); };

try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight(0xffd7a0, 2.6); key.position.set(-2.5, 3, 3.5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fa8ff, 2.2); rim.position.set(3, 1.5, -3); scene.add(rim);
  spot = new THREE.SpotLight(0xffe2b0, 0, 12, 0.5, 0.8, 1.2); spot.position.set(0.2, 0.4, 4); scene.add(spot, spot.target);
  new RGBELoader(mgr).load('assets/studio.hdr', (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping; scene.environment = tex;
  });
  new GLTFLoader(mgr).load('assets/camera.gltf', (g) => { build(g.scene); }, undefined, (e) => { console.error(e); finish(); });
} catch (e) { console.error('WebGL unavailable', e); finish(); }

function kmeans(pts, k, iters = 10) {
  const n = pts.length / 3, cs = [];
  let i0 = 0; cs.push([pts[0], pts[1], pts[2]]);
  const d = new Float32Array(n).fill(1e9);
  for (let c = 1; c < k; c++) {
    let best = 0, bd = -1;
    for (let i = 0; i < n; i++) {
      const dx = pts[i*3]-cs[c-1][0], dy = pts[i*3+1]-cs[c-1][1], dz = pts[i*3+2]-cs[c-1][2];
      d[i] = Math.min(d[i], dx*dx+dy*dy+dz*dz); if (d[i] > bd) { bd = d[i]; best = i; }
    }
    cs.push([pts[best*3], pts[best*3+1], pts[best*3+2]]);
  }
  const lab = new Int32Array(n);
  for (let it = 0; it < iters; it++) {
    const sum = cs.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < n; i++) {
      let b = 0, bd = 1e9;
      for (let c = 0; c < k; c++) { const dx = pts[i*3]-cs[c][0], dy = pts[i*3+1]-cs[c][1], dz = pts[i*3+2]-cs[c][2]; const dd = dx*dx+dy*dy+dz*dz; if (dd < bd) { bd = dd; b = c; } }
      lab[i] = b; const s = sum[b]; s[0] += pts[i*3]; s[1] += pts[i*3+1]; s[2] += pts[i*3+2]; s[3]++;
    }
    cs.forEach((c, j) => { const s = sum[j]; if (s[3]) { c[0] = s[0]/s[3]; c[1] = s[1]/s[3]; c[2] = s[2]/s[3]; } });
  }
  return { lab, cs };
}

function build(root) {
  const meshes = []; root.traverse((o) => { if (o.isMesh) meshes.push(o); });
  root.updateMatrixWorld(true);
  const ZT = 0.052; // turret plane
  // collect triangles (non-indexed expansion)
  const prims = meshes.map((m) => {
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
    g.applyMatrix4(m.matrixWorld);
    return { g, mat: m.material };
  });
  // turret pivot: bbox centre of thin slab just behind lens barrels
  const bb = new THREE.Box3(); let have = false;
  const cents = [];
  prims.forEach((p, pi) => {
    const pos = p.g.attributes.position, nTri = pos.count / 3;
    p.cent = new Float32Array(nTri * 3); p.isT = new Uint8Array(nTri);
    for (let t = 0; t < nTri; t++) {
      let cx = 0, cy = 0, cz = 0;
      for (let v = 0; v < 3; v++) { cx += pos.getX(t*3+v); cy += pos.getY(t*3+v); cz += pos.getZ(t*3+v); }
      cx /= 3; cy /= 3; cz /= 3; p.cent.set([cx, cy, cz], t * 3);
      if (cz > ZT) { p.isT[t] = 1; if (cz < ZT + 0.007) { bb.expandByPoint(new THREE.Vector3(cx, cy, cz)); have = true; } }
    }
  });
  const pivot = new THREE.Vector3(); bb.getCenter(pivot);
  // k-means per group
  const body = [], tur = [];
  prims.forEach((p, pi) => { for (let t = 0; t < p.isT.length; t++) { (p.isT[t] ? tur : body).push([pi, t]); } });
  const run = (list, k) => {
    const pts = new Float32Array(list.length * 3);
    list.forEach(([pi, t], i) => pts.set(prims[pi].cent.subarray(t*3, t*3+3), i*3));
    return kmeans(pts, k);
  };
  const kb = run(body, 12), kt = run(tur, 4);
  const full = new THREE.Box3(); prims.forEach((p) => { p.g.computeBoundingBox(); full.union(p.g.boundingBox); });
  const center = new THREE.Vector3(); full.getCenter(center);
  const size = full.getSize(new THREE.Vector3());
  const S = 1 / size.y;

  rig = new THREE.Group(); spin = new THREE.Group(); rig.add(spin);
  const holder = new THREE.Group(); holder.position.copy(center).multiplyScalar(-1); spin.add(holder);
  turretGroup = new THREE.Group(); turretGroup.position.copy(pivot); holder.add(turretGroup);

  function makeParts(list, kr, parent, origin, isTurret) {
    const k = kr.cs.length;
    for (let c = 0; c < k; c++) {
      prims.forEach((p, pi) => {
        const tris = []; list.forEach(([qi, t], i) => { if (qi === pi && kr.lab[i] === c) tris.push(t); });
        if (!tris.length) return;
        const g = new THREE.BufferGeometry();
        for (const name of Object.keys(p.g.attributes)) {
          const a = p.g.attributes[name], arr = new Float32Array(tris.length * 3 * a.itemSize);
          tris.forEach((t, i) => { for (let v = 0; v < 3; v++) for (let j = 0; j < a.itemSize; j++) arr[(i*3+v)*a.itemSize+j] = a.array[(t*3+v)*a.itemSize+j]; });
          g.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize));
        }
        if (isTurret) g.translate(-origin.x, -origin.y, -origin.z);
        const m = new THREE.Mesh(g, p.mat); parent.add(m);
        const dir = new THREE.Vector3(kr.cs[c][0], kr.cs[c][1], kr.cs[c][2]).sub(origin);
        if (isTurret) { dir.z = 0; dir.normalize().multiplyScalar(0.7); dir.z = 0.7; } else { dir.multiplyScalar(1); dir.z *= 1.5; dir.normalize(); }
        parts.push({ m, dir: dir.normalize(), dist: isTurret ? 0.04 : 0.032 + (c % 4) * 0.012, delay: (c % 6) * 0.05, turret: isTurret });
      });
    }
  }
  makeParts(body, kb, holder, center, false);
  makeParts(tur, kt, turretGroup, pivot, true);
  rig.scale.setScalar(S); scene.add(rig); rig.userData.S = S;
  finish();
}

function finish() { ready = true; loaderEl.classList.add('done'); onScroll(); }

/* ---------- Loop ---------- */
let last = performance.now(), flickState = 1, flickT = 0;
function resize() {
  const w = innerWidth, h = innerHeight;
  if (!renderer) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
function onScroll() { target = computeT(); if (reduce) cur = target; }
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { resize(); onScroll(); });
resize();
if (DBG.has('t')) { target = cur = +DBG.get('t'); }

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (DBG.has('t')) { target = +DBG.get('t'); } else if (reduce) cur = target;
  cur += (target - cur) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
  const t = cur;
  updateUI(t, dt);
  if (renderer && rig) {
    const w = innerWidth, h = innerHeight, portrait = w / h < 0.9 || w < 820;
    const dist = sample(TL.dist, t) * 1.3 * (portrait ? 1.0 + (0.9 - w / h) * 1.7 : 1);
    const e = sample(TL.ex, t);
    spin.rotation.set(sample(TL.pitch, t), sample(TL.yaw, t) + (reduce ? 0 : Math.sin(now * 0.0004) * 0.03), 0);
    camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0);
    const sx = portrait ? 0 : sample(TL.sx, t), sy = portrait ? Math.max(sample(TL.sy, t), 0.19 + (t < 6 ? 0 : 0)) : sample(TL.sy, t);
    camera.setViewOffset(w, h, -sx * w, sy * h, w, h);
    turretGroup.rotation.z = -sample(TL.tu, t);
    for (const p of parts) {
      const ee = ease(clamp((e - p.delay) / (1 - p.delay)));
      p.m.position.copy(p.dir).multiplyScalar(p.dist * ee);
      if (p.turret) p.m.position.z += 0; 
    }
    turretGroup.position.z = turretGroup.userData.z0 ?? (turretGroup.userData.z0 = turretGroup.position.z);
    turretGroup.position.z = turretGroup.userData.z0 + 0.06 * ease(e);
    // flicker at 16 fps
    const fl = sample(TL.fl, t);
    flickT += dt; if (flickT > 1 / 16) { flickT = 0; flickState = 0.55 + Math.random() * 0.45; }
    spot.intensity = fl * 90 * (reduce ? 0.8 : flickState);
    E.flick.style.opacity = (fl * (1 - flickState) * 0.55).toFixed(3);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Form (static demo: nothing is sent or stored) ---------- */
$('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#email').value.trim(), m = $('#msg');
  if (!/^\S+@\S+\.\S+$/.test(v)) { m.textContent = 'That does not look like an email address yet.'; return; }
  m.textContent = 'Thank you. You are on the list for the next twelve (demo only: nothing was sent or saved).';
  $('#email').value = '';
});
