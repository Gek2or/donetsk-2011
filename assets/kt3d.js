/* Donetsk 2011 · King's Tower live scene (v7.0)
   WebGL1, no libraries. Orbit camera around the tower; sun from the Donetsk clock or a slider;
   cars and people moving on the OpenStreetMap streets; lit windows, street lamps and the
   facade floodlighting at night; water with reflections; rain and fog; a quiet synthesised
   city sound. What is measured and what is estimated: see the caption and kt3d.json "note". */
(function () {
'use strict';
const TAU = Math.PI * 2;
/* ---------- tiny math ---------- */
const V = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
};
function persp(fovy, asp, n, f) {
  const t = 1 / Math.tan(fovy / 2), m = new Float32Array(16);
  m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m;
}
function ortho(l, r, b, t, n, f) {
  const m = new Float32Array(16);
  m[0] = 2 / (r - l); m[5] = 2 / (t - b); m[10] = -2 / (f - n);
  m[12] = -(r + l) / (r - l); m[13] = -(t + b) / (t - b); m[14] = -(f + n) / (f - n); m[15] = 1; return m;
}
function lookAt(e, c, up) {
  const z = V.norm(V.sub(e, c)), x = V.norm(V.cross(up, z)), y = V.cross(z, x), m = new Float32Array(16);
  m[0] = x[0]; m[4] = x[1]; m[8] = x[2]; m[1] = y[0]; m[5] = y[1]; m[9] = y[2]; m[2] = z[0]; m[6] = z[1]; m[10] = z[2];
  m[12] = -V.dot(x, e); m[13] = -V.dot(y, e); m[14] = -V.dot(z, e); m[15] = 1; return m;
}
function mmul(a, b) {
  const o = new Float32Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s;
  }
  return o;
}
function inv(m) {
  const a = m, o = new Float32Array(16);
  const b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4],
    b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6],
    b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12],
    b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
  let d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!d) return o; d = 1 / d;
  o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * d; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * d;
  o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * d; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * d;
  o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * d; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * d;
  o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * d; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * d;
  o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * d; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * d;
  o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * d; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * d;
  o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * d; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * d;
  o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * d; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * d;
  return o;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/* ---------- ear clipping (roofs, water) ---------- */
function area2(p) { let s = 0; for (let i = 0, n = p.length; i < n; i++) { const a = p[i], b = p[(i + 1) % n]; s += a[0] * b[1] - b[0] * a[1]; } return s; }
function earcut(p) {
  const n = p.length, tris = []; if (n < 3) return tris;
  const idx = []; for (let i = 0; i < n; i++) idx.push(i);
  if (area2(p) < 0) idx.reverse();
  const inTri = (a, b, c, q) => {
    const s1 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
    const s2 = (c[0] - b[0]) * (q[1] - b[1]) - (c[1] - b[1]) * (q[0] - b[0]);
    const s3 = (a[0] - c[0]) * (q[1] - c[1]) - (a[1] - c[1]) * (q[0] - c[0]);
    return s1 >= 0 && s2 >= 0 && s3 >= 0;
  };
  let guard = 0;
  while (idx.length > 3 && guard++ < 5000) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length];
      const a = p[ia], b = p[ib], c = p[ic];
      if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) <= 0) continue;
      let ok = true;
      for (const j of idx) { if (j === ia || j === ib || j === ic) continue; if (inTri(a, b, c, p[j])) { ok = false; break; } }
      if (!ok) continue;
      tris.push(ia, ib, ic); idx.splice(i, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length >= 3) for (let i = 1; i < idx.length - 1; i++) tris.push(idx[0], idx[i], idx[i + 1]);
  return tris;
}

/* ---------- geometry buffer: pos3 nrm3 uv2 mat1 col3 = 12 floats ---------- */
const STRIDE = 12;
class Geo {
  constructor() { this.a = []; }
  v(p, n, uv, m, c) { this.a.push(p[0], p[1], p[2], n[0], n[1], n[2], uv[0], uv[1], m, c[0], c[1], c[2]); }
  tri(p0, p1, p2, m, c, uv0, uv1, uv2, nrm) {
    const n = nrm || V.norm(V.cross(V.sub(p1, p0), V.sub(p2, p0)));
    this.v(p0, n, uv0 || [0, 0], m, c); this.v(p1, n, uv1 || [0, 0], m, c); this.v(p2, n, uv2 || [0, 0], m, c);
  }
  quad(p0, p1, p2, p3, m, c, uv, nrm) { // p0 p1 p2 p3 counter-clockwise
    uv = uv || [[0, 0], [0, 0], [0, 0], [0, 0]];
    this.tri(p0, p1, p2, m, c, uv[0], uv[1], uv[2], nrm); this.tri(p0, p2, p3, m, c, uv[0], uv[2], uv[3], nrm);
  }
  box(cx, cy, z0, w, l, h, ang, m, c) { // w across, l along heading ang
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const P = (s, t, z) => [cx + ca * s - sa * t, cy + sa * s + ca * t, z];
    const s = l / 2, t = w / 2, z1 = z0 + h;
    const pts = [P(-s, -t, 0), P(s, -t, 0), P(s, t, 0), P(-s, t, 0)];
    for (let i = 0; i < 4; i++) {
      const a = pts[i], b = pts[(i + 1) % 4];
      this.quad([a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1], m, c);
    }
    this.quad([pts[0][0], pts[0][1], z1], [pts[1][0], pts[1][1], z1], [pts[2][0], pts[2][1], z1], [pts[3][0], pts[3][1], z1], m, c);
  }
  get n() { return this.a.length / STRIDE; }
}

/* ---------- materials (ids used in the shader) ---------- */
const M = { GROUND: 0, ROAD: 1, WALL: 2, ROOF: 3, BRICK: 4, LOGGIA: 5, GLASSRING: 6, METAL: 7, LEAF: 8, TRUNK: 9,
  BAND: 11, PAVE: 12, CAR: 13, PERSON: 14, STONE: 15, POLE: 16, BANK: 17, CURB: 18, ROADM: 19, HOUSEWALL: 20, ROOFP: 21, BALCG: 22, CARGLASS: 23, LAMPG: 24 };

/* ---------- the tower: same proportions as kt_geom.py ---------- */
const T = { axis: -40.69 * Math.PI / 180, R: 14.4, half: 13.9, floors: 29, fh: 3.0, g: 4.2, glass: 2 };
T.top = T.g + (T.floors - 1) * T.fh;                       // 88.2 m roof
T.shaft = T.g + (T.floors - 1 - T.glass) * T.fh;           // 82.2 m: glass floors start
T.per = 4 * T.half + TAU * T.R;
T.ncol = Math.round(T.per / 2.55); T.pitch = T.per / T.ncol;
T.mast = T.top + 0.9 + 17.5 + 2.5;                         // 109 m
function tw(a, b) { const c = Math.cos(T.axis), s = Math.sin(T.axis); return [a * c - b * s, a * s + b * c]; }
function capsule(s, r) { // arc length s along the capsule (tower coords) -> point, outward normal
  s = ((s % T.per) + T.per) % T.per; const h = T.half, R = T.R;
  if (s < 2 * h) return [[-h + s, -r], [0, -1]];
  s -= 2 * h;
  if (s < Math.PI * R) { const t = -Math.PI / 2 + s / R; return [[h + r * Math.cos(t), r * Math.sin(t)], [Math.cos(t), Math.sin(t)]]; }
  s -= Math.PI * R;
  if (s < 2 * h) return [[h - s, r], [0, 1]];
  s -= 2 * h; const t = Math.PI / 2 + s / R; return [[-h + r * Math.cos(t), r * Math.sin(t)], [Math.cos(t), Math.sin(t)]];
}
const onArc = s => { s = ((s % T.per) + T.per) % T.per; return (s >= 2 * T.half && s < 2 * T.half + Math.PI * T.R) || s >= 4 * T.half + Math.PI * T.R; };
function buildTower(G) {
  const P = (a, b, z) => { const q = tw(a, b); return [q[0], q[1], z]; };
  const N = (a, b) => { const q = tw(a, b); return [q[0], q[1], 0]; };
  const cBrick = [0.62, 0.32, 0.17], cCream = [0.86, 0.76, 0.58], cStone = [0.62, 0.57, 0.5];
  const midCols = new Set();
  for (const sm of [T.half, 3 * T.half + Math.PI * T.R]) { const c = Math.floor(sm / T.pitch); midCols.add(c - 1); midCols.add(c); midCols.add(c + 1); }
  for (let c = 0; c < T.ncol; c++) {
    const s0 = c * T.pitch, s1 = s0 + T.pitch, sm = s0 + T.pitch / 2, arc = onArc(sm);
    const [a0] = capsule(s0, T.R), [a1] = capsule(s1, T.R), [, nm] = capsule(sm, T.R);
    const loggia = midCols.has(c) || (arc && c % 3 === 1);
    const ztop = arc ? T.shaft : T.top;
    const n = N(nm[0], nm[1]);
    const uv = (z0, z1) => [[s0, z0], [s1, z0], [s1, z1], [s0, z1]];
    // ground floor: stone with shop windows (material BRICK handles f==0 as shop)
    G.quad(P(a0[0], a0[1], 0), P(a1[0], a1[1], 0), P(a1[0], a1[1], T.g), P(a0[0], a0[1], T.g), M.BRICK, cStone, uv(0, T.g), n);
    if (loggia) {
      const o = 0.45, b0 = [a0[0] + nm[0] * o, a0[1] + nm[1] * o], b1 = [a1[0] + nm[0] * o, a1[1] + nm[1] * o];
      G.quad(P(b0[0], b0[1], T.g), P(b1[0], b1[1], T.g), P(b1[0], b1[1], ztop), P(b0[0], b0[1], ztop), M.LOGGIA, cCream, uv(T.g, ztop), n);
      for (const [p, q] of [[a0, b0], [a1, b1]]) G.quad(P(p[0], p[1], T.g), P(q[0], q[1], T.g), P(q[0], q[1], ztop), P(p[0], p[1], ztop), M.BAND, cCream);
      // floor slab edges across the loggia front
      const cx = (b0[0] + b1[0]) / 2, cy = (b0[1] + b1[1]) / 2, ang = Math.atan2(tw(b1[0] - b0[0], b1[1] - b0[1])[1], tw(b1[0] - b0[0], b1[1] - b0[1])[0]), L = Math.hypot(b1[0] - b0[0], b1[1] - b0[1]);
      const cw = tw(cx + nm[0] * 0.05, cy + nm[1] * 0.05);
      for (let f = 2; f <= (arc ? 26 : 28); f++) G.box(cw[0], cw[1], T.g + (f - 1) * T.fh - 0.1, 0.12, L + 0.1, 0.2, ang, M.BAND, [0.9, 0.82, 0.66]);
    } else {
      G.quad(P(a0[0], a0[1], T.g), P(a1[0], a1[1], T.g), P(a1[0], a1[1], ztop), P(a0[0], a0[1], ztop), M.BRICK, cBrick, uv(T.g, ztop), n);
      // relief: sill and lintel of every window, air conditioners on some (photos show many)
      const dl = tw(a1[0] - a0[0], a1[1] - a0[1]), L = Math.hypot(dl[0], dl[1]), ang = Math.atan2(dl[1], dl[0]), ux = dl[0] / L, uy = dl[1] / L;
      const mc = tw((a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2), nw = tw(nm[0], nm[1]);
      const R = rng(1000 + c * 37);
      for (let f = 1; f <= (arc ? 26 : 28); f++) {
        const zb = T.g + (f - 1) * T.fh;
        G.box(mc[0] + nw[0] * 0.07, mc[1] + nw[1] * 0.07, zb + 0.73, 0.14, 1.8, 0.1, ang, M.BAND, [0.88, 0.8, 0.64]);
        G.box(mc[0] + nw[0] * 0.03, mc[1] + nw[1] * 0.03, zb + 2.5, 0.06, 1.75, 0.12, ang, M.BAND, [0.86, 0.78, 0.62]);
        if (R() < 0.38) {
          const sd = R() < 0.5 ? -1 : 1, off = sd * (1.55 / 2 + 0.42), x = mc[0] + ux * off + nw[0] * 0.17, y = mc[1] + uy * off + nw[1] * 0.17;
          G.box(x, y, zb + 0.15, 0.3, 0.72, 0.52, ang, M.STONE, [0.83, 0.83, 0.81]);
          G.box(x - ux * 0.0 + nw[0] * 0.151, y + nw[1] * 0.151, zb + 0.22, 0.01, 0.38, 0.38, ang, M.STONE, [0.35, 0.36, 0.37]);
        }
      }
    }
    if (arc) { // glazed top floors, set back 0.5 m
      const r = T.R - 0.5, [g0] = capsule(s0, r), [g1] = capsule(s1, r);
      G.quad(P(g0[0], g0[1], T.shaft), P(g1[0], g1[1], T.shaft), P(g1[0], g1[1], T.top), P(g0[0], g0[1], T.top), M.GLASSRING, [0.1, 0.13, 0.16], uv(T.shaft, T.top), n);
    }
  }
  // paved apron around the tower, 7 m wide (typical; the real layout to be checked on panoramas)
  for (let i = 0; i < 72; i++) {
    const s0 = T.per * i / 72, s1 = T.per * (i + 1) / 72, [p0] = capsule(s0, T.R), [p1] = capsule(s1, T.R), [q0] = capsule(s0, T.R + 7), [q1] = capsule(s1, T.R + 7);
    G.quad(P(p0[0], p0[1], 0.12), P(q0[0], q0[1], 0.12), P(q1[0], q1[1], 0.12), P(p1[0], p1[1], 0.12), M.PAVE, [0.6, 0.58, 0.55], [[s0, 0], [s0, 7], [s1, 7], [s1, 0]], [0, 0, 1]);
    const [n0] = [capsule(s0, T.R + 7)[1]]; G.quad(P(q0[0], q0[1], 0), P(q1[0], q1[1], 0), P(q1[0], q1[1], 0.12), P(q0[0], q0[1], 0.12), M.CURB, [0.68, 0.67, 0.64], null, N(n0[0], n0[1]));
  }
  // belts, cornice: capsule rings
  const ring = (z0, z1, r, m, c) => {
    const n = 72;
    for (let i = 0; i < n; i++) {
      const s0 = T.per * i / n, s1 = T.per * (i + 1) / n, [p0, n0] = capsule(s0, r), [p1] = capsule(s1, r);
      const nn = N(n0[0], n0[1]);
      G.quad(P(p0[0], p0[1], z0), P(p1[0], p1[1], z0), P(p1[0], p1[1], z1), P(p0[0], p0[1], z1), m, c, null, nn);
      const [q0] = capsule(s0, T.R - 0.6), [q1] = capsule(s1, T.R - 0.6);
      G.quad(P(q0[0], q0[1], z1), P(p0[0], p0[1], z1), P(p1[0], p1[1], z1), P(q1[0], q1[1], z1), m, c, null, [0, 0, 1]);
      G.quad(P(q0[0], q0[1], z0), P(q1[0], q1[1], z0), P(p1[0], p1[1], z0), P(p0[0], p0[1], z0), m, c, null, [0, 0, -1]);
    }
  };
  for (const f of [2, 15, 27]) { const z = T.g + (f - 1) * T.fh; ring(z - 0.35, z + 0.15, T.R + 0.75, M.BAND, cCream); }
  ring(T.top, T.top + 0.9, T.R + 0.35, M.BAND, [0.9, 0.84, 0.72]);
  // roof (convex capsule: fan)
  const rp = []; for (let i = 0; i < 48; i++) rp.push(capsule(T.per * i / 48, T.R)[0]);
  for (let i = 0; i < 48; i++) { const a = rp[i], b = rp[(i + 1) % 48]; G.tri(P(0, 0, T.top + 0.9), P(a[0], a[1], T.top + 0.9), P(b[0], b[1], T.top + 0.9), M.ROOF, [0.3, 0.3, 0.3], null, null, null, [0, 0, 1]); }
  // railing: two thin bands
  for (const z of [T.top + 1.4, T.top + 2.0]) {
    for (let i = 0; i < 72; i++) {
      const [p0, n0] = capsule(T.per * i / 72, T.R + 0.1), [p1] = capsule(T.per * (i + 1) / 72, T.R + 0.1);
      G.quad(P(p0[0], p0[1], z - 0.05), P(p1[0], p1[1], z - 0.05), P(p1[0], p1[1], z), P(p0[0], p0[1], z), M.METAL, [0.2, 0.2, 0.21], null, N(n0[0], n0[1]));
    }
  }
  // horns: curved tapered blades, 7 on each round end
  const cHorn = [0.36, 0.11, 0.06];
  for (const sg of [1, -1]) for (let k = 0; k < 7; k++) {
    const t = (sg > 0 ? -Math.PI / 2 : Math.PI / 2) + Math.PI * (k + 0.5) / 7;
    const oa = Math.cos(t), ob = Math.sin(t), a0 = sg * T.half + (T.R + 0.3) * oa, b0 = (T.R + 0.3) * ob;
    let prev = null;
    for (let i = 0; i <= 12; i++) {
      const u = i / 12, ro = 4.6 * Math.pow(u, 1.5), z = T.top - 2.5 + 8.5 * u, w = 1.1 + (0.08 - 1.1) * u;
      const ta = -ob, tb = oa; // tangent
      const c0 = P(a0 + oa * ro + ta * w * 0.5, b0 + ob * ro + tb * w * 0.5, z), c1 = P(a0 + oa * ro - ta * w * 0.5, b0 + ob * ro - tb * w * 0.5, z);
      if (prev) G.quad(prev[0], prev[1], c1, c0, M.METAL, cHorn);
      prev = [c0, c1];
    }
  }
  // lattice mast: four legs and rungs as thin quads
  const base = T.top + 0.9, hw = 1.6, H = 17.5, apex = P(0, 0, base + H);
  const legs = [P(-hw, -hw, base), P(hw, -hw, base), P(hw, hw, base), P(-hw, hw, base)];
  const bar = (p, q, w, c) => { const d = V.norm(V.sub(q, p)), s = V.norm(V.cross(d, [0, 0, 1])); const o = V.mul(s[0] || s[1] ? s : [1, 0, 0], w);
    G.quad(V.sub(p, o), V.add(p, o), V.add(q, o), V.sub(q, o), M.METAL, c); };
  const cMast = [0.55, 0.1, 0.06];
  for (let i = 0; i < 4; i++) {
    bar(legs[i], apex, 0.09, cMast);
    for (let l = 0; l < 6; l++) {
      const f = l / 6, a = V.add(legs[i], V.mul(V.sub(apex, legs[i]), f)), b = V.add(legs[(i + 1) % 4], V.mul(V.sub(apex, legs[(i + 1) % 4]), f));
      bar(a, b, 0.04, cMast);
    }
  }
  bar(apex, [apex[0], apex[1], apex[2] + 2.5], 0.05, cMast);
}

/* ---------- city from kt3d.json ---------- */
function pts(a, from, sc) { const o = []; for (let i = from; i + 1 < a.length; i += 2) o.push([a[i] / sc, a[i + 1] / sc]); return o; }
function obb(p) { // oriented bounding box from the edge directions
  let best = null;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.5) continue;
    const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], v = [-u[1], u[0]];
    let s0 = 1e9, s1 = -1e9, t0 = 1e9, t1 = -1e9;
    for (const q of p) { const s = q[0] * u[0] + q[1] * u[1], t = q[0] * v[0] + q[1] * v[1]; s0 = Math.min(s0, s); s1 = Math.max(s1, s); t0 = Math.min(t0, t); t1 = Math.max(t1, t); }
    const ar = (s1 - s0) * (t1 - t0);
    if (!best || ar < best.ar) best = { ar, u, v, cs: (s0 + s1) / 2, ct: (t0 + t1) / 2, a: (s1 - s0) / 2, b: (t1 - t0) / 2 };
  }
  if (!best) return null;
  if (best.b > best.a) { const u = best.v, v = [-best.u[0], -best.u[1]]; best = { u, v, cs: best.ct, ct: -best.cs, a: best.b, b: best.a }; }
  const c = [best.u[0] * best.cs + best.v[0] * best.ct, best.u[1] * best.cs + best.v[1] * best.ct];
  return { c, u: best.u, v: best.v, a: best.a, b: best.b };
}
const NEAR = 230;   // metres: detailed zone around the tower (owner: about 150 m, plus a margin)
function buildCity(G, D, F) {
  F.props = [];
  const r = rng(2011), hashS = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  // palettes as in the 3D quarter: private houses, apartment blocks, roofs of houses
  const PAL = [[0.93, 0.91, 0.86], [0.91, 0.84, 0.67], [0.73, 0.81, 0.85], [0.62, 0.36, 0.28], [0.86, 0.75, 0.52]];
  const APAL = [[0.86, 0.85, 0.8], [0.75, 0.74, 0.71], [0.86, 0.75, 0.52], [0.62, 0.36, 0.28]];
  const RPH = [[0.42, 0.44, 0.45], [0.55, 0.25, 0.18], [0.3, 0.42, 0.3], [0.5, 0.5, 0.48]];
  const rgbi = v => [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
  const ent = []; for (let i = 0; i + 2 < (D.ent || []).length; i += 3) ent.push([D.ent[i] / 10, D.ent[i + 1] / 10, D.ent[i + 2] * Math.PI / 180]);
  let bi = 0;
  for (const b of D.bld) {
    bi++;
    let p = pts(b, 5, 10); if (p.length < 3) continue;
    if (area2(p) < 0) p = p.reverse();
    const ty = Math.floor(b[1] / 10), h = Math.max(3, b[0] / 10), hk = hashS('b' + bi + ':' + b[5] + ',' + b[6]);
    const near = p.some(q => Math.hypot(q[0], q[1]) < NEAR);
    let col = (ty === 1 || ty === 4) ? APAL[hk % 4] : (ty === 0 || ty === 8) ? PAL[hk % 5] : ty === 2 ? [0.84, 0.82, 0.76] : [0.8, 0.79, 0.75];
    let roofC = (ty === 0 || ty === 8) ? RPH[(hk >>> 4) % 4] : [[0.47, 0.47, 0.46], [0.51, 0.5, 0.48], [0.43, 0.44, 0.44]][(hk >>> 8) % 3];
    if (b[3] >= 0) col = rgbi(b[3]); if (b[4] >= 0) roofC = rgbi(b[4]);
    col = col.map(v => v * 0.82);
    const house = (ty === 0 || ty === 8 || (b[2] & 1)) && h <= 7;
    const apt = (ty === 1 || ty === 4) && h >= 9;
    const parapet = near && !house && h >= 6 ? 0.6 : 0;
    const off = (hk % 400) * 3; let u = off;
    const edges = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], q = p[(i + 1) % p.length], L = Math.hypot(q[0] - a[0], q[1] - a[1]); if (L < 0.05) continue;
      const nn = [(q[1] - a[1]) / L, -(q[0] - a[0]) / L, 0];
      G.quad([a[0], a[1], 0], [q[0], q[1], 0], [q[0], q[1], h + parapet], [a[0], a[1], h + parapet], house ? M.HOUSEWALL : M.WALL, col, [[u, 0], [u + L, 0], [u + L, h + parapet], [u, h + parapet]], nn);
      if (near && h >= 6) { // plinth: darker band at the foot of the wall
        const o = 0.06; G.quad([a[0] + nn[0] * o, a[1] + nn[1] * o, 0], [q[0] + nn[0] * o, q[1] + nn[1] * o, 0], [q[0] + nn[0] * o, q[1] + nn[1] * o, 0.9], [a[0] + nn[0] * o, a[1] + nn[1] * o, 0.9], M.STONE, [0.42, 0.4, 0.37], null, nn);
      }
      edges.push({ a, q, L, nn, u0: u }); u += L;
    }
    if (house) { // hip roof, 24 degrees, with a brick chimney (typical, as in the 3D quarter)
      const o = obb(p);
      if (o) {
        const tn = Math.tan(24 * Math.PI / 180), e = 0.4, rh = o.b * tn, rr = Math.max(0, o.a - o.b), de = e * tn;
        const P2 = (s, t, z) => [o.c[0] + o.u[0] * s + o.v[0] * t, o.c[1] + o.u[1] * s + o.v[1] * t, z];
        const A = P2(-o.a - e, -o.b - e, h - de), B = P2(o.a + e, -o.b - e, h - de), C = P2(o.a + e, o.b + e, h - de), Dd = P2(-o.a - e, o.b + e, h - de), E1 = P2(-rr, 0, h + rh), E2 = P2(rr, 0, h + rh);
        const rc = roofC;
        G.tri(A, B, E2, M.ROOFP, rc); G.tri(A, E2, E1, M.ROOFP, rc); G.tri(C, Dd, E1, M.ROOFP, rc); G.tri(C, E1, E2, M.ROOFP, rc); G.tri(B, C, E2, M.ROOFP, rc); G.tri(Dd, A, E1, M.ROOFP, rc);
        if (near && o.a > 2.5) { const sx = (hk % 2 ? 0.45 : -0.45) * o.a, sy = o.b * 0.25, c = P2(sx, sy, 0); G.box(c[0], c[1], h + rh * 0.4, 0.55, 0.55, rh * 0.6 + 1.0, Math.atan2(o.u[1], o.u[0]), M.STONE, [0.55, 0.3, 0.24]); }
      }
    } else {
      const tr = earcut(p), rc = roofC.map(v => v * 0.7);
      for (let i = 0; i < tr.length; i += 3) G.tri([p[tr[i]][0], p[tr[i]][1], h], [p[tr[i + 1]][0], p[tr[i + 1]][1], h], [p[tr[i + 2]][0], p[tr[i + 2]][1], h], M.ROOF, rc, null, null, null, [0, 0, 1]);
      if (parapet) for (const ed of edges) { // inner face of the parapet
        const ii = 0.25, a = ed.a, q = ed.q, n = ed.nn;
        G.quad([q[0] - n[0] * ii, q[1] - n[1] * ii, h], [a[0] - n[0] * ii, a[1] - n[1] * ii, h], [a[0] - n[0] * ii, a[1] - n[1] * ii, h + parapet], [q[0] - n[0] * ii, q[1] - n[1] * ii, h + parapet], M.STONE, col.map(v => v * 0.8), null, [-n[0], -n[1], 0]);
        G.quad([a[0], a[1], h + parapet], [q[0], q[1], h + parapet], [q[0] - n[0] * ii, q[1] - n[1] * ii, h + parapet], [a[0] - n[0] * ii, a[1] - n[1] * ii, h + parapet], M.STONE, col.map(v => v * 0.9), null, [0, 0, 1]);
      }
      if (near && apt) {
        // roof exits: one small box per ~25 m of the longest edge (typical for panel blocks)
        const o = obb(p); if (o) { const n = Math.max(1, Math.round(o.a * 2 / 25)); for (let k = 0; k < n; k++) { const s = -o.a + (k + 0.5) * 2 * o.a / n, c = [o.c[0] + o.u[0] * s, o.c[1] + o.u[1] * s]; G.box(c[0], c[1], h, 3.2, 4.2, 2.2, Math.atan2(o.u[1], o.u[0]), M.STONE, col.map(v => v * 0.85)); } }
        // balconies on the two longest walls, every window column, from the 2nd floor (typical; the actual side is to be checked on panoramas)
        const long = edges.slice().sort((x, y) => y.L - x.L).slice(0, 2);
        const floors = Math.floor(h / 2.8);
        for (const ed of long) {
          if (ed.L < 10) continue;
          const dx = (ed.q[0] - ed.a[0]) / ed.L, dy = (ed.q[1] - ed.a[1]) / ed.L, n = ed.nn;
          const first = Math.ceil(ed.u0 / 3) * 3 - ed.u0;
          for (let s = first; s + 3 <= ed.L; s += 3) {
            const colIx = Math.floor((ed.u0 + s) / 3), glazed = hashS('g' + bi + ':' + colIx) % 3 === 0;
            if (hashS('c' + bi + ':' + colIx) % 2) continue;   // every other column, the others are windows
            for (let f = 1; f < floors; f++) {
              const z = f * 2.8, cx = ed.a[0] + dx * (s + 1.5) + n[0] * 0.6, cy = ed.a[1] + dy * (s + 1.5) + n[1] * 0.6, ang = Math.atan2(dy, dx);
              G.box(cx, cy, z - 0.12, 1.2, 2.7, 0.14, ang, M.STONE, [0.62, 0.61, 0.58]);
              const fc = glazed ? [0.55, 0.6, 0.62] : col.map(v => v * 0.95);
              const P = (t, w, zz) => [cx + dx * t + n[0] * w, cy + dy * t + n[1] * w, zz];
              G.quad(P(-1.35, 0.6, z), P(1.35, 0.6, z), P(1.35, 0.6, z + (glazed ? 2.5 : 1.0)), P(-1.35, 0.6, z + (glazed ? 2.5 : 1.0)), glazed ? M.BALCG : M.STONE, fc, null, n);
              for (const t of [-1.35, 1.35]) G.quad(P(t, -0.6, z), P(t, 0.6, z), P(t, 0.6, z + (glazed ? 2.5 : 1.0)), P(t, -0.6, z + (glazed ? 2.5 : 1.0)), M.STONE, fc.map(v => v * 0.9));
              if (glazed) G.box(cx, cy, z + 2.5, 1.2, 2.7, 0.08, ang, M.STONE, [0.5, 0.5, 0.5]);
            }
          }
        }
      }
    }
    // entrances on this building: canopy over a dark door (OSM entrance nodes)
    if (near && h >= 6) for (const e of ent) {
      let bestE = null, bd = 2.5;
      for (const ed of edges) { const t = Math.max(0, Math.min(ed.L, (e[0] - ed.a[0]) * (ed.q[0] - ed.a[0]) / ed.L + (e[1] - ed.a[1]) * (ed.q[1] - ed.a[1]) / ed.L)); const x = ed.a[0] + (ed.q[0] - ed.a[0]) * t / ed.L, y = ed.a[1] + (ed.q[1] - ed.a[1]) * t / ed.L, d = Math.hypot(e[0] - x, e[1] - y); if (d < bd) { bd = d; bestE = { ed, x, y }; } }
      if (!bestE) continue;
      const { ed, x, y } = bestE, n = ed.nn, dx = (ed.q[0] - ed.a[0]) / ed.L, dy = (ed.q[1] - ed.a[1]) / ed.L, ang = Math.atan2(dy, dx);
      const P = (t, w, z) => [x + dx * t + n[0] * w, y + dy * t + n[1] * w, z];
      G.quad(P(-0.6, 0.03, 0), P(0.6, 0.03, 0), P(0.6, 0.03, 2.2), P(-0.6, 0.03, 2.2), M.STONE, [0.25, 0.2, 0.17], null, n);
      G.box(x + n[0] * 0.7, y + n[1] * 0.7, 2.5, 1.5, 2.4, 0.15, ang, M.STONE, [0.6, 0.6, 0.58]);
      G.box(x + n[0] * 0.8, y + n[1] * 0.8, 0, 1.7, 2.0, 0.15, ang, M.STONE, [0.55, 0.54, 0.52]);
      const bp = P(2.4, 1.5, 0), up = P(-1.5, 1.2, 0);
      bench(G, bp[0], bp[1], ang + Math.PI); urn(G, up[0], up[1]);
      F.props.push([bp[0], bp[1]]);
    }
  }
  // roads: asphalt, pavements with kerbs near the tower, a dashed centre line on the wide ones
  for (const rd of D.roads) {
    const w = Math.max(4, rd[0] / 10), p = pts(rd, 3, 10), near = p.some(q => Math.hypot(q[0], q[1]) < NEAR + 60);
    let s = 0;
    for (let i = 0; i + 1 < p.length; i++) {
      const a = p[i], b = p[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.05) continue;
      const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
      const ext = Math.min(1.5, L * 0.5);   // small overlap hides the gaps at the bends
      if (w >= 6) {
        const pv = near ? 2.8 : 2.6, zp = near ? 0.15 : 0.05;
        for (const sd of [1, -1]) {
          const h0 = sd * w / 2, h1 = sd * (w / 2 + pv);
          G.quad([a[0] + nx * h0, a[1] + ny * h0, zp], [b[0] + nx * h0, b[1] + ny * h0, zp], [b[0] + nx * h1, b[1] + ny * h1, zp], [a[0] + nx * h1, a[1] + ny * h1, zp], M.PAVE, [0.55, 0.54, 0.51], [[s, 0], [s + L, 0], [s + L, pv], [s, pv]], [0, 0, 1]);
          if (near) { // kerb face and outer edge
            G.quad([a[0] + nx * h0, a[1] + ny * h0, 0.08], [b[0] + nx * h0, b[1] + ny * h0, 0.08], [b[0] + nx * h0, b[1] + ny * h0, zp], [a[0] + nx * h0, a[1] + ny * h0, zp], M.CURB, [0.7, 0.69, 0.66], null, [-nx * sd, -ny * sd, 0]);
            G.quad([a[0] + nx * h1, a[1] + ny * h1, 0], [b[0] + nx * h1, b[1] + ny * h1, 0], [b[0] + nx * h1, b[1] + ny * h1, zp], [a[0] + nx * h1, a[1] + ny * h1, zp], M.CURB, [0.6, 0.59, 0.56], null, [nx * sd, ny * sd, 0]);
          }
        }
      }
      const ax = a[0] - (b[0] - a[0]) / L * ext * (i ? 1 : 0), ay = a[1] - (b[1] - a[1]) / L * ext * (i ? 1 : 0);
      G.quad([ax + nx * w / 2, ay + ny * w / 2, 0.08], [b[0] + nx * w / 2, b[1] + ny * w / 2, 0.08], [b[0] - nx * w / 2, b[1] - ny * w / 2, 0.08], [ax - nx * w / 2, ay - ny * w / 2, 0.08], w >= 6 && near ? M.ROADM : M.ROAD, [0.16, 0.16, 0.17], [[s, w / 2], [s + L, w / 2], [s + L, -w / 2], [s, -w / 2]], [0, 0, 1]);
      s += L;
    }
  }
  // water banks: a slope from the shore down under the water line (grass to the waterline, as on the October 2011 panoramas)
  for (const wa of D.water) {
    const p = pts(wa, 0, 10); if (p.length < 3) continue;
    const ccw = area2(p) > 0;
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.1) continue;
      const nx = -(b[1] - a[1]) / L * (ccw ? 1 : -1), ny = (b[0] - a[0]) / L * (ccw ? 1 : -1), o = 5; // into the water
      const nrm = V.norm([-nx * 1.6, -ny * 1.6, o]);
      G.quad([a[0], a[1], 0.02], [b[0], b[1], 0.02], [b[0] + nx * o, b[1] + ny * o, -1.7], [a[0] + nx * o, a[1] + ny * o, -1.7], M.BANK, [0.42, 0.4, 0.36], [[0, 0], [L, 0], [L, o], [0, o]], nrm);
    }
  }
  // trees: detailed ones near the tower go to the foliage builder, simple crowns further away
  const ico = (() => {
    const t = (1 + Math.sqrt(5)) / 2, v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(V.norm);
    const f = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
    return { v, f };
  })();
  const leafCols = [[0.3, 0.36, 0.12], [0.42, 0.42, 0.13], [0.55, 0.46, 0.14], [0.36, 0.38, 0.12], [0.6, 0.38, 0.1], [0.26, 0.32, 0.12]];
  const tr = D.trees;
  // trees by the water: willows and poplars (October 2011 panoramas of the embankment); the species mix is an estimate
  const segD = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L)); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); };
  const WE = []; for (const wa of D.water) { const p = pts(wa, 0, 10); for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; if (segD(0, 0, a, b) < NEAR + 60) WE.push([a, b]); } }
  const byWater = (x, y, d) => WE.some(e => segD(x, y, e[0], e[1]) < d);
  for (let i = 0; i + 2 < tr.length; i += 3) {
    const x = tr[i] / 10, y = tr[i + 1] / 10, k = tr[i + 2];
    if (Math.hypot(x, y) < NEAR) { treeDetailed(G, F, x, y, byWater(x, y, 24) ? 3 : k, rng(hashS('t' + i))); continue; }
    const s = (k === 2 ? 2.6 : 3.2) + r() * 1.6, h = s * 1.5;
    G.box(x, y, 0, 0.35, 0.35, h, 0, M.TRUNK, [0.22, 0.17, 0.13]);
    const lc = leafCols[Math.floor(r() * leafCols.length)];
    for (let l = 0; l < 2; l++) {
      const ox = (r() - 0.5) * s, oy = (r() - 0.5) * s, oz = h + s * 0.4 + (r() - 0.3) * s * 0.6, sc = s * (0.6 + r() * 0.3);
      const c = mix3(lc, [lc[0] * 1.2, lc[1] * 1.15, lc[2]], r());
      for (let f = 0; f < ico.f.length; f += 3) {
        const A = ico.v[ico.f[f]], B = ico.v[ico.f[f + 1]], C = ico.v[ico.f[f + 2]];
        const P = q => [x + ox + q[0] * sc, y + oy + q[1] * sc, oz + q[2] * sc * 0.85];
        G.v(P(A), A, [h, 0], M.LEAF, c); G.v(P(B), B, [h, 0], M.LEAF, c); G.v(P(C), C, [h, 0], M.LEAF, c);
      }
    }
  }
  // objects placed from the October 2011 street panoramas (looked at, never copied) and raw OSM: kt3d.json "areas", "props", "lines"
  const PK0 = [[0.75, 0.75, 0.73], [0.5, 0.08, 0.08], [0.12, 0.2, 0.4], [0.1, 0.1, 0.11], [0.62, 0.62, 0.6], [0.2, 0.36, 0.22], [0.82, 0.8, 0.7], [0.45, 0.4, 0.3]];
  const ACOL = { dirt: [0.42, 0.36, 0.28], waste: [0.55, 0.5, 0.33], sand: [0.68, 0.6, 0.45], pave: [0.6, 0.53, 0.5] };
  for (const ar of D.areas || []) { const t = ar[0]; let p = pts(ar, 1, 10); if (p.length < 3) continue; if (area2(p) < 0) p = p.reverse();
    const road = t === 'parking' || t === 'asphalt', z = road ? 0.05 : t === 'pave' ? 0.11 : 0.025, m = road ? M.ROAD : t === 'pave' ? M.PAVE : M.ROOF, c = ACOL[t] || [0.4, 0.4, 0.4];
    for (const [i, j, k] of (() => { const o = [], tt = earcut(p); for (let q = 0; q + 2 < tt.length; q += 3) o.push([tt[q], tt[q + 1], tt[q + 2]]); return o; })())
      G.tri([p[i][0], p[i][1], z], [p[j][0], p[j][1], z], [p[k][0], p[k][1], z], m, c, [p[i][0], p[i][1]], [p[j][0], p[j][1]], [p[k][0], p[k][1]], [0, 0, 1]);
    if (t === 'parking') for (let i = 0; i < p.length; i++) { // bays: white lines square to the long edges, 2.6 m apart, 5 m deep
      const a = p[i], b = p[(i + 1) % p.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 9) continue;
      const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;   // inward normal (polygon is counter-clockwise)
      for (let d = 1.2; d <= L - 1.2; d += 2.6) { const x = a[0] + ux * d, y = a[1] + uy * d;
        G.quad([x - ux * 0.06, y - uy * 0.06, 0.065], [x + ux * 0.06, y + uy * 0.06, 0.065], [x + ux * 0.06 + nx * 5, y + uy * 0.06 + ny * 5, 0.065], [x - ux * 0.06 + nx * 5, y - uy * 0.06 + ny * 5, 0.065], M.CURB, [0.8, 0.8, 0.76], null, [0, 0, 1]); }
    }
  }
  const PR = D.props || [];
  for (const q of PR) { const t = q[0], x = q[1] / 10, y = q[2] / 10, a = (q[3] || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), P = (s, w) => [x + ca * s - sa * w, y + sa * s + ca * w];
    if (t === 'bench') bench(G, x, y, a); else if (t === 'urn') urn(G, x, y);
    else if (t === 'kiosk') { G.box(x, y, 0, 2.4, 3.2, 2.5, a, M.STONE, [0.75, 0.75, 0.72]); G.box(x, y, 2.5, 2.8, 3.6, 0.12, a, M.STONE, [0.55, 0.15, 0.12]); }
    else if (t === 'stop') { G.box(x, y, 2.4, 1.8, 4.2, 0.1, a, M.STONE, [0.5, 0.55, 0.58]); G.box(x + sa * 0.8, y - ca * 0.8, 0, 0.08, 4.0, 2.4, a, M.BALCG, [0.6, 0.65, 0.68]); bench(G, x + sa * 0.4, y - ca * 0.4, a); }
    else if (t === 'container') { const c = q[4] ? rgbi(q[4]) : [0.3, 0.38, 0.3]; G.box(x, y, 0.12, 1.2, 1.3, 1.05, a, M.STONE, c); G.box(x, y, 1.17, 1.25, 1.35, 0.1, a, M.STONE, c.map(v => v * 0.8)); for (const s of [-0.5, 0.5]) for (const w of [-0.45, 0.45]) { const r = P(s, w); G.box(r[0], r[1], 0, 0.1, 0.1, 0.13, a, M.TRUNK, [0.06, 0.06, 0.06]); } }
    else if (t === 'bollard') G.box(x, y, 0, 0.2, 0.2, 0.8, a, M.POLE, [0.3, 0.3, 0.3]);
    else if (t === 'sign') { G.box(x, y, 0, 0.06, 0.06, 2.6, a, M.POLE, [0.6, 0.6, 0.6]); G.box(x, y, 2.0, 0.04, 0.6, 0.6, a, M.STONE, [0.85, 0.85, 0.85]); }
    else if (t === 'tree') treeDetailed(G, F, x, y, !q[5] && byWater(x, y, 24) ? 3 : q[4] in SPK ? q[4] : 0, rng(q[1] * 31 + q[2]), q[5]);
    else if (t === 'car') carModel(G, x, y, a, PK0[(q[4] || 0) % PK0.length], false);
    else if (t === 'booth') { // small guard booth: walls, a window band, a flat roof with an overhang
      const c = q[4] ? rgbi(q[4]) : [0.55, 0.2, 0.15]; G.box(x, y, 0, 2.0, 2.2, 2.3, a, M.STONE, c); G.box(x, y, 1.15, 2.04, 2.24, 0.75, a, M.BALCG, [0.45, 0.5, 0.52]); G.box(x, y, 2.3, 2.5, 2.7, 0.14, a, M.STONE, c.map(v => v * 0.7)); }
    else if (t === 'cont20') { const c = q[4] ? rgbi(q[4]) : [0.2, 0.33, 0.6]; G.box(x, y, 0, 2.44, 6.06, 2.6, a, M.STONE, c); for (let s = -2.9; s <= 2.9; s += 0.3) { const r = P(s, 0); G.box(r[0], r[1], 0.05, 2.47, 0.06, 2.5, a, M.STONE, c.map(v => v * 0.85)); } }
    else if (t === 'stair') { // outdoor flight of steps up to the first-floor terrace, red railings
      const L = (q[4] || 40) / 10, H = (q[5] || 25) / 10, n = Math.max(3, Math.round(H / 0.16)), W = 1.6;
      for (let k = 0; k < n; k++) { const r = P(-L / 2 + (k + 0.5) * L / n, 0); G.box(r[0], r[1], 0, W, L / n + 0.02, (k + 1) * H / n, a, M.STONE, [0.68, 0.66, 0.62]); }
      for (const w of [-W / 2, W / 2]) { for (let k = 0; k <= 4; k++) { const r = P(-L / 2 + k * L / 4, w); G.box(r[0], r[1], k * H / 4, 0.05, 0.05, 1.0, a, M.POLE, [0.55, 0.12, 0.1]); }
        const r0 = P(-L / 2, w), r1 = P(L / 2, w); G.quad([r0[0], r0[1], 0.95], [r1[0], r1[1], H + 0.95], [r1[0], r1[1], H + 1.02], [r0[0], r0[1], 1.02], M.POLE, [0.55, 0.12, 0.1]); }
    }
    else if (t === 'globe') { F.globes = F.globes || []; F.globes.push([x, y]); }
    else if (t === 'pole') { // utility pole: tapered concrete post, a cross-arm with insulators
      const H = (q[4] || 85) / 10; G.box(x, y, 0, 0.26, 0.26, H * 0.5, a, M.STONE, [0.55, 0.54, 0.5]); G.box(x, y, H * 0.5, 0.18, 0.18, H * 0.5, a, M.STONE, [0.55, 0.54, 0.5]);
      G.box(x, y, H - 0.6, 0.1, 1.6, 0.1, a, M.POLE, [0.25, 0.25, 0.25]); for (const s of [-0.7, 0, 0.7]) { const r = P(s, 0); G.box(r[0], r[1], H - 0.5, 0.08, 0.08, 0.16, 0, M.STONE, [0.85, 0.85, 0.8]); }
    }
    else if (t === 'zebra') { // pedestrian crossing: stripes along the traffic, 0.5 m wide, 1 m apart, across the carriageway
      const W = (q[4] || 70) / 10, len = (q[5] || 30) / 10;
      for (let w = -W / 2 + 0.5; w <= W / 2 - 0.4; w += 1.0) { const r = P(0, w); G.box(r[0], r[1], 0.082, 0.5, len, 0.004, a, M.CURB, [0.86, 0.86, 0.82]); }
    }
    else if (t === 'climb') { const c = [0.15, 0.45, 0.22], H = 2.2; for (const s of [-1.2, 0, 1.2]) for (const w of [-0.9, 0.9]) { const r = P(s, w); G.box(r[0], r[1], 0, 0.07, 0.07, H, a, M.POLE, c); }
      for (const z of [0.7, 1.4, 2.15]) for (const w of [-0.9, 0.9]) { const r = P(0, w); G.box(r[0], r[1], z, 0.05, 2.45, 0.05, a, M.POLE, c); }
      for (let s = -1.2; s <= 1.21; s += 0.4) { const r = P(s, 0); G.box(r[0], r[1], 2.15, 1.85, 0.05, 0.05, a, M.POLE, c); } }
    else if (t === 'swing') { const c = [0.5, 0.5, 0.52]; for (const s of [-1.4, 1.4]) for (const w of [-0.7, 0.7]) { const r = P(s, w * 0.35); G.box(r[0] + (w > 0 ? 1 : -1) * 0.0, r[1], 0, 0.07, 0.07, 2.4, a, M.POLE, c); }
      G.box(x, y, 2.35, 0.08, 3.0, 0.08, a, M.POLE, c); for (const s of [-0.6, 0.6]) { const r = P(s, 0); G.box(r[0], r[1], 0.45, 0.03, 0.03, 1.9, a, M.POLE, [0.3, 0.3, 0.3]); G.box(r[0], r[1], 0.42, 0.25, 0.5, 0.05, a, M.TRUNK, [0.6, 0.25, 0.15]); } }
    else if (t === 'slide') { const c = [0.25, 0.4, 0.7]; G.box(x, y, 0, 1.0, 1.0, 1.4, a, M.STONE, [0.7, 0.6, 0.2]); const r0 = P(0.5, -0.35), r1 = P(3.0, -0.35), r2 = P(3.0, 0.35), r3 = P(0.5, 0.35);
      G.quad([r0[0], r0[1], 1.4], [r1[0], r1[1], 0.25], [r2[0], r2[1], 0.25], [r3[0], r3[1], 1.4], M.METAL, c, null, V.norm([ca * 0.45, sa * 0.45, 1])); const s0 = P(-1.4, 0); G.box(s0[0], s0[1], 0, 0.6, 1.0, 0.05, a, M.POLE, c); }
    else if (t === 'sandbox') { const c = [0.5, 0.33, 0.2]; for (const [s, w, l, ww] of [[0, -1.2, 2.5, 0.1], [0, 1.2, 2.5, 0.1], [-1.2, 0, 0.1, 2.5], [1.2, 0, 0.1, 2.5]]) { const r = P(s, w); G.box(r[0], r[1], 0, ww, l, 0.3, a, M.TRUNK, c); }
      G.box(x, y, 0, 2.3, 2.3, 0.2, a, M.ROOF, [0.72, 0.64, 0.46]); }
  }
  const FCOL = { fence_metal: [0.2, 0.22, 0.2], fence_green: [0.16, 0.42, 0.22], fence_blue: [0.18, 0.32, 0.55] };
  const SCOL = { fence_sheet: [0.6, 0.62, 0.63], fence_sheet_blue: [0.18, 0.33, 0.62], fence_sheet_old: [0.68, 0.68, 0.66] };
  for (const l of D.lines || []) { const t = l[0], h = l[1] / 10, p = pts(l, 2, 10), wires = [];
    for (let i = 0; i + 1 < p.length; i++) { const a = p[i], b = p[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.05) continue; const n = [-(b[1] - a[1]) / L, (b[0] - a[0]) / L, 0], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (FCOL[t]) { const fc = FCOL[t]; for (let s2 = 0; s2 <= L; s2 += 2.5) { const x = a[0] + (b[0] - a[0]) * s2 / L, y = a[1] + (b[1] - a[1]) * s2 / L; G.box(x, y, 0, 0.05, 0.05, h, 0, M.POLE, fc); }
        G.quad([a[0], a[1], h - 0.08], [b[0], b[1], h - 0.08], [b[0], b[1], h], [a[0], a[1], h], M.POLE, fc, null, n); G.quad([a[0], a[1], 0.1], [b[0], b[1], 0.1], [b[0], b[1], 0.18], [a[0], a[1], 0.18], M.POLE, fc, null, n);
        for (let s2 = 0.25; s2 < L; s2 += 0.25) { const x = a[0] + (b[0] - a[0]) * s2 / L, y = a[1] + (b[1] - a[1]) * s2 / L; G.box(x, y, 0.18, 0.02, 0.02, h - 0.26, 0, M.POLE, fc); } }   // vertical bars
      else if (SCOL[t]) { // corrugated sheet fence: ribs as alternating strips, posts behind
        const c = SCOL[t]; for (let s2 = 0; s2 < L; s2 += 0.6) { const e = Math.min(L, s2 + 0.6), k = (Math.floor(s2 / 0.6) % 2) ? 0.9 : 1.04;
          const pA = [a[0] + (b[0] - a[0]) * s2 / L, a[1] + (b[1] - a[1]) * s2 / L], pB = [a[0] + (b[0] - a[0]) * e / L, a[1] + (b[1] - a[1]) * e / L];
          G.quad([pA[0], pA[1], 0.08], [pB[0], pB[1], 0.08], [pB[0], pB[1], h], [pA[0], pA[1], h], M.STONE, c.map(v => v * k), null, n); }
        for (let s2 = 0; s2 <= L; s2 += 3) { const x = a[0] + (b[0] - a[0]) * s2 / L - n[0] * 0.08, y = a[1] + (b[1] - a[1]) * s2 / L - n[1] * 0.08; G.box(x, y, 0, 0.08, 0.08, h, ang, M.POLE, [0.25, 0.22, 0.2]); } }
      else if (t === 'fence_concrete') { // precast panels 2 m long with posts
        for (let s2 = 0; s2 < L; s2 += 2) { const e = Math.min(L, s2 + 2), pA = [a[0] + (b[0] - a[0]) * s2 / L, a[1] + (b[1] - a[1]) * s2 / L], pB = [a[0] + (b[0] - a[0]) * e / L, a[1] + (b[1] - a[1]) * e / L];
          G.box((pA[0] + pB[0]) / 2, (pA[1] + pB[1]) / 2, 0, 0.12, e - s2, h, ang, M.STONE, [0.6, 0.59, 0.56].map(v => v * (0.94 + 0.08 * ((s2 / 2) % 2)))); G.box(pA[0], pA[1], 0, 0.22, 0.22, h + 0.1, ang, M.STONE, [0.55, 0.54, 0.52]); } }
      else if (t === 'path') G.quad([a[0] + n[0] * h / 2, a[1] + n[1] * h / 2, 0.06], [b[0] + n[0] * h / 2, b[1] + n[1] * h / 2, 0.06], [b[0] - n[0] * h / 2, b[1] - n[1] * h / 2, 0.06], [a[0] - n[0] * h / 2, a[1] - n[1] * h / 2, 0.06], M.PAVE, [0.55, 0.53, 0.5], null, [0, 0, 1]);
      else if (t === 'parapet') G.box((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0, 0.4, L + 0.4, h, ang, M.STONE, [0.7, 0.68, 0.64]);
      else if (t === 'podium') { G.box((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0, 0.35, L + 0.35, h * 0.55, ang, M.STONE, [0.42, 0.42, 0.4]); G.box((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, h * 0.55, 0.4, L + 0.4, h * 0.45, ang, M.STONE, [0.8, 0.72, 0.66]); }
      else if (t === 'chain') { // anchor chain hung between low posts (embankment)
        for (let s2 = 0; s2 <= L; s2 += 2.5) { const x = a[0] + (b[0] - a[0]) * s2 / L, y = a[1] + (b[1] - a[1]) * s2 / L; G.box(x, y, 0, 0.14, 0.14, h, 0, M.POLE, [0.12, 0.12, 0.12]); }
        for (let s2 = 0; s2 < L; s2 += 0.25) { const e = Math.min(L, s2 + 0.25), f = v => h - 0.12 - 0.3 * Math.sin(Math.PI * ((v % 2.5) / 2.5)), x0 = a[0] + (b[0] - a[0]) * s2 / L, y0 = a[1] + (b[1] - a[1]) * s2 / L, x1 = a[0] + (b[0] - a[0]) * e / L, y1 = a[1] + (b[1] - a[1]) * e / L;
          G.box((x0 + x1) / 2, (y0 + y1) / 2, Math.min(f(s2), f(e)) - 0.03, 0.06, e - s2 + 0.03, Math.abs(f(s2) - f(e)) + 0.06, ang, M.POLE, [0.1, 0.1, 0.1]); } }
      else if (t === 'wire') { // overhead line between pole tops, sagging
        const N = Math.max(4, Math.round(L / 3)), f = u => h - 0.5 - 0.9 * 4 * u * (1 - u);
        for (const off of [-0.7, 0, 0.7]) for (let k = 0; k < N; k++) { const u0 = k / N, u1 = (k + 1) / N, x0 = a[0] + (b[0] - a[0]) * u0 + n[0] * off, y0 = a[1] + (b[1] - a[1]) * u0 + n[1] * off, x1 = a[0] + (b[0] - a[0]) * u1 + n[0] * off, y1 = a[1] + (b[1] - a[1]) * u1 + n[1] * off;
          G.box((x0 + x1) / 2, (y0 + y1) / 2, Math.min(f(u0), f(u1)), 0.025, L / N + 0.02, Math.abs(f(u0) - f(u1)) + 0.025, ang, M.POLE, [0.08, 0.08, 0.08]); } }
    } }
  // parked cars (estimated placements of the 3D quarter)
  const PK = [[0.75, 0.75, 0.73], [0.5, 0.08, 0.08], [0.12, 0.2, 0.4], [0.1, 0.1, 0.11], [0.62, 0.62, 0.6], [0.2, 0.36, 0.22], [0.82, 0.8, 0.7], [0.45, 0.4, 0.3]];
  const pk = D.cars;
  for (let i = 0; i + 3 < pk.length; i += 4) {
    const x = pk[i] / 10, y = pk[i + 1] / 10, a = pk[i + 2] * Math.PI / 180, c = PK[pk[i + 3] % PK.length];
    carModel(G, x, y, a, c, false);
  }
}
function lampModel(G, x, y, ax, ay) { // ax, ay: unit vector from the pole towards the road
  const seg = 6, H = 8.6, r0 = 0.11, r1 = 0.06, c = [0.33, 0.35, 0.36];
  for (let i = 0; i < seg; i++) {
    const a = TAU * i / seg, b = TAU * (i + 1) / seg, n = [Math.cos((a + b) / 2), Math.sin((a + b) / 2), 0];
    G.quad([x + Math.cos(a) * r0, y + Math.sin(a) * r0, 0], [x + Math.cos(b) * r0, y + Math.sin(b) * r0, 0], [x + Math.cos(b) * r1, y + Math.sin(b) * r1, H], [x + Math.cos(a) * r1, y + Math.sin(a) * r1, H], M.POLE, c, null, n);
  }
  G.box(x, y, 0, 0.32, 0.32, 0.5, Math.atan2(ay, ax), M.POLE, c);
  let px = x, py = y, pz = H;
  for (let k = 1; k <= 4; k++) { // the arm bends out over the road
    const t = k / 4, nx = x + ax * 1.6 * t, ny = y + ay * 1.6 * t, nz = H + 0.55 * Math.sin(t * Math.PI * 0.6);
    const L = Math.hypot(nx - px, ny - py, nz - pz), a = Math.atan2(ny - py, nx - px);
    G.box((px + nx) / 2, (py + ny) / 2, Math.min(pz, nz) - 0.03, 0.07, L, Math.abs(nz - pz) + 0.07, a, M.POLE, c);
    px = nx; py = ny; pz = nz;
  }
  G.box(px + ax * 0.25, py + ay * 0.25, pz - 0.18, 0.32, 0.75, 0.16, Math.atan2(ay, ax), M.POLE, [0.25, 0.27, 0.28]);
  G.box(px + ax * 0.25, py + ay * 0.25, pz - 0.26, 0.24, 0.5, 0.09, Math.atan2(ay, ax), M.LAMPG, [0.95, 0.85, 0.6]);
  return [px + ax * 0.25, py + ay * 0.25, pz - 0.28];
}
/* typical yard furniture at the entrances of the blocks of flats: a bench and a litter bin (illustrative) */
function bench(G, x, y, a) {
  const ca = Math.cos(a), sa = Math.sin(a), wood = [0.42, 0.27, 0.16], iron = [0.16, 0.16, 0.17];
  for (const s of [-0.75, 0.75]) G.box(x + ca * s, y + sa * s, 0, 0.42, 0.06, 0.42, a, M.POLE, iron);
  for (let k = 0; k < 3; k++) G.box(x - sa * (k * 0.12 - 0.12), y + ca * (k * 0.12 - 0.12), 0.42, 0.1, 1.8, 0.035, a, M.TRUNK, wood);
  for (let k = 0; k < 2; k++) G.box(x - sa * -0.2, y + ca * -0.2, 0.55 + k * 0.14, 0.035, 1.8, 0.09, a, M.TRUNK, wood);
}
function urn(G, x, y) {
  const seg = 6, r = 0.22, h = 0.75, c = [0.3, 0.33, 0.3];
  for (let i = 0; i < seg; i++) { const a = TAU * i / seg, b = TAU * (i + 1) / seg, n = [Math.cos((a + b) / 2), Math.sin((a + b) / 2), 0];
    G.quad([x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, 0], [x + Math.cos(b) * r * 0.8, y + Math.sin(b) * r * 0.8, 0], [x + Math.cos(b) * r, y + Math.sin(b) * r, h], [x + Math.cos(a) * r, y + Math.sin(a) * r, h], M.STONE, c, null, n); }
}
/* a walking person: legs and arms swing, autumn clothes; an umbrella in the rain */
function personModel(G, x, y, z, a, ph, walk, c, umb, far) {
  const ca = Math.cos(a), sa = Math.sin(a), P = (s, t, zz) => [x + ca * s - sa * t, y + sa * s + ca * t, zz];
  if (far) { G.box(x, y, z, 0.45, 0.35, 1.0, a, M.PERSON, c.legs); G.box(x, y, z + 1.0, 0.5, 0.32, 0.72, a, M.PERSON, c.coat); return; }
  const sw = walk ? Math.sin(ph) * 0.32 : 0, bob = walk ? Math.abs(Math.cos(ph)) * 0.04 : 0;
  const limb = (s0, t, z0, len, w, ang, col) => { // swinging limb: rotate about the joint at height z0
    const s1 = s0 + Math.sin(ang) * len, z1 = z0 - Math.cos(ang) * len, q = P((s0 + s1) / 2, t, 0);
    G.box(q[0], q[1], Math.min(z0, z1) - 0.01, w, Math.abs(s1 - s0) + w, Math.abs(z0 - z1) + 0.02, a, M.PERSON, col);
  };
  limb(0, -0.1, z + 0.86 + bob, 0.86, 0.15, sw, c.legs); limb(0, 0.1, z + 0.86 + bob, 0.86, 0.15, -sw, c.legs);
  const t = P(0, 0, 0); G.box(t[0], t[1], z + 0.82 + bob, 0.46, 0.28, 0.66, a, M.PERSON, c.coat);
  if (!umb) { limb(0, -0.29, z + 1.45 + bob, 0.6, 0.11, -sw * 0.8, c.coat); limb(0, 0.29, z + 1.45 + bob, 0.6, 0.11, sw * 0.8, c.coat); }
  else { limb(0, -0.29, z + 1.45 + bob, 0.6, 0.11, -sw * 0.5, c.coat); const hnd = P(0.25, 0.22, 0); G.box(hnd[0], hnd[1], z + 1.2, 0.03, 0.03, 0.95, a, M.POLE, [0.1, 0.1, 0.1]);
    const top = [hnd[0], hnd[1], z + 2.2]; for (let i = 0; i < 8; i++) { const a0 = TAU * i / 8, a1 = TAU * (i + 1) / 8, r = 0.55;
      G.tri(top, [hnd[0] + Math.cos(a0) * r, hnd[1] + Math.sin(a0) * r, z + 1.98], [hnd[0] + Math.cos(a1) * r, hnd[1] + Math.sin(a1) * r, z + 1.98], M.PERSON, c.umb); } }
  G.box(t[0], t[1], z + 1.48 + bob, 0.12, 0.12, 0.06, a, M.PERSON, [0.8, 0.65, 0.55]);
  G.box(t[0], t[1], z + 1.54 + bob, 0.21, 0.2, 0.22, a, M.PERSON, [0.82, 0.66, 0.56]);
  G.box(t[0], t[1], z + 1.72 + bob, 0.22, 0.22, 0.07, a, M.PERSON, c.hair);
}
/* a car: body, glasshouse, wheels; 1980s-2000s proportions (Lada / Daewoo / VW sized) */
function carModel(G, x, y, a, c, big, noWheels) {
  const ca = Math.cos(a), sa = Math.sin(a), P = (s, t, z) => [x + ca * s - sa * t, y + sa * s + ca * t, z];
  if (big) { G.box(x, y, 0.35, 2.45, 10.5, 2.65, a, M.CAR, c); G.box(x, y, 1.35, 2.47, 10.3, 1.1, a, M.CARGLASS, [0.1, 0.12, 0.14]); return; }
  const L = 4.2, W = 1.68;
  G.box(x, y, 0.32, W, L, 0.62, a, M.CAR, c);
  // cabin: trapezoid glasshouse
  const z0 = 0.94, z1 = 1.42, f0 = 1.0, r0 = -1.25, f1 = 0.45, r1 = -1.0, w0 = W / 2 - 0.05, w1 = W / 2 - 0.2;
  const q = [P(f0, -w0, z0), P(r0, -w0, z0), P(r0, w0, z0), P(f0, w0, z0)], t = [P(f1, -w1, z1), P(r1, -w1, z1), P(r1, w1, z1), P(f1, w1, z1)];
  for (let i = 0; i < 4; i++) G.quad(q[i], q[(i + 1) % 4], t[(i + 1) % 4], t[i], M.CARGLASS, [0.1, 0.12, 0.14]);
  G.quad(t[0], t[1], t[2], t[3], M.CAR, c, null, [0, 0, 1]);
  if (!noWheels) for (const s of [1.35, -1.3]) for (const tt of [-W / 2 + 0.02, W / 2 - 0.02]) { const w = P(s, tt, 0); G.box(w[0], w[1], 0, 0.22, 0.62, 0.62, a, M.TRUNK, [0.06, 0.06, 0.06]); }
}

/* ---------- detailed trees: trunk and branches as geometry, foliage as leaf cards (late October) ---------- */
// species: [crown radius, crown height, trunk height, leaf tile, density (share of leaves left), crown shape]
const SPEC = {
  chestnut: { rx: 4.2, rz: 4.0, th: 2.6, tile: 0, dens: 0.55, shape: 'round', bark: [0.2, 0.17, 0.15] },
  linden: { rx: 3.6, rz: 4.6, th: 2.4, tile: 1, dens: 0.6, shape: 'egg', bark: [0.25, 0.22, 0.19] },
  poplar: { rx: 2.4, rz: 8.5, th: 2.2, tile: 2, dens: 0.65, shape: 'column', bark: [0.42, 0.42, 0.38] },
  maple: { rx: 3.8, rz: 3.8, th: 2.2, tile: 3, dens: 0.5, shape: 'round', bark: [0.24, 0.21, 0.18] },
  birch: { rx: 2.6, rz: 4.8, th: 2.6, tile: 4, dens: 0.55, shape: 'egg', bark: [0.82, 0.8, 0.76] },
  acacia: { rx: 3.4, rz: 3.4, th: 2.8, tile: 5, dens: 0.75, shape: 'round', bark: [0.28, 0.24, 0.2] },
  // v7.1, seen on the October 2011 panoramas: weeping willows and white poplars on the embankment, saplings along Kovalya St
  willow: { rx: 4.4, rz: 5.2, th: 2.0, tile: 7, dens: 0.8, shape: 'weep', bark: [0.3, 0.27, 0.22] },
  wpoplar: { rx: 4.0, rz: 7.5, th: 3.4, tile: 2, dens: 0.55, shape: 'egg', bark: [0.72, 0.72, 0.68] },
  sapling: { rx: 0.9, rz: 1.7, th: 1.5, tile: 1, dens: 0.45, shape: 'egg', bark: [0.32, 0.27, 0.22], thin: 1 },
};
const SPK = { 0: ['chestnut', 'linden', 'maple', 'poplar', 'acacia'], 1: ['acacia', 'poplar', 'birch', 'maple', 'chestnut'], 2: ['chestnut', 'linden', 'maple', 'linden', 'chestnut'], 3: ['willow', 'wpoplar', 'poplar', 'willow', 'wpoplar'] };
function treeDetailed(G, F, x, y, kind, R, species) {
  const name = species && SPEC[species] ? species : SPK[kind] ? SPK[kind][Math.floor(R() * 5)] : 'linden', S = SPEC[name], sc = S.thin ? 0.9 + R() * 0.2 : 0.8 + R() * 0.45;
  const rx = S.rx * sc, rz = S.rz * sc, th = S.th * (0.85 + R() * 0.3), cz = th + rz * 0.55;
  // trunk: tapered octagon
  const seg = 6, r0 = S.thin ? 0.035 : 0.16 + 0.05 * sc, r1 = S.thin ? 0.015 : 0.09, top = th + rz * 0.5;
  if (S.thin) { G.box(x + 0.25, y, 0, 0.04, 0.04, 1.3, 0, M.TRUNK, [0.5, 0.42, 0.3]); G.box(x - 0.25, y, 0, 0.04, 0.04, 1.3, 0, M.TRUNK, [0.5, 0.42, 0.3]); G.box(x, y, 1.15, 0.03, 0.55, 0.03, 0, M.TRUNK, [0.5, 0.42, 0.3]); } // two stakes and a strap
  const ring = (z, rr) => { const o = []; for (let i = 0; i < seg; i++) { const a = TAU * i / seg; o.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr, z]); } return o; };
  const A = ring(0, r0), B = ring(top, r1);
  for (let i = 0; i < seg; i++) { const j = (i + 1) % seg, n = V.norm([Math.cos(TAU * (i + 0.5) / seg), Math.sin(TAU * (i + 0.5) / seg), 0]); G.quad(A[i], A[j], B[j], B[i], M.TRUNK, S.bark, [[0, 0], [1, 0], [1, top], [0, top]], n); }
  // branches: from the trunk outwards and up
  const nb = 4 + Math.floor(R() * 3), br = [];
  for (let k = 0; k < nb; k++) {
    const a = R() * TAU, z0 = th + (top - th) * R() * 0.8, len = rx * (0.6 + R() * 0.35), up = name === 'poplar' ? 2.2 : name === 'willow' ? 0.9 : 0.7 + R() * 0.5;
    const p0 = [x, y, z0], p1 = [x + Math.cos(a) * len, y + Math.sin(a) * len, z0 + len * up * 0.6];
    const d = V.norm(V.sub(p1, p0)), s1 = V.norm(V.cross(d, [0, 0, 1])), s2 = V.cross(s1, d), w0 = S.thin ? 0.015 : 0.07, w1 = S.thin ? 0.008 : 0.025;
    const c0 = [V.add(p0, V.mul(s1, w0)), V.add(p0, V.mul(s2, w0)), V.sub(p0, V.mul(s1, w0)), V.sub(p0, V.mul(s2, w0))];
    const c1 = [V.add(p1, V.mul(s1, w1)), V.add(p1, V.mul(s2, w1)), V.sub(p1, V.mul(s1, w1)), V.sub(p1, V.mul(s2, w1))];
    for (let i = 0; i < 4; i++) G.quad(c0[i], c0[(i + 1) % 4], c1[(i + 1) % 4], c1[i], M.TRUNK, S.bark, [[0, 0], [1, 0], [1, top], [0, top]]);
    br.push(p1);
  }
  // leaf cards inside the crown, denser at the outside; late October: part of the leaves are gone
  const n = Math.round((name === 'poplar' ? 70 : 85) * S.dens * (0.85 + R() * 0.3));
  const tu = (S.tile % 4) * 0.25, tv = Math.floor(S.tile / 4) * 0.5;
  const tint = 0.85 + R() * 0.3;
  for (let k = 0; k < n; k++) {
    let dx, dy, dz;
    do { dx = R() * 2 - 1; dy = R() * 2 - 1; dz = R() * 2 - 1; } while (dx * dx + dy * dy + dz * dz > 1);
    const rr = Math.pow(dx * dx + dy * dy + dz * dz, 0.25);   // push outwards
    const shape = S.shape === 'column' ? 1 : S.shape === 'egg' ? 0.9 : 1;
    const c = [x + dx * rx / (rr || 1) * 0.95, y + dy * rx / (rr || 1) * 0.95, cz + dz * rz * 0.5 * shape / (rr || 1)];
    if (S.shape === 'weep') c[2] -= (dx * dx + dy * dy) * rz * 0.75;   // the outer twigs hang down
    const sz = (name === 'poplar' ? 1.5 : S.thin ? 0.8 : 2.0) * (0.75 + R() * 0.5);
    const nrm = V.norm([dx + (R() - 0.5), dy + (R() - 0.5), dz * 0.6 + 0.4]);
    const t1 = V.norm(V.cross(nrm, Math.abs(nrm[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), t2 = V.cross(nrm, t1);
    const rot = R() * TAU, ca = Math.cos(rot), sa = Math.sin(rot);
    const e1 = V.add(V.mul(t1, ca * sz / 2), V.mul(t2, sa * sz / 2)), e2 = V.add(V.mul(t1, -sa * sz / 2), V.mul(t2, ca * sz / 2));
    const q = [V.sub(V.sub(c, e1), e2), V.sub(V.add(c, e1), e2), V.add(V.add(c, e1), e2), V.add(V.sub(c, e1), e2)];
    const radial = V.norm([dx, dy, dz * 0.7 + 0.3]);
    const uv = [[tu + 0.005, tv + 0.01], [tu + 0.245, tv + 0.01], [tu + 0.245, tv + 0.49], [tu + 0.005, tv + 0.49]];
    const col = [tint * (0.9 + R() * 0.2), tint * (0.9 + R() * 0.2), tint];
    const sway = Math.max(0, c[2] - th);
    for (const i of [0, 1, 2, 0, 2, 3]) F.push(q[i][0], q[i][1], q[i][2], radial[0], radial[1], radial[2], uv[i][0], uv[i][1], col[0], col[1], col[2], sway);
  }
  // fallen leaves on the ground under the crown
  const lr = rx * 1.2, tu6 = 0.5, tv6 = 0.5, lc = [1, 1, 1];
  const L = [[x - lr, y - lr, 0.06], [x + lr, y - lr, 0.06], [x + lr, y + lr, 0.06], [x - lr, y + lr, 0.06]], Luv = [[tu6, tv6], [tu6 + 0.25, tv6], [tu6 + 0.25, tv6 + 0.5], [tu6, tv6 + 0.5]];
  for (const i of [0, 1, 2, 0, 2, 3]) F.push(L[i][0], L[i][1], L[i][2], 0, 0, 1, Luv[i][0], Luv[i][1], 1, 1, 1, 0);
}
/* leaf atlas drawn in the browser: 4x2 tiles of 128 px (6 species, fallen leaves, spare) */
function leafAtlas() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d');
  const R = rng(31);
  const pal = [
    [[150, 110, 40], [175, 130, 45], [120, 80, 35], [105, 115, 40]],     // chestnut: brown-yellow
    [[205, 170, 40], [190, 160, 35], [160, 150, 40], [215, 185, 60]],    // linden: yellow
    [[160, 160, 50], [185, 170, 45], [120, 135, 45], [200, 180, 60]],    // poplar: yellow-green
    [[200, 85, 30], [215, 120, 35], [180, 60, 30], [205, 150, 40]],      // maple: orange-red
    [[220, 190, 60], [200, 175, 50], [230, 200, 80], [170, 160, 50]],    // birch: yellow
    [[110, 130, 45], [140, 150, 50], [170, 160, 55], [95, 115, 40]],     // acacia: still greenish
    [[170, 120, 40], [200, 160, 50], [140, 90, 35], [190, 100, 35]],     // fallen leaves
    [[150, 160, 60], [175, 170, 70], [125, 140, 50], [195, 185, 85]],    // willow: narrow yellow-green
  ];
  for (let t = 0; t < 8; t++) {
    const ox = (t % 4) * 128, oy = Math.floor(t / 4) * 128;
    c.save(); c.beginPath(); c.rect(ox, oy, 128, 128); c.clip();
    if (t !== 6) { c.strokeStyle = 'rgba(70,55,40,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ox + 64, oy + 124); c.quadraticCurveTo(ox + 60, oy + 70, ox + 40 + R() * 40, oy + 12); c.stroke();
      for (let k = 0; k < 4; k++) { c.lineWidth = 1; c.beginPath(); const sy = oy + 30 + R() * 80; c.moveTo(ox + 62, sy); c.lineTo(ox + 20 + R() * 88, sy - 10 - R() * 20); c.stroke(); } }
    const n = t === 6 ? 140 : t === 7 ? 150 : t === 2 || t === 4 || t === 5 ? 110 : 70;
    for (let k = 0; k < n; k++) {
      const p = pal[t][Math.floor(R() * 4)], v = 0.8 + R() * 0.35;
      c.fillStyle = `rgba(${Math.min(255, p[0] * v) | 0},${Math.min(255, p[1] * v) | 0},${Math.min(255, p[2] * v) | 0},${t === 6 ? 0.85 : 1})`;
      let x, y; do { x = R() * 128; y = R() * 128; } while (t !== 6 && Math.hypot(x - 64, y - 64) > 60);
      const s = t === 0 || t === 3 ? 7 + R() * 6 : t === 1 ? 6 + R() * 4 : 3.5 + R() * 3;
      c.save(); c.translate(ox + x, oy + y); c.rotate(R() * TAU);
      if (t === 3 || t === 0) { for (let l = 0; l < 5; l++) { c.beginPath(); c.ellipse(0, -s * 0.5, s * 0.28, s * 0.65, 0, 0, TAU); c.fill(); c.rotate(TAU / 7); } }
      else if (t === 7) { c.beginPath(); c.ellipse(0, 0, s * 0.22, s * 1.5, 0, 0, TAU); c.fill(); }
      else { c.beginPath(); c.ellipse(0, 0, s * 0.55, s, 0, 0, TAU); c.fill(); }
      c.restore();
    }
    c.restore();
  }
  return cv;
}

/* ---------- networks for movers ---------- */
function buildNets(D) {
  // car edges: roads at least 5 m wide, both directions unless one-way
  const edges = [], key = p => Math.round(p[0] / 3) + ',' + Math.round(p[1] / 3), nodes = new Map();
  for (const rd of D.roads) {
    const w = rd[0] / 10; if (w < 5) continue;
    const p = pts(rd, 3, 10); if (p.length < 2) continue;
    const L = []; let tot = 0; L.push(0);
    for (let i = 1; i < p.length; i++) { tot += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); L.push(tot); }
    if (tot < 8) continue;
    const dirs = rd[1] ? [1] : [1, -1];
    for (const d of dirs) {
      const pp = d > 0 ? p : p.slice().reverse(), LL = d > 0 ? L : L.map(v => tot - v).reverse();
      const e = { p: pp, L: LL, len: tot, w, one: !!rd[1], cars: [], id: edges.length };
      edges.push(e);
      const k0 = key(pp[0]); if (!nodes.has(k0)) nodes.set(k0, []); nodes.get(k0).push(e);
    }
  }
  for (const e of edges) { e.next = (nodes.get(key(e.p[e.p.length - 1])) || []).filter(n => !(key(n.p[n.p.length - 1]) === key(e.p[0]) && Math.abs(n.len - e.len) < 1)); }
  // pedestrian paths: pavements of roads near the tower, and the embankment along the water
  const walks = [];
  for (const rd of D.roads) {
    const w = rd[0] / 10, p = pts(rd, 3, 10);
    if (p.length < 2 || !p.some(q => Math.hypot(q[0], q[1]) < 520)) continue;
    for (const sd of w >= 6 ? [1, -1] : [1]) {
      const o = (w >= 6 ? w / 2 + 1.3 : w / 2 + 0.8) * sd, q = []; q.z = w >= 6 && p.some(v => Math.hypot(v[0], v[1]) < NEAR + 60) ? 0.15 : 0.0;
      for (let i = 0; i < p.length; i++) {
        const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        q.push([p[i][0] - (b[1] - a[1]) / L * o, p[i][1] + (b[0] - a[0]) / L * o]);
      }
      walks.push(q);
    }
  }
  for (const wa of D.water) {
    let p = pts(wa, 0, 10); if (p.length < 4) continue;
    const ccw = area2(p) > 0, q = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[(i - 1 + p.length) % p.length], b = p[(i + 1) % p.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const o = ccw ? 4 : -4; // outside the water
      q.push([p[i][0] + (b[1] - a[1]) / L * o, p[i][1] - (b[0] - a[0]) / L * o]);
    }
    // keep the part of the shore near the tower
    let run = [];
    for (const v of q) { if (Math.hypot(v[0], v[1]) < 650) run.push(v); else { if (run.length > 3) walks.push(run); run = []; } }
    if (run.length > 3) walks.push(run);
  }
  const W = walks.map(p => { const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return { p, L, len: L[L.length - 1], z: p.z || 0 }; }).filter(w => w.len > 15);
  return { edges, walks: W };
}
function along(e, s) { // point and direction at distance s on a polyline
  const L = e.L, p = e.p; let i = 1; while (i < L.length - 1 && L[i] < s) i++;
  const a = p[i - 1], b = p[i], seg = (L[i] - L[i - 1]) || 1, t = Math.min(1, Math.max(0, (s - L[i - 1]) / seg));
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (b[0] - a[0]) / seg, (b[1] - a[1]) / seg];
}

/* ---------- shaders ---------- */
const HDR = `precision highp float;\n`;
const VS = HDR + `
attribute vec3 aP; attribute vec3 aN; attribute vec2 aU; attribute float aM; attribute vec3 aC;
uniform mat4 uVP; uniform mat4 uLVP; uniform float uT; uniform float uWind;
varying vec3 vW; varying vec3 vN; varying vec2 vU; varying float vM; varying vec3 vC; varying vec4 vL;
void main(){
  vec3 p=aP;
  if(aM>7.5&&aM<8.5){ float k=max(0.0,p.z-aU.x)*0.12; p.x+=sin(uT*1.7+aP.x*0.3+aP.y*0.2)*k*uWind; p.y+=cos(uT*1.3+aP.y*0.3)*k*uWind*0.6; }
  vW=p; vN=aN; vU=aU; vM=aM; vC=aC; vL=uLVP*vec4(p,1.0);
  gl_Position=uVP*vec4(p,1.0);
}`;
const FS = HDR + `
varying vec3 vW; varying vec3 vN; varying vec2 vU; varying float vM; varying vec3 vC; varying vec4 vL;
uniform vec3 uCam; uniform vec3 uSun; uniform vec3 uSunC; uniform vec3 uSkyC; uniform vec3 uGndC; uniform vec3 uFog; uniform float uFogD;
uniform float uNight; uniform float uLit; uniform float uSlot; uniform float uFlood; uniform float uWet; uniform float uClipZ;
uniform sampler2D uSh; uniform float uShOn; uniform float uPitch; uniform float uT;
uniform sampler2D uLU; uniform vec2 uLUo; uniform float uLUs; uniform vec3 uLUd;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float shadow(){
  if(uShOn<0.5) return 1.0;
  vec3 q=vL.xyz/vL.w*0.5+0.5; if(q.x<0.0||q.x>1.0||q.y<0.0||q.y>1.0||q.z>1.0) return 1.0;
  float s=0.0, b=0.0015;
  for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++){ s+= (texture2D(uSh,q.xy+vec2(float(i),float(j))/2048.0).r+b<q.z)?0.0:1.0; }
  return s/9.0;
}
vec3 skyAt(vec3 d){ float h=clamp(d.z,0.0,1.0); return mix(uFog, uSkyC, smoothstep(0.0,0.5,h)); }
/* window grid: returns x=window mask, y=frame mask; z=lit (0/1); w=ac unit */
vec4 win(float s, float z, float pitch, float fh, float g, float wx0, float ww, float sill, float wh, float seed, float acp){
  float col=floor(s/pitch), u=s-col*pitch;
  float f= z<g?0.0:1.0+floor((z-g)/fh); float zb= f<0.5?0.0:g+(f-1.0)*fh; float zf=z-zb;
  float inside=step(wx0,u)*step(u,wx0+ww)*step(sill,zf)*step(zf,sill+wh);
  float e=0.07;
  float frame=inside*(1.0-step(wx0+e,u)*step(u,wx0+ww-e)*step(sill+e,zf)*step(zf,sill+wh-e));
  frame=max(frame, inside*step(abs(u-(wx0+ww*0.5)),0.035));
  frame=max(frame, inside*step(abs(zf-(sill+wh*0.68)),0.03));
  float hh=h21(vec2(col+seed, f*7.13+floor(uSlot+h21(vec2(col,f))*3.0)));
  float lit=step(hh,uLit)*step(0.5,f+0.6);
  float side=h21(vec2(col*1.7+seed,f))<0.5?wx0-0.65:wx0+ww+0.05;
  float ac=step(h21(vec2(col+seed*3.1,f+1.3)),acp)*step(side,u)*step(u,side+0.6)*step(sill-0.75,zf)*step(zf,sill-0.15);
  return vec4(inside, frame, lit, ac);
}
/* a lit room: warm lamps, cool energy-saving bulbs, curtains; some rooms lit by a TV */
vec3 room(vec2 id){
  float h=h21(id*1.37+3.1), c=h21(id+9.2);
  vec3 col=mix(vec3(1.0,0.7,0.4),vec3(0.98,0.93,0.84),step(0.6,c));
  col=mix(col,col*vec3(1.0,0.55,0.45),step(0.85,h)); col=mix(col,col*vec3(0.75,0.9,0.7),step(0.93,h));
  if(h<0.12){ float f=0.55+0.25*sin(uT*7.0+id.x*3.0)+0.2*sin(uT*13.0+id.y*5.0); col=vec3(0.55,0.65,1.0)*f; }
  return col;
}
void main(){
  if(vW.z<uClipZ) discard;
  vec3 N=normalize(vN); vec3 Vd=normalize(uCam-vW); if(dot(N,Vd)<0.0) N=-N;
  float m=vM; vec3 col=vC; vec3 emi=vec3(0.0); float spec=0.0; float rough=0.8;
  float glass=0.0;
  if(m<0.5){ // ground: land use colour (from the map grid) with noise
    vec2 lu=(vW.xy-uLUo)/uLUs; vec3 lc=uLUd; if(lu.x>0.0&&lu.x<1.0&&lu.y>0.0&&lu.y<1.0) lc=texture2D(uLU,lu).rgb;
    float n=n2(vW.xy*0.06)*0.5+n2(vW.xy*0.5)*0.3+n2(vW.xy*3.0)*0.2; col=lc*(0.75+0.5*n);
    col=mix(col,vec3(0.33,0.29,0.2),smoothstep(0.62,0.8,n2(vW.xy*0.11+7.0))*0.5);
  } else if(m<1.5||abs(m-19.0)<0.5){ // asphalt: patches and cracks; centre dashes on the wide streets
    float n=n2(vW.xy*0.7); col=vec3(0.15,0.15,0.16)*(0.8+0.35*n);
    col*=0.92+0.12*step(0.7,n2(vW.xy*0.12+3.0));
    col*=1.0-0.35*smoothstep(0.035,0.0,abs(n2(vW.xy*0.9+11.0)-0.5))*step(0.5,n2(vW.xy*0.2));
    if(m>18.5){ float d=step(abs(vU.y),0.075)*step(fract(vU.x/6.0),0.5); col=mix(col,vec3(0.78,0.78,0.74),d*0.85); }
    spec=0.12+uWet*0.6; rough=0.6-uWet*0.45;
  } else if(m<2.5){ // panel buildings
    vec4 w=win(vU.x,vU.y,3.0,2.8,2.8,0.75,1.5,0.8,1.4,floor(vU.x/997.0),0.15);
    col=vC*(0.9+0.2*h21(floor(vU.xy/vec2(3.0,2.8))))*(0.92+0.12*n2(vW.xy*0.7+vW.z*0.3));
    float seam=step(abs(fract(vU.y/2.8)-0.0),0.012)+step(abs(fract(vU.x/3.0)),0.008); col*=1.0-0.12*clamp(seam,0.0,1.0);
    if(w.x>0.5){ glass=1.0-w.y; col=mix(vec3(0.06,0.07,0.08),vec3(0.8,0.8,0.78),w.y); if(w.z>0.5) emi=room(floor(vU.xy/vec2(3.0,2.8)))*1.1*(1.0-w.y)*uNight; }
    if(w.w>0.5) col=vec3(0.8,0.8,0.78);
  } else if(m<3.5){ col=vC*(0.85+0.3*n2(vW.xy*0.8));
  } else if(m<5.5){ // tower facade
    bool lg=m>4.5; float z=vU.y; bool shop=z<4.2;
    vec4 w= shop ? win(vU.x,z,uPitch,3.0,4.2,0.25,uPitch-0.5,0.25,3.4,0.0,0.0)
       : (lg ? win(vU.x,z,uPitch,3.0,4.2,0.3,uPitch-0.6,0.55,2.05,11.0,0.0) : win(vU.x,z,uPitch,3.0,4.2,(uPitch-1.55)*0.5,1.55,0.85,1.65,23.0,0.0));
    float zf= z<4.2?z:mod(z-4.2,3.0);
    if(!shop&&!lg){
      float band=(step(0.73,zf)*step(zf,0.85))+(step(2.5,zf)*step(zf,2.62));
      float course=step(fract(zf/0.075),0.12)*0.06;
      col=mix(vC*(0.9+0.2*n2(vW.xy*2.0+z))*(1.0-course),vec3(0.86,0.77,0.6),clamp(band,0.0,1.0));
    }
    if(w.x>0.5){ glass=1.0-w.y; col=mix(vec3(0.05,0.06,0.07),vec3(0.86,0.86,0.84),w.y);
      if(w.z>0.5&&!shop) emi=room(vec2(floor(vU.x/uPitch)+40.0,floor(z/3.0)))*1.15*(1.0-w.y)*uNight;
      if(shop){ float cid=floor(vU.x/uPitch); float on=step(h21(vec2(cid,77.0)),0.25+uLit); emi=mix(vec3(1.0,0.82,0.6),vec3(0.9,0.95,1.0),step(0.6,h21(vec2(cid,5.0))))*0.75*on*(1.0-w.y)*uNight; col=mix(col,vec3(0.1,0.1,0.1),(1.0-on)*glass*0.5); } }
    if(w.w>0.5&&!shop) col=vec3(0.84,0.84,0.82);
    float fl=(0.55*exp(-z/70.0)+0.12)*(0.82+0.18*cos(vU.x*6.2832/(uPitch*2.0)));
    emi+=col*vec3(1.0,0.62,0.32)*fl*uFlood*(1.0-glass*0.7);
  } else if(m<6.5){
    float u=mod(vU.x,1.5); float fr=step(u,0.08)+step(abs(vU.y-85.2),0.12);
    glass=1.0-clamp(fr,0.0,1.0); col=mix(vec3(0.07,0.09,0.11),vec3(0.85,0.85,0.83),clamp(fr,0.0,1.0));
    emi=vec3(1.0,0.82,0.6)*0.9*glass*uNight;
  } else if(m<7.5){ spec=0.4; rough=0.4;
  } else if(m<8.5){ col=vC*(0.85+0.3*n2(vW.xy*1.5+vW.z));
  } else if(m<9.5){ col=vC*(0.75+0.35*n2(vec2(vW.x+vW.y,vW.z*3.0)*4.0));
  } else if(m<12.5&&m>11.5){ // pavement tiles
    vec2 t=fract(vU*vec2(1.0/0.5,1.0/0.5)); float g=step(t.x,0.05)+step(t.y,0.05);
    col=vC*(0.88+0.2*n2(vW.xy*1.3))*(1.0-0.12*clamp(g,0.0,1.0)); spec=uWet*0.4; rough=0.5;
  } else if(m<13.5){ spec=0.5; rough=0.3;
  } else if(abs(m-17.0)<0.5){ // bank: grass down to the waterline, bare earth and a few stones at it (panoramas, Oct 2011)
    float n=n2(vW.xy*2.5+vW.z), st=step(0.6,n2(vW.xy*1.6))*0.2; float wet=smoothstep(-0.7,-1.1,vW.z);
    col=mix(vec3(0.26,0.29,0.14)*(0.8+0.4*n),vec3(0.36,0.32,0.25)*(0.7+0.5*n),smoothstep(-0.65,-0.95,vW.z)+st);
    col*=1.0-0.35*wet; spec=wet*0.4; rough=0.4;
  } else if(abs(m-18.0)<0.5){ col=vC*(0.9+0.15*n2(vW.xy*4.0));
  } else if(abs(m-20.0)<0.5){ // private houses: plaster, one floor of windows with painted frames
    vec4 w=win(vU.x,vU.y,3.4,3.4,3.4,1.0,1.3,0.9,1.25,floor(vU.x/997.0),0.0);
    col=vC*(0.85+0.25*n2(vW.xy*1.2+vW.z));
    if(w.x>0.5){ glass=1.0-w.y; col=mix(vec3(0.07,0.08,0.09),mix(vec3(0.85,0.85,0.83),vec3(0.3,0.45,0.62),step(0.5,h21(vec2(floor(vU.x/997.0),3.0)))),w.y);
      if(w.z>0.5) emi=vec3(1.0,0.72,0.45)*(1.0-w.y)*uNight; }
  } else if(abs(m-21.0)<0.5){ // pitched roofs: slate or metal sheets
    col=vC*(0.85+0.25*n2(vW.xy*2.0))*(0.9+0.1*step(0.5,fract((vW.x+vW.y)*1.4))); spec=0.15+uWet*0.4; rough=0.5;
  } else if(abs(m-22.0)<0.5){ // glazed balconies
    vec2 q=fract(vec2((vW.x+vW.y)/0.9,vW.z/1.25)); float fr=step(q.x,0.08)+step(q.y,0.06)+step(0.0,-q.y);
    glass=1.0-clamp(fr,0.0,1.0); col=mix(vec3(0.12,0.14,0.15),vC,clamp(fr,0.0,1.0));
  } else if(abs(m-23.0)<0.5){ glass=1.0; col=vec3(0.05,0.06,0.07);
  } else if(abs(m-24.0)<0.5){ emi=vec3(1.0,0.62,0.28)*3.0*uNight; col=vC*0.6; }
  float sh=shadow();
  float ndl=max(dot(N,uSun),0.0);
  vec3 amb=mix(uGndC,uSkyC,N.z*0.5+0.5);
  vec3 lit=col*(amb+uSunC*ndl*sh);
  if(glass>0.0){ vec3 R=reflect(-Vd,N); float fr=0.08+0.6*pow(1.0-max(dot(N,Vd),0.0),4.0); lit=mix(lit,skyAt(R)*0.9,fr*glass); }
  if(spec>0.0){ vec3 H=normalize(uSun+Vd); lit+=uSunC*spec*pow(max(dot(N,H),0.0),mix(200.0,20.0,rough))*sh; }
  lit+=emi;
  float d=length(uCam-vW); float fg=1.0-exp(-d*uFogD);
  gl_FragColor=vec4(mix(lit,uFog,fg),1.0);
}`;
const FOL_VS = HDR + `
attribute vec3 aP; attribute vec3 aN; attribute vec2 aU; attribute vec3 aC; attribute float aS;
uniform mat4 uVP; uniform mat4 uLVP; uniform float uT; uniform float uWind;
varying vec3 vW; varying vec3 vN; varying vec2 vU; varying vec3 vC; varying vec4 vL;
void main(){ vec3 p=aP; float k=aS*0.03*uWind; p.x+=sin(uT*1.9+aP.x*0.37+aP.y*0.23)*k; p.y+=cos(uT*1.5+aP.y*0.31)*k*0.7; p.z+=sin(uT*2.3+aP.x)*k*0.2;
  vW=p; vN=aN; vU=aU; vC=aC; vL=uLVP*vec4(p,1.0); gl_Position=uVP*vec4(p,1.0); }`;
const FOL_FS = HDR + `
varying vec3 vW; varying vec3 vN; varying vec2 vU; varying vec3 vC; varying vec4 vL;
uniform sampler2D uTex; uniform sampler2D uSh; uniform float uShOn; uniform vec3 uCam; uniform vec3 uSun; uniform vec3 uSunC; uniform vec3 uSkyC; uniform vec3 uGndC; uniform vec3 uFog; uniform float uFogD; uniform float uClipZ; uniform float uNight;
void main(){
  if(vW.z<uClipZ) discard;
  vec4 t=texture2D(uTex,vU); if(t.a<0.45) discard;
  vec3 N=normalize(vN); vec3 Vd=normalize(uCam-vW);
  float s=1.0; if(uShOn>0.5){ vec3 q=vL.xyz/vL.w*0.5+0.5; if(q.x>0.0&&q.x<1.0&&q.y>0.0&&q.y<1.0&&q.z<1.0){ s=0.0; for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++) s+=(texture2D(uSh,q.xy+vec2(float(i),float(j))/2048.0).r+0.003<q.z)?0.0:1.0; s/=9.0; } }
  float ndl=max(dot(N,uSun)*0.6+0.4,0.0); float tr=pow(max(dot(-Vd,uSun),0.0),4.0)*0.5;
  vec3 col=t.rgb*vC; vec3 amb=mix(uGndC,uSkyC,N.z*0.5+0.5);
  vec3 c=col*(amb*0.9+uSunC*(ndl+tr)*s);
  float d=length(uCam-vW); gl_FragColor=vec4(mix(c,uFog,1.0-exp(-d*uFogD)),1.0);
}`;
const SHF_VS = HDR + `attribute vec3 aP; attribute vec2 aU; uniform mat4 uLVP; varying vec2 vU; void main(){ vU=aU; gl_Position=uLVP*vec4(aP,1.0); }`;
const SHF_FS = HDR + `varying vec2 vU; uniform sampler2D uTex; void main(){ if(texture2D(uTex,vU).a<0.45) discard; gl_FragColor=vec4(1.0); }`;
const AO_VS = HDR + `attribute vec3 aP; attribute float aA; uniform mat4 uVP; varying float vA; void main(){ vA=aA; gl_Position=uVP*vec4(aP,1.0); }`;
const AO_FS = HDR + `varying float vA; uniform float uK; void main(){ float a=vA*uK; gl_FragColor=vec4(vec3(1.0-a),1.0); }`;
const PP_VS = HDR + `attribute vec2 aP; varying vec2 vUV; void main(){ vUV=aP*0.5+0.5; gl_Position=vec4(aP,0.0,1.0); }`;
const BRIGHT_FS = HDR + `varying vec2 vUV; uniform sampler2D uTex; uniform vec2 uPx; uniform float uTh;
void main(){ vec3 c=(texture2D(uTex,vUV+vec2(-uPx.x,-uPx.y)).rgb+texture2D(uTex,vUV+vec2(uPx.x,-uPx.y)).rgb+texture2D(uTex,vUV+vec2(-uPx.x,uPx.y)).rgb+texture2D(uTex,vUV+vec2(uPx.x,uPx.y)).rgb)*0.25;
  float l=max(c.r,max(c.g,c.b)); gl_FragColor=vec4(c*smoothstep(uTh,1.0,l),1.0); }`;
const BLUR_FS = HDR + `varying vec2 vUV; uniform sampler2D uTex; uniform vec2 uDir;
void main(){ vec3 c=texture2D(uTex,vUV).rgb*0.227;
  c+=(texture2D(uTex,vUV+uDir*1.385).rgb+texture2D(uTex,vUV-uDir*1.385).rgb)*0.316;
  c+=(texture2D(uTex,vUV+uDir*3.23).rgb+texture2D(uTex,vUV-uDir*3.23).rgb)*0.07; gl_FragColor=vec4(c,1.0); }`;
const COMP_FS = HDR + `varying vec2 vUV; uniform sampler2D uTex; uniform float uK; void main(){ gl_FragColor=vec4(texture2D(uTex,vUV).rgb*uK,1.0); }`;
const MASK_VS = HDR + `attribute vec3 aP; uniform mat4 uVP; void main(){ gl_Position=uVP*vec4(aP,1.0); }`;
const MASK_FS = HDR + `void main(){ gl_FragColor=vec4(0.0); }`;
const SKY_VS = HDR + `attribute vec2 aP; varying vec2 vP; void main(){ vP=aP; gl_Position=vec4(aP,0.9999,1.0); }`;
const SKY_FS = HDR + `varying vec2 vP; uniform mat4 uIVP; uniform vec3 uSkyC; uniform vec3 uFog; uniform vec3 uSun; uniform vec3 uSunC; uniform float uNight; uniform float uCloud; uniform float uT; uniform float uFlip;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
void main(){
  vec4 a=uIVP*vec4(vP,1.0,1.0); vec3 d=normalize(a.xyz/a.w); d.z*=uFlip;
  float h=d.z; vec3 c=mix(uFog,uSkyC,smoothstep(-0.02,0.45,h));
  float sd=max(dot(d,uSun),0.0); c+=uSunC*(pow(sd,3000.0)*3.0+pow(sd,90.0)*0.35+pow(sd,8.0)*0.08)*(1.0-uCloud);
  if(h>0.0){ vec2 q=d.xy/(h+0.15)*3.0+vec2(uT*0.01,0.0); float cl=smoothstep(0.45,0.85,n2(q)*0.6+n2(q*2.3)*0.4);
    vec3 cc=mix(vec3(0.9,0.9,0.92)*(0.35+0.65*(1.0-uNight)),uFog*1.1,0.3);
    c=mix(c,cc,cl*(0.35+uCloud*0.6)*smoothstep(0.0,0.2,h)); }
  gl_FragColor=vec4(c,1.0);
}`;
const WAT_VS = HDR + `attribute vec3 aP; uniform mat4 uVP; varying vec3 vW; void main(){ vW=aP; gl_Position=uVP*vec4(aP,1.0); }`;
const WAT_FS = HDR + `varying vec3 vW; uniform vec3 uCam; uniform sampler2D uRef; uniform vec2 uRes; uniform float uT; uniform vec3 uSun; uniform vec3 uSunC; uniform vec3 uFog; uniform float uFogD; uniform vec3 uSkyC; uniform float uRain; uniform float uWind; uniform float uRefOn; uniform float uNight;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
vec2 ng(vec2 p){ float e=0.15; float c=n2(p); return vec2(n2(p+vec2(e,0.0))-c, n2(p+vec2(0.0,e))-c)/e; }
vec2 waves(vec2 p){
  vec2 g=vec2(0.0); float a=0.06*(0.4+uWind);
  g+=ng(p*0.35+vec2(uT*0.25,uT*0.12))*a*0.9+ng(p*1.3-vec2(uT*0.4,uT*0.3))*a*0.45;
  g+=vec2(cos(p.x*0.21+p.y*0.07+uT*0.9),0.0)*a*0.4;
  g+=vec2(cos(dot(p,vec2(0.7,0.5))*0.9+uT*1.8),cos(dot(p,vec2(-0.4,0.8))*1.1+uT*1.5))*a*0.5;
  g+=vec2(cos(dot(p,vec2(0.3,-0.9))*2.7+uT*2.6),cos(dot(p,vec2(0.8,0.2))*3.1+uT*2.9))*a*0.25;
  if(uRain>0.0){ vec2 c=floor(p*0.7); for(int i=0;i<4;i++){ vec2 o=vec2(float(i/2),float(i-2*(i/2))); vec2 cc=c+o; float ph=fract(uT*0.8+h21(cc)); vec2 ctr=(cc+vec2(h21(cc+3.1),h21(cc+7.7)))/0.7; float r=length(p-ctr); float ring=sin((r-ph*1.6)*14.0)*exp(-abs(r-ph*1.6)*6.0)*(1.0-ph); g+=normalize(p-ctr+1e-4)*ring*0.12*uRain; } }
  return g;
}
void main(){
  vec2 g=waves(vW.xy); vec3 N=normalize(vec3(-g.x,-g.y,1.0));
  vec3 Vd=normalize(uCam-vW); float fr=0.03+0.97*pow(1.0-max(dot(N,Vd),0.0),5.0);
  vec2 su=gl_FragCoord.xy/uRes; vec3 refl;
  if(uRefOn>0.5) refl=texture2D(uRef, su+N.xy*0.04).rgb; else { vec3 R=reflect(-Vd,N); refl=mix(uFog,uSkyC,smoothstep(0.0,0.4,R.z)); }
  vec3 deep=mix(vec3(0.02,0.05,0.06),vec3(0.01,0.012,0.02),uNight);
  vec3 c=mix(deep,refl,clamp(fr+0.25,0.0,1.0));
  vec3 H=normalize(uSun+Vd); c+=uSunC*pow(max(dot(N,H),0.0),300.0)*2.0;
  float d=length(uCam-vW); c=mix(c,uFog,1.0-exp(-d*uFogD));
  gl_FragColor=vec4(c,1.0);
}`;
const PT_VS = HDR + `attribute vec3 aP; attribute vec4 aC; attribute float aS; uniform mat4 uVP; uniform vec3 uCam; uniform float uPx; uniform float uT; varying vec4 vC;
void main(){ vec4 c=aC; if(aS<0.0){ c.a*=step(0.5,fract(uT*0.75)); } float s=abs(aS); vC=c; gl_Position=uVP*vec4(aP,1.0); float d=length(uCam-aP); gl_PointSize=clamp(s*uPx/d,1.5,64.0); }`;
const PT_FS = HDR + `varying vec4 vC; void main(){ vec2 q=gl_PointCoord*2.0-1.0; float r=dot(q,q); if(r>1.0) discard; float a=exp(-r*3.5); gl_FragColor=vec4(vC.rgb*a*vC.a,1.0); }`;
const POOL_VS = HDR + `attribute vec3 aP; attribute vec3 aQ; uniform mat4 uVP; varying vec3 vQ; void main(){ vQ=aQ; gl_Position=uVP*vec4(aP,1.0); }`;
const POOL_FS = HDR + `varying vec3 vQ; uniform float uK; uniform vec3 uCol; void main(){ float r=length(vQ.xy); if(r>1.0) discard; float a=(1.0-r)*(1.0-r)*vQ.z*uK; gl_FragColor=vec4(uCol*a,1.0); }`;
const RAIN_VS = HDR + `attribute vec4 aP; uniform mat4 uVP; uniform vec3 uCam; uniform float uT; varying float vA;
void main(){ vec3 b=aP.xyz; vec3 p; float box=90.0; p.xy=uCam.xy+(fract((b.xy-uCam.xy/box)+0.0)-0.5)*box; p.z=uCam.z-35.0+fract(b.z-uT*0.35)*70.0; p.xy+=vec2(0.6,0.2)*aP.w; p.z+=aP.w*2.2; vA=0.25; gl_Position=uVP*vec4(p,1.0); }`;
const RAIN_FS = HDR + `varying float vA; uniform vec3 uCol; void main(){ gl_FragColor=vec4(uCol,vA); }`;
const SH_VS = HDR + `attribute vec3 aP; attribute float aM; attribute vec2 aU; uniform mat4 uLVP; uniform float uT; uniform float uWind; void main(){ vec3 p=aP; gl_Position=uLVP*vec4(p,1.0); }`;
const SH_FS = HDR + `void main(){ gl_FragColor=vec4(1.0); }`;

/* ---------- sun for Donetsk (48.0 N, 37.8 E) ---------- */
function sunDir(hourLocal, doy, tzOff) {
  const lat = 48.0 * Math.PI / 180, lon = 37.8;
  const dec = -23.44 * Math.PI / 180 * Math.cos(TAU / 365 * (doy + 10));
  const solar = hourLocal - tzOff + lon / 15;                 // local solar time
  const H = (solar - 12) * 15 * Math.PI / 180;
  const el = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)); // from south, west positive
  const ce = Math.cos(el);
  return { d: [-Math.sin(az) * ce, -Math.cos(az) * ce, Math.sin(el)], el: el * 180 / Math.PI };
}
function donetskNow() {
  const now = new Date();
  let h = now.getUTCHours() + now.getUTCMinutes() / 60 + 3, tz = 3;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
    const hh = +parts.find(p => p.type === 'hour').value, mm = +parts.find(p => p.type === 'minute').value;
    h = hh + mm / 60;
    tz = Math.round(((hh + mm / 60) - (now.getUTCHours() + now.getUTCMinutes() / 60) + 36) % 24 - 12);
  } catch (e) {}
  const start = Date.UTC(now.getUTCFullYear(), 0, 0), doy = Math.floor((now - start) / 864e5);
  return { h, tz, doy };
}

/* ---------- sound: synthesised in the browser, no recordings ---------- */
function Sound() {
  let ac = null, g = {}, on = false, timer = 0;
  function noise(len, brown) {
    const b = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = b.getChannelData(0); let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
    const s = ac.createBufferSource(); s.buffer = b; s.loop = true; return s;
  }
  function chain(src, type, f, q) { const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7; const gn = ac.createGain(); gn.gain.value = 0; src.connect(fl); fl.connect(gn); gn.connect(g.master); src.start(); return { fl, gn }; }
  function start() {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
      ac = new C(); g.master = ac.createGain(); g.master.gain.value = 0.0; g.master.connect(ac.destination);
      g.traffic = chain(noise(4, true), 'lowpass', 380); g.wind = chain(noise(4), 'bandpass', 500, 0.6);
      g.water = chain(noise(4), 'bandpass', 1100, 0.8); g.rain = chain(noise(3), 'highpass', 2500);
    }
    if (ac.state === 'suspended') ac.resume();
    on = true; g.master.gain.setTargetAtTime(0.9, ac.currentTime, 0.6); return true;
  }
  function stop() { on = false; if (ac) g.master.gain.setTargetAtTime(0, ac.currentTime, 0.3); }
  function horn() { if (!ac) return; const t = ac.currentTime, o1 = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter(), gn = ac.createGain();
    o1.type = o2.type = 'sawtooth'; o1.frequency.value = 410; o2.frequency.value = 520; f.type = 'lowpass'; f.frequency.value = 1400;
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.025, t + 0.03); gn.gain.setValueAtTime(0.025, t + 0.25); gn.gain.linearRampToValueAtTime(0, t + 0.32);
    o1.connect(f); o2.connect(f); f.connect(gn); gn.connect(g.master); o1.start(t); o2.start(t); o1.stop(t + 0.4); o2.stop(t + 0.4); }
  function bird() { if (!ac) return; const t = ac.currentTime, o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sine';
    const f0 = 2600 + Math.random() * 1600; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, t + 0.08); o.frequency.exponentialRampToValueAtTime(f0 * 0.9, t + 0.15);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.012, t + 0.02); gn.gain.linearRampToValueAtTime(0, t + 0.16);
    o.connect(gn); gn.connect(g.master); o.start(t); o.stop(t + 0.2); }
  function update(s) { // s: {cars, height, waterDist, rain, wind, day}
    if (!on || !ac) return; const t = ac.currentTime, near = 1 / (1 + s.height / 60);
    g.traffic.gn.gain.setTargetAtTime(Math.min(0.5, s.cars / 90) * (0.25 + 0.75 * near), t, 0.5);
    g.wind.gn.gain.setTargetAtTime(0.03 + 0.12 * s.wind * (1 - near * 0.6), t, 0.8);
    g.wind.fl.frequency.setTargetAtTime(380 + 260 * Math.sin(t * 0.3) + 200 * s.wind, t, 1.2);
    g.water.gn.gain.setTargetAtTime(0.09 * Math.max(0, 1 - s.waterDist / 220) * (0.6 + 0.4 * Math.sin(t * 1.3) * Math.sin(t * 0.47)), t, 0.3);
    g.rain.gn.gain.setTargetAtTime(s.rain * 0.12, t, 0.8);
    timer -= 1;
    if (timer < 0) { timer = 60 + Math.random() * 240; if (Math.random() < 0.25 * Math.min(1, s.cars / 40) * near) horn(); else if (s.day > 0.5 && s.rain < 0.5 && Math.random() < 0.6 * near) { bird(); setTimeout(bird, 180); } }
  }
  return { start, stop, update, get on() { return on; }, close() { if (ac) ac.close(); ac = null; } };
}

/* ---------- the scene ---------- */
async function open(host, opt) {
  opt = opt || {};
  const S = Object.assign({ load: 'Loading…', fail: 'WebGL is not available on this device.' }, opt.text || {});
  const canvas = document.createElement('canvas'); canvas.className = 'kt3d-c'; host.appendChild(canvas);
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false, stencil: true, powerPreference: 'high-performance' }) || canvas.getContext('experimental-webgl');
  if (!gl) { host.insertAdjacentHTML('beforeend', `<p class="kt3d-fail">${S.fail}</p>`); return { destroy() { canvas.remove(); } }; }
  const extDepth = gl.getExtension('WEBGL_depth_texture');
  const D = await fetch(opt.data || 'assets/kt3d.json').then(r => r.json());
  const mobile = matchMedia('(pointer:coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
  let quality = opt.quality != null ? opt.quality : (mobile ? 1 : 2); // 2: shadows + reflections, 1: reflections only at low res, 0: neither

  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function prog(vs, fs, attrs) {
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
    return { p, u };
  }
  const P = {
    main: prog(VS, FS, ['aP', 'aN', 'aU', 'aM', 'aC']),
    sky: prog(SKY_VS, SKY_FS, ['aP']),
    wat: prog(WAT_VS, WAT_FS, ['aP']),
    pt: prog(PT_VS, PT_FS, ['aP', 'aC', 'aS']),
    pool: prog(POOL_VS, POOL_FS, ['aP', 'aQ']),
    rain: prog(RAIN_VS, RAIN_FS, ['aP']),
    shd: prog(SH_VS, SH_FS, ['aP', 'aM', 'aU']),
    fol: prog(FOL_VS, FOL_FS, ['aP', 'aN', 'aU', 'aC', 'aS']),
    shf: prog(SHF_VS, SHF_FS, ['aP', 'aU']),
    mask: prog(MASK_VS, MASK_FS, ['aP']),
    ao: prog(AO_VS, AO_FS, ['aP', 'aA']),
    bright: prog(PP_VS, BRIGHT_FS, ['aP']), blur: prog(PP_VS, BLUR_FS, ['aP']), comp: prog(PP_VS, COMP_FS, ['aP']),
  };

  /* static geometry */
  const G = new Geo(), FOL = []; buildCity(G, D, FOL); buildTower(G);
  /* soft contact darkening on the ground: around building walls, under trees and parked cars (cheap ambient occlusion) */
  const AO = [];
  const aoq = (p0, p1, p2, p3, a0, a1, a2, a3) => { AO.push(...p0, a0, ...p1, a1, ...p2, a2, ...p0, a0, ...p2, a2, ...p3, a3); };
  for (const b of D.bld) {
    let p = pts(b, 5, 10); if (p.length < 3) continue; if (area2(p) < 0) p = p.reverse();
    const h = Math.max(3, b[0] / 10), R = Math.min(4.5, 1.2 + h * 0.12), z = 0.03, k = 0.5;
    for (let i = 0; i < p.length; i++) { const a = p[i], q = p[(i + 1) % p.length], L = Math.hypot(q[0] - a[0], q[1] - a[1]); if (L < 0.5) continue;
      const nx = (q[1] - a[1]) / L * R, ny = -(q[0] - a[0]) / L * R;
      aoq([a[0], a[1], z], [q[0], q[1], z], [q[0] + nx, q[1] + ny, z], [a[0] + nx, a[1] + ny, z], k, k, 0, 0); }
  }
  { const tr = D.trees; for (let i = 0; i + 2 < tr.length; i += 3) { const x = tr[i] / 10, y = tr[i + 1] / 10, r = 3.2, z = 0.03; const n = 8;
      for (let j = 0; j < n; j++) { const a = TAU * j / n, b = TAU * (j + 1) / n; AO.push(x, y, z, 0.35, x + Math.cos(a) * r, y + Math.sin(a) * r, z, 0, x + Math.cos(b) * r, y + Math.sin(b) * r, z, 0); } } }
  { const pk = D.cars; for (let i = 0; i + 3 < pk.length; i += 4) { const x = pk[i] / 10, y = pk[i + 1] / 10, a = pk[i + 2] * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), z = 0.2;
      const P = (s, t) => [x + ca * s - sa * t, y + sa * s + ca * t, z]; aoq(P(-2.6, -1.2), P(2.6, -1.2), P(2.6, 1.2), P(-2.6, 1.2), 0.45, 0.45, 0.45, 0.45); } }
  const aoB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, aoB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(AO), gl.STATIC_DRAW); const nAO = AO.length / 4;
  const folB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, folB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FOL), gl.STATIC_DRAW); const nFol = FOL.length / 12;
  const leafTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, leafTex); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, leafAtlas()); gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
  /* ground: one big quad; inside the water polygons it is masked out with the stencil */
  const GG = new Geo(); { const R0 = 4000; GG.quad([-R0, -R0, 0], [R0, -R0, 0], [R0, R0, 0], [-R0, R0, 0], M.GROUND, [0.2, 0.24, 0.12], null, [0, 0, 1]); }
  const gndB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, gndB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GG.a), gl.STATIC_DRAW);
  /* land use from the map grid (20 m cells) as a small texture */
  const LU = D.lu, LUC = { h: [0.27, 0.29, 0.15], c: [0.36, 0.35, 0.32], i: [0.34, 0.32, 0.27], g: [0.22, 0.3, 0.12], p: [0.19, 0.29, 0.11], f: [0.14, 0.22, 0.09], s: [0.45, 0.41, 0.3], w: [0.24, 0.28, 0.13], '.': [0.25, 0.28, 0.14] };
  const luTex = gl.createTexture(); let luO = [0, 0], luS = 1;
  if (LU) { const n = LU.n, px = new Uint8Array(n * n * 4);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = LUC[(LU.c[j] || '')[i]] || LUC['.']; px.set([c[0] * 255, c[1] * 255, c[2] * 255, 255], (j * n + i) * 4); }
    gl.bindTexture(gl.TEXTURE_2D, luTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    luO = [LU.x / 10, LU.y / 10]; luS = LU.n * LU.s / 10; }
  const stat = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, stat); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(G.a), gl.STATIC_DRAW);
  const nStat = G.n; G.a = null;
  /* water: the surface lies 1 m below the street level, the banks slope down to it */
  const WZ = -1.0;
  const WA = [];
  for (const w of D.water) { const p = pts(w, 0, 10), t = earcut(p); for (const i of t) WA.push(p[i][0], p[i][1], WZ); }
  const wbuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, wbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(WA), gl.STATIC_DRAW);
  const nWat = WA.length / 3;
  const waterPts = []; for (const w of D.water) for (const q of pts(w, 0, 10)) waterPts.push(q);
  /* sky quad */
  const quadB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
  /* street lamps along roads near the tower (generic: every ~30 m) */
  const lamps = [], LG = new Geo();
  for (const rd of D.roads) {
    const w = Math.max(4, rd[0] / 10), p = pts(rd, 3, 10); if (w < 5 || !p.some(q => Math.hypot(q[0], q[1]) < 600)) continue;
    let acc = 15;
    for (let i = 0; i + 1 < p.length; i++) {
      const a = p[i], b = p[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.1) continue;
      let t = acc;
      while (t < L) { const x = a[0] + (b[0] - a[0]) * t / L, y = a[1] + (b[1] - a[1]) * t / L, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, o = w / 2 + 1.2;
        const lx = x + nx * o, ly = y + ny * o; if (Math.hypot(lx, ly) < 650) { lamps.push(lampModel(LG, lx, ly, -nx, -ny)); }
        t += 30; }
      acc = t - L;
    }
  }
  // globe lamps at the tower (placed from the 2011 panoramas, kt3d.json props "globe")
  for (const g of FOL.globes || []) { const x = g[0], y = g[1], c = [0.14, 0.14, 0.15]; LG.box(x, y, 0, 0.12, 0.12, 3.6, 0, M.POLE, c); LG.box(x, y, 0, 0.3, 0.3, 0.45, 0, M.POLE, c); LG.box(x, y, 3.55, 0.44, 0.44, 0.48, 0, M.LAMPG, [0.95, 0.92, 0.85]); lamps.push([x, y, 3.8]); }
  const lampB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, lampB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(LG.a), gl.STATIC_DRAW); const nLampGeo = LG.n;
  // light pools under lamps
  const PL = []; for (const l of lamps) { const r = 9, x = l[0], y = l[1], z = 0.1; const c = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]; for (const [a, b] of c) PL.push(x + a * r, y + b * r, z, a, b, 1); }
  const poolB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, poolB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(PL), gl.STATIC_DRAW); const nPool = PL.length / 6;
  // static glow points: lamp heads, far city lights (generic beyond the data), red light on the mast
  const GP = []; const rr = rng(77);
  for (const l of lamps) GP.push(l[0], l[1], l[2], 1.0, 0.62, 0.28, 0.9, 4.5);
  for (let i = 0; i < 1600; i++) { const a = rr() * TAU, d = 950 + Math.pow(rr(), 0.6) * 2400; GP.push(Math.cos(a) * d, Math.sin(a) * d, 2 + rr() * 25, 1.0, 0.7 + rr() * 0.2, 0.4 + rr() * 0.3, 0.35 + rr() * 0.4, 6); }
  GP.push(0, 0, T.mast, 1.0, 0.08, 0.04, 1.0, -9);
  const glowB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, glowB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GP), gl.STATIC_DRAW); const nGlow = GP.length / 8;
  // rain streaks
  const RN = []; const r2 = rng(5); for (let i = 0; i < 1400; i++) { const x = r2(), y = r2(), z = r2(); RN.push(x, y, z, 0, x, y, z, 1); }
  const rainB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, rainB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(RN), gl.STATIC_DRAW);

  /* movers */
  const NET = buildNets(D), rnd = rng(9);
  const CARC = [[0.75, 0.75, 0.73], [0.55, 0.06, 0.06], [0.1, 0.18, 0.38], [0.08, 0.08, 0.09], [0.6, 0.6, 0.58], [0.16, 0.32, 0.2], [0.85, 0.83, 0.72], [0.55, 0.45, 0.28], [0.9, 0.9, 0.88]];
  const cars = [], people = [];
  const MAXC = mobile ? 70 : 120, MAXP = mobile ? 70 : 140;
  function spawnCar(c) {
    const e = NET.edges[Math.floor(rnd() * NET.edges.length)]; if (!e) return;
    c.e = e; c.s = rnd() * e.len; c.v = 0; c.vmax = (e.w >= 10 ? 13 : 9) * (0.8 + rnd() * 0.35); c.col = CARC[Math.floor(rnd() * CARC.length)];
    c.big = rnd() < 0.07; // buses and vans
  }
  for (let i = 0; i < MAXC; i++) { const c = {}; spawnCar(c); cars.push(c); }
  const COATS = [[0.12, 0.12, 0.14], [0.25, 0.2, 0.16], [0.38, 0.3, 0.22], [0.15, 0.2, 0.3], [0.45, 0.12, 0.12], [0.3, 0.32, 0.28], [0.55, 0.5, 0.42], [0.2, 0.24, 0.2], [0.6, 0.35, 0.2]];
  const LEGS = [[0.1, 0.1, 0.12], [0.16, 0.18, 0.26], [0.22, 0.2, 0.18], [0.12, 0.14, 0.2]], HAIR = [[0.12, 0.09, 0.07], [0.3, 0.22, 0.14], [0.55, 0.45, 0.3], [0.5, 0.5, 0.5], [0.15, 0.15, 0.16]];
  const UMB = [[0.08, 0.08, 0.1], [0.5, 0.1, 0.12], [0.12, 0.2, 0.42], [0.2, 0.3, 0.2]];
  function spawnPerson(p) { const w = NET.walks[Math.floor(rnd() * NET.walks.length)]; if (!w) return; p.w = w; p.s = rnd() * w.len; p.dir = rnd() < 0.5 ? 1 : -1; p.v = 1.0 + rnd() * 0.5; p.ph = rnd() * TAU; p.side = (rnd() - 0.5) * 1.6; p.stop = 0;
    p.look = { coat: COATS[Math.floor(rnd() * COATS.length)], legs: LEGS[Math.floor(rnd() * LEGS.length)], hair: HAIR[Math.floor(rnd() * HAIR.length)], umb: UMB[Math.floor(rnd() * UMB.length)] }; p.umb = rnd() < 0.8; }
  for (let i = 0; i < MAXP; i++) { const p = {}; spawnPerson(p); if (i % 5 === 4) { const q = people[i - 1]; Object.assign(p, { w: q.w, s: q.s, dir: q.dir, v: q.v, side: q.side + 0.7, buddy: q }); } people.push(p); }
  const dynB = gl.createBuffer(), dynGlowB = gl.createBuffer(), dynPoolB = gl.createBuffer();
  const DG = new Geo(); let nDyn = 0, nDynGlow = 0, nDynPool = 0;

  /* shadow map */
  let shTex = null, shFb = null;
  if (extDepth) {
    shTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, shTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, 2048, 2048, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    const col = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, col); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2048, 2048, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    shFb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, shFb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, col, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shTex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { shFb = null; }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  /* bloom: copy of the frame, a bright pass and a blur at quarter size (glow around lights and the sun) */
  const sceneTex = gl.createTexture(), bl = [{}, {}]; let blW = 0, blH = 0, scW = 0, scH = 0;
  function texSetup(t, w, h) { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, w, h, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE)); }
  function ensureBloom(W, H) {
    const w = Math.max(16, W >> 2), h = Math.max(16, H >> 2);
    if (w === blW && h === blH) return; blW = w; blH = h;
    for (const b of bl) { if (!b.t) { b.t = gl.createTexture(); b.f = gl.createFramebuffer(); } texSetup(b.t, w, h); gl.bindFramebuffer(gl.FRAMEBUFFER, b.f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, b.t, 0); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  function bloom(W, H, k, th) {
    ensureBloom(W, H);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    if (scW !== W || scH !== H) { texSetup(sceneTex, W, H); scW = W; scH = H; }
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, W, H);
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadB); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); off(1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, bl[0].f); gl.viewport(0, 0, blW, blH);
    gl.useProgram(P.bright.p); gl.uniform1i(P.bright.u.uTex, 0); gl.uniform2f(P.bright.u.uPx, 1 / W, 1 / H); gl.uniform1f(P.bright.u.uTh, th);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex); gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.useProgram(P.blur.p); gl.uniform1i(P.blur.u.uTex, 0);
    for (let i = 0; i < 2; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, bl[1].f); gl.uniform2f(P.blur.u.uDir, (1 + i) / blW, 0); gl.bindTexture(gl.TEXTURE_2D, bl[0].t); gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, bl[0].f); gl.uniform2f(P.blur.u.uDir, 0, (1 + i) / blH); gl.bindTexture(gl.TEXTURE_2D, bl[1].t); gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(P.comp.p); gl.uniform1i(P.comp.u.uTex, 0); gl.uniform1f(P.comp.u.uK, k); gl.bindTexture(gl.TEXTURE_2D, bl[0].t); gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); off(0);
  }
  /* reflection target */
  let refTex = null, refFb = null, refRb = null, refW = 0, refH = 0;
  function ensureRef(w, h) {
    if (refFb && w === refW && h === refH) return;
    if (!refFb) { refTex = gl.createTexture(); refFb = gl.createFramebuffer(); refRb = gl.createRenderbuffer(); }
    refW = w; refH = h;
    gl.bindTexture(gl.TEXTURE_2D, refTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.bindRenderbuffer(gl.RENDERBUFFER, refRb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, refFb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, refTex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, refRb);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /* state */
  const st = {
    yaw: Math.atan2(-330, -270), pitch: 0.2, dist: 430, tgt: [0, 0, 40],
    auto: true, hour: 12, lapse: false, weather: 'clear', t0: performance.now(), wind: 0.4, rainK: 0, fogK: 0, raf: 0, alive: true,
  };
  { const n = donetskNow(); st.hour = n.h; st.tz = n.tz; st.doy = n.doy; }
  if (host.clientWidth / Math.max(1, host.clientHeight) < 0.8) { st.dist = 300; st.pitch = 0.24; }
  const sound = Sound();

  /* input: orbit only */
  const ptrs = new Map(); let pinch0 = 0, dist0 = 0;
  canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); dist0 = st.dist; } });
  canvas.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 1) { st.yaw -= (e.clientX - prev[0]) * 0.006; st.pitch = Math.min(1.35, Math.max(0.03, st.pitch + (e.clientY - prev[1]) * 0.005)); }
    else if (ptrs.size === 2 && pinch0) { const [a, b] = [...ptrs.values()]; st.dist = Math.min(950, Math.max(28, dist0 * pinch0 / Math.max(10, Math.hypot(a[0] - b[0], a[1] - b[1])))); }
  });
  const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = 0; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', e => { e.preventDefault(); st.dist = Math.min(950, Math.max(28, st.dist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
  canvas.addEventListener('keydown', e => {
    const k = e.key; if (k === 'ArrowLeft') st.yaw += 0.08; else if (k === 'ArrowRight') st.yaw -= 0.08; else if (k === 'ArrowUp') st.pitch = Math.min(1.35, st.pitch + 0.05);
    else if (k === 'ArrowDown') st.pitch = Math.max(0.03, st.pitch - 0.05); else if (k === '+' || k === '=') st.dist = Math.max(28, st.dist * 0.88); else if (k === '-') st.dist = Math.min(950, st.dist * 1.13); else return; e.preventDefault(); });
  canvas.tabIndex = 0;

  /* environment from the hour */
  function env(hour, weather) {
    const s = sunDir(hour, st.doy, st.tz), el = s.el;
    const day = smooth(-6, 8, el), golden = smooth(14, 2, el) * smooth(-4, 2, el);
    const night = 1 - smooth(-9, 0, el);
    let skyC = mix3([0.05, 0.035, 0.03], [0.35, 0.55, 0.85], day); skyC = mix3(skyC, [0.55, 0.45, 0.5], golden * 0.5);
    let fog = mix3([0.22, 0.12, 0.05], [0.72, 0.8, 0.9], day); fog = mix3(fog, [1.0, 0.62, 0.38], golden * 0.75);
    let sunC = mix3([1.0, 0.45, 0.2], [1.0, 0.95, 0.88], smooth(2, 25, el)); sunC = V.mul(sunC, 1.25 * smooth(-1, 6, el));
    let skyAmb = V.mul(mix3(skyC, [0.5, 0.6, 0.75], 0.5), 0.5 * day + 0.06), gnd = V.mul([0.3, 0.27, 0.22], 0.35 * day + 0.04);
    if (night > 0.5) { skyAmb = mix3(skyAmb, [0.14, 0.1, 0.075], night); }   // sodium-lit low clouds, as on the night photo
    let fogD = 0.00045;
    const rk = st.rainK, fk = st.fogK;
    if (rk > 0) { const grey = [0.42, 0.45, 0.5]; skyC = mix3(skyC, V.mul(grey, 0.25 + 0.75 * day), rk * 0.8); fog = mix3(fog, V.mul(grey, 0.2 + 0.8 * day), rk * 0.8); sunC = V.mul(sunC, 1 - 0.75 * rk); fogD += 0.0016 * rk; }
    if (fk > 0) { const grey = mix3([0.25, 0.18, 0.12], [0.75, 0.77, 0.8], day); skyC = mix3(skyC, grey, fk); fog = mix3(fog, grey, fk); sunC = V.mul(sunC, 1 - 0.6 * fk); fogD += 0.0065 * fk; }
    const hr = ((hour % 24) + 24) % 24;
    // share of lit windows by the hour (an estimate of an ordinary evening)
    const litF = night * (hr >= 17 || hr < 1 ? 0.42 : hr < 5 ? 0.08 : 0.22) + (1 - night) * 0.03;
    return { sun: s.d, el, day, night, skyC, fog, sunC, skyAmb, gnd, fogD, litF, cloud: Math.max(rk, fk * 0.8) };
  }
  function trafficK(hr) { // fewer cars at night, rush hours fuller (estimate)
    hr = ((hr % 24) + 24) % 24; const base = hr < 5 ? 0.12 : hr < 7 ? 0.4 : hr < 10 ? 1.0 : hr < 16 ? 0.75 : hr < 20 ? 1.0 : hr < 23 ? 0.5 : 0.25; return base;
  }

  /* per-frame movers */
  let lastT = performance.now(), simT = 0, cam0 = [0, 0, 0];
  function step(dt, E) {
    const hr = st.hour, kc = trafficK(hr), active = Math.round(cars.length * kc);
    for (const e of NET.edges) e.cars.length = 0;
    for (let i = 0; i < active; i++) cars[i].e.cars.push(cars[i]);
    for (const e of NET.edges) e.cars.sort((a, b) => a.s - b.s);
    for (let i = 0; i < active; i++) {
      const c = cars[i], e = c.e, list = e.cars, k = list.indexOf(c), ahead = list[k + 1];
      let target = c.vmax * (st.rainK > 0 ? 0.8 : 1) * (st.fogK > 0 ? 0.7 : 1);
      if (ahead) { const gap = ahead.s - c.s - 7; target = Math.min(target, Math.max(0, gap * 0.8)); }
      if (e.len - c.s < 15) target = Math.min(target, 6);   // slow down at the junction
      c.v += Math.max(-6 * dt, Math.min(2.2 * dt, target - c.v));
      c.s += c.v * dt;
      if (c.s >= e.len) { const nx = e.next.length ? e.next[Math.floor(rnd() * e.next.length)] : null; if (nx) { c.s -= e.len; c.e = nx; } else spawnCar(c); }
    }
    for (const p of people) {
      if (p.buddy) { const q = p.buddy; p.w = q.w; p.s = q.s + 0.15 * q.dir; p.dir = q.dir; p.stop = q.stop; p.ph = q.ph + 1.3; continue; }
      if (p.stop > 0) { p.stop -= dt; continue; }
      p.s += p.v * p.dir * dt; p.ph += dt * p.v * 4.2;
      if (p.s > p.w.len || p.s < 0) { if (rnd() < 0.4) spawnPerson(p); else { p.dir *= -1; p.s = Math.min(p.w.len, Math.max(0, p.s)); } }
      if (rnd() < dt * 0.02) p.stop = 2 + rnd() * 8;   // stops to talk or look at the water
    }
    // rebuild dynamic geometry
    DG.a.length = 0; const glow = [], pool = []; const nightK = E.night;
    for (let i = 0; i < active; i++) {
      const c = cars[i], q = along(c.e, c.s), dx = q[2], dy = q[3], ang = Math.atan2(dy, dx);
      const lane = c.e.one ? 0 : Math.min(3.5, c.e.w * 0.25), x = q[0] + dy * lane, y = q[1] - dx * lane;
      const L = c.big ? 9.5 : 4.3, W = c.big ? 2.4 : 1.75, H = c.big ? 2.6 : 0.75;
      carModel(DG, x, y, ang, c.col, c.big, Math.hypot(x - cam0[0], y - cam0[1]) > 120);
      if (nightK > 0.05 || st.rainK > 0.5 || st.fogK > 0.5) {
        const k = Math.max(nightK, st.rainK * 0.6, st.fogK * 0.6), fx = x + dx * L / 2, fy = y + dy * L / 2, bx = x - dx * L / 2, by = y - dy * L / 2;
        glow.push(fx - dy * W * 0.38, fy + dx * W * 0.38, 0.7, 1, 0.95, 0.8, k, 2.2, fx + dy * W * 0.38, fy - dx * W * 0.38, 0.7, 1, 0.95, 0.8, k, 2.2);
        glow.push(bx - dy * W * 0.4, by + dx * W * 0.4, 0.8, 1, 0.08, 0.05, k * 0.8, 1.5, bx + dy * W * 0.4, by - dx * W * 0.4, 0.8, 1, 0.08, 0.05, k * 0.8, 1.5);
        const px = x + dx * (L / 2 + 6), py = y + dy * (L / 2 + 6), r = 5.5;
        const ca = Math.cos(ang), sa = Math.sin(ang), Pp = (a, b) => [px + ca * a * r * 1.4 - sa * b * r * 0.8, py + sa * a * r * 1.4 + ca * b * r * 0.8];
        for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]) { const pp = Pp(a, b); pool.push(pp[0], pp[1], 0.12, a, b, k * 0.6); }
      }
    }
    for (const p of people) {
      const q = along(p.w, p.s), dx = q[2] * p.dir, dy = q[3] * p.dir, x = q[0] - dy * p.side, y = q[1] + dx * p.side, ang = Math.atan2(dy, dx);
      const bob = p.stop > 0 ? 0 : Math.abs(Math.sin(p.ph)) * 0.06;
      const far = Math.hypot(x - cam0[0], y - cam0[1], cam0[2]) > 160;
      personModel(DG, x, y, p.w.z, ang, p.ph, p.stop <= 0, p.look, st.rainK > 0.5 && p.umb, far);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, dynB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(DG.a), gl.DYNAMIC_DRAW); nDyn = DG.n;
    gl.bindBuffer(gl.ARRAY_BUFFER, dynGlowB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glow), gl.DYNAMIC_DRAW); nDynGlow = glow.length / 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, dynPoolB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pool), gl.DYNAMIC_DRAW); nDynPool = pool.length / 6;
    return active;
  }

  /* drawing helpers */
  function bindMain(buf) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf); const s = STRIDE * 4;
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, s, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, s, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, s, 24);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, s, 32);
    gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 3, gl.FLOAT, false, s, 36);
  }
  function off(n) { for (let i = n; i < 5; i++) gl.disableVertexAttribArray(i); }
  function drawScene(VP, cam, E, LVP, clipZ, t, flip, refl) {
    // sky
    gl.depthMask(false); gl.disable(gl.DEPTH_TEST);
    gl.useProgram(P.sky.p); const u0 = P.sky.u;
    gl.uniformMatrix4fv(u0.uIVP, false, inv(VP)); gl.uniform3fv(u0.uSkyC, E.skyC); gl.uniform3fv(u0.uFog, E.fog); gl.uniform3fv(u0.uSun, E.sun);
    gl.uniform3fv(u0.uSunC, E.sunC); gl.uniform1f(u0.uNight, E.night); gl.uniform1f(u0.uCloud, E.cloud); gl.uniform1f(u0.uT, t); gl.uniform1f(u0.uFlip, flip);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadB); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); off(1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
    // opaque
    const p = P.main, u = p.u; gl.useProgram(p.p);
    gl.uniformMatrix4fv(u.uVP, false, VP); gl.uniformMatrix4fv(u.uLVP, false, LVP); gl.uniform3fv(u.uCam, cam);
    gl.uniform3fv(u.uSun, E.sun); gl.uniform3fv(u.uSunC, E.sunC); gl.uniform3fv(u.uSkyC, E.skyAmb); gl.uniform3fv(u.uGndC, E.gnd);
    gl.uniform3fv(u.uFog, E.fog); gl.uniform1f(u.uFogD, E.fogD); gl.uniform1f(u.uNight, E.night); gl.uniform1f(u.uLit, E.litF);
    gl.uniform1f(u.uSlot, Math.floor(st.hour * 60 / 9)); gl.uniform1f(u.uFlood, E.night * 1.1); gl.uniform1f(u.uWet, st.rainK);
    gl.uniform1f(u.uClipZ, clipZ); gl.uniform1f(u.uPitch, T.pitch); gl.uniform1f(u.uT, t); gl.uniform1f(u.uWind, st.wind + st.rainK * 0.6);
    gl.uniform1f(u.uShOn, (shOn && E.sunC[0] > 0.05) ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, shTex); gl.uniform1i(u.uSh, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, luTex); gl.uniform1i(u.uLU, 1);
    gl.uniform2fv(u.uLUo, luO); gl.uniform1f(u.uLUs, luS); gl.uniform3fv(u.uLUd, LUC['.']);
    if (!refl) { // ground outside the water: stencil mask of the water polygons first
      gl.enable(gl.STENCIL_TEST); gl.clear(gl.STENCIL_BUFFER_BIT);
      gl.stencilFunc(gl.ALWAYS, 1, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
      gl.colorMask(false, false, false, false); gl.depthMask(false); gl.disable(gl.DEPTH_TEST);
      gl.useProgram(P.mask.p); gl.uniformMatrix4fv(P.mask.u.uVP, false, VP);
      gl.bindBuffer(gl.ARRAY_BUFFER, wbuf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); off(1); gl.drawArrays(gl.TRIANGLES, 0, nWat);
      gl.colorMask(true, true, true, true); gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
      gl.stencilFunc(gl.NOTEQUAL, 1, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
      gl.useProgram(p.p); bindMain(gndB); gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disable(gl.STENCIL_TEST);
    }
    bindMain(stat); gl.drawArrays(gl.TRIANGLES, 0, nStat);
    bindMain(lampB); gl.drawArrays(gl.TRIANGLES, 0, nLampGeo);
    if (nDyn) { bindMain(dynB); gl.drawArrays(gl.TRIANGLES, 0, nDyn); }
    off(0);
    // foliage: leaf cards with alpha test
    if (nFol) {
      const f = P.fol, uf = f.u; gl.useProgram(f.p);
      gl.uniformMatrix4fv(uf.uVP, false, VP); gl.uniformMatrix4fv(uf.uLVP, false, LVP); gl.uniform3fv(uf.uCam, cam); gl.uniform1f(uf.uT, t); gl.uniform1f(uf.uWind, st.wind + st.rainK * 0.6);
      gl.uniform3fv(uf.uSun, E.sun); gl.uniform3fv(uf.uSunC, E.sunC); gl.uniform3fv(uf.uSkyC, E.skyAmb); gl.uniform3fv(uf.uGndC, E.gnd); gl.uniform3fv(uf.uFog, E.fog); gl.uniform1f(uf.uFogD, E.fogD);
      gl.uniform1f(uf.uClipZ, clipZ); gl.uniform1f(uf.uNight, E.night); gl.uniform1f(uf.uShOn, (shOn && E.sunC[0] > 0.05) ? 1 : 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, shTex); gl.uniform1i(uf.uSh, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, leafTex); gl.uniform1i(uf.uTex, 1);
      bindFol(); gl.drawArrays(gl.TRIANGLES, 0, nFol); off(0);
      gl.activeTexture(gl.TEXTURE0);
    }
  }
  function bindFol() {
    gl.bindBuffer(gl.ARRAY_BUFFER, folB); const s = 48;
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, s, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, s, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, s, 24);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 3, gl.FLOAT, false, s, 32);
    gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 1, gl.FLOAT, false, s, 44);
  }
  function drawLights(VP, cam, E, t, px) {
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
    const k = E.night;
    if (k > 0.02 || nDynPool) {
      gl.useProgram(P.pool.p); gl.uniformMatrix4fv(P.pool.u.uVP, false, VP);
      gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); off(2);
      if (k > 0.02) { gl.uniform1f(P.pool.u.uK, k * 0.55 * (1 + st.rainK)); gl.uniform3fv(P.pool.u.uCol, [1.0, 0.55, 0.22]);
        gl.bindBuffer(gl.ARRAY_BUFFER, poolB); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12); gl.drawArrays(gl.TRIANGLES, 0, nPool); }
      if (nDynPool) { gl.uniform1f(P.pool.u.uK, 0.5); gl.uniform3fv(P.pool.u.uCol, [1.0, 0.95, 0.8]);
        gl.bindBuffer(gl.ARRAY_BUFFER, dynPoolB); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12); gl.drawArrays(gl.TRIANGLES, 0, nDynPool); }
    }
    gl.useProgram(P.pt.p); const u = P.pt.u;
    gl.uniformMatrix4fv(u.uVP, false, VP); gl.uniform3fv(u.uCam, cam); gl.uniform1f(u.uPx, px); gl.uniform1f(u.uT, t);
    gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2); off(3);
    if (k > 0.02) { gl.bindBuffer(gl.ARRAY_BUFFER, glowB); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 12); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 32, 28);
      gl.drawArrays(gl.POINTS, 0, Math.round(nGlow * 1)); }
    if (nDynGlow) { gl.bindBuffer(gl.ARRAY_BUFFER, dynGlowB); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 12); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 32, 28); gl.drawArrays(gl.POINTS, 0, nDynGlow); }
    off(0); gl.disable(gl.BLEND); gl.depthMask(true);
  }

  let bloomOn = opt.bloom !== false, shOn = !!shFb && quality >= 2, refOn = quality >= 1, frames = 0, fpsT = performance.now(), fps = 60;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2), w = Math.max(1, Math.round(host.clientWidth * dpr)), h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }
  function frame(now) {
    if (!st.alive) return;
    st.raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    resize();
    const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now; simT += dt;
    if (st.auto) { const n = donetskNow(); st.hour = n.h; } else if (st.lapse) st.hour = (st.hour + dt * 0.25) % 24; // time-lapse: 1 s = 15 min
    if (opt.onHour) opt.onHour(st.hour, st.auto);
    st.rainK += ((st.weather === 'rain' ? 1 : 0) - st.rainK) * Math.min(1, dt * 0.8);
    st.fogK += ((st.weather === 'fog' ? 1 : 0) - st.fogK) * Math.min(1, dt * 0.8);
    st.wind = 0.35 + 0.25 * Math.sin(simT * 0.11) + st.rainK * 0.4;
    const E = env(st.hour, st.weather);
    const nCars = step(dt, E);
    // camera
    const ch = Math.cos(st.pitch), tz = Math.min(48, Math.max(6, st.dist * 0.16));
    const tgt = [0, 0, tz], cam = [tgt[0] + Math.cos(st.yaw) * ch * st.dist, tgt[1] + Math.sin(st.yaw) * ch * st.dist, Math.max(2.5, tgt[2] + Math.sin(st.pitch) * st.dist)];
    const W = canvas.width, H = canvas.height, asp = W / H;
    const fov = (asp < 0.8 ? 62 : 46) * Math.PI / 180;
    cam0 = cam; const proj = persp(fov, asp, 0.5, 6000), view = lookAt(cam, tgt, [0, 0, 1]), VP = mmul(proj, view);
    const px = H / (2 * Math.tan(fov / 2));
    // shadow pass
    let LVP = new Float32Array(16);
    if (shOn && E.sunC[0] > 0.05 && E.sun[2] > 0.03) {
      const sr = Math.min(330, Math.max(90, st.dist * 0.8)), fwd = [-Math.cos(st.yaw), -Math.sin(st.yaw)];
      const c = [fwd[0] * sr * 0.35, fwd[1] * sr * 0.35, 0], e = V.add(c, V.mul(E.sun, 900)), lv = lookAt(e, c, Math.abs(E.sun[2]) > 0.95 ? [0, 1, 0] : [0, 0, 1]);
      LVP = mmul(ortho(-sr, sr, -sr, sr, 300, 1700), lv);
      gl.bindFramebuffer(gl.FRAMEBUFFER, shFb); gl.viewport(0, 0, 2048, 2048); gl.enable(gl.DEPTH_TEST); gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
      gl.useProgram(P.shd.p); gl.uniformMatrix4fv(P.shd.u.uLVP, false, LVP);
      for (const b of [[stat, nStat], [dynB, nDyn]]) { if (!b[1]) continue; gl.bindBuffer(gl.ARRAY_BUFFER, b[0]); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE * 4, 0);
        gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, STRIDE * 4, 32); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, STRIDE * 4, 24); gl.drawArrays(gl.TRIANGLES, 0, b[1]); }
      off(0);
      if (nFol) { gl.useProgram(P.shf.p); gl.uniformMatrix4fv(P.shf.u.uLVP, false, LVP); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, leafTex); gl.uniform1i(P.shf.u.uTex, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, folB); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 48, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 48, 24); off(2);
        gl.drawArrays(gl.TRIANGLES, 0, nFol); off(0); gl.activeTexture(gl.TEXTURE0); }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    // reflection pass (planar, water at z=0.04)
    const wz = WZ;
    if (refOn) {
      const rw = Math.max(64, Math.round(W * (quality >= 2 ? 0.5 : 0.35))), rh = Math.max(64, Math.round(H * (quality >= 2 ? 0.5 : 0.35)));
      ensureRef(rw, rh); gl.bindFramebuffer(gl.FRAMEBUFFER, refFb); gl.viewport(0, 0, rw, rh); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const R = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 2 * wz, 1]);
      const RVP = mmul(VP, R);
      drawScene(RVP, cam, E, LVP, wz + 0.15, simT, 1, true);
      drawLights(RVP, cam, E, simT, px * rh / H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawScene(VP, cam, E, LVP, -1e9, simT, 1, false);
    { gl.enable(gl.BLEND); gl.blendFunc(gl.DST_COLOR, gl.ZERO); gl.depthMask(false); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -2);
      gl.useProgram(P.ao.p); gl.uniformMatrix4fv(P.ao.u.uVP, false, VP); gl.uniform1f(P.ao.u.uK, 0.55 + 0.45 * E.day);
      gl.bindBuffer(gl.ARRAY_BUFFER, aoB); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12); off(2);
      gl.drawArrays(gl.TRIANGLES, 0, nAO); off(0); gl.disable(gl.POLYGON_OFFSET_FILL); gl.disable(gl.BLEND); gl.depthMask(true); }
    // water
    gl.useProgram(P.wat.p); const uw = P.wat.u;
    gl.uniformMatrix4fv(uw.uVP, false, VP); gl.uniform3fv(uw.uCam, cam); gl.uniform2f(uw.uRes, W, H); gl.uniform1f(uw.uT, simT);
    gl.uniform3fv(uw.uSun, E.sun); gl.uniform3fv(uw.uSunC, E.sunC); gl.uniform3fv(uw.uFog, E.fog); gl.uniform1f(uw.uFogD, E.fogD); gl.uniform3fv(uw.uSkyC, E.skyC);
    gl.uniform1f(uw.uRain, st.rainK); gl.uniform1f(uw.uWind, st.wind); gl.uniform1f(uw.uRefOn, refOn ? 1 : 0); gl.uniform1f(uw.uNight, E.night);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, refTex); gl.uniform1i(uw.uRef, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, wbuf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); off(1);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1, -1); gl.drawArrays(gl.TRIANGLES, 0, nWat); gl.disable(gl.POLYGON_OFFSET_FILL);
    drawLights(VP, cam, E, simT, px);
    // rain
    if (st.rainK > 0.02) {
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      gl.useProgram(P.rain.p); gl.uniformMatrix4fv(P.rain.u.uVP, false, VP); gl.uniform3fv(P.rain.u.uCam, cam); gl.uniform1f(P.rain.u.uT, simT);
      gl.uniform3fv(P.rain.u.uCol, V.mul(mix3([0.55, 0.5, 0.45], [0.75, 0.78, 0.82], E.day), st.rainK));
      gl.bindBuffer(gl.ARRAY_BUFFER, rainB); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0); off(1);
      gl.drawArrays(gl.LINES, 0, 2800); gl.disable(gl.BLEND); gl.depthMask(true);
    }
    // glow
    if (bloomOn) bloom(W, H, (0.25 + 0.9 * E.night) * (1 + st.fogK * 0.6 + st.rainK * 0.3), mix3([0.82, 0, 0], [0.55, 0, 0], E.night)[0]);
    // sound
    let wd = 1e9; for (let i = 0; i < waterPts.length; i += 3) { const q = waterPts[i]; const d = Math.hypot(q[0] - cam[0], q[1] - cam[1]); if (d < wd) wd = d; }
    sound.update({ cars: nCars, height: cam[2], waterDist: Math.hypot(wd, cam[2]), rain: st.rainK, wind: st.wind, day: E.day });
    // adaptive quality: drop shadows, then reflections, if the device struggles
    frames++;
    if (now - fpsT > 2500 && opt.quality == null) { fps = frames * 1000 / (now - fpsT); frames = 0; fpsT = now;
      if (fps < 24 && shOn) shOn = false; else if (fps < 14 && bloomOn) bloomOn = false; else if (fps < 20 && refOn && quality >= 2) quality = 1; else if (fps < 16 && refOn) refOn = false; }
  }
  gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
  st.raf = requestAnimationFrame(frame);
  return {
    setAuto(v) { st.auto = !!v; if (v) st.lapse = false; },
    setHour(h) { st.auto = false; st.hour = ((h % 24) + 24) % 24; },
    setLapse(v) { st.lapse = !!v; if (v) st.auto = false; },
    setWeather(w) { st.weather = w; },
    sound(v) { return v ? sound.start() : (sound.stop(), false); },
    get hour() { return st.hour; }, get auto() { return st.auto; }, get fps() { return fps; },
    debug() { return { nStat, cars: cars.length, people: people.length, edges: NET.edges.length, walks: NET.walks.length, lamps: lamps.length, shOn, refOn, fps, quality }; },
    setView(yaw, pitch, dist) { st.yaw = yaw; st.pitch = pitch; st.dist = dist; },
    destroy() { st.alive = false; cancelAnimationFrame(st.raf); sound.close(); const l = gl.getExtension('WEBGL_lose_context'); if (l) l.loseContext(); canvas.remove(); },
  };
}
window.KT3D = { open };
})();
