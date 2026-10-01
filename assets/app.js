
(function(){
const NUL=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='length'?0:NUL),set:()=>true,apply:()=>NUL});
const $=s=>document.querySelector(s)||NUL;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const root=document.documentElement;
/* theme */
$('#themeBtn').addEventListener('click',()=>{
  const cur=root.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  root.dataset.theme=cur==='dark'?'light':'dark';
  try{localStorage.setItem('d11-theme',root.dataset.theme)}catch(e){}
});
try{const t=localStorage.getItem('d11-theme');if(t)root.dataset.theme=t}catch(e){}

/* i18n */
const I=window.__D11.I;
const LANGS=['ru','uk','en','fi'];
const RU_STATIC={};
document.querySelectorAll('[data-t]').forEach(el=>RU_STATIC[el.dataset.t]=el.innerHTML);
document.querySelectorAll('[data-ta]').forEach(el=>el.dataset.ta.split(' ').forEach(pair=>{const [a,k]=pair.split(':');RU_STATIC[k]=el.getAttribute(a)}));
I.ru.S=RU_STATIC;
function pickLang(){
  const h=(location.hash||'').slice(1);if(LANGS.includes(h))return h;
  try{const s=localStorage.getItem('d11-lang');if(LANGS.includes(s))return s}catch(e){}
  const nav=(navigator.languages||[navigator.language||'']).map(x=>x.slice(0,2).toLowerCase());
  for(const n of nav){if(LANGS.includes(n))return n}
  return 'ru';
}
let L,S;

function tabs(container,items,render,onSel){
  container.innerHTML='';
  items.forEach((it,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.innerHTML=render(it,i);b.className=container.dataset.cls||'';b.addEventListener('click',()=>sel(i));container.appendChild(b)});
  function sel(i){[...container.children].forEach((c,j)=>c.setAttribute('aria-selected',i===j));onSel(items[i],i);container.dataset.sel=i}
  container.onkeydown=e=>{const k=[...container.children];const i=k.indexOf(document.activeElement);if(i<0)return;let n=null;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%k.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i-1+k.length)%k.length;if(n!==null){e.preventDefault();k[n].focus();sel(n)}};
  return sel;
}
const keep=(el,def)=>{const v=+el.dataset.sel;return Number.isFinite(v)?v:def};

/* static data */
const LADI=[{img:'img/render/house33.jpg',rn:1,st:'done'},{img:'img/render/corridor.jpg',rn:1,st:'wip'},{img:'img/render/quarter.jpg',rn:1,st:'wip'},{img:'maps/osm_city.svg',map:true,st:'wip'},{ph:21,st:'todo'},{ph:0,st:'todo'}];
const PROFC={sheet_mixed:'#8f5b4a',sheet_green:'#4f7a52',sheet_brown:'#6e4a32',sheet_blue:'#5d8fb5',sheet_grey:'#7d8790',timber:'#b3874e',concrete_lattice:'#a9aea4',concrete_ornamental:'#c5c9bf',hedge_timber:'#b3294f',retaining_landscape:'#6f8f6a'};
const RMI=[{p:100,s:'done'},{p:100,s:'done'},{p:40,s:'wip'},{p:25,s:'wip'},{p:5,s:'todo'},{p:0,s:'todo'}];
const Q=window.__D11.Q;const D=window.__D11.D;
const LAT0=47.9927461,LON0=37.8183736,KX=111320*Math.cos(LAT0*Math.PI/180),KY=110574;
const enu=(lat,lon)=>[(lon-LON0)*KX,(lat-LAT0)*KY];
const byId={};D.props.forEach(p=>byId[p.osm.split('/')[1]]=p);
const panos=D.pano.slice().sort((a,b)=>a.lat-b.lat);
const num=(v,d)=>v.toFixed(d).replace('.',L.UI.dec);

/* quarter plan (geometry built once, labels per language) */
const R=200;const pts=f=>f.p.map(([e,n])=>`${e},${-n}`).join(' ');
function planSVG(){
  let s=`<svg viewBox="${-R} ${-R} ${2*R} ${2*R}" role="img" aria-label="${esc(L.UI.planAria)}"><defs><clipPath id="qc"><rect x="${-R}" y="${-R}" width="${2*R}" height="${2*R}"/></clipPath><pattern id="gr" width="50" height="50" patternUnits="userSpaceOnUse" x="-200" y="-200"><path d="M50 0H0V50" fill="none" stroke="var(--rule)" stroke-width=".5"/></pattern></defs><rect x="${-R}" y="${-R}" width="${2*R}" height="${2*R}" fill="url(#gr)"/><g clip-path="url(#qc)">`;
  Q.filter(f=>f.k==='g').forEach(f=>s+=`<polygon points="${pts(f)}" fill="var(--moss)" opacity=".18"/>`);
  Q.filter(f=>f.k==='w').forEach(f=>s+=`<polygon points="${pts(f)}" fill="var(--steel)" opacity=".35"/>`);
  Q.filter(f=>f.k==='r').forEach(f=>{const w=/primary|secondary|tertiary/.test(f.hw)?11:f.hw==='service'?4:7;s+=`<polyline class="rd" points="${pts(f)}" stroke-width="${w}"/>`});
  Q.filter(f=>f.k==='l').forEach(f=>s+=`<polyline points="${pts(f)}" fill="none" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4 3"/>`);
  Q.filter(f=>f.k==='b').forEach(f=>{const p=byId[f.id];if(p)s+=`<polygon class="bld c" data-id="${f.id}" tabindex="0" points="${pts(f)}" fill="${PROFC[p.prof]}"><title>${esc(L.UI.addrFmt.replace('{a}',p.a))}</title></polygon>`;else s+=`<polygon class="bld" points="${pts(f)}"/>`});
  s+=`<rect x="-18" y="-55" width="9" height="210" fill="none" stroke="var(--rose)" stroke-width="1" stroke-dasharray="3 3"/>`;
  D.pano.forEach(p=>{const [e,n]=enu(p.lat,p.lon);s+=`<circle cx="${e}" cy="${-n}" r="3.2" fill="var(--rose)" stroke="var(--card)" stroke-width="1.2"/>`});
  s+=`</g><g class="ax" font-size="7"><text x="-194" y="-188">N ↑</text><text x="-194" y="193">0</text><line x1="-180" y1="190" x2="-130" y2="190" stroke="var(--muted)"/><text x="-133" y="186" text-anchor="end">50 ${L.UI.m}</text><text x="194" y="193" text-anchor="end">${L.UI.size}</text></g></svg>`;
  return s;
}
let curProp='905741853';
const zoneOf=a=>{for(const k in L.ZONE){if(k.split(',').includes(a))return L.ZONE[k]}return ''};
function showProp(id){
  const p=byId[id];if(!p)return;curProp=id;
  document.querySelectorAll('.bld.c').forEach(el=>el.classList.toggle('on',el.dataset.id===String(id)));
  const U=L.UI;
  $('#prop').innerHTML=`<div class="eyebrow">${p.side==='east'?U.east:U.west} · OSM ${p.osm}</div><h3>${U.house} ${p.a}</h3>
  <dl><dt>${U.fac}</dt><dd>${esc(L.PROF[p.prof])}</dd><dt>${U.walls}</dt><dd>${esc(L.WALL[p.wall]||'—')}</dd><dt>${U.roof}</dt><dd>${esc(L.ROOF[p.roof]||'—')}, ${esc(L.RT[p.roof_type]||'')}</dd><dt>${U.drive}</dt><dd>${esc(L.DW[p.driveway]||'—')}</dd><dt>${U.win}</dt><dd>${p.window_slots??'—'}</dd><dt>${U.pano}</dt><dd>${esc(zoneOf(p.a))}</dd></dl>`;
}
$('#planSvg').addEventListener('click',e=>{const t=e.target.closest('.bld.c');if(t)showProp(t.dataset.id)});
$('#planSvg').addEventListener('keydown',e=>{const t=e.target.closest('.bld.c');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showProp(t.dataset.id)}});

function lensSVG(p){
  const [ce,cn]=enu(p.lat,p.lon);const r=45;
  let s=`<svg viewBox="${ce-r} ${-cn-r} ${2*r} ${2*r}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect x="${ce-r}" y="${-cn-r}" width="${2*r}" height="${2*r}" fill="#1c2630"/>`;
  Q.forEach(f=>{const pp=f.p.map(([e,n])=>`${e.toFixed(1)},${(-n).toFixed(1)}`).join(' ');
    if(f.k==='r')s+=`<polyline points="${pp}" fill="none" stroke="#3a4a58" stroke-width="7" stroke-linecap="round"/>`;
    else if(f.k==='b')s+=`<polygon points="${pp}" fill="#5c6c79" stroke="#1c2630" stroke-width=".4"/>`});
  s+=`<circle cx="${ce}" cy="${-cn}" r="30" fill="none" stroke="#e2658a55" stroke-dasharray="1.5 1.5" stroke-width=".4"/><circle cx="${ce}" cy="${-cn}" r="15" fill="none" stroke="#e2658a88" stroke-width=".4"/><circle cx="${ce}" cy="${-cn}" r="2.2" fill="#e2658a"/><circle cx="${ce}" cy="${-cn}" r="5" fill="none" stroke="#e2658a" stroke-width=".6"><animate attributeName="r" values="3;9;3" dur="3s" repeatCount="indefinite"/></circle></svg>`;
  return s;
}
function terrainSVG(){
  const T=D.terrain;const W=1000,H=220,Lf=48,Rm=12,Tp=14,B=34;
  const x=n=>Lf+(n+200)/400*(W-Lf-Rm);const y=h=>Tp+(147-h)/(147-142)*(H-Tp-B);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(L.UI.terrAria)}">`;
  for(let h=142;h<=147;h++){s+=`<line x1="${Lf}" x2="${W-Rm}" y1="${y(h)}" y2="${y(h)}" stroke="var(--rule)" stroke-width="1"/><text class="ax" x="${Lf-8}" y="${y(h)+4}" text-anchor="end">${h} ${L.UI.m}</text>`}
  for(let n=-200;n<=200;n+=50){s+=`<text class="ax" x="${x(n)}" y="${H-12}" text-anchor="middle">${n>0?'+':n<0?'−':''}${Math.abs(n)}</text>`}
  s+=`<rect x="${x(-155)}" y="${Tp}" width="${x(55)-x(-155)}" height="${H-Tp-B}" fill="var(--rose-soft)"/><text class="ax" x="${x(-50)}" y="${Tp+14}" text-anchor="middle" style="fill:var(--rose)">${esc(L.UI.corridor)}</text>`;
  const line=T.map(([n,h])=>`${x(n).toFixed(1)},${y(h).toFixed(1)}`).join(' ');
  s+=`<polygon points="${x(-200)},${H-B} ${line} ${x(200)},${H-B}" fill="var(--steel)" opacity=".14"/><polyline points="${line}" fill="none" stroke="var(--steel)" stroke-width="2.2"/>`;
  const o=T.find(t=>t[0]===0);s+=`<circle cx="${x(0)}" cy="${y(o[1])}" r="5" fill="var(--rose)"/><text class="ax" x="${x(0)+8}" y="${y(o[1])-8}" style="fill:var(--ink)">${L.UI.house} 33 · ${num(o[1],1)} ${L.UI.m}</text>`;
  s+=`<text class="ax" x="${W-Rm}" y="${H-1}" text-anchor="end">${esc(L.UI.north)}</text></svg>`;
  return `<div style="min-width:560px">${s}</div>`;
}

let curPano=null,svMode=/github\.io$/.test(location.hostname)?'live':'map';
const EMBED=/github\.io$|^localhost$|^127\./.test(location.hostname);
const HEAD={svxGtxC8Q5tVe067CCazcw:10,yr_WIG4puiEei0Qsl9JTyg:100,IZD8eAnef65jaHggvHHzbA:100,BAO5Eg0lQn43j3alf5NPKA:100,q867QaIdHBg7AtgdP2V1IQ:112,LzjrC_qvI_1JSCV4dejpLg:336,ZYMuCRy32KTEzGPaaZR1jg:280,MAiDwZzCvnfUMTZdiOfNYw:280};
const svURL=p=>`https://www.google.com/maps/@${p.lat},${p.lon},3a,75y,${HEAD[p.id]||90}h,90t/data=!3m4!1e1!3m2!1s${p.id}!2e0`;
function showLens(mode){
  const p=curPano;if(!p)return;svMode=mode;
  const lens=$('#lens');
  if(mode==='live'){
    lens.innerHTML=`<iframe title="Google Street View · ${esc(L.PANO[p.id].t)}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!4v1727200000000!6m8!1m7!1s${p.id}!2m2!1d${p.lat}!2d${p.lon}!3f${HEAD[p.id]||90}!4f0!5f0.8"></iframe>`;
  }else{
    lens.innerHTML=lensSVG(p)+`<div class="lbl mono"><span>${p.lat.toFixed(7)} N · ${p.lon.toFixed(7)} E</span><span>${esc(L.UI.radius)} · pano ${p.id.slice(0,8)}…</span></div>`;
  }
  $('#svLive').setAttribute('aria-pressed',mode==='live');$('#svMap').setAttribute('aria-pressed',mode==='map');
}
$('#svLive').addEventListener('click',()=>{if(EMBED)showLens('live');else if(curPano)window.open(svURL(curPano),'_blank','noopener')});
$('#svMap').addEventListener('click',()=>showLens('map'));
{const y=new Date().getFullYear()-2012;const el=$('#awayYears');if(el&&y>0)el.textContent=y;const d=new Date(),s=new Date(2014,3,7);let ly=d.getFullYear()-2014-((d.getMonth()<3||(d.getMonth()==3&&d.getDate()<7))?1:0);const e2=$('#lostYears');if(e2)e2.textContent=ly;}
window.__PHOTOS=null;const PHOTOS=[["https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Panorama25.jpg/1920px-Panorama25.jpg", "https://commons.wikimedia.org/wiki/File:Panorama25.jpg", "Kirill Fandeev", "CC BY-SA 3.0", "pan"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Fountain_in_Shcherbakov_Park_-_panoramio.jpg/1280px-Fountain_in_Shcherbakov_Park_-_panoramio.jpg", "https://commons.wikimedia.org/wiki/File:Fountain_in_Shcherbakov_Park_-_panoramio.jpg", "Toronto_guy", "CC BY 3.0", "park"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/%D0%9F%D0%B0%D1%80%D0%BA_%D0%A9%D0%B5%D1%80%D0%B1%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0_059.jpg/1280px-%D0%9F%D0%B0%D1%80%D0%BA_%D0%A9%D0%B5%D1%80%D0%B1%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0_059.jpg", "https://commons.wikimedia.org/wiki/File:%D0%9F%D0%B0%D1%80%D0%BA_%D0%A9%D0%B5%D1%80%D0%B1%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0_059.jpg", "Andrey Butko", "CC BY-SA 3.0", "park"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/%D0%94%D0%BE%D0%BD%D0%B1%D0%B0%D1%81%D1%81_%D0%90%D1%80%D0%B5%D0%BD%D0%B0_%D0%A7%D1%83%D0%BF%D1%80%D0%B8%D0%BD%D0%B0_%D0%92%D0%B0%D0%B4%D0%B8%D0%BC._%D0%90.jpg/1280px-%D0%94%D0%BE%D0%BD%D0%B1%D0%B0%D1%81%D1%81_%D0%90%D1%80%D0%B5%D0%BD%D0%B0_%D0%A7%D1%83%D0%BF%D1%80%D0%B8%D0%BD%D0%B0_%D0%92%D0%B0%D0%B4%D0%B8%D0%BC._%D0%90.jpg", "https://commons.wikimedia.org/wiki/File:%D0%94%D0%BE%D0%BD%D0%B1%D0%B0%D1%81%D1%81_%D0%90%D1%80%D0%B5%D0%BD%D0%B0_%D0%A7%D1%83%D0%BF%D1%80%D0%B8%D0%BD%D0%B0_%D0%92%D0%B0%D0%B4%D0%B8%D0%BC._%D0%90.jpg", "Вадим Чуприна", "CC BY-SA 4.0", "arena"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/%D0%94%D0%BE%D0%BD%D0%B1%D0%B0%D1%81%D1%81-%D0%90%D1%80%D0%B5%D0%BD%D0%B0_%D0%B8_%D0%92%D0%B8%D0%BA%D1%82%D0%BE%D1%80%D0%B8%D1%8F_-_panoramio.jpg/1280px-%D0%94%D0%BE%D0%BD%D0%B1%D0%B0%D1%81%D1%81-%D0%90%D1%80%D0%B5%D0%BD%D0%B0_%D0%B8_%D0%92%D0%B8%D0%BA%D1%82%D0%BE%D1%80%D0%B8%D1%8F_-_panoramio.jpg", "https://commons.wikimedia.org/wiki/File:%D0%94%D0%BE%D0%BD%D0%B1%D0%B0%D1%81%D1%81-%D0%90%D1%80%D0%B5%D0%BD%D0%B0_%D0%B8_%D0%92%D0%B8%D0%BA%D1%82%D0%BE%D1%80%D0%B8%D1%8F_-_panoramio.jpg", "jonni29", "CC BY 3.0", "arena"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_185.jpg/1280px-%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_185.jpg", "https://commons.wikimedia.org/wiki/File:%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_185.jpg", "Andrey Butko", "CC BY-SA 3.0", "street"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Voroshylovs%27kyi_district%2C_Donetsk%2C_Donetsk_Oblast%2C_Ukraine_-_panoramio_%282%29.jpg/1280px-Voroshylovs%27kyi_district%2C_Donetsk%2C_Donetsk_Oblast%2C_Ukraine_-_panoramio_%282%29.jpg", "https://commons.wikimedia.org/wiki/File:Voroshylovs%27kyi_district,_Donetsk,_Donetsk_Oblast,_Ukraine_-_panoramio_(2).jpg", "jonni29", "CC BY 3.0", "street"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Voroshylovs%27kyi_district%2C_Donetsk%2C_Donetsk_Oblast%2C_Ukraine_-_panoramio_%281%29.jpg/1280px-Voroshylovs%27kyi_district%2C_Donetsk%2C_Donetsk_Oblast%2C_Ukraine_-_panoramio_%281%29.jpg", "https://commons.wikimedia.org/wiki/File:Voroshylovs%27kyi_district,_Donetsk,_Donetsk_Oblast,_Ukraine_-_panoramio_(1).jpg", "quantizer", "CC BY 3.0", "street"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/%D0%A2%D0%B5%D0%B0%D1%82%D1%80_%D0%BE%D0%BF%D0%B5%D1%80%D1%8B_%D0%B8_%D0%B1%D0%B0%D0%BB%D0%B5%D1%82%D0%B0_-_panoramio_%282%29.jpg/1280px-%D0%A2%D0%B5%D0%B0%D1%82%D1%80_%D0%BE%D0%BF%D0%B5%D1%80%D1%8B_%D0%B8_%D0%B1%D0%B0%D0%BB%D0%B5%D1%82%D0%B0_-_panoramio_%282%29.jpg", "https://commons.wikimedia.org/wiki/File:%D0%A2%D0%B5%D0%B0%D1%82%D1%80_%D0%BE%D0%BF%D0%B5%D1%80%D1%8B_%D0%B8_%D0%B1%D0%B0%D0%BB%D0%B5%D1%82%D0%B0_-_panoramio_(2).jpg", "Olya Usova", "CC BY 3.0", "build"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Center_of_Donetsk_2012.JPG/1280px-Center_of_Donetsk_2012.JPG", "https://commons.wikimedia.org/wiki/File:Center_of_Donetsk_2012.JPG", "MOs810", "CC BY-SA 3.0", "street"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_040.jpg/1280px-%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_040.jpg", "https://commons.wikimedia.org/wiki/File:%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_040.jpg", "Andrey Butko", "CC BY-SA 3.0", "pan"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_024.jpg/1280px-%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_024.jpg", "https://commons.wikimedia.org/wiki/File:%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_024.jpg", "Andrey Butko", "CC BY-SA 3.0", "pan"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_065.jpg/1280px-%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_065.jpg", "https://commons.wikimedia.org/wiki/File:%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_Green_Plaza_065.jpg", "Andrey Butko", "CC BY-SA 3.0", "pan"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Industrial_city_Donetsk_%2811484852103%29.jpg/1280px-Industrial_city_Donetsk_%2811484852103%29.jpg", "https://commons.wikimedia.org/wiki/File:Industrial_city_Donetsk_(11484852103).jpg", "Vladimir Yaitskiy", "CC BY-SA 2.0", "pan"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/%D0%9C%D0%BE%D1%81%D1%82_%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%D0%B0_%D0%98%D0%BB%D1%8C%D0%B8%D1%87%D0%B0_%D1%87%D0%B5%D1%80%D0%B5%D0%B7_%D0%9A%D0%B0%D0%BB%D1%8C%D0%BC%D0%B8%D1%83%D1%81.jpg/1280px-%D0%9C%D0%BE%D1%81%D1%82_%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%D0%B0_%D0%98%D0%BB%D1%8C%D0%B8%D1%87%D0%B0_%D1%87%D0%B5%D1%80%D0%B5%D0%B7_%D0%9A%D0%B0%D0%BB%D1%8C%D0%BC%D0%B8%D1%83%D1%81.jpg", "https://commons.wikimedia.org/wiki/File:%D0%9C%D0%BE%D1%81%D1%82_%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%D0%B0_%D0%98%D0%BB%D1%8C%D0%B8%D1%87%D0%B0_%D1%87%D0%B5%D1%80%D0%B5%D0%B7_%D0%9A%D0%B0%D0%BB%D1%8C%D0%BC%D0%B8%D1%83%D1%81.jpg", "Artemka", "CC BY-SA 4.0", "street"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Donezk_Donbass_Palace_07.JPG/1280px-Donezk_Donbass_Palace_07.JPG", "https://commons.wikimedia.org/wiki/File:Donezk_Donbass_Palace_07.JPG", "Brücke-Osteuropa", "Public domain", "build"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/%D0%A2%D0%B5%D0%B0%D1%82%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D1%8C_016.JPG/1280px-%D0%A2%D0%B5%D0%B0%D1%82%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D1%8C_016.JPG", "https://commons.wikimedia.org/wiki/File:%D0%A2%D0%B5%D0%B0%D1%82%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D1%8C_016.JPG", "Andrey Butko", "CC BY-SA 3.0", "street"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Donetsk_0072.jpg/1280px-Donetsk_0072.jpg", "https://commons.wikimedia.org/wiki/File:Donetsk_0072.jpg", "Wadco2", "CC BY-SA 3.0", "build"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_140.jpg/1280px-%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_140.jpg", "https://commons.wikimedia.org/wiki/File:%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_140.jpg", "Andrey Butko", "CC BY-SA 3.0", "build"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_149.jpg/1280px-%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_149.jpg", "https://commons.wikimedia.org/wiki/File:%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80_%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%B0_149.jpg", "Andrey Butko", "CC BY-SA 3.0", "park"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/2012_0611_20_Donetsk_%287977485875%29.jpg/1280px-2012_0611_20_Donetsk_%287977485875%29.jpg", "https://commons.wikimedia.org/wiki/File:2012_0611_20_Donetsk_(7977485875).jpg", "Peter Collins", "CC BY-SA 2.0", "arena"], ["https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_%D0%94%D0%BE%D0%BD%D0%B5%D1%86%D0%BA%D0%BE%D0%B9_%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D0%BD%D0%BE%D0%B9_%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D0%B8_004.jpg/1280px-%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_%D0%94%D0%BE%D0%BD%D0%B5%D1%86%D0%BA%D0%BE%D0%B9_%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D0%BD%D0%BE%D0%B9_%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D0%B8_004.jpg", "https://commons.wikimedia.org/wiki/File:%D0%92%D0%B8%D0%B4_%D0%B8%D0%B7_%D0%94%D0%BE%D0%BD%D0%B5%D1%86%D0%BA%D0%BE%D0%B9_%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D0%BD%D0%BE%D0%B9_%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D0%B8_004.jpg", "Andrey Butko", "CC BY-SA 3.0", "pan"]];const ARCH_ORDER=[[10,"big"],[11,"w2"],[20,""],[3,""],[0,"full"],[5,"tall"],[19,""],[18,""],[14,""],[1,"big"],[15,""],[16,""],[2,"w2"],[12,"w2"],[13,"w2"],[8,""],[17,"w2"],[21,"w2"],[4,""],[7,"tall"],[6,""],[9,"w2"]];window.__PHOTOS=PHOTOS;
function renderArch(){window.__PHCAP=L.PHOTOS;const sm=u=>u.replace(/\/\d+px-/,'/960px-');$('#arch').innerHTML=ARCH_ORDER.map(([i,sz])=>{const x=PHOTOS[i];return `<figure class="${sz}" data-i="${i}" data-c="${x[4]}"><button type="button" class="arch-open" data-i="${i}" aria-label="${esc(S.ar11||'')}: ${esc(L.PHOTOS[i])}"><img src="${sm(x[0])}" alt="${esc(L.PHOTOS[i])}" loading="lazy" referrerpolicy="no-referrer"></button><figcaption><b>${esc(L.PHOTOS[i])}</b><a href="${x[1]}" target="_blank" rel="noopener">© ${esc(x[2])} · ${x[3]} ↗</a></figcaption></figure>`}).join('');dispatchEvent(new Event('d11arch'))}
function render(){window.__UPD=L.UPD;window.__RMX={RM:L.RM,RMI};renderArch();renderTicker();tickClock();
  /* ladder */
  const steps=$('#steps');steps.dataset.cls='step';const fig=$('#stageFig');
  const lad=L.LAD.map((x,i)=>Object.assign({},x,LADI[i]));
  tabs(steps,lad,l=>`<span class="k">${l.k}</span><span class="t">${l.t}</span><span class="s">${l.s}</span>`,l=>{
    const ph=l.ph!=null?PHOTOS[l.ph]:null;fig.innerHTML=`<img src="${ph?ph[0]:l.img}" alt="${esc(l.t)}" class="${l.map?'map':''}" style="${l.map?'object-fit:cover;object-position:46% 44%':''}" ${ph?'referrerpolicy="no-referrer"':''}>${ph?`<a class="mono stage-credit" href="${ph[1]}" target="_blank" rel="noopener">© ${esc(ph[2])} · ${ph[3]} ↗</a>`:(l.rn?`<span class="mono stage-credit">${esc(S.rn1||'')}</span>`:'')}`;
    $('#stageCap').textContent=l.cap;$('#stageStatus').innerHTML=`<span class="status ${l.st}">${L.ST[l.st]}</span>`;
  })(keep(steps,1));
  /* panoramas */
  const road=$('#road');road.dataset.cls='pano';
  const def=panos.findIndex(p=>p.id==='q867QaIdHBg7AtgdP2V1IQ');
  tabs(road,panos,p=>{const r=L.PANO[p.id];const [,n]=enu(p.lat,p.lon);return `<i></i><span class="pl">${esc(r.t)}<small>${n>=0?'+':'−'}${Math.abs(n).toFixed(0)} ${L.UI.m} · ${p.lat.toFixed(5)}</small></span>`},p=>{
    const r=L.PANO[p.id];$('#pTitle').textContent=r.t;
    $('#pObs').innerHTML=r.o.map(x=>`<li>${esc(x)}</li>`).join('');
    $('#pLink').href=svURL(p);
    curPano=p;showLens(svMode);
  })(keep(road,def));
  /* plan */
  $('#planSvg').innerHTML=planSVG();
  $('#legend').innerHTML=Object.keys(PROFC).map(k=>`<span><i style="background:${PROFC[k]}"></i>${esc(L.PROF[k])}</span>`).join('');
  showProp(curProp);
  /* roadmap */
  $('#roadmapEl').innerHTML=L.RM.map((r,i)=>{const m=RMI[i];return `<div class="rm"><span class="k">${r.k}</span><h3>${esc(r.t)}</h3><div class="bar"><i style="width:${m.p}%"></i></div><span class="status ${m.s}">${L.ST[m.s]}</span><p>${esc(r.d)}</p></div>`}).join('');
  $('#terrain').innerHTML=terrainSVG();
}

function apply(lang){
  L=I[lang];S=L.S;
  root.lang=L.meta.lang;{const pt=document.body.dataset.pt;document.title=L.meta.title+(pt&&S[pt]?' · '+String(S[pt]).replace(/<[^>]+>/g,''):'')}
  const md=document.querySelector('meta[name="description"]');if(md)md.content=L.meta.desc;
  document.querySelectorAll('[data-t]').forEach(el=>{const v=S[el.dataset.t];if(v!=null)el.innerHTML=v});
  document.querySelectorAll('[data-ta]').forEach(el=>el.dataset.ta.split(' ').forEach(pair=>{const [a,k]=pair.split(':');if(S[k]!=null)el.setAttribute(a,S[k])}));
  document.querySelectorAll('.langs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
  render();
  window.__d11S=S;dispatchEvent(new CustomEvent('d11lang',{detail:{S}}));
  try{localStorage.setItem('d11-lang',lang)}catch(e){}
}
document.querySelectorAll('.langs button').forEach(b=>b.addEventListener('click',()=>{apply(b.dataset.lang);if(history.replaceState)history.replaceState(null,'','#'+b.dataset.lang)}));
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(LANGS.includes(h))apply(h)});


apply(pickLang());
/* life: clock, counters, reveal, progress, ticker */
function tickClock(){try{const d=new Date();const parts=new Intl.DateTimeFormat(L.meta.lang==='uk'?'uk-UA':L.meta.lang==='fi'?'fi-FI':L.meta.lang==='en'?'en-GB':'ru-RU',{timeZone:'Europe/Kyiv',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d);$('#clock').textContent=parts.replace(/(\d{1,2}\.?\s*\S+)/,'$1 2011')}catch(e){}}
setInterval(()=>L&&tickClock(),1000);
function renderTicker(){const s=L.STREETS.map((n,i)=>`<span class="${i===0?'me':''}">${esc(n)}</span>`).join('');$('#tk').innerHTML=s+s}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el){if(el.dataset.done||el.hasAttribute('data-nocount'))return;el.dataset.done=1;const txt=el.textContent;const target=parseInt(txt.replace(/\D/g,''),10);if(!target||reduce)return;const sep=txt.match(/\d(\D)\d{3}/)?.[1]||'';const t0=performance.now();const dur=1400;const f=t=>{const k=Math.min(1,(t-t0)/dur);const v=Math.round(target*(1-Math.pow(1-k,3)));el.textContent=sep?v.toString().replace(/\B(?=(\d{3})+(?!\d))/g,sep):v;if(k<1)requestAnimationFrame(f);else el.textContent=txt};requestAnimationFrame(f)}
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const t=en.target;t.classList.remove('pre');if(t.matches('.stat b,.away b,.why-stats b'))countUp(t);if(t.classList.contains('tline')){[...t.children].forEach((li,i)=>li.style.transitionDelay=(i*140)+'ms')}io.unobserve(t)}),{threshold:.15});
  document.querySelectorAll('section .head,.ladder,.atlas-main,.street,.plan,.gal,.arch,.classes,.engines,.road-map,.layers,.story-text,.manifesto,.dev-grid,.devlog,.why-stats,.player,.pillars,.north,.srccmp').forEach(el=>{el.classList.add('rv');if(el.getBoundingClientRect().top>innerHeight)el.classList.add('pre');io.observe(el)});
  document.querySelectorAll('.stat b,.away b,.why-stats b').forEach(el=>io.observe(el));
  const tl=document.querySelector('.tline');if(tl){if(tl.getBoundingClientRect().top>innerHeight)tl.classList.add('pre');io.observe(tl)}
}

/* waveform sketch (decorative) */
(function(){const c=document.getElementById('wave');if(!c)return;const x=c.getContext('2d');let w,h,t=0;const dpr=Math.min(2,devicePixelRatio||1);
function size(){w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;x.setTransform(dpr,0,0,dpr,0,0)}size();addEventListener('resize',size);
function frame(){x.clearRect(0,0,w,h);const lines=[['#e2658a',1.6,1],['#86aecb',1,.6],['#e7ebe8',.6,.35]];
lines.forEach(([col,lw,a],k)=>{x.beginPath();x.strokeStyle=col;x.globalAlpha=a;x.lineWidth=lw;for(let i=0;i<=w;i+=3){const u=i/w;const env=Math.sin(Math.PI*u);const y=h*.55+env*(Math.sin(u*9+t*(1+k*.3))*h*.16+Math.sin(u*23-t*1.7+k)*h*.06+Math.sin(u*57+t*.6)*h*.02);i?x.lineTo(i,y):x.moveTo(i,y)}x.stroke()});x.globalAlpha=1;t+=.012;if(!reduce)requestAnimationFrame(frame)}frame()})();

{const b=document.getElementById('ytPoster');if(b)b.addEventListener('click',()=>{const w=b.parentElement;w.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/3lj1tFT3wGw?rel=0&autoplay=1&modestbranding=1" title="Donetsk Ukraine - Before The War Started on a Historic City" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'})}
addEventListener('scroll',()=>{const h=document.documentElement;$('#progress').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});

})();

;(()=>{
let S=window.__d11S||{};const T=k=>S[k]||'';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------- guess the place ---------- */
const box=document.getElementById('guess');
const P=window.__PHOTOS||[];
const CAT={1:'g10',2:'g10',3:'g11',4:'g11',20:'g11',5:'g12',19:'g12',18:'g12',6:'g13',7:'g13',8:'g14',17:'g14',14:'g40',15:'g41'};
const CATS=['g10','g11','g12','g13','g14','g40','g41'];
const BK='d11-guess-best';let best=0;try{best=+localStorage.getItem(BK)||0}catch(e){}
let st=null;
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function start(){const ids=shuf(Object.keys(CAT).map(Number)).slice(0,6);st={ids,i:0,score:0,ans:null,opts:null};round()}
function round(){const id=st.ids[st.i];const ok=CAT[id];st.opts=shuf([ok,...shuf(CATS.filter(c=>c!==ok)).slice(0,3)]);st.ans=null;render()}
function render(){if(!box)return;
  if(!st){box.innerHTML=`<div class="gs-intro"><button type="button" class="btn primary" id="gsStart">${T('g4')}</button>${best?`<p class="gs-best">${T('g42').replace('{b}',best).replace('{n}',6)}</p>`:''}</div>`;box.querySelector('#gsStart').onclick=start;return}
  if(st.i>=st.ids.length){const n=st.ids.length,s=st.score;if(s>best){best=s;try{localStorage.setItem(BK,String(s))}catch(e){}}const msg=s>=5?'g15':(s>=3?'g17':'g18');box.innerHTML=`<div class="gs-end"><b class="num">${T('g9').replace('{s}',s).replace('{n}',n)}</b><p>${T(msg)}</p><p class="gs-best">${T('g42').replace('{b}',best).replace('{n}',n)}</p><button type="button" class="btn primary" id="gsAgain">${T('g5')}</button></div>`;box.querySelector('#gsAgain').onclick=start;return}
  const id=st.ids[st.i],ph=P[id];const ok=CAT[id];
  box.innerHTML=`<figure class="gs-ph"><img src="${ph[0]}" alt="" referrerpolicy="no-referrer"><figcaption class="mono">© ${esc(ph[2])} · ${esc(ph[3])}${st.ans?` · <a href="${ph[1]}" target="_blank" rel="noopener">Commons ↗</a>`:''}</figcaption></figure>
  <div class="gs-side"><span class="eyebrow">${T('g16').replace('{i}',st.i+1).replace('{n}',st.ids.length)}</span><div class="gs-opts">${st.opts.map(o=>`<button type="button" data-o="${o}" class="${st.ans?(o===ok?'ok':(o===st.ans?'bad':'')):''}" ${st.ans?'disabled':''}>${T(o)}</button>`).join('')}</div>
  <p class="gs-fb" aria-live="polite">${st.ans?(st.ans===ok?T('g6'):T('g7').replace('{x}',T(ok))):''}</p>${st.ans&&window.__PHCAP?`<p class="gs-cap">${esc(window.__PHCAP[id])}</p>`:''}${st.ans?`<button type="button" class="btn ghost" id="gsNext">${T('g8')}</button>`:''}<div class="gs-dots">${st.ids.map((_,j)=>`<i class="${j<st.i?'d':(j===st.i?'c':'')}"></i>`).join('')}</div></div>`;
  box.querySelectorAll('.gs-opts button').forEach(b=>b.onclick=()=>{if(st.ans)return;st.ans=b.dataset.o;if(st.ans===ok)st.score++;render();const nx=box.querySelector('#gsNext');if(nx)nx.focus()});
  const nx=box.querySelector('#gsNext');if(nx)nx.onclick=()=>{st.i++;st.i<st.ids.length?round():render()}}
/* ---------- what's new ---------- */
const KEY='d11-seen';let seen=null;try{seen=localStorage.getItem(KEY)}catch(e){}
const items=[...document.querySelectorAll('.devlog li')];
const dOf=li=>{const t=(li.querySelector('time')||{}).textContent||'';const m=t.match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?Date.UTC(+m[3],+m[2]-1,+m[1]):0};
let fresh=0;
if(seen){const s=+seen;items.forEach(li=>{if(dOf(li)>s){li.classList.add('fresh');fresh++}})}
function newMarks(){document.querySelectorAll('.devlog li.fresh').forEach(li=>{let c=li.querySelector('.new-chip');if(!c){c=document.createElement('span');c.className='new-chip mono';li.querySelector('time').append(c)}c.textContent=T('g20')});
  const nav=document.querySelector('.nav a[href="#dev"]');if(nav&&fresh){nav.classList.add('has-new');nav.dataset.n=fresh}}
try{const last=items.reduce((m,li)=>Math.max(m,dOf(li)),0);localStorage.setItem(KEY,String(Math.max(last,seen?+seen:0)))}catch(e){}
function all(){render();newMarks()}
addEventListener('d11lang',e=>{S=e.detail.S;all()});
all();

/* ---------- photo archive: filters + full-size viewer ---------- */
{const grid=document.getElementById('arch'),bar=document.getElementById('archF'),cnt=document.getElementById('archN');
 if(grid&&bar){const FIL=[['all','ar0'],['pan','ar1'],['street','ar2'],['park','ar3'],['build','ar4'],['arena','ar5']];let cur='all',lb=null,li=0,list=[];
  const figs=()=>[...grid.querySelectorAll('figure')];
  const vis=()=>figs().filter(f=>!f.classList.contains('off'));
  function drawBar(){bar.innerHTML=FIL.map(([k,t])=>`<button type="button" data-f="${k}" aria-pressed="${k===cur}">${T(t)}</button>`).join('');bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur=b.dataset.f;drawBar();filt()})}
  function filt(){figs().forEach(f=>f.classList.toggle('off',cur!=='all'&&f.dataset.c!==cur));grid.classList.toggle('filtered',cur!=='all');if(cnt)cnt.textContent=T('ar6').replace('{n}',vis().length)}
  const big=u=>u.replace(/\/\d+px-/,'/1280px-');
  function build(){lb=document.createElement('div');lb.className='lb';lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
   lb.innerHTML=`<button type="button" class="lb-btn lb-close">×</button><figure><img alt=""><button type="button" class="lb-btn lb-prev">←</button><button type="button" class="lb-btn lb-next">→</button></figure><div class="lb-bar"><div><b></b> <span class="lb-n"></span></div><a target="_blank" rel="noopener"></a></div>`;
   document.body.appendChild(lb);lb.querySelector('.lb-close').onclick=close;lb.querySelector('.lb-prev').onclick=()=>step(-1);lb.querySelector('.lb-next').onclick=()=>step(1);
   lb.addEventListener('click',e=>{if(e.target===lb||e.target.tagName==='FIGURE')close()});
   let sx=null;lb.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});lb.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)step(dx<0?1:-1);sx=null})}
  let back=null;
  function show(){const f=list[li],i=+f.dataset.i,P=window.__PHOTOS||[],x=P[i];if(!x)return;const im=lb.querySelector('img');im.src=big(x[0]);im.alt=f.querySelector('b').textContent;im.referrerPolicy='no-referrer';
   lb.querySelector('.lb-bar b').textContent=f.querySelector('b').textContent;lb.querySelector('.lb-n').textContent=`${li+1} / ${list.length} · © ${x[2]} · ${x[3]}`;const a=lb.querySelector('.lb-bar a');a.href=x[1];a.textContent=T('ar10');
   lb.querySelector('.lb-close').setAttribute('aria-label',T('ar7'));lb.querySelector('.lb-prev').setAttribute('aria-label',T('ar8'));lb.querySelector('.lb-next').setAttribute('aria-label',T('ar9'));
   const n=list[(li+1)%list.length];if(n){const pre=new Image();pre.referrerPolicy='no-referrer';pre.src=big(P[+n.dataset.i][0])}}
  function open(fig){if(!lb)build();list=vis();li=Math.max(0,list.indexOf(fig));back=document.activeElement;lb.hidden=false;document.documentElement.classList.add('lb-open');show();lb.querySelector('.lb-close').focus()}
  function close(){if(!lb||lb.hidden)return;lb.hidden=true;document.documentElement.classList.remove('lb-open');if(back&&back.focus)back.focus()}
  function step(d){li=(li+d+list.length)%list.length;show()}
  addEventListener('keydown',e=>{if(!lb||lb.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);else if(e.key==='Tab'){const f=[...lb.querySelectorAll('button,a')];const i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
  grid.addEventListener('click',e=>{const b=e.target.closest('.arch-open');if(b)open(b.closest('figure'))});
  const all2=()=>{drawBar();filt();if(lb&&!lb.hidden)show()};
  addEventListener('d11arch',all2);addEventListener('d11lang',all2);all2()}}
/* ---------- mobile menu ---------- */
{const nav=document.querySelector('.nav'),bt=document.getElementById('burger'),mn=document.getElementById('mnav');
 if(nav&&bt&&mn){const set=o=>{nav.classList.toggle('open',o);bt.setAttribute('aria-expanded',o);document.documentElement.classList.toggle('menu-open',o);if(o){const a=mn.querySelector('a');a&&a.focus({preventScroll:true})}};
  bt.addEventListener('click',()=>set(!nav.classList.contains('open')));
  mn.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){set(false);bt.focus()}});
  matchMedia('(min-width:861px)').addEventListener('change',e=>{if(e.matches)set(false)});
  const t2=document.getElementById('themeBtn2'),t1=document.getElementById('themeBtn');if(t2&&t1)t2.addEventListener('click',()=>t1.click());}}
/* ---------- compact dev log on phones ---------- */
{const log=document.querySelector('.devlog');if(log){const li=[...log.querySelectorAll('li')];const keepN=4;
 if(li.length>keepN){li.slice(0,li.length-keepN).forEach(x=>x.classList.add('old'));
  const b=document.createElement('button');b.type='button';b.className='logmore';log.appendChild(b);
  const lab=()=>{b.textContent=T(log.classList.contains('all')?'mn8':'mn7')+(log.classList.contains('all')?'':' ('+li.length+')')};
  b.addEventListener('click',()=>{log.classList.toggle('all');lab()});lab();addEventListener('d11lang',lab)}}}
})();

/* headings: never split a word mid-letter on phones; shrink the font until the longest word fits */
(function(){
  function fit(){
    document.querySelectorAll('h1,h2,h3').forEach(h=>{
      h.style.fontSize='';
      if(!h.offsetParent)return;
      const w=h.clientWidth;if(!w)return;
      const probe=document.createElement('span');probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;left:0;top:0;width:max-content;max-width:none';
      h.appendChild(probe);
      let fs=parseFloat(getComputedStyle(h).fontSize),words=(h.innerText||'').split(/[\s ]+/).filter(Boolean),n=0;
      const longest=()=>Math.max(0,...words.map(t=>{probe.textContent=t;return probe.getBoundingClientRect().width}));
      while(longest()>w-3&&fs>14&&n++<40){fs-=1;h.style.fontSize=fs+'px'}
      probe.remove();
    });
  }
  let t;const run=()=>{clearTimeout(t);t=setTimeout(fit,60)};
  addEventListener('resize',run);addEventListener('d11lang',run);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(run);
  addEventListener('load',run);run();
})();

/* press kit: copy description texts */
(function(){document.querySelectorAll('.pr-copy[data-copy]').forEach(b=>b.addEventListener('click',()=>{const el=document.getElementById(b.dataset.copy);if(!el)return;const txt=el.innerText.trim();
  const done=()=>{const S=window.__d11S||{};const old=b.innerHTML;b.classList.add('ok');b.textContent=S.pr7||'✓';setTimeout(()=>{b.classList.remove('ok');b.innerHTML=S.pr6||old},1600)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,done);else{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy')}catch(e){}done()}}))})();

;(()=>{
const sec=document.getElementById('memory');if(!sec)return;
let S=window.__d11S||{};const T=k=>S[k]||'';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MW=4369,MH=2844,OX=2006,OY=1247,LAT0=47.9927461,LON0=37.8183736,KLAT=111180,KLON=111320*Math.cos(LAT0*Math.PI/180);
const toXY=(lat,lon)=>[OX+(lon-LON0)*KLON,OY-(lat-LAT0)*KLAT];
const toLL=(x,y)=>[LAT0-(y-OY)/KLAT,LON0+(x-OX)/KLON];
const REPO='https://github.com/Gek2or/donetsk-2011';
const box=sec.querySelector('.mm-map'),inner=sec.querySelector('.mm-inner'),pins=sec.querySelector('.mm-pins'),list=sec.querySelector('.mm-list'),panel=sec.querySelector('.mm-panel'),count=sec.querySelector('.mm-count'),card=sec.querySelector('.mm-card');
let items=[],adding=false,draft=null,z=1,tx=0,ty=0,active=null;
/* view */
function fit(){const w=box.clientWidth,h=box.clientHeight;const s=Math.max(w/MW,h/MH);return s}
let base=1;
function clamp(){const w=box.clientWidth,h=box.clientHeight,s=base*z;const W=MW*s,H=MH*s;tx=Math.min(0,Math.max(w-W,tx));ty=Math.min(0,Math.max(h-H,ty))}
function apply(){clamp();inner.style.transform=`translate(${tx}px,${ty}px) scale(${base*z})`;inner.style.setProperty('--iz',1/(base*z))}
function center(x,y,zz){const w=box.clientWidth,h=box.clientHeight;if(zz)z=zz;const s=base*z;tx=w/2-x*s;ty=h/2-y*s;apply()}
function resize(){base=fit();apply()}
function zoomAt(f,cx,cy){const s0=base*z;z=Math.max(1,Math.min(8,z*f));const s1=base*z;tx=cx-(cx-tx)*s1/s0;ty=cy-(cy-ty)*s1/s0;apply()}
/* pins */
function renderPins(){let h=`<button type="button" class="mm-pin home" style="left:${OX}px;top:${OY}px" data-home="1" aria-label="${esc(T('mm14'))}"><i></i></button>`;
  items.forEach((m,i)=>{if(m.lat==null||m.lon==null)return;const [x,y]=toXY(m.lat,m.lon);if(x<0||y<0||x>MW||y>MH)return;h+=`<button type="button" class="mm-pin${active===i?' act':''}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px" data-i="${i}" aria-label="${esc(m.place)}"><i></i></button>`});
  if(draft)h+=`<span class="mm-pin draft" style="left:${draft[0].toFixed(0)}px;top:${draft[1].toFixed(0)}px"><i></i></span>`;
  pins.innerHTML=h;
  pins.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();if(b.dataset.home){showCard(null);return}active=+b.dataset.i;showCard(items[active]);renderPins();renderList()}))}
function showCard(m){if(m===null){card.hidden=false;card.innerHTML=`<span class="eyebrow">${T('mm1')}</span><h3>${T('mm14')}</h3><button type="button" class="mm-x" aria-label="×">×</button>`}else if(!m){card.hidden=true;return}else{card.hidden=false;card.innerHTML=`<span class="eyebrow">${esc(m.year||'')}</span><h3>${esc(m.place)}</h3><p>${esc(m.text).replace(/\n/g,'<br>')}</p>${m.name?`<p class="mm-sig">— ${esc(m.name)}</p>`:''}${m.n?`<a class="mono" href="${REPO}/issues/${m.n}" target="_blank" rel="noopener">GitHub #${m.n} ↗</a>`:''}<button type="button" class="mm-x" aria-label="×">×</button>`}
  card.querySelector('.mm-x').onclick=()=>{card.hidden=true;active=null;renderPins();renderList()}}
function renderList(){count.textContent=items.length?T('mm13').replace('{n}',items.length):T('mm12');
  list.innerHTML=items.map((m,i)=>`<li class="${active===i?'act':''}"><button type="button" data-i="${i}"><span class="mono">${esc(m.year||'')}</span><b>${esc(m.place)}</b><em>${esc((m.text||'').slice(0,140))}${(m.text||'').length>140?'…':''}</em></button></li>`).join('');
  list.querySelectorAll('button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,m=items[i];active=i;showCard(m);if(m.lat!=null){const [x,y]=toXY(m.lat,m.lon);center(x,y,Math.max(z,3))}renderPins();renderList();box.scrollIntoView({block:'center',behavior:'smooth'})})}
/* add flow */
const url=()=>{const [lat,lon]=draft?toLL(draft[0],draft[1]):[null,null];const place=panel.querySelector('#mmPlace').value.trim(),year=panel.querySelector('#mmYear').value.trim();const q=new URLSearchParams({template:'memory.yml',title:'[Память] '+(place||'')});if(place)q.set('place',place);if(lat!=null){q.set('lat',lat.toFixed(6));q.set('lon',lon.toFixed(6))}if(year)q.set('year',year);return `${REPO}/issues/new?${q}`};
function renderPanel(){const [lat,lon]=draft?toLL(draft[0],draft[1]):[0,0];panel.querySelector('.mm-coord').textContent=draft?T('mm20').replace('{lat}',lat.toFixed(5)).replace('{lon}',lon.toFixed(5)):T('mm5');const a=panel.querySelector('#mmGo');a.href=url();a.classList.toggle('off',!draft)}
sec.querySelector('#mmAdd').addEventListener('click',()=>{adding=true;box.classList.add('adding');panel.hidden=false;renderPanel()});
sec.querySelector('#mmCancel').addEventListener('click',()=>{adding=false;draft=null;box.classList.remove('adding');panel.hidden=true;renderPins()});
panel.querySelectorAll('input').forEach(i=>i.addEventListener('input',renderPanel));
/* input */
const pts=new Map();let moved=0,lastDist=0;
box.addEventListener('pointerdown',e=>{if(box.classList.contains('lock')||e.target.closest('button'))return;box.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(pts.size===2){const [a,b]=[...pts.values()];lastDist=Math.hypot(a[0]-b[0],a[1]-b[1])}});
box.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const p=pts.get(e.pointerId);const dx=e.clientX-p[0],dy=e.clientY-p[1];pts.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(dx)+Math.abs(dy);
  if(pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);const r=box.getBoundingClientRect();if(lastDist)zoomAt(d/lastDist,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top);lastDist=d;tx+=dx/2;ty+=dy/2;apply()}else{tx+=dx;ty+=dy;apply()}});
const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(e.type==='pointerup'&&moved<6&&adding&&!pts.size){const r=box.getBoundingClientRect();const s=base*z;draft=[(e.clientX-r.left-tx)/s,(e.clientY-r.top-ty)/s];renderPins();renderPanel()}if(pts.size<2)lastDist=0};
box.addEventListener('pointerup',up);box.addEventListener('pointercancel',up);
box.addEventListener('wheel',e=>{if(box.classList.contains('lock'))return;e.preventDefault();const r=box.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
sec.querySelector('#mmIn').onclick=()=>zoomAt(1.5,box.clientWidth/2,box.clientHeight/2);
sec.querySelector('#mmOut').onclick=()=>zoomAt(1/1.5,box.clientWidth/2,box.clientHeight/2);
const act=sec.querySelector('#mmAct'),done=sec.querySelector('#mmDone');
if(matchMedia('(pointer:coarse)').matches){box.classList.add('lock');act.hidden=false}
act.onclick=()=>{box.classList.remove('lock');act.hidden=true;done.hidden=false};
done.onclick=()=>{box.classList.add('lock');act.hidden=false;done.hidden=true};
/* data */
function load(){fetch('memories.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{items:[]}).then(d=>{items=(d.items||[]).filter(m=>m&&m.place&&m.text);renderPins();renderList()}).catch(()=>{renderList()})}
addEventListener('resize',resize);
addEventListener('d11lang',e=>{S=e.detail.S;renderPins();renderList();if(!panel.hidden)renderPanel();if(!card.hidden)showCard(active==null?null:items[active])});
resize();center(OX,OY,1.8);renderPins();renderList();load();
})();

;(()=>{
/* Update feed: newest first. Texts live in i18n data (L.UPD[id]); "@key" reuses a static string. */
const E=[
 {id:'2026-10-01-press',d:'2026-10-01',ty:'site',v:'v3.3',img:'assets/og/press.jpg',lab:'n6',cta:['press.html','pr2']},
 {id:'2026-09-30-feed',d:'2026-09-30',ty:'site',v:'v3.1'},
 {id:'2026-09-30-north',d:'2026-09-30',ty:'game',v:'AP-01',img:'img/ue2/z33_2011_gate_match.jpg',lab:'t57',cta:['dev.html#frames','uc6']},
 {id:'2026-09-30-v3',d:'2026-09-30',ty:'site',v:'v3.0',img:'img/render/overview.jpg',lab:'rn1',cta:['model.html#q3d','uc1']},
 {id:'2026-09-30-mobile',d:'2026-09-30',ty:'site',v:'v2.1'},
 {id:'2026-09-30-pages',d:'2026-09-30',ty:'site',v:'v2.0',cta:['index.html','uc2']},
 {id:'2026-09-29-planting',d:'2026-09-29',ty:'game',v:'AP-01'},
 {id:'2026-09-28-north',d:'2026-09-28',ty:'game',v:'AP-01',img:'img/ue2/northern_terrace.jpg',lab:'t57',cta:['dev.html#frames','uc6']},
 {id:'2026-09-28-memory',d:'2026-09-28',ty:'site',v:'v1.4',cta:['city.html#memory','uc3']},
 {id:'2026-09-26-interactive',d:'2026-09-26',ty:'site',v:'v1.3',img:'img/render/corridor.jpg',lab:'rn1',cta:['model.html#walk','uc4']},
 {id:'2026-09-25-guided',d:'2026-09-25',ty:'game',v:'AP-01',img:'img/ue2/guided_walk_hud.jpg',lab:'t57'},
 {id:'2026-09-25-quarter',d:'2026-09-25',ty:'game',v:'AP-01',img:'img/render/quarter.jpg',lab:'rn1'},
 {id:'2026-09-25-osm2012',d:'2026-09-25',ty:'research',v:'M01'},
 {id:'2026-09-25-film',d:'2026-09-25',ty:'site',v:'v1.2',cta:['index.html#why','uc5']},
 {id:'2026-09-24-player',d:'2026-09-24',ty:'game',v:'AP-01',img:'img/ue/01_overview.jpg',lab:'t57',cta:['dev.html#frames','uc6']},
 {id:'2026-09-24-launch',d:'2026-09-24',ty:'site',v:'v1.0',cta:['city.html#archive','uc7']},
 {id:'2026-09-23-unreal',d:'2026-09-23',ty:'game',v:'M02'},
 {id:'2026-09-22-unity',d:'2026-09-22',ty:'game',v:'P0'},
 {id:'2026-09-21-panoramas',d:'2026-09-21',ty:'research',v:'M01'},
 {id:'2026-09-14-origin',d:'2026-09-14',ty:'research',v:'M01'},
 {id:'2026-09-13-osm',d:'2026-09-13',ty:'research',v:'M01'}];
const SITE_V='v3.3',START='2026-09-13',LATEST=E[0].d,TY={game:'u6',site:'u7',research:'u8'};
let S=window.__d11S||{};const T=k=>S[k]||'';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='d11-upd-seen';let seen=null;try{seen=localStorage.getItem(KEY)}catch(e){}
const firstVisit=seen==null;
const isNew=e=>!firstVisit&&e.d>seen;
const nNew=E.filter(isNew).length;
const txt=e=>{const u=((window.__UPD||{})[e.id])||{};const s=u.s&&u.s[0]==='@'?T(u.s.slice(1)):u.s;return Object.assign({},u,{s})};
const fmtD=d=>d.split('-').reverse().join('.');
const lang=()=>document.documentElement.lang||'ru';
const month=d=>{const x=new Date(d+'T12:00:00');let m=new Intl.DateTimeFormat(lang(),{month:'long'}).format(x);return m.charAt(0).toUpperCase()+m.slice(1)+' '+x.getFullYear()};

/* ---------- nav badges on every page ---------- */
function badges(){document.querySelectorAll('a[href="updates.html"]').forEach(a=>{let b=a.querySelector('.nav-n');if(!nNew||a.closest('.foot-nav')){if(b)b.remove();return}if(!b){b=document.createElement('sup');b.className='nav-n';a.appendChild(b)}b.textContent=nNew})}

/* ---------- home teaser ---------- */
function teaser(){const el=document.getElementById('updLatest');if(!el)return;const e=E[0],t=txt(e);
  el.innerHTML=`<span class="ul-k mono">${esc(T('u26'))}</span><span class="ul-d mono">${fmtD(e.d)} · ${esc(T(TY[e.ty]))} ${e.v}</span><b>${esc(t.t)}</b><span class="ul-s">${esc(t.s)}</span><span class="ul-go">${esc(T('u27'))}</span>`}

/* ---------- the feed page ---------- */
const list=document.getElementById('updList');
let filt='all',onlyNew=false,open=new Set(E.slice(0,2).map(e=>e.id));
if(!firstVisit)E.filter(isNew).forEach(e=>open.add(e.id));
function stats(){const el=document.getElementById('updStats');if(!el)return;const days=Math.max(1,Math.round((Date.now()-Date.parse(START+'T00:00:00'))/864e5));
  const rm=window.__RMX;const c=curStage();const stage=rm&&c>=0?rm.RM[c].k:'AP-01';
  el.innerHTML=[[days,'u22'],[E.length,'u23'],[SITE_V,'u32'],[stage,'u33']].map(([n,k])=>`<div><b class="num">${esc(n)}</b><span>${esc(T(k))}</span></div>`).join('')}
function curStage(){const rm=window.__RMX;if(!rm)return -1;let c=-1;rm.RMI.forEach((m,i)=>{if(m.s==='wip')c=i});return c}
function rail(){const el=document.getElementById('updRail');const rm=window.__RMX;if(!el||!rm)return;const cur=curStage();
  el.innerHTML=`<span class="eyebrow">${esc(T('u24'))}</span><ol>${rm.RM.map((r,i)=>{const m=rm.RMI[i];return `<li class="${m.s}${i===cur?' cur':''}"><a href="dev.html#roadmap"><i style="--p:${m.p}%"></i><span class="mono">${esc(r.k)}</span><b>${esc(r.t)}</b>${i===cur?`<em class="mono">${esc(T('u30'))}</em>`:''}</a></li>`}).join('')}</ol>`}
function controls(){const f=document.getElementById('updF');if(!f)return;
  f.innerHTML=[['all','u5'],['game','u6'],['site','u7'],['research','u8']].map(([k,t])=>{const n=k==='all'?E.length:E.filter(e=>e.ty===k).length;return `<button type="button" data-f="${k}" aria-pressed="${k===filt}">${esc(T(t))} <small class="mono">${n}</small></button>`}).join('');
  f.querySelectorAll('button').forEach(b=>b.onclick=()=>{filt=b.dataset.f;controls();draw()});
  const on=document.getElementById('updNew');if(on){on.checked=onlyNew;on.disabled=firstVisit||!nNew;on.onchange=()=>{onlyNew=on.checked;draw()}}
  const nn=document.getElementById('updNewN');if(nn)nn.textContent=nNew?nNew:'';
  const all=document.getElementById('updAll');if(all){const vis=shown();const every=vis.length&&vis.every(e=>open.has(e.id)||!hasBody(e));all.textContent=T(every?'u11':'u10');all.onclick=()=>{if(every)vis.forEach(e=>open.delete(e.id));else vis.forEach(e=>open.add(e.id));draw();controls()}}
  const v=document.getElementById('updVisit');if(v)v.textContent=firstVisit?T('u21'):(nNew?T('u19').replace('{n}',nNew):T('u20'))}
const shown=()=>E.filter(e=>(filt==='all'||e.ty===filt)&&(!onlyNew||isNew(e)));
const hasBody=e=>{const t=txt(e);return !!(e.img||e.cta||(t.n&&t.n.length)||(t.i&&t.i.length)||(t.f&&t.f.length))};
function lists(t){return [['n','u12','n'],['i','u13','i'],['f','u14','f']].filter(([k])=>t[k]&&t[k].length).map(([k,h,c])=>`<div class="ul-grp ${c}"><h4 class="mono">${esc(T(h))}</h4><ul>${t[k].map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
function draw(){if(!list)return;const vis=shown();let html='',m='';
  if(!vis.length)html=`<li class="upd-empty">${esc(T('u28'))}</li>`;
  vis.forEach(e=>{const t=txt(e),mo=month(e.d);if(mo!==m){m=mo;html+=`<li class="upd-month" aria-hidden="true"><span>${esc(mo)}</span></li>`}
    const body=hasBody(e),op=body&&open.has(e.id),nw=isNew(e);
    html+=`<li class="upd-e ty-${e.ty}${op?' open':''}${nw?' fresh':''}" id="u-${e.id}">
<div class="upd-dot" aria-hidden="true"></div>
<div class="upd-card">
<header class="upd-h"><time class="upd-date" datetime="${e.d}">${fmtD(e.d)}</time><span class="upd-v mono">${esc(T(TY[e.ty]))} · ${esc(e.v)}</span>${nw?`<span class="upd-new mono">${esc(T('u34'))}</span>`:''}
<span class="upd-act"><button type="button" class="upd-share" data-id="${e.id}" aria-label="${esc(T('u18'))}" title="${esc(T('u18'))}">#</button>${body?`<button type="button" class="upd-tog" data-id="${e.id}" aria-expanded="${op}" aria-controls="ub-${e.id}"><span>${esc(T(op?'u16':'u15'))}</span><i aria-hidden="true"></i></button>`:''}</span></header>
<h3>${esc(t.t)}</h3>${t.s?`<p class="upd-s">${esc(t.s)}</p>`:''}
${body?`<div class="upd-body${e.img?' has-img':''}" id="ub-${e.id}"${op?'':' hidden'}>${e.img?`<figure class="upd-img"><img src="${e.img}" alt="" loading="lazy"><figcaption class="mono">${esc(T(e.lab||'rn1'))}</figcaption></figure>`:''}${lists(t)}${e.cta?`<a class="upd-cta" href="${e.cta[0]}">${esc(T(e.cta[1]))}</a>`:''}</div>`:''}
${react(e)}
</div></li>`});
  list.innerHTML=html;wireReact();
  list.querySelectorAll('.upd-tog').forEach(b=>b.onclick=()=>{const id=b.dataset.id;if(open.has(id))open.delete(id);else open.add(id);const li=b.closest('.upd-e'),o=open.has(id);li.classList.toggle('open',o);b.setAttribute('aria-expanded',o);b.querySelector('span').textContent=T(o?'u16':'u15');li.querySelector('.upd-body').hidden=!o;controls()});
  list.querySelectorAll('.upd-share').forEach(b=>b.onclick=()=>{const url=location.href.split('#')[0]+'#u-'+b.dataset.id;const done=()=>toast(T('u17'));if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,()=>{history.replaceState(null,'','#u-'+b.dataset.id);done()});else{history.replaceState(null,'','#u-'+b.dataset.id);done()}})}
let tt=0;function toast(s){let el=document.getElementById('updToast');if(!el){el=document.createElement('div');el.id='updToast';el.className='upd-toast mono';el.setAttribute('role','status');document.body.appendChild(el)}el.textContent=s;el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),1800)}
function deep(){const h=decodeURIComponent(location.hash||'');if(!h.startsWith('#u-'))return;const id=h.slice(3);if(!E.some(e=>e.id===id))return;filt='all';onlyNew=false;open.add(id);controls();draw();const li=document.getElementById('u-'+id);if(li){li.classList.add('hl');setTimeout(()=>li.scrollIntoView({block:'center'}),50)}}
/* ---------- reactions: battery charges (like) or drains (dislike) ----------
   Shared counters on a public counter service; only increments are used, so an
   undo is its own counter: shown = hits - undos. Your own choice stays local. */
const NS='donetsk2011-gek2or',API='https://abacus.jasoncameron.dev',RK='d11-react';
let mine={};try{mine=JSON.parse(localStorage.getItem(RK)||'{}')}catch(e){}
const CNT={},offline={v:false};
const saveMine=()=>{try{localStorage.setItem(RK,JSON.stringify(mine))}catch(e){}};
const BAT=`<svg viewBox="0 0 44 22" aria-hidden="true"><rect class="b-shell" x="1.5" y="2.5" width="36" height="17" rx="3.5"/><rect class="b-tip" x="38.5" y="7.5" width="3.5" height="7" rx="1.2"/><rect class="b-s s0" x="5" y="6" width="6.8" height="10" rx="1.2"/><rect class="b-s s1" x="13" y="6" width="6.8" height="10" rx="1.2"/><rect class="b-s s2" x="21" y="6" width="6.8" height="10" rx="1.2"/><rect class="b-s s3" x="29" y="6" width="5.5" height="10" rx="1.2"/><path class="b-bolt" d="M22 3.5 16.5 12h4.2l-2 6.5 6.3-9h-4.3z"/></svg>`;
function react(e){const m=mine[e.id],c=CNT[e.id];const l=c?c.l:null,d=c?c.d:null;const tot=(l||0)+(d||0);
  const pct=c&&tot?Math.round(100*l/tot):null;
  return `<div class="upd-react" data-id="${e.id}" role="group" aria-label="${esc(T('ur4'))}">
<button type="button" class="bat like${m==='l'?' on':''}" data-r="l" aria-pressed="${m==='l'}">${BAT}<span class="b-lab">${esc(T('ur1'))}</span><b class="b-n mono">${l==null?'':l}</b></button>
<button type="button" class="bat dis${m==='d'?' on':''}" data-r="d" aria-pressed="${m==='d'}">${BAT}<span class="b-lab">${esc(T('ur2'))}</span><b class="b-n mono">${d==null?'':d}</b></button>
<span class="b-meter mono">${pct==null?(c&&!tot?esc(T('ur6')):''):`<i style="--p:${pct}%"></i>${esc(T('ur3').replace('{p}',pct))}`}</span>
${offline.v?`<span class="b-off mono">${esc(T('ur5'))}</span>`:''}</div>`}
const get=k=>fetch(`${API}/get/${NS}/${k}`).then(r=>r.status===404?{value:0}:(r.ok?r.json():Promise.reject(r.status))).then(j=>+j.value||0);
const hit=k=>fetch(`${API}/hit/${NS}/${k}`).then(r=>r.ok?r.json():Promise.reject(r.status));
const loading=new Set();
function load(id){if(CNT[id]||loading.has(id))return;loading.add(id);
  Promise.all(['l','lx','d','dx'].map(s=>get(`${id}-${s}`))).then(([l,lx,d,dx])=>{CNT[id]={l:Math.max(0,l-lx),d:Math.max(0,d-dx)};paint(id)}).catch(()=>{offline.v=true;paint(id)}).finally(()=>loading.delete(id))}
function paint(id){const box=list&&list.querySelector(`.upd-react[data-id="${id}"]`);if(!box)return;const e=E.find(x=>x.id===id);const tmp=document.createElement('div');tmp.innerHTML=react(e);box.replaceWith(tmp.firstElementChild);wireReact()}
let io=null;
function wireReact(){if(!list)return;
  if(!io&&'IntersectionObserver' in window)io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){load(en.target.dataset.id);io.unobserve(en.target)}}),{rootMargin:'300px'});
  list.querySelectorAll('.upd-react').forEach(box=>{if(box.dataset.w)return;box.dataset.w=1;const id=box.dataset.id;if(!CNT[id]){if(io)io.observe(box);else load(id)}
    box.querySelectorAll('.bat').forEach(b=>b.onclick=()=>vote(id,b.dataset.r,b))})}
function vote(id,r,btn){const prev=mine[id];const next=prev===r?null:r;
  const c=CNT[id]||(CNT[id]={l:0,d:0});
  if(prev){c[prev]=Math.max(0,c[prev]-1);hit(`${id}-${prev}x`).catch(()=>{offline.v=true})}
  if(next){c[next]++;hit(`${id}-${next}`).catch(()=>{offline.v=true})}
  if(next)mine[id]=next;else delete mine[id];saveMine();
  paint(id);const nb=list.querySelector(`.upd-react[data-id="${id}"] .bat.${(next||prev)==='l'?'like':'dis'}`);
  if(nb){nb.classList.add(next?'anim':'anim-off');setTimeout(()=>nb.classList.remove('anim','anim-off'),1300)}}
function all(){badges();teaser();if(list){stats();rail();controls();draw()}}
addEventListener('d11lang',e=>{S=e.detail.S;all()});
addEventListener('d11data',all);
all();deep();
/* remember the newest entry: badges reset once the feed has been seen, first visits set a baseline */
try{if(firstVisit||list)localStorage.setItem(KEY,LATEST)}catch(e){}
})();
