/* v6.6: the cab view of tram route 1. A small WebGL renderer for the street corridor (assets/tram3d.json):
   buildings with windows, roads and pavements, parks, water, the rails with their overhead wire, stops and trees.
   World: x east, y up, z south, metres. */
window.__T3D=function(canvas,opts){
'use strict';
opts=opts||{};
const gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'high-performance'})||canvas.getContext('experimental-webgl');
if(!gl)return null;
const LITE=opts.lite;
/* ---------- shaders ---------- */
const VS=`attribute vec3 p;attribute vec3 n;attribute vec4 c;attribute vec3 f;
uniform mat4 M;uniform mat4 MO;uniform vec3 E;varying vec3 vn;varying vec4 vc;varying vec3 vf;varying vec3 vw;
void main(){vec4 w=MO*vec4(p,1.);vn=mat3(MO)*n;vc=c;vf=f;vw=w.xyz;gl_Position=M*w;}`;
const FS=`precision mediump float;varying vec3 vn;varying vec4 vc;varying vec3 vf;varying vec3 vw;
uniform vec3 E;uniform vec3 SUN;uniform vec3 FOG;uniform float FD;uniform float MODE;uniform vec3 SUNC;uniform vec3 AMB;uniform float NIGHT;uniform vec3 CD;
float h1(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 col=vc.rgb;vec3 N=normalize(vn);
 float k=vf.z;
 if(MODE>.5){ /* trees: a soft canopy on crossed quads */
  vec2 q=vf.xy;vec2 d=(q-vec2(.5,.63))*vec2(1.,1.12);float r=length(d);float trunk=step(abs(q.x-.5),.03+.02*(.4-q.y))*step(q.y,.45);
  float nz=.055*sin(q.x*19.+q.y*7.)+.045*sin(q.y*23.-q.x*11.)+.035*sin((q.x+q.y)*41.)+.02*sin(q.x*67.-q.y*53.);
  float leaf=step(r,.36+nz);
  if(leaf<.5&&trunk<.5)discard;
  float tex=.5+.5*sin(q.x*47.+sin(q.y*29.)*3.)*sin(q.y*43.+q.x*9.);
  col=leaf>.5?col*(.84+.03*tex+.4*(q.y-.45)-.2*r):vec3(.3,.24,.19);
 }else if(k>.5){ /* facades: floors of 2.9 m, windows every 3 m (houses 4.2 m) */
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
 }
 if(k>5.5&&k<9.5){ /* lamps and car lights: they glow after dark */
  vec3 em=k<6.5?vec3(1.,.72,.38):k<7.5?vec3(1.,.97,.86):vec3(.95,.12,.08);
  col=mix(col,em*1.15,NIGHT);if(NIGHT>.5){float d1=length(vw-E);gl_FragColor=vec4(mix(col,FOG,clamp((1.-exp(-pow(d1/FD,1.6)))*.5,0.,1.)),1.);return;}}
 float sun=max(dot(N,SUN),0.);float hemi=.5+.5*N.y;
 vec3 light=AMB*hemi+SUNC*sun+.2*(1.-NIGHT*.85);
 /* the tram's own headlights on what is in front of it */
 vec3 tp=vw-E;float dd=length(tp.xz);float fw=dot(tp.xz/max(dd,.01),CD.xz);
 light+=NIGHT*vec3(1.,.95,.8)*smoothstep(.86,.985,fw)*clamp(1.-dd/70.,0.,1.)*(N.y>.5?1.1:.6)*step(vw.y,4.);
 col*=light;
 float d=length(vw-E);float fo=1.-exp(-pow(d/FD,1.6));
 col=mix(col,FOG,clamp(fo,0.,1.));
 gl_FragColor=vec4(col,1.);}`;
const SVS=`attribute vec2 p;varying float y;void main(){y=p.y;gl_Position=vec4(p,.9999,1.);}`;
const SFS=`precision mediump float;varying float y;uniform float H;uniform vec3 SA;uniform vec3 SB;void main(){float t=clamp((y-H)*.9,0.,1.);gl_FragColor=vec4(mix(SA,SB,pow(t,.7)),1.);}`;
function prog(vs,fs){const P=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const S=gl.createShader(t);gl.shaderSource(S,s);gl.compileShader(S);if(!gl.getShaderParameter(S,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(S));gl.attachShader(P,S)}gl.linkProgram(P);if(!gl.getProgramParameter(P,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(P));return P}
const PR=prog(VS,FS),SK=prog(SVS,SFS);
const A={p:gl.getAttribLocation(PR,'p'),n:gl.getAttribLocation(PR,'n'),c:gl.getAttribLocation(PR,'c'),f:gl.getAttribLocation(PR,'f')};
const U={MO:gl.getUniformLocation(PR,'MO'),M:gl.getUniformLocation(PR,'M'),E:gl.getUniformLocation(PR,'E'),SUN:gl.getUniformLocation(PR,'SUN'),FOG:gl.getUniformLocation(PR,'FOG'),FD:gl.getUniformLocation(PR,'FD'),MODE:gl.getUniformLocation(PR,'MODE'),SUNC:gl.getUniformLocation(PR,'SUNC'),AMB:gl.getUniformLocation(PR,'AMB'),NIGHT:gl.getUniformLocation(PR,'NIGHT'),CD:gl.getUniformLocation(PR,'CD')};
const skyBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,skyBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const SKP=gl.getAttribLocation(SK,'p'),SKH=gl.getUniformLocation(SK,'H'),SKA=gl.getUniformLocation(SK,'SA'),SKB=gl.getUniformLocation(SK,'SB');
/* ---------- geometry builder: growable arrays, one set per chunk and layer ---------- */
function G(){return{p:[],n:[],c:[],f:[]}}
let CH=[];/* chunk -> {flat:G, solid:G, tree:G, line:[]} */
const NL=6;const ck=i=>CH[i]||(CH[i]={fl:Array.from({length:NL},G),solid:G(),tree:G(),wire:[]});
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
function ribbon(g,pts,w,y,col){if(TER)pts=dens(pts,9);const hw=w/2;for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const l=Math.hypot(bx-ax,by-ay);if(l<.05)continue;const nx=-(by-ay)/l*hw,ny=(bx-ax)/l*hw;
  quad(g,W(ax+nx,ay+ny,y),W(ax-nx,ay-ny,y),W(bx-nx,by-ny,y),W(bx+nx,by+ny,y),[0,1,0],col);
  if(i>1){/* round the joint */const r=[];for(let k=0;k<=6;k++){const t=k/6*Math.PI*2;r.push([ax+Math.cos(t)*hw,ay+Math.sin(t)*hw])}for(let k=0;k<6;k++)tri(g,W(ax,ay,y),W(r[k][0],r[k][1],y),W(r[k+1][0],r[k+1][1],y),[0,1,0],col)}}}
function dens(p,m){const o=[p[0]];for(let i=1;i<p.length;i++){const [ax,ay]=p[i-1],[bx,by]=p[i];const n=Math.ceil(Math.hypot(bx-ax,by-ay)/m);for(let k=1;k<=n;k++)o.push([ax+(bx-ax)*k/n,ay+(by-ay)*k/n])}return o}
/* split a ground triangle until it follows the relief */
function gtri(g,a,b,c,y,col,d){const l1=Math.hypot(a[0]-b[0],a[1]-b[1]),l2=Math.hypot(b[0]-c[0],b[1]-c[1]),l3=Math.hypot(c[0]-a[0],c[1]-a[1]);
  if(TER&&(d||0)<6&&Math.max(l1,l2,l3)>22){if(l1>=l2&&l1>=l3){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];gtri(g,a,m,c,y,col,(d||0)+1);gtri(g,m,b,c,y,col,(d||0)+1)}
    else if(l2>=l3){const m=[(b[0]+c[0])/2,(b[1]+c[1])/2];gtri(g,a,b,m,y,col,(d||0)+1);gtri(g,a,m,c,y,col,(d||0)+1)}else{const m=[(c[0]+a[0])/2,(c[1]+a[1])/2];gtri(g,a,b,m,y,col,(d||0)+1);gtri(g,m,b,c,y,col,(d||0)+1)}return}
  tri(g,W(a[0],a[1],y),W(b[0],b[1],y),W(c[0],c[1],y),[0,1,0],col)}
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
  for(const [c,cls,f,tr] of D.A){const p=unflat(f),g=fl(c,1),col=AC[cls],y=cls===1?.0:.04;for(let i=0;i<tr.length;i+=3)gtri(g,p[tr[i]],p[tr[i+1]],p[tr[i+2]],y,col)}
  /* pavements under the roads, then the roads (painter's order: layers drawn in this order) */
  const RS=D.R.slice().sort((a,b)=>b[3]-a[3]);
  for(const [c,w,surf,cls,f] of RS){if(cls>3)continue;const p=unflat(f);ribbon(fl(c,2),p,w/10+(cls<=2?4.4:1.2),.07,cls<=2?[146,144,138]:[134,130,120])}
  for(const [c,w,surf,cls,f] of RS){const p=unflat(f);const col=cls===4?[150,146,136]:surf===3?[140,124,98]:surf===2?[110,106,100]:surf===1?[128,126,120]:[88,88,92];ribbon(fl(c,3),p,w/10,.1,col)}
  /* centre lines on the bigger roads */
  for(const [c,w,surf,cls,f] of D.R){if(cls>1||w<70)continue;const p=unflat(f);const g=fl(c,4);for(let i=1;i<p.length;i++){const [ax,ay]=p[i-1],[bx,by]=p[i];const l=Math.hypot(bx-ax,by-ay);const n=Math.floor(l/6);for(let k=0;k<n;k++){const t0=k*6/l,t1=(k*6+3)/l;ribbon(g,[[ax+(bx-ax)*t0,ay+(by-ay)*t0],[ax+(bx-ax)*t1,ay+(by-ay)*t1]],.14,.12,[226,224,214])}}}
  /* rails: ballast, sleepers in the ballast, two rails 1524 mm apart; the overhead wire with poles */
  for(const [c,kind,emb,f] of D.RL){const p=unflat(f);if(!emb)ribbon(fl(c,4),p,kind?3.4:2.9,.12,kind?[124,112,100]:[128,118,104]);
    for(const d of [-.762,.762])ribbon(fl(c,5),off(p,d),.09,.15,[70,68,66]);
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
   for(const [c,p] of per){ribbon(fl(c,4),p,2.9,.12,[126,116,102]);for(const d of [-.762,.762])ribbon(fl(c,5),off(p,d),.09,.15,[66,64,62]);const w=ck(c).wire;const pw=TER?dens(p,20):p;for(let i=1;i<pw.length;i++)w.push(W(pw[i-1][0],pw[i-1][1],5.9),W(pw[i][0],pw[i][1],5.9))}}
  {let acc=16;for(let i=1;i<TR.length;i++){const [ax,ay]=TR[i-1],[bx,by]=TR[i];const l=Math.hypot(bx-ax,by-ay);if(l<.1)continue;const ux=(bx-ax)/l,uy=(by-ay)/l;let t=(34-acc%34)%34;
    while(t<l){const x=ax+ux*t,y=ay+uy*t,s_=TC[i-1]+t;const c=Math.floor(Math.min(TL-1,s_)/D.CH);const px=x+uy*3.1,py=y-ux*3.1;pole(ck(c).solid,px,py,7.6,.12,[78,80,82]);
      ck(c).solid&&box(ck(c).solid,(f,r,h)=>W(px+ux*f-uy*r,py+uy*f+ux*r,h),-.05,.05,0,3.4,6.55,6.65,[78,80,82]);t+=34}acc+=l}}
  /* street lamps: a pole and a sodium lamp over the kerb, every 34 m (68 m on phones) */
  for(const [c,w,surf,cls,f] of D.R){if(cls>2)continue;const p=unflat(f);const sp=LITE?68:34;let acc=sp/2,k=0;
    for(let i=1;i<p.length;i++){const [ax,ay]=p[i-1],[bx,by]=p[i];const l=Math.hypot(bx-ax,by-ay);if(l<.1)continue;const ux=(bx-ax)/l,uy=(by-ay)/l;let t=(sp-acc%sp)%sp;
      while(t<l){const sd=(k++%2)?1:-1,o=w/20+1.1;const x=ax+ux*t-uy*o*sd,y=ay+uy*t+ux*o*sd;const g=ck(c).solid;pole(g,x,y,8.6,.08,[96,98,100]);
        const P=(f_,r_,h)=>W(x+ux*f_+uy*r_*sd,y+uy*f_-ux*r_*sd,h);box(g,P,-.04,.04,0,1.4,8.45,8.55,[96,98,100]);lightBox(g,P,-.22,.22,1.2,1.9,8.2,8.45,[200,196,180],6);t+=sp}acc+=l}}
  /* stops: a raised platform on the right of the track and a shelter */
  STOPS.forEach((s,i)=>{const c=Math.floor(Math.min(TL-1,s)/D.CH);const g=ck(c).solid;const [x,y,a]=trackAt(s);const ux=Math.cos(a),uy=Math.sin(a),rx=uy,ry=-ux;
    const P=(f,r,h)=>W(x+ux*f+rx*r,y+uy*f+ry*r,h);
    {const a1=trackAt(s-18)[2],a2=trackAt(s+30)[2];let da=Math.abs(a2-a1);if(da>Math.PI)da=2*Math.PI-da;if(da>.22)return}
    box(g,P,-14,14,2.3,4.6,0,.25,[178,174,166]);
    box(g,P,-3,3,4.3,4.45,0,2.4,[150,170,180]);box(g,P,-3,-2.9,3.4,4.4,0,2.4,[150,170,180]);box(g,P,2.9,3,3.4,4.4,0,2.4,[150,170,180]);box(g,P,-3.3,3.3,3.3,4.6,2.4,2.55,[208,206,200]);
    pole(g,x+ux*5+rx*2.6,y+uy*5+ry*2.6,2.8,.05,[90,90,92]);
    box(g,P,4.7,5.3,2.55,2.65,2.1,2.75,[245,245,240]);
    /* people waiting: 2-6 figures in autumn coats */
    const COATS=[[60,62,70],[94,70,52],[120,40,40],[50,70,90],[150,140,120],[70,80,60],[30,30,32]];const n=2+((i*7919)%5);
    for(let q=0;q<n;q++){const h=(i*131+q*977)%1000/1000,f0=-9+h*18,r0=2.8+((q*37+i)%10)/10*1.4,col=COATS[(i+q*3)%COATS.length],tall=1.55+((q*13+i)%7)*.04;
      box(g,P,f0-.18,f0+.18,r0-.14,r0+.14,.25,.25+tall*.55,col);box(g,P,f0-.15,f0+.15,r0-.12,r0+.12,.25+tall*.55,.25+tall*.83,col);box(g,P,f0-.1,f0+.1,r0-.1,r0+.1,.25+tall*.84,.25+tall,[200,164,140]);
      box(g,P,f0-.14,f0-.03,r0-.08,r0+.08,.25,.25+tall*.46,[40,40,44]);box(g,P,f0+.03,f0+.14,r0-.08,r0+.08,.25,.25+tall*.46,[40,40,44])}});
  /* trees */
  const AUT=[[96,120,60],[110,128,56],[150,140,60],[176,138,58],[160,100,50],[120,130,70]];
  const TRs=LITE?D.TR.filter((_,i)=>i%2===0):D.TR;
  for(const [c,x,y,sz,v] of TRs){const g=ck(c).tree,X=x/10,Y=y/10,S=sz,col=AUT[(((v+((x*7+y*13)>>4))%AUT.length)+AUT.length)%AUT.length];
    for(const a of [0,Math.PI/2]){const dx=Math.cos(a)*S/2,dy=Math.sin(a)*S/2;
      quad(g,W(X-dx,Y-dy,0),W(X+dx,Y+dy,0),W(X+dx,Y+dy,S*1.15),W(X-dx,Y-dy,S*1.15),[0,1,0],col,[[0,0,0],[1,0,0],[1,1,0],[0,1,0]])}}
  /* the ground: 30 m cells within 700 m of the track, each given to the chunk of its nearest track point */
  if(TER){const s=TER.s;const near=(x,y)=>{let b=1e9,bs=0;for(let i=0;i<TR.length;i+=3){const d=Math.hypot(TR[i][0]-x,TR[i][1]-y);if(d<b){b=d;bs=TC[i]}}return[b,bs]};
    for(let j=0;j<TER.ny-1;j++)for(let i=0;i<TER.nx-1;i++){const x=TER.x+i*s,y=TER.y+j*s;const [d,sa]=near(x+s/2,y+s/2);if(d>700)continue;const c=Math.floor(Math.min(TL-1,sa)/D.CH);const g=fl(c,0);
      const P=[[x,y],[x+s,y],[x+s,y+s],[x,y+s]].map(q=>W(q[0],q[1],-.02));const e1=[P[1][0]-P[0][0],P[1][1]-P[0][1],P[1][2]-P[0][2]],e2=[P[3][0]-P[0][0],P[3][1]-P[0][1],P[3][2]-P[0][2]];
      let nn=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];const ln=Math.hypot(...nn)||1;nn=nn.map(v=>v/ln);if(nn[1]<0)nn=nn.map(v=>-v);
      const t=((i*7+j*13)%5)*3;quad(g,P[0],P[1],P[2],P[3],nn,[110+t,114+t,84+t/2])}}
  /* upload */
  for(const C of CH){const LS=[...C.fl.map((g,i)=>['fl',i,g]),['solid',0,C.solid],['tree',0,C.tree]];for(const [k,ix,g] of LS){g.n_=g.p.length/3;if(!g.n_){g.buf=null;continue}
    g.buf={p:up(new Float32Array(g.p)),n:up(new Float32Array(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))};g.p=g.n=g.c=g.f=null}
    C.wn=C.wire.length;C.wbuf=C.wn?up(new Float32Array(C.wire.flat())):null;C.wire=null}
}
function area(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1]}return a/2}
function box(g,P,f0,f1,r0,r1,h0,h1,col){const c=[[f0,r0],[f1,r0],[f1,r1],[f0,r1]];for(let i=0;i<4;i++){const a=c[i],b=c[(i+1)%4];const A0=P(a[0],a[1],h0),B0=P(b[0],b[1],h0),B1=P(b[0],b[1],h1),A1=P(a[0],a[1],h1);
  const e=[B0[0]-A0[0],B0[2]-A0[2]];const l=Math.hypot(...e)||1;quad(g,A0,B0,B1,A1,[e[1]/l,0,-e[0]/l],col)}
  const T0=P(f0,r0,h1),T1=P(f1,r0,h1),T2=P(f1,r1,h1),T3=P(f0,r1,h1);quad(g,T0,T1,T2,T3,[0,1,0],col)}
function lightBox(g,P,f0,f1,r0,r1,h0,h1,col,kind){const n0=g.f.length;box(g,P,f0,f1,r0,r1,h0,h1,col);for(let i=n0;i<g.f.length;i+=3)g.f[i+2]=kind}
function pole(g,x,y,h,r,col){for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.78,b=(i+1)/4*Math.PI*2+.78;const ax=x+Math.cos(a)*r,ay=y+Math.sin(a)*r,bx=x+Math.cos(b)*r,by=y+Math.sin(b)*r;
  const nx=Math.cos((a+b)/2),ny=Math.sin((a+b)/2);quad(g,W(ax,ay,0),W(bx,by,0),W(bx,by,h),W(ax,ay,h),[nx,0,-ny],col)}}
function up(a){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);return b}
/* ---------- traffic on the main streets: Ladas and Volgas in the usual colours ---------- */
let CARM=[],ROADS=[];
function carMeshes(){const COLS=[[232,232,226],[214,200,170],[150,40,36],[60,84,120],[70,96,70],[150,150,150],[40,40,44],[210,170,60]];
  for(const col of COLS){const g=G();const P=(f,r,h)=>[f,h,r];box(g,P,-2.1,2.1,-.82,.82,.25,.95,col);box(g,P,-1.0,1.1,-.76,.76,.95,1.45,[70,86,100]);box(g,P,-1.05,1.0,-.77,.77,1.42,1.5,col);
    box(g,P,-1.9,-1.4,-.85,.85,0,.5,[24,24,24]);box(g,P,1.3,1.8,-.85,.85,0,.5,[24,24,24]);
    lightBox(g,P,2.1,2.16,-.7,-.45,.55,.72,[220,220,210],7);lightBox(g,P,2.1,2.16,.45,.7,.55,.72,[220,220,210],7);
    lightBox(g,P,-2.16,-2.1,-.72,-.5,.58,.74,[120,30,24],8);lightBox(g,P,-2.16,-2.1,.5,.72,.58,.74,[120,30,24],8);
    CARM.push({n:g.p.length/3,buf:{p:up(new Float32Array(g.p)),n:up(new Float32Array(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))}})}}
function roadsFrom(D){for(const [c,w,surf,cls,f] of D.R){if(cls>1)continue;const p=unflat(f);const cu=[0];for(let i=1;i<p.length;i++)cu.push(cu[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));const len=cu[cu.length-1];if(len<120)continue;
    const n=Math.max(1,Math.round(len/90));const cars=[];for(let k=0;k<n;k++){const h=(k*2654435761+len*97)>>>0;cars.push({o:(h%1000)/1000*len,dir:(h>>>3)&1?1:-1,v:9+((h>>>5)%60)/10,col:(h>>>9)%8})}
    let mx=0,my=0;for(const q of p){mx+=q[0];my+=q[1]}ROADS.push({p,cu,len,w:w/10,cars,mx:mx/p.length,my:my/p.length})}}
function roadAt(R,s){s=((s%R.len)+R.len)%R.len;let i=1;while(i<R.cu.length-1&&R.cu[i]<s)i++;const a=R.p[i-1],b=R.p[i],k=(s-R.cu[i-1])/((R.cu[i]-R.cu[i-1])||1);return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,Math.atan2(b[1]-a[1],b[0]-a[0])]}
/* ---------- the oncoming tram on the other track ---------- */
let ONC=null;
function oncomingMesh(){const g=G();const P=(f,r,h)=>[f,h,r];
  box(g,P,-7.5,7.5,-1.25,1.25,.35,3.1,[196,44,48]);box(g,P,-7.5,7.5,-1.26,1.26,1.3,2.35,[232,220,190]);box(g,P,-7.3,7.3,-1.1,1.1,3.1,3.35,[160,160,160]);
  box(g,P,-1.5,1.5,-.2,.2,3.35,4.4,[60,60,62]);
  lightBox(g,P,7.5,7.56,-.8,-.5,1.0,1.25,[230,230,215],7);lightBox(g,P,7.5,7.56,.5,.8,1.0,1.25,[230,230,215],7);lightBox(g,P,-7.56,-7.5,-.8,-.5,1.0,1.2,[130,30,24],8);lightBox(g,P,-7.56,-7.5,.5,.8,1.0,1.2,[130,30,24],8);
  for(let k=-6;k<=6;k+=2.4)lightBox(g,P,k-1,k+1,-1.27,1.27,1.55,2.15,[90,100,110],6);
  ONC={n:g.p.length/3,buf:{p:up(new Float32Array(g.p)),n:up(new Float32Array(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))}}}
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
function bind(b){gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.vertexAttribPointer(A.p,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.vertexAttribPointer(A.n,3,gl.FLOAT,false,0,0);
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
  /* the horizon in clip space: project a far point straight ahead */
  const dv=[Math.cos(cam.a),0,-Math.sin(cam.a),0];const cy_=MV[1]*dv[0]+MV[5]*dv[1]+MV[9]*dv[2],cw_=MV[3]*dv[0]+MV[7]*dv[1]+MV[11]*dv[2];gl.uniform1f(SKH,cy_/cw_);gl.uniform3fv(SKA,LL.sa);gl.uniform3fv(SKB,LL.sb);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.disableVertexAttribArray(SKP);
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
  if(ONC){const per=1600,ph=(t*7+s*1.0)%per;const so=s+260-ph*1.0;if(so>s-40&&so<s+700){const [ox,oy,oa]=trackAt(so);const rx=Math.sin(oa)*3.3,ry=-Math.cos(oa)*3.3;
    gl.uniformMatrix4fv(U.MO,false,new Float32Array(trs(ID,ox-rx,HT(ox-rx,oy-ry),-(oy-ry),oa)));bind(ONC.buf);gl.drawArrays(gl.TRIANGLES,0,ONC.n);gl.uniformMatrix4fv(U.MO,false,ID)}}
  /* cars within 450 m */
  for(const R of ROADS){if(Math.abs(R.mx-E[0])>900||Math.abs(R.my+E[2])>900)continue;for(const c of R.cars){const ss=c.o+c.dir*c.v*t;const [cx,cy,ca]=roadAt(R,ss);
    if(Math.abs(cx-E[0])>450||Math.abs(cy+E[2])>450)continue;const ang=c.dir>0?ca:ca+Math.PI;const lo=Math.max(1.6,R.w/4);const rx=Math.sin(ang)*lo,ry=-Math.cos(ang)*lo;
    gl.uniformMatrix4fv(U.MO,false,new Float32Array(trs(ID,cx+rx,HT(cx+rx,cy+ry)+.1,-(cy+ry),ang)));const m=CARM[c.col];bind(m.buf);gl.drawArrays(gl.TRIANGLES,0,m.n)}}
  gl.uniformMatrix4fv(U.MO,false,ID);
  gl.uniform1f(U.MODE,1);for(const C of vis)if(C.tree.buf){bind(C.tree.buf);gl.drawArrays(gl.TRIANGLES,0,C.tree.n_)}gl.uniform1f(U.MODE,0);
  /* wires */
  gl.disableVertexAttribArray(A.n);gl.disableVertexAttribArray(A.c);gl.disableVertexAttribArray(A.f);gl.vertexAttrib3f(A.n,0,1,0);gl.vertexAttrib4f(A.c,.13,.13,.14,1);gl.vertexAttrib3f(A.f,0,0,0);gl.vertexAttrib3f(A.f,0,0,0);
  for(const C of vis)if(C.wbuf){gl.bindBuffer(gl.ARRAY_BUFFER,C.wbuf);gl.vertexAttribPointer(A.p,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.LINES,0,C.wn)}
  for(const k in A)gl.disableVertexAttribArray(A[k])}
let GB=null,MVc=null;function ground(E){if(!GB){const g=G();const R=7000;quad(g,[-R,-.02,-R],[-R,-.02,R],[R,-.02,R],[R,-.02,-R],[0,1,0],[112,116,86]);GB={n:6,buf:{p:up(new Float32Array(g.p)),n:up(new Float32Array(g.n)),c:up(new Uint8Array(g.c)),f:up(new Float32Array(g.f))}}}
  bind(GB.buf);gl.drawArrays(gl.TRIANGLES,0,6)}
/* ---------- load ---------- */
async function load(url){const tu=new URL('photos/terrain/tram1.json',document.baseURI).href;
  const [D,Tt]=await Promise.all([fetch(url).then(r=>{if(!r.ok)throw new Error('tram3d '+r.status);return r.json()}),fetch(tu).then(r=>r.ok?r.json():null).catch(()=>null)]);
  if(Tt&&Tt.h&&Tt.nx){TER=Tt;TER.z0=0;const T0=unflat(D.T);TER.z0=HT(T0[0][0],T0[0][1])}chSize=D.CH;build(D);oncomingMesh();carMeshes();roadsFrom(D);ready=true;return true}
return{load,frame,resize,get ready(){return ready},stops:()=>STOPS,length:()=>TL,terrain:()=>!!TER,setLight:n=>{LIGHT=n;LT=Infinity},phase:()=>{const P=lightNow();return P.night>.8?'night':P.night>.2?'dusk':'day'}};
};
