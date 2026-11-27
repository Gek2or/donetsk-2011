/* Donetsk 2011 · beat studio (v7.43, page «Музыка и звуки», section «Секвенсор»)
   A simple step sequencer: ten lanes (five drums, two sample slots, bass, chords, melody) on a 16-step grid (1 or 2 bars).
   Sounds come from assets/sounds.js (kits, samples, instruments) and the mix bus of assets/seq.js. All synthesised in the browser:
   no recordings, nothing is uploaded or downloaded. The beat is kept in this browser (localStorage) and can be shared as a link (#studio=...). */
(function(){
const box=document.getElementById('studio-box');if(!box)return;
const L=()=>{const l=(document.documentElement.lang||'ru').slice(0,2);return {ru:1,uk:1,en:1,fi:1}[l]?l:'ru'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- texts ---------- */
const TX={
ru:{code:'Секвенсор',h:'Секвенсор: собери свой бит',
 p:'Выбери стиль, и бит заиграет. Дальше рисуй мышью или пальцем: клик ставит ноту, а если провести по дорожке, закрасится сразу несколько. Нажми на название дорожки и смени ей звук: наборы ударных, синты, басы, электропиано, хор и семплы вроде трамвайного звонка.',
 play:'Играть',stop:'Стоп',bpm:'Темп',tap:'TAP',tapT:'Постучи по кнопке в такт музыке',style:'Стиль',kit:'Ударные',swing:'Свинг',vol:'Громкость',listen:'Где слушаем',more:'Ещё настройки',
 key:'Тональность',scale:'Лад',scales:{min:'минор',hm:'гарм. минор',maj:'мажор',pen:'пентатоника минор',penm:'пентатоника мажор',dor:'дорийский',blues:'блюз'},
 bar1:'1 такт',bar2:'2 такта',barN:'Такт',len:'Длина',
 lanes:{kick:'Бочка',snare:'Малый',clap:'Клэп',hat:'Хэт',oh:'Откр. хэт',sa:'Семпл 1',sb:'Семпл 2',bs:'Бас',ch:'Аккорды',ld:'Мелодия'},
 kitHint:'Звук этой дорожки задаёт набор ударных. Поменяй его в строке «Ударные» над дорожками.',
 pickS:'Семпл на этой дорожке',pickI:'Звук дорожки',editing:'Редактируешь',mute:'Заглушить дорожку',
 rnd:'Случайно',rndT:'Случайный рисунок на выбранной дорожке',clr:'Очистить дорожку',clrAll:'Очистить всё',sur:'Сюрприз',surT:'Случайный стиль, звуки и тональность',share:'Поделиться',
 fx:{clean:'Чисто',bus:'Маршрутка',phone:'Телефон',tape:'Кассета'},
 styles:{house:'Клубный хаус',trap:'Трэп',lofi:'Лоу-фай',wave:'Синтвейв',dance:'Данс 2010',shan:'Шансон',chip:'8-бит',city:'Город',empty:'Чистый лист'},
 hint:'Пробел: играть и остановить. Нажатая клетка сразу звучит. Бит сохраняется в этом браузере.',
 note:'Весь звук синтезирует браузер на лету: ни записей, ни аудиофайлов. «Семплы» здесь — короткие звуки, которые страница один раз собирает сама. Бит сохраняется только у вас в браузере.',
 copied:'Ссылка на бит скопирована',copyMan:'Скопируй ссылку вручную:',noAudio:'В этом браузере нет Web Audio',fromLink:'Открыт бит по ссылке',cleared:'Очищено',step:'шаг',on:'вкл',off:'выкл'},
uk:{code:'Секвенсор',h:'Секвенсор: збери свій біт',
 p:'Обери стиль, і біт заграє. Далі малюй мишею чи пальцем: клік ставить ноту, а якщо провести по доріжці, зафарбується одразу кілька. Натисни на назву доріжки й зміни їй звук: набори ударних, синти, баси, електропіаніно, хор і семпли на кшталт трамвайного дзвінка.',
 play:'Грати',stop:'Стоп',bpm:'Темп',tap:'TAP',tapT:'Стукай по кнопці в такт музиці',style:'Стиль',kit:'Ударні',swing:'Свінг',vol:'Гучність',listen:'Де слухаємо',more:'Ще налаштування',
 key:'Тональність',scale:'Лад',scales:{min:'мінор',hm:'гарм. мінор',maj:'мажор',pen:'пентатоніка мінор',penm:'пентатоніка мажор',dor:'дорійський',blues:'блюз'},
 bar1:'1 такт',bar2:'2 такти',barN:'Такт',len:'Довжина',
 lanes:{kick:'Бочка',snare:'Малий',clap:'Клеп',hat:'Хет',oh:'Відкр. хет',sa:'Семпл 1',sb:'Семпл 2',bs:'Бас',ch:'Акорди',ld:'Мелодія'},
 kitHint:'Звук цієї доріжки задає набір ударних. Зміни його в рядку «Ударні» над доріжками.',
 pickS:'Семпл на цій доріжці',pickI:'Звук доріжки',editing:'Редагуєш',mute:'Вимкнути доріжку',
 rnd:'Випадково',rndT:'Випадковий малюнок на вибраній доріжці',clr:'Очистити доріжку',clrAll:'Очистити все',sur:'Сюрприз',surT:'Випадковий стиль, звуки й тональність',share:'Поділитися',
 fx:{clean:'Чисто',bus:'Маршрутка',phone:'Телефон',tape:'Касета'},
 styles:{house:'Клубний хаус',trap:'Трап',lofi:'Лоу-фай',wave:'Синтвейв',dance:'Данс 2010',shan:'Шансон',chip:'8-біт',city:'Місто',empty:'Чистий аркуш'},
 hint:'Пробіл: грати й зупиняти. Натиснута клітинка одразу звучить. Біт зберігається в цьому браузері.',
 note:'Увесь звук синтезує браузер на льоту: жодних записів чи аудіофайлів. «Семпли» тут — короткі звуки, які сторінка один раз збирає сама. Біт зберігається лише у вашому браузері.',
 copied:'Посилання на біт скопійовано',copyMan:'Скопіюй посилання вручну:',noAudio:'У цьому браузері немає Web Audio',fromLink:'Відкрито біт за посиланням',cleared:'Очищено',step:'крок',on:'увімк',off:'вимк'},
en:{code:'Sequencer',h:'Sequencer: make your own beat',
 p:'Pick a style and the beat starts playing. Then draw with the mouse or a finger: a click places a note, and dragging along a lane paints several at once. Tap a lane name to change its sound: drum kits, synths, basses, electric piano, choir and samples such as the tram bell.',
 play:'Play',stop:'Stop',bpm:'Tempo',tap:'TAP',tapT:'Tap the button in time with the music',style:'Style',kit:'Drums',swing:'Swing',vol:'Volume',listen:'Listening on',more:'More settings',
 key:'Key',scale:'Scale',scales:{min:'minor',hm:'harmonic minor',maj:'major',pen:'minor pentatonic',penm:'major pentatonic',dor:'dorian',blues:'blues'},
 bar1:'1 bar',bar2:'2 bars',barN:'Bar',len:'Length',
 lanes:{kick:'Kick',snare:'Snare',clap:'Clap',hat:'Hi-hat',oh:'Open hat',sa:'Sample 1',sb:'Sample 2',bs:'Bass',ch:'Chords',ld:'Melody'},
 kitHint:'This lane uses the sound of the drum kit. Change the kit in the “Drums” row above the lanes.',
 pickS:'Sample for this lane',pickI:'Sound for this lane',editing:'Editing',mute:'Mute lane',
 rnd:'Random',rndT:'Random pattern on the selected lane',clr:'Clear lane',clrAll:'Clear all',sur:'Surprise',surT:'Random style, sounds and key',share:'Share',
 fx:{clean:'Clean',bus:'Minibus',phone:'Phone',tape:'Tape'},
 styles:{house:'Club house',trap:'Trap',lofi:'Lo-fi',wave:'Synthwave',dance:'Dance 2010',shan:'Chanson',chip:'8-bit',city:'City',empty:'Blank'},
 hint:'Space: play and stop. A pressed cell sounds at once. The beat is kept in this browser.',
 note:'All sound is synthesised by the browser on the fly: no recordings, no audio files. “Samples” here are short sounds the page builds once by itself. The beat is stored only in your browser.',
 copied:'Beat link copied',copyMan:'Copy the link by hand:',noAudio:'This browser has no Web Audio',fromLink:'Beat opened from a link',cleared:'Cleared',step:'step',on:'on',off:'off'},
fi:{code:'Sekvensseri',h:'Sekvensseri: tee oma biitti',
 p:'Valitse tyyli, niin biitti alkaa soida. Piirrä sitten hiirellä tai sormella: napautus asettaa nuotin, ja vetämällä raitaa pitkin maalaat useita kerralla. Napauta raidan nimeä ja vaihda sen ääni: rumpusetit, syntikat, bassot, sähköpiano, kuoro ja samplet kuten raitiovaunun kello.',
 play:'Soita',stop:'Pysäytä',bpm:'Tempo',tap:'TAP',tapT:'Napauta painiketta musiikin tahdissa',style:'Tyyli',kit:'Rummut',swing:'Swing',vol:'Äänenvoimakkuus',listen:'Missä kuuntelet',more:'Lisää asetuksia',
 key:'Sävellaji',scale:'Asteikko',scales:{min:'molli',hm:'harmoninen molli',maj:'duuri',pen:'pentatoninen molli',penm:'pentatoninen duuri',dor:'doorinen',blues:'blues'},
 bar1:'1 tahti',bar2:'2 tahtia',barN:'Tahti',len:'Pituus',
 lanes:{kick:'Basari',snare:'Virveli',clap:'Taputus',hat:'Hi-hat',oh:'Avoin hat',sa:'Sample 1',sb:'Sample 2',bs:'Basso',ch:'Soinnut',ld:'Melodia'},
 kitHint:'Tämän raidan ääni tulee rumpusetistä. Vaihda setti raitojen yläpuolella olevalta riviltä “Rummut”.',
 pickS:'Tämän raidan sample',pickI:'Raidan ääni',editing:'Muokkaat',mute:'Mykistä raita',
 rnd:'Satunnainen',rndT:'Satunnainen kuvio valitulle raidalle',clr:'Tyhjennä raita',clrAll:'Tyhjennä kaikki',sur:'Yllätys',surT:'Satunnainen tyyli, äänet ja sävellaji',share:'Jaa',
 fx:{clean:'Puhdas',bus:'Marsrutka',phone:'Puhelin',tape:'Kasetti'},
 styles:{house:'Klubihouse',trap:'Trap',lofi:'Lo-fi',wave:'Synthwave',dance:'Dance 2010',shan:'Šansoni',chip:'8-bit',city:'Kaupunki',empty:'Tyhjä'},
 hint:'Välilyönti: soita ja pysäytä. Painettu ruutu soi heti. Biitti tallentuu tähän selaimeen.',
 note:'Kaiken äänen syntetisoi selain lennosta: ei tallenteita eikä äänitiedostoja. “Samplet” ovat lyhyitä ääniä, jotka sivu rakentaa itse kerran. Biitti tallentuu vain omaan selaimeesi.',
 copied:'Biittilinkki kopioitu',copyMan:'Kopioi linkki käsin:',noAudio:'Tässä selaimessa ei ole Web Audiota',fromLink:'Biitti avattu linkistä',cleared:'Tyhjennetty',step:'askel',on:'päällä',off:'pois'}
};
const T=()=>TX[L()];
const nm=id=>window.D11S?D11S.name(id,L()):id;

/* ---------- model ---------- */
const DL=['kick','snare','clap','hat','oh','sa','sb'],SL=['sa','sb'],ML=['bs','ch','ld'],ALL=DL.concat(ML),KITS=['808','909','trap','lofi','chip','classic'];
const KDUCK={'808':.6,'909':.5,trap:.6,lofi:.75,chip:.8,classic:.55};
const KEYN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const SCL={min:[0,2,3,5,7,8,10,12],hm:[0,2,3,5,7,8,11,12],maj:[0,2,4,5,7,9,11,12],pen:[0,3,5,7,10,12,15,17],penm:[0,2,4,7,9,12,14,16],dor:[0,2,3,5,7,9,10,12],blues:[0,3,5,6,7,10,12,15]};
const SCN=Object.keys(SCL),OCT={bs:-24,ch:-12,ld:0},PAGE=16,MAXS=32;
const LC={kick:'#ff7a45',snare:'#f5b13d',clap:'#e8d34a',hat:'#37c9b0',oh:'#3fb4e8',sa:'#b07bf0',sb:'#ef6fb0',bs:'#5c8cf0',ch:'#9a78ea',ld:'#f0654f'};
const LV={kick:1,snare:.9,clap:.85,hat:.8,oh:.7,sa:.9,sb:.9,bs:1,ch:.9,ld:.9},PN={kick:0,snare:0,clap:-.1,hat:.22,oh:-.18,sa:-.3,sb:.3,bs:0,ch:0,ld:.12};
const blank=()=>{const d={};DL.forEach(l=>d[l]=Array(MAXS).fill(0));return {d,bs:Array(MAXS).fill(-1),ch:Array(MAXS).fill(0),ld:Array(MAXS).fill(0)}};
let S=Object.assign({pr:'house',bpm:124,sw:6,k:9,md:'min',bars:1,fx:'clean',kit:'909',ins:{bs:'moog',ch:'stab',ld:'supersaw'},smp:{sa:'hey',sb:'zap'},mu:{}},blank());
let sel='ld',page=0,msg='';
const PRE={
 house:{bpm:124,sw:6,k:9,md:'min',kit:'909',ins:{bs:'moog',ch:'stab',ld:'supersaw'},smp:{sa:'hey',sb:'zap'},
  d:{kick:'x...x...x...x...',clap:'....x.......x...',hat:'xx.xxx.xxx.xxx.x',oh:'..x...x...x...x.',sa:'..............x.'},
  bs:'.0.0.0.0.5.5.6.6',ch:['','','024','','','','024','','','','257','','','','136',''],ld:'4..2..4.7.6.4...'},
 trap:{bpm:140,sw:0,k:0,md:'min',kit:'trap',ins:{bs:'b808',ch:'epiano',ld:'bell'},smp:{sa:'hroll',sb:'scr'},
  d:{kick:'x.......x..x....',snare:'........x.......',clap:'........x.......',hat:'x.x.x.x.x.x.x.x.',oh:'......x.........',sa:'..............x.'},
  bs:'0.......0..5....',ch:['024','','','','','','','','257','','','','136','','',''],ld:'4.2.0.2.4.2.0.7.'},
 lofi:{bpm:82,sw:28,k:2,md:'min',kit:'lofi',ins:{bs:'cb_sub',ch:'epiano',ld:'vibes'},smp:{sa:'vin',sb:'shk'},
  d:{kick:'x.....x...x.....',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.x.',oh:'.............x..',sa:'x...............',sb:'..x...x...x...x.'},
  bs:'0.....0.5.....6.',ch:['0246','','','','','','','','2457','','','','136','','',''],ld:'..4...2...7.5...'},
 wave:{bpm:100,sw:0,k:9,md:'min',kit:'909',ins:{bs:'moog',ch:'pad',ld:'supersaw'},smp:{sa:'tom',sb:'laser'},
  d:{kick:'x...x...x...x...',snare:'....x.......x...',clap:'....x.......x...',hat:'x.x.x.x.x.x.x.x.',oh:'..............x.',sa:'..............x.',sb:'.............x..'},
  bs:'0.0.0.0.5.5.6.6.',ch:['024','','','','','','','','257','','','','136','','',''],ld:'7.4.2.4.6.4.2...'},
 dance:{bpm:128,sw:0,k:6,md:'min',kit:'909',ins:{bs:'cb_saw',ch:'brass',ld:'edmpluck'},smp:{sa:'hey',sb:'horn'},
  d:{kick:'x...x...x...x...',clap:'....x.......x...',hat:'x.x.x.x.x.x.x.x.',oh:'..x...x...x...x.',sa:'......x.......x.'},
  bs:'.0.0.0.0.5.5.6.6',ch:['','','024','','','','024','','','','257','','','','136',''],ld:'4.4.5.7.5.4.2...'},
 shan:{bpm:104,sw:0,k:9,md:'hm',kit:'classic',ins:{bs:'cb_pluck',ch:'guitar',ld:'cl_reed'},smp:{sa:'tram',sb:'pip'},
  d:{kick:'x.......x.......',snare:'....x.......x...',hat:'..x...x...x...x.'},
  bs:'0.......4.......',ch:'0.2.4.2.1.4.6.4.',ld:'7.65..4.3.45..6.'},
 chip:{bpm:140,sw:0,k:9,md:'min',kit:'chip',ins:{bs:'pulse',ch:'cl_sq',ld:'pulse'},smp:{sa:'laser',sb:'pip'},
  d:{kick:'x...x...x...x...',snare:'....x.......x...',hat:'..x...x...x...x.'},
  bs:'0.......5...6...',ch:['024','','','','','','','','257','','','','','','',''],ld:'024742021353134.'},
 city:{bpm:92,sw:12,k:7,md:'maj',kit:'lofi',ins:{bs:'cb_sub',ch:'epiano',ld:'cl_keys'},smp:{sa:'tram',sb:'pip'},
  d:{kick:'x.......x.......',hat:'....x.......x...',sa:'x...............',sb:'..........x.x.x.'},
  bs:'0.......3.......',ch:['024','','','','','','','','357','','','','','','',''],ld:['','','','4','','','2','','','','','5','','','4','']},
 empty:null};
const PIDS=Object.keys(PRE);
function maskOf(spec,j){if(!spec)return 0;const c=Array.isArray(spec)?(spec[j]||''):(spec[j]&&spec[j]!=='.'?spec[j]:'');let m=0;for(const ch of c)if(ch>='0'&&ch<='7')m|=1<<(+ch);return m}
function applyPreset(id){const p=PRE[id];S.pr=id;S.mu={};const b=blank();
  if(p){Object.assign(S,{bpm:p.bpm,sw:p.sw,k:p.k,md:p.md,kit:p.kit,bars:1});S.ins=Object.assign({},p.ins);S.smp=Object.assign({sa:'tram',sb:'pip'},p.smp);
    for(let j=0;j<MAXS;j++){DL.forEach(l=>{const s=p.d[l]||'';b.d[l][j]=s[j%16]==='x'?1:0});const c=p.bs[j%16];b.bs[j]=c>='0'&&c<='7'?+c:-1;b.ch[j]=maskOf(p.ch,j%16);b.ld[j]=maskOf(p.ld,j%16)}}
  else S.bars=1;
  S.d=b.d;S.bs=b.bs;S.ch=b.ch;S.ld=b.ld;page=0}
applyPreset('house');

/* ---------- link / storage ---------- */
const hex=(n,w)=>n.toString(16).padStart(w,'0'),SMPK=()=>Object.keys(D11S.SMP).filter(i=>D11S.SMP[i].cat!=='kit'),INSK=()=>Object.keys(D11S.INS);
function enc(){const d=DL.map(l=>{let v=0;for(let j=0;j<MAXS;j++)if(S.d[l][j])v+=Math.pow(2,j);return hex(v,8)}).join('');
  return ['2',S.bpm,S.sw,S.k,S.md,S.bars,S.kit,S.ins.bs,S.ins.ch,S.ins.ld,S.smp.sa,S.smp.sb,d,S.bs.map(v=>v<0?'x':v).join(''),S.ch.map(v=>hex(v,2)).join(''),S.ld.map(v=>hex(v,2)).join('')].join('.')}
function dec(str){try{const a=String(str).split('.');if(a.length!==16||a[0]!=='2')return null;const n=Object.assign({},S,blank());
  n.bpm=Math.min(200,Math.max(60,parseInt(a[1],10)||120));n.sw=Math.min(50,Math.max(0,parseInt(a[2],10)||0));n.k=Math.min(11,Math.max(0,parseInt(a[3],10)||0));n.md=SCL[a[4]]?a[4]:'min';n.bars=a[5]==='2'?2:1;
  n.kit=KITS.includes(a[6])?a[6]:'909';const ok=(id,l)=>D11S.INS[id]&&D11S.INS[id].fo.split(' ').includes(l);
  n.ins={bs:ok(a[7],'bs')?a[7]:'moog',ch:ok(a[8],'ch')?a[8]:'pad',ld:ok(a[9],'ld')?a[9]:'supersaw'};const sm=SMPK();n.smp={sa:sm.includes(a[10])?a[10]:'tram',sb:sm.includes(a[11])?a[11]:'pip'};
  if(!/^[0-9a-f]{56}$/.test(a[12])||!/^[0-7x]{32}$/.test(a[13])||!/^[0-9a-f]{64}$/.test(a[14])||!/^[0-9a-f]{64}$/.test(a[15]))return null;
  DL.forEach((l,i)=>{const v=parseInt(a[12].substr(i*8,8),16);for(let j=0;j<MAXS;j++)n.d[l][j]=Math.floor(v/Math.pow(2,j))%2});
  for(let j=0;j<MAXS;j++){const c=a[13][j];n.bs[j]=c==='x'?-1:+c;n.ch[j]=parseInt(a[14].substr(j*2,2),16);n.ld[j]=parseInt(a[15].substr(j*2,2),16)}n.pr='';n.mu={};return n}catch(e){return null}}
function decLegacy(str){try{const a=String(str).split('_');if(a.length!==12||a[0]!=='1')return null;const n=Object.assign({},S,blank()),K={C:0,D:2,E:4,F:5,G:7,A:9};
  n.bpm=Math.min(180,Math.max(60,parseInt(a[1],10)||120));n.sw=Math.min(50,Math.max(0,parseInt(a[2],10)||0));n.k=K[a[3]]!==undefined?K[a[3]]:9;n.md=['min','hm','maj'].includes(a[4])?a[4]:'min';
  n.ins={bs:{saw:'cb_saw',sub:'cb_sub',pluck:'cb_pluck',sq:'cb_sq'}[a[6]]||'cb_saw',ch:'pad',ld:{saw:'cl_saw',sq:'cl_sq',reed:'cl_reed',keys:'cl_keys',pluck:'cl_pluck'}[a[5]]||'cl_saw'};
  n.kit='classic';n.smp={sa:'tram',sb:'pip'};n.fx=['clean','bus','phone','tape'].includes(a[7])?a[7]:'clean';n.bars=a[8]==='2'?2:1;
  if(!/^[0-9a-f]{56}$/.test(a[9])||!/^[0-9a-f]{64}$/.test(a[10])||!/^[0-7x]{32}$/.test(a[11]))return null;
  const lanes=['kick','snare','clap','hat','oh','sa','sb'];lanes.forEach((l,i)=>{const v=parseInt(a[9].substr(i*8,8),16);for(let j=0;j<MAXS;j++)n.d[l][j]=Math.floor(v/Math.pow(2,j))%2});
  for(let j=0;j<MAXS;j++){n.ld[j]=parseInt(a[10].substr(j*2,2),16);const c=a[11][j];n.bs[j]=c==='x'?-1:+c}n.pr='';n.mu={};return n}catch(e){return null}}
(function load(){let h=location.hash.match(/^#studio=([0-9a-zA-Z_.-]+)$/);
  if(h){const n=dec(h[1]);if(n){S=n;msg='fromLink';return}}
  h=location.hash.match(/^#seq=([0-9a-zA-Z_]+)$/);if(h){const n=decLegacy(h[1]);if(n){S=n;msg='fromLink';return}}
  try{const j=JSON.parse(localStorage.getItem('d11-stu')||'null');if(j&&j.s){const n=dec(j.s);if(n){S=n;S.pr=PIDS.includes(j.pr)?j.pr:'';if(['clean','bus','phone','tape'].includes(j.fx))S.fx=j.fx}}}catch(e){}
})();
let saveT=0;const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('d11-stu',JSON.stringify({s:enc(),pr:S.pr,fx:S.fx}))}catch(e){}},300)};

/* ---------- audio ---------- */
const A=()=>window.D11A;
let X=null;const LB={};
function ensure(){const a=A();if(!a||!window.D11S)return null;const ctx=a.init();if(!ctx)return null;
  if(X!==ctx){X=ctx;ALL.forEach(l=>{const g=X.createGain(),dst=ML.includes(l)?a.out():a.dry();g.gain.value=LV[l];if(X.createStereoPanner){const p=X.createStereoPanner();p.pan.value=PN[l];g.connect(p);p.connect(dst)}else g.connect(dst);LB[l]=g})}
  if(ctx.state!=='running'&&ctx.resume)ctx.resume();return ctx}
const sd=()=>60/S.bpm/4;
const midi=(l,r)=>60+S.k+SCL[S.md][r]+OCT[l];
const noteName=m=>KEYN[m%12]+(Math.floor(m/12)-1);
function preloadAll(){if(!window.D11S)return;const ids=[];if(S.kit!=='classic')DL.slice(0,5).forEach(l=>ids.push(D11S.KITS[S.kit][l]));ids.push(S.smp.sa,S.smp.sb);D11S.preload(ids)}
function drumHit(l,t,acc){const a=A();
  if(S.kit==='classic'){a.drum(l,t,l==='hat'||l==='oh'?acc:1,KDUCK.classic);return}
  D11S.hit(X,LB[l],D11S.KITS[S.kit][l],t,l==='hat'||l==='oh'?acc:1);if(l==='kick')a.duck(t,KDUCK[S.kit])}
function playNote(l,r,t,dur,v){D11S.note(X,LB[l],S.ins[l],midi(l,r),t,dur,v,{sd:sd()})}
let lq=[];
function trig(s,t){const acc=s%4===0?1:.84,len=PAGE*S.bars;
  DL.forEach(l=>{if(!S.d[l][s]||S.mu[l])return;lq.push([t,l]);if(SL.includes(l))D11S.hit(X,LB[l],S.smp[l],t,.95);else drumHit(l,t,acc)});
  if(S.bs[s]>=0&&!S.mu.bs){lq.push([t,'bs']);playNote('bs',S.bs[s],t,sd()*.9,1)}
  if(S.ch[s]&&!S.mu.ch){lq.push([t,'ch']);let n=1;while(n<8&&!S.ch[(s+n)%len]&&n<len)n++;const dur=n*sd()*.97;for(let r=0;r<8;r++)if(S.ch[s]&(1<<r))playNote('ch',r,t,dur,.85)}
  if(S.ld[s]&&!S.mu.ld){lq.push([t,'ld']);for(let r=0;r<8;r++)if(S.ld[s]&(1<<r))playNote('ld',r,t,sd()*.92,acc)}}
function audition(l,r){const ctx=ensure();if(!ctx)return;const t=ctx.currentTime+.02;
  if(ML.includes(l)){playNote(l,r,t,sd()*1.6,1);return}
  if(SL.includes(l)){D11S.hit(ctx,LB[l],S.smp[l],t,.95);return}drumHit(l,t,1)}
function auditId(l,id){const ctx=ensure();if(!ctx)return;const t=ctx.currentTime+.02;
  if(SL.includes(l))D11S.hit(ctx,LB[l],id,t,.95);else{const old=S.ins[l];S.ins[l]=id;playNote(l,l==='bs'?0:l==='ch'?2:4,t,sd()*3,1);S.ins[l]=old}}

/* ---------- transport ---------- */
let playing=false,step=0,nextT=0,timer=0,vq=[],raf=0,last=null,lastStep=-1,tail=0;
function sched(){const len=PAGE*S.bars;while(nextT<X.currentTime+.12){if(step>=len)step=0;const t=nextT+(step%2?S.sw/100*sd()*.66:0);trig(step,t);vq.push([step,t]);nextT+=sd();step=(step+1)%len}}
function start(){const ctx=ensure();if(!ctx){say(T().noAudio);return}const a=A();if(a.stopPhone)a.stopPhone();a.fx(S.fx);preloadAll();playing=true;step=0;vq=[];lq=[];last=null;lastStep=-1;nextT=ctx.currentTime+.08;sched();clearInterval(timer);timer=setInterval(sched,25);tail=0;if(!raf)frame();btn()}
function stop(){if(!playing)return;playing=false;clearInterval(timer);vq=[];lq=[];last=null;lastStep=-1;tail=34;const ph=box.querySelector('.stu-ph');if(ph)ph.hidden=true;box.querySelectorAll('.stu-p.col,.stu-rc.col').forEach(e=>e.classList.remove('col'));btn()}
function btn(){const b=box.querySelector('.stu-play');if(!b)return;b.setAttribute('aria-pressed',playing);b.querySelector('.stu-pi').textContent=playing?'■':'▶';b.querySelector('.stu-pt').textContent=playing?T().stop:T().play}
const pop=(e)=>{e.classList.remove('hit');void e.offsetWidth;e.classList.add('hit')};
function frame(){raf=requestAnimationFrame(frame);
  if(playing&&X){const now=X.currentTime;let c=null;while(vq.length&&vq[0][1]<=now+.002)c=vq.shift();if(c)last=c;
    while(lq.length&&lq[0][0]<=now+.012){const l=lq.shift()[1],led=box.querySelector(`.stu-lane[data-l="${l}"] .led`);if(led)pop(led)}
    const ph=box.querySelector('.stu-ph');
    if(last){const st=last[0],pg=Math.floor(st/PAGE),vis=S.bars===1||pg===page;
      if(ph){ph.hidden=!vis;if(vis){const fr=Math.min(1,Math.max(0,(now-last[1])/sd()));ph.style.transform=`translateX(${(((st%PAGE)+fr)*100).toFixed(1)}%)`}}
      if(st!==lastStep){lastStep=st;const col=st%PAGE;box.querySelectorAll('.stu-p.col,.stu-rc.col').forEach(e=>e.classList.remove('col'));
        if(vis){box.querySelectorAll(`.stu-p[data-s="${col}"],.stu-rc[data-s="${col}"]`).forEach(e=>{e.classList.add('col');if(e.getAttribute('aria-pressed')==='true'&&!S.mu[e.dataset.l||sel])pop(e)})}}}}
  else if(tail>0)tail--;
  viz();if(!playing&&tail<=0){cancelAnimationFrame(raf);raf=0}}
/* spectrum next to the transport */
let vzW=0,vzH=0,vzData=null,vzCol=null;
function viz(){const cv=box.querySelector('.stu-viz');if(!cv)return;const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.round(cv.clientWidth*dpr),h=Math.round(cv.clientHeight*dpr);if(!w||!h)return;
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}const g=cv.getContext('2d');g.clearRect(0,0,w,h);
  const an=A()&&A().an?A().an():null,n=44;if(!vzData||vzData.length!==(an?an.frequencyBinCount:0))vzData=an?new Uint8Array(an.frequencyBinCount):null;
  if(an&&playing)an.getByteFrequencyData(vzData);else if(vzData)vzData.fill(0);
  const cs=getComputedStyle(cv),c1=cs.getPropertyValue('--vz1').trim()||'#f08a4b',c2=cs.getPropertyValue('--vz2').trim()||'#8fb0c8';
  const grad=g.createLinearGradient(0,h,0,0);grad.addColorStop(0,c2);grad.addColorStop(1,c1);g.fillStyle=grad;
  const bw=w/n,gap=Math.max(1,bw*.22);for(let i=0;i<n;i++){let v=0;if(vzData){const a0=Math.floor(Math.pow(i/n,1.6)*vzData.length*.8)+1,a1=Math.max(a0+1,Math.floor(Math.pow((i+1)/n,1.6)*vzData.length*.8)+1);let m=0;for(let k=a0;k<a1&&k<vzData.length;k++)m=Math.max(m,vzData[k]);v=m/255}
    const bh=Math.max(2*dpr,Math.pow(v,1.3)*h*.96),x=i*bw;g.globalAlpha=playing?.92:.35;g.fillRect(x+gap/2,h-bh,bw-gap,bh)}g.globalAlpha=1}

/* ---------- drawing ---------- */
const on=(l,r,s)=>l==='bs'?S.bs[s]===r:ML.includes(l)?!!(S[l][s]&(1<<r)):0;
function laneName(l){return T().lanes[l]}
function laneSub(l){if(SL.includes(l))return nm(S.smp[l]);if(ML.includes(l))return nm(S.ins[l]);return S.kit==='classic'?nm('kit_classic'):nm('k_'+S.kit)}
function miniHTML(l){const o=page*PAGE;let h='';for(let s=0;s<PAGE;s++){let d='';
    if(l==='bs'){const r=S.bs[o+s];if(r>=0)d=`<s style="bottom:${(4+r/7*84).toFixed(0)}%"></s>`}
    else for(let r=0;r<8;r++)if(S[l][o+s]&(1<<r))d+=`<s style="bottom:${(4+r/7*84).toFixed(0)}%"></s>`;
    h+=`<i class="${s%4===0?'q':''}">${d}</i>`}return h}
function laneHTML(l){const t=T(),isM=ML.includes(l),o=page*PAGE;let cells='';
  if(isM)cells=`<div class="stu-mini" data-sel="${l}" role="button" tabindex="0" aria-label="${esc(laneName(l))}">${miniHTML(l)}</div>`;
  else{cells='<div class="stu-cells" role="group" aria-label="'+esc(laneName(l))+'">';for(let s=0;s<PAGE;s++)cells+=`<button type="button" class="stu-p${Math.floor(s/4)%2?' alt':''}" data-l="${l}" data-s="${s}" aria-pressed="${!!S.d[l][o+s]}" aria-label="${esc(laneName(l))} · ${t.step} ${o+s+1}"></button>`;cells+='</div>'}
  return `<div class="stu-lane${l===sel?' sel':''}${S.mu[l]?' mu':''}" data-l="${l}" style="--c:${LC[l]}"><div class="stu-lh"><button type="button" class="stu-mu" data-mu="${l}" aria-pressed="${!!S.mu[l]}" aria-label="${esc(t.mute)}: ${esc(laneName(l))}"><i class="led"></i></button><button type="button" class="stu-lb" data-sel="${l}" aria-pressed="${l===sel}"><span>${esc(laneName(l))}</span><small>${esc(laneSub(l))}</small></button></div>${cells}</div>`}
function boardHTML(){const t=T();let nums='<div class="stu-nums"><span></span><div>';for(let s=0;s<PAGE;s++)nums+=`<i class="${s%4===0?'q':''}">${page*PAGE+s+1}</i>`;nums+='</div></div>';
  return `<div class="stu-grid">${nums}${ALL.map(laneHTML).join('')}<div class="stu-pa" aria-hidden="true"><div class="stu-ph" hidden></div></div></div>`}
function pickerHTML(l){const isS=SL.includes(l);let groups,cur;
  if(isS){groups=['cty','prc','fxs','vox'].map(c=>({k:'g_'+c,ids:SMPK().filter(i=>D11S.SMP[i].cat===c)}));cur=S.smp[l]}
  else{groups=(l==='bs'?['bas','cls']:['syn','key','plk','pad','cls']).map(c=>({k:'g_'+c,ids:INSK().filter(i=>D11S.INS[i].cat===c&&D11S.INS[i].fo.split(' ').includes(l))}));cur=S.ins[l]}
  return groups.filter(g=>g.ids.length).map(g=>`<div class="stu-grp"><span>${esc(nm(g.k))}</span><div>${g.ids.map(i=>`<button type="button" class="stu-chip" data-pick="${i}" aria-pressed="${i===cur}">${esc(nm(i))}</button>`).join('')}</div></div>`).join('')}
function rollHTML(l){const o=page*PAGE;let h='<div class="stu-roll" role="grid">';
  for(let r=7;r>=0;r--){h+=`<div class="stu-rr" style="--hue:${(18+r*37)%360}"><span class="stu-rl mono">${esc(noteName(midi(l,r)))}</span><div class="stu-rcs">`;
    for(let s=0;s<PAGE;s++)h+=`<button type="button" class="stu-rc${Math.floor(s/4)%2?' alt':''}" data-r="${r}" data-s="${s}" aria-pressed="${on(l,r,o+s)}" aria-label="${esc(noteName(midi(l,r)))} · ${T().step} ${o+s+1}"></button>`;h+='</div></div>'}
  return h+'</div>'}
function edHTML(){const t=T(),l=sel,isM=ML.includes(l),isS=SL.includes(l);let h=`<div class="stu-edh"><b style="--c:${LC[l]}">${esc(t.editing)}: ${esc(laneName(l))}</b>`;
  if(isM)h+=`<label class="stu-sel"><span>${esc(t.key)}</span><select data-k="k">${KEYN.map((k,i)=>`<option value="${i}"${i===S.k?' selected':''}>${k}</option>`).join('')}</select></label><label class="stu-sel"><span>${esc(t.scale)}</span><select data-k="md">${SCN.map(k=>`<option value="${k}"${k===S.md?' selected':''}>${esc(t.scales[k])}</option>`).join('')}</select></label>`;
  h+='</div>';
  if(isM)h+=rollHTML(l)+`<h4 class="stu-h4">${esc(t.pickI)}</h4><div class="stu-pk">${pickerHTML(l)}</div>`;
  else if(isS)h+=`<h4 class="stu-h4">${esc(t.pickS)}</h4><div class="stu-pk">${pickerHTML(l)}</div>`;
  else h+=`<p class="stu-kh">${esc(t.kitHint)}</p>`;
  return h}
function chips(list,cur,attr,lab){return list.map(k=>`<button type="button" class="stu-chip" data-${attr}="${k}" aria-pressed="${k===cur}">${esc(lab(k))}</button>`).join('')}
function draw(){const t=T();if(!window.D11S){box.innerHTML='<p>…</p>';return}
  const hd=`<div class="head"><div><div class="code"><b>02</b><span>${esc(t.code)}</span></div><h2>${esc(t.h)}</h2></div><p class="lede">${esc(t.p)}</p></div>`;
  box.innerHTML=hd+`<div class="stu">
<div class="stu-top"><button type="button" class="btn primary stu-play" aria-pressed="false"><span class="stu-pi">▶</span> <span class="stu-pt">${esc(t.play)}</span></button>
<div class="stu-bpm" role="group" aria-label="${esc(t.bpm)}"><button type="button" data-bpm="-1" aria-label="−">−</button><div><b class="mono" data-o="bpm">${S.bpm}</b><small>${esc(t.bpm)}</small></div><button type="button" data-bpm="1" aria-label="+">+</button><button type="button" class="stu-tap" data-a="tap" title="${esc(t.tapT)}">${esc(t.tap)}</button></div>
<canvas class="stu-viz" aria-hidden="true"></canvas></div>
<div class="stu-sets"><div class="stu-set"><span>${esc(t.style)}</span><div>${chips(PIDS,S.pr,'pr',k=>t.styles[k])}</div></div>
<div class="stu-set"><span>${esc(t.kit)}</span><div>${chips(KITS,S.kit,'kit',k=>k==='classic'?nm('kit_classic'):nm('k_'+k))}</div></div>
<div class="stu-set"><span>${esc(t.len)}</span><div>${chips(['1','2'],String(S.bars),'bars',k=>k==='1'?t.bar1:t.bar2)}<em class="stu-pg">${pgHTML(t)}</em></div></div></div>
<div class="stu-board">${boardHTML()}</div>
<div class="stu-ed">${edHTML()}</div>
<div class="stu-act"><button type="button" class="btn ghost" data-a="rnd" title="${esc(t.rndT)}">${esc(t.rnd)}</button><button type="button" class="btn ghost" data-a="clr">${esc(t.clr)}</button><button type="button" class="btn ghost" data-a="sur" title="${esc(t.surT)}">${esc(t.sur)}</button><button type="button" class="btn ghost" data-a="clrall">${esc(t.clrAll)}</button><button type="button" class="btn ghost" data-a="share">${esc(t.share)}</button></div>
<details class="stu-more"><summary>${esc(t.more)}</summary><div class="stu-mrow"><label class="stu-f"><span>${esc(t.swing)} <b class="mono" data-o="sw">${S.sw}%</b></span><input type="range" min="0" max="50" step="1" value="${S.sw}" data-k="sw"></label>
<label class="stu-f"><span>${esc(t.vol)}</span><input type="range" min="0" max="100" step="1" value="${Math.round((A()&&A().getVol?A().getVol():.8)*100)}" data-k="vol"></label>
<div class="stu-set"><span>${esc(t.listen)}</span><div>${chips(['clean','bus','phone','tape'],S.fx,'fx',k=>t.fx[k])}</div></div></div></details>
<p class="stu-msg" role="status" aria-live="polite"></p><p class="stu-hint mono">${esc(t.hint)}</p></div><p class="stu-note">${esc(t.note)}</p>`;
  btn();viz();if(msg){say(T()[msg]||msg);msg=''}}
function redrawBoard(){const b=box.querySelector('.stu-board');if(b)b.innerHTML=boardHTML()}
function redrawEd(){const e=box.querySelector('.stu-ed');if(e)e.innerHTML=edHTML()}
function sync(){const o=page*PAGE;DL.forEach(l=>box.querySelectorAll(`.stu-p[data-l="${l}"]`).forEach(c=>c.setAttribute('aria-pressed',!!S.d[l][o+ +c.dataset.s])));
  ML.forEach(l=>{const m=box.querySelector(`.stu-lane[data-l="${l}"] .stu-mini`);if(m)m.innerHTML=miniHTML(l)});
  if(ML.includes(sel))box.querySelectorAll('.stu-rc').forEach(c=>c.setAttribute('aria-pressed',on(sel,+c.dataset.r,o+ +c.dataset.s)))}
function labels(){ALL.forEach(l=>{const s=box.querySelector(`.stu-lane[data-l="${l}"] .stu-lb small`);if(s)s.textContent=laneSub(l)})}
function say(s,link){const p=box.querySelector('.stu-msg');if(!p)return;p.textContent=s;if(link){const i=document.createElement('input');i.type='text';i.readOnly=true;i.value=link;i.className='sq-link';p.appendChild(i);i.focus();i.select()}}
const pgHTML=t=>S.bars===2?['0','1'].map(p=>`<button type="button" class="stu-chip" data-page="${p}" aria-pressed="${+p===page}">${esc((t||T()).barN)} ${+p+1}</button>`).join(''):'';
const updPg=()=>{const e=box.querySelector('.stu-pg');if(e)e.innerHTML=pgHTML()};
const edited=()=>{S.pr='';box.querySelectorAll('[data-pr]').forEach(b=>b.setAttribute('aria-pressed','false'));save()};

/* ---------- editing ---------- */
function setCell(l,r,s,v,silent){const j=page*PAGE+s;
  if(DL.includes(l))S.d[l][j]=v?1:0;else if(l==='bs')S.bs[j]=v?r:-1;else S[l][j]=v?(S[l][j]|(1<<r)):(S[l][j]&~(1<<r));
  if(!silent&&v&&!playing)audition(l,r);edited()}
function cellVal(c){const l=c.classList.contains('stu-p')?c.dataset.l:sel,r=c.classList.contains('stu-p')?0:+c.dataset.r,s=+c.dataset.s;return {l,r,s,v:DL.includes(l)?!!S.d[l][page*PAGE+s]:on(l,r,page*PAGE+s)}}
let paint=null,touch=null;
function apply(c,v){const x=cellVal(c);setCell(x.l,x.r,x.s,v);sync()}
function begin(c){const x=cellVal(c),v=!x.v;paint={v,last:c,kind:c.classList.contains('stu-p')?'p':'r'};apply(c,v);c.dataset.done='1'}
box.addEventListener('pointerdown',e=>{const c=e.target.closest&&e.target.closest('.stu-p,.stu-rc');if(!c)return;
  if(e.pointerType==='mouse'){if(e.button!==0)return;e.preventDefault();begin(c)}else touch={c,x:e.clientX,y:e.clientY}});
box.addEventListener('pointermove',e=>{
  if(touch&&!paint){const dx=Math.abs(e.clientX-touch.x),dy=Math.abs(e.clientY-touch.y);if(dx>9&&dx>dy){begin(touch.c);touch.moved=1}else if(dy>9)touch=null;return}
  if(!paint)return;const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest&&el.closest(paint.kind==='p'?'.stu-p':'.stu-rc');if(!c||c===paint.last||!box.contains(c))return;paint.last=c;if(cellVal(c).v!==paint.v)apply(c,paint.v)});
function endPaint(){if(touch&&!paint&&!touch.moved){const c=touch.c;begin(c)}paint=null;touch=null}
addEventListener('pointerup',endPaint);addEventListener('pointercancel',()=>{paint=null;touch=null});
function setBpm(v){S.bpm=Math.min(200,Math.max(60,Math.round(v)));const o=box.querySelector('[data-o="bpm"]');if(o)o.textContent=S.bpm;edited()}
let hold=0,holdI=0;
function holdStop(){clearTimeout(hold);clearInterval(holdI)}
box.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('[data-bpm]');if(!b)return;const d=+b.dataset.bpm;setBpm(S.bpm+d);holdStop();hold=setTimeout(()=>{holdI=setInterval(()=>setBpm(S.bpm+d*(e.shiftKey?5:1)),70)},420)});
addEventListener('pointerup',holdStop);addEventListener('pointercancel',holdStop);
let taps=[];
function tap(){const n=performance.now();if(taps.length&&n-taps[taps.length-1]>2000)taps=[];taps.push(n);if(taps.length>5)taps.shift();if(taps.length>1){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1);setBpm(60000/iv)}}
function rndLane(l){const R=Math.random,o=page*PAGE,N=PAGE,idx=a=>a[Math.floor(R()*a.length)];
  for(let s=0;s<N;s++){const j=o+s;
    if(l==='kick')S.d.kick[j]=s%8===0?(R()<.92?1:0):(s%4===0?(R()<.18?1:0):(R()<.12?1:0));
    else if(l==='snare')S.d.snare[j]=s%8===4?1:(R()<.05?1:0);
    else if(l==='clap')S.d.clap[j]=s%8===4?(R()<.7?1:0):0;
    else if(l==='hat')S.d.hat[j]=s%2===0?(R()<.88?1:0):(R()<.22?1:0);
    else if(l==='oh')S.d.oh[j]=s%4===2?(R()<.55?1:0):0;
    else if(SL.includes(l))S.d[l][j]=R()<.1?1:0;
    else if(l==='bs'){const root=idx([0,0,0,5,4,6]);S.bs[j]=s%4===0?(R()<.9?root:-1):(R()<(s%2?.1:.3)?idx([root,root,(root+4)%8]):-1)}
    else if(l==='ch'){S.ch[j]=0}
    else if(l==='ld'){}}
  if(l==='ch'){const roots=[0,2,5,4,6];[2,6,10,14].forEach(s=>{if(R()<.8){const r=idx(roots),m=(1<<r)|(1<<Math.min(7,r+2))|(1<<Math.min(7,r+4));S.ch[o+s]=m}})}
  if(l==='ld'){let d=idx([2,4,6]);for(let s=0;s<N;s++){const j=o+s;if(R()<(s%2?.32:.62)){d=Math.max(0,Math.min(7,d+idx([-2,-1,-1,0,1,1,2])));S.ld[j]=1<<d}else S.ld[j]=0}}}
function clearLane(l){for(let j=0;j<MAXS;j++){if(DL.includes(l))S.d[l][j]=0;else if(l==='bs')S.bs[j]=-1;else S[l][j]=0}}
function surprise(){const R=Math.random,idx=a=>a[Math.floor(R()*a.length)];const keep=S.pr;let id;do{id=idx(PIDS.filter(p=>p!=='empty'))}while(id===keep&&PIDS.length>2);
  applyPreset(id);if(R()<.55)S.kit=idx(KITS);const ins=INSK();ML.forEach(l=>{const c=ins.filter(i=>D11S.INS[i].fo.split(' ').includes(l)&&!(i.startsWith('cl_')||i.startsWith('cb_')));if(R()<.8)S.ins[l]=idx(c)});
  const sm=SMPK();if(R()<.7)S.smp.sa=idx(sm);S.k=Math.floor(R()*12);if(R()<.4)S.md=idx(['min','dor','pen','hm','blues']);if(S.md==='min'&&PRE[id]&&PRE[id].md==='maj')S.md='maj';
  S.bpm=Math.max(70,Math.min(160,S.bpm+Math.round((R()-.5)*12)));S.pr='';preloadAll()}
box.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('button');
  const c=e.target.closest&&e.target.closest('.stu-p,.stu-rc');if(c){if(c.dataset.done){delete c.dataset.done;return}if(e.detail===0){const x=cellVal(c);setCell(x.l,x.r,x.s,!x.v);sync()}return}
  const mini=e.target.closest&&e.target.closest('.stu-mini');if(mini){selectLane(mini.dataset.sel);return}
  if(!b)return;const d=b.dataset;
  if(b.classList.contains('stu-play')){playing?stop():start();return}
  if(d.sel){selectLane(d.sel);return}
  if(d.mu){S.mu[d.mu]=S.mu[d.mu]?0:1;const ln=box.querySelector(`.stu-lane[data-l="${d.mu}"]`);if(ln)ln.classList.toggle('mu',!!S.mu[d.mu]);b.setAttribute('aria-pressed',!!S.mu[d.mu]);return}
  if(d.pr){applyPreset(d.pr);if(playing){step=0;vq=[]}A()&&A().fx&&A().fx(S.fx);preloadAll();draw();save();if(!playing)start();return}
  if(d.kit){S.kit=d.kit;edited();preloadAll();box.querySelectorAll('[data-kit]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.kit===S.kit));labels();if(!playing){const ctx=ensure();if(ctx){const t=ctx.currentTime+.03;if(S.kit==='classic'){A().drum('kick',t,1,.55);A().drum('snare',t+.2,1,.55)}else{D11S.hit(ctx,LB.kick,D11S.KITS[S.kit].kick,t,1);D11S.hit(ctx,LB.snare,D11S.KITS[S.kit].snare,t+.22,1)}}}return}
  if(d.bars){const n=+d.bars;if(n!==S.bars){if(n===2){for(let j=PAGE;j<MAXS;j++){DL.forEach(l=>S.d[l][j]=S.d[l][j-PAGE]);S.bs[j]=S.bs[j-PAGE];S.ch[j]=S.ch[j-PAGE];S.ld[j]=S.ld[j-PAGE]}}S.bars=n;if(n===1)page=0;if(playing)step=0;box.querySelectorAll('[data-bars]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.bars===String(n)));updPg();redrawBoardAll();edited()}return}
  if(d.page!==undefined){page=+d.page;updPg();redrawBoardAll();return}
  if(d.fx){S.fx=d.fx;box.querySelectorAll('[data-fx]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.fx===S.fx));if(A()&&A().fx)A().fx(S.fx);save();return}
  if(d.pick){const l=sel;if(SL.includes(l))S.smp[l]=d.pick;else S.ins[l]=d.pick;edited();auditId(l,d.pick);box.querySelectorAll('.stu-pk [data-pick]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.pick===d.pick));labels();if(SL.includes(l))D11S.preload([d.pick]);return}
  if(d.a==='tap'){tap();return}
  if(d.a==='rnd'){rndLane(sel);edited();sync();if(!playing)start();return}
  if(d.a==='clr'){clearLane(sel);edited();sync();return}
  if(d.a==='clrall'){const bl=blank();S.d=bl.d;S.bs=bl.bs;S.ch=bl.ch;S.ld=bl.ld;edited();sync();say(T().cleared);return}
  if(d.a==='sur'){surprise();if(playing){step=0;vq=[]}draw();save();if(!playing)start();return}
  if(d.a==='share'){const u=location.origin+location.pathname+'#studio='+enc(),ok=()=>say(T().copied),bad=()=>say(T().copyMan,u);if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,bad);else bad()}});
function redrawBoardAll(){redrawBoard();redrawEd()}
function selectLane(l){if(l===sel)return;sel=l;box.querySelectorAll('.stu-lane').forEach(e=>e.classList.toggle('sel',e.dataset.l===l));box.querySelectorAll('.stu-lb').forEach(e=>e.setAttribute('aria-pressed',e.dataset.sel===l));redrawEd()}
box.addEventListener('keydown',e=>{const m=e.target.closest&&e.target.closest('.stu-mini');if(m&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectLane(m.dataset.sel)}});
box.addEventListener('input',e=>{const el=e.target,k=el.dataset&&el.dataset.k;if(!k)return;
  if(k==='sw'){S.sw=+el.value;const o=box.querySelector('[data-o="sw"]');if(o)o.textContent=S.sw+'%';edited()}
  else if(k==='vol'&&A()&&A().setVol)A().setVol(+el.value/100)});
box.addEventListener('change',e=>{const el=e.target,k=el.dataset&&el.dataset.k;if(!k||el.tagName!=='SELECT')return;if(k==='k')S.k=+el.value;else S.md=el.value;edited();redrawEd()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop()});
const ovl=el=>{const r=el.getBoundingClientRect();return Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0))};
function active(){const ph=document.getElementById('sq');return ovl(box)>120&&ovl(box)>(ph?ovl(ph):0)}
document.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target;
  if(tg&&tg.closest&&tg.closest('input,select,textarea,button,a,iframe,[contenteditable],dialog'))return;if(!active())return;e.preventDefault();playing?stop():start()});
addEventListener('d11lang',()=>setTimeout(draw,0));
window.D11STUDIO={stop:stop,active:active,playing:()=>playing,state:()=>S};
draw();
if(window.D11S)preloadAll();
if(msg==='fromLink')setTimeout(()=>{const e=document.getElementById('studio');if(e)e.scrollIntoView({block:'start'})},300);
})();
