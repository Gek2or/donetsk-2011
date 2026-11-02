/* v7.6: painted tree atlas shared by the 3D scenes. Eight October trees of Donetsk streets and yards, each painted
   leaf by leaf into a 256×512 cell of a 2048×512 RGBA image: trunk and limbs, leaf clumps lit from the upper right,
   darker inside and below, with gaps to the sky. Returns ImageData whose transparent pixels carry the colour of the
   nearest leaf, so mipmaps do not get dark fringes. Species: 0 pyramidal poplar, 1 broad poplar, 2 linden,
   3 horse chestnut, 4 birch, 5 Norway maple, 6 black locust (acacia), 7 young tree. */
(function () {
  'use strict';
  const CW = 256, CH = 512, N = 10, COLS = 8, ROWS = 2; // cells of 256×512 in an 8×2 grid (2048×1024); cell 10 holds two crowns seen from above; cells 11-15 are free for the caller
  // crown: bottom and top (fraction of cell height from the ground), widest half-width and where it is (0 bottom, 1 top),
  // clumps, clump radius (px), leaves per clump, leaf size (px), gap-ness, droop, bark colour
  const SP = [
    { yb: .07, yt: .985, hw: .24, hp: .32, n: 70, r: 15, k: 70, ls: 2.4, gap: .10, droop: 0, bark: [70, 62, 52], pal: ['#6f7f3a', '#8a8f3c', '#a89a3e', '#c2a94a', '#5d6e34', '#b8a246'] },
    { yb: .30, yt: .985, hw: .46, hp: .55, n: 64, r: 22, k: 90, ls: 2.8, gap: .25, droop: 0, bark: [78, 72, 64], pal: ['#7d8a3c', '#a6a24a', '#6f7a3a', '#c0ad50', '#8f9444', '#5f6c32'] },
    { yb: .26, yt: .975, hw: .45, hp: .52, n: 72, r: 21, k: 95, ls: 2.6, gap: .14, droop: 0, bark: [62, 54, 46], pal: ['#8a8a3a', '#b49a3a', '#c9a844', '#757c38', '#d4b55a', '#9c9440'] },
    { yb: .22, yt: .960, hw: .48, hp: .48, n: 66, r: 24, k: 80, ls: 4.2, gap: .10, droop: .1, bark: [58, 50, 44], pal: ['#7a6a32', '#9a6a30', '#6c7136', '#a8803c', '#5f5a2c', '#8c4e26'] },
    { yb: .30, yt: .985, hw: .30, hp: .45, n: 60, r: 15, k: 70, ls: 2.0, gap: .30, droop: .55, bark: [214, 208, 196], pal: ['#c9a838', '#d8b84a', '#b8a040', '#8d8a3a', '#e0c460', '#a8963c'] },
    { yb: .25, yt: .965, hw: .46, hp: .55, n: 68, r: 22, k: 90, ls: 3.2, gap: .16, droop: 0, bark: [66, 58, 50], pal: ['#c8772c', '#d99a30', '#b85a28', '#e0b040', '#8c7a34', '#a4642c'] },
    { yb: .30, yt: .975, hw: .44, hp: .62, n: 46, r: 17, k: 60, ls: 2.2, gap: .42, droop: .15, bark: [74, 64, 54], pal: ['#7d8a42', '#97964a', '#6b783a', '#b0a654', '#5d6a34', '#8a8c40'] },
    { yb: .20, yt: .950, hw: .40, hp: .50, n: 40, r: 16, k: 60, ls: 2.4, gap: .30, droop: 0, bark: [80, 70, 58], pal: ['#8a8c3e', '#b09a44', '#6e7838', '#c4a84a', '#7c8a40'] },
    { yb: .12, yt: .960, hw: .47, hp: .62, n: 60, r: 18, k: 60, ls: 2.2, gap: .20, droop: .8, bark: [82, 74, 60], pal: ['#9aa048', '#b4ac52', '#7f8a40', '#c8b65a', '#8c9446'] },
    { yb: .28, yt: .985, hw: .44, hp: .58, n: 64, r: 21, k: 85, ls: 2.8, gap: .22, droop: 0, bark: [196, 194, 184], pal: ['#8e9446', '#aaa452', '#74803c', '#c2b058', '#9aa04c', '#b8b8a4'] }
  ];
  // card proportions for the scenes: height and width in units of the tree size
  const ASPECT = [[2.3, .85], [1.55, 1.1], [1.3, 1.05], [1.2, 1.1], [1.75, .85], [1.25, 1.05], [1.35, 1.05], [1.0, .9], [1.15, 1.25], [1.65, 1.1]];
  function rng(s) { return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function env(sp, y) { // half-width of the crown (fraction of cell width) at height y (fraction)
    if (y < sp.yb || y > sp.yt) return 0;
    const t = (y - sp.yb) / (sp.yt - sp.yb);
    const a = t < sp.hp ? Math.sin(t / sp.hp * Math.PI / 2) : Math.cos((t - sp.hp) / (1 - sp.hp) * Math.PI / 2);
    return sp.hw * Math.pow(Math.max(0, a), .8);
  }
  // paint one tree on its own canvas in natural proportions (the card's width:height), y measured from the ground up
  function paint(si, seed) {
    const sp = SP[si], R = rng(seed * 7919 + 13), A = ASPECT[si];
    const H = CH, Wn = Math.round(CH * A[1] / A[0]);
    const cv = document.createElement('canvas'); cv.width = Wn; cv.height = H; const ctx = cv.getContext('2d');
    const cx0 = Wn / 2, Y = y => H - y; // y in px from the ground
    const hwp = y => env(sp, y / H) * Wn; // fraction of card width → px
    const pal = sp.pal.map(hex), bark = sp.bark;
    const clumps = [];
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pyr = si === 0, birch = si === 4 || si === 9, young = si === 7, willow = si === 8;
    const maxD = pyr ? 5 : young ? 4 : 6;
    function inside(x, y) { const w = hwp(y); return w > 2 && Math.abs(x - cx0) < w; }
    function seg(x0, y0, x1, y1, w0, w1, shade) {
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6));
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n, w = w0 + (w1 - w0) * t0;
        ctx.strokeStyle = `rgb(${bark.map(v => Math.min(255, v * shade) | 0)})`; ctx.lineWidth = Math.max(.7, w);
        ctx.beginPath(); ctx.moveTo(x0 + (x1 - x0) * t0, Y(y0 + (y1 - y0) * t0)); ctx.lineTo(x0 + (x1 - x0) * t1, Y(y0 + (y1 - y0) * t1)); ctx.stroke();
      }
    }
    function grow(x, y, ang, len, w, d) {
      let x1 = x + Math.sin(ang) * len, y1 = y + Math.cos(ang) * len;
      // keep the limbs inside the crown: shorten and turn back towards the axis
      for (let k = 0; k < 6 && !inside(x1, y1) && y1 > sp.yb * H * .8; k++) { len *= .8; ang *= .8; x1 = x + Math.sin(ang) * len; y1 = y + Math.cos(ang) * len; }
      if (y1 > sp.yt * H - sp.r * .6) { const k = Math.max(.15, (sp.yt * H - sp.r * .6 - y) / Math.max(1, y1 - y)); x1 = x + (x1 - x) * k; y1 = y + (y1 - y) * k; d = maxD; }
      const shade = .75 + .35 * R();
      seg(x, y, x1, y1, w, w * .7, shade);
      if (d >= 1) clumps.push({ x: (x + x1) / 2, y: (y + y1) / 2, z: R(), r: sp.r * (.55 + .4 * R()) });
      if (d >= maxD || len < 7) { clumps.push({ x: x1, y: y1, z: R(), r: sp.r * (.75 + .5 * R()) }); return; }
      const nb = pyr ? 2 : (R() < .35 ? 3 : 2);
      for (let i = 0; i < nb; i++) {
        const spread = pyr ? .22 : birch ? .55 : si === 6 ? .8 : .62;
        let a = ang + (i - (nb - 1) / 2) * spread * (1.2 - .2 * R()) + (R() - .5) * .35;
        if (birch && d >= 3) a += Math.sign(x1 - cx0 || 1) * .35; // birch limbs bend out and down
        const keep = pyr && i === 0;
        grow(x1, y1, keep ? ang * .5 : a, len * (keep ? .85 : .72 + .12 * R()), w * .68, d + 1);
      }
    }
    // trunk up to the first fork, then the limbs
    const fork = pyr ? sp.yb * H + 10 : Math.max(sp.yb * H * .95, H * .16);
    const tw = Math.max(young ? 7 : 10, (young ? .04 : pyr ? .07 : .055) * Wn);
    {
      const n = 30; for (let i = 0; i < n; i++) {
        const y0 = fork * i / n, y1 = fork * (i + 1) / n, w = tw * (1 - .25 * i / n) / 2, sw = Math.sin(y0 * .03 + seed) * 1.5;
        const g = ctx.createLinearGradient(cx0 - w + sw, 0, cx0 + w + sw, 0);
        g.addColorStop(0, `rgb(${bark.map(v => v * .5 | 0)})`); g.addColorStop(.6, `rgb(${bark})`); g.addColorStop(1, `rgb(${bark.map(v => Math.min(255, v * 1.12) | 0)})`);
        ctx.fillStyle = g; ctx.fillRect(cx0 - w + sw, Y(y1), 2 * w, Y(y0) - Y(y1) + 1);
        if (birch && R() < .55) { ctx.fillStyle = 'rgba(34,30,28,.85)'; ctx.fillRect(cx0 - w + sw + R() * w, Y(y1), w * (.3 + R() * .9), 1.6); }
      }
    }
    const L0 = (sp.yt * H - fork) * (pyr ? .42 : .36);
    const nMain = pyr ? 1 : young ? 2 : 3;
    for (let i = 0; i < nMain; i++) grow(cx0, fork, nMain === 1 ? 0 : (i - (nMain - 1) / 2) * .55 + (R() - .5) * .2, L0 * (.9 + .2 * R()), tw * .85, 0);
    if (pyr) for (let y = fork; y < sp.yt * H * .95; y += 14) { const sd = R() < .5 ? -1 : 1; grow(cx0, y, sd * (.25 + .2 * R()), 26 + 20 * R(), 2.2, 3); }
    // extra clumps to fill the crown where the limbs left it thin
    for (let g = 0, add = 0; g < 6000 && add < sp.n * 1.4; g++) {
      const y = (sp.yb + R() * (sp.yt - sp.yb)) * H, w = hwp(y); if (w < 3) continue; const x = cx0 + (R() * 2 - 1) * w * .88;
      if (R() < sp.gap) continue; const e = Math.abs(x - cx0) / w; clumps.push({ x, y, z: R() * (.35 + .6 * e), r: sp.r * (.7 + .5 * R()) }); add++;
    }
    clumps.sort((a, b) => a.z - b.z);
    if (willow) { // hanging curtains of narrow leaves from every clump
      for (const c of clumps) { const ns = 2 + (R() * 3 | 0); for (let q = 0; q < ns; q++) {
        let px = c.x + (R() - .5) * c.r * 1.6, py = c.y + (R() - .3) * c.r; const len = 30 + R() * 70 * Math.min(1, (py / H) * 1.4), bend = (px - cx0) * .004;
        for (let t = 0; t < len; t += 2.2) { const col = pal[(R() * pal.length) | 0], m = (.55 + .4 * c.z) * (.85 + .3 * R()) * (1 - .25 * t / len);
          ctx.fillStyle = `rgb(${Math.min(255, col[0] * m) | 0},${Math.min(255, col[1] * m) | 0},${Math.min(255, col[2] * m) | 0})`;
          ctx.beginPath(); ctx.ellipse(px + bend * t + (R() - .5) * 2.5, Y(py - t), .9, 2.6, (R() - .5) * .4, 0, Math.PI * 2); ctx.fill(); } } }
    }
    const lit = [.6, .8];
    for (const c of clumps) {
      const tH = Math.max(0, Math.min(1, (c.y / H - sp.yb) / (sp.yt - sp.yb))), side = (c.x - cx0) / (hwp(c.y) + 1);
      const base = (.5 + .42 * c.z) * (.8 + .28 * tH) * (.94 + .1 * side);
      for (let k = 0; k < sp.k; k++) {
        let dx = (R() + R() + R() - 1.5) / 1.5, dy = (R() + R() + R() - 1.5) / 1.5;
        if (dx * dx + dy * dy > 1) continue;
        const px = c.x + dx * c.r, py = c.y + dy * c.r - sp.droop * c.r * .6 * (1 - dy);
        const L = .72 + .42 * (dx * lit[0] + dy * lit[1]) * .7;
        const col = pal[(R() * pal.length) | 0], m = Math.max(.22, base * L * (.84 + .32 * R()));
        ctx.fillStyle = `rgb(${Math.min(255, col[0] * m) | 0},${Math.min(255, col[1] * m) | 0},${Math.min(255, col[2] * m) | 0})`;
        const s = sp.ls * (.7 + .6 * R());
        ctx.beginPath(); ctx.ellipse(px, Y(py), s, s * (.45 + .3 * R()), R() * Math.PI, 0, Math.PI * 2); ctx.fill();
      }
    }
    return cv;
  }
  // crowns seen from above for the cards that close the top of a tree: cell 10, two variants of 256×256 (green-yellow, warm)
  function paintTop(ctx, ox, oy, warm, seed) {
    const R = rng(seed), pal = (warm ? SP[3].pal.concat(SP[5].pal) : SP[2].pal.concat(SP[0].pal)).map(hex), c = 128, rad = 118;
    const cl = []; for (let i = 0; i < 160; i++) { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * (rad - 14); cl.push({ x: c + Math.cos(a) * r, y: c + Math.sin(a) * r, z: R() * (1 - r / rad * .5), r: 12 + R() * 12 }); }
    cl.sort((a, b) => a.z - b.z);
    for (const q of cl) for (let k = 0; k < 70; k++) {
      const dx = (R() + R() + R() - 1.5) / 1.5, dy = (R() + R() + R() - 1.5) / 1.5; if (dx * dx + dy * dy > 1) continue;
      const px = q.x + dx * q.r, py = q.y + dy * q.r; if (Math.hypot(px - c, py - c) > rad) continue;
      const L = (.55 + .4 * q.z) * (.8 + .35 * (dx * .6 - dy * .8) * .6) * (.85 + .3 * R()), col = pal[(R() * pal.length) | 0];
      ctx.fillStyle = `rgb(${Math.min(255, col[0] * L) | 0},${Math.min(255, col[1] * L) | 0},${Math.min(255, col[2] * L) | 0})`;
      ctx.beginPath(); ctx.ellipse(ox + px, oy + py, 2.6, 1.5, R() * Math.PI, 0, Math.PI * 2); ctx.fill(); }
  }
  function dilate(img) { // spread leaf colours into the transparent pixels around them
    const d = img.data, w = img.width, h = img.height;
    for (let pass = 0; pass < 6; pass++) {
      const src = new Uint8ClampedArray(d);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4; if (src[i + 3] > 0 || (src[i] | src[i + 1] | src[i + 2])) continue;
        let r = 0, g = 0, b = 0, n = 0;
        for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + ax, yy = y + ay; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = (yy * w + xx) * 4; if (src[j + 3] > 0 || (src[j] | src[j + 1] | src[j + 2])) { r += src[j]; g += src[j + 1]; b += src[j + 2]; n++; }
        }
        if (n) { d[i] = r / n; d[i + 1] = g / n; d[i + 2] = b / n; }
      }
    }
    return img;
  }
  let cache = null;
  window.__TREEATLAS = function () {
    if (cache) return cache;
    const cv = document.createElement('canvas'); cv.width = CW * COLS; cv.height = CH * ROWS;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    for (let i = 0; i < N; i++) ctx.drawImage(paint(i, 11 + i * 37), (i % COLS) * CW, Math.floor(i / COLS) * CH, CW, CH);
    paintTop(ctx, 2 * CW, CH, false, 501); paintTop(ctx, 2 * CW, CH + 256, true, 733);
    cache = { img: dilate(ctx.getImageData(0, 0, cv.width, cv.height)), n: N, cols: COLS, rows: ROWS, aspect: ASPECT, canvas: cv };
    return cache;
  };
})();
