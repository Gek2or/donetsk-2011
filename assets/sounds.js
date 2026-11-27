/* Donetsk 2011 · sound bank (v7.43): modern drum kits, one-shot samples and instruments for the studio and the phone.
   Everything is generated here in the browser from oscillators, noise and filters: there are no recordings and no audio files.
   "Samples" are one-shots that are rendered once into a buffer (OfflineAudioContext) and then played like a sampler would.
   The same builder functions run on a live or on an offline context, so the bank can be tested without speakers. */
(function(){
'use strict';
var NBF=new WeakMap();
function nb(X){var b=NBF.get(X);if(!b){var n=Math.floor(X.sampleRate*2);b=X.createBuffer(1,n,X.sampleRate);var d=b.getChannelData(0),s=48271;for(var i=0;i<n;i++){s=(s*1664525+1013904223)>>>0;d[i]=s/2147483648-1}NBF.set(X,b)}return b}
var mf=function(m){return 440*Math.pow(2,(m-69)/12)};
var G=function(X,v){var g=X.createGain();g.gain.value=v===undefined?1:v;return g};
var F=function(X,ty,f,q,gn){var b=X.createBiquadFilter();b.type=ty;b.frequency.value=f;if(q!==undefined)b.Q.value=q;if(gn!==undefined)b.gain.value=gn;return b};
function C(){var n=arguments;for(var i=0;i<n.length-1;i++)n[i].connect(n[i+1]);return n[0]}
function O(X,ty,f,t,t1,out,det){var o=X.createOscillator();o.type=ty;o.frequency.setValueAtTime(f,t);if(det)o.detune.value=det;o.connect(out);o.start(t);o.stop(t1);return o}
function N(X,t,t1,out,off){var s=X.createBufferSource();s.buffer=nb(X);s.loop=true;s.connect(out);s.start(t,off===undefined?(Math.abs(t)*7.31+.11)%1.5:off);s.stop(t1);return s}
var CV={};
function sat(X,k){var key='s'+k,c=CV[key];if(!c){c=new Float32Array(1024);var th=Math.tanh(k);for(var i=0;i<1024;i++){var x=i/1023*2-1;c[i]=Math.tanh(k*x)/th}CV[key]=c}var s=X.createWaveShaper();s.curve=c;return s}
function crush(X,b){var key='c'+b,c=CV[key];if(!c){c=new Float32Array(4096);var L=Math.pow(2,b-1);for(var i=0;i<4096;i++){var x=i/4095*2-1;c[i]=Math.round(x*L)/L}CV[key]=c}var s=X.createWaveShaper();s.curve=c;return s}
/* percussive envelope: fast attack, exponential fall with time constant tau; sustained envelope: attack, hold, release */
function pt(p,t,pk,tau,a){a=a||.002;p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(pk,t+a);p.setTargetAtTime(.0001,t+a,tau)}
function ad(p,t,a,pk,hold,rel){hold=Math.max(0,hold);p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(pk,t+a);p.setValueAtTime(pk,t+a+hold);p.setTargetAtTime(.0001,t+a+hold,rel/3.5)}

/* ---------------------------------------------------------------- drums: parametric builders (X, out, t) */
function pre(X,out,p){var tail=out;if(p.crush)tail=C(crush(X,p.crush),tail);if(p.lp)tail=C(F(X,'lowpass',p.lp,.7),tail);return tail}
var KICK=function(p){return function(X,out,t){var tail=pre(X,out,p),g=G(X,0),s=sat(X,p.sat||1.5);C(s,g,tail);
  var o=O(X,p.type||'sine',p.f0,t,t+p.dec*1.4+.2,s);o.frequency.exponentialRampToValueAtTime(p.f1,t+p.td);pt(g.gain,t,.9,p.dec/4,.002);
  if(p.click){var c=G(X,0);N(X,t,t+.03,C(F(X,'highpass',2200),c,tail));pt(c.gain,t,p.click,.006,.001)}}};
var SNARE=function(p){return function(X,out,t){var tail=pre(X,out,p);
  (p.t||[]).forEach(function(f,i){var g=G(X,0),o=O(X,'sine',f,t,t+.35,C(g,tail));o.frequency.exponentialRampToValueAtTime(f*.82,t+.06);pt(g.gain,t,i?.26:.5,p.td/4,.001)});
  var n=G(X,0);N(X,t,t+p.nd*1.8+.1,C(F(X,'bandpass',p.nb,p.nq||.7),F(X,'highpass',p.hp,.7),n,tail));pt(n.gain,t,p.ng,p.nd/4,.001);
  if(p.snap){var s=G(X,0);N(X,t,t+.08,C(F(X,'highpass',7000),s,tail));pt(s.gain,t,p.snap,.02,.001)}}};
var CLAP=function(p){return function(X,out,t){var tail=pre(X,out,p),bp=F(X,'bandpass',p.f,p.q||.9),hp=F(X,'highpass',p.hp||600,.7),g=G(X,0);C(bp,hp,g,tail);N(X,t,t+p.tail+.2,bp);
  var q=g.gain;q.setValueAtTime(.0001,t);p.b.forEach(function(o){q.setValueAtTime(.85,t+o);q.exponentialRampToValueAtTime(.12,t+o+.009)});
  var l=p.b[p.b.length-1]||0;q.setValueAtTime(.7,t+l+.012);q.exponentialRampToValueAtTime(.0001,t+p.tail)}};
var M8=[263,400,421,474,587,845];
var HAT=function(p){return function(X,out,t){var tail=pre(X,out,p),g=G(X,0),bp=F(X,'bandpass',p.bp,.9),hp=F(X,'highpass',p.hp,.7),e=t+p.dec*2+.08;C(bp,hp,g,tail);
  if(!p.noise)M8.forEach(function(f){O(X,'square',f*(p.sc||1),t,e,bp)});
  var a=G(X,0);N(X,t,e,C(F(X,'highpass',p.nhp||9000),a,tail));pt(g.gain,t,.5,p.dec/3.2,.001);pt(a.gain,t,p.noise?.7:.3,p.dec/3.4,.001)}};

var SMP={};
function def(id,len,fn,o){o=o||{};SMP[id]={id:id,len:len,fn:fn,pk:o.pk||.8,cat:o.cat||'',buf:null,p:null}}
var KD={ // kits: lane -> sample id
 '808':{kick:'k_808',snare:'s_808',clap:'c_808',hat:'h_808',oh:'o_808'},
 '909':{kick:'k_909',snare:'s_909',clap:'c_909',hat:'h_909',oh:'o_909'},
 'trap':{kick:'k_trap',snare:'s_trap',clap:'c_trap',hat:'h_trap',oh:'o_trap'},
 'lofi':{kick:'k_lofi',snare:'s_lofi',clap:'c_lofi',hat:'h_lofi',oh:'o_lofi'},
 'chip':{kick:'k_chip',snare:'s_chip',clap:'c_chip',hat:'h_chip',oh:'o_chip'},
 'classic':null};
var KP={ // kick params
 '808':{f0:130,f1:42,td:.07,dec:.95,sat:2.4,click:.12},'909':{f0:190,f1:50,td:.05,dec:.38,sat:1.8,click:.3},
 'trap':{f0:100,f1:36,td:.11,dec:1.4,sat:3.2,click:.08},'lofi':{f0:125,f1:52,td:.05,dec:.3,sat:1.3,lp:2200,crush:7,click:.05},
 'chip':{type:'square',f0:300,f1:55,td:.05,dec:.2,sat:1,lp:5000}};
var SP={ // snare params
 '808':{t:[160,300],td:.12,nb:2400,hp:800,nd:.25,ng:.55},'909':{t:[185,330],td:.1,nb:3200,nq:.6,hp:1200,nd:.22,ng:.5,snap:.15},
 'trap':{t:[215],td:.07,nb:3600,hp:2400,nd:.17,ng:.55,snap:.2},'lofi':{t:[150],td:.1,nb:2000,hp:700,nd:.24,ng:.5,lp:4200,crush:6},
 'chip':{t:[210],td:.04,nb:4000,hp:1500,nd:.13,ng:.7,crush:5}};
var CP={ // clap params
 '808':{f:1000,b:[0,.012,.025],tail:.2},'909':{f:1250,b:[0,.011,.022,.033],tail:.24},
 'trap':{f:1400,hp:800,b:[0,.009,.019,.03,.043],tail:.4},'lofi':{f:900,b:[0,.014,.03],tail:.28,lp:3500,crush:7},
 'chip':{f:2200,hp:1500,b:[0],tail:.1,crush:5}};
var HP={ // closed and open hat params
 '808':[{bp:9000,hp:8000,dec:.045},{bp:9000,hp:7500,dec:.32}],'909':[{bp:10000,hp:7000,dec:.06,sc:1.05},{bp:10000,hp:6500,dec:.4,sc:1.05}],
 'trap':[{bp:11000,hp:9500,dec:.032,sc:1.2,nhp:10500},{bp:11000,hp:9000,dec:.22,sc:1.2,nhp:10000}],
 'lofi':[{bp:7000,hp:5000,dec:.07,lp:7500,crush:7,nhp:6500},{bp:7000,hp:4500,dec:.3,lp:7500,crush:7,nhp:6000}],
 'chip':[{noise:1,bp:8000,hp:6000,dec:.035,nhp:5500,crush:5},{noise:1,bp:8000,hp:5500,dec:.22,nhp:5000,crush:5}]};
Object.keys(KP).forEach(function(k){var cat='kit';
  def('k_'+k,KP[k].dec*1.4+.25,KICK(KP[k]),{cat:cat,pk:.95});
  def('s_'+k,Math.max(SP[k].td,SP[k].nd)*1.9+.15,SNARE(SP[k]),{cat:cat,pk:.8});
  def('c_'+k,CP[k].tail+.25,CLAP(CP[k]),{cat:cat,pk:.78});
  def('h_'+k,HP[k][0].dec*2+.2,HAT(HP[k][0]),{cat:cat,pk:.55});
  def('o_'+k,HP[k][1].dec*2+.25,HAT(HP[k][1]),{cat:cat,pk:.5})});

/* percussion, city sounds, effects, voice */
def('tram',2,function(X,out,t){[0,.12].forEach(function(o,k){var a=k?.7:1;[[1240,1],[2985,.45],[3870,.28],[5260,.12]].forEach(function(p){var g=G(X,0);O(X,'sine',p[0],t+o,t+o+1.8,g);C(g,out);pt(g.gain,t+o,.3*a*p[1],.38,.002)});
  var n=G(X,0);N(X,t+o,t+o+.04,C(F(X,'bandpass',3000,2),n,out));pt(n.gain,t+o,.3*a,.01,.001)})},{cat:'cty',pk:.7});
def('pip',.2,function(X,out,t){var g=G(X,0),p=g.gain;O(X,'sine',1000,t,t+.15,g);C(g,out);p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(.7,t+.004);p.setValueAtTime(.7,t+.096);p.linearRampToValueAtTime(.0001,t+.1)},{cat:'cty',pk:.45});
def('siren',1.7,function(X,out,t){var g=G(X,0),lp=F(X,'lowpass',3200,.8),o=O(X,'sawtooth',950,t,t+1.65,lp),l=O(X,'sine',1.1,t,t+1.65,C(G(X,330),o.frequency));C(lp,g,out);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.6,t+.15);g.gain.setValueAtTime(.6,t+1.35);g.gain.linearRampToValueAtTime(.0001,t+1.65)},{cat:'cty',pk:.45});
def('cow',.7,function(X,out,t){var g=G(X,0),bp=F(X,'bandpass',830,1.1);C(bp,g,out);[562,845].forEach(function(f){O(X,'square',f,t,t+.65,bp)});
  var q=g.gain;q.setValueAtTime(.0001,t);q.linearRampToValueAtTime(.8,t+.002);q.exponentialRampToValueAtTime(.25,t+.03);q.setTargetAtTime(.0001,t+.03,.07)},{cat:'prc',pk:.6});
def('rim',.16,function(X,out,t){var g=G(X,0),g2=G(X,0),n=G(X,0);O(X,'sine',1700,t,t+.12,g);O(X,'sine',480,t,t+.12,g2);C(g,out);C(g2,out);pt(g.gain,t,.6,.012,.001);pt(g2.gain,t,.5,.02,.001);
  N(X,t,t+.06,C(F(X,'bandpass',3800,1.4),n,out));pt(n.gain,t,.5,.01,.001)},{cat:'prc',pk:.75});
def('snap',.22,function(X,out,t){var n=G(X,0),n2=G(X,0),g=G(X,0),o=O(X,'sine',900,t,t+.06,g);o.frequency.exponentialRampToValueAtTime(1900,t+.025);C(g,out);pt(g.gain,t,.3,.012,.001);
  N(X,t,t+.1,C(F(X,'bandpass',2300,2),n,out));pt(n.gain,t,.9,.012,.001);N(X,t+.004,t+.2,C(F(X,'bandpass',1000,1),n2,out));pt(n2.gain,t+.004,.35,.03,.002)},{cat:'prc',pk:.75});
def('conga',.5,function(X,out,t){var g=G(X,0),o=O(X,'sine',360,t,t+.4,g),h=G(X,0),n=G(X,0);o.frequency.exponentialRampToValueAtTime(285,t+.06);C(g,out);pt(g.gain,t,.8,.09,.002);
  O(X,'sine',710,t,t+.2,h);C(h,out);pt(h.gain,t,.18,.04,.001);N(X,t,t+.05,C(F(X,'bandpass',1900,1.2),n,out));pt(n.gain,t,.4,.01,.001)},{cat:'prc',pk:.8});
def('tom',.7,function(X,out,t){var g=G(X,0),o=O(X,'sine',175,t,t+.6,g),n=G(X,0);o.frequency.exponentialRampToValueAtTime(82,t+.14);C(g,sat(X,1.4),out);pt(g.gain,t,.9,.17,.002);
  N(X,t,t+.04,C(F(X,'bandpass',1800,1),n,out));pt(n.gain,t,.25,.01,.001)},{cat:'prc',pk:.85});
def('clave',.2,function(X,out,t){[[2400,.9],[1850,.6]].forEach(function(p){var h=F(X,'bandpass',2300,5),g=G(X,0);O(X,'sine',p[0],t,t+.15,h);C(h,g,out);pt(g.gain,t,p[1],.03,.001)})},{cat:'prc',pk:.7});
def('tamb',.5,function(X,out,t){var g=G(X,0),m=G(X,0);N(X,t,t+.4,C(F(X,'highpass',6500,.7),g,out));pt(g.gain,t,.7,.07,.004);
  var bp=F(X,'bandpass',7500,1.2);[5100,6300,7400,8200].forEach(function(f){O(X,'square',f,t,t+.4,bp)});C(bp,m,out);pt(m.gain,t,.25,.1,.004)},{cat:'prc',pk:.6});
def('shk',.3,function(X,out,t){var g=G(X,0);N(X,t,t+.28,C(F(X,'bandpass',6500,.8),g,out));g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.8,t+.035);g.gain.setTargetAtTime(.0001,t+.035,.05)},{cat:'prc',pk:.5});
def('zap',.5,function(X,out,t){var g=G(X,0),lp=F(X,'lowpass',4000,2),o=O(X,'sawtooth',2600,t,t+.45,lp);o.frequency.exponentialRampToValueAtTime(110,t+.3);C(lp,g,out);pt(g.gain,t,.8,.1,.003)},{cat:'fxs',pk:.7});
def('laser',.55,function(X,out,t){[0,.1,.2].forEach(function(d,k){var g=G(X,0),lp=F(X,'lowpass',6000,1),o=O(X,'square',7000,t+d,t+d+.2,lp);o.frequency.exponentialRampToValueAtTime(350,t+d+.14);C(lp,g,out);pt(g.gain,t+d,.5/(k+1),.04,.002)})},{cat:'fxs',pk:.6});
def('riser',1.8,function(X,out,t){var g=G(X,0),bp=F(X,'bandpass',250,2.5);C(bp,g,out);N(X,t,t+1.8,bp);bp.frequency.setValueAtTime(250,t);bp.frequency.exponentialRampToValueAtTime(9000,t+1.7);
  var h=G(X,0),o=O(X,'sawtooth',180,t,t+1.8,F(X,'lowpass',1800,.6));o.frequency.exponentialRampToValueAtTime(1500,t+1.7);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12,t+.3);g.gain.exponentialRampToValueAtTime(.9,t+1.65);g.gain.linearRampToValueAtTime(.0001,t+1.75)},{cat:'fxs',pk:.6});
def('down',1.5,function(X,out,t){var g=G(X,0),bp=F(X,'bandpass',9000,2.2);C(bp,g,out);N(X,t,t+1.5,bp);bp.frequency.setValueAtTime(9000,t);bp.frequency.exponentialRampToValueAtTime(220,t+1.4);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.9,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+1.45)},{cat:'fxs',pk:.6});
def('impact',2.1,function(X,out,t){var g=G(X,0),o=O(X,'sine',62,t,t+1.9,C(sat(X,2),g,out)),n=G(X,0),n2=G(X,0);o.frequency.exponentialRampToValueAtTime(27,t+1.3);pt(g.gain,t,.95,.5,.003);
  N(X,t,t+1.2,C(F(X,'lowpass',500,.7),n,out));pt(n.gain,t,.6,.28,.003);N(X,t,t+.2,C(F(X,'highpass',3000),n2,out));pt(n2.gain,t,.3,.06,.001)},{cat:'fxs',pk:.9});
def('sub',1.5,function(X,out,t){var g=G(X,0),o=O(X,'sine',110,t,t+1.4,C(sat(X,1.8),g,out));o.frequency.exponentialRampToValueAtTime(29,t+.9);pt(g.gain,t,.95,.32,.004)},{cat:'fxs',pk:.9});
def('scr',.55,function(X,out,t){var g=G(X,0),bp=F(X,'bandpass',1200,6);C(bp,g,out);N(X,t,t+.5,bp);var o=O(X,'sawtooth',300,t,t+.5,bp);o.frequency.exponentialRampToValueAtTime(900,t+.3);
  var f=bp.frequency;f.setValueAtTime(700,t);f.exponentialRampToValueAtTime(3200,t+.09);f.exponentialRampToValueAtTime(500,t+.2);f.exponentialRampToValueAtTime(2600,t+.28);f.exponentialRampToValueAtTime(400,t+.42);
  var q=g.gain;q.setValueAtTime(.0001,t);q.linearRampToValueAtTime(.8,t+.01);q.setValueAtTime(.8,t+.09);q.linearRampToValueAtTime(.3,t+.11);q.linearRampToValueAtTime(.8,t+.13);q.setValueAtTime(.8,t+.26);q.linearRampToValueAtTime(.25,t+.3);q.linearRampToValueAtTime(.7,t+.32);q.exponentialRampToValueAtTime(.0001,t+.46)},{cat:'fxs',pk:.6});
def('vin',1.5,function(X,out,t){var g=G(X,0),sh=X.createWaveShaper(),c=new Float32Array(2048);for(var i=0;i<2048;i++){var x=i/2047*2-1;c[i]=Math.abs(x)>.9975?x:0}sh.curve=c;
  C(sh,F(X,'highpass',1800,.7),g,out);N(X,t,t+1.45,sh);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.9,t+.03);g.gain.setValueAtTime(.9,t+1.1);g.gain.linearRampToValueAtTime(.0001,t+1.4);
  var r=G(X,0);N(X,t,t+1.45,C(F(X,'lowpass',300,.6),r,out));r.gain.setValueAtTime(.0001,t);r.gain.linearRampToValueAtTime(.2,t+.05);r.gain.linearRampToValueAtTime(.0001,t+1.4)},{cat:'fxs',pk:.55});
def('hey',.5,function(X,out,t){var g=G(X,0),s=G(X,.8),n=G(X,0),o=O(X,'sawtooth',210,t,t+.45,s),f1=F(X,'bandpass',620,7),f2=F(X,'bandpass',1500,7),f3=F(X,'bandpass',2700,8);
  o.frequency.exponentialRampToValueAtTime(165,t+.35);C(s,f1,G(X,1),g);C(s,f2,G(X,.7),g);C(s,f3,G(X,.35),g);C(g,out);
  f1.frequency.setValueAtTime(620,t);f1.frequency.linearRampToValueAtTime(380,t+.3);f2.frequency.setValueAtTime(1500,t);f2.frequency.linearRampToValueAtTime(2200,t+.3);
  N(X,t,t+.05,C(F(X,'bandpass',1800,1.5),n,out));pt(n.gain,t,.5,.015,.001);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(1.6,t+.015);g.gain.setValueAtTime(1.3,t+.14);g.gain.setTargetAtTime(.0001,t+.16,.07)},{cat:'vox',pk:.7});
def('horn',1.2,function(X,out,t){var g=G(X,0),lp=F(X,'lowpass',2800,.8),pk=F(X,'peaking',1300,1.2,6);C(lp,pk,g,out);
  [415,523,622].forEach(function(f){[-8,8].forEach(function(d){O(X,'sawtooth',f,t,t+1.1,lp,d)})});var q=g.gain;q.setValueAtTime(.0001,t);
  [[0,.3],[.36,.3],[.72,.38]].forEach(function(b){q.setValueAtTime(.0001,t+b[0]);q.linearRampToValueAtTime(.4,t+b[0]+.015);q.setValueAtTime(.4,t+b[0]+b[1]);q.linearRampToValueAtTime(.0001,t+b[0]+b[1]+.05)})},{cat:'vox',pk:.65});
def('hroll',.7,function(X,out,t){var h=HAT(HP.trap[0]);[0,.07,.14,.2,.25,.29,.32,.345].forEach(function(d,k){var g=G(X,.4+k*.08);C(g,out);h(X,g,t+d)})},{cat:'vox',pk:.55});

/* ---------------------------------------------------------------- instruments: (X, out, midi, t, dur, vel, o) */
var INS={};
function add(id,cat,fo,fn){INS[id]={id:id,cat:cat,fo:fo,fn:fn}}
function pulseW(X,d){var n=48,re=new Float32Array(n),im=new Float32Array(n);for(var k=1;k<n;k++)re[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*d);return X.createPeriodicWave(re,im)}
var SUBV=function(p){return function(X,out,m,t,dur,v,o){
  var f=mf(m),hold=Math.min(dur,p.cap||99),end=t+hold+(p.rel||.1)+.1,g=G(X,0),lp=F(X,'lowpass',p.f0,p.q||.7),mix=G(X,1),post=p.hp?F(X,'highpass',p.hp,.7):null;
  if(post)C(mix,lp,post,g,out);else C(mix,lp,g,out);
  lp.frequency.setValueAtTime(p.f0,t);if(p.f1!==p.f0)lp.frequency.setTargetAtTime(p.f1,t,p.ft||.1);
  var oscs=[];
  p.w.forEach(function(w,i){var og=G(X,w[2]===undefined?1:w[2]),node=og,fr=f*Math.pow(2,w[3]||0),os;
    if(p.spread&&X.createStereoPanner){var pn=X.createStereoPanner();pn.pan.value=(i/Math.max(1,p.w.length-1)*2-1)*p.spread;C(og,pn,mix)}else C(og,mix);
    if(p.pulse){os=X.createOscillator();os.setPeriodicWave(pulseW(X,p.pulse));os.frequency.setValueAtTime(fr,t);os.detune.value=w[1]||0;os.connect(og);os.start(t);os.stop(end)}else os=O(X,w[0],fr,t,end,og,w[1]);oscs.push(os)});
  if(p.vib){var lg=G(X,0);lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(p.vib,t+.28);oscs.forEach(function(os){lg.connect(os.detune)});O(X,'sine',5.2,t,end,lg)}
  if(p.lfo){var r=typeof p.lfo.r==='function'?p.lfo.r(o||{}):p.lfo.r;O(X,'sine',r,t,end,C(G(X,p.lfo.d),lp.detune))}
  if(p.dec)pt(g.gain,t,p.pk*v,p.dec,p.a||.003);else ad(g.gain,t,p.a||.005,p.pk*v,hold-(p.a||.005),p.rel||.1)}};
var FMV=function(p){return function(X,out,m,t,dur,v,o){
  var f=mf(m),perc=p.perc?(typeof p.perc==='function'?p.perc(dur):p.perc):0,end=t+(perc?perc+.1:dur+(p.rel||.1)+.12),g=G(X,0),lp=F(X,'lowpass',p.lp||7000,.6);C(g,lp,out);
  (p.dt2?[0,p.dt2]:[0]).forEach(function(dt){var c=O(X,'sine',f,t,end,g,dt),md=X.createOscillator(),mg=G(X,0);md.frequency.value=f*p.mr;
    mg.gain.setValueAtTime(f*p.mr*p.i0,t);mg.gain.setTargetAtTime(f*p.mr*p.i1,t+.001,p.tau||.15);C(md,mg);mg.connect(c.frequency);md.start(t);md.stop(end);
    if(p.vib){var lg=G(X,0);lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(p.vib,t+.3);O(X,'sine',5.4,t,end,lg);lg.connect(c.detune)}});
  if(perc)pt(g.gain,t,p.pk*v,perc/4.5,.003);else ad(g.gain,t,p.a||.005,p.pk*v,dur-(p.a||.005),p.rel||.1)}};
var MODV=function(parts,pk,ck){return function(X,out,m,t,dur,v){var f=mf(m),g=G(X,1);C(g,out);
  parts.forEach(function(r){if(f*r[0]>15000)return;var pg=G(X,0);O(X,'sine',f*r[0],t,t+r[2]*6+.1,pg);C(pg,g);pt(pg.gain,t,r[1]*pk*v,r[2],.001)});
  if(ck){var n=G(X,0);N(X,t,t+.03,C(F(X,'bandpass',Math.min(6000,f*5),1.2),n,g));pt(n.gain,t,ck*v,.006,.001)}}};

/* classic voices of the 2006 ringtone chip live in seq.js; the studio reaches them through D11A */
function classic(kind,k){return function(X,out,m,t,dur,v){var A=window.D11A;if(A)A[kind](k,m,t,dur,v,out)}}
add('cl_saw','cls','ch ld',classic('lead','saw'));add('cl_sq','cls','ch ld',classic('lead','sq'));add('cl_reed','cls','ch ld',classic('lead','reed'));
add('cl_keys','cls','ch ld',classic('lead','keys'));add('cl_pluck','cls','ch ld',classic('lead','pluck'));
add('cb_saw','cls','bs',classic('bass','saw'));add('cb_sub','cls','bs',classic('bass','sub'));add('cb_pluck','cls','bs',classic('bass','pluck'));add('cb_sq','cls','bs',classic('bass','sq'));
/* bass */
add('b808','bas','bs',function(X,out,m,t,dur,v){var f=mf(m),g=G(X,0),s=sat(X,2.4),len=Math.max(.5,Math.min(1.3,dur*1.5+.2)),o=O(X,'sine',f*1.9,t,t+len+.2,s),c=G(X,0);
  o.frequency.exponentialRampToValueAtTime(f,t+.035);C(s,g,out);pt(g.gain,t,.6*v,len/4,.004);N(X,t,t+.025,C(F(X,'lowpass',900),c,out));pt(c.gain,t,.14*v,.012,.001)});
add('reese','bas','bs',SUBV({w:[['sawtooth',-14],['sawtooth',14],['sawtooth',0,.7],['sine',0,.6,-1]],f0:760,f1:560,ft:1.4,q:1.4,a:.012,rel:.1,pk:.11,hp:38,lfo:{r:.4,d:200}}));
add('acid','bas','bs',SUBV({w:[['sawtooth',0]],f0:2700,f1:210,ft:.11,q:13,a:.003,rel:.05,pk:.2,cap:.5}));
add('wobble','bas','bs',SUBV({w:[['sawtooth',-9],['sawtooth',9],['square',0,.6,-1]],f0:1500,f1:1500,q:7,a:.008,rel:.12,pk:.11,hp:35,lfo:{r:function(o){return 1/Math.max(.05,(o.sd||.12)*3)},d:1700}}));
add('moog','bas','bs',SUBV({w:[['sawtooth',0],['square',0,.8,-1]],f0:2300,f1:260,ft:.14,q:6,a:.004,rel:.07,pk:.18}));
add('fmbass','bas','bs',FMV({mr:1,i0:2.6,i1:.4,tau:.1,a:.004,rel:.07,pk:.3,lp:3500}));
/* synths */
add('supersaw','syn','ch ld',SUBV({w:[['sawtooth',-22],['sawtooth',-14],['sawtooth',-6],['sawtooth',0],['sawtooth',6],['sawtooth',14],['sawtooth',22]],f0:7500,f1:3200,ft:.3,q:.5,a:.006,rel:.2,pk:.045,spread:.8,hp:170}));
add('stab','syn','ch ld',SUBV({w:[['sawtooth',-9],['sawtooth',0],['sawtooth',9]],f0:7500,f1:650,ft:.07,q:2.5,a:.004,rel:.09,pk:.1,cap:.2}));
add('brass','syn','ch ld',SUBV({w:[['sawtooth',0],['sawtooth',6]],f0:600,f1:3800,ft:.06,q:1,a:.04,rel:.09,pk:.16}));
add('pulse','syn','bs ch ld',SUBV({pulse:.25,w:[['x',0],['x',7,.6]],f0:6500,f1:6500,q:.5,a:.002,rel:.04,pk:.12,vib:12}));
add('edmpluck','syn','ch ld',SUBV({w:[['sawtooth',-6],['sawtooth',6],['square',0,.6]],f0:6500,f1:700,ft:.06,q:1.2,dec:.22,a:.002,pk:.09,hp:120,rel:.05}));
/* keys */
add('epiano','key','ch ld',FMV({mr:1,i0:1.6,i1:.12,tau:.2,perc:function(d){return Math.max(.8,d*1.4)},pk:.2,dt2:3,lp:6500}));
add('vibes','key','ch ld',MODV([[1,1,1.7],[4,.3,.55],[10,.1,.18]],.28,.05));
add('organ','key','ch ld',function(X,out,m,t,dur,v){var f=mf(m),g=G(X,0),am=G(X,1),end=t+dur+.2;C(g,am,out);
  [[.5,.45],[1,.8],[2,.6],[3,.35],[4,.22],[6,.14]].forEach(function(p){var og=G(X,p[1]);O(X,'sine',f*p[0],t,end,og);C(og,g)});
  var l=O(X,'sine',6.2,t,end,C(G(X,.12),am.gain));ad(g.gain,t,.008,.14*v,dur-.008,.05);var n=G(X,0);N(X,t,t+.02,C(F(X,'highpass',2500),n,out));pt(n.gain,t,.03*v,.005,.001)});
add('piano','key','ch ld',function(X,out,m,t,dur,v){var f=mf(m),g=G(X,1);C(g,out);
  for(var k=1;k<=9;k++){var fr=f*k*Math.sqrt(1+.0004*k*k);if(fr>14000)break;var tau=Math.max(.12,Math.min(1.7,1.5/(1+.5*k)*Math.pow(130/f,.3))),pg=G(X,0);O(X,'sine',fr,t,t+tau*6+.1,pg);C(pg,g);pt(pg.gain,t,.22*v/Math.pow(k,1.1),tau,.002)}
  var n=G(X,0);N(X,t,t+.03,C(F(X,'bandpass',Math.min(5000,f*4),.9),n,g));pt(n.gain,t,.05*v,.008,.001)});
/* plucked and struck */
add('marimba','plk','ch ld',MODV([[1,1,.55],[3.93,.38,.14],[9.2,.12,.05]],.34,.07));
add('kalimba','plk','ch ld',MODV([[1,1,1.1],[5.4,.28,.25],[12,.08,.08]],.3,.05));
add('bell','plk','ch ld',FMV({mr:3.5,i0:3.2,i1:.4,tau:.4,perc:1.9,pk:.3,lp:9000}));
var KSB={};
function ksbuf(X,m,damp,bright,sec){var key=m+'_'+damp+'_'+bright,b=KSB[key];if(b&&b.sampleRate===X.sampleRate)return b;var sr=X.sampleRate,f=mf(m),n=Math.max(2,Math.round(sr/f)),len=Math.floor(sr*sec),line=new Float32Array(n),s=m*7919+13;
  for(var i=0;i<n;i++){s=(s*1664525+1013904223)>>>0;line[i]=s/2147483648-1}for(i=1;i<n;i++)line[i]=line[i]*bright+line[i-1]*(1-bright);
  b=X.createBuffer(1,len,sr);var d=b.getChannelData(0),p=0;for(i=0;i<len;i++){var a=line[p],c=line[(p+1)%n],y=(a+c)*.5*damp;line[p]=y;d[i]=a;p=(p+1)%n}b._r=(sr/n)/f;KSB[key]=b;return b}
function KS(damp,bright,sec,pk,lpf){return function(X,out,m,t,dur,v){var b=ksbuf(X,m,damp,bright,sec),s=X.createBufferSource(),g=G(X,0),lp=F(X,'lowpass',lpf,.6);s.buffer=b;s.playbackRate.value=1/b._r;C(s,F(X,'highpass',45,.7),lp,g,out);s.start(t);s.stop(t+sec);
  g.gain.setValueAtTime(pk*v,t);g.gain.setValueAtTime(pk*v,t+Math.max(.05,dur*1.2));g.gain.setTargetAtTime(.0001,t+Math.max(.05,dur*1.2),.25)}}
add('guitar','plk','bs ch ld',KS(.9955,.6,1.6,.5,4800));add('harp','plk','ch ld',KS(.9985,.95,2.2,.45,7000));
/* pads and voices */
add('pad','pad','ch ld',SUBV({w:[['sawtooth',-9],['sawtooth',9],['triangle',0,.8]],f0:500,f1:2400,ft:.5,q:.6,a:.28,rel:.7,pk:.1,vib:6}));
add('strings','pad','ch ld',SUBV({w:[['sawtooth',-11],['sawtooth',-4],['sawtooth',4],['sawtooth',11]],f0:1800,f1:3400,ft:.35,q:.5,a:.16,rel:.4,pk:.1,vib:5,spread:.5}));
add('glass','pad','ch ld',FMV({mr:2,i0:.9,i1:.5,tau:.6,a:.22,rel:.7,pk:.12,dt2:6,vib:5,lp:8000}));
add('choir','pad','ch ld',function(X,out,m,t,dur,v){var f=mf(m),g=G(X,0),mix=G(X,1),end=t+dur+.55,lg=G(X,0);C(g,out);
  [[700,.9],[1150,.5],[2600,.25]].forEach(function(p){var b=F(X,'bandpass',p[0],9);C(mix,b,G(X,p[1]),g)});
  var oscs=[-12,0,12].map(function(d){return O(X,'sawtooth',f,t,end,mix,d)});lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(8,t+.35);oscs.forEach(function(o){lg.connect(o.detune)});O(X,'sine',5.2,t,end,lg);
  var n=G(X,.35);N(X,t,end,C(F(X,'bandpass',1500,1),n,g));ad(g.gain,t,.16,.32*v,dur-.16,.45)});
add('flute','pad','ld',function(X,out,m,t,dur,v){var f=mf(m),g=G(X,0),end=t+dur+.2,lg=G(X,0),h=G(X,.15),n=G(X,0);C(g,out);var o=O(X,'sine',f,t,end,g);O(X,'sine',f*2,t,end,C(h,g));
  lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(10,t+.4);lg.connect(o.detune);O(X,'sine',5,t,end,lg);N(X,t,end,C(F(X,'bandpass',Math.min(8000,f*2),2),n,g));n.gain.setValueAtTime(.05,t);n.gain.setTargetAtTime(.012,t+.06,.1);
  ad(g.gain,t,.06,.22*v,dur-.06,.12)});

var NM={ // names: ru|uk|en|fi
 k_808:'808|808|808|808',k_909:'909|909|909|909',k_trap:'Трэп|Трап|Trap|Trap',k_lofi:'Лоу-фай|Лоу-фай|Lo-fi|Lo-fi',k_chip:'8-бит|8-біт|8-bit|8-bit',kit_classic:'Классика|Класика|Classic|Klassinen',
 tram:'Трамвайный звонок|Трамвайний дзвінок|Tram bell|Raitiovaunun kello',pip:'Пип светофора|Піп світлофора|Crossing beep|Suojatien piippaus',siren:'Сирена|Сирена|Siren|Sireeni',
 cow:'Ковбелл|Ковбел|Cowbell|Lehmänkello',rim:'Римшот|Римшот|Rimshot|Rimshot',snap:'Щелчок|Клац|Snap|Näpäytys',conga:'Конга|Конга|Conga|Conga',tom:'Том|Том|Tom|Tom',clave:'Клаве|Клаве|Clave|Clave',
 tamb:'Бубен|Бубон|Tambourine|Tamburiini',shk:'Шейкер|Шейкер|Shaker|Shaker',zap:'Зап|Зап|Zap|Zap',laser:'Лазер|Лазер|Laser|Laser',riser:'Нарастание|Наростання|Riser|Nousu',down:'Спад|Спад|Downlifter|Lasku',
 impact:'Удар|Удар|Impact|Isku',sub:'Сабдроп|Сабдроп|Sub drop|Sub drop',scr:'Скрэтч|Скретч|Scratch|Scratch',vin:'Винил|Вініл|Vinyl crackle|Vinyylin rätinä',
 hey:'Выкрик «Эй»|Вигук «Гей»|Shout “Hey”|Huuto “Hei”',horn:'Горн|Горн|Air horn|Ilmatorvi',hroll:'Хэт-ролл|Хет-ролл|Hat roll|Hat roll',
 cl_saw:'Пила (клуб)|Пила (клуб)|Saw (club)|Saha (klubi)',cl_sq:'Квадрат (рингтон)|Квадрат (рінгтон)|Square (ringtone)|Neliö (soittoääni)',cl_reed:'Баян|Баян|Accordion|Haitari',
 cl_keys:'Клавиши|Клавіші|Keys|Koskettimet',cl_pluck:'Щипок|Щипок|Pluck|Näppäily',cb_saw:'Пила|Пила|Saw|Saha',cb_sub:'Саб|Саб|Sub|Sub',cb_pluck:'Щипок|Щипок|Pluck|Näppäily',cb_sq:'Квадрат|Квадрат|Square|Neliö',
 b808:'808 саб|808 саб|808 sub|808-sub',reese:'Риз-бас|Різ-бас|Reese bass|Reese-basso',acid:'Эйсид 303|Ейсід 303|Acid 303|Acid 303',wobble:'Вобл-бас|Вобл-бас|Wobble bass|Wobble-basso',moog:'Муг-бас|Муг-бас|Moog bass|Moog-basso',fmbass:'FM-бас|FM-бас|FM bass|FM-basso',
 supersaw:'Суперпила|Суперпила|Supersaw|Supersaw',stab:'Аккорд-стаб|Акорд-стаб|Chord stab|Stab',brass:'Медь|Мідь|Brass|Vaskit',pulse:'Чип 25%|Чіп 25%|Chip 25%|Chip 25 %',edmpluck:'Щипок EDM|Щипок EDM|EDM pluck|EDM-näppäily',
 epiano:'Электропиано|Електропіаніно|Electric piano|Sähköpiano',vibes:'Вибрафон|Вібрафон|Vibraphone|Vibrafoni',organ:'Орган|Орган|Organ|Urut',piano:'Пианино|Піаніно|Piano|Piano',
 marimba:'Маримба|Маримба|Marimba|Marimba',kalimba:'Калимба|Калімба|Kalimba|Kalimba',bell:'Колокольчик|Дзвіночок|Bell|Kello',guitar:'Гитара|Гітара|Guitar|Kitara',harp:'Арфа|Арфа|Harp|Harppu',
 pad:'Тёплый пэд|Теплий пед|Warm pad|Lämmin pad',strings:'Струнные|Струнні|Strings|Jouset',glass:'Стеклянный пэд|Скляний пед|Glass pad|Lasipad',choir:'Хор|Хор|Choir|Kuoro',flute:'Флейта|Флейта|Flute|Huilu',
 g_cty:'Город|Місто|City|Kaupunki',g_prc:'Перкуссия|Перкусія|Percussion|Lyömäsoittimet',g_fxs:'Эффекты|Ефекти|Effects|Tehosteet',g_vox:'Голос и трэп|Голос і трап|Voice & trap|Ääni ja trap',
 g_syn:'Синтезаторы|Синтезатори|Synths|Syntikat',g_key:'Клавишные|Клавішні|Keys|Koskettimet',g_plk:'Щипковые и ударные|Щипкові та ударні|Plucked & struck|Näppäillyt ja lyödyt',g_pad:'Пэды и голоса|Педи та голоси|Pads & voices|Padit ja äänet',
 g_bas:'Современные басы|Сучасні баси|Modern basses|Modernit bassot',g_cls:'Классика рингтонов|Класика рінгтонів|Ringtone classics|Soittoäänien klassikot'};
var LI={ru:0,uk:1,en:2,fi:3};
function name(id,l){var s=NM[id];if(!s)return id;return s.split('|')[LI[l]===undefined?0:LI[l]]}

/* ---------------------------------------------------------------- sampler: render once, play many times */
var OFF=window.OfflineAudioContext||window.webkitOfflineAudioContext;
function norm(buf,pk){var d=buf.getChannelData(0),m=0,i;for(i=0;i<d.length;i++){var a=Math.abs(d[i]);if(a>m)m=a}if(m>1e-5){var k=pk/m;for(i=0;i<d.length;i++)d[i]*=k}var n=Math.floor(buf.sampleRate*.008);for(i=0;i<n;i++)d[d.length-1-i]*=i/n}
function renderSample(id){var s=SMP[id];if(!s)return Promise.reject(new Error('no sample '+id));if(s.buf)return Promise.resolve(s.buf);if(s.p)return s.p;
  if(!OFF)return Promise.reject(new Error('no offline audio'));
  var X=new OFF(1,Math.ceil(s.len*44100),44100);s.fn(X,X.destination,0);
  s.p=X.startRendering().then(function(b){norm(b,s.pk);s.buf=b;return b});return s.p}
function sample(id){var s=SMP[id];if(!s)return null;if(s.buf)return s.buf;renderSample(id).catch(function(){});return null}
function preload(ids){return Promise.all(ids.map(function(i){return renderSample(i).catch(function(){})}))}
/* play a sample on a live context: if it is still rendering, it starts as soon as it is ready */
function hit(X,out,id,t,vel,rate){var s=SMP[id];if(!s)return;
  var go=function(b,tt){var src=X.createBufferSource(),g=G(X,vel===undefined?1:vel);src.buffer=b;if(rate)src.playbackRate.value=rate;C(src,g,out);src.start(tt)};
  if(s.buf){go(s.buf,t);return}
  if(!OFF){var lg=G(X,vel===undefined?1:vel);C(lg,out);s.fn(X,lg,t);return}
  renderSample(id).then(function(b){go(b,Math.max(t,X.currentTime+.005))}).catch(function(){})}
function note(X,out,id,m,t,dur,v,o){var i=INS[id];if(!i)return;i.fn(X,out,m,t,dur,v===undefined?1:v,o||{})}
/* test helpers: render an instrument note or a sample on an offline context */
function renderIns(id,m,dur,sec,sd){if(!OFF)return Promise.reject(new Error('no offline audio'));var X=new OFF(2,Math.ceil(sec*44100),44100);note(X,X.destination,id,m,.01,dur,1,{sd:sd||.12});return X.startRendering()}
window.D11S={INS:INS,SMP:SMP,KITS:KD,name:name,note:note,hit:hit,sample:sample,preload:preload,renderSample:renderSample,renderIns:renderIns,kitIds:Object.keys(KD),version:1};
})();
