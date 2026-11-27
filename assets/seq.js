/* Donetsk 2011 · mini step sequencer (v7.36, page «Музыка и звуки»)
   Rhythm, melody and bass on a 16-step grid (1 or 2 bars), all synthesised by Web Audio on the fly: no recordings, no samples.
   The presets are simple genre sketches in the spirit of what played in the city around 2010 (club house, pop on the minibus radio,
   chanson, yard rap, polyphonic ringtones). They are not real songs: no real melody is reproduced here.
   State lives in this browser (localStorage) and can be shared as a link (#seq=...). Nothing is uploaded, nothing is downloaded. */
(function(){
const box=document.getElementById('sq');if(!box)return;
const L=()=>{const l=(document.documentElement.lang||'ru').slice(0,2);return {ru:1,uk:1,en:1,fi:1}[l]?l:'ru'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- texts ---------- */
const TX={
ru:{code:'Секвенсор',h:'Собери рингтон Донецка 2010 года',
 p:'Собери мелодию, как на телефоне середины 2000-х: четыре дорожки, готовые блоки по такту, а потом поставь её на звонок. Во вкладке «Сетка шагов» можно писать по нотам в духе того, что звучало в городе около 2010 года: хаус, попса из маршрутки, шансон, рэп и рингтоны.',
 pre:'Заготовки',play:'Играть',stop:'Стоп',tempo:'Темп',swing:'Свинг',key:'Тональность',mode:'Лад',lead:'Звук мелодии',bass:'Звук баса',listen:'Где слушаем',vol:'Громкость',
 len:'Длина',bar1:'1 такт',bar2:'2 такта',bar:'Такт',
 tabs:{d:'Ритм',m:'Мелодия',b:'Бас'},
 modes:{min:'минор',hm:'гармонический минор',maj:'мажор'},
 rows:['Бочка','Малый','Хлопок','Хэт','Откр. хэт','Трамвай','Сигнал'],
 leads:{saw:'Суперпила (клуб)',sq:'Квадрат (рингтон)',reed:'Баян',keys:'Клавиши',pluck:'Щипок (гитара)'},
 basses:{saw:'Пила',sub:'Саб',pluck:'Щипок',sq:'Квадрат'},
 fx:{clean:'В наушниках',bus:'В маршрутке',phone:'С мобилки',tape:'С кассеты'},
 presets:{house:'Клуб · хаус',pop:'Попса из маршрутки',shan:'Шансон у ларька',rap:'Рэп во дворе',ring:'Рингтон на мобилке',city:'Город',empty:'Чистый лист'},
 rnd:'Случайно',clr:'Очистить дорожку',share:'Скопировать ссылку',copied:'Ссылка скопирована: в ней вся мелодия, пришли её другу.',copyMan:'Скопируй ссылку вручную:',
 fromLink:'Мелодия открыта из ссылки.',step:'шаг',noAudio:'Этот браузер не умеет синтезировать звук (нет Web Audio).',
 hint:'Пробел: играть или остановить. Нажатая клетка сразу звучит. Мелодия сохраняется в этом браузере.',
 note:'Заготовки не песни 2010 года, а простые ритмы и ходы в духе жанров; мелодии настоящих песен здесь не воспроизводятся. Весь звук синтезирует браузер на лету, без записей и семплов. Музыка самой игры пишется вручную, она будет в звуковом дневнике выше.'},
uk:{code:'Секвенсор',h:'Збери рингтон Донецька 2010 року',
 p:'Збери мелодію, як на телефоні середини 2000-х: чотири доріжки, готові блоки по такту, а потім постав її на дзвінок. У вкладці «Сітка кроків» можна писати по нотах у дусі того, що звучало в місті близько 2010 року: хаус, попса з маршрутки, шансон, реп і рингтони.',
 pre:'Заготовки',play:'Грати',stop:'Стоп',tempo:'Темп',swing:'Свінг',key:'Тональність',mode:'Лад',lead:'Звук мелодії',bass:'Звук басу',listen:'Де слухаємо',vol:'Гучність',
 len:'Довжина',bar1:'1 такт',bar2:'2 такти',bar:'Такт',
 tabs:{d:'Ритм',m:'Мелодія',b:'Бас'},
 modes:{min:'мінор',hm:'гармонічний мінор',maj:'мажор'},
 rows:['Бочка','Малий','Плеск','Хет','Відкр. хет','Трамвай','Сигнал'],
 leads:{saw:'Суперпила (клуб)',sq:'Квадрат (рингтон)',reed:'Баян',keys:'Клавіші',pluck:'Щипок (гітара)'},
 basses:{saw:'Пила',sub:'Саб',pluck:'Щипок',sq:'Квадрат'},
 fx:{clean:'У навушниках',bus:'У маршрутці',phone:'З мобілки',tape:'З касети'},
 presets:{house:'Клуб · хаус',pop:'Попса з маршрутки',shan:'Шансон біля кіоску',rap:'Реп у дворі',ring:'Рингтон на мобілці',city:'Місто',empty:'Чистий аркуш'},
 rnd:'Випадково',clr:'Очистити доріжку',share:'Скопіювати посилання',copied:'Посилання скопійовано: у ньому вся мелодія, надішли його другові.',copyMan:'Скопіюй посилання вручну:',
 fromLink:'Мелодію відкрито з посилання.',step:'крок',noAudio:'Цей браузер не вміє синтезувати звук (немає Web Audio).',
 hint:'Пробіл: грати або зупинити. Натиснута клітинка одразу звучить. Мелодія зберігається в цьому браузері.',
 note:'Заготовки не пісні 2010 року, а прості ритми й ходи в дусі жанрів; мелодії справжніх пісень тут не відтворюються. Увесь звук синтезує браузер на льоту, без записів і семплів. Музика самої гри пишеться вручну, вона буде у звуковому щоденнику вище.'},
en:{code:'Sequencer',h:'Build a Donetsk 2010 ringtone',
 p:'Build a tune like on a mid-2000s phone: four tracks, ready-made one-bar blocks, then set it as your ringtone. Under Step grid you can write note by note in the spirit of what played in the city around 2010: house, minibus pop, chanson, rap and ringtones.',
 pre:'Presets',play:'Play',stop:'Stop',tempo:'Tempo',swing:'Swing',key:'Key',mode:'Scale',lead:'Melody sound',bass:'Bass sound',listen:'Where we listen',vol:'Volume',
 len:'Length',bar1:'1 bar',bar2:'2 bars',bar:'Bar',
 tabs:{d:'Rhythm',m:'Melody',b:'Bass'},
 modes:{min:'minor',hm:'harmonic minor',maj:'major'},
 rows:['Kick','Snare','Clap','Hi-hat','Open hat','Tram','Pip'],
 leads:{saw:'Supersaw (club)',sq:'Square (ringtone)',reed:'Bayan accordion',keys:'Keys',pluck:'Pluck (guitar)'},
 basses:{saw:'Saw',sub:'Sub',pluck:'Pluck',sq:'Square'},
 fx:{clean:'On headphones',bus:'In a marshrutka',phone:'From a phone',tape:'From a cassette'},
 presets:{house:'Club · house',pop:'Minibus radio pop',shan:'Kiosk chanson',rap:'Yard rap',ring:'Phone ringtone',city:'City',empty:'Blank page'},
 rnd:'Random',clr:'Clear track',share:'Copy link',copied:'Link copied: the whole tune is in it, send it to a friend.',copyMan:'Copy the link by hand:',
 fromLink:'Tune opened from a link.',step:'step',noAudio:'This browser cannot synthesise sound (no Web Audio).',
 hint:'Space: play or stop. A cell sounds as soon as you press it. The tune is saved in this browser.',
 note:'The presets are not songs from 2010 but simple rhythms and moves in the spirit of the genres; no real song’s melody is reproduced here. All sound is synthesised by the browser on the fly, with no recordings or samples. The music of the game itself is written by hand and will appear in the sound diary above.'},
fi:{code:'Sekvensseri',h:'Sävellä Donetskin 2010 soittoääni',
 p:'Kokoa melodia kuin 2000-luvun puolivälin puhelimessa: neljä raitaa, valmiita yhden tahdin lohkoja, ja aseta se sitten soittoääneksi. Askelruudukko-välilehdellä voi kirjoittaa nuotti kerrallaan siihen henkeen, mitä kaupungissa soi vuoden 2010 tienoilla: housea, marsrutkan poppia, šansonia, räppiä ja soittoääniä.',
 pre:'Pohjat',play:'Soita',stop:'Seis',tempo:'Tempo',swing:'Swing',key:'Sävellaji',mode:'Asteikko',lead:'Melodian ääni',bass:'Basson ääni',listen:'Missä kuunnellaan',vol:'Äänenvoimakkuus',
 len:'Pituus',bar1:'1 tahti',bar2:'2 tahtia',bar:'Tahti',
 tabs:{d:'Rytmi',m:'Melodia',b:'Basso'},
 modes:{min:'molli',hm:'harmoninen molli',maj:'duuri'},
 rows:['Bassorumpu','Virveli','Taputus','Hi-hat','Avoin hat','Raitiovaunu','Aikamerkki'],
 leads:{saw:'Supersaha (klubi)',sq:'Kantti (soittoääni)',reed:'Bajaani',keys:'Koskettimet',pluck:'Näppäys (kitara)'},
 basses:{saw:'Saha',sub:'Sub',pluck:'Näppäys',sq:'Kantti'},
 fx:{clean:'Kuulokkeista',bus:'Marsrutkassa',phone:'Puhelimesta',tape:'Kasetilta'},
 presets:{house:'Klubi · house',pop:'Marsrutkan radiopop',shan:'Kioskin šanson',rap:'Piharäppi',ring:'Puhelimen soittoääni',city:'Kaupunki',empty:'Tyhjä'},
 rnd:'Satunnainen',clr:'Tyhjennä raita',share:'Kopioi linkki',copied:'Linkki kopioitu: koko melodia on siinä, lähetä se ystävälle.',copyMan:'Kopioi linkki käsin:',
 fromLink:'Melodia avattiin linkistä.',step:'askel',noAudio:'Tämä selain ei osaa syntetisoida ääntä (ei Web Audiota).',
 hint:'Välilyönti: soita tai pysäytä. Painettu ruutu soi heti. Melodia tallentuu tähän selaimeen.',
 note:'Pohjat eivät ole vuoden 2010 kappaleita vaan yksinkertaisia rytmejä ja kulkuja tyylilajien hengessä; oikeiden laulujen melodioita ei toisteta. Kaikki ääni syntyy selaimessa lennossa, ilman äänitteitä tai sampleja. Itse pelin musiikki kirjoitetaan käsin, ja se tulee yllä olevaan äänipäiväkirjaan.'}
};
const T=()=>TX[L()];
const PHT={"ru": {"mode": {"phone": "Телефон", "grid": "Сетка шагов"}, "title": "Композитор", "aria": "Телефон с композитором мелодий", "tracks": ["Ударные", "Бас", "Аккорды", "Акценты"], "trs": ["Удр", "Бас", "Акк", "Акц"], "groups": ["Вступление", "Куплет", "Припев", "Брейк"], "play": "Играть", "stop": "Стоп", "more": "Ещё", "sel": "Выбрать", "back": "Назад", "ins": "Вставить", "edit": "Изменить", "m_ins": "Вставить блок", "m_copy": "Копировать", "m_paste": "Вставить", "m_del": "Удалить блок", "m_tempo": "Темп", "m_vol": "Громкость", "m_spk": "Звук: динамик телефона", "m_hp": "Звук: наушники", "m_demo": "Демо-мелодия", "m_clear": "Очистить всё", "m_share": "Поделиться ссылкой", "m_grp": "Выбор группы", "empty": "пусто", "bar": "Такт", "bpm": "уд/мин", "copied": "Блок скопирован", "nothing": "Буфер пуст", "pasted": "Блок вставлен", "deleted": "Блок удалён", "cleared": "Мелодия очищена", "demo": "Демо загружено", "confirm": "Очистить всю мелодию?", "yes": "Да", "no": "Нет", "linkOk": "Ссылка скопирована: пришли её другу", "linkMan": "Скопируй ссылку вручную:", "fromLink": "Мелодия открыта из ссылки", "keys": {"1": "Вст", "2": "Куп", "3": "Прп", "4": "Брк", "5": "▶", "7": "−темп", "9": "+темп", "0": "Удал", "*": "Копир", "#": "Встав"}, "helpH": "Как пользоваться", "help": ["Джойстик или стрелки на клавиатуре двигают рамку по дорожкам и тактам.", "Центр джойстика (Enter) вставляет блок: сначала группа, потом сам блок. Пока листаешь список, блок играет.", "Левая софт-клавиша или пробел играют мелодию с текущего такта, правая открывает меню.", "Цифры: 1–4 сразу открывают вступление, куплет, припев и брейк; 0 удаляет блок; * копирует, # вставляет; 7 и 9 меняют темп.", "Блоки с одинаковым номером в басу, аккордах и акцентах звучат в одной гармонии."], "about": "Так были устроены композиторы мелодий на телефонах Sony Ericsson середины 2000-х: четыре дорожки (ударные, бас, аккорды и акценты) и готовые блоки по такту, разложенные на вступление, куплет, припев и брейк. Блоки и звуки здесь свои, а не из телефона: полифония собрана из FM-синтеза, как у мелодий тех лет, и по умолчанию звучит через «маленький динамик». Можно поставить до 32 тактов."}, "uk": {"mode": {"phone": "Телефон", "grid": "Сітка кроків"}, "title": "Композитор", "aria": "Телефон із композитором мелодій", "tracks": ["Ударні", "Бас", "Акорди", "Акценти"], "trs": ["Удр", "Бас", "Акр", "Акц"], "groups": ["Вступ", "Куплет", "Приспів", "Брейк"], "play": "Грати", "stop": "Стоп", "more": "Ще", "sel": "Вибрати", "back": "Назад", "ins": "Вставити", "edit": "Змінити", "m_ins": "Вставити блок", "m_copy": "Копіювати", "m_paste": "Вставити", "m_del": "Видалити блок", "m_tempo": "Темп", "m_vol": "Гучність", "m_spk": "Звук: динамік телефона", "m_hp": "Звук: навушники", "m_demo": "Демо-мелодія", "m_clear": "Очистити все", "m_share": "Поділитися посиланням", "m_grp": "Вибір групи", "empty": "порожньо", "bar": "Такт", "bpm": "уд/хв", "copied": "Блок скопійовано", "nothing": "Буфер порожній", "pasted": "Блок вставлено", "deleted": "Блок видалено", "cleared": "Мелодію очищено", "demo": "Демо завантажено", "confirm": "Очистити всю мелодію?", "yes": "Так", "no": "Ні", "linkOk": "Посилання скопійовано: надішли його другові", "linkMan": "Скопіюй посилання вручну:", "fromLink": "Мелодію відкрито з посилання", "keys": {"1": "Вст", "2": "Куп", "3": "Прс", "4": "Брк", "5": "▶", "7": "−темп", "9": "+темп", "0": "Вид", "*": "Коп", "#": "Встав"}, "helpH": "Як користуватися", "help": ["Джойстик або стрілки на клавіатурі рухають рамку доріжками й тактами.", "Центр джойстика (Enter) вставляє блок: спершу група, потім сам блок. Поки гортаєш список, блок грає.", "Ліва софт-клавіша або пробіл грають мелодію з поточного такту, права відкриває меню.", "Цифри: 1–4 одразу відкривають вступ, куплет, приспів і брейк; 0 видаляє блок; * копіює, # вставляє; 7 і 9 змінюють темп.", "Блоки з однаковим номером у басі, акордах і акцентах звучать в одній гармонії."], "about": "Так були влаштовані композитори мелодій на телефонах Sony Ericsson середини 2000-х: чотири доріжки (ударні, бас, акорди й акценти) і готові блоки по такту, розкладені на вступ, куплет, приспів і брейк. Блоки й звуки тут свої, а не з телефона: поліфонію зібрано з FM-синтезу, як у мелодій тих років, і за замовчуванням вона звучить через «маленький динамік». Можна поставити до 32 тактів."}, "en": {"mode": {"phone": "Phone", "grid": "Step grid"}, "title": "Composer", "aria": "Phone with a tune composer", "tracks": ["Drums", "Bass", "Chords", "Accents"], "trs": ["Drm", "Bas", "Chd", "Acc"], "groups": ["Intro", "Verse", "Chorus", "Break"], "play": "Play", "stop": "Stop", "more": "More", "sel": "Select", "back": "Back", "ins": "Insert", "edit": "Change", "m_ins": "Insert block", "m_copy": "Copy", "m_paste": "Paste", "m_del": "Delete block", "m_tempo": "Tempo", "m_vol": "Volume", "m_spk": "Sound: phone speaker", "m_hp": "Sound: headphones", "m_demo": "Demo tune", "m_clear": "Clear all", "m_share": "Share link", "m_grp": "Choose group", "empty": "empty", "bar": "Bar", "bpm": "bpm", "copied": "Block copied", "nothing": "Nothing to paste", "pasted": "Block pasted", "deleted": "Block deleted", "cleared": "Tune cleared", "demo": "Demo loaded", "confirm": "Clear the whole tune?", "yes": "Yes", "no": "No", "linkOk": "Link copied: send it to a friend", "linkMan": "Copy the link by hand:", "fromLink": "Tune opened from a link", "keys": {"1": "Intr", "2": "Vrs", "3": "Chor", "4": "Brk", "5": "▶", "7": "−bpm", "9": "+bpm", "0": "Del", "*": "Copy", "#": "Paste"}, "helpH": "How to use it", "help": ["The joystick or the arrow keys move the frame across tracks and bars.", "The joystick centre (Enter) inserts a block: first the group, then the block itself. The block plays while you scroll the list.", "The left soft key or Space plays the tune from the current bar; the right one opens the menu.", "Digits: 1–4 open intro, verse, chorus and break straight away; 0 deletes a block; * copies, # pastes; 7 and 9 change the tempo.", "Blocks with the same number in bass, chords and accents share one harmony."], "about": "This is how the tune composers on mid-2000s Sony Ericsson phones worked: four tracks (drums, bass, chords and accents) and ready-made one-bar blocks sorted into intro, verse, chorus and break. The blocks and sounds here are our own, not taken from a phone: the polyphony is built from FM synthesis, like ringtones of the time, and by default plays through a “small speaker”. A tune can be up to 32 bars."}, "fi": {"mode": {"phone": "Puhelin", "grid": "Askelruudukko"}, "title": "Säveltäjä", "aria": "Puhelin, jossa on melodiasäveltäjä", "tracks": ["Rummut", "Basso", "Soinnut", "Aksentit"], "trs": ["Rum", "Bas", "Soi", "Aks"], "groups": ["Intro", "Säkeistö", "Kertosäe", "Break"], "play": "Soita", "stop": "Seis", "more": "Lisää", "sel": "Valitse", "back": "Takaisin", "ins": "Lisää", "edit": "Vaihda", "m_ins": "Lisää lohko", "m_copy": "Kopioi", "m_paste": "Liitä", "m_del": "Poista lohko", "m_tempo": "Tempo", "m_vol": "Äänenvoimakkuus", "m_spk": "Ääni: puhelimen kaiutin", "m_hp": "Ääni: kuulokkeet", "m_demo": "Esimerkkimelodia", "m_clear": "Tyhjennä kaikki", "m_share": "Jaa linkki", "m_grp": "Valitse ryhmä", "empty": "tyhjä", "bar": "Tahti", "bpm": "bpm", "copied": "Lohko kopioitu", "nothing": "Ei liitettävää", "pasted": "Lohko liitetty", "deleted": "Lohko poistettu", "cleared": "Melodia tyhjennetty", "demo": "Esimerkki ladattu", "confirm": "Tyhjennetäänkö koko melodia?", "yes": "Kyllä", "no": "Ei", "linkOk": "Linkki kopioitu: lähetä se ystävälle", "linkMan": "Kopioi linkki käsin:", "fromLink": "Melodia avattiin linkistä", "keys": {"1": "Intr", "2": "Säk", "3": "Kert", "4": "Brk", "5": "▶", "7": "−bpm", "9": "+bpm", "0": "Pois", "*": "Kop", "#": "Liitä"}, "helpH": "Näin se toimii", "help": ["Ohjain tai nuolinäppäimet siirtävät kehystä raidoilla ja tahdeissa.", "Ohjaimen keskikohta (Enter) lisää lohkon: ensin ryhmä, sitten itse lohko. Lohko soi, kun selaat listaa.", "Vasen valintanäppäin tai välilyönti soittaa melodian nykyisestä tahdista, oikea avaa valikon.", "Numerot: 1–4 avaavat suoraan intron, säkeistön, kertosäkeen ja breakin; 0 poistaa lohkon; * kopioi, # liittää; 7 ja 9 muuttavat tempoa.", "Saman numeron lohkot basossa, soinnuissa ja aksenteissa soivat samassa harmoniassa."], "about": "Näin toimivat 2000-luvun puolivälin Sony Ericsson -puhelinten melodiasäveltäjät: neljä raitaa (rummut, basso, soinnut ja aksentit) ja valmiita yhden tahdin lohkoja, jotka on jaettu introon, säkeistöön, kertosäkeeseen ja breakiin. Lohkot ja äänet ovat tässä omia, eivät puhelimesta: polyfonia on rakennettu FM-synteesillä kuten sen ajan soittoäänet, ja oletuksena se soi ”pienen kaiuttimen” kautta. Melodia voi olla enintään 32 tahtia."}};


/* ---------- model ---------- */
const NR=7, ROWS=['kick','snare','clap','hat','oh','tram','pip'], MAXS=32;
const KEYS={C:0,D:2,E:4,F:5,G:7,A:9}, NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const SC={min:[0,2,3,5,7,8,10,12],hm:[0,2,3,5,7,8,11,12],maj:[0,2,4,5,7,9,11,12]};
const LEADS=['saw','sq','reed','keys','pluck'], BASSES=['saw','sub','pluck','sq'], FXS=['clean','bus','phone','tape'], MODES=['min','hm','maj'];
const PRE={
 house:{bpm:124,sw:8,k:'A',md:'min',ld:'saw',bs:'saw',fx:'clean',d:{kick:'x...x...x...x...',clap:'....x.......x...',hat:'xx.xxx.xxx.xxx.x',oh:'..x...x...x...x.'},
  m:['','','024','','','','024','','','','257','','','','136',''],b:'..0..00...5..66.'},
 pop:{bpm:132,sw:0,k:'D',md:'min',ld:'saw',bs:'saw',fx:'bus',d:{kick:'x...x...x...x...',snare:'....x.......x...',hat:'.x.x.x.x.x.x.x.x',oh:'..x...x...x...x.'},
  m:['4','','4','5','4','','2','3','4','','7','6','4','','2','1'],b:'0.0.0.0.5.5.6.6.'},
 shan:{bpm:104,sw:0,k:'A',md:'hm',ld:'reed',bs:'pluck',fx:'tape',d:{kick:'x.......x.......',snare:'....x.......x...',hat:'..x...x...x...x.'},
  m:['7','','6','5','024','','4','','3','','4','5','146','','6',''],b:'0.......4.......'},
 rap:{bpm:88,sw:30,k:'E',md:'min',ld:'keys',bs:'sub',fx:'clean',d:{kick:'x......x..x.....',snare:'....x.......x...',hat:'x.x.x.x.x.x.x...',oh:'..............x.'},
  m:['024','','','4','','','257','','','','','3','','','136',''],b:'0......0..5...6.'},
 ring:{bpm:140,sw:0,k:'A',md:'min',ld:'sq',bs:'sq',fx:'phone',d:{kick:'x...x...x...x...',hat:'..x...x...x...x.'},
  m:['0','2','4','7','4','2','0','2','1','3','5','3','1','3','4',''],b:'0.......5...6...'},
 city:{bpm:92,sw:12,k:'G',md:'maj',ld:'keys',bs:'sub',fx:'tape',d:{kick:'x.......x.......',hat:'....x.......x...',tram:'x...............',pip:'..........x.x.x.'},
  m:['024','','','4','','','2','','357','','','5','','','4',''],b:'0.......3.......'},
 empty:null
};
const PIDS=Object.keys(PRE);
const blank=()=>({d:ROWS.map(()=>Array(MAXS).fill(0)),m:Array(MAXS).fill(0),b:Array(MAXS).fill(-1)});
let S=Object.assign({pr:'house',bpm:124,sw:8,k:'A',md:'min',ld:'saw',bs:'saw',fx:'clean',bars:1,vol:.8},blank());
function applyPreset(id){
  const p=PRE[id];S.pr=id;
  if(!p){const b=blank();S.d=b.d;S.m=b.m;S.b=b.b;return}
  Object.assign(S,{bpm:p.bpm,sw:p.sw,k:p.k,md:p.md,ld:p.ld,bs:p.bs,fx:p.fx,bars:1});
  const b=blank();
  ROWS.forEach((r,i)=>{const s=p.d[r]||'';for(let j=0;j<MAXS;j++)b.d[i][j]=s[j%16]==='x'?1:0});
  for(let j=0;j<MAXS;j++){const c=p.m[j%16]||'';let mk=0;for(const ch of c)mk|=1<<(+ch);b.m[j]=mk;const bc=p.b[j%16];b.b[j]=bc>='0'&&bc<='7'?+bc:-1}
  S.d=b.d;S.m=b.m;S.b=b.b;
}
applyPreset('house');

/* ---------- link / storage encoding ---------- */
const hex=(n,w)=>n.toString(16).padStart(w,'0');
function enc(){
  const d=S.d.map(r=>{let v=0;for(let j=0;j<MAXS;j++)if(r[j])v+=2**j;return hex(v,8)}).join('');
  const m=S.m.map(v=>hex(v,2)).join(''), b=S.b.map(v=>v<0?'x':String(v)).join('');
  return ['1',S.bpm,S.sw,S.k,S.md,S.ld,S.bs,S.fx,S.bars,d,m,b].join('_');
}
function dec(s){
  try{const a=String(s).split('_');if(a.length!==12||a[0]!=='1')return null;
    const n=Object.assign({},S,blank());
    n.bpm=Math.min(180,Math.max(60,parseInt(a[1],10)||120));n.sw=Math.min(50,Math.max(0,parseInt(a[2],10)||0));
    n.k=KEYS[a[3]]!==undefined?a[3]:'A';n.md=MODES.includes(a[4])?a[4]:'min';n.ld=LEADS.includes(a[5])?a[5]:'saw';
    n.bs=BASSES.includes(a[6])?a[6]:'saw';n.fx=FXS.includes(a[7])?a[7]:'clean';n.bars=a[8]==='2'?2:1;
    if(!/^[0-9a-f]{56}$/.test(a[9])||!/^[0-9a-f]{64}$/.test(a[10])||!/^[0-7x]{32}$/.test(a[11]))return null;
    for(let i=0;i<NR;i++){const v=parseInt(a[9].substr(i*8,8),16);for(let j=0;j<MAXS;j++)n.d[i][j]=Math.floor(v/2**j)%2}
    for(let j=0;j<MAXS;j++){n.m[j]=parseInt(a[10].substr(j*2,2),16);const c=a[11][j];n.b[j]=c==='x'?-1:+c}
    n.pr='';return n}catch(e){return null}
}
let msg='';
(function load(){
  const h=location.hash.match(/^#seq=([0-9a-zA-Z_]+)$/);
  if(h){const n=dec(h[1]);if(n){S=n;msg='fromLink';return}}
  try{const v=localStorage.getItem('d11-seq');if(v){const j=JSON.parse(v);const n=dec(j.s);if(n){S=n;S.pr=PIDS.includes(j.pr)?j.pr:'';if(typeof j.vol==='number')S.vol=Math.min(1,Math.max(0,j.vol))}}}catch(e){}
})();
let saveT=0;const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('d11-seq',JSON.stringify({s:enc(),pr:S.pr,vol:S.vol}))}catch(e){}},300)};

/* ---------- v7.37: phone composer, block-based like the tune composers on mid-2000s Sony Ericsson phones ----------
   Four tracks (drums, bass, chords, accents); each cell holds a one-bar block from one of four groups (intro, verse, chorus,
   break), eight blocks per group. All blocks are our own patterns; same-numbered blocks share a chord root (natural minor on A). */
let MODE='phone';try{const m=localStorage.getItem('d11-seq-mode');if(m==='grid')MODE='grid'}catch(e){}
const PHX={"ru": {"m_ring": "Поставить на звонок", "ringing": "Входящий вызов", "caller": "Мама", "answer": "Ответить", "reject": "Отклонить", "ringNote": "♪ твоя мелодия", "m_mine": "Мои мелодии", "slot": "Мелодия", "slotEmpty": "пусто", "s_open": "Открыть", "s_save": "Сохранить сюда", "saved": "Сохранено", "opened": "Открыто", "m_tracks": "Дорожки", "on": "вкл", "off": "выкл", "m_keys": "Звук клавиш", "len": "длина", "help2": "В меню «Ещё»: «Поставить на звонок» — входящий вызов с твоей мелодией, «Мои мелодии» — пять ячеек памяти, «Дорожки» — выключить любую из четырёх."}, "uk": {"m_ring": "Поставити на дзвінок", "ringing": "Вхідний виклик", "caller": "Мама", "answer": "Відповісти", "reject": "Відхилити", "ringNote": "♪ твоя мелодія", "m_mine": "Мої мелодії", "slot": "Мелодія", "slotEmpty": "порожньо", "s_open": "Відкрити", "s_save": "Зберегти сюди", "saved": "Збережено", "opened": "Відкрито", "m_tracks": "Доріжки", "on": "увімк", "off": "вимк", "m_keys": "Звук клавіш", "len": "довжина", "help2": "У меню «Ще»: «Поставити на дзвінок» — вхідний виклик із твоєю мелодією, «Мої мелодії» — п’ять комірок пам’яті, «Доріжки» — вимкнути будь-яку з чотирьох."}, "en": {"m_ring": "Set as ringtone", "ringing": "Incoming call", "caller": "Mum", "answer": "Answer", "reject": "Decline", "ringNote": "♪ your tune", "m_mine": "My tunes", "slot": "Tune", "slotEmpty": "empty", "s_open": "Open", "s_save": "Save here", "saved": "Saved", "opened": "Opened", "m_tracks": "Tracks", "on": "on", "off": "off", "m_keys": "Key sounds", "len": "length", "help2": "In the More menu: Set as ringtone plays an incoming call with your tune, My tunes has five memory slots, Tracks turns any of the four off."}, "fi": {"m_ring": "Aseta soittoääneksi", "ringing": "Saapuva puhelu", "caller": "Äiti", "answer": "Vastaa", "reject": "Hylkää", "ringNote": "♪ sinun melodiasi", "m_mine": "Omat melodiat", "slot": "Melodia", "slotEmpty": "tyhjä", "s_open": "Avaa", "s_save": "Tallenna tähän", "saved": "Tallennettu", "opened": "Avattu", "m_tracks": "Raidat", "on": "päällä", "off": "pois", "m_keys": "Näppäinäänet", "len": "kesto", "help2": "Lisää-valikossa: Aseta soittoääneksi soittaa saapuvan puhelun melodiallasi, Omat melodiat -kohdassa on viisi muistipaikkaa ja Raidat-kohdasta voi hiljentää minkä tahansa neljästä."}};for(const l in PHX)Object.assign(PHT[l],PHX[l]);
const PH=()=>PHT[L()];
const PNC=32,PROOT=[0,5,3,6,0,4,5,6],AM=[0,2,3,5,7,8,10];
const pdeg=(d,o)=>{const k=((d%7)+7)%7;return 57+AM[k]+12*Math.floor(d/7)+12*o};
const DRB=[
 [{hat:'x.x.x.x.x.x.x.x.'},{kick:'x.......x.......',hat:'..x...x...x...x.'},{hat:'xxxxxxxxxxxxxxxx'},{kick:'x...............',crash:'x...............'},
  {kick:'x.......x.......',hat:'x.x.x.x.x.x.x.x.'},{snare:'....x.......x...',hat:'x...x...x...x...'},{kick:'x..x..x.........',hat:'..x...x...x...x.'},{kick:'x...............',hat:'x.x.x.x.x.x.xxxx'}],
 [{kick:'x...x...x...x...',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.x.'},{kick:'x.....x...x.....',snare:'....x.......x...',hat:'xxxxxxxxxxxxxxxx'},
  {kick:'x...x...x...x...',clap:'....x.......x...',oh:'..x...x...x...x.'},{kick:'x..x....x.x.....',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.x.'},
  {kick:'x.......x.......',snare:'....x.......x..x',hat:'x.xxx.xxx.xxx.xx'},{kick:'x...x...x...x...',snare:'....x.......x...',hat:'.x.x.x.x.x.x.x.x'},
  {kick:'x......x..x.....',snare:'....x.......x...',hat:'x.x.x.x.x.x.x...',oh:'..............x.'},{kick:'x...x...x...x...',snare:'....x..x....x...',hat:'x.x.x.x.x.x.x.x.'}],
 [{kick:'x...x...x...x...',clap:'....x.......x...',hat:'xx.xxx.xxx.xxx.x',oh:'..x...x...x...x.',crash:'x...............'},{kick:'x...x...x...x...',snare:'....x.......x...',clap:'....x.......x...',oh:'..x...x...x...x.'},
  {kick:'x...x...x...x...',snare:'....x.......x...',hat:'xxxxxxxxxxxxxxxx'},{kick:'x.x.x...x.x.x...',snare:'....x.......x...',oh:'..x...x...x...x.'},
  {kick:'x...x...x...x...',clap:'..x...x...x...x.',hat:'x.x.x.x.x.x.x.x.'},{kick:'x...x...x..xx...',snare:'....x.......x...',hat:'x.xxx.xxx.xxx.xx',crash:'x...............'},
  {kick:'x...x...x...x...',snare:'....x...x...x.x.',hat:'xxxxxxxxxxxxxxxx'},{kick:'x...x...x...x...',clap:'....x.......x...',hat:'.x.x.x.x.x.x.x.x',oh:'..x...x...x...x.'}],
 [{snare:'x.x.x.x.xxxxxxxx'},{tom:'x...x...x.x.x.x.'},{kick:'x...............',crash:'x...............'},{kick:'x.......x.......',snare:'....x.......xxxx'},
  {hat:'xxxxxxxxxxxxxxxx',snare:'............xxxx'},{kick:'x..x..x..x..x.x.',snare:'............x.x.'},{clap:'x.x.x.x.x.x.x.x.'},{kick:'x.......',tom:'........x.x.xxxx'}]];
const BSR=[['r---------------','r-------r-------','r.......5.......','r---....r---....'],['r.r.r.r.r.r.r.r.','..r...r...r...r.','r..r..r.r..r..r.','r.ro.r.5r.ro.r.5'],
 ['rorororororororo','r.r.o.r.r.r.o.5.','.r.r.r.r.r.r.r.r','r-r-o-r-5-r-o-3-'],['r...............','r.r.r.r.rrrrrrrr','r..5..o..5..r...','o.5.3.r.........']];
const CHR=[['c---------------','c-------c-------','a.a.a.a.a.a.a.a.','c---c---c---c---'],['..c...c...c...c.','c..c..c.c..c..c.','aaaaaaaaaaaaaaaa','c-..c-..c-..c-..'],
 ['c.c.c.c.c.c.c.c.','.c.c.c.c.c.c.c.c','c--c--c-c--c--c-','aaaaaaaaaaaaaaaa'],['c...............','c.c.c.c.........','a.a.a.a.aaaaaaaa','c-------........']];
const ACR=[['0...2...4...7...','7-6-4-2-0-------','0.4.7.4.0.4.7.4.','....4-----2-----'],['0.0.2.0.4...2...','4..2..0.....2-4-','0-2-4-2-0-......','..4.4.5.4...2...'],
 ['7.7.6.4.4-2-4---','4.4.4.2.4.5.4-2-','0.2.4.7.9.7.4.2.','7---6---4---2---']];
const ACBR=['Z...............','R...R...........','Z.Z.Z.Z.........','B...............','W...............','0.Z.4.Z.7.Z.....','B.......B.......','R.R.R.R.........'];
const pcode=(g,n)=>1+g*8+n, pg=cd=>Math.floor((cd-1)/8), pn=cd=>(cd-1)%8;
const PDEMO=[[[0,0],[0,1],[1,0],[1,0],[1,0],[1,6],[2,0],[2,0],[2,0],[2,2],[3,0],[2,0]],
 [[0,0],[0,1],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[2,0]],
 [[0,0],[0,1],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,0],[2,0]],
 [null,[0,0],null,[1,1],null,[1,3],[2,0],[2,1],[2,2],[2,3],[3,3],[2,0]]];
const pblank=()=>[0,1,2,3].map(()=>Array(PNC).fill(0));
let P={bpm:118,spk:1,tr:pblank()},MUTE=[0,0,0,0],KS=1;try{KS=localStorage.getItem('d11-dj-ks')==='0'?0:1}catch(e){}
function slots(){try{const a=JSON.parse(localStorage.getItem('d11-dj-slots')||'[]');return Array.isArray(a)?a.slice(0,5):[]}catch(e){return []}}
function putSlot(i,v){const a=slots();while(a.length<5)a.push(null);a[i]=v;try{localStorage.setItem('d11-dj-slots',JSON.stringify(a))}catch(e){}}
function pDemo(){P.tr=pblank();PDEMO.forEach((row,r)=>row.forEach((v,c)=>{P.tr[r][c]=v?pcode(v[0],v[1]):0}));P.bpm=118}
pDemo();
function songLen(){let n=0;for(let r=0;r<4;r++)for(let c=0;c<PNC;c++)if(P.tr[r][c])n=Math.max(n,c+1);return Math.max(1,n)}
const BC={};
function blk(r,cd){const k=r+'_'+cd;if(BC[k])return BC[k];const g=pg(cd),n=pn(cd),E=Array.from({length:16},()=>[]);
  if(r===0){const o=DRB[g][n];for(const row in o)for(let s=0;s<16;s++)if(o[row][s]==='x')E[s].push({d:row,v:row==='hat'||row==='oh'?(s%4===0?1:.75):1,s})}
  else{const root=PROOT[n],str=r===1?BSR[g][n%4]:r===2?CHR[g][n%4]:(g===3?ACBR[n]:ACR[g][n%4]);
    const ins=r===1?['sub','fmb','fmb2','fmb'][g]:r===2?['pad','ep','brass','ep'][g]:['bell','sql','fml','fml'][g];let ai=0;
    for(let s=0;s<16;s++){const c=str[s];if(c==='.'||c==='-')continue;let len=1;while(s+len<16&&str[s+len]==='-')len++;
      if(r===1){const d={r:0,o:7,5:4,3:2}[c]||0;E[s].push({m:pdeg(root+d,-1),L:len,i:ins})}
      else if(r===2){if(c==='c')[0,2,4].forEach(d=>E[s].push({m:pdeg(root+d,0),L:len,i:ins,v:.55}));else{const d=[0,2,4,7][ai++%4];E[s].push({m:pdeg(root+d,g===2?1:0),L:len,i:ins,v:.6})}}
      else{if(/[0-9]/.test(c))E[s].push({m:pdeg(root+(+c),1),L:len,i:ins,v:.8});else E[s].push({fx:c,L:len})}}}
  return BC[k]=E}
function phEnc(){return ['1',P.bpm,P.spk,P.tr.map(r=>r.map(v=>v.toString(36)).join('')).join('')].join('_')}
function phDec(s){try{const a=String(s).split('_');if(a.length!==4||a[0]!=='1'||!/^[0-9a-w]{128}$/.test(a[3]))return null;
  const n={bpm:Math.min(200,Math.max(60,parseInt(a[1],10)||118)),spk:a[2]==='0'?0:1,tr:pblank()};
  for(let r=0;r<4;r++)for(let c=0;c<PNC;c++){const v=parseInt(a[3][r*PNC+c],36);n.tr[r][c]=v>=0&&v<=32?v:0}return n}catch(e){return null}}
let phMsg='';
(function(){const h=location.hash.match(/^#dj=([0-9a-z_]+)$/);if(h){const n=phDec(h[1]);if(n){P=n;MODE='phone';phMsg='fromLink';return}}
  try{const v=localStorage.getItem('d11-dj');if(v){const n=phDec(v);if(n)P=n}}catch(e){}})();
let phSaveT=0;const phSave=()=>{clearTimeout(phSaveT);phSaveT=setTimeout(()=>{try{localStorage.setItem('d11-dj',phEnc())}catch(e){}},300)};

/* ---------- audio ---------- */
let ac=null,master,outG,comp,nbuf,FX={},hissG;
const mtof=m=>440*Math.pow(2,(m-69)/12);
const base=()=>60+KEYS[S.k];
const midiOf=(deg,bass)=>base()+SC[S.md][deg]-(bass?24:0);
function curve(fn){const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=fn(x)}return c}
const soft=k=>curve(x=>Math.tanh(k*x)/Math.tanh(k));
function filt(type,f,q,g){const b=ac.createBiquadFilter();b.type=type;b.frequency.value=f;if(q!==undefined)b.Q.value=q;if(g!==undefined)b.gain.value=g;return b}
function chain(...n){for(let i=0;i<n.length-1;i++)n[i].connect(n[i+1]);return n}
function initAudio(){
  if(ac)return ac;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  try{ac=new C({latencyHint:'interactive'})}catch(e){ac=new C()}
  nbuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  master=ac.createGain();master.gain.value=.75;
  comp=ac.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=8;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.18;
  outG=ac.createGain();outG.gain.value=S.vol;outG.connect(ac.destination);master.connect(comp);
  // where we listen
  const clean=ac.createGain();FX.clean={i:clean,o:clean};
  { const a=filt('highpass',260,.7),b=filt('lowpass',3300,.9),c=filt('peaking',1400,1,5),s=ac.createWaveShaper(),g=ac.createGain();s.curve=soft(3);g.gain.value=.62;chain(a,b,c,s,g);FX.bus={i:a,o:g} }
  { const a=filt('highpass',700,.8),b=filt('lowpass',4300,.8),s=ac.createWaveShaper(),g=ac.createGain();s.curve=curve(x=>Math.round(x*7)/7);g.gain.value=.8;chain(a,b,s,g);FX.phone={i:a,o:g} }
  { const a=filt('lowpass',7200,.6),dl=ac.createDelay(.05),s=ac.createWaveShaper(),g=ac.createGain();dl.delayTime.value=.012;s.curve=soft(1.6);g.gain.value=.9;chain(a,dl,s,g);
    const w=ac.createOscillator(),wg=ac.createGain();w.frequency.value=.55;wg.gain.value=.0018;w.connect(wg).connect(dl.delayTime);w.start();
    const f=ac.createOscillator(),fg=ac.createGain();f.frequency.value=6.3;fg.gain.value=.00018;f.connect(fg).connect(dl.delayTime);f.start();
    const h=ac.createBufferSource();h.buffer=nbuf;h.loop=true;hissG=ac.createGain();hissG.gain.value=0;chain(h,filt('highpass',3200,.5),hissG,outG);h.start();
    FX.tape={i:a,o:g} }
  { const a=filt('highpass',430,.7),b=filt('peaking',2600,1,4),c=filt('lowpass',6800,.7),s=ac.createWaveShaper(),g=ac.createGain();s.curve=soft(2.2);g.gain.value=.75;chain(a,b,c,s,g);FX.spk={i:a,o:g} }
  for(const k in FX)FX[k].o.connect(outG);
  setFx();return ac;
}
function setFx(){if(!ac)return;const k=MODE==='phone'?(P.spk?'spk':'clean'):S.fx;try{comp.disconnect()}catch(e){}comp.connect((FX[k]||FX.clean).i);hissG.gain.value=k==='tape'?.011:0}
function env(g,t,a,pk,hold,rel){const p=g.gain;p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(pk,t+a);if(hold>0)p.setValueAtTime(pk,t+a+hold);p.setTargetAtTime(.0001,t+a+Math.max(0,hold),rel/4)}
function perc(g,t,pk,dec){const p=g.gain;p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(pk,t+.002);p.exponentialRampToValueAtTime(.0001,t+.002+dec)}
function noise(t,dur,...nodes){const s=ac.createBufferSource();s.buffer=nbuf;chain(s,...nodes,master);s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}
function osc(type,f,t,dur,...nodes){const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);chain(o,...nodes,master);o.start(t);o.stop(t+dur+.05);return o}
const DR={
 kick(t,v){const g=ac.createGain(),o=osc('sine',150,t,.5,g);o.frequency.exponentialRampToValueAtTime(46,t+.12);perc(g,t,.95*v,.42);
   const c=ac.createGain();noise(t,.02,filt('highpass',2500),c);perc(c,t,.12*v,.012)},
 snare(t,v){const g=ac.createGain();noise(t,.22,filt('highpass',1300),g);perc(g,t,.42*v,.17);const h=ac.createGain();osc('triangle',188,t,.12,h);perc(h,t,.32*v,.09)},
 clap(t,v){const g=ac.createGain();noise(t,.3,filt('bandpass',1150,.9),g);const p=g.gain;p.setValueAtTime(.0001,t);
   [0,.011,.022].forEach(o=>{p.setValueAtTime(.6*v,t+o);p.exponentialRampToValueAtTime(.08*v,t+o+.009)});p.setValueAtTime(.5*v,t+.03);p.exponentialRampToValueAtTime(.0001,t+.22)},
 hat(t,v){const g=ac.createGain();noise(t,.06,filt('highpass',7600),g);perc(g,t,.2*v,.045)},
 oh(t,v){const g=ac.createGain();noise(t,.36,filt('highpass',7000),filt('peaking',10000,1,4),g);perc(g,t,.16*v,.3)},
 tram(t,v){[0,.12].forEach((o,k)=>{const a=k?.7:1;[[1240,1],[2985,.45],[3870,.28],[5260,.12]].forEach(([f,m])=>{const g=ac.createGain();osc('sine',f,t+o,1.7,g);perc(g,t+o,.13*v*m*a,1.5)});
   const n=ac.createGain();noise(t+o,.03,filt('bandpass',3000,2),n);perc(n,t+o,.12*v*a,.02)})},
 pip(t,v){const g=ac.createGain(),p=g.gain;osc('sine',1000,t,.12,g);p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(.26*v,t+.004);p.setValueAtTime(.26*v,t+.096);p.linearRampToValueAtTime(.0001,t+.1)}
};
function lead(kind,m,t,dur,v){
  const f=mtof(m),g=ac.createGain();
  if(kind==='saw'){const lp=filt('lowpass',800,2);lp.frequency.setValueAtTime(800,t);lp.frequency.linearRampToValueAtTime(4200,t+.012);lp.frequency.setTargetAtTime(1500,t+.02,.12);
    lp.connect(g);[-14,0,14].forEach(c=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=c;o.connect(lp);o.start(t);o.stop(t+dur+.4)});chain(g,master);env(g,t,.004,.085*v,dur*.75,.16)}
  else if(kind==='sq'){osc('square',f,t,dur+.2,filt('lowpass',5200,.5),g);env(g,t,.002,.075*v,dur*.7,.03)}
  else if(kind==='reed'){const lp=filt('lowpass',2600,1.5),pk=filt('peaking',1150,1.2,6);chain(lp,pk,g,master);
    const lf=ac.createOscillator(),lg=ac.createGain();lf.frequency.value=5.3;lg.gain.value=7;lf.connect(lg);lf.start(t);lf.stop(t+dur+.3);
    [-7,7].forEach(c=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=c;lg.connect(o.detune);o.connect(lp);o.start(t);o.stop(t+dur+.3)});
    const s=ac.createOscillator(),sg=ac.createGain();s.type='square';s.frequency.value=f/2;sg.gain.value=.35;s.connect(sg).connect(lp);s.start(t);s.stop(t+dur+.3);
    env(g,t,.035,.07*v,dur*.85,.09)}
  else if(kind==='keys'){osc('sine',f,t,1.3,g);const g2=ac.createGain();osc('sine',f*2,t,1,g2);perc(g2,t,.06*v,.7);const g3=ac.createGain();osc('sine',f*4.02,t,.2,g3);perc(g3,t,.05*v,.12);perc(g,t,.24*v,Math.max(.5,dur*2.5))}
  else {const lp=filt('lowpass',4200,3);lp.frequency.setValueAtTime(4200,t);lp.frequency.exponentialRampToValueAtTime(320,t+.32);osc('sawtooth',f,t,.7,lp,g);perc(g,t,.16*v,.6)}
}
function bass(kind,m,t,dur,v){
  const f=mtof(m),g=ac.createGain();
  if(kind==='saw'){const lp=filt('lowpass',1500,7);lp.frequency.setValueAtTime(1500,t);lp.frequency.exponentialRampToValueAtTime(230,t+.18);osc('sawtooth',f,t,dur+.2,lp,g);env(g,t,.004,.24*v,dur*.7,.06)}
  else if(kind==='sub'){osc('sine',f,t,dur+.25,g);const g2=ac.createGain();osc('triangle',f*2,t,dur+.2,g2);env(g2,t,.004,.05*v,dur*.6,.06);env(g,t,.005,.5*v,dur*.8,.08)}
  else if(kind==='pluck'){const lp=filt('lowpass',2200,2);lp.frequency.setValueAtTime(2200,t);lp.frequency.exponentialRampToValueAtTime(180,t+.25);osc('sawtooth',f,t,.8,lp,g);perc(g,t,.3*v,.55)}
  else {osc('square',f,t,dur+.15,filt('lowpass',1300,1),g);env(g,t,.002,.15*v,dur*.7,.04)}
}
const sd=()=>60/(MODE==='phone'?P.bpm:S.bpm)/4;
function trig(s,t){
  const acc=s%4===0?1:.82;
  ROWS.forEach((r,i)=>{if(S.d[i][s])DR[r](t,r==='hat'||r==='oh'?acc:1)});
  const mk=S.m[s];if(mk){const dur=sd()*.92;for(let k=0;k<8;k++)if(mk&(1<<k))lead(S.ld,midiOf(k,0),t,dur,acc)}
  if(S.b[s]>=0)bass(S.bs,midiOf(S.b[s],1),t,sd()*.9,1);
}
function audition(tab,r){if(!initAudio())return;if(ac.state!=='running')ac.resume();const t=ac.currentTime+.02;
  if(tab==='d')DR[ROWS[r]](t,1);else if(tab==='m')lead(S.ld,midiOf(r,0),t,sd()*1.5,1);else bass(S.bs,midiOf(r,1),t,sd()*1.5,1)}

/* v7.37: FM voices of a mid-2000s polyphonic ringtone chip, extra drums and phone effects */
DR.tom=function(t,v,s){const g=ac.createGain(),f=210-(s||0)*7,o=osc('sine',f,t,.35,g);o.frequency.exponentialRampToValueAtTime(f*.55,t+.2);perc(g,t,.5*v,.3)};
DR.crash=function(t,v){const g=ac.createGain();noise(t,1.4,filt('highpass',4200),filt('peaking',7000,1,5),g);perc(g,t,.13*v,1.25)};
const FMP={
 fmb:{mr:1,i0:2.2,i1:.6,tau:.08,a:.003,pk:.3,h:.8,r:.05},
 fmb2:{mr:1,i0:3.4,i1:1.2,tau:.1,a:.003,pk:.28,h:.8,r:.05},
 pad:{mr:2,i0:.8,i1:.8,a:.16,pk:.06,h:1,r:.28,vib:6,dt2:7},
 ep:{mr:1,i0:1.8,i1:.15,tau:.22,perc:1},
 brass:{mr:1,i0:.3,i1:2.4,rise:.07,a:.035,pk:.085,h:.85,r:.07},
 bell:{mr:3.5,i0:4,i1:.4,tau:.35,perc:1.4,pk:.12},
 fml:{mr:1,i0:2.4,i1:1.5,tau:.1,a:.005,pk:.085,h:.85,r:.05,vib:9}
};
function fm(kind,m,t,dur,v){
  if(kind==='sub'){bass('sub',m,t,dur,v);return}
  if(kind==='sql'){const f=mtof(m),g=ac.createGain(),o=osc('square',f,t,dur+.1,filt('lowpass',6000,.5),g);
    const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=5.6;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(10,t+.3);l.connect(lg).connect(o.detune);l.start(t);l.stop(t+dur+.2);
    env(g,t,.003,.06*v,dur*.85,.03);return}
  const o=FMP[kind],f=mtof(m),g=ac.createGain();g.connect(master);
  const perc1=kind==='ep'?Math.max(.6,dur*1.3):o.perc,end=t+(perc1?perc1+.08:dur+o.r+.12);
  const voice=dt=>{const c=ac.createOscillator(),md=ac.createOscillator(),mg=ac.createGain();c.frequency.value=f;c.detune.value=dt;md.frequency.value=f*o.mr;
    const I0=f*o.mr*o.i0,I1=f*o.mr*o.i1;mg.gain.setValueAtTime(I0,t);if(o.rise)mg.gain.linearRampToValueAtTime(I1,t+o.rise);else mg.gain.setTargetAtTime(I1,t+.001,o.tau||.1);
    md.connect(mg);mg.connect(c.frequency);c.connect(g);
    if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=5.4;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(o.vib,t+.3);l.connect(lg);lg.connect(c.detune);l.start(t);l.stop(end)}
    c.start(t);md.start(t);c.stop(end);md.stop(end)};
  voice(0);if(o.dt2)voice(o.dt2);
  if(perc1)perc(g,t,(o.pk||.15)*v,perc1);else env(g,t,o.a,o.pk*v,dur*o.h,o.r)}
function pfx(c,t,dur){
  if(c==='B'){DR.tram(t,.9);return}
  const g=ac.createGain();
  if(c==='Z'){const o=osc('square',2400,t,.3,filt('lowpass',5000,.7),g);o.frequency.exponentialRampToValueAtTime(170,t+.24);perc(g,t,.07,.24)}
  else if(c==='R'){const o=osc('square',1320,t,.5,filt('lowpass',6000,.5),g);for(let k=0;k<22;k++)o.frequency.setValueAtTime(k%2?1660:1320,t+k*.02);env(g,t,.003,.05,.42,.03)}
  else if(c==='W'){const d=Math.max(.5,dur||sd()*16),b=filt('bandpass',300,3);b.frequency.setValueAtTime(300,t);b.frequency.exponentialRampToValueAtTime(6000,t+d);noise(t,d,b,g);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.3,t+d*.95);g.gain.linearRampToValueAtTime(.0001,t+d)}
}
function pev(e,t){if(e.d){DR[e.d](t,e.v,e.s);return}if(e.fx){pfx(e.fx,t,e.L*sd());return}fm(e.i,e.m,t,e.L*sd()*.95,e.v||1)}
let PV=null; // block preview while browsing the list: {r,cd}
function phTrig(s,t){
  if(PV){blk(PV.r,PV.cd)[s%16].forEach(e=>pev(e,t));return}
  const b=Math.floor(s/16),st=s%16;for(let r=0;r<4;r++){const cd=P.tr[r][b];if(cd&&!MUTE[r])blk(r,cd)[st].forEach(e=>pev(e,t))}}
function kclick(){if(!KS||!ac)return;const t=ac.currentTime+.005,g=ac.createGain();osc('sine',1400,t,.05,g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.04)}

/* ---------- transport ---------- */
let playing=false,step=0,nextT=0,timer=0,vq=[],raf=0,ph=-1;
const curLen=()=>MODE==='grid'?16*S.bars:(PV?16:16*songLen());
function sched(){const len=curLen();while(nextT<ac.currentTime+.12){if(step>=len)step=0;const sw=MODE==='grid'?S.sw:0,t=nextT+(step%2?sw/100*sd()*.66:0);(MODE==='grid'?trig:phTrig)(step,t);vq.push([step,t]);nextT+=sd();step=(step+1)%len}}
function vis(){raf=requestAnimationFrame(vis);if(!ac)return;let cur=-2;while(vq.length&&vq[0][1]<=ac.currentTime+.005)cur=vq.shift()[0];if(cur!==-2&&cur!==ph){ph=cur;mark()}}
let lastB=-9;
function mark(){if(MODE==='phone'){const b=playing&&ph>=0?Math.floor(ph/16):-1;if(b!==lastB){lastB=b;phMark()}pline();return}box.querySelectorAll('.sq-c.ph,.sq-n.ph').forEach(e=>e.classList.remove('ph'));if(!playing||ph<0)return;
  const pg=Math.floor(ph/16);box.querySelectorAll('.sq-bar button').forEach(b=>b.classList.toggle('pl',+b.dataset.p===pg));
  if(pg!==page)return;box.querySelectorAll(`[data-s="${ph%16}"]`).forEach(e=>e.classList.add('ph'))}
function start(from){if(!initAudio()){say(T().noAudio);return}ac.resume&&ac.resume();setFx();playing=true;step=from||0;vq=[];lastB=-9;nextT=ac.currentTime+.06;sched();clearInterval(timer);timer=setInterval(sched,25);cancelAnimationFrame(raf);vis();btn()}
function stop(){playing=false;clearInterval(timer);cancelAnimationFrame(raf);vq=[];ph=-1;mark();box.querySelectorAll('.sq-bar button.pl').forEach(b=>b.classList.remove('pl'));btn()}
function btn(){if(MODE==='phone'){phR();return}const b=box.querySelector('.sq-play');if(b){b.textContent=(playing?'■ ':'▶ ')+(playing?T().stop:T().play);b.setAttribute('aria-pressed',playing)}}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop()});
document.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target;
  if(tg&&tg.closest&&tg.closest('input,select,textarea,button,a,iframe,[contenteditable],dialog'))return;
  const r=box.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;e.preventDefault();if(MODE==='phone')phPlay();else playing?stop():start()});

/* ---------- UI ---------- */
let tab='m',page=0;
function nm(m){return NN[m%12]+(Math.floor(m/12)-1)}
function rowsOf(){const t=T();if(tab==='d')return ROWS.map((r,i)=>({r:i,l:t.rows[i]}));return [7,6,5,4,3,2,1,0].map(k=>({r:k,l:nm(midiOf(k,tab==='b'))}))}
function on(r,s){return tab==='d'?!!S.d[r][s]:tab==='m'?!!(S.m[s]&(1<<r)):S.b[s]===r}
function grid(){
  const t=T(),o=page*16;let h=`<div class="sq-g sq-${tab}" role="grid" aria-label="${esc(t.tabs[tab])}"><span class="sq-l" aria-hidden="true"></span>`;
  for(let s=0;s<16;s++)h+=`<span class="sq-n mono${s%4===0?' q':''}" data-s="${s}" aria-hidden="true">${o+s+1}</span>`;
  for(const row of rowsOf()){h+=`<span class="sq-l mono">${esc(row.l)}</span>`;
    for(let s=0;s<16;s++){const v=on(row.r,o+s);h+=`<button type="button" class="sq-c${Math.floor(s/4)%2?' alt':''}${s%4===0?' q':''}" data-r="${row.r}" data-s="${s}" aria-pressed="${v}" aria-label="${esc(row.l)} · ${t.step} ${o+s+1}"></button>`}}
  return h+'</div>'}
function opts(list,cur,lab){return list.map(k=>`<option value="${k}"${k===cur?' selected':''}>${esc(lab[k]||k)}</option>`).join('')}
function draw(){
  const t=T();
  const pt=PH(),mt=`<div class="sq-mode" role="tablist">${['phone','grid'].map(k=>`<button type="button" role="tab" data-mode="${k}" aria-selected="${MODE===k}">${esc(pt.mode[k])}</button>`).join('')}</div>`;
  const hd=`<div class="head"><div><div class="code"><b>01</b><span>${esc(t.code)}</span></div><h2>${esc(t.h)}</h2></div><p class="lede">${esc(t.p)}</p></div>`+mt;
  if(MODE==='phone'){box.innerHTML=hd+phHTML();if(phMsg){flash(pt[phMsg]||phMsg);phMsg=''}return}
  box.innerHTML=hd+`<div class="sq">
<div class="sq-pre" role="group" aria-label="${esc(t.pre)}"><span class="eyebrow">${esc(t.pre)}</span>${PIDS.map(id=>`<button type="button" data-pr="${id}" aria-pressed="${S.pr===id}">${esc(t.presets[id])}</button>`).join('')}</div>
<div class="sq-top">
<button type="button" class="btn primary sq-play" aria-pressed="${playing}"></button>
<label class="sq-f"><span>${esc(t.tempo)} <b class="mono" data-o="bpm">${S.bpm}</b></span><input type="range" min="60" max="180" step="1" value="${S.bpm}" data-k="bpm"></label>
<label class="sq-f"><span>${esc(t.swing)} <b class="mono" data-o="sw">${S.sw}%</b></span><input type="range" min="0" max="50" step="1" value="${S.sw}" data-k="sw"></label>
<label class="sq-f"><span>${esc(t.vol)}</span><input type="range" min="0" max="100" step="1" value="${Math.round(S.vol*100)}" data-k="vol"></label>
</div>
<div class="sq-sets">
<label class="sq-f"><span>${esc(t.key)}</span><select data-k="k">${Object.keys(KEYS).map(k=>`<option${k===S.k?' selected':''}>${k}</option>`).join('')}</select></label>
<label class="sq-f"><span>${esc(t.mode)}</span><select data-k="md">${opts(MODES,S.md,t.modes)}</select></label>
<label class="sq-f"><span>${esc(t.lead)}</span><select data-k="ld">${opts(LEADS,S.ld,t.leads)}</select></label>
<label class="sq-f"><span>${esc(t.bass)}</span><select data-k="bs">${opts(BASSES,S.bs,t.basses)}</select></label>
<label class="sq-f"><span>${esc(t.listen)}</span><select data-k="fx">${opts(FXS,S.fx,t.fx)}</select></label>
</div>
<div class="sq-bar2">
<div class="sq-tabs" role="tablist">${['m','b','d'].map(k=>`<button type="button" role="tab" data-tab="${k}" aria-selected="${tab===k}">${esc(t.tabs[k])}</button>`).join('')}</div>
<div class="sq-len" role="group" aria-label="${esc(t.len)}"><button type="button" data-bars="1" aria-pressed="${S.bars===1}">${esc(t.bar1)}</button><button type="button" data-bars="2" aria-pressed="${S.bars===2}">${esc(t.bar2)}</button></div>
<div class="sq-bar" role="group" aria-label="${esc(t.bar)}"${S.bars===1?' hidden':''}><button type="button" data-p="0" aria-pressed="${page===0}">${esc(t.bar)} 1</button><button type="button" data-p="1" aria-pressed="${page===1}">${esc(t.bar)} 2</button></div>
</div>
<div class="sq-gw">${grid()}</div>
<div class="sq-act"><button type="button" class="btn ghost" data-a="rnd">${esc(t.rnd)}</button><button type="button" class="btn ghost" data-a="clr">${esc(t.clr)}</button><button type="button" class="btn ghost" data-a="share">${esc(t.share)}</button></div>
<p class="sq-msg" role="status" aria-live="polite"></p>
<p class="sq-hint mono">${esc(t.hint)}</p>
</div>
<p class="sq-note">${esc(t.note)}</p>`;
  btn();if(msg)say(T()[msg]||msg);msg='';mark();
}
function regrid(){const w=box.querySelector('.sq-gw');if(w){const sl=w.scrollLeft;w.innerHTML=grid();w.scrollLeft=sl}mark()}
function say(s,link){const p=box.querySelector('.sq-msg');if(!p)return;p.textContent=s;if(link){const i=document.createElement('input');i.type='text';i.readOnly=true;i.value=link;i.className='sq-link';p.appendChild(i);i.focus();i.select()}}
function edited(){S.pr='';box.querySelectorAll('.sq-pre button').forEach(b=>b.setAttribute('aria-pressed','false'));save()}
function setCell(r,s,v){
  const j=page*16+s;
  if(tab==='d')S.d[r][j]=v?1:0;else if(tab==='m'){S.m[j]=v?(S.m[j]|(1<<r)):(S.m[j]&~(1<<r))}else{S.b[j]=v?r:-1}
  if(tab==='b')box.querySelectorAll(`.sq-c[data-s="${s}"]`).forEach(c=>c.setAttribute('aria-pressed',+c.dataset.r===S.b[j]));
  else{const c=box.querySelector(`.sq-c[data-r="${r}"][data-s="${s}"]`);if(c)c.setAttribute('aria-pressed',v)}
  if(v&&!playing)audition(tab,r);edited()}
let paint=null;
box.addEventListener('pointerdown',e=>{const c=e.target.closest('.sq-c');if(!c||e.button>0||e.pointerType!=='mouse')return; // mouse: act on press and paint by dragging; touch and keys: act on click
  const r=+c.dataset.r,s=+c.dataset.s,v=!on(r,page*16+s);paint={v,last:c};e.preventDefault();setCell(r,s,v);c.dataset.done='1'});
box.addEventListener('pointermove',e=>{if(!paint)return;const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest&&el.closest('.sq-c');
  if(!c||c===paint.last||!box.contains(c))return;paint.last=c;const r=+c.dataset.r,s=+c.dataset.s;if(on(r,page*16+s)!==paint.v)setCell(r,s,paint.v)});
addEventListener('pointerup',()=>{paint=null});
box.addEventListener('click',e=>{
  const md=e.target.closest('.sq-mode [data-mode]');if(md){const m=md.dataset.mode;if(m!==MODE){if(playing)stop();PV=null;menu=null;MODE=m;try{localStorage.setItem('d11-seq-mode',m)}catch(x){}draw();setFx()}return}
  const pk=e.target.closest('[data-pk]');if(pk){if(!initAudio()){}else if(ac.state!=='running')ac.resume();kclick();phKey(pk.dataset.pk);const f=box.querySelector('.ph');if(f&&e.detail)f.focus({preventScroll:true});return}
  const pc=e.target.closest('.pc');if(pc){const r=+pc.dataset.r,c=+pc.dataset.c;if(r===cur.r&&c===cur.c)phKey('ok');else{cur={r,c};phR()}return}
  const mi=e.target.closest('[data-mi]');if(mi&&menu){const i=+mi.dataset.mi;if(i===menu.i)phKey('ok');else{menu.i=i;if(menu.t==='blocks')preview();phR()}return}
  const c=e.target.closest('.sq-c');
  if(c){if(c.dataset.done){delete c.dataset.done;return}const r=+c.dataset.r,s=+c.dataset.s;setCell(r,s,!on(r,page*16+s));return} // keyboard activation
  const b=e.target.closest('button');if(!b)return;
  if(b.classList.contains('sq-play')){playing?stop():start();return}
  if(b.dataset.pr){applyPreset(b.dataset.pr);page=0;if(playing){step=0}draw();setFx();if(outG)outG.gain.value=S.vol;save();return}
  if(b.dataset.tab){tab=b.dataset.tab;box.querySelectorAll('.sq-tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));regrid();return}
  if(b.dataset.bars){const n=+b.dataset.bars;if(n!==S.bars){if(n===2){for(let j=16;j<32;j++){ROWS.forEach((r,i)=>S.d[i][j]=S.d[i][j-16]);S.m[j]=S.m[j-16];S.b[j]=S.b[j-16]}}S.bars=n;if(n===1)page=0;draw();save()}return}
  if(b.dataset.p){page=+b.dataset.p;box.querySelectorAll('.sq-bar button').forEach(x=>x.setAttribute('aria-pressed',x===b));regrid();return}
  if(b.dataset.a==='clr'){for(let j=page*16;j<page*16+16;j++){if(tab==='d')S.d.forEach(r=>r[j]=0);else if(tab==='m')S.m[j]=0;else S.b[j]=-1}regrid();edited();return}
  if(b.dataset.a==='rnd'){rnd();regrid();edited();return}
  if(b.dataset.a==='share'){const u=location.origin+location.pathname+'#seq='+enc();
    const ok=()=>say(T().copied),bad=()=>say(T().copyMan,u);
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,bad);else bad();return}
});
function rnd(){const o=page*16,R=Math.random;
  if(tab==='d'){for(let s=0;s<16;s++){const j=o+s;S.d[0][j]=s%8===0||R()<(s%4===0?.3:.08)?1:0;S.d[1][j]=s%8===4?1:(R()<.05?1:0);S.d[2][j]=0;S.d[3][j]=s%2===0&&R()<.85?1:0;S.d[4][j]=s%4===2&&R()<.35?1:0;S.d[5][j]=0;S.d[6][j]=0}}
  else if(tab==='m'){let d=[0,2,4][Math.floor(R()*3)];for(let s=0;s<16;s++){const j=o+s;if(R()<(s%2?.32:.62)){d=Math.max(0,Math.min(7,d+[-2,-1,-1,0,1,1,2][Math.floor(R()*7)]));S.m[j]=1<<d}else S.m[j]=0}}
  else{const ch=[0,5,3,4,0,6];for(let s=0;s<16;s++){const j=o+s,root=ch[Math.floor(s/4)%ch.length];S.b[j]=s%4===0||R()<(s%2?.15:.45)?(R()<.8?root:(root+4)%8):-1}}
}
box.addEventListener('input',e=>{const el=e.target,k=el.dataset.k;if(!k)return;
  if(k==='bpm'||k==='sw'){S[k]=+el.value;const o=box.querySelector(`[data-o="${k}"]`);if(o)o.textContent=S[k]+(k==='sw'?'%':'');edited();return}
  if(k==='vol'){S.vol=+el.value/100;if(outG)outG.gain.setTargetAtTime(S.vol,ac.currentTime,.02);save();return}});
box.addEventListener('change',e=>{const el=e.target,k=el.dataset.k;if(!k||el.tagName!=='SELECT')return;S[k]=el.value;if(k==='fx')setFx();if(k==='k'||k==='md')regrid();edited()});

/* ---------- v7.37: phone UI ---------- */
let cur={r:0,c:0},v0=0,menu=null,clip=0,toastT=0,toast='';
const GC=['dg0','dg1','dg2','dg3'];
function phTime(){const b=document.querySelector('.dn-chip b');const s=b&&b.textContent||'';return /\d/.test(s)?s:''}
function softL(){const t=PH();if(menu&&menu.t==='ring')return softRing();if(menu){if(menu.t==='confirm')return [t.yes,'',t.no];if(menu.t==='tempo'||menu.t==='vol')return [t.sel,'◀ ▶',t.back];return [t.sel,'',t.back]}
  return [playing&&!PV?t.stop:t.play,P.tr[cur.r][cur.c]?t.edit:t.ins,t.more]}
function softRing(){const t=PH();return [t.answer,'',t.reject]}
function moreItems(){const t=PH();return [['ins',t.m_ins],['copy',t.m_copy],['paste',t.m_paste],['del',t.m_del],['tempo',t.m_tempo+' · '+P.bpm],['vol',t.m_vol+' · '+Math.round(S.vol*10)],['spk',P.spk?t.m_spk:t.m_hp],['ring',t.m_ring],['mine',t.m_mine],['tracks',t.m_tracks],['keys',t.m_keys+' · '+(KS?t.on:t.off)],['demo',t.m_demo],['clear',t.m_clear],['share',t.m_share]]}
function mItems(){const t=PH();if(!menu)return [];if(menu.t==='more')return moreItems();
  if(menu.t==='groups')return t.groups.map((g,i)=>[i,g,GC[i]]);if(menu.t==='blocks')return Array.from({length:8},(_,i)=>[i,t.groups[menu.g]+' '+(i+1),GC[menu.g]]);
  if(menu.t==='tracks')return t.tracks.map((x,i)=>[i,x+' · '+(MUTE[i]?t.off:t.on),'pt'+i+(MUTE[i]?' off':'')]);
  if(menu.t==='mine'){const a=slots();return [0,1,2,3,4].map(i=>[i,t.slot+' '+(i+1)+' · '+(a[i]?a[i].d:t.slotEmpty)])}
  if(menu.t==='slot'){const a=slots();return (a[menu.n]?[['open',t.s_open]]:[]).concat([['save',t.s_save]])}return []}
function mTitle(){const t=PH();if(menu.t==='more')return t.more;if(menu.t==='groups')return t.tracks[cur.r];if(menu.t==='blocks')return t.tracks[cur.r]+' · '+t.groups[menu.g];
  if(menu.t==='tempo')return t.m_tempo;if(menu.t==='vol')return t.m_vol;if(menu.t==='tracks')return t.m_tracks;if(menu.t==='mine')return t.m_mine;if(menu.t==='slot')return t.slot+' '+(menu.n+1);if(menu.t==='ring')return t.ringing;return t.title}
function info(){const t=PH();if(toast)return toast;if(menu)return menu.t==='blocks'?'♪ '+t.groups[menu.g]+' '+(menu.i+1):menu.t==='ring'?t.len+' '+fmtDur():'';
  const cd=P.tr[cur.r][cur.c];return t.tracks[cur.r]+' · '+(cd?t.groups[pg(cd)]+' '+(pn(cd)+1):t.empty)+' · '+t.bar+' '+(cur.c+1)+'/'+songLen()}
function gridH(){const t=PH(),pc=playing&&!PV&&ph>=0?Math.floor(ph/16):-1,fc=pc>=0?pc:cur.c;
  if(fc<v0)v0=fc;if(fc>v0+7)v0=fc-7;v0=Math.max(0,Math.min(PNC-8,v0));
  let h='<div class="pg"><span></span>';for(let c=v0;c<v0+8;c++)h+=`<span class="pn${c===pc?' on':''}">${c+1}</span>`;
  for(let r=0;r<4;r++){h+=`<span class="pt pt${r}${r===cur.r?' on':''}">${esc(t.trs[r])}</span>`;
    for(let c=v0;c<v0+8;c++){const cd=P.tr[r][c];h+=`<span class="pc${MUTE[r]?' mu':''}${cd?' '+GC[pg(cd)]:''}${r===cur.r&&c===cur.c?' cur':''}${c===pc?' play':''}" data-r="${r}" data-c="${c}">${cd?pn(cd)+1:''}</span>`}}
  return h+'<i class="pline" hidden></i></div>'}
function menuH(){const t=PH();
  if(menu.t==='ring')return `<div class="pring"><div class="pr-ico" aria-hidden="true"><i></i></div><span>${esc(t.caller)}</span><b>${esc(t.ringNote)}</b></div>`;
  if(menu.t==='tempo'||menu.t==='vol'){const isT=menu.t==='tempo',v=isT?P.bpm:Math.round(S.vol*10),mn=isT?60:0,mx=isT?200:10;
    return `<div class="pv"><b>${v}</b><span>${isT?esc(t.bpm):'/ 10'}</span><i><s style="width:${Math.round((v-mn)/(mx-mn)*100)}%"></s></i></div>`}
  if(menu.t==='confirm')return `<div class="pv pq"><span>${esc(t.confirm)}</span></div>`;
  const it=mItems(),top=Math.max(0,Math.min(it.length-6,menu.i-2));
  return '<ol class="pm">'+it.slice(top,top+6).map((x,k)=>{const i=top+k;return `<li class="${i===menu.i?'on':''}" data-mi="${i}">${x[2]?`<i class="${x[2]}"></i>`:''}<span>${esc(x[1])}</span></li>`}).join('')+'</ol>'+
    (it.length>6?`<div class="psb"><s style="top:${Math.round(menu.i/(it.length-1)*80)}%"></s></div>`:'')}
function scrH(){const t=PH(),[a,b,c]=softL();
  return `<div class="ps-stat"><i class="psig" aria-hidden="true"><b></b><b></b><b></b><b></b></i><span>${esc(phTime())}</span><i class="pbat" aria-hidden="true"><b></b></i></div>
<div class="ps-title"><span>${esc(menu?mTitle():t.title)}</span><b>${playing?'♪ ':''}${fmtDur()} · ${P.bpm}</b></div>
<div class="ps-body">${menu?menuH():gridH()}</div>
<div class="ps-info">${esc(info())}</div>
<div class="ps-soft"><span>${esc(a)}</span><span>${esc(b)}</span><span>${esc(c)}</span></div>`}
function phR(){const s=box.querySelector('.ph-scr');if(!s)return;s.innerHTML=scrH();const [a,,c]=softL();
  const l=box.querySelector('[data-pk="sl"]'),r=box.querySelector('[data-pk="sr"]');if(l)l.setAttribute('aria-label',a);if(r)r.setAttribute('aria-label',c)}
function phHTML(){const t=PH(),K=['1','2','3','4','5','6','7','8','9','*','0','#'];
  return `<div class="phw"><div class="ph" tabindex="0" role="application" aria-label="${esc(t.aria)}" aria-describedby="phHelp">
<div class="ph-ear" aria-hidden="true"></div>
<div class="ph-scr" aria-live="polite">${scrH()}</div>
<div class="ph-nav"><button type="button" class="ph-sk" data-pk="sl"><i></i></button>
<div class="ph-joy"><button type="button" data-pk="up" aria-label="↑"></button><button type="button" data-pk="left" aria-label="←"></button><button type="button" data-pk="ok" aria-label="OK"></button><button type="button" data-pk="right" aria-label="→"></button><button type="button" data-pk="down" aria-label="↓"></button></div>
<button type="button" class="ph-sk" data-pk="sr"><i></i></button></div>
<div class="ph-num">${K.map(k=>`<button type="button" data-pk="${k}"><b>${k}</b><small>${esc(t.keys[k]||'')}</small></button>`).join('')}</div>
</div>
<div class="ph-side" id="phHelp"><h3>${esc(t.helpH)}</h3><ol>${t.help.concat([t.help2]).map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p class="ph-about">${esc(t.about)}</p><p class="ph-msg" role="status" aria-live="polite"></p></div></div>`}
function flash(s){toast=s;clearTimeout(toastT);phR();toastT=setTimeout(()=>{toast='';phR()},1600)}
function closeMenu(){if(PV){PV=null;stop()}if(menu&&menu.t==='ring'){stop();ringOff()}menu=null}
function ringOff(){const f=box.querySelector('.ph');if(f)f.classList.remove('ringing')}
let ringT=0;function ring(){if(playing)stop();menu={t:'ring'};start(0);const f=box.querySelector('.ph');if(f)f.classList.add('ringing');clearTimeout(ringT);ringT=setTimeout(()=>{if(menu&&menu.t==='ring'){closeMenu();phR()}},30000)}
function preview(){if(!initAudio())return;PV={r:cur.r,cd:pcode(menu.g,menu.i)};if(playing){step=0;vq=[];nextT=ac.currentTime+.04}else start(0)}
function openBlocks(g,i){if(playing&&!PV)stop();menu={t:'blocks',g,i};preview()}
function phPlay(){if(menu)closeMenu();if(playing){stop();return}const L=songLen();start(cur.c<L?cur.c*16:0)}
function setBlk(v){P.tr[cur.r][cur.c]=v;phSave()}
function act(a){const t=PH();
  if(a==='ins'){const cd=P.tr[cur.r][cur.c];if(cd){menu=null;openBlocks(pg(cd),pn(cd))}else menu={t:'groups',i:0};return}
  menu=null;
  if(a==='copy'){clip=P.tr[cur.r][cur.c];flash(clip?t.copied:t.empty)}
  else if(a==='paste'){if(clip){setBlk(clip);flash(t.pasted)}else flash(t.nothing)}
  else if(a==='del'){setBlk(0);flash(t.deleted)}
  else if(a==='tempo')menu={t:'tempo'};else if(a==='vol')menu={t:'vol'};
  else if(a==='spk'){P.spk=P.spk?0:1;setFx();phSave();flash(P.spk?t.m_spk:t.m_hp)}
  else if(a==='demo'){if(playing)stop();pDemo();cur={r:0,c:0};v0=0;phSave();flash(t.demo)}
  else if(a==='clear')menu={t:'confirm'};
  else if(a==='ring')ring();
  else if(a==='mine')menu={t:'mine',i:0};
  else if(a==='tracks')menu={t:'tracks',i:0};
  else if(a==='keys'){KS=KS?0:1;try{localStorage.setItem('d11-dj-ks',KS?'1':'0')}catch(e){}menu={t:'more',i:moreItems().findIndex(x=>x[0]==='keys')}}
  else if(a==='share'){const u=location.origin+location.pathname+'#dj='+phEnc(),m=box.querySelector('.ph-msg');
    const ok=()=>{flash(t.linkOk);if(m)m.textContent=''},bad=()=>{if(!m)return;m.textContent=t.linkMan;const i=document.createElement('input');i.type='text';i.readOnly=true;i.value=u;i.className='sq-link';m.appendChild(i);i.focus();i.select()};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,bad);else bad()}}
function adj(d){if(menu.t==='tempo'){P.bpm=Math.max(60,Math.min(200,P.bpm+d*2));phSave()}else{S.vol=Math.max(0,Math.min(1,Math.round(S.vol*10+d)/10));if(outG)outG.gain.setTargetAtTime(S.vol,ac.currentTime,.02);save()}}
function phKey(k){const t=PH();
  if(!menu){
    if(k==='up')cur.r=(cur.r+3)%4;else if(k==='down')cur.r=(cur.r+1)%4;else if(k==='left')cur.c=Math.max(0,cur.c-1);else if(k==='right')cur.c=Math.min(PNC-1,cur.c+1);
    else if(k==='ok')act('ins');else if(k==='sl'||k==='5'){phPlay()}else if(k==='sr')menu={t:'more',i:0};
    else if('1234'.includes(k))openBlocks(+k-1,0);else if(k==='0'){setBlk(0);flash(t.deleted)}else if(k==='*')act('copy');else if(k==='#')act('paste');
    else if(k==='7'||k==='9'){P.bpm=Math.max(60,Math.min(200,P.bpm+(k==='9'?5:-5)));phSave();flash(P.bpm+' '+t.bpm)}
    else if(k==='8')cur.r=(cur.r+1)%4;else if(k==='6')cur.c=Math.min(PNC-1,cur.c+1);
  }else if(menu.t==='tempo'||menu.t==='vol'){
    if(k==='left'||k==='down'||k==='7')adj(-1);else if(k==='right'||k==='up'||k==='9')adj(1);else if(k==='ok'||k==='sl'||k==='sr')menu=null;
  }else if(menu.t==='ring'){closeMenu();
  }else if(menu.t==='confirm'){
    if(k==='ok'||k==='sl'){if(playing)stop();P.tr=pblank();cur={r:0,c:0};v0=0;phSave();menu=null;flash(t.cleared)}else if(k==='sr')menu=null;
  }else{const n=mItems().length;
    if(k==='up'||k==='down'){menu.i=(menu.i+(k==='up'?n-1:1))%n;if(menu.t==='blocks')preview()}
    else if(/^[1-8]$/.test(k)&&+k<=n){menu.i=+k-1;if(menu.t==='blocks')preview()}
    else if(k==='ok'||k==='sl'||k==='right'){
      if(menu.t==='more')act(mItems()[menu.i][0]);
      else if(menu.t==='groups')openBlocks(menu.i,0);
      else if(menu.t==='blocks'){const cd=pcode(menu.g,menu.i);closeMenu();setBlk(cd)}
      else if(menu.t==='tracks'){MUTE[menu.i]=MUTE[menu.i]?0:1}
      else if(menu.t==='mine'){menu={t:'slot',n:menu.i,i:0}}
      else if(menu.t==='slot'){const it=mItems()[menu.i][0],n=menu.n;
        if(it==='save'){const d=new Date();putSlot(n,{s:phEnc(),d:String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')});menu={t:'mine',i:n};flash(t.saved)}
        else{const v=slots()[n],m=v&&phDec(v.s);if(m){if(playing)stop();P=m;cur={r:0,c:0};v0=0;phSave();menu=null;flash(t.opened)}}}}
    else if(k==='sr'||k==='left'){if(menu.t==='blocks'){const g=menu.g;closeMenu();if(k==='left')menu={t:'groups',i:g}}else if(menu.t==='slot')menu={t:'mine',i:menu.n};else if(menu.t==='tracks'||menu.t==='mine')menu={t:'more',i:moreItems().findIndex(x=>x[0]===menu.t)};else menu=null}}
  phR()}
function phMark(){if(!menu||menu.t==='ring')phR()}
function pline(){const l=box.querySelector('.pline');if(!l)return;if(!playing||PV||ph<0){l.hidden=true;return}
  const c=box.querySelector(`.pc[data-r="0"][data-c="${Math.floor(ph/16)}"]`);if(!c){l.hidden=true;return}l.hidden=false;l.style.left=(c.offsetLeft+c.offsetWidth*(ph%16)/16)+'px'}
function fmtDur(){const sec=Math.round(songLen()*16*60/P.bpm/4);return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}

const PKM={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'ok',Escape:'sr',Backspace:'0',Delete:'0',' ':'sl'};
box.addEventListener('keydown',e=>{if(MODE!=='phone'||!e.target.closest||!e.target.closest('.ph')||e.ctrlKey||e.metaKey||e.altKey)return;
  let k=PKM[e.key]||(/^[0-9*#]$/.test(e.key)?e.key:'');if(!k)return;
  if(e.target.tagName==='BUTTON'&&(e.key==='Enter'||e.key===' '))return; // the focused key handles itself
  if(k==='0'&&menu&&e.key==='Backspace')k='sr';
  e.preventDefault();e.stopPropagation();if(initAudio()&&ac.state!=='running')ac.resume();kclick();phKey(k)});
draw();
addEventListener('d11lang',()=>setTimeout(draw,0));
})();
