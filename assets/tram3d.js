/* v7.6: painted tree atlas shared by the 3D scenes. Eight October trees of Donetsk streets and yards, each painted
   leaf by leaf into a 256×512 cell of a 2048×512 RGBA image: trunk and limbs, leaf clumps lit from the upper right,
   darker inside and below, with gaps to the sky. Returns ImageData whose transparent pixels carry the colour of the
   nearest leaf, so mipmaps do not get dark fringes. Species: 0 pyramidal poplar, 1 broad poplar, 2 linden,
   3 horse chestnut, 4 birch, 5 Norway maple, 6 black locust (acacia), 7 young tree. */
if (!window.__TREEATLAS) (function () {
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

/* v6.6: the cab view of tram route 1. A small WebGL renderer for the street corridor (assets/tram3d.json):
   buildings with windows, roads and pavements, parks, water, the rails with their overhead wire, stops and trees.
   World: x east, y up, z south, metres. */
window.__T3D=function(canvas,opts){
'use strict';
opts=opts||{};
const gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'default'})||canvas.getContext('experimental-webgl');
if(!gl)return null;
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;if(opts.onlost)opts.onlost()});
const LITE=opts.lite;
/* ---------- shaders ---------- */
const VS=`attribute vec3 p;attribute vec3 n;attribute vec4 c;attribute vec3 f;
uniform mat4 M;uniform mat4 MO;uniform vec3 E;uniform float MODE;uniform float WT;varying vec3 vn;varying vec4 vc;varying vec3 vf;varying vec3 vw;
void main(){vec4 w=MO*vec4(p,1.);if(MODE>.5&&f.z>-.5){float h=f.y*f.y;w.x+=sin(WT*1.1+w.x*.21+w.z*.17)*.16*h;w.z+=cos(WT*.9+w.x*.13)*.1*h;}vn=mat3(MO)*n;vc=c;vf=f;vw=w.xyz;gl_Position=M*w;}`;
const FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vn;varying vec4 vc;varying vec3 vf;varying vec3 vw;
uniform vec3 E;uniform vec3 SUN;uniform vec3 FOG;uniform float FD;uniform float MODE;uniform sampler2D TX;uniform vec3 SUNC;uniform vec3 AMB;uniform float NIGHT;uniform vec3 CD;
float h1(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
float hh(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float vn2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return .5*vn2(p)+.27*vn2(p*2.03+7.1)+.15*vn2(p*4.1+3.7)+.08*vn2(p*8.3+1.3);}
void main(){vec3 col=vc.rgb;vec3 N=normalize(vn);
 float k=vf.z;
 if(MODE>.5){ /* v7.6 trees: painted October crowns from the tree atlas (treeatlas.js), three cards per tree; flat shadow discs under them */
  float dT=length(vw-E);float foT=clamp(1.-exp(-pow(dT/FD,1.6)),0.,1.);
  if(vf.z<-.5){float rr=length(vf.xy-.5)*2.;gl_FragColor=vec4(0.,0.,0.,(1.-smoothstep(.35,1.,rr))*.34*(1.-NIGHT*.7)*(1.-foT));return;}
  vec4 t=texture2D(TX,vec2((mod(vf.z,8.)+clamp(vf.x,.004,.996))*.125,(floor(vf.z/8.+.01)+1.-clamp(vf.y,.002,.998))*.5));
  if(t.a<.5-.25*clamp(dT/260.,0.,1.))discard;
  vec3 tc=t.rgb*vc.rgb*1.33;
  vec3 hn=normalize(vec3(N.x,0.,N.z)+vec3(0.,.001,0.));float face=abs(dot(hn,normalize(vec3(SUN.x,0.,SUN.z)+vec3(0.,.001,0.))));
  vec3 Lt=AMB*vec3(.93,.97,1.06)*.92+SUNC*(.66+.3*face)*smoothstep(-.05,.15,SUN.y)+.16*(1.-NIGHT*.85);
  Lt*=.8+.2*clamp(vf.y*1.4,0.,1.);
  vec3 cT=tc*Lt;cT=mix(cT,FOG,foT);cT=cT*(1.08-.12*cT);gl_FragColor=vec4(cT,1.);return;
 }else if(k>.5&&k<9.5){ /* facades: floors of 2.9 m, windows every 3 m (houses 4.2 m) */
  float u=vf.x,v=vf.y;float fw=k>2.5&&k<3.5?4.4:(k>3.5&&k<4.5?3.6:3.0);float fh=k>2.5&&k<3.5?4.5:2.9;
  float fx=fract(u/fw),fy=fract(v/fh);float row=floor(v/fh);
  float win=step(.31,fx)*step(fx,.69)*step(.34,fy)*step(fy,.78);
  if(k>2.5&&k<3.5){win=step(.12,fx)*step(fx,.88)*step(.55,fy)*step(fy,.85);} /* industrial: high strips */
  if(k>3.5&&k<4.5&&row<1.){win=step(.08,fx)*step(fx,.92)*step(.18,fy)*step(fy,.86);} /* shops on the ground floor */
  if(v<.9)win=0.;
  if(vf.z>4.5)win=0.;
  float lit=h1(vec2(floor(u/fw),row));
  vec3 glass=mix(vec3(.30,.36,.42),vec3(.58,.66,.74),clamp(.25+lit*.55,0.,1.));
  float frame=win*(1.-step(.33,fx)*step(fx,.67)*step(.36,fy)*step(fy,.76));
  col=mix(col,glass,win*.88);col=mix(col,vec3(.86,.85,.82),frame*.7);
  /* at night about a third of the windows are lit: warm bulbs, a few cold TV-blue */
  float on=win*step(lit,.36)*NIGHT*(1.-frame);
  if(on>0.){vec3 bulb=lit<.05?vec3(.55,.68,.95):mix(vec3(1.,.78,.42),vec3(1.,.9,.66),lit*2.5);float d0=length(vw-E);float fo0=1.-exp(-pow(d0/FD,1.6));gl_FragColor=vec4(mix(bulb*(.85+.15*fy),FOG,clamp(fo0*.7,0.,1.)),1.);return;}
  /* loggias on the residential blocks: a pale parapet under some windows from the second floor up */
  if(k>.5&&k<1.5&&row>=1.){float bc=h1(vec2(floor(u/fw),7.));if(bc<.42&&fx>.16&&fx<.84&&fy<.33){col=mix(col,vec3(.9,.88,.84)*(bc<.2?1.:.93),.85);win=0.;}}
  col*=1.-.18*step(v,.75)*step(.5,k);
  col*=1.-.06*step(.96,fract(v/fh)); /* slab line */
  if(k<4.5){col*=1.-.07*step(.975,fract(u/fw+.5))*step(.9,v);
   col*=.93+.1*vn2(vec2(u*1.7,v*.07));
   col*=1.-.12*(1.-smoothstep(.0,1.6,v))*(.6+.4*vn2(vec2(u*2.,1.)));}
 }
 if(k>5.5&&k<9.5){ /* lamps and car lights: they glow after dark */
  vec3 em=k<6.5?vec3(1.,.72,.38):k<7.5?vec3(1.,.97,.86):vec3(.95,.12,.08);
  col=mix(col,em*1.15,NIGHT);if(NIGHT>.5){float d1=length(vw-E);gl_FragColor=vec4(mix(col,FOG,clamp((1.-exp(-pow(d1/FD,1.6)))*.5,0.,1.)),1.);return;}}
 float dE=length(vw-E);float near=1.-smoothstep(40.,260.,dE);
 if(MODE<.5&&N.y>.8&&(k<.5||k>9.5)){vec2 w=mod(vw.xz,2048.);
  if(k>9.5&&k<10.5){
   float g=vn2(w*22.)*.6+vn2(w*7.)*.4;col*=.78+.4*g*mix(.5,1.,near);
   float sl=step(fract(vf.x/.6),.3)*step(abs(vf.y),1.25);col=mix(col,vec3(.5,.48,.45)*(.9+.15*vn2(w*3.)),sl*.92*(.35+.65*near));
   col=mix(col,col*vec3(1.05,.82,.66),(1.-smoothstep(.0,.35,abs(abs(vf.y)-.76)))*.5);
  }else if(k>10.5&&k<11.5){
   col=mix(vec3(.36,.3,.26),vec3(.78,.77,.75),smoothstep(.0,.6,1.-abs(vf.y)/.045));
  }else if(k>11.5&&k<12.5){
   col*=(.86+.22*fbm(w*.9))*(1.-.25*step(.97,fract(vf.x/2.)));
  }else if(k>12.5&&k<13.5){
   col*=.84+.26*fbm(w*.25)+.1*(vn2(w*9.)-.5)*near;
   col*=1.-.06*smoothstep(.74,.82,fbm(w*.06+3.));col*=1.-.07*(1.-smoothstep(.0,.5,abs(abs(vf.y)-1.7)));
  }else if(k>13.5&&k<14.5){
   col*=.88+.2*fbm(w*.6);col*=1.-(.08*step(.95,fract(w.x*.8))+.08*step(.95,fract(w.y*.8)))*near;
  }else if(k>14.5&&k<15.5){
   col*=.8+.35*fbm(w*.5)+.1*(vn2(w*6.)-.5)*near;
  }else if(k>20.5&&k<21.5){
   float rp=vn2(w*1.3);float fr=pow(1.-clamp(abs((vw.y-E.y)/max(dE,1.)),0.,1.),4.);
   col=mix(col*.8,FOG*.95,.35+.45*fr)+SUNC*pow(max(dot(reflect(normalize(vw-E),normalize(vec3((rp-.5)*.08,1.,(vn2(w*2.)-.5)*.08))),SUN),0.),60.)*(1.-NIGHT)*1.5;
  }else if(col.g>col.r*1.03&&col.g>col.b){
   float m=fbm(w*.08),m2=fbm(w*.6+5.);col*=.82+.32*m;col=mix(col,col*vec3(1.25,1.02,.62),smoothstep(.45,.75,m2)*.65);
   float lv=step(.86,vn2(w*5.3))*near;col=mix(col,mix(vec3(.62,.42,.16),vec3(.7,.6,.25),vn2(w*9.)),lv*.55);
   col*=.9+.18*(vn2(w*14.)-.5)*near;
  }else col*=.88+.24*fbm(w*.3);
 }
 float sun=max(dot(N,SUN),0.);float hemi=.5+.5*N.y;
 vec3 light=AMB*hemi*vec3(.93,.97,1.06)+SUNC*sun*1.08+.17*(1.-NIGHT*.85)+vec3(.05,.045,.03)*(1.-hemi)*(1.-NIGHT);
 /* the tram's own headlights on what is in front of it */
 vec3 tp=vw-E;float dd=length(tp.xz);float fw=dot(tp.xz/max(dd,.01),CD.xz);
 light+=NIGHT*vec3(1.,.95,.8)*smoothstep(.86,.985,fw)*clamp(1.-dd/70.,0.,1.)*(N.y>.5?1.1:.6)*step(vw.y,4.);
 col*=light;
 float d=length(vw-E);float fo=1.-exp(-pow(d/FD,1.6));
 col=mix(col,FOG,clamp(fo,0.,1.));
 col=col*(1.08-.12*col);
 gl_FragColor=vec4(col,1.);}`;
const SVS=`attribute vec2 p;varying vec2 q;void main(){q=p;gl_Position=vec4(p,.9999,1.);}`;
const SFS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 q;uniform vec3 SA;uniform vec3 SB;uniform vec3 R;uniform vec3 UP;uniform vec3 F;uniform vec2 TN;uniform vec3 SUN;uniform vec3 SUNC;uniform vec3 FOG;uniform vec3 AMB;uniform float NIGHT;uniform float TT;uniform float CC;
float hh(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float vn2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn2(p);p=p*2.03+vec2(7.1,3.3);a*=.5;}return s;}
void main(){vec3 d=normalize(F+q.x*TN.x*R+q.y*TN.y*UP);float y=d.y;
 vec3 col=mix(SA,SB,pow(clamp(y,0.,1.),.5));
 float sd=max(dot(d,SUN),0.);col+=SUNC*(.22*pow(sd,6.)+.5*pow(sd,48.))*(1.-NIGHT);
 if(y>0.){vec2 uv=d.xz/(y+.12)*1.6+vec2(TT*.004,TT*.0015);
  float c=fbm(uv*.55);float cov=smoothstep(.62-CC*.35,.92-CC*.3,c);
  float th=fbm(uv*.55+SUN.xz*.06);float lit=clamp(.55+(c-th)*5.,0.,1.);
  vec3 base=AMB*.95+.05*(1.-NIGHT),top=AMB*.6+SUNC*1.1+.08;vec3 cl=mix(base,top,lit)+SUNC*pow(sd,6.)*.5*(1.-NIGHT);
  col=mix(col,cl,cov*smoothstep(0.,.1,y)*.92);
  col+=smoothstep(.7,1.,NIGHT)*step(.9975,hh(floor(d.xz/(y+.2)*420.)))*(1.-cov)*.8*smoothstep(.05,.3,y);}
 col+=SUNC*smoothstep(.9985,.9993,sd)*3.*(1.-NIGHT);
 col=mix(col,FOG,exp(-max(y,0.)*9.)*.75);
 if(y<0.)col=FOG;
 gl_FragColor=vec4(col,1.);}`;
function prog(vs,fs){const P=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const S=gl.createShader(t);gl.shaderSource(S,s);gl.compileShader(S);if(!gl.getShaderParameter(S,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(S));gl.attachShader(P,S)}gl.linkProgram(P);if(!gl.getProgramParameter(P,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(P));return P}
const PR=prog(VS,LITE?FS.replace('#endif\nvarying','#endif\n#define LITE\nvarying'):FS),SK=prog(SVS,SFS);
const A={p:gl.getAttribLocation(PR,'p'),n:gl.getAttribLocation(PR,'n'),c:gl.getAttribLocation(PR,'c'),f:gl.getAttribLocation(PR,'f')};
const U={MO:gl.getUniformLocation(PR,'MO'),M:gl.getUniformLocation(PR,'M'),E:gl.getUniformLocation(PR,'E'),SUN:gl.getUniformLocation(PR,'SUN'),FOG:gl.getUniformLocation(PR,'FOG'),FD:gl.getUniformLocation(PR,'FD'),MODE:gl.getUniformLocation(PR,'MODE'),SUNC:gl.getUniformLocation(PR,'SUNC'),AMB:gl.getUniformLocation(PR,'AMB'),NIGHT:gl.getUniformLocation(PR,'NIGHT'),CD:gl.getUniformLocation(PR,'CD'),TX:gl.getUniformLocation(PR,'TX'),WT:gl.getUniformLocation(PR,'WT')};
const skyBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,skyBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const SKP=gl.getAttribLocation(SK,'p'),SKA=gl.getUniformLocation(SK,'SA'),SKB=gl.getUniformLocation(SK,'SB'),SKU={};for(const k of ['R','UP','F','TN','SUN','SUNC','FOG','AMB','NIGHT','TT','CC'])SKU[k]=gl.getUniformLocation(SK,k);
/* ---------- geometry builder: growable arrays, one set per chunk and layer ---------- */
function G(){return{p:[],n:[],c:[],f:[]}}
let CH=[];/* chunk -> {flat:G, solid:G, tree:G, line:[]} */
const NL=6;const ck=i=>CH[i]||(CH[i]={fl:Array.from({length:NL},G),solid:G(),tree:G(),sh:G(),wire:[]});
const fl=(c,l)=>ck(c).fl[l];
const rgb=v=>[(v>>16&255),(v>>8&255),(v&255)];
function tri(g,a,b,c,nn,col,f){g.p.push(...a,...b,...c);g.n.push(...nn,...nn,...nn);for(let i=0;i<3;i++){g.c.push(col[0],col[1],col[2],255);g.f.push(...(f?f[i]:[0,0,0]))}}
function quad(g,a,b,c,d,nn,col,f){tri(g,a,b,c,nn,col,f&&[f[0],f[1],f[2]]);tri(g,a,c,d,nn,col,f&&[f[0],f[2],f[3]])}
/* terrain (SRTM, photos/terrain/tram1.json, built by the site workflow); flat when absent */
let TER=null;
function HT(x,y){if(!TER)return 0;const fx=(x-TER.x)/TER.s,fy=(y-TER.y)/TER.s;const i=Math.max(0,Math.min(TER.nx-2,Math.floor(fx))),j=Math.max(0,Math.min(TER.ny-2,Math.floor(fy)));const u=Math.max(0,Math.min(1,fx-i)),v=Math.max(0,Math.min(1,fy-j));const h=TER.h,n=TER.nx;
  return((h[j*n+i]*(1-u)+h[j*n+i+1]*u)*(1-v)+(h[(j+1)*n+i]*(1-u)+h[(j+1)*n+i+1]*u)*v)/10-TER.z0}
const W=(x,y,h)=>[x,h+HT(x,y),-y];
/* flat ribbon along a polyline (ground layer) */
function ribbon(g,pts,w,y,col,fk){const hw=w/2;let U0=0;for(let i=1;i<pts.length;i++){let [ax,ay]=pts[i-1];const [bx,by]=pts[i];const l=Math.hypot(bx-ax,by-ay);if(l<.05)continue;const nx=-(by-ay)/l*hw,ny=(bx-ax)/l*hw;
  const n=TER?Math.max(1,Math.ceil(l/14)):1;for(let k=0;k<n;k++){const x0=ax+(bx-ax)*k/n,y0=ay+(by-ay)*k/n,x1=ax+(bx-ax)*(k+1)/n,y1=ay+(by-ay)*(k+1)/n;
    const u0=U0+l*k/n,u1=U0+l*(k+1)/n;quad(g,W(x0+nx,y0+ny,y),W(x0-nx,y0-ny,y),W(x1-nx,y1-ny,y),W(x1+nx,y1+ny,y),[0,1,0],col,fk?[[u0,hw,fk],[u0,-hw,fk],[u1,-hw,fk],[u1,hw,fk]]:null)}U0+=l;
  if(i>1&&hw>.3){/* round the joint */const r=[];for(let k=0;k<=6;k++){const t=k/6*Math.PI*2;r.push([ax+Math.cos(t)*hw,ay+Math.sin(t)*hw])}const jf=fk?[[U0-l,0,fk],[U0-l,hw,fk],[U0-l,hw,fk]]:null;for(let k=0;k<6;k++)tri(g,W(ax,ay,y),W(r[k][0],r[k][1],y),W(r[k+1][0],r[k+1][1],y),[0,1,0],col,jf)}}}
function dens(p,m){const o=[p[0]];for(let i=1;i<p.length;i++){const [ax,ay]=p[i-1],[bx,by]=p[i];const n=Math.ceil(Math.hypot(bx-ax,by-ay)/m);for(let k=1;k<=n;k++)o.push([ax+(bx-ax)*k/n,ay+(by-ay)*k/n])}return o}
/* split a ground triangle until it follows the relief */
function gtri(g,a,b,c,y,col,d,fk){const l1=Math.hypot(a[0]-b[0],a[1]-b[1]),l2=Math.hypot(b[0]-c[0],b[1]-c[1]),l3=Math.hypot(c[0]-a[0],c[1]-a[1]);
  if(TER&&(d||0)<6&&Math.max(l1,l2,l3)>34){if(l1>=l2&&l1>=l3){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];gtri(g,a,m,c,y,col,(d||0)+1,fk);gtri(g,m,b,c,y,col,(d||0)+1,fk)}
    else if(l2>=l3){const m=[(b[0]+c[0])/2,(b[1]+c[1])/2];gtri(g,a,b,m,y,col,(d||0)+1,fk);gtri(g,a,m,c,y,col,(d||0)+1,fk)}else{const m=[(c[0]+a[0])/2,(c[1]+a[1])/2];gtri(g,a,b,m,y,col,(d||0)+1,fk);gtri(g,m,b,c,y,col,(d||0)+1,fk)}return}
  tri(g,W(a[0],a[1],y),W(b[0],b[1],y),W(c[0],c[1],y),[0,1,0],col,fk?[[0,0,fk],[0,0,fk],[0,0,fk]]:null)}
const off=(pts,d)=>pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];const l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return[p[0]-(b[1]-a[1])/l*d,p[1]+(b[0]-a[0])/l*d]});
const unflat=f=>{const o=[];for(let i=0;i<f.length;i+=2)o.push([f[i]/10,f[i+1]/10]);return o};
/* ---------- the track: arc length -> position ---------- */
let TR=[],TC=[0],TL=1,STOPS=[];
function trackAt(s){s=Math.max(0,Math.min(TL,s));let lo=0,hi=TC.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(TC[m]<s)lo=m;else hi=m}
  const a=TR[lo],b=TR[hi],k=(s-TC[lo])/((TC[hi]-TC[lo])||1);return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,Math.atan2(b[1]-a[1],b[0]-a[0])]}
/* ---------- build everything from the corridor data ---------- */
const PALR={0:[150,150,148],1:[150,148,140],2:[132,128,120],3:[150,132,104]};
function build(D){
  TR=unflat(D.T);for(let i=1;i<TR.length;i++)TC.push(TC[i-1]+Math.hypot(TR[i][0]-TR[i-1][0],TR[i][1]-TR[i-1][1]));TL=TC[TC.length-1];STOPS=D.S;
  const nC=Math.ceil(TL/D.CH)+1;for(let i=0;i<nC;i++)ck(i);
  /* areas */
  const AC={0:[118,142,86],1:[96,130,150],2:[92,118,72],3:[110,140,92],4:[138,136,130],5:[150,146,136],6:[196,182,150]};
  for(const [c,cls,f,tr] of D.A){const p=unflat(f),g=fl(c,1),col=AC[cls],y=cls===1?.0:.04;for(let i=0;i<tr.length;i+=3)gtri(g,p[tr[i]],p[tr[i+1]],p[tr[i+2]],y,col,0,cls===1?21:0)}
  /* pavements under the roads, then the roads (painter's order: layers drawn in this order) */
  const RS=D.R.slice().sort((a,b)=>b[3]-a[3]);
  for(const [c,w,surf,cls,f] of RS){if(cls>3)continue;const p=unflat(f);ribbon(fl(c,2),p,w/10+(cls<=2?4.4:1.2),.07,cls<=2?[146,144,138]:[134,130,120],14)}
  for(const [c,w,surf,cls,f] of RS){const p=unflat(f);const col=cls===4?[150,146,136]:surf===3?[140,124,98]:surf===2?[110,106,100]:surf===1?[128,126,120]:[88,88,92];ribbon(fl(c,3),p,w/10,.1,col,cls===4?14:surf===3?15:13)}
  /* centre lines on the bigger roads */
  for(const [c,w,surf,cls,f] of D.R){if(cls>1||w<70)continue;const p=unflat(f);const g=fl(c,4);for(let i=1;i<p.length;i++){const [ax,ay]=p[i-1],[bx,by]=p[i];const l=Math.hypot(bx-ax,by-ay);const n=Math.floor(l/6);for(let k=0;k<n;k++){const t0=k*6/l,t1=(k*6+3)/l;ribbon(g,[[ax+(bx-ax)*t0,ay+(by-ay)*t0],[ax+(bx-ax)*t1,ay+(by-ay)*t1]],.14,.12,[226,224,214])}}}
  /* rails: ballast, sleepers in the ballast, two rails 1524 mm apart; the overhead wire with poles */
  for(const [c,kind,emb,f] of D.RL){const p=unflat(f);if(!emb)ribbon(fl(c,4),p,kind?3.4:2.9,.12,kind?[124,112,100]:[128,118,104],10);
    for(const d of [-.762,.762])ribbon(fl(c,5),off(p,d),.09,.15,[70,68,66],11);
    if(kind===0){/* overhead: contact wire at 5.9 m; poles every 32 m on alternating sides */
      const wire=ck(c).wire;const pw=TER?dens(p,20):p;for(let i=1;i<pw.length;i++)wire.push(W(pw[i-1][0],pw[i-1][1],5.9),W(pw[i][0],pw[i][1],5.9));
}}
  /* buildings */
  for(const [c,h,mh,ty,col,roof,f,tr] of D.B){const p=unflat(f),g=ck(c).solid,C=rgb(col);let B0=1e9;for(const q of p)B0=Math.min(B0,HT(q[0],q[1]));if(!TER)B0=0;const H=h/10+B0,M0=mh/10+(mh?B0:B0-1.5);const W=(x,y,h_)=>[x,h_,-y];const kind=ty===0||ty===8?3.0:ty===3?3.0:ty===4?4.0:ty===2||ty===6||ty===7?5.0:1.0;
    const fk=ty===3?3:ty===0||ty===8?3.2:kind;
    let u=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];const l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<.05)continue;const nx=(b[1]-a[1])/l,ny=-(b[0]-a[0])/l;
      const shade=.92+.08*Math.sin(i*1.7);const cc=[C[0]*shade,C[1]*shade,C[2]*shade];
      const kk=ty===0||ty===8?(H<7?5:3.0):fk===3.2?3:fk;
      quad(g,W(a[0],a[1],M0),W(b[0],b[1],M0),W(b[0],b[1],H),W(a[0],a[1],H),[nx,0,-ny],cc,[[u,M0-B0,kk],[u+l,M0-B0,kk],[u+l,H-B0,kk],[u,H-B0,kk]]);u+=l}
    const rc=roof?[150,74,58]:[96,92,88];
    if(roof&&p.length<=12){/* a hipped roof: every eave to the apex above the centroid */
      let cx=0,cy=0;for(const q of p){cx+=q[0];cy+=q[1]}cx/=p.length;cy/=p.length;const top=W(cx,cy,H+Math.min(3.2,1.2+Math.sqrt(Math.abs(area(p)))*.15));
      for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];const A=W(a[0],a[1],H),B=W(b[0],b[1],H);const e1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],e2=[top[0]-A[0],top[1]-A[1],top[2]-A[2]];
        let nn=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];const ln=Math.hypot(...nn)||1;nn=nn.map(v=>v/ln);if(nn[1]<0)nn=nn.map(v=>-v);tri(g,A,B,top,nn,rc)}}
    else for(let i=0;i<tr.length;i+=3){const a=p[tr[i]],b=p[tr[i+1]],cc=p[tr[i+2]];tri(g,W(a[0],a[1],H),W(b[0],b[1],H),W(cc[0],cc[1],H),[0,1,0],rc)}}
  /* our own track, always: ballast, rails and the contact wire right above the route line */
  {const per=new Map();for(let i=1;i<TR.length;i++){const c=Math.floor(Math.min(TL-1,TC[i-1])/D.CH);if(!per.has(c))per.set(c,[TR[i-1]]);per.get(c).push(TR[i])}
   for(const [c,p] of per){const w=ck(c).wire;const pw=TER?dens(p,20):p;for(let i=1;i<pw.length;i++)w.push(W(pw[i-1][0],pw[i-1][1],5.9),W(pw[i][0],pw[i][1],5.9))}
   /* v6.9: ballast where the track has its own bed, concrete slabs where it runs in the carriageway (D.EM, every 4 m) */
   const EM=D.EM||[];const segs=[];let cur=null;for(let q0=0;q0<TL+4;q0+=4){const q=Math.min(q0,TL);const e=EM[Math.round(q/4)]|0;const c=Math.floor(Math.min(TL-1,q)/D.CH);const [x,y]=trackAt(q);
     if(!cur||cur.c!==c||cur.e!==e){const pv=cur&&cur.p[cur.p.length-1];cur={c,e,p:pv?[pv]:[]};segs.push(cur)}cur.p.push([x,y])}
   for(const S of segs){if(S.p.length<2)continue;ribbon(fl(S.c,4),S.p,S.e?2.7:2.9,.12,S.e?[140,138,132]:[126,116,102],S.e?12:10);for(const d of [-.762,.762])ribbon(fl(S.c,5),off(S.p,d),.09,.15,[66,64,62],11)}}
  /* v6.9: catenary poles placed on free ground (D.PO): an arm over both wires, or a cross-span wire to a pole across the street */
  for(const [c,a,b,e,f,sp] of (D.PO||[])){const px=a/10,py=b/10,ex=e/10,ey=f/10,g=ck(c).solid;pole(g,px,py,7.6,.12,[78,80,82]);
    const l=Math.hypot(ex-px,ey-py)||1,ux=(ex-px)/l,uy=(ey-py)/l;const P=(f_,r_,h)=>W(px+ux*f_-uy*r_,py+uy*f_+ux*r_,h);
    if(sp===2){pole(g,ex,ey,7.6,.12,[78,80,82]);box(g,P,0,l,-.025,.025,6.95,7.0,[46,46,48])}else box(g,P,0,l,-.05,.05,6.55,6.65,[78,80,82])}
  /* street lamps: a pole and a sodium lamp over the kerb, every 34 m (68 m on phones) */
  (D.LP||[]).forEach(([c,a,b,nx_,ny_],i)=>{if(LITE&&i%2)return;const x=a/10,y=b/10,nx=nx_/100,ny=ny_/100,g=ck(c).solid;pole(g,x,y,8.6,.08,[96,98,100]);
    const P=(f_,r_,h)=>W(x+nx*f_-ny*r_,y+ny*f_+nx*r_,h);box(g,P,0,1.4,-.04,.04,8.45,8.55,[96,98,100]);lightBox(g,P,1.2,1.9,-.22,.22,8.2,8.45,[200,196,180],6)});
  /* stops: a raised platform on the right of the track and a shelter */
  STOPS.forEach((s,i)=>{const c=Math.floor(Math.min(TL-1,s)/D.CH);const g=ck(c).solid;const [x,y,a]=trackAt(s);const ux=Math.cos(a),uy=Math.sin(a),rx=uy,ry=-ux;
    const P=(f,r,h)=>W(x+ux*f+rx*r,y+uy*f+ry*r,h);
    {const a1=trackAt(s-18)[2],a2=trackAt(s+30)[2];let da=Math.abs(a2-a1);if(da>Math.PI)da=2*Math.PI-da;if(da>.22)return}
    /* v6.9: D.SP = free strip right of the track [r0,r1,platform,shelter]; on a street people wait on the pavement */
    const sp=(D.SP||[])[i]||[23,46,1,1];if(!sp[1])return;const R0=sp[0]/10,R1=Math.min(sp[1]/10,R0+2.3),z=sp[2]?.25:.08,o=R1-4.6;
    if(sp[2])box(g,P,-14,14,2.3,R1,0,.25,[178,174,166]);
    if(sp[3]){const Q=(f,r,h)=>P(f,r+o,h+z);box(g,Q,-3,3,4.3,4.45,0,2.4,[150,170,180]);box(g,Q,-3,-2.9,3.4,4.4,0,2.4,[150,170,180]);box(g,Q,2.9,3,3.4,4.4,0,2.4,[150,170,180]);box(g,Q,-3.3,3.3,3.3,4.6,2.4,2.55,[208,206,200])}
    pole(g,x+ux*5+rx*(R0+.3),y+uy*5+ry*(R0+.3),2.8+z,.05,[90,90,92]);
    box(g,P,4.7,5.3,R0+.25,R0+.35,2.1+z,2.75+z,[245,245,240]);
    /* people waiting: 2-6 figures in autumn coats */
    const COATS=[[60,62,70],[94,70,52],[120,40,40],[50,70,90],[150,140,120],[70,80,60],[30,30,32]];const n=2+((i*7919)%5);
    for(let q=0;q<n;q++){const h=(i*131+q*977)%1000/1000,f0=-9+h*18,r0=R0+.45+((q*37+i)%10)/10*Math.max(.1,R1-R0-.9),col=COATS[(i+q*3)%COATS.length],tall=1.55+((q*13+i)%7)*.04;
      box(g,P,f0-.18,f0+.18,r0-.14,r0+.14,z,z+tall*.55,col);box(g,P,f0-.15,f0+.15,r0-.12,r0+.12,z+tall*.55,z+tall*.83,col);box(g,P,f0-.1,f0+.1,r0-.1,r0+.1,z+tall*.84,z+tall,[200,164,140]);
      box(g,P,f0-.14,f0-.03,r0-.08,r0+.08,z,z+tall*.46,[40,40,44]);box(g,P,f0+.03,f0+.14,r0-.08,r0+.08,z,z+tall*.46,[40,40,44])}});
  /* trees */
  /* v7.6: species by place and size (street rows of poplars, lindens, chestnuts, maples, acacias and birches; young trees where small),
     three cards per tree at a random turn, an October tint per tree and a soft shadow disc under the crown */
  const TA=window.__TREEATLAS?window.__TREEATLAS():null;const ASP=TA?TA.aspect:[[1.15,1]];
  const SPW=[[0,.12],[1,.12],[2,.2],[3,.15],[4,.1],[5,.12],[6,.19]];
  const TRs=LITE?D.TR.filter((_,i)=>i%2===0):D.TR;
  for(const [c,x,y,sz,v] of TRs){const g=ck(c).tree,sh=ck(c).sh,X=x/10,Y=y/10;const h=((x*73856093)^(y*19349663))>>>0,r1=(h%1000)/1000,r2=((h>>10)%1000)/1000,r3=((h>>20)%1000)/1000;
    let sp=7;if(sz>5||r3<.6){let a=r1*1.0001,acc=0;for(const [k,wt] of SPW){acc+=wt;if(a<=acc){sp=k;break}}}if(!TA)sp=0;
    const S=sz*(.85+.3*r2),ht=S*ASP[sp][0]*(sp===0?1.15:1),wd=S*ASP[sp][1];
    const tint=[180+((v*23+h)%30)-15,186+((h>>5)%24)-12,170+((h>>9)%30)-15].map(t=>Math.max(120,Math.min(230,t)));
    const a0=r3*Math.PI;for(let k=0;k<3;k++){const a=a0+k*Math.PI/3,dx=Math.cos(a)*wd/2,dy=Math.sin(a)*wd/2;
      quad(g,W(X-dx,Y-dy,0),W(X+dx,Y+dy,0),W(X+dx,Y+dy,ht),W(X-dx,Y-dy,ht),[Math.sin(a),0,Math.cos(a)],tint,[[0,0,sp],[1,0,sp],[1,1,sp],[0,1,sp]])}
    const rs=wd*.55,ox=.12*ht,oy=.05*ht;quad(sh,W(X+ox-rs,Y+oy-rs,.06),W(X+ox+rs,Y+oy-rs,.06),W(X+ox+rs,Y+oy+rs,.06),W(X+ox-rs,Y+oy+rs,.06),[0,1,0],[0,0,0],[[0,0,-1],[1,0,-1],[1,1,-1],[0,1,-1]])}
  /* the ground: 30 m cells within 700 m of the track, each given to the chunk of its nearest track point */
  if(TER){const s=TER.s;const near=(x,y)=>{let b=1e9,bs=0;for(let i=0;i<TR.length;i+=3){const d=Math.hypot(TR[i][0]-x,TR[i][1]-y);if(d<b){b=d;bs=TC[i]}}return[b,bs]};
    for(let j=0;j<TER.ny-1;j++)for(let i=0;i<TER.nx-1;i++){const x=TER.x+i*s,y=TER.y+j*s;const [d,sa]=near(x+s/2,y+s/2);if(d>480)continue;const c=Math.floor(Math.min(TL-1,sa)/D.CH);const g=fl(c,0);
      const P=[[x,y],[x+s,y],[x+s,y+s],[x,y+s]].map(q=>W(q[0],q[1],-.02));const e1=[P[1][0]-P[0][0],P[1][1]-P[0][1],P[1][2]-P[0][2]],e2=[P[3][0]-P[0][0],P[3][1]-P[0][1],P[3][2]-P[0][2]];
      let nn=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];const ln=Math.hypot(...nn)||1;nn=nn.map(v=>v/ln);if(nn[1]<0)nn=nn.map(v=>-v);
      const t=((i*7+j*13)%5)*3;quad(g,P[0],P[1],P[2],P[3],nn,[110+t,114+t,84+t/2])}}
  /* upload */
  for(const C of CH){const LS=[...C.fl.map((g,i)=>['fl',i,g]),['solid',0,C.solid],['tree',0,C.tree],['sh',0,C.sh]];for(const [k,ix,g] of LS){g.n_=g.p.length/3;if(!g.n_){g.buf=null;continue}
    g.buf={p:up(new Float32Array(g.p)),n:up(i8(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))};g.p=g.n=g.c=g.f=null}
    C.wn=C.wire.length;C.wbuf=C.wn?up(new Float32Array(C.wire.flat())):null;C.wire=null}
}
function area(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1]}return a/2}
function box(g,P,f0,f1,r0,r1,h0,h1,col){const c=[[f0,r0],[f1,r0],[f1,r1],[f0,r1]];for(let i=0;i<4;i++){const a=c[i],b=c[(i+1)%4];const A0=P(a[0],a[1],h0),B0=P(b[0],b[1],h0),B1=P(b[0],b[1],h1),A1=P(a[0],a[1],h1);
  const e=[B0[0]-A0[0],B0[2]-A0[2]];const l=Math.hypot(...e)||1;quad(g,A0,B0,B1,A1,[e[1]/l,0,-e[0]/l],col)}
  const T0=P(f0,r0,h1),T1=P(f1,r0,h1),T2=P(f1,r1,h1),T3=P(f0,r1,h1);quad(g,T0,T1,T2,T3,[0,1,0],col)}
function lightBox(g,P,f0,f1,r0,r1,h0,h1,col,kind){const n0=g.f.length;box(g,P,f0,f1,r0,r1,h0,h1,col);for(let i=n0;i<g.f.length;i+=3)g.f[i+2]=kind}
function pole(g,x,y,h,r,col){for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.78,b=(i+1)/4*Math.PI*2+.78;const ax=x+Math.cos(a)*r,ay=y+Math.sin(a)*r,bx=x+Math.cos(b)*r,by=y+Math.sin(b)*r;
  const nx=Math.cos((a+b)/2),ny=Math.sin((a+b)/2);quad(g,W(ax,ay,0),W(bx,by,0),W(bx,by,h),W(ax,ay,h),[nx,0,-ny],col)}}
function i8(a){const o=new Int8Array(a.length);for(let i=0;i<a.length;i++)o[i]=Math.max(-127,Math.min(127,Math.round(a[i]*127)));return o}
let TTEX=null;function treeTex(){const TA=window.__TREEATLAS&&window.__TREEATLAS();if(!TA)return;TTEX=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,TTEX);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,TA.img);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0)}
function up(a){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);return b}
/* ---------- traffic on the main streets: Ladas and Volgas in the usual colours ---------- */
let CARM=[],ROADS=[];
function carMeshes(){const COLS=[[232,232,226],[214,200,170],[150,40,36],[60,84,120],[70,96,70],[150,150,150],[40,40,44],[210,170,60]];
  for(const col of COLS){const g=G();const P=(f,r,h)=>[f,h,r];box(g,P,-2.1,2.1,-.82,.82,.25,.95,col);box(g,P,-1.0,1.1,-.76,.76,.95,1.45,[70,86,100]);box(g,P,-1.05,1.0,-.77,.77,1.42,1.5,col);
    box(g,P,-1.9,-1.4,-.85,.85,0,.5,[24,24,24]);box(g,P,1.3,1.8,-.85,.85,0,.5,[24,24,24]);
    lightBox(g,P,2.1,2.16,-.7,-.45,.55,.72,[220,220,210],7);lightBox(g,P,2.1,2.16,.45,.7,.55,.72,[220,220,210],7);
    lightBox(g,P,-2.16,-2.1,-.72,-.5,.58,.74,[120,30,24],8);lightBox(g,P,-2.16,-2.1,.5,.72,.58,.74,[120,30,24],8);
    CARM.push({n:g.p.length/3,buf:{p:up(new Float32Array(g.p)),n:up(i8(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))}})}}
let PEDM=[],WALKS=[];
function pedMeshes(){const COATS=[[60,62,70],[94,70,52],[120,40,40],[50,70,90],[150,140,120],[70,80,60],[30,30,32],[160,90,110]];
  for(const col of COATS){const g=G();const P=(f,r,h)=>[f,h,r];box(g,P,-.16,.16,-.2,.2,.8,1.42,col);box(g,P,-.1,.1,-.1,.1,1.42,1.68,[200,164,140]);box(g,P,-.1,.1,-.18,-.04,0,.82,[40,40,44]);box(g,P,-.1,.1,.04,.18,0,.82,[40,40,44]);
    PEDM.push({n:g.p.length/3,buf:{p:up(new Float32Array(g.p)),n:up(i8(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))}})}}
/* v6.8: what is near the rails - cars and people never stand on the tracks */
const TG=new Map();const tkey=(x,y)=>Math.floor(x/10)*100003+Math.floor(y/10);
function trackGrid(D){const add=p=>{for(let i=1;i<p.length;i++){const [ax,ay]=p[i-1],[bx,by]=p[i];const l=Math.hypot(bx-ax,by-ay);const n=Math.max(1,Math.ceil(l/2));for(let k=0;k<=n;k++){const x=ax+(bx-ax)*k/n,y=ay+(by-ay)*k/n,K=tkey(x,y);let a=TG.get(K);if(!a)TG.set(K,a=[]);a.push(x,y)}}};
  add(TR);for(const [c,kind,emb,f] of (D.RL||[]))if(kind===0)add(unflat(f))}
function nearTrack(x,y,r){const cx=Math.floor(x/10),cy=Math.floor(y/10);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=TG.get((cx+i)*100003+cy+j);if(!a)continue;for(let k=0;k<a.length;k+=2){const dx=a[k]-x,dy=a[k+1]-y;if(dx*dx+dy*dy<r*r)return true}}return false}
/* per 5 m of a road: bit b set when lateral offset offs[b] (right of the way's direction) is clear of the rails */
function clearMask(p,cu,len,offs,r){const n=Math.ceil(len/5)+1,m=new Uint8Array(n);let i=1;for(let k=0;k<n;k++){const s=Math.min(len,k*5);while(i<cu.length-1&&cu[i]<s)i++;const a=p[i-1],b=p[i],t=(s-cu[i-1])/((cu[i]-cu[i-1])||1);const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,an=Math.atan2(b[1]-a[1],b[0]-a[0]);
  offs.forEach((o,bit)=>{if(!nearTrack(x+Math.sin(an)*o,y-Math.cos(an)*o,r))m[k]|=1<<bit})}return m}
const mAt=(R,s)=>R.m[Math.max(0,Math.min(R.m.length-1,Math.round((((s%R.len)+R.len)%R.len)/5)))];
function walksFrom(D){for(const [c,w,surf,cls,f] of D.R){if(cls>2)continue;const p=unflat(f);const cu=[0];for(let i=1;i<p.length;i++)cu.push(cu[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));const len=cu[cu.length-1];if(len<60)continue;
    const n=Math.max(1,Math.round(len/(LITE?140:70)));const ps=[];for(let k=0;k<n;k++){const h=((k+1)*2246822519+Math.round(len)*3266489917)>>>0;ps.push({o:(h%1000)/1000*len,dir:(h>>>3)&1?1:-1,v:1.1+((h>>>5)%6)/10,col:(h>>>9)%8,side:(h>>>13)&1?1:-1})}
    let mx=0,my=0;for(const q of p){mx+=q[0];my+=q[1]}const wo=w/20+2.1;WALKS.push({p,cu,len,w:w/10,ps,mx:mx/p.length,my:my/p.length,m:clearMask(p,cu,len,[wo,-wo],2.6)})}}
function roadsFrom(D){trackGrid(D);walksFrom(D);for(const [c,w,surf,cls,f,br,ow] of D.R){if(cls>1)continue;const p=unflat(f);const cu=[0];for(let i=1;i<p.length;i++)cu.push(cu[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));const len=cu[cu.length-1];if(len<120)continue;
    const n=Math.max(1,Math.round(len/90));const cars=[];for(let k=0;k<n;k++){const h=(k*2654435761+len*97)>>>0;cars.push({o:(h%1000)/1000*len,dir:ow?ow:((h>>>3)&1?1:-1),v:9+((h>>>5)%60)/10,col:(h>>>9)%8})}
    let mx=0,my=0;for(const q of p){mx+=q[0];my+=q[1]}const lo=ow?0:Math.max(1.6,w/40),lo2=ow?1.7:lo+2.4;ROADS.push({p,cu,len,w:w/10,ow,lo,lo2,cars,mx:mx/p.length,my:my/p.length,m:clearMask(p,cu,len,[lo,lo2,-lo,-lo2],2.7)})}}
function roadAt(R,s){s=((s%R.len)+R.len)%R.len;let i=1;while(i<R.cu.length-1&&R.cu[i]<s)i++;const a=R.p[i-1],b=R.p[i],k=(s-R.cu[i-1])/((R.cu[i]-R.cu[i-1])||1);return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,Math.atan2(b[1]-a[1],b[0]-a[0])]}
/* ---------- the oncoming tram on the other track ---------- */
let ONC=null,TWN=null;
/* the other track, as measured from OSM every 4 m (null where there is no second track) */
function twinAt(s){if(!TWN||s<0||s>TL)return null;const i=Math.floor(s/4),k=s/4-i,a=TWN[i],b=TWN[i+1];if(!a||!b)return null;const [x,y]=trackAt(s);return[x+(a[0]+(b[0]-a[0])*k)/10,y+(a[1]+(b[1]-a[1])*k)/10]}
function oncomingMesh(){const g=G();const P=(f,r,h)=>[f,h,r];
  box(g,P,-7.5,7.5,-1.25,1.25,.35,3.1,[196,44,48]);box(g,P,-7.5,7.5,-1.26,1.26,1.3,2.35,[232,220,190]);box(g,P,-7.3,7.3,-1.1,1.1,3.1,3.35,[160,160,160]);
  box(g,P,-1.5,1.5,-.2,.2,3.35,4.4,[60,60,62]);
  lightBox(g,P,7.5,7.56,-.8,-.5,1.0,1.25,[230,230,215],7);lightBox(g,P,7.5,7.56,.5,.8,1.0,1.25,[230,230,215],7);lightBox(g,P,-7.56,-7.5,-.8,-.5,1.0,1.2,[130,30,24],8);lightBox(g,P,-7.56,-7.5,.5,.8,1.0,1.2,[130,30,24],8);
  for(let k=-6;k<=6;k+=2.4)lightBox(g,P,k-1,k+1,-1.27,1.27,1.55,2.15,[90,100,110],6);
  ONC={n:g.p.length/3,buf:{p:up(new Float32Array(g.p)),n:up(i8(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))}}}
/* ---------- matrices ---------- */
function persp(fy,as,n,f){const t=1/Math.tan(fy/2);return[t/as,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]}
function look(e,c,u){let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z=z.map(v=>v/l);let x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(...x);x=x.map(v=>v/l);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1]}
function mul(a,b){const o=new Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
function trs(m,x,y,z,ang){const c=Math.cos(ang),s=Math.sin(ang);return mul(m,[c,0,-s,0,0,1,0,0,s,0,c,0,x,y,z,1])}
const ID=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
/* ---------- drawing ---------- */
/* light: day, evening, night; 'now' follows the sun over Donetsk at this moment (window.__dn from the site) */
const LP={day:{el:28,az:215,sunc:[.62,.58,.5],amb:[.6,.62,.66],fog:[.78,.8,.81],sa:[.84,.86,.86],sb:[.47,.62,.78],night:0,fd:1},
  dusk:{el:5,az:252,sunc:[.8,.48,.3],amb:[.42,.4,.47],fog:[.7,.6,.58],sa:[.95,.68,.5],sb:[.3,.36,.55],night:.55,fd:.85},
  night:{el:35,az:160,sunc:[.07,.08,.12],amb:[.13,.15,.23],fog:[.07,.09,.13],sa:[.1,.12,.19],sb:[.02,.03,.07],night:1,fd:.7}};
let LIGHT='now',L0=LP.day;
const lerp=(a,b,t)=>Array.isArray(a)?a.map((v,i)=>v+(b[i]-v)*t):a+(b-a)*t;
function mixP(a,b,t){const o={};for(const k in a)o[k]=lerp(a[k],b[k],t);return o}
function lightNow(){if(LIGHT!=='now')return LP[LIGHT];const S=window.__dn&&window.__dn.sun?window.__dn.sun():{alt:30,am:false};const al=S.alt;
  let P=al>=10?LP.day:al>=-1?mixP(LP.dusk,LP.day,(al+1)/11):al>=-8?mixP(LP.night,LP.dusk,(al+8)/7):LP.night;P=Object.assign({},P);
  if(al>-1){P.el=Math.max(3,Math.min(40,al));P.az=S.am?120+al*2:240-al*1.5}return P}
function sunVec(P){const el=P.el*Math.PI/180,az=P.az*Math.PI/180;return[Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el)]}
let LT=Infinity;
function bind(b){gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.vertexAttribPointer(A.p,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.vertexAttribPointer(A.n,3,gl.BYTE,true,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,b.c);gl.vertexAttribPointer(A.c,4,gl.UNSIGNED_BYTE,true,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.f);gl.vertexAttribPointer(A.f,3,gl.FLOAT,false,0,0)}
let ready=false,cam={s:0,a:null,bob:0},chSize=150;
function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(LITE?1.25:2,window.devicePixelRatio||1);const w=Math.max(2,Math.round(r.width*dpr)),h=Math.max(2,Math.round(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}}
function frame(f,speed,dt,t){if(!ready)return;resize();const s=f*TL;
  const [x,y,a0]=trackAt(s);const [lx,ly]=trackAt(s+22);let a=Math.atan2(ly-y,lx-x);if(cam.a===null||Math.abs(s-(cam.ls||0))>30)cam.a=a;cam.ls=s;let da=a-cam.a;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;cam.a+=da*Math.min(1,dt*2.5||1);
  cam.bob+=dt*speed*.9;const bob=Math.sin(cam.bob)*.025*Math.min(1,speed/8)+Math.sin(cam.bob*2.3)*.012*Math.min(1,speed/8);
  const ex=x+Math.cos(cam.a)*1.2,ey=y+Math.sin(cam.a)*1.2,gh=HT(ex,ey);const E=[ex,gh+2.75+bob,-ey],Cn=[E[0]+Math.cos(cam.a)*30,HT(ex+Math.cos(cam.a)*30,ey+Math.sin(cam.a)*30)+2.2,E[2]-Math.sin(cam.a)*30];
  const as=canvas.width/canvas.height,fy=(as<1?68:56)*Math.PI/180;const P=persp(fy,as,.4,1600),V=look(E,Cn,[0,1,0]);const MV=mul(P,V);MVc=MV;
  if(t-LT>30||t<LT||!L0.fog){L0=lightNow();LT=t}const LL=L0,FOGC=LL.fog;
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(...FOGC,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  /* sky */
  gl.disable(gl.DEPTH_TEST);gl.useProgram(SK);gl.bindBuffer(gl.ARRAY_BUFFER,skyBuf);gl.enableVertexAttribArray(SKP);gl.vertexAttribPointer(SKP,2,gl.FLOAT,false,0,0);
  {let fx=Cn[0]-E[0],fy_=Cn[1]-E[1],fz=Cn[2]-E[2];const fl_=Math.hypot(fx,fy_,fz);fx/=fl_;fy_/=fl_;fz/=fl_;let rx=-fz,rz=fx;const rl=Math.hypot(rx,rz)||1;rx/=rl;rz/=rl;
   const ux=-rz*fy_,uy=rz*fx-rx*fz,uz=rx*fy_;const ty=Math.tan(fy/2);
   gl.uniform3f(SKU.F,fx,fy_,fz);gl.uniform3f(SKU.R,rx,0,rz);gl.uniform3f(SKU.UP,ux,uy,uz);gl.uniform2f(SKU.TN,ty*as,ty);
   gl.uniform3fv(SKU.SUN,sunVec(LL));gl.uniform3fv(SKU.SUNC,LL.sunc);gl.uniform3fv(SKU.FOG,FOGC);gl.uniform3fv(SKU.AMB,LL.amb);gl.uniform1f(SKU.NIGHT,LL.night);gl.uniform1f(SKU.TT,t||0);gl.uniform1f(SKU.CC,.45);}
  gl.uniform3fv(SKA,LL.sa);gl.uniform3fv(SKB,LL.sb);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.disableVertexAttribArray(SKP);
  gl.useProgram(PR);for(const k in A)gl.enableVertexAttribArray(A[k]);
  gl.uniformMatrix4fv(U.M,false,new Float32Array(MV));gl.uniformMatrix4fv(U.MO,false,ID);gl.uniform3fv(U.E,E);gl.uniform3fv(U.SUN,sunVec(LL));gl.uniform3fv(U.FOG,FOGC);gl.uniform1f(U.FD,(LITE?520:720)*LL.fd);gl.uniform3fv(U.SUNC,LL.sunc);gl.uniform3fv(U.AMB,LL.amb);gl.uniform1f(U.NIGHT,LL.night);gl.uniform3fv(U.CD,[Math.cos(cam.a),0,-Math.sin(cam.a)]);gl.uniform1f(U.MODE,0);
  const c0=Math.floor(s/chSize);const vis=[];for(let i=c0-2;i<=c0+7;i++)if(CH[i])vis.push(CH[i]);
  /* ground plane under everything */
  if(!TER){gl.disable(gl.DEPTH_TEST);ground(E);}
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.POLYGON_OFFSET_FILL);
  for(let l=0;l<NL;l++){gl.polygonOffset(-l*1.5,-l*6);for(const C of vis){const g=C.fl[l];if(g.buf){bind(g.buf);gl.drawArrays(gl.TRIANGLES,0,g.n_)}}}
  gl.disable(gl.POLYGON_OFFSET_FILL);
  for(const C of vis)if(C.solid.buf){bind(C.solid.buf);gl.drawArrays(gl.TRIANGLES,0,C.solid.n_)}
  /* the oncoming tram: one passes every 1.6 km of the ride */
  if(ONC&&TWN){const per=1600,ph=(t*7+s*1.0)%per;const so=s+260-ph*1.0;if(so>s-40&&so<s+700&&twinAt(so-8)&&twinAt(so+8)){const [ox,oy]=twinAt(so),[ax,ay]=twinAt(so-3),[bx,by]=twinAt(so+3);const oa=Math.atan2(ay-by,ax-bx);
    gl.uniformMatrix4fv(U.MO,false,new Float32Array(trs(ID,ox,HT(ox,oy),-oy,oa)));bind(ONC.buf);gl.drawArrays(gl.TRIANGLES,0,ONC.n);gl.uniformMatrix4fv(U.MO,false,ID)}}
  /* cars within 450 m */
  for(const R of ROADS){if(Math.abs(R.mx-E[0])>900||Math.abs(R.my+E[2])>900)continue;for(const c of R.cars){const ss=c.o+c.dir*c.v*t;const [cx,cy,ca]=roadAt(R,ss);
    if(Math.abs(cx-E[0])>450||Math.abs(cy+E[2])>450)continue;const ang=c.dir>0?ca:ca+Math.PI;const mk=mAt(R,ss)>>(c.dir>0?0:2);const lo=mk&1?R.lo:mk&2?R.lo2:null;if(lo===null)continue;const lx=c.dir>0?lo:-lo;const rx=Math.sin(ca)*lx,ry=-Math.cos(ca)*lx;
    gl.uniformMatrix4fv(U.MO,false,new Float32Array(trs(ID,cx+rx,HT(cx+rx,cy+ry)+.1,-(cy+ry),ang)));const m=CARM[c.col];bind(m.buf);gl.drawArrays(gl.TRIANGLES,0,m.n)}}
  /* people walking along the pavements, within 250 m */
  for(const R of WALKS){if(Math.abs(R.mx-E[0])>700||Math.abs(R.my+E[2])>700)continue;for(const q of R.ps){const ss=q.o+q.dir*q.v*t;const [px,py,pa]=roadAt(R,ss);
    if(Math.abs(px-E[0])>250||Math.abs(py+E[2])>250)continue;const ang=q.dir>0?pa:pa+Math.PI;const mk=mAt(R,ss);let sd=q.side;if(!(mk&(sd>0?1:2)))sd=-sd;if(!(mk&(sd>0?1:2)))continue;const lo=(R.w/2+2.1)*sd;const rx=Math.sin(pa)*lo,ry=-Math.cos(pa)*lo;
    const bob=Math.abs(Math.sin(t*q.v*3.2+q.o))*.04;gl.uniformMatrix4fv(U.MO,false,new Float32Array(trs(ID,px+rx,HT(px+rx,py+ry)+bob,-(py+ry),ang)));const m=PEDM[q.col];bind(m.buf);gl.drawArrays(gl.TRIANGLES,0,m.n)}}
  gl.uniformMatrix4fv(U.MO,false,ID);
  for(const k in A)gl.disableVertexAttribArray(A[k]);drawSigns(MV,E,LL,c0);for(const k in A)gl.enableVertexAttribArray(A[k]);
  gl.uniform1f(U.MODE,1);gl.uniform1f(U.WT,t||0);if(TTEX){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,TTEX);gl.uniform1i(U.TX,1);gl.activeTexture(gl.TEXTURE0)}
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);for(const C of vis)if(C.sh.buf){bind(C.sh.buf);gl.drawArrays(gl.TRIANGLES,0,C.sh.n_)}gl.depthMask(true);gl.disable(gl.BLEND);
  for(const C of vis)if(C.tree.buf){bind(C.tree.buf);gl.drawArrays(gl.TRIANGLES,0,C.tree.n_)}gl.uniform1f(U.MODE,0);
  /* wires */
  gl.disableVertexAttribArray(A.n);gl.disableVertexAttribArray(A.c);gl.disableVertexAttribArray(A.f);gl.vertexAttrib3f(A.n,0,1,0);gl.vertexAttrib4f(A.c,.13,.13,.14,1);gl.vertexAttrib3f(A.f,0,0,0);gl.vertexAttrib3f(A.f,0,0,0);
  for(const C of vis)if(C.wbuf){gl.bindBuffer(gl.ARRAY_BUFFER,C.wbuf);gl.vertexAttribPointer(A.p,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.LINES,0,C.wn)}
  for(const k in A)gl.disableVertexAttribArray(A[k])}
let GB=null,MVc=null;function ground(E){if(!GB){const g=G();const R=7000;quad(g,[-R,-.02,-R],[-R,-.02,R],[R,-.02,R],[R,-.02,-R],[0,1,0],[112,116,86]);GB={n:6,buf:{p:up(new Float32Array(g.p)),n:up(i8(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))}}}
  bind(GB.buf);gl.drawArrays(gl.TRIANGLES,0,6)}
/* ---------- load ---------- */
async function load(url){const tu=new URL('photos/terrain/tram1.json',document.baseURI).href;
  const [D,Tt]=await Promise.all([fetch(url).then(r=>{if(!r.ok)throw new Error('tram3d '+r.status);return r.json()}),fetch(tu).then(r=>r.ok?r.json():null).catch(()=>null)]);
  if(Tt&&Tt.h&&Tt.nx){TER=Tt;TER.z0=0;const T0=unflat(D.T);TER.z0=HT(T0[0][0],T0[0][1])}chSize=D.CH;build(D);treeTex();TWN=D.TW||null;oncomingMesh();buildSigns(D);carMeshes();pedMeshes();roadsFrom(D);ready=true;return true}
/* ---------- shop signs (OpenStreetMap as of Sept 2012): text drawn into one canvas atlas ---------- */
const SVS2=`attribute vec3 p;attribute vec2 t;uniform mat4 M;varying vec2 vt;varying vec3 vw;void main(){vt=t;vw=p;gl_Position=M*vec4(p,1.);}`;
const SFS2=`precision mediump float;varying vec2 vt;varying vec3 vw;uniform sampler2D TX;uniform vec3 E;uniform vec3 FOG;uniform float FD;uniform float NIGHT;uniform vec3 AMB;uniform vec3 SUNC;
void main(){vec4 c=texture2D(TX,vt);vec3 l=mix(AMB*.8+SUNC*.55+.25,vec3(1.05),NIGHT*.9);vec3 col=c.rgb*l;float d=length(vw-E);col=mix(col,FOG,clamp(1.-exp(-pow(d/FD,1.6)),0.,1.)*(1.-NIGHT*.4));gl_FragColor=vec4(col,1.);}`;
const SP=prog(SVS2,SFS2);const SA={p:gl.getAttribLocation(SP,'p'),t:gl.getAttribLocation(SP,'t')};
const SU={M:gl.getUniformLocation(SP,'M'),E:gl.getUniformLocation(SP,'E'),FOG:gl.getUniformLocation(SP,'FOG'),FD:gl.getUniformLocation(SP,'FD'),NIGHT:gl.getUniformLocation(SP,'NIGHT'),AMB:gl.getUniformLocation(SP,'AMB'),SUNC:gl.getUniformLocation(SP,'SUNC'),TX:gl.getUniformLocation(SP,'TX')};
let SGC=[],STEX=null;
const SSTY={0:null,1:['#f4f6f0','#1d7a3a'],2:['#1f4f8f','#ffffff'],3:['#3a2418','#f2c66a'],4:['#c8231e','#ffd23a'],5:['#b8231e','#ffffff'],6:['#1b1b20','#e2c27a']};
const SPAL=[['#1f3f7a','#ffffff'],['#f2efe6','#b8231e'],['#f3c63a','#1c1814'],['#226b3a','#ffffff'],['#5a1f5a','#ffe9a0'],['#0e0e10','#ffffff']];
function buildSigns(D){const G_=D.SG||[];if(!G_.length)return;const W_=2048,CW=512,CHh=80,cols=4;const rows=Math.ceil(G_.length/cols);const H_=Math.min(2048,Math.pow(2,Math.ceil(Math.log2(rows*CHh))));
  const cv=document.createElement('canvas');cv.width=W_;cv.height=H_;const x=cv.getContext('2d');
  G_.forEach((g,i)=>{const [c,x1,y1,x2,y2,z0,name,sty,named,pid]=g;const cx=(i%cols)*CW,cy=Math.floor(i/cols)*CHh;
    let st=/mcdonald/i.test(name)?['#d62418','#ffc72c']:SSTY[sty]||SPAL[(name.length*7+i)%SPAL.length];
    x.fillStyle=st[0];x.fillRect(cx,cy,CW,CHh);x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=4;x.strokeRect(cx+2,cy+2,CW-4,CHh-4);
    let pad=24;if(sty===1){x.fillStyle=st[1];x.fillRect(cx+20,cy+30,30,20);x.fillRect(cx+25,cy+25,20,30);x.fillRect(cx+30,cy+18,10,44);x.fillRect(cx+18,cy+34,34,12);pad=70}
    const txt=named?name:name.toUpperCase();x.fillStyle=st[1];x.textBaseline='middle';let fs=50;x.font=`bold ${fs}px "Arial Narrow","Roboto Condensed",Arial,sans-serif`;let w=x.measureText(txt).width;const avail=CW-pad-24;
    x.save();x.translate(cx+pad+(avail-Math.min(w,avail))/2,cy+CHh/2+2);if(w>avail)x.scale(avail/w,1);x.fillText(txt,0,0);x.restore()});
  STEX=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,STEX);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  const per={};G_.forEach((g,i)=>{const [c,x1,y1,x2,y2,z0]=g;const ax=x1/10,ay=y1/10,bx=x2/10,by=y2/10,l=Math.hypot(bx-ax,by-ay)||1,ux=(bx-ax)/l,uy=(by-ay)/l,nx=uy*.16,ny=-ux*.16;
    const Z=z0/10,hgt=Math.min(1.35,Math.max(.85,l/5.2));const base=HT((ax+bx)/2,(ay+by)/2);let B0=base;
    const u0=(i%cols)*CW/W_,u1=u0+CW/W_,v0=Math.floor(i/cols)*CHh/H_,v1=v0+CHh/H_;
    const P=[[ax+nx,Z+B0,-(ay+ny)],[bx+nx,Z+B0,-(by+ny)],[bx+nx,Z+hgt+B0,-(by+ny)],[ax+nx,Z+hgt+B0,-(ay+ny)]],T_=[[u0,v1],[u1,v1],[u1,v0],[u0,v0]];
    const a=per[c]||(per[c]={p:[],t:[]});for(const k of [0,1,2,0,2,3]){a.p.push(...P[k]);a.t.push(...T_[k])}});
  for(const c in per){SGC[c]={n:per[c].p.length/3,p:up(new Float32Array(per[c].p)),t:up(new Float32Array(per[c].t))}}}
function drawSigns(MV,E,LL,c0){if(!STEX)return;gl.useProgram(SP);gl.uniformMatrix4fv(SU.M,false,new Float32Array(MV));gl.uniform3fv(SU.E,E);gl.uniform3fv(SU.FOG,LL.fog);gl.uniform1f(SU.FD,(LITE?520:720)*LL.fd);gl.uniform1f(SU.NIGHT,LL.night);gl.uniform3fv(SU.AMB,LL.amb);gl.uniform3fv(SU.SUNC,LL.sunc);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,STEX);gl.uniform1i(SU.TX,0);gl.enableVertexAttribArray(SA.p);gl.enableVertexAttribArray(SA.t);
  for(let i=c0-2;i<=c0+7;i++){const g=SGC[i];if(!g)continue;gl.bindBuffer(gl.ARRAY_BUFFER,g.p);gl.vertexAttribPointer(SA.p,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,g.t);gl.vertexAttribPointer(SA.t,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,g.n)}
  gl.disableVertexAttribArray(SA.p);gl.disableVertexAttribArray(SA.t);gl.useProgram(PR)}
return{load,frame,resize,get ready(){return ready},stops:()=>STOPS,length:()=>TL,terrain:()=>!!TER,setLight:n=>{LIGHT=n;LT=Infinity},phase:()=>{const P=lightNow();return P.night>.8?'night':P.night>.2?'dusk':'day'}};
};
