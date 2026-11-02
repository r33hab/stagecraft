#!/usr/bin/env node
/**
 * Split a glTF model into its parts for an exploded view: one mesh per connected piece of geometry,
 * each node carrying in its extras the axis it leaves along, how far it travels and when it leaves.
 *
 *   node <skill>/scripts/explode-gltf.mjs model.gltf out/model-parts.gltf
 *        [--step 0.165] [--spread 1,1,1] [--keep 0.5] [--small 100]
 *
 * Input: a .gltf with external buffers and textures (Blender: glTF Separate), transforms applied, no
 * Draco, meshopt or quantization (export it uncompressed). Writes <out>.gltf and <out>.bin. Image URIs
 * are kept as they are, so write the output where they resolve (usually beside the input). For a 1k
 * variant, copy the .gltf and point its image URIs at the smaller textures; both share the .bin.
 *
 * Each part node gets extras { dir: [x, y, z], dist, rank, glass }: dir is a unit axis in model space,
 * dist is in model units, rank 0..1 is the order out (0 leaves first). The runtime eases each part from
 * its place to place + dir * dist (references/stack.md, "A product on a studio set"; the rules are in
 * references/craft.md section 7, "An exploded view").
 *
 * How the parts are placed:
 * - a part is a run of connected triangles; vertices at the same position are merged (a UV seam is not
 *   a cut), and each part keeps its primitive's material
 * - the body stays: parts whose smallest side is over --keep of the model's smallest side
 * - riders: glass (alphaMode BLEND, or "glass" in the material name) and parts under --small triangles
 *   move with the smallest part whose box holds them; glass in front of its holder goes a layer further
 * - axis: a thin part (smallest side under 0.4 of the next) leaves along its thin side, any other part
 *   along the axis it sits furthest out on, away from the body
 * - layers: along each axis, a part that covers another (overlapping across the axis, further out)
 *   sits one layer above it and travels --step x the model height x its layer (x --spread for the axis)
 * - rank: the outermost layer leaves first, so going back together the inner parts return first
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const [src, dst] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const fail = (m) => { console.error(`explode-gltf: ${m}`); process.exit(1); };
if (!src || !dst?.endsWith('.gltf')) fail('usage: explode-gltf.mjs <model.gltf> <out.gltf> [--step 0.165] [--spread 1,1,1] [--keep 0.5] [--small 100]');
const step = +opt('step', '0.165'), spread = opt('spread', '1,1,1').split(',').map(Number), keep = +opt('keep', '0.5'), small = +opt('small', '100');

const g = JSON.parse(readFileSync(src, 'utf8'));
for (const e of ['KHR_draco_mesh_compression', 'EXT_meshopt_compression', 'KHR_mesh_quantization']) if (g.extensionsUsed?.includes(e)) fail(`${e} is not supported: export the model uncompressed`);
if (g.skins?.length) fail('skinned models are not supported');
const bufs = (g.buffers ?? []).map((b) => { if (!b.uri || b.uri.startsWith('data:')) fail('needs external buffers: export as glTF Separate (.gltf + .bin + textures)'); return readFileSync(path.join(path.dirname(src), decodeURIComponent(b.uri))); });
const moved = (n) => (n.matrix && n.matrix.some((v, i) => v !== (i % 5 === 0 ? 1 : 0))) || n.translation?.some((v) => v) || (n.rotation && (n.rotation[0] || n.rotation[1] || n.rotation[2] || n.rotation[3] !== 1)) || n.scale?.some((v) => v !== 1);
if ((g.nodes ?? []).some(moved)) fail('apply the transforms before export (Blender: Object > Apply > All Transforms)');

const SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }, N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const read = (ai) => {
  const a = g.accessors[ai]; if (a.sparse) fail('sparse accessors are not supported');
  const bv = g.bufferViews[a.bufferView], buf = bufs[bv.buffer], cs = SIZE[a.componentType], el = cs * N[a.type];
  const stride = bv.byteStride || el, off = (bv.byteOffset || 0) + (a.byteOffset || 0);
  const num = (i, k) => { const o = off + i * stride + k * cs; return a.componentType === 5126 ? buf.readFloatLE(o) : a.componentType === 5125 ? buf.readUInt32LE(o) : a.componentType === 5123 ? buf.readUInt16LE(o) : buf.readUInt8(o); };
  return { a, el, num, raw: (i) => buf.subarray(off + i * stride, off + i * stride + el) };
};

// The model's box, from the position accessors (their min and max are required).
const prims = [];
for (const n of g.nodes ?? []) if (n.mesh != null) for (const p of g.meshes[n.mesh].primitives) { if ((p.mode ?? 4) !== 4) fail('only triangle meshes are supported'); if (p.targets) fail('morph targets are not supported'); prims.push(p); }
if (!prims.length) fail('no meshes');
const lo = [0, 1, 2].map((k) => Math.min(...prims.map((p) => g.accessors[p.attributes.POSITION].min[k])));
const hi = [0, 1, 2].map((k) => Math.max(...prims.map((p) => g.accessors[p.attributes.POSITION].max[k])));
const dims = hi.map((v, k) => v - lo[k]), height = dims[1], half = dims.map((d) => d / 2), q = Math.max(...dims) * 5e-5;

// Parts: connected triangles per primitive, with coincident vertices merged.
const parts = [];
for (const prim of prims) {
  const P = read(prim.attributes.POSITION), n = P.a.count;
  const pos = Array.from({ length: n }, (_, i) => [P.num(i, 0), P.num(i, 1), P.num(i, 2)]);
  const I = prim.indices != null ? read(prim.indices) : null;
  const idx = I ? Array.from({ length: I.a.count }, (_, i) => I.num(i, 0)) : Array.from({ length: n }, (_, i) => i);
  const par = Int32Array.from({ length: n }, (_, i) => i);
  const find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  const join = (a, b) => { a = find(a); b = find(b); if (a !== b) par[a] = b; };
  for (let t = 0; t < idx.length; t += 3) { join(idx[t], idx[t + 1]); join(idx[t], idx[t + 2]); }
  // merge vertices within q of each other (a grid of q, checking the neighbouring cells)
  const grid = new Map();
  pos.forEach((p, i) => {
    const c = p.map((v) => Math.floor(v / q));
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
      for (const j of grid.get(`${c[0] + x},${c[1] + y},${c[2] + z}`) ?? []) if (pos[j].every((v, k) => Math.abs(v - p[k]) <= q)) join(i, j);
    const key = c.join(','); if (!grid.has(key)) grid.set(key, []); grid.get(key).push(i);
  });
  const comps = new Map();
  for (let t = 0; t < idx.length; t += 3) { const r = find(idx[t]); if (!comps.has(r)) comps.set(r, []); comps.get(r).push(t); }
  const mat = g.materials?.[prim.material];
  const glass = mat?.alphaMode === 'BLEND' || /glass/i.test(mat?.name ?? '');
  for (const tris of comps.values()) {
    const vids = [...new Set(tris.flatMap((t) => [idx[t], idx[t + 1], idx[t + 2]]))].sort((a, b) => a - b);
    const remap = new Map(vids.map((v, i) => [v, i]));
    const mn = [0, 1, 2].map((k) => Math.min(...vids.map((v) => pos[v][k]))), mx = [0, 1, 2].map((k) => Math.max(...vids.map((v) => pos[v][k])));
    parts.push({ prim, glass, vids, tris: tris.length, idx: tris.flatMap((t) => [remap.get(idx[t]), remap.get(idx[t + 1]), remap.get(idx[t + 2])]),
      mn, mx, c: mn.map((v, k) => (v + mx[k]) / 2), s: mn.map((v, k) => mx[k] - v), dir: [0, 0, 0], dist: 0, layer: 0 });
  }
}

// Placement.
const tol = height * 0.014;
const body = parts.filter((p) => !p.glass).sort((a, b) => b.tris - a.tris);
const C = body[0].c, minDim = Math.min(...dims);
const kept = new Set(body.filter((p) => Math.min(...p.s) > keep * minDim));
const riders = parts.filter((p) => p.glass || p.tris < small);
const movers = body.filter((p) => !kept.has(p) && !riders.includes(p));
for (const p of movers) {
  const rel = p.c.map((v, k) => (v - C[k]) / half[k]);
  const order = [0, 1, 2].sort((a, b) => p.s[a] - p.s[b]);
  p.ax = p.s[order[0]] < 0.4 * p.s[order[1]] ? order[0] : [0, 1, 2].reduce((a, b) => (Math.abs(rel[b]) > Math.abs(rel[a]) ? b : a));
  p.sg = rel[p.ax] >= 0 ? 1 : -1;
}
const overlap = (p, o, ax) => [0, 1, 2].every((k) => k === ax || Math.min(p.mx[k], o.mx[k]) - Math.max(p.mn[k], o.mn[k]) > tol);
for (const p of [...movers].sort((a, b) => a.c[a.ax] * a.sg - b.c[b.ax] * b.sg)) {
  const under = movers.filter((o) => o !== p && o.ax === p.ax && o.sg === p.sg && o.c[p.ax] * p.sg < p.c[p.ax] * p.sg && overlap(p, o, p.ax));
  p.layer = 1 + Math.max(0, ...under.map((o) => o.layer));
}
const stepAbs = step * height;
for (const p of movers) { p.dir[p.ax] = p.sg; p.dist = stepAbs * spread[p.ax] * p.layer; }
const inside = (p, o) => [0, 1, 2].every((k) => o.mn[k] - tol <= p.c[k] && p.c[k] <= o.mx[k] + tol);
const vol = (o) => o.s.reduce((a, v) => a * Math.max(v, 1e-9), 1);
for (const p of riders) {
  const h = movers.filter((o) => inside(p, o)).sort((a, b) => vol(a) - vol(b))[0];
  if (!h) continue;
  const out = p.glass && (p.c[h.ax] - h.c[h.ax]) * h.sg > 0;
  p.dir = [...h.dir]; p.layer = h.layer + (out ? 1 : 0); p.dist = h.dist + (out ? stepAbs * 0.75 * spread[h.ax] : 0);
}
const top = Math.max(...parts.map((p) => p.layer));
for (const p of parts) p.rank = p.layer ? (top - p.layer) / Math.max(1, top - 1) : 0;

// Write one mesh per part into a new buffer.
const chunks = [], views = [], accs = [];
let size = 0;
const add = (bytes, target, stride) => {
  views.push({ buffer: 0, byteOffset: size, byteLength: bytes.length, target, ...(stride ? { byteStride: stride } : {}) });
  chunks.push(bytes); size += bytes.length;
  const pad = (4 - (size % 4)) % 4; if (pad) { chunks.push(Buffer.alloc(pad)); size += pad; }
  return views.length - 1;
};
const meshes = parts.map((p) => {
  const attributes = {};
  for (const [name, ai] of Object.entries(p.prim.attributes)) {
    const A = read(ai), el = A.el, padded = Math.ceil(el / 4) * 4, out = Buffer.alloc(padded * p.vids.length);
    p.vids.forEach((v, i) => A.raw(v).copy(out, i * padded));
    const acc = { bufferView: add(out, 34962, padded !== el ? padded : undefined), componentType: A.a.componentType, count: p.vids.length, type: A.a.type, ...(A.a.normalized ? { normalized: true } : {}) };
    if (name === 'POSITION') { acc.min = p.mn; acc.max = p.mx; }
    accs.push(acc); attributes[name] = accs.length - 1;
  }
  const wide = p.vids.length > 65535, ib = Buffer.alloc(p.idx.length * (wide ? 4 : 2));
  p.idx.forEach((v, i) => (wide ? ib.writeUInt32LE(v, i * 4) : ib.writeUInt16LE(v, i * 2)));
  accs.push({ bufferView: add(ib, 34963), componentType: wide ? 5125 : 5123, count: p.idx.length, type: 'SCALAR' });
  return { primitives: [{ attributes, indices: accs.length - 1, ...(p.prim.material != null ? { material: p.prim.material } : {}) }] };
});
const round = (v) => Math.round(v * 1e5) / 1e5;
const nodes = parts.map((p, i) => ({ mesh: i, name: `part_${String(i).padStart(2, '0')}`, extras: { dir: p.dir, dist: round(p.dist), rank: Math.round(p.rank * 1000) / 1000, glass: p.glass } }));
nodes.push({ name: g.nodes.find((n) => n.mesh != null)?.name ?? 'model', children: parts.map((_, i) => i) });
const bin = path.basename(dst).replace(/\.gltf$/, '.bin');
const out = { ...g, nodes, meshes, accessors: accs, bufferViews: views, buffers: [{ uri: bin, byteLength: size }], scenes: [{ name: 'Scene', nodes: [nodes.length - 1] }], scene: 0 };
delete out.animations; delete out.skins;
writeFileSync(dst, JSON.stringify(out));
writeFileSync(path.join(path.dirname(dst), bin), Buffer.concat(chunks));

const axis = (d) => (d.some((v) => v) ? `${d.find((v) => v) > 0 ? '+' : '-'}${'xyz'[d.findIndex((v) => v)]}` : 'stays');
console.log(`${parts.length} parts (${parts.filter((p) => p.dist > 0).length} move, ${kept.size} body), ${top} layers -> ${dst}`);
for (const [i, p] of parts.entries()) console.log(`  part_${String(i).padStart(2, '0')}  ${String(p.tris).padStart(5)} tris  ${axis(p.dir).padEnd(5)}  ${p.dist.toFixed(4)}  layer ${p.layer}${p.glass ? '  glass' : ''}`);
