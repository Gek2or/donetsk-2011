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
ru:{code:'Телефон',h:'Рингтоны Донецка 2010 года',
 p:'33 мелодии, знакомые каждому, в шести жанрах: «К Элизе» в клубном ремиксе, «Коробейники» на баяне, Моцарт попсой из маршрутки. Выбери справа мелодию и жанр, поставь на звонок, а в композиторе собери свой рингтон из блоков.',
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
uk:{code:'Телефон',h:'Рингтони Донецька 2010 року',
 p:'33 мелодії, знайомі кожному, у шести жанрах: «До Елізи» в клубному реміксі, «Коробейники» на баяні, Моцарт попсою з маршрутки. Обери праворуч мелодію й жанр, постав на дзвінок, а в композиторі збери свій рингтон із блоків.',
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
en:{code:'Phone',h:'Donetsk ringtones, 2010',
 p:'33 tunes everyone knows, in six genres: Für Elise as a club remix, Korobeiniki on a bayan, Mozart as minibus pop. Pick a tune and a genre on the right, set it as your ringtone, and build your own from blocks in the composer.',
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
fi:{code:'Puhelin',h:'Donetskin soittoäänet 2010',
 p:'33 kaikille tuttua melodiaa kuudessa tyylissä: Für Elise klubiremiksinä, Korobeiniki bajaanilla, Mozart marsrutkan poppina. Valitse oikealta melodia ja tyyli, aseta se soittoääneksi ja kokoa säveltäjässä oma lohkoista.',
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


/* ---------- shared settings (the beat studio lives in studio.js) ---------- */
const NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
let S={vol:.8};
(function(){try{const v=JSON.parse(localStorage.getItem('d11-seq')||'null');if(v&&typeof v.vol==='number')S.vol=Math.min(1,Math.max(0,v.vol))}catch(e){}})();
let saveT=0;const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('d11-seq',JSON.stringify({vol:S.vol}))}catch(e){}},300)};
let msg='';

/* ---------- v7.37: phone composer, block-based like the tune composers on mid-2000s Sony Ericsson phones ----------
   Four tracks (drums, bass, chords, accents); each cell holds a one-bar block from one of four groups (intro, verse, chorus,
   break), eight blocks per group. All blocks are our own patterns; same-numbered blocks share a chord root (natural minor on A). */
let MODE='phone';
const PHX={"ru": {"m_ring": "Поставить на звонок", "ringing": "Входящий вызов", "caller": "Мама", "answer": "Ответить", "reject": "Отклонить", "ringNote": "♪ твоя мелодия", "m_mine": "Мои мелодии", "slot": "Мелодия", "slotEmpty": "пусто", "s_open": "Открыть", "s_save": "Сохранить сюда", "saved": "Сохранено", "opened": "Открыто", "m_tracks": "Дорожки", "on": "вкл", "off": "выкл", "m_keys": "Звук клавиш", "len": "длина", "help2": "В композиторе правая клавиша — «Опции»: «Поставить на звонок» — входящий вызов с твоей мелодией, «Мои мелодии» — пять ячеек памяти, «Дорожки» — выключить любую из четырёх. Первая строка опций — «Главное меню»."}, "uk": {"m_ring": "Поставити на дзвінок", "ringing": "Вхідний виклик", "caller": "Мама", "answer": "Відповісти", "reject": "Відхилити", "ringNote": "♪ твоя мелодія", "m_mine": "Мої мелодії", "slot": "Мелодія", "slotEmpty": "порожньо", "s_open": "Відкрити", "s_save": "Зберегти сюди", "saved": "Збережено", "opened": "Відкрито", "m_tracks": "Доріжки", "on": "увімк", "off": "вимк", "m_keys": "Звук клавіш", "len": "довжина", "help2": "У композиторі права клавіша — «Опції»: «Поставити на дзвінок» — вхідний виклик із твоєю мелодією, «Мої мелодії» — п’ять комірок пам’яті, «Доріжки» — вимкнути будь-яку з чотирьох. Перший рядок опцій — «Головне меню»."}, "en": {"m_ring": "Set as ringtone", "ringing": "Incoming call", "caller": "Mum", "answer": "Answer", "reject": "Decline", "ringNote": "♪ your tune", "m_mine": "My tunes", "slot": "Tune", "slotEmpty": "empty", "s_open": "Open", "s_save": "Save here", "saved": "Saved", "opened": "Opened", "m_tracks": "Tracks", "on": "on", "off": "off", "m_keys": "Key sounds", "len": "length", "help2": "In the composer the right key is Options: Set as ringtone plays an incoming call with your tune, My tunes has five memory slots, Tracks turns any of the four off. The first line of Options is the Main menu."}, "fi": {"m_ring": "Aseta soittoääneksi", "ringing": "Saapuva puhelu", "caller": "Äiti", "answer": "Vastaa", "reject": "Hylkää", "ringNote": "♪ sinun melodiasi", "m_mine": "Omat melodiat", "slot": "Melodia", "slotEmpty": "tyhjä", "s_open": "Avaa", "s_save": "Tallenna tähän", "saved": "Tallennettu", "opened": "Avattu", "m_tracks": "Raidat", "on": "päällä", "off": "pois", "m_keys": "Näppäinäänet", "len": "kesto", "help2": "Säveltäjässä oikea näppäin avaa Valinnat: Aseta soittoääneksi soittaa saapuvan puhelun melodiallasi, Omat melodiat -kohdassa on viisi muistipaikkaa ja Raidat-kohdasta voi hiljentää minkä tahansa neljästä. Valintojen ensimmäinen rivi on Päävalikko."}};for(const l in PHX)Object.assign(PHT[l],PHX[l]);
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
let P={bpm:118,spk:0,tr:pblank()},MUTE=[0,0,0,0],KS=1;try{KS=localStorage.getItem('d11-dj-ks')==='0'?0:1}catch(e){}
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
try{if(!localStorage.getItem('d11-spk2')){P.spk=0;localStorage.setItem('d11-spk2','1')}}catch(e){P.spk=0}
let phSaveT=0;const phSave=()=>{clearTimeout(phSaveT);phSaveT=setTimeout(()=>{try{localStorage.setItem('d11-dj',phEnc())}catch(e){}},300)};

/* ---------- audio ---------- */
let ac=null,master,outG,comp,nbuf,FX={},hissG,duck,PAN={},DEST=null,an=null;const D=()=>DEST||duck||master;
const mtof=m=>440*Math.pow(2,(m-69)/12);
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
  outG=ac.createGain();outG.gain.value=S.vol;
  // v7.41 mix bus: music runs through a ducker (sidechained to the kick) and stereo spots, everything gets a gentle EQ,
  // a small room reverb on a send, the old compressor, and a brick-wall limiter at the very end so nothing clips
  const lim=ac.createDynamicsCompressor();lim.threshold.value=-2;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.002;lim.release.value=.08;chain(outG,lim,ac.destination);an=ac.createAnalyser();an.fftSize=512;an.smoothingTimeConstant=.72;lim.connect(an);
  chain(master,filt('highpass',28,.7),filt('lowshelf',120,undefined,1.5),filt('peaking',3200,.9,-1.5),filt('highshelf',9500,undefined,-2),comp);
  duck=ac.createGain();duck.connect(master);
  const pan=(v,to)=>{const n=ac.createStereoPanner?ac.createStereoPanner():ac.createGain();if(n.pan)n.pan.value=v;n.connect(to);return n};
  PAN={L:pan(-.34,duck),R:pan(.34,duck),l:pan(-.14,duck),r:pan(.2,duck),dl:pan(-.24,master),dr:pan(.28,master)};
  { const sr=ac.sampleRate,ir=ac.createBuffer(2,Math.floor(sr*1.7),sr);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++){const x=i/d.length;d[i]=(Math.random()*2-1)*Math.pow(1-x,3.4)*Math.min(1,i/(sr*.01))}}
    const cv=ac.createConvolver();cv.buffer=ir;const rs=ac.createGain();rs.gain.value=.17;chain(master,rs,filt('highpass',300,.7),cv,filt('lowpass',6000,.7),comp) }
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
function setFx(k0){if(!ac)return;const k=k0||(P.spk?'spk':'clean');try{comp.disconnect()}catch(e){}comp.connect((FX[k]||FX.clean).i);hissG.gain.value=k==='tape'?.011:0}
function env(g,t,a,pk,hold,rel){const p=g.gain;p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(pk,t+a);if(hold>0)p.setValueAtTime(pk,t+a+hold);p.setTargetAtTime(.0001,t+a+Math.max(0,hold),rel/4)}
function perc(g,t,pk,dec){const p=g.gain;p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(pk,t+.002);p.exponentialRampToValueAtTime(.0001,t+.002+dec)}
function noise(t,dur,...nodes){const s=ac.createBufferSource();s.buffer=nbuf;chain(s,...nodes,D());s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}
function osc(type,f,t,dur,...nodes){const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);chain(o,...nodes,D());o.start(t);o.stop(t+dur+.05);return o}
function metal(t,dec,pk){const g=ac.createGain(),bp=filt('bandpass',10000,.9),hp=filt('highpass',7000,.7);chain(bp,hp,g,D());
  [2,3,4.16,5.43,6.79,8.21].forEach(r=>{const o=ac.createOscillator();o.type='square';o.frequency.value=40*r;o.connect(bp);o.start(t);o.stop(t+dec+.06)});perc(g,t,pk,dec);
  const a=ac.createGain();noise(t,dec,filt('highpass',9000),a);perc(a,t,pk*.35,dec*.8)}
const DUCK={club:.42,pop:.6,rap:.7};
function drum(r,t,v,s,depth){const o=DEST;DEST=r==='hat'||r==='oh'?PAN.dr:r==='crash'||r==='clap'||r==='tom'?PAN.dl:master;DR[r](t,v,s);DEST=o;
  if(r==='kick'&&duck){const g=duck.gain,d=depth||.72;g.setTargetAtTime(d,t,.004);g.setTargetAtTime(1,t+.045,.085)}}
const DR={
 kick(t,v){const sh=ac.createWaveShaper();sh.curve=soft(1.6);const g=ac.createGain(),o=osc('sine',165,t,.5,sh,g);o.frequency.exponentialRampToValueAtTime(48,t+.09);perc(g,t,.9*v,.38);
   const s2=ac.createGain();osc('sine',50,t,.45,s2);perc(s2,t,.24*v,.3);
   const c=ac.createGain();noise(t,.02,filt('highpass',3000),c);perc(c,t,.1*v,.008)},
 snare(t,v){const g=ac.createGain();noise(t,.24,filt('bandpass',2600,.7),filt('highpass',900),g);perc(g,t,.4*v,.18);
   const h=ac.createGain(),o=osc('sine',205,t,.14,h);o.frequency.exponentialRampToValueAtTime(170,t+.05);perc(h,t,.34*v,.1);
   const a=ac.createGain();noise(t,.08,filt('highpass',7000),a);perc(a,t,.08*v,.06)},
 clap(t,v){const g=ac.createGain();noise(t,.3,filt('bandpass',1150,.9),g);const p=g.gain;p.setValueAtTime(.0001,t);
   [0,.011,.022].forEach(o=>{p.setValueAtTime(.6*v,t+o);p.exponentialRampToValueAtTime(.08*v,t+o+.009)});p.setValueAtTime(.5*v,t+.03);p.exponentialRampToValueAtTime(.0001,t+.22)},
 hat(t,v){metal(t,.045,.16*v)},
 oh(t,v){metal(t,.3,.12*v)},
 tram(t,v){[0,.12].forEach((o,k)=>{const a=k?.7:1;[[1240,1],[2985,.45],[3870,.28],[5260,.12]].forEach(([f,m])=>{const g=ac.createGain();osc('sine',f,t+o,1.7,g);perc(g,t+o,.13*v*m*a,1.5)});
   const n=ac.createGain();noise(t+o,.03,filt('bandpass',3000,2),n);perc(n,t+o,.12*v*a,.02)})},
 pip(t,v){const g=ac.createGain(),p=g.gain;osc('sine',1000,t,.12,g);p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(.26*v,t+.004);p.setValueAtTime(.26*v,t+.096);p.linearRampToValueAtTime(.0001,t+.1)}
};
function lead(kind,m,t,dur,v){
  const f=mtof(m),g=ac.createGain();
  if(kind==='saw'){const lp=filt('lowpass',800,2);lp.frequency.setValueAtTime(800,t);lp.frequency.linearRampToValueAtTime(4200,t+.012);lp.frequency.setTargetAtTime(1500,t+.02,.12);
    lp.connect(g);[-14,0,14].forEach(c=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=c;o.connect(lp);o.start(t);o.stop(t+dur+.4)});chain(g,D());env(g,t,.004,.085*v,dur*.75,.16)}
  else if(kind==='sq'){osc('square',f,t,dur+.2,filt('lowpass',5200,.5),g);env(g,t,.002,.075*v,dur*.7,.03)}
  else if(kind==='reed'){const lp=filt('lowpass',2600,1.5),pk=filt('peaking',1150,1.2,6);chain(lp,pk,g,D());
    const lf=ac.createOscillator(),lg=ac.createGain();lf.frequency.value=5.3;lg.gain.value=7;lf.connect(lg);lf.start(t);lf.stop(t+dur+.3);
    [-7,7].forEach(c=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=c;lg.connect(o.detune);o.connect(lp);o.start(t);o.stop(t+dur+.3)});
    const s=ac.createOscillator(),sg=ac.createGain();s.type='square';s.frequency.value=f/2;sg.gain.value=.35;s.connect(sg).connect(lp);s.start(t);s.stop(t+dur+.3);
    env(g,t,.035,.09*v,dur*.85,.09)}
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
const sd=()=>60/(PLY?PLY.bpm:P.bpm)/4;
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
  const o=FMP[kind],f=mtof(m),g=ac.createGain(),lpo=filt('lowpass',kind==='bell'?9000:6500,.6);g.connect(lpo);lpo.connect(D());
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
function pev(e,t,r){if(e.d){drum(e.d,t,e.v,e.s,.7);return}if(e.fx){pfx(e.fx,t,e.L*sd());return}const o=DEST;DEST=r===2?(e.m%2?PAN.L:PAN.R):r===3?PAN.r:null;fm(e.i,e.m,t,e.L*sd()*.95,e.v||1);DEST=o}
let PV=null; // block preview while browsing the list: {r,cd}
function phTrig(s,t){
  if(PLY){PLY.ev[s%PLY.len].forEach(e=>pv(e,t));return}
  if(PV){blk(PV.r,PV.cd)[s%16].forEach(e=>pev(e,t,PV.r));return}
  const b=Math.floor(s/16),st=s%16;for(let r=0;r<4;r++){const cd=P.tr[r][b];if(cd&&!MUTE[r])blk(r,cd)[st].forEach(e=>pev(e,t,r))}}
function kclick(){if(!KS||!ac)return;const t=ac.currentTime+.005,g=ac.createGain();osc('sine',1400,t,.05,g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.04)}

/* ---------- v7.39: ringtone library: public-domain classics and folk tunes, arranged on the fly in six genres ---------- */
const TUNES=[
 {id:'elise',c:'cl',k:[9,'hm'],bar:6,bpm:72,n:{ru:'К Элизе',uk:'До Елізи',en:'Für Elise',fi:'Für Elise'},by:'Beethoven · 1810',
  m:'r:4 E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 A4:3 C4:1 E4:1 A4:1 B4:3 E4:1 G#4:1 B4:1 C5:3 E4:1 E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 A4:3 C4:1 E4:1 A4:1 B4:3 E4:1 C5:1 B4:1 A4:6'},
 {id:'ode',c:'cl',k:[2,'maj'],bar:16,bpm:116,n:{ru:'Ода к радости',uk:'Ода до радості',en:'Ode to Joy',fi:'Oodi ilolle'},by:'Beethoven · 1824',
  m:'F#5:4 F#5:4 G5:4 A5:4 A5:4 G5:4 F#5:4 E5:4 D5:4 D5:4 E5:4 F#5:4 F#5:6 E5:2 E5:8 F#5:4 F#5:4 G5:4 A5:4 A5:4 G5:4 F#5:4 E5:4 D5:4 D5:4 E5:4 F#5:4 E5:6 D5:2 D5:8'},
 {id:'serenade',c:'cl',k:[7,'maj'],bar:16,bpm:132,n:{ru:'Маленькая ночная серенада',uk:'Маленька нічна серенада',en:'Eine kleine Nachtmusik',fi:'Eine kleine Nachtmusik'},by:'Mozart · 1787',
  m:'G5:4 r:2 D5:2 G5:4 r:2 D5:2 G5:2 D5:2 G5:2 B5:2 D6:4 r:4 C6:4 r:2 A5:2 C6:4 r:2 A5:2 C6:2 A5:2 F#5:2 A5:2 D5:4 r:4'},
 {id:'turca',c:'cl',k:[9,'hm'],bar:8,bpm:120,n:{ru:'Турецкий марш',uk:'Турецький марш',en:'Rondo alla Turca',fi:'Turkkilainen marssi'},by:'Mozart · 1783',
  m:'B4:1 A4:1 G#4:1 A4:1 C5:2 r:2 D5:1 C5:1 B4:1 C5:1 E5:2 r:2 F5:1 E5:1 D#5:1 E5:1 B5:1 A5:1 G#5:1 A5:1 B5:1 A5:1 G#5:1 A5:1 C6:4 B5:2 A5:2 G5:2 A5:2 B5:2 A5:2 G5:2 A5:2 B5:2 A5:2 G5:2 F#5:2 E5:4 r:4'},
 {id:'sym40',c:'cl',k:[7,'hm'],bar:16,bpm:116,n:{ru:'Симфония № 40',uk:'Симфонія № 40',en:'Symphony No. 40',fi:'Sinfonia nro 40'},by:'Mozart · 1788',
  m:'r:12 Eb5:2 D5:2 D5:4 Eb5:2 D5:2 D5:4 Eb5:2 D5:2 D5:4 Bb5:4 r:4 Bb5:2 A5:2 G5:4 G5:2 F5:2 Eb5:4 Eb5:2 D5:2 C5:4 C5:4 r:4 D5:2 C5:2 C5:4 D5:2 C5:2 C5:4 D5:2 C5:2 C5:4 A5:4 r:4 A5:2 G5:2 F#5:4 F#5:2 Eb5:2 D5:4 D5:2 C5:2 Bb4:4 Bb4:4 r:8'},
 {id:'king',c:'cl',k:[11,'min'],bar:16,bpm:120,n:{ru:'В пещере горного короля',uk:'У печері гірського короля',en:'In the Hall of the Mountain King',fi:'Vuorenpeikkojen salissa'},by:'Grieg · 1875',
  m:'B4:2 C#5:2 D5:2 E5:2 F#5:2 D5:2 F#5:4 F5:2 C#5:2 F5:4 E5:2 C5:2 E5:4 B4:2 C#5:2 D5:2 E5:2 F#5:2 D5:2 F#5:2 B5:2 A5:2 F#5:2 D5:2 F#5:2 A5:8'},
 {id:'badinerie',c:'cl',k:[11,'hm'],bar:8,bpm:100,n:{ru:'Шутка',uk:'Жарт',en:'Badinerie',fi:'Badinerie'},by:'Bach · 1739',
  m:'B5:2 D6:1 B5:1 F#5:2 B5:1 F#5:1 D5:2 F#5:1 D5:1 B4:4 F#4:1 B4:1 D5:1 B4:1 C#5:1 B4:1 C#5:1 B4:1 A#4:1 C#5:1 E5:1 C#5:1 D5:2 B4:2'},
 {id:'morning',c:'cl',k:[4,'maj'],bar:12,bpm:72,n:{ru:'Утро',uk:'Ранок',en:'Morning Mood',fi:'Aamutunnelma'},by:'Grieg · 1875',
  m:'B5:2 G#5:2 F#5:2 E5:2 F#5:2 G#5:2 B5:2 G#5:2 F#5:2 E5:2 F#5:2 G#5:2 F#5:2 G#5:2 B5:2 G#5:2 B5:2 C#6:2 G#5:2 C#6:2 B5:2 G#5:2 F#5:2 E5:2'},
 {id:'swan',c:'cl',k:[11,'min'],bar:16,bpm:84,n:{ru:'Лебединое озеро',uk:'Лебедине озеро',en:'Swan Lake',fi:'Joutsenlampi'},by:'Tchaikovsky · 1876',
  m:'F#5:12 B4:1 C#5:1 D5:1 E5:1 F#5:6 D5:2 F#5:6 D5:2 F#5:6 B4:2 D5:2 B4:2 G4:2 D5:2 B4:16'},
 {id:'canon',c:'cl',k:[2,'maj'],bar:16,bpm:72,n:{ru:'Канон',uk:'Канон',en:'Canon in D',fi:'Kaanon D-duuri'},by:'Pachelbel · ~1680',
  m:'F#5:4 E5:4 D5:4 C#5:4 B4:4 A4:4 B4:4 C#5:4 D5:4 C#5:4 B4:4 A4:4 G4:4 F#4:4 G4:4 E4:4'},
 {id:'minuet',c:'cl',k:[7,'maj'],bar:12,bpm:112,n:{ru:'Менуэт соль мажор',uk:'Менует соль мажор',en:'Minuet in G',fi:'Menuetti G-duuri'},by:'Petzold · 1725',
  m:'D5:4 G4:2 A4:2 B4:2 C5:2 D5:4 G4:4 G4:4 E5:4 C5:2 D5:2 E5:2 F#5:2 G5:4 G4:4 G4:4 C5:4 D5:2 C5:2 B4:2 A4:2 B4:4 C5:2 B4:2 A4:2 G4:2 F#4:4 G4:2 A4:2 B4:2 G4:2 A4:12'},
 {id:'toccata',c:'cl',k:[2,'hm'],bar:16,bpm:60,n:{ru:'Токката ре минор',uk:'Токата ре мінор',en:'Toccata in D minor',fi:'Toccata d-molli'},by:'Bach · ~1704',
  m:'A5:1 G5:1 A5:12 r:2 G5:1 F5:1 E5:1 D5:1 C#5:4 D5:8 A4:1 G4:1 A4:12 r:2 E4:2 F4:2 C#4:4 D4:8'},
 {id:'bee',c:'cl',k:[9,'hm'],bar:16,bpm:132,n:{ru:'Полёт шмеля',uk:'Політ джмеля',en:'Flight of the Bumblebee',fi:'Kimalaisen lento'},by:'Rimsky-Korsakov · 1900',
  m:'E5:1 D#5:1 D5:1 C#5:1 D5:1 C#5:1 C5:1 B4:1 C5:1 C#5:1 D5:1 D#5:1 E5:1 D#5:1 D5:1 C#5:1 E5:1 D#5:1 D5:1 C#5:1 D5:1 C#5:1 C5:1 B4:1 A4:1 A#4:1 B4:1 C5:1 C#5:1 D5:1 D#5:1 E5:1'},
 {id:'spring',c:'cl',k:[4,'maj'],bar:16,bpm:100,n:{ru:'Весна',uk:'Весна',en:'Spring',fi:'Kevät'},by:'Vivaldi · 1725',
  m:'r:14 E5:2 G#5:2 G#5:2 G#5:2 F#5:1 E5:1 B5:6 B5:1 A5:1 G#5:2 G#5:2 G#5:2 F#5:1 E5:1 B5:6 B5:1 A5:1 G#5:2 A5:2 B5:2 A5:2 G#5:2 F#5:2 D#5:2 B4:2 E5:8 r:8'},
 {id:'fifth',c:'cl',k:[0,'hm'],bar:8,bpm:108,n:{ru:'Пятая симфония',uk:'П’ята симфонія',en:'Symphony No. 5',fi:'Sinfonia nro 5'},by:'Beethoven · 1808',
  m:'r:2 G5:2 G5:2 G5:2 Eb5:8 r:2 F5:2 F5:2 F5:2 D5:8 r:2 G5:2 G5:2 G5:2 Eb5:2 Ab5:2 Ab5:2 Ab5:2 G5:2 Eb6:2 Eb6:2 Eb6:2 C6:8'},
 {id:'korob',c:'fo',k:[9,'hm'],bar:16,bpm:140,n:{ru:'Коробейники',uk:'Коробейники',en:'Korobeiniki',fi:'Korobeiniki'},by:'народная · XIX в.',
  m:'E5:4 B4:2 C5:2 D5:4 C5:2 B4:2 A4:4 A4:2 C5:2 E5:4 D5:2 C5:2 B4:6 C5:2 D5:4 E5:4 C5:4 A4:4 A4:8 r:2 D5:4 F5:2 A5:4 G5:2 F5:2 E5:6 C5:2 E5:4 D5:2 C5:2 B4:4 B4:2 C5:2 D5:4 E5:4 C5:4 A4:4 A4:8'},
 {id:'shchedryk',c:'fo',k:[7,'min'],bar:12,bpm:120,n:{ru:'Щедрик',uk:'Щедрик',en:'Shchedryk',fi:'Štšedryk'},by:'Leontovych · 1916',
  m:'Bb5:4 A5:2 Bb5:2 G5:4 Bb5:4 A5:2 Bb5:2 G5:4 Bb5:4 A5:2 Bb5:2 G5:4 Bb5:4 A5:2 Bb5:2 G5:4 D6:4 C6:2 D6:2 Bb5:4 D6:4 C6:2 D6:2 Bb5:4 Bb5:4 A5:2 Bb5:2 G5:4 Bb5:4 A5:2 Bb5:2 G5:4'},
 {id:'green',c:'fo',k:[9,'hm'],bar:12,bpm:92,n:{ru:'Зелёные рукава',uk:'Зелені рукава',en:'Greensleeves',fi:'Greensleeves'},by:'английская · XVI в.',
  m:'r:10 A4:2 C5:4 D5:2 E5:3 F5:1 E5:2 D5:4 B4:2 G4:3 A4:1 B4:2 C5:4 A4:2 A4:3 G#4:1 A4:2 B4:4 G#4:2 E4:4 A4:2 C5:4 D5:2 E5:3 F5:1 E5:2 D5:4 B4:2 G4:3 A4:1 B4:2 C5:3 B4:1 A4:2 G#4:3 F#4:1 G#4:2 A4:6 A4:6'},
 {id:'bells',c:'ho',k:[0,'maj'],bar:16,bpm:132,n:{ru:'Бубенцы',uk:'Дзвіночки',en:'Jingle Bells',fi:'Kulkuset'},by:'Pierpont · 1857',
  m:'E5:4 E5:4 E5:8 E5:4 E5:4 E5:8 E5:4 G5:4 C5:6 D5:2 E5:16 F5:4 F5:4 F5:6 F5:2 F5:4 E5:4 E5:4 E5:2 E5:2 E5:4 D5:4 D5:4 E5:4 D5:8 G5:8'},
 {id:'bday',c:'ho',k:[0,'maj'],bar:12,bpm:100,n:{ru:'С днём рождения',uk:'З днем народження',en:'Happy Birthday',fi:'Paljon onnea'},by:'Hill · 1893',
  m:'r:8 G4:3 G4:1 A4:4 G4:4 C5:4 B4:8 G4:3 G4:1 A4:4 G4:4 D5:4 C5:8 G4:3 G4:1 G5:4 E5:4 C5:4 B4:4 A4:4 F5:3 F5:1 E5:4 C5:4 D5:4 C5:12'},
 {id:'lullaby',c:'ho',k:[0,'maj'],bar:12,bpm:84,n:{ru:'Колыбельная',uk:'Колискова',en:'Lullaby',fi:'Kehtolaulu'},by:'Brahms · 1868',
  m:'r:8 E5:2 E5:2 G5:8 E5:2 E5:2 G5:8 E5:2 G5:2 C6:4 B5:6 A5:2 A5:4 G5:8 D5:2 E5:2 F5:4 D5:4 D5:2 E5:2 F5:8 D5:2 F5:2 B5:2 A5:2 G5:4 B5:4 C6:8'},
 {id:'auld',c:'ho',k:[5,'maj'],bar:16,bpm:96,n:{ru:'Старое доброе время',uk:'Старі добрі часи',en:'Auld Lang Syne',fi:'Auld Lang Syne'},by:'шотландская · XVIII в.',
  m:'r:12 C5:4 F5:6 F5:2 F5:4 A5:4 G5:6 F5:2 G5:4 A5:2 G5:2 F5:6 F5:2 A5:4 C6:4 D6:12 D6:4 C6:6 A5:2 A5:4 F5:4 G5:6 F5:2 G5:4 A5:4 F5:6 D5:2 D5:4 C5:4 F5:12 r:4'},
 {id:'enter',c:'re',k:[0,'maj'],bar:16,bpm:84,n:{ru:'Артист эстрады',uk:'Артист естради',en:'The Entertainer',fi:'The Entertainer'},by:'Joplin · 1902',
  m:'r:14 D5:1 D#5:1 E5:1 C6:2 E5:1 C6:2 E5:1 C6:9 C6:1 D6:1 D#6:1 E6:1 C6:1 D6:1 E6:2 B5:1 D6:2 C6:3 D5:1 D#5:1 E5:1 C6:2 E5:1 C6:2 E5:1 C6:9 A5:1 G5:1 F#5:1 A5:1 C6:1 E6:2 D6:1 C6:1 A5:1 D6:6'},
 {id:'cuca',c:'re',k:[5,'maj'],bar:16,bpm:132,n:{ru:'Кукарача',uk:'Кукарача',en:'La Cucaracha',fi:'La Cucaracha'},by:'мексиканская · XIX в.',
  m:'C5:2 C5:2 C5:2 F5:6 A5:4 C5:2 C5:2 C5:2 F5:6 A5:4 F5:4 F5:2 E5:2 E5:2 D5:2 D5:2 C5:2 C5:12 r:4'}
];
const TCAT=['cl','fo','ho','re'];
const TGEN=['orig','club','pop','shan','chip','rap'];
const TX9={ru:{cats:{cl:'Классика',fo:'Народные',ho:'Праздник',re:'Ретро'},gens:{orig:'Оригинал',club:'Клуб 2010',pop:'Попса',shan:'Шансон',chip:'8-бит',rap:'Рэп'},
  lib:'Мелодии',now:'Сейчас играет',pick:'Каталог мелодий',genre:'Жанр',toComp:'Композитор',toLib:'Мелодии',m_lib:'Каталог мелодий',m_comp:'Открыть композитор',m_ringT:'Поставить на звонок',
  folk:'народная',hint:'Выбери мелодию и жанр — она сразу заиграет на телефоне. Стрелки ◀ ▶ на джойстике меняют жанр, ▲ ▼ — мелодию.',
  libNote:'Все мелодии — классика и народные песни, давно перешедшие в общественное достояние. Аранжировки в шести жанрах собираются прямо на странице и есть только здесь.',
  helpL:'Мелодии: ◀ ▶ меняют жанр, ▲ ▼ — мелодию, центр играет и останавливает; «Меню» открывает все разделы телефона.'},
 uk:{cats:{cl:'Класика',fo:'Народні',ho:'Свято',re:'Ретро'},gens:{orig:'Оригінал',club:'Клуб 2010',pop:'Попса',shan:'Шансон',chip:'8-біт',rap:'Реп'},
  lib:'Мелодії',now:'Зараз грає',pick:'Каталог мелодій',genre:'Жанр',toComp:'Композитор',toLib:'Мелодії',m_lib:'Каталог мелодій',m_comp:'Відкрити композитор',m_ringT:'Поставити на дзвінок',
  folk:'народна',hint:'Обери мелодію й жанр — вона одразу заграє на телефоні. Стрілки ◀ ▶ на джойстику змінюють жанр, ▲ ▼ — мелодію.',
  libNote:'Усі мелодії — класика й народні пісні, що давно перейшли в суспільне надбання. Аранжування в шести жанрах збираються просто на сторінці й є лише тут.',
  helpL:'Мелодії: ◀ ▶ змінюють жанр, ▲ ▼ — мелодію, центр грає й зупиняє; «Меню» відкриває всі розділи телефона.'},
 en:{cats:{cl:'Classical',fo:'Folk',ho:'Holiday',re:'Retro'},gens:{orig:'Original',club:'Club 2010',pop:'Pop',shan:'Chanson',chip:'8-bit',rap:'Rap'},
  lib:'Tunes',now:'Now playing',pick:'Tune catalogue',genre:'Genre',toComp:'Composer',toLib:'Tunes',m_lib:'Tune catalogue',m_comp:'Open the composer',m_ringT:'Set as ringtone',
  folk:'folk',hint:'Pick a tune and a genre and it starts playing on the phone. The joystick ◀ ▶ changes the genre, ▲ ▼ the tune.',
  libNote:'Every tune is a classical piece or folk song long in the public domain. The arrangements in six genres are built right on this page and exist only here.',
  helpL:'Tunes: ◀ ▶ change the genre, ▲ ▼ the tune, the centre plays and stops; Menu opens every section of the phone.'},
 fi:{cats:{cl:'Klassinen',fo:'Kansanlaulut',ho:'Juhla',re:'Retro'},gens:{orig:'Alkuperäinen',club:'Klubi 2010',pop:'Pop',shan:'Šanson',chip:'8-bit',rap:'Räp'},
  lib:'Melodiat',now:'Nyt soi',pick:'Melodialuettelo',genre:'Tyyli',toComp:'Säveltäjä',toLib:'Melodiat',m_lib:'Melodialuettelo',m_comp:'Avaa säveltäjä',m_ringT:'Aseta soittoääneksi',
  folk:'kansanlaulu',hint:'Valitse melodia ja tyyli, niin se alkaa soida puhelimessa. Ohjaimen ◀ ▶ vaihtaa tyyliä, ▲ ▼ melodiaa.',
  libNote:'Kaikki melodiat ovat klassisia teoksia tai kansanlauluja, jotka ovat olleet pitkään vapaasti käytettävissä. Kuuden tyylin sovitukset syntyvät tällä sivulla ja ovat vain täällä.',
  helpL:'Melodiat: ◀ ▶ vaihtaa tyyliä, ▲ ▼ melodiaa, keskikohta soittaa ja pysäyttää; Valikko avaa puhelimen kaikki osiot.'}};
const T9=()=>TX9[L()];
const FOLKBY={ru:null,uk:{'народная · XIX в.':'народна · XIX ст.','английская · XVI в.':'англійська · XVI ст.','шотландская · XVIII в.':'шотландська · XVIII ст.','мексиканская · XIX в.':'мексиканська · XIX ст.'},
  en:{'народная · XIX в.':'Russian folk · 19th c.','английская · XVI в.':'English · 16th c.','шотландская · XVIII в.':'Scottish · 18th c.','мексиканская · XIX в.':'Mexican · 19th c.'},
  fi:{'народная · XIX в.':'venäläinen kansanlaulu · 1800-l.','английская · XVI в.':'englantilainen · 1500-l.','шотландская · XVIII в.':'skotlantilainen · 1700-l.','мексиканская · XIX в.':'meksikolainen · 1800-l.'}};
const COMP={ru:{'Beethoven':'Бетховен','Mozart':'Моцарт','Grieg':'Григ','Bach':'Бах','Tchaikovsky':'Чайковский','Pachelbel':'Пахельбель','Petzold':'Петцольд','Rimsky-Korsakov':'Римский-Корсаков','Vivaldi':'Вивальди','Leontovych':'Леонтович','Pierpont':'Пирпонт','Hill':'сёстры Хилл','Brahms':'Брамс','Joplin':'Джоплин','J. Strauss II':'Иоганн Штраус','Chopin':'Шопен','Wagner':'Вагнер','Foster':'Фостер'},
 uk:{'Beethoven':'Бетховен','Mozart':'Моцарт','Grieg':'Гріг','Bach':'Бах','Tchaikovsky':'Чайковський','Pachelbel':'Пахельбель','Petzold':'Петцольд','Rimsky-Korsakov':'Римський-Корсаков','Vivaldi':'Вівальді','Leontovych':'Леонтович','Pierpont':'Пірпонт','Hill':'сестри Гілл','Brahms':'Брамс','Joplin':'Джоплін','J. Strauss II':'Йоганн Штраус','Chopin':'Шопен','Wagner':'Вагнер','Foster':'Фостер'},
 en:{'Hill':'Hill sisters'},fi:{'Tchaikovsky':'Tšaikovski','Rimsky-Korsakov':'Rimski-Korsakov','Leontovych':'Leontovytš','Hill':'Hillin sisaret'}};
const byOf=tu=>{const l=L(),m=FOLKBY[l];if(m&&m[tu.by])return m[tu.by];const k=tu.by.split(' · '),c=COMP[l]||{};return c[k[0]]?c[k[0]]+(k[1]?' · '+k[1]:''):tu.by};
const NPC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function pnotes(str){let s=0;const out=[];for(const tk of str.trim().split(/\s+/)){const [a,b]=tk.split(':'),L=+b;if(a!=='r'){const m=a.match(/^([A-G])([#b]?)(\d)$/);out.push({s,m:12*(+m[3]+1)+NPC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0),L})}s+=L}return {notes:out,len:s}}
const GDR={ // per genre: 16-step and 12-step drum rows
 club:{16:{kick:'x...x...x...x...',clap:'....x.......x...',hat:'xx.xxx.xxx.xxx.x',oh:'..x...x...x...x.'},12:{kick:'x...x...x...',clap:'....x.......',oh:'..x...x...x.'}},
 pop:{16:{kick:'x...x...x...x...',snare:'....x.......x...',hat:'.x.x.x.x.x.x.x.x',oh:'..x...x...x...x.'},12:{kick:'x...........',snare:'....x...x...',hat:'..x...x...x.'}},
 shan:{16:{kick:'x.......x.......',snare:'....x.......x...',hat:'..x...x...x...x.'},12:{kick:'x...........',hat:'....x...x...'}},
 chip:{16:{kick:'x.......x.......',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.x.'},12:{kick:'x...........',snare:'....x...x...',hat:'x.x.x.x.x.x.'}},
 rap:{16:{kick:'x......x..x.....',snare:'....x.......x...',hat:'x.x.x.x.x.x.x...',oh:'..............x.'},12:{kick:'x.....x.....',snare:'....x.......',hat:'x.x.x.x.x.x.'}}};
const GBPM={club:126,pop:132,shan:100,rap:88};
function harm(tu,notes,len){ // one diatonic triad per segment, chosen by how much of the melody it holds
  const sc=(tu.k[1]==='maj'?[0,2,4,5,7,9,11]:[0,2,3,5,7,8,10]).map(x=>(x+tu.k[0])%12),hm=tu.k[1]==='hm';
  const triOf=d=>hm&&d===4?[sc[4],(tu.k[0]+11)%12,sc[1]]:[sc[d],sc[(d+2)%7],sc[(d+4)%7]];
  const seg=tu.bar===16?8:tu.bar,out=[];let prev=0;
  for(let a=0;a<len;a+=seg){const w=Array(12).fill(0);notes.forEach(n=>{const o=Math.min(n.s+n.L,a+seg)-Math.max(n.s,a);if(o>0)w[n.m%12]+=o*(n.s===a?1.6:1)});
    let best=0,bs=-1;for(let d=0;d<7;d++){if(tu.k[1]!=='maj'&&d===1)continue;if(tu.k[1]==='maj'&&d===6)continue;const tri=triOf(d);
      let v=tri.reduce((x,p)=>x+w[p],0)+([0,3,4].includes(d)?.6:0)+(d===prev?.3:0)+(a===0&&d===0?2:0)+(a+seg>=len&&d===0?1.5:0);
      if(tu.k[1]!=='maj'&&d===4)v+=.4;if(v>bs){bs=v;best=d}}
    prev=best;out.push({s:a,L:Math.min(seg,len-a),root:sc[best],tri:triOf(best)})}
  return out}
const near=(pc,lo)=>{let m=lo-((lo%12)-pc+12)%12;if(m<lo)m+=12;return m};
let PLY=null; // current arrangement {tu,g,len,bpm,ev[step][]}
function arrange(tu,g){const {notes,len}=pnotes(tu.m),ch=harm(tu,notes,len),bar=tu.bar,ev=Array.from({length:len},()=>[]);
  const add=(s,e)=>{if(s>=0&&s<len)ev[s].push(e)};
  const bpm=g==='orig'?tu.bpm:g==='chip'?Math.round(tu.bpm*1.08):GBPM[g];
  const leadI={orig:tu.c==='ho'?'bell':'ep',club:'fml',pop:'lsaw',shan:'lreed',chip:'sql',rap:'lkeys'}[g],up=g==='chip'?12:0;
  notes.forEach(n=>add(n.s,{m:n.m+up,L:n.L,i:leadI,v:g==='orig'?1:.95,mel:1}));
  const pat=GDR[g],dp=pat&&(pat[bar]||pat[bar*2]||pat[16]);
  if(dp){const dl=bar===8||bar===6?bar:dp.kick.length;for(let s=0;s<len;s++){const k=s%dl;for(const r in dp)if(dp[r][k]==='x')add(s,{d:r,v:r==='hat'||r==='oh'?(k%4===0?1:.7):1})}}
  ch.forEach(c=>{const R=near(c.root,36),tri=c.tri.map(p=>near(p,55));
    for(let s=c.s;s<c.s+c.L;s++){const k=s-c.s;
      if(g==='orig'){if(k===0){add(s,{m:R+12,L:c.L,i:'sub',v:.55});tri.forEach(m=>add(s,{m,L:c.L,i:'pad',v:.5}))}}
      else if(g==='club'){if(k%4===2)add(s,{m:R+12,L:2,i:'fmb',v:.75});if(k%4===2)tri.forEach(m=>add(s,{m:m+12,L:1,i:'brass',v:.32}))}
      else if(g==='pop'){if(k%2===0)add(s,{m:R+(k%4===2?24:12),L:2,i:'fmb2',v:.7});if(k%4===0)tri.forEach(m=>add(s,{m,L:3,i:'ep',v:.38}))}
      else if(g==='shan'){const odd=Math.floor(c.s/c.L)%2;
        if(bar===12){if(k===0)add(s,{m:R+12,L:3,i:'bpluck',v:.8});else if(k===4||k===8)tri.forEach(m=>add(s,{m,L:2,i:'lreedc',v:.36}))}
        else if(bar===6){if(k===0)add(s,{m:R+12,L:2,i:'bpluck',v:.8});else if(k===2||k===4)tri.forEach(m=>add(s,{m,L:1,i:'lreedc',v:.3}))}
        else{if(k===0)add(s,{m:R+(odd?19:12),L:3,i:'bpluck',v:.8});else if(k===4)tri.forEach(m=>add(s,{m,L:2,i:'lreedc',v:.36}))}}
      else if(g==='chip'){if(k%2===0)add(s,{m:R+12,L:2,i:'bsq',v:.55});add(s,{m:tri[k%3]+12,L:1,i:'sqarp',v:.22})}
      else if(g==='rap'){if(k===0||k===7||k===10)add(s,{m:R+12,L:3,i:'sub',v:.6});if(k===0)tri.forEach(m=>add(s,{m,L:Math.min(6,c.L),i:'ep',v:.4}))}}});
  return {tu,g,len,bpm,ev,ch}}
function pv(e,t){if(e.d){drum(e.d,t,e.v,0,DUCK[PLY.g]||.75);if(e.d==='kick')vizBump(.5);else if(e.d==='snare'||e.d==='clap')vizBump(.3);return}if(!e.mel&&e.m)vizL[e.m%8]=Math.max(vizL[e.m%8],.45);const d=e.L*sd()*.95,v=e.v||1;
  const od=DEST;DEST=e.mel?null:(e.i==='pad'||e.i==='ep'||e.i==='brass'||e.i==='lreedc'||e.i==='sqarp')?(e.m%2?PAN.L:PAN.R):null;
  if(e.i==='lsaw')lead('saw',e.m,t,d,v);else if(e.i==='lreed'||e.i==='lreedc')lead('reed',e.m,t,d,v);else if(e.i==='lkeys')lead('keys',e.m,t,d,v);
  else if(e.i==='bpluck')bass('pluck',e.m,t,d,v);else if(e.i==='bsq')bass('sq',e.m,t,d,v);
  else if(e.i==='sqarp'){const g=ac.createGain();osc('square',mtof(e.m),t,d+.05,filt('lowpass',4000,.5),g);env(g,t,.002,.04*v,d*.6,.02)}
  else fm(e.i,e.m,t,d,v);DEST=od;
  if(e.mel)vizHit(e.m)}
let vizL=[0,0,0,0,0,0,0,0];function vizHit(m){vizL[m%8]=1;vizL[(m+3)%8]=Math.max(vizL[(m+3)%8],.6)}function vizBump(v){vizL=vizL.map((x,i)=>Math.max(x,v*(.6+.4*((i*37)%8)/8)))}

/* ---------- transport ---------- */
let playing=false,step=0,nextT=0,timer=0,vq=[],raf=0,ph=-1;
const curLen=()=>PLY?PLY.len:PV?16:16*songLen();
function sched(){const len=curLen();while(nextT<ac.currentTime+.12){if(step>=len)step=0;const sw=PLY&&PLY.g==='rap'?26:0,t=nextT+(step%2?sw/100*sd()*.66:0);phTrig(step,t);vq.push([step,t]);nextT+=sd();step=(step+1)%len}}
function vis(){raf=requestAnimationFrame(vis);if(!ac)return;if(MODE==='phone'&&PLY&&menu&&(menu.t==='lib'||menu.t==='kp'||menu.t==='quiz')){libTick();qTick()}let cur=-2;while(vq.length&&vq[0][1]<=ac.currentTime+.005)cur=vq.shift()[0];if(cur!==-2&&cur!==ph){ph=cur;mark()}}
let lastB=-9;
function mark(){if(PLY&&menu&&(menu.t==='lib'||menu.t==='kp'||menu.t==='quiz')){if(menu.t==='lib'&&ph===0&&lastPh>0){lastPh=-1;setTimeout(autoNext,0)}else lastPh=ph;libTick();return}const b=playing&&ph>=0?Math.floor(ph/16):-1;if(b!==lastB){lastB=b;phMark()}pline()}
function start(from){if(!initAudio()){say(T().noAudio);return}if(window.D11STUDIO)D11STUDIO.stop();ac.resume&&ac.resume();setFx();playing=true;step=from||0;vq=[];lastB=-9;nextT=ac.currentTime+.06;sched();clearInterval(timer);timer=setInterval(sched,25);cancelAnimationFrame(raf);vis();btn()}
function stop(){playing=false;clearInterval(timer);cancelAnimationFrame(raf);vq=[];ph=-1;mark();btn()}
function btn(){phR();miniR();const c=box.querySelector('.pcard');if(c&&SIDE==='lib')c.outerHTML=cardHTML()}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop()});
document.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target;
  if(tg&&tg.closest&&tg.closest('input,select,textarea,button,a,iframe,[contenteditable],dialog'))return;
  const r=box.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;if(window.D11STUDIO&&D11STUDIO.active())return;e.preventDefault();phPlay()});

/* ---------- UI ---------- */
function draw(){
  const t=T(),pt=PH();
  const hd=`<div class="head"><div><div class="code"><b>01</b><span>${esc(t.code)}</span></div><h2>${esc(t.h)}</h2></div><p class="lede">${esc(t.p)}</p></div>`;
  if(MODE==='phone'){if(phMsg==='fromLink'&&menu&&menu.t==='lib'){menu=null;SIDE='comp'}if(CALL&&!draw.c){draw.c=1;MODE='phone';menu={t:'callwait'};setTimeout(()=>{const e=document.getElementById('seq');if(e)e.scrollIntoView({block:'start'})},300)}if(location.hash==='#quiz'&&!draw.q){draw.q=1;SIDE='quiz';menu={t:'quiz'};setTimeout(()=>{const e=document.getElementById('seq');if(e)e.scrollIntoView({block:'start'})},300)}if(!libList().includes(LIB.i))libCat=TUNES[LIB.i].c;box.innerHTML=hd+phHTML();keyLabels();setTimeout(miniInit,0);if(draw.tl){draw.tl=0;menu={t:'lib'};SIDE='lib';setTimeout(()=>{const e=document.getElementById('seq');if(e)e.scrollIntoView({block:'start'});flash(T12().tapPlay)},300)}if(phMsg){flash(pt[phMsg]||phMsg);phMsg=''}return}
}
function say(s){const p=box.querySelector('.ph-msg');if(p)p.textContent=s}
box.addEventListener('click',e=>{
  const sdb=e.target.closest('.plb [data-side]');if(sdb){sideSet(sdb.dataset.side);return}
  const cbn=e.target.closest('.plb [data-cb]');if(cbn){const a=cbn.dataset.cb;if(initAudio()&&ac.state!=='running')ac.resume();
    if(menu||PV)closeMenu();
    if(a==='play')phPlay();else if(a==='bm'||a==='bp'){P.bpm=Math.max(60,Math.min(200,P.bpm+(a==='bp'?5:-5)));phSave()}
    else if(/^mu[0-3]$/.test(a)){const r=+a[2];MUTE[r]=MUTE[r]?0:1}else act(a);
    phR();cbSync();return}
  const qa=e.target.closest('[data-qa]');if(qa&&menu&&menu.t==='quiz'){quizAnswer(+qa.dataset.qa);return}
  if(e.target.closest('.plb [data-qs]')){if(initAudio()&&ac.state!=='running')ac.resume();quizStart();sideR();return}
  if(e.target.closest('.plb [data-qshare]')){const u=location.origin+location.pathname+'#quiz',txt=TT().q_text.replace('{n}',Q.score)+' '+u,m=box.querySelector('.plb .pcall-msg');
    const ok=()=>{if(m)m.textContent=TT().q_shared},bad=()=>{if(!m)return;m.textContent='';const i=document.createElement('input');i.type='text';i.readOnly=true;i.value=txt;i.className='sq-link';m.appendChild(i);i.select()};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,bad);else bad();return}
  const kg=e.target.closest('.plb [data-kg]');if(kg){KP.g=kg.dataset.kg;kpSave();menu={t:'kp'};if(initAudio()&&ac.state!=='running')ac.resume();if(playing)stop();kpPlay();phR();sideR();return}
  const ka=e.target.closest('.plb [data-kpa]');if(ka){menu={t:'kp'};if(initAudio()&&ac.state!=='running')ac.resume();const a=ka.dataset.kpa;if(a==='play')kpPlay();else if(a==='undo'){KP.n.pop();kpSave()}else if(a==='clear'){if(playing)stop();KP.n=[];kpSave()}phR();sideR();return}
  const cl=e.target.closest('.plb [data-call]');if(cl){const inp=box.querySelector('.pcall input');try{localStorage.setItem('d11-callname',inp?inp.value.trim().slice(0,20):'')}catch(x){}
    const u=callLink(cl.dataset.call),m=box.querySelector('.pcall-msg');const ok=()=>{if(m)m.textContent=TT().c_ok},bad=()=>{if(!m)return;m.textContent=TT().c_man;const i=document.createElement('input');i.type='text';i.readOnly=true;i.value=u;i.className='sq-link';m.appendChild(i);i.select()};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,bad);else bad();return}
  const lc=e.target.closest('.plb [data-cat]');if(lc){libCat=lc.dataset.cat;QS='';sideR();return}
  const cp=e.target.closest('.plb [data-cp]');if(cp){const a=cp.dataset.cp,tu=TUNES[LIB.i],x=T12();if(initAudio()&&ac.state!=='running')ac.resume();menu={t:'lib'};
    if(a==='play'){if(playing&&PLY&&PLY.tu===tu)stop();else libPlay(true)}
    else if(a==='fav'){const k=FAV.indexOf(tu.id);if(k<0)FAV.unshift(tu.id);else FAV.splice(k,1);favSave();sideR();return}
    else if(a==='next'){libSet(libNext(),undefined,true);return}
    else if(a==='ring'){PLY=arrange(tu,LIB.g);menu={t:'more',lib:1};ring();menu.lib=1;phR();const f=box.querySelector('.ph');if(f)f.scrollIntoView({behavior:'smooth',block:'center'});return}
    else if(a==='auto'){LIB.auto=!LIB.auto;try{localStorage.setItem('d11-lib-auto',JSON.stringify(LIB.auto))}catch(x){}}
    else if(a==='link'){const u=tuneLink(),m=box.querySelector('.pcard-msg');const ok=()=>{if(m)m.textContent=x.linkOk},bad=()=>{if(!m)return;m.textContent='';const i=document.createElement('input');i.type='text';i.readOnly=true;i.value=u;i.className='sq-link';m.appendChild(i);i.select()};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,bad);else bad();return}
    const c=box.querySelector('.pcard');if(c)c.outerHTML=cardHTML();phR();return}
  const lt=e.target.closest('.plb [data-tune]');if(lt){if(initAudio()&&ac.state!=='running')ac.resume();SIDE='lib';menu={t:'lib'};libSet(+lt.dataset.tune,undefined,true);return}
  const lg=e.target.closest('.plb [data-gen]');if(lg){if(initAudio()&&ac.state!=='running')ac.resume();menu={t:'lib'};libSet(undefined,lg.dataset.gen,true);return}
  const pk=e.target.closest('[data-pk]');if(pk){if(!initAudio()){}else if(ac.state!=='running')ac.resume();kclick();phKey(pk.dataset.pk);const f=box.querySelector('.ph');if(f&&e.detail)f.focus({preventScroll:true});return}
  const pc=e.target.closest('.pc');if(pc){const r=+pc.dataset.r,c=+pc.dataset.c;if(r===cur.r&&c===cur.c)phKey('ok');else{cur={r,c};phR()}return}
  const mi=e.target.closest('[data-mi]');if(mi&&menu){const i=+mi.dataset.mi;if(i===menu.i||menu.t==='main'){menu.i=i;phKey('ok')}else{menu.i=i;if(menu.t==='blocks')preview();phR()}return}
});
box.addEventListener('input',e=>{const el=e.target;if(el.matches&&el.matches('.plb-search input')){QS=el.value;const z=T12(),l=L(),lst=libList(),L2=box.querySelector('.plb-list');if(L2)L2.innerHTML=lst.length?lst.map(i=>{const tu=TUNES[i];return `<button type="button" data-tune="${i}" aria-pressed="${i===LIB.i}"><b>${FAV.includes(tu.id)?'♥ ':''}${esc(tu.n[l]||tu.n.ru)}</b><small>${esc(byOf(tu))}</small></button>`}).join(''):`<p class="plb-none">${esc(z.none)}</p>`;box.querySelectorAll('.plb-cats button').forEach(b=>b.setAttribute('aria-selected',!QS&&b.dataset.cat===libCat));return}});

/* ---------- v7.37: phone UI ---------- */
let LIB={i:0,g:'club'};try{const v=JSON.parse(localStorage.getItem('d11-lib')||'null');if(v&&TUNES[v.i]&&TGEN.includes(v.g))LIB=v}catch(e){}
const libSave=()=>{try{localStorage.setItem('d11-lib',JSON.stringify(LIB))}catch(e){}};
let cur={r:0,c:0},v0=0,menu={t:'lib'},clip=0,toastT=0,toast='';
const GC=['dg0','dg1','dg2','dg3'];
function phTime(){const b=document.querySelector('.dn-chip b');const s=b&&b.textContent||'';return /\d/.test(s)?s:''}
function softL(){const t=PH();if(menu&&menu.t==='ring')return menu.call?[t.answer,'',t.reject]:softRing();if(menu&&menu.t==='quiz')return Q.st==='ask'||Q.st==='show'?['','',TT().q_exit]:[Q.st==='end'?TT().q_again:TT().q_start,'',TT().q_exit];
  if(menu&&menu.t==='kp')return [playing?TT().k_stop:TT().k_play,'▲ '+T9().genre+' ▼',PH().back];
  if(menu&&menu.t==='callwait')return ['OK','',''];if(menu&&menu.t==='talk')return ['','',''];
  if(menu&&menu.t==='lib')return [playing&&PLY?t.stop:t.play,'◀ '+T9().genre+' ▶',PMN().menu];if(menu){if(menu.t==='confirm')return [t.yes,'',t.no];if(menu.t==='tempo'||menu.t==='vol')return [t.sel,'◀ ▶',t.back];return [t.sel,'',t.back]}
  return [playing&&!PV?t.stop:t.play,P.tr[cur.r][cur.c]?t.edit:t.ins,PMN().opts]}
function softRing(){const t=PH();return [t.answer,'',t.reject]}
function moreItems(){const t=PH();return [['main','☰ '+PMN().main],['ins',t.m_ins],['copy',t.m_copy],['paste',t.m_paste],['del',t.m_del],['tempo',t.m_tempo+' · '+P.bpm],['tracks',t.m_tracks],['mine',t.m_mine],['ring',t.m_ring],['demo',t.m_demo],['clear',t.m_clear],['share',t.m_share]]}
function mItems(){const t=PH();if(!menu)return [];if(menu.t==='more')return moreItems();if(menu.t==='set')return setItems();
  if(menu.t==='groups')return t.groups.map((g,i)=>[i,g,GC[i]]);if(menu.t==='blocks')return Array.from({length:8},(_,i)=>[i,t.groups[menu.g]+' '+(i+1),GC[menu.g]]);
  if(menu.t==='cats')return TCAT.map((c,i)=>[c,T9().cats[c]+' · '+TUNES.filter(x=>x.c===c).length]);
  if(menu.t==='tunes')return TUNES.map((x,i)=>[i,x]).filter(a=>a[1].c===menu.c).map(a=>[a[0],a[1].n[L()]||a[1].n.ru]);
  if(menu.t==='tracks')return t.tracks.map((x,i)=>[i,x+' · '+(MUTE[i]?t.off:t.on),'pt'+i+(MUTE[i]?' off':'')]);
  if(menu.t==='mine'){const a=slots();return [0,1,2,3,4].map(i=>[i,t.slot+' '+(i+1)+' · '+(a[i]?a[i].d:t.slotEmpty)])}
  if(menu.t==='slot'){const a=slots();return (a[menu.n]?[['open',t.s_open]]:[]).concat([['save',t.s_save]])}return []}
function mTitle(){const t=PH();if(menu.t==='main')return PMN().main;if(menu.t==='set')return PMN().it.set;if(menu.t==='more')return PMN().opts;if(menu.t==='groups')return t.tracks[cur.r];if(menu.t==='blocks')return t.tracks[cur.r]+' · '+t.groups[menu.g];
  if(menu.t==='tempo')return t.m_tempo;if(menu.t==='vol')return t.m_vol;if(menu.t==='tracks')return t.m_tracks;if(menu.t==='mine')return t.m_mine;if(menu.t==='slot')return t.slot+' '+(menu.n+1);if(menu.t==='ring')return t.ringing;if(menu.t==='lib')return T9().lib;if(menu.t==='quiz')return TT().q_title;if(menu.t==='kp')return TT().k_title;if(menu.t==='talk'||menu.t==='callwait')return TT().c_from;if(menu.t==='cats')return T9().pick;if(menu.t==='tunes')return T9().cats[menu.c];return t.title}
function info(){const t=PH();if(toast)return toast;if(menu&&menu.t==='main')return PMN().hint[MAINK[menu.i]];if(menu&&menu.t==='quiz')return quizInfo();if(menu&&menu.t==='kp')return KP.n.length?'♪ '+(playing?TT().k_stop:TT().k_play)+' · '+T9().gens[KP.g]:'';if(menu&&(menu.t==='talk'||menu.t==='callwait'))return '';if(menu)return menu.t==='blocks'?'♪ '+t.groups[menu.g]+' '+(menu.i+1):menu.t==='ring'?(PLY?PLY.tu.n[L()]||PLY.tu.n.ru:t.len+' '+fmtDur()):menu.t==='lib'?(playing&&PLY?T9().now+' · ':'')+T9().cats[TUNES[LIB.i].c]+' · '+(LIB.i+1)+'/'+TUNES.length:'';
  const cd=P.tr[cur.r][cur.c];return t.tracks[cur.r]+' · '+(cd?t.groups[pg(cd)]+' '+(pn(cd)+1):t.empty)+' · '+t.bar+' '+(cur.c+1)+'/'+songLen()}
function gridH(){const t=PH(),pc=playing&&!PV&&ph>=0?Math.floor(ph/16):-1,fc=pc>=0?pc:cur.c;
  if(fc<v0)v0=fc;if(fc>v0+7)v0=fc-7;v0=Math.max(0,Math.min(PNC-8,v0));
  let h='<div class="pg"><span></span>';for(let c=v0;c<v0+8;c++)h+=`<span class="pn${c===pc?' on':''}">${c+1}</span>`;
  for(let r=0;r<4;r++){h+=`<span class="pt pt${r}${r===cur.r?' on':''}">${esc(t.trs[r])}</span>`;
    for(let c=v0;c<v0+8;c++){const cd=P.tr[r][c];h+=`<span class="pc${MUTE[r]?' mu':''}${cd?' '+GC[pg(cd)]:''}${r===cur.r&&c===cur.c?' cur':''}${c===pc?' play':''}" data-r="${r}" data-c="${c}">${cd?pn(cd)+1:''}</span>`}}
  return h+'<i class="pline" hidden></i></div>'}
function menuH(){const t=PH();
  if(menu.t==='quiz')return quizScr();if(menu.t==='kp')return kpScr();if(menu.t==='talk')return talkScr();if(menu.t==='callwait')return callWaitScr();
  if(menu.t==='lib'){const tu=TUNES[LIB.i],x=T9();return `<div class="plib"><b>${esc(tu.n[L()]||tu.n.ru)}</b><span>${esc(byOf(tu))}</span><div class="pgen" data-pk2="g"><i>◀</i><em>${esc(x.gens[LIB.g])}</em><i>▶</i></div><div class="pviz" aria-hidden="true">${vizL.map(()=>'<s></s>').join('')}</div><div class="pprog"><s></s></div></div>`}
  if(menu.t==='ring')return `<div class="pring"><div class="pr-ico" aria-hidden="true"><i></i></div><span>${esc(RINGNAME||t.caller)}</span><b>${esc(t.ringNote)}</b></div>`;
  if(menu.t==='tempo'||menu.t==='vol'){const isT=menu.t==='tempo',v=isT?P.bpm:Math.round(S.vol*10),mn=isT?60:0,mx=isT?200:10;
    return `<div class="pv"><b>${v}</b><span>${isT?esc(t.bpm):'/ 10'}</span><i><s style="width:${Math.round((v-mn)/(mx-mn)*100)}%"></s></i></div>`}
  if(menu.t==='confirm')return `<div class="pv pq"><span>${esc(t.confirm)}</span></div>`;
  if(menu.t==='main'){const x=PMN();return '<div class="pmg">'+MAINK.map((k,i)=>`<span class="pmi${i===menu.i?' on':''}" data-mi="${i}"><i aria-hidden="true">${MAINI[k]}</i><b>${esc(x.it[k])}</b></span>`).join('')+'</div>'}
  const it=mItems(),top=Math.max(0,Math.min(it.length-6,menu.i-2));
  return '<ol class="pm">'+it.slice(top,top+6).map((x,k)=>{const i=top+k;return `<li class="${i===menu.i?'on':''}" data-mi="${i}">${x[2]?`<i class="${x[2]}"></i>`:''}<span>${esc(x[1])}</span></li>`}).join('')+'</ol>'+
    (it.length>6?`<div class="psb"><s style="top:${Math.round(menu.i/(it.length-1)*80)}%"></s></div>`:'')}
function scrH(){const t=PH(),[a,b,c]=softL();
  return `<div class="ps-stat"><i class="psig" aria-hidden="true"><b></b><b></b><b></b><b></b></i><span>${esc(phTime())}</span><i class="pbat" aria-hidden="true"><b></b></i></div>
<div class="ps-title"><span>${esc(menu?mTitle():t.title)}</span><b>${menu&&['quiz','kp','callwait','talk','ring','cats','tunes','main','set'].includes(menu.t)?'':menu&&menu.t==='lib'?(PLY?fmtDur():''):(playing?'♪ ':'')+fmtDur()+' · '+P.bpm}</b></div>
<div class="ps-body">${menu?menuH():gridH()}</div>
<div class="ps-info">${esc(info())}</div>
<div class="ps-soft"><span>${esc(a)}</span><span>${esc(b)}</span><span>${esc(c)}</span></div>`}
function phR(){const s=box.querySelector('.ph-scr');if(!s)return;s.innerHTML=scrH();keyLabels();if(SIDE==='comp')cbSync();const [a,,c]=softL();
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
<div class="ph-side" id="phHelp"><div class="plb">${sideTabs()}${sideHTML()}</div>
<details class="ph-help"><summary>${esc(t.helpH)}</summary><ol>${[T9().helpL].concat(t.help,[t.help2]).map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p class="ph-about">${esc(t.about)}</p></details>
<p class="ph-msg" role="status" aria-live="polite"></p></div></div>`}
function flash(s){toast=s;clearTimeout(toastT);phR();toastT=setTimeout(()=>{toast='';phR()},1600)}
function closeMenu(){if(PV){PV=null;stop()}if(menu&&menu.t==='ring'){stop();ringOff();if(PLY){menu={t:'lib'};return}}menu=null}
function ringOff(){const f=box.querySelector('.ph');if(f)f.classList.remove('ringing');if(!(menu&&menu.call))RINGNAME=''}
let ringT=0;function ring(){if(playing)stop();if(!(menu&&menu.lib))PLY=null;menu={t:'ring'};start(0);const f=box.querySelector('.ph');if(f)f.classList.add('ringing');clearTimeout(ringT);ringT=setTimeout(()=>{if(menu&&menu.t==='ring'){closeMenu();phR()}},30000)}
function preview(){if(!initAudio())return;PV={r:cur.r,cd:pcode(menu.g,menu.i)};if(playing){step=0;vq=[];nextT=ac.currentTime+.04}else start(0)}
function openBlocks(g,i){if(playing&&!PV)stop();PLY=null;menu={t:'blocks',g,i};preview()}
function phPlay(){if(menu&&menu.t==='lib'){phKey('ok');return}if(menu)closeMenu();PLY=null;if(playing){stop();return}const L=songLen();start(cur.c<L?cur.c*16:0)}
function setBlk(v){P.tr[cur.r][cur.c]=v;phSave()}
function act(a){const t=PH(),frm=menu&&menu.t==='set'?menu:null;
  if(a==='main'){menu={t:'main',i:mainIdx(),from:null};return}
  if(a==='lib'){if(playing)stop();menu={t:'lib'};SIDE='lib';sideR();return}
  if(a==='cat'){menu={t:'cats',i:TCAT.indexOf(TUNES[LIB.i].c),lib:1};return}
  if(a==='comp'){if(playing)stop();PLY=null;menu=null;SIDE='comp';sideR();return}
  if(a==='ring'&&menu&&menu.lib){PLY=arrange(TUNES[LIB.i],LIB.g);ring();return}
  if(a==='ins'){const cd=P.tr[cur.r][cur.c];if(cd){menu=null;openBlocks(pg(cd),pn(cd))}else menu={t:'groups',i:0};return}
  const fromLib=menu&&menu.lib;menu=fromLib?{t:'lib'}:null;
  if(a==='copy'){clip=P.tr[cur.r][cur.c];flash(clip?t.copied:t.empty)}
  else if(a==='paste'){if(clip){setBlk(clip);flash(t.pasted)}else flash(t.nothing)}
  else if(a==='del'){setBlk(0);flash(t.deleted)}
  else if(a==='tempo')menu={t:'tempo',from:frm};else if(a==='vol')menu={t:'vol',lib:fromLib,from:frm};
  else if(a==='spk'){P.spk=P.spk?0:1;setFx();phSave();if(frm)menu=frm;flash(P.spk?t.m_spk:t.m_hp)}
  else if(a==='demo'){if(playing)stop();pDemo();cur={r:0,c:0};v0=0;phSave();flash(t.demo)}
  else if(a==='clear')menu={t:'confirm'};
  else if(a==='ring')ring();
  else if(a==='mine')menu={t:'mine',i:0};
  else if(a==='tracks')menu={t:'tracks',i:0};
  else if(a==='keys'){KS=KS?0:1;try{localStorage.setItem('d11-dj-ks',KS?'1':'0')}catch(e){}menu=frm||{t:'more',i:0}}
  else if(a==='share'){const u=location.origin+location.pathname+'#dj='+phEnc(),m=box.querySelector('.ph-msg');
    const ok=()=>{flash(t.linkOk);if(m)m.textContent=''},bad=()=>{if(!m)return;m.textContent=t.linkMan;const i=document.createElement('input');i.type='text';i.readOnly=true;i.value=u;i.className='sq-link';m.appendChild(i);i.focus();i.select()};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,bad);else bad()}}
function adj(d){if(menu.t==='tempo'){P.bpm=Math.max(60,Math.min(200,P.bpm+d*2));phSave()}else{S.vol=Math.max(0,Math.min(1,Math.round(S.vol*10+d)/10));if(outG)outG.gain.setTargetAtTime(S.vol,ac.currentTime,.02);save()}}
function phKey(k){const t=PH();
  if(menu&&menu.t==='quiz'){quizKey(k);return}if(menu&&menu.t==='kp'){kpKey(k);return}if(menu&&menu.t==='talk')return;if(menu&&menu.t==='callwait'){callKey(k);return}
  if(menu&&menu.t==='ring'&&menu.call){if(k==='sl'||k==='ok')talkStart();else{closeMenu();RINGNAME='';phR()}return}
  if(menu&&menu.t==='main'){mainKey(k);phR();return}
  if(menu&&menu.t==='lib'){
    if(k==='up'||k==='2'||k==='down'||k==='8'){const l=libList().length?libList():TUNES.map((t,i)=>i),q=l.indexOf(LIB.i),d=(k==='up'||k==='2')?-1:1;libSet(l[((q<0?0:q+d)+l.length)%l.length])}
    else if(k==='left'||k==='4')libSet(undefined,TGEN[(TGEN.indexOf(LIB.g)+TGEN.length-1)%TGEN.length]);else if(k==='right'||k==='6')libSet(undefined,TGEN[(TGEN.indexOf(LIB.g)+1)%TGEN.length]);
    else if(k==='ok'||k==='sl'||k==='5'){if(playing)stop();else libPlay(true)}
    else if(k==='sr')menu={t:'main',i:mainIdx(),from:menu};
    else if(k==='1'){libCat=TCAT[(TCAT.indexOf(libCat)+1)%TCAT.length];menu={t:'tunes',c:libCat,i:0,lib:1}}
    phR();return}
  if(!menu){
    if(k==='up')cur.r=(cur.r+3)%4;else if(k==='down')cur.r=(cur.r+1)%4;else if(k==='left')cur.c=Math.max(0,cur.c-1);else if(k==='right')cur.c=Math.min(PNC-1,cur.c+1);
    else if(k==='ok')act('ins');else if(k==='sl'||k==='5'){phPlay()}else if(k==='sr')menu={t:'more',i:0};
    else if('1234'.includes(k))openBlocks(+k-1,0);else if(k==='0'){setBlk(0);flash(t.deleted)}else if(k==='*')act('copy');else if(k==='#')act('paste');
    else if(k==='7'||k==='9'){P.bpm=Math.max(60,Math.min(200,P.bpm+(k==='9'?5:-5)));phSave();flash(P.bpm+' '+t.bpm)}
    else if(k==='8')cur.r=(cur.r+1)%4;else if(k==='6')cur.c=Math.min(PNC-1,cur.c+1);
  }else if(menu.t==='tempo'||menu.t==='vol'){
    if(k==='left'||k==='down'||k==='7')adj(-1);else if(k==='right'||k==='up'||k==='9')adj(1);else if(k==='ok'||k==='sl'||k==='sr')menu=menu.from||(menu.lib?{t:'lib'}:null);
  }else if(menu.t==='ring'){closeMenu();
  }else if(menu.t==='confirm'){
    if(k==='ok'||k==='sl'){if(playing)stop();P.tr=pblank();cur={r:0,c:0};v0=0;phSave();menu=null;flash(t.cleared)}else if(k==='sr')menu=null;
  }else{const n=mItems().length;
    if(k==='up'||k==='down'){menu.i=(menu.i+(k==='up'?n-1:1))%n;if(menu.t==='blocks')preview()}
    else if(/^[1-8]$/.test(k)&&+k<=n){menu.i=+k-1;if(menu.t==='blocks')preview()}
    else if(k==='ok'||k==='sl'||k==='right'){
      if(menu.t==='more'||menu.t==='set')act(mItems()[menu.i][0]);
      else if(menu.t==='cats'){libCat=TCAT[menu.i];menu={t:'tunes',c:libCat,i:0,lib:1}}
      else if(menu.t==='tunes'){const id=mItems()[menu.i][0];menu={t:'lib'};libSet(id,undefined,true);return}
      else if(menu.t==='groups')openBlocks(menu.i,0);
      else if(menu.t==='blocks'){const cd=pcode(menu.g,menu.i);closeMenu();setBlk(cd)}
      else if(menu.t==='tracks'){MUTE[menu.i]=MUTE[menu.i]?0:1}
      else if(menu.t==='mine'){menu={t:'slot',n:menu.i,i:0,pf:menu.from}}
      else if(menu.t==='slot'){const it=mItems()[menu.i][0],n=menu.n;
        if(it==='save'){const d=new Date(),pf=menu.pf;putSlot(n,{s:phEnc(),d:String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')});menu={t:'mine',i:n,from:pf};flash(t.saved)}
        else{const v=slots()[n],m=v&&phDec(v.s);if(m){if(playing)stop();P=m;cur={r:0,c:0};v0=0;phSave();menu=null;flash(t.opened)}}}}
    else if((k==='sr'||k==='left')&&menu.t==='slot'){menu={t:'mine',i:menu.n,from:menu.pf}}
    else if((k==='sr'||k==='left')&&menu.from){menu=menu.from}
    else if((k==='sr'||k==='left')&&menu.lib){if(menu.t==='tunes')menu={t:'cats',i:TCAT.indexOf(menu.c),lib:1};else menu={t:'lib'}}
    else if(k==='sr'||k==='left'){if(menu.t==='blocks'){const g=menu.g;closeMenu();if(k==='left')menu={t:'groups',i:g}}else if(menu.t==='slot')menu={t:'mine',i:menu.n};else if(menu.t==='tracks'||menu.t==='mine')menu={t:'more',i:moreItems().findIndex(x=>x[0]===menu.t)};else menu=null}}
  phR()}
function phMark(){if(!menu||menu.t==='ring')phR()}
function libTick(){const vs=box.querySelectorAll('.pviz s');if(!vs.length)return;vs.forEach((e,i)=>{vizL[i]*=.9;e.style.transform='scaleY('+(.08+vizL[i]*.92).toFixed(3)+')'});
  const p=box.querySelector('.pprog s');if(p)p.style.width=(playing&&PLY&&ph>=0?((ph+1)/PLY.len*100):0)+'%'}
function libPlay(restart){const was=playing;if(was)stop();if(!restart&&was)return;PV=null;PLY=arrange(TUNES[LIB.i],LIB.g);libSave();start(0)}
function libSet(i,g,play){if(i!==undefined)LIB.i=(i+TUNES.length)%TUNES.length;if(g!==undefined)LIB.g=g;if(!menu||menu.t!=='lib')menu={t:'lib'};
  if(play||playing){PLY=null;libPlay(true)}else{PLY=arrange(TUNES[LIB.i],LIB.g);libSave()}phR();libSide()}
function libSide(){if(!QS&&!libList().includes(LIB.i))libCat=TUNES[LIB.i].c;if(SIDE==='lib'){sideR();return}const el=null;if(!el)return;const sc=el.querySelector('.plb-list');const st=sc?sc.scrollTop:0;el.innerHTML=libHTML();const n=el.querySelector('.plb-list');if(n)n.scrollTop=st}
let libCat='all';
function pline(){const l=box.querySelector('.pline');if(!l)return;if(!playing||PV||ph<0){l.hidden=true;return}
  const c=box.querySelector(`.pc[data-r="0"][data-c="${Math.floor(ph/16)}"]`);if(!c){l.hidden=true;return}l.hidden=false;l.style.left=(c.offsetLeft+c.offsetWidth*(ph%16)/16)+'px'}
function fmtDur(){const sec=Math.round((PLY&&menu&&(menu.t==='lib'||menu.t==='ring')?PLY.len*60/PLY.bpm/4:songLen()*16*60/P.bpm/4));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}

/* ---------- v7.40: quiz «Угадай мелодию», keypad composer (Nokia-style), «Тебе звонит…» links ---------- */
const TX10={
 ru:{tabs:{lib:'Мелодии',quiz:'Угадай мелодию',kp:'Набор кнопками',comp:'Композитор'},
  q_title:'Угадай мелодию',q_round:'Раунд',q_score:'Счёт',q_best:'Рекорд',q_start:'Начать',q_again:'Ещё раз',q_exit:'Выход',q_right:'Верно!',q_wrong:'Это была',q_timeout:'Время вышло',q_end:'Игра окончена',q_pts:'очков',
  q_desc:'Десять раундов. Телефон играет мелодию в случайном жанре, а ты выбираешь из четырёх вариантов. Чем быстрее, тем больше очков: до 100 за раунд.',
  q_share:'Скопировать результат',q_shared:'Результат скопирован — кинь друзьям',q_text:'Я набрал {n} очков в «Угадай мелодию» на Donetsk 2011. Сможешь больше?',
  k_title:'Набор кнопками',k_empty:'Нажимай 1–7, чтобы набрать ноты',k_notes:'нот',k_clear:'Очистить',k_undo:'Стереть ноту',k_play:'Играть',k_stop:'Стоп',
  k_desc:'Как в композиторе мелодий на старых кнопочных телефонах: набираешь ноты цифрами, а телефон играет их в выбранном жанре.',
  k_keys:[['1–7','ноты до, ре, ми, фа, соль, ля, си'],['0','пауза'],['*','октава ниже/выше'],['#','диез для следующей ноты'],['8 / 9','короче / длиннее'],['◀','стереть ноту'],['▲ ▼','жанр']],
  kl:{'1':'до','2':'ре','3':'ми','4':'фа','5':'соль','6':'ля','7':'си','8':'короч','9':'длин','*':'окт','0':'пауза','#':'♯'},
  ql:{'1':'ответ','2':'ответ','3':'ответ','4':'ответ'},ll:{'2':'▲','8':'▼','4':'◀ жанр','6':'жанр ▶','5':'▶','1':'катал'},
  c_h:'Позвонить другу',c_name:'Твоё имя',c_btn:'Скопировать ссылку-звонок',c_ok:'Ссылка скопирована: друг увидит входящий вызов от тебя под эту мелодию',c_man:'Скопируй ссылку вручную:',
  c_from:'Входящий вызов',c_tap:'Нажми любую кнопку телефона, чтобы услышать звонок',c_talk:'Разговор',c_after:'Собери свой рингтон и позвони в ответ',c_noname:'Друг',my:'Моя мелодия',comp_hint:'Композитор из блоков открыт на телефоне. Как им пользоваться — ниже.'},
 uk:{tabs:{lib:'Мелодії',quiz:'Вгадай мелодію',kp:'Набір кнопками',comp:'Композитор'},
  q_title:'Вгадай мелодію',q_round:'Раунд',q_score:'Рахунок',q_best:'Рекорд',q_start:'Почати',q_again:'Ще раз',q_exit:'Вихід',q_right:'Правильно!',q_wrong:'Це була',q_timeout:'Час вийшов',q_end:'Гру завершено',q_pts:'очок',
  q_desc:'Десять раундів. Телефон грає мелодію у випадковому жанрі, а ти обираєш з чотирьох варіантів. Що швидше, то більше очок: до 100 за раунд.',
  q_share:'Скопіювати результат',q_shared:'Результат скопійовано — кинь друзям',q_text:'Я набрав {n} очок у «Вгадай мелодію» на Donetsk 2011. Зможеш більше?',
  k_title:'Набір кнопками',k_empty:'Натискай 1–7, щоб набрати ноти',k_notes:'нот',k_clear:'Очистити',k_undo:'Стерти ноту',k_play:'Грати',k_stop:'Стоп',
  k_desc:'Як у композиторі мелодій на старих кнопкових телефонах: набираєш ноти цифрами, а телефон грає їх в обраному жанрі.',
  k_keys:[['1–7','ноти до, ре, мі, фа, соль, ля, сі'],['0','пауза'],['*','октава нижче/вище'],['#','дієз для наступної ноти'],['8 / 9','коротше / довше'],['◀','стерти ноту'],['▲ ▼','жанр']],
  kl:{'1':'до','2':'ре','3':'мі','4':'фа','5':'соль','6':'ля','7':'сі','8':'корот','9':'довш','*':'окт','0':'пауза','#':'♯'},
  ql:{'1':'відп','2':'відп','3':'відп','4':'відп'},ll:{'2':'▲','8':'▼','4':'◀ жанр','6':'жанр ▶','5':'▶','1':'катал'},
  c_h:'Подзвонити другові',c_name:'Твоє ім’я',c_btn:'Скопіювати посилання-дзвінок',c_ok:'Посилання скопійовано: друг побачить вхідний виклик від тебе під цю мелодію',c_man:'Скопіюй посилання вручну:',
  c_from:'Вхідний виклик',c_tap:'Натисни будь-яку кнопку телефона, щоб почути дзвінок',c_talk:'Розмова',c_after:'Збери свій рингтон і подзвони у відповідь',c_noname:'Друг',my:'Моя мелодія',comp_hint:'Композитор із блоків відкрито на телефоні. Як ним користуватися — нижче.'},
 en:{tabs:{lib:'Tunes',quiz:'Name that tune',kp:'Keypad composer',comp:'Composer'},
  q_title:'Name that tune',q_round:'Round',q_score:'Score',q_best:'Best',q_start:'Start',q_again:'Again',q_exit:'Exit',q_right:'Correct!',q_wrong:'It was',q_timeout:'Time is up',q_end:'Game over',q_pts:'points',
  q_desc:'Ten rounds. The phone plays a tune in a random genre and you pick one of four answers. The faster you are, the more points: up to 100 a round.',
  q_share:'Copy my score',q_shared:'Score copied — send it to your friends',q_text:'I scored {n} points in Name that tune on Donetsk 2011. Can you beat it?',
  k_title:'Keypad composer',k_empty:'Press 1–7 to enter notes',k_notes:'notes',k_clear:'Clear',k_undo:'Delete note',k_play:'Play',k_stop:'Stop',
  k_desc:'Like the tune composer on old keypad phones: type notes with the digits and the phone plays them in the genre you choose.',
  k_keys:[['1–7','notes C D E F G A B'],['0','rest'],['*','octave down/up'],['#','sharp for the next note'],['8 / 9','shorter / longer'],['◀','delete a note'],['▲ ▼','genre']],
  kl:{'1':'C','2':'D','3':'E','4':'F','5':'G','6':'A','7':'B','8':'short','9':'long','*':'oct','0':'rest','#':'♯'},
  ql:{'1':'ans','2':'ans','3':'ans','4':'ans'},ll:{'2':'▲','8':'▼','4':'◀ gen','6':'gen ▶','5':'▶','1':'list'},
  c_h:'Call a friend',c_name:'Your name',c_btn:'Copy call link',c_ok:'Link copied: your friend will see an incoming call from you with this tune',c_man:'Copy the link by hand:',
  c_from:'Incoming call',c_tap:'Press any key on the phone to hear the call',c_talk:'Call',c_after:'Build your own ringtone and call back',c_noname:'A friend',my:'My tune',comp_hint:'The block composer is open on the phone. How to use it is below.'},
 fi:{tabs:{lib:'Melodiat',quiz:'Tunnista melodia',kp:'Näppäinsäveltäjä',comp:'Säveltäjä'},
  q_title:'Tunnista melodia',q_round:'Kierros',q_score:'Pisteet',q_best:'Ennätys',q_start:'Aloita',q_again:'Uudestaan',q_exit:'Lopeta',q_right:'Oikein!',q_wrong:'Se oli',q_timeout:'Aika loppui',q_end:'Peli päättyi',q_pts:'pistettä',
  q_desc:'Kymmenen kierrosta. Puhelin soittaa melodian satunnaisella tyylillä ja sinä valitset neljästä vaihtoehdosta. Mitä nopeammin, sitä enemmän pisteitä: enintään 100 kierrokselta.',
  q_share:'Kopioi tulos',q_shared:'Tulos kopioitu — lähetä se kavereille',q_text:'Sain {n} pistettä Tunnista melodia -pelissä Donetsk 2011 -sivulla. Pystytkö parempaan?',
  k_title:'Näppäinsäveltäjä',k_empty:'Paina 1–7 syöttääksesi nuotteja',k_notes:'nuottia',k_clear:'Tyhjennä',k_undo:'Poista nuotti',k_play:'Soita',k_stop:'Seis',
  k_desc:'Kuin vanhojen näppäinpuhelinten melodiasäveltäjä: syötä nuotit numeroilla, niin puhelin soittaa ne valitsemallasi tyylillä.',
  k_keys:[['1–7','nuotit C D E F G A H'],['0','tauko'],['*','oktaavi alas/ylös'],['#','ylennys seuraavalle nuotille'],['8 / 9','lyhyempi / pidempi'],['◀','poista nuotti'],['▲ ▼','tyyli']],
  kl:{'1':'C','2':'D','3':'E','4':'F','5':'G','6':'A','7':'H','8':'lyh','9':'pitk','*':'okt','0':'tauko','#':'♯'},
  ql:{'1':'vast','2':'vast','3':'vast','4':'vast'},ll:{'2':'▲','8':'▼','4':'◀ tyyli','6':'tyyli ▶','5':'▶','1':'lista'},
  c_h:'Soita ystävälle',c_name:'Nimesi',c_btn:'Kopioi soittolinkki',c_ok:'Linkki kopioitu: ystäväsi näkee saapuvan puhelun sinulta tällä melodialla',c_man:'Kopioi linkki käsin:',
  c_from:'Saapuva puhelu',c_tap:'Paina mitä tahansa puhelimen näppäintä kuullaksesi puhelun',c_talk:'Puhelu',c_after:'Kokoa oma soittoääni ja soita takaisin',c_noname:'Ystävä',my:'Oma melodia',comp_hint:'Lohkosäveltäjä on auki puhelimessa. Käyttöohjeet ovat alla.'}};
const TT=()=>TX10[L()];
let SIDE='lib',RINGNAME='';
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* quiz */
let Q={st:'idle',r:0,score:0,order:[],opts:[],ans:0,pick:-1,sel:0,t0:0,last:0},qT=0,QBEST=0;try{QBEST=+localStorage.getItem('d11-quiz-best')||0}catch(e){}
const QN=10,QMAX=12;
function quizStart(){Q={st:'ask',r:0,score:0,order:shuffle(TUNES.map((_,i)=>i)).slice(0,QN),opts:[],ans:0,pick:-1,sel:0,t0:0,last:0};menu={t:'quiz'};quizRound()}
function quizRound(){clearTimeout(qT);const id=Q.order[Q.r],others=shuffle(TUNES.map((_,i)=>i).filter(i=>i!==id)).slice(0,3);
  Q.opts=shuffle([id].concat(others));Q.ans=Q.opts.indexOf(id);Q.pick=-1;Q.sel=0;Q.st='ask';
  if(playing)stop();PV=null;PLY=arrange(TUNES[id],TGEN[Math.floor(Math.random()*TGEN.length)]);start(0);Q.t0=performance.now();
  qT=setTimeout(()=>{if(menu&&menu.t==='quiz'&&Q.st==='ask')quizAnswer(-1)},QMAX*1000);phR();sideR()}
function quizAnswer(i){if(Q.st!=='ask')return;clearTimeout(qT);const el=(performance.now()-Q.t0)/1000;Q.pick=i;Q.st='show';
  Q.last=i===Q.ans?Math.max(20,Math.round(100-el*7)):0;Q.score+=Q.last;phR();sideR();
  qT=setTimeout(()=>{if(!menu||menu.t!=='quiz')return;Q.r++;if(Q.r>=QN){if(playing)stop();Q.st='end';if(Q.score>QBEST){QBEST=Q.score;try{localStorage.setItem('d11-quiz-best',QBEST)}catch(e){}}phR();sideR()}else quizRound()},1600)}
function quizExit(){clearTimeout(qT);if(playing)stop();Q.st='idle';menu={t:'lib'};SIDE='lib'}
const tName=i=>TUNES[i].n[L()]||TUNES[i].n.ru;
function quizScr(){const x=TT();
  if(Q.st==='idle')return `<div class="pq0"><b>${esc(x.q_title)}</b><span>${esc(x.q_best)}: ${QBEST}</span><small>${esc(x.q_desc)}</small></div>`;
  if(Q.st==='end')return `<div class="pq0"><b>${esc(x.q_end)}</b><em>${Q.score}</em><span>${esc(x.q_pts)} · ${esc(x.q_best)}: ${QBEST}</span></div>`;
  return `<div class="pqh"><span>${esc(x.q_round)} ${Q.r+1}/${QN}</span><span>${esc(x.q_score)} ${Q.score}</span></div><div class="pqbar"><s></s></div><ol class="pm pqo">${Q.opts.map((id,k)=>{
    const c=Q.st==='show'?(k===Q.ans?' ok':k===Q.pick?' bad':''):'';return `<li class="${(Q.st==='ask'&&k===Q.sel)?'on':''}${c}" data-qa="${k}"><i class="pqn">${k+1}</i><span>${esc(tName(id))}</span></li>`}).join('')}</ol>`}
function quizInfo(){const x=TT();if(Q.st==='show')return Q.pick===Q.ans?x.q_right+' +'+Q.last:(Q.pick<0?x.q_timeout:x.q_wrong)+': '+tName(Q.opts[Q.ans]);if(Q.st==='end')return x.q_score+' '+Q.score;return ''}
function quizKey(k){if(Q.st==='idle'||Q.st==='end'){if(k==='ok'||k==='sl'||k==='5')quizStart();else if(k==='sr')quizExit();phR();sideR();return}
  if(/^[1-4]$/.test(k))quizAnswer(+k-1);else if(k==='up'||k==='down'){Q.sel=(Q.sel+(k==='up'?3:1))%4;phR()}else if(k==='ok')quizAnswer(Q.sel);else if(k==='sr')quizExit();else return;phR();sideR()}
function qTick(){const b=box.querySelector('.pqbar s');if(b&&Q.st==='ask')b.style.width=Math.max(0,100-(performance.now()-Q.t0)/(QMAX*10))+'%'}
/* keypad composer */
const KD=[1,2,4,8],KPC=[0,2,4,5,7,9,11];
let KP={n:[],oct:5,sh:0,di:1,g:'chip'};
function kpEnc(n){return (n||KP.n).map(x=>(x.m<0?'-':(x.m-60).toString(36))+KD.indexOf(x.L)).join('')}
function kpDec(s){if(!/^([0-9a-z-][0-3]){0,64}$/.test(s))return null;const n=[];for(let i=0;i<s.length;i+=2){const c=s[i],m=c==='-'?-1:60+parseInt(c,36);if(m>95)return null;n.push({m,L:KD[+s[i+1]]})}return n}
try{const v=JSON.parse(localStorage.getItem('d11-kp')||'null');if(v){const n=kpDec(v.n||'');if(n)KP.n=n;if(TGEN.includes(v.g))KP.g=v.g}}catch(e){}
const kpSave=()=>{try{localStorage.setItem('d11-kp',JSON.stringify({n:kpEnc(),g:KP.g}))}catch(e){}};
function kpTune(notes){const N=notes||KP.n;let m='';N.forEach(x=>{m+=(x.m<0?'r':NN[x.m%12].replace('#','#')+(Math.floor(x.m/12)-1))+':'+x.L+' '});
  let len=N.reduce((a,x)=>a+x.L,0);const pad=(16-len%16)%16;if(pad)m+='r:'+pad;if(!m.trim())m='r:16';
  // key: the major key that holds the most of the tune, tonic weighted by the first and last notes
  const w=Array(12).fill(0);N.forEach(x=>{if(x.m>=0)w[x.m%12]+=x.L});const fl=N.filter(x=>x.m>=0);let bk=0,bs=-1;
  for(let k=0;k<12;k++){let v=[0,2,4,5,7,9,11].reduce((a,d)=>a+w[(k+d)%12],0);if(fl.length){if(fl[fl.length-1].m%12===k)v+=3;if(fl[0].m%12===k)v+=1.5}if(v>bs){bs=v;bk=k}}
  return {id:'my',c:'my',k:[bk,'maj'],bar:16,bpm:120,n:{ru:TX10.ru.my,uk:TX10.uk.my,en:TX10.en.my,fi:TX10.fi.my},by:'',m:m.trim()}}
function kpNoteTxt(x){return (16/x.L)+(x.m<0?'-':NN[x.m%12].replace('#','♯')+(Math.floor(x.m/12)-1))}
function kpScr(){const x=TT(),n=KP.n,show=n.slice(-18);
  return `<div class="pkp"><div class="pkh"><span>${esc(T9().gens[KP.g])}</span><span>${n.length} ${esc(x.k_notes)}</span></div><div class="pkn">${n.length?(n.length>18?'… ':'')+show.map(kpNoteTxt).join(' '):`<small>${esc(x.k_empty)}</small>`}<i class="pkc"></i></div>
<div class="pks"><span>${16/KD[KP.di]}</span><span>${KP.oct}</span><span>${KP.sh?'♯':'·'}</span></div><div class="pviz" aria-hidden="true">${vizL.map(()=>'<s></s>').join('')}</div></div>`}
function kpPlay(){if(playing){stop();return}if(!KP.n.length)return;PV=null;PLY=arrange(kpTune(),KP.g);start(0)}
function kpKey(k){const x=TT();
  if(/^[1-7]$/.test(k)){const m=12*(KP.oct+1)+KPC[+k-1]+KP.sh;if(KP.n.length<64){KP.n.push({m:Math.min(95,m),L:KD[KP.di]});KP.sh=0;if(!playing&&initAudio()){if(ac.state!=='running')ac.resume();lead('sq',m,ac.currentTime+.01,sd()*KD[KP.di]*.9,1)}kpSave()}}
  else if(k==='0'){if(KP.n.length<64){KP.n.push({m:-1,L:KD[KP.di]});kpSave()}}
  else if(k==='*')KP.oct=KP.oct>=6?4:KP.oct+1;else if(k==='#')KP.sh=KP.sh?0:1;
  else if(k==='8')KP.di=Math.max(0,KP.di-1);else if(k==='9')KP.di=Math.min(3,KP.di+1);
  else if(k==='left'){KP.n.pop();kpSave()}
  else if(k==='up'||k==='down'){const i=TGEN.indexOf(KP.g);KP.g=TGEN[(i+(k==='up'?TGEN.length-1:1))%TGEN.length];kpSave();if(playing){stop();kpPlay()}}
  else if(k==='ok'||k==='sl'||k==='right')kpPlay();
  else if(k==='sr'){if(playing)stop();menu={t:'lib'};SIDE='lib'}
  phR();sideR()}
/* «Тебе звонит…» links */
function callLink(kind){const inp=box.querySelector('.pcall input'),nm=(inp&&inp.value||'').trim().slice(0,20);let p;
  if(kind==='kp')p=['k',kpEnc(),KP.g];else if(kind==='comp')p=['d',phEnc()];else p=['t',TUNES[LIB.i].id,LIB.g];
  return location.origin+location.pathname+'#call='+p.join('~')+'~'+encodeURIComponent(nm)}
function callDec(h){try{const a=h.split('~');let src=null,nm='';
  if(a[0]==='t'&&a.length===4){const i=TUNES.findIndex(x=>x.id===a[1]);if(i<0||!TGEN.includes(a[2]))return null;src={k:'t',i,g:a[2]};nm=a[3]}
  else if(a[0]==='k'&&a.length===4){const n=kpDec(a[1]);if(!n||!n.length||!TGEN.includes(a[2]))return null;src={k:'k',n,g:a[2]};nm=a[3]}
  else if(a[0]==='d'&&a.length===3){const d=phDec(a[1]);if(!d)return null;src={k:'d',d};nm=a[2]}else return null;
  nm=decodeURIComponent(nm).replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,20);return {src,nm}}catch(e){return null}}
let CALL=null;{const h=location.hash.match(/^#call=(.+)$/);if(h)CALL=callDec(h[1])}
if(CALL||location.hash==='#quiz')MODE='phone';
function callPrep(){const c=CALL;if(c.src.k==='t')PLY=arrange(TUNES[c.src.i],c.src.g);else if(c.src.k==='k')PLY=arrange(kpTune(c.src.n),c.src.g);else{P=c.src.d;PLY=null}}
function callKey(k){if(initAudio()&&ac.state!=='running')ac.resume();callPrep();RINGNAME=CALL.nm||TT().c_noname;const keep=!!PLY;menu=keep?{t:'more',lib:1}:null;ring();menu.call=1;if(keep)menu.lib=1;phR()}
function talkStart(){if(playing)stop();ringOff();menu={t:'talk',t0:performance.now()};phR();const T0=menu.t0;
  const tick=()=>{if(!menu||menu.t!=='talk'||menu.t0!==T0)return;phR();if(performance.now()-T0>4200){menu={t:'lib'};SIDE='lib';RINGNAME='';PLY=null;flash(TT().c_after);sideR();return}setTimeout(tick,500)};setTimeout(tick,500)}
function talkScr(){const s=Math.floor((performance.now()-menu.t0)/1000);return `<div class="pring"><div class="pr-ico talk" aria-hidden="true"><i></i></div><span>${esc(RINGNAME)}</span><b>${esc(TT().c_talk)} 0:${String(s).padStart(2,'0')}</b></div>`}
function callWaitScr(){const x=TT();return `<div class="pring"><div class="pr-ico" aria-hidden="true"><i></i></div><b>${esc(x.c_from)}</b><span>${esc(CALL.nm||x.c_noname)}</span><small class="ptap">${esc(x.c_tap)}</small></div>`}
/* side panel */
const PMNT={
 ru:{menu:'Меню',opts:'Опции',main:'Главное меню',it:{lib:'Мелодии',comp:'Композитор',quiz:'Викторина',kp:'Набор',ring:'Звонок',mine:'Мои мелодии',studio:'Секвенсор',set:'Настройки',help:'Справка'},
  hint:{lib:'Каталог мелодий и жанров',comp:'Собери мелодию из блоков',quiz:'Угадай мелодию на слух',kp:'Играй мелодию цифрами',ring:'Как звонит выбранная мелодия',mine:'Пять ячеек памяти',studio:'Бит-секвенсор ниже',set:'Темп, громкость, динамик',help:'Как пользоваться'},helpOk:'Справка открыта под телефоном',studioNo:'Секвенсор ниже на странице'},
 uk:{menu:'Меню',opts:'Опції',main:'Головне меню',it:{lib:'Мелодії',comp:'Композитор',quiz:'Вікторина',kp:'Набір',ring:'Дзвінок',mine:'Мої мелодії',studio:'Секвенсор',set:'Налаштування',help:'Довідка'},
  hint:{lib:'Каталог мелодій і жанрів',comp:'Збери мелодію з блоків',quiz:'Вгадай мелодію на слух',kp:'Грай мелодію цифрами',ring:'Як дзвонить обрана мелодія',mine:'П’ять комірок пам’яті',studio:'Біт-секвенсор нижче',set:'Темп, гучність, динамік',help:'Як користуватися'},helpOk:'Довідку відкрито під телефоном',studioNo:'Секвенсор нижче на сторінці'},
 en:{menu:'Menu',opts:'Options',main:'Main menu',it:{lib:'Tunes',comp:'Composer',quiz:'Quiz',kp:'Keypad',ring:'Ringtone',mine:'My tunes',studio:'Sequencer',set:'Settings',help:'Help'},
  hint:{lib:'Tune and genre catalogue',comp:'Build a tune from blocks',quiz:'Name the tune by ear',kp:'Play a tune on the keys',ring:'How the chosen tune rings',mine:'Five memory slots',studio:'The beat sequencer below',set:'Tempo, volume, speaker',help:'How to use it'},helpOk:'Help is open below the phone',studioNo:'The sequencer is further down the page'},
 fi:{menu:'Valikko',opts:'Valinnat',main:'Päävalikko',it:{lib:'Melodiat',comp:'Säveltäjä',quiz:'Tietovisa',kp:'Näppäimet',ring:'Soittoääni',mine:'Muisti',studio:'Sekvensseri',set:'Asetukset',help:'Ohje'},
  hint:{lib:'Melodia- ja tyyliluettelo',comp:'Rakenna melodia lohkoista',quiz:'Tunnista melodia korvakuulolta',kp:'Soita melodia numeroilla',ring:'Miten valittu melodia soi',mine:'Viisi muistipaikkaa',studio:'Biittisekvensseri alempana',set:'Tempo, äänenvoimakkuus, kaiutin',help:'Näin se toimii'},helpOk:'Ohje on avattu puhelimen alla',studioNo:'Sekvensseri on sivun alempana'}};
const PMN=()=>PMNT[L()],MAINK=['lib','comp','quiz','kp','ring','mine','studio','set','help'],MAINI={lib:'♪',comp:'▦',quiz:'?',kp:'♫',ring:'☎',mine:'▤',studio:'◉',set:'⚙',help:'i'};
const mainIdx=()=>Math.max(0,MAINK.indexOf(SIDE));
function setItems(){const t=PH();return [['vol',t.m_vol+' · '+Math.round(S.vol*10)],['spk',P.spk?t.m_spk:t.m_hp],['keys',t.m_keys+' · '+(KS?t.on:t.off)],['tempo',t.m_tempo+' · '+P.bpm]]}
function mainGo(id){const mm=menu,back=mm&&mm.from!==undefined?mm.from:null;
  if(id==='lib'||id==='comp'||id==='quiz'||id==='kp'){sideSet(id);return}
  if(id==='ring'){if(playing)stop();PLY=arrange(TUNES[LIB.i],LIB.g);SIDE='lib';menu={t:'more',lib:1};ring();menu.lib=1;sideR();return}
  if(id==='mine'){sideSet('comp');menu={t:'mine',i:0,from:mm};return}
  if(id==='set'){menu={t:'set',i:0,from:mm};return}
  if(id==='studio'){menu=back;const e=document.getElementById('studio');if(e)e.scrollIntoView({behavior:'smooth',block:'start'});else flash(PMN().studioNo);return}
  if(id==='help'){menu=back;const h=box.querySelector('.ph-help');if(h){h.open=true;h.scrollIntoView({behavior:'smooth',block:'nearest'})}flash(PMN().helpOk)}}
function mainKey(k){const n=MAINK.length;
  if(k==='left')menu.i=(menu.i+n-1)%n;else if(k==='right')menu.i=(menu.i+1)%n;
  else if(k==='up')menu.i=(menu.i+n-3)%n;else if(k==='down')menu.i=(menu.i+3)%n;
  else if(/^[1-9]$/.test(k)){menu.i=+k-1;mainGo(MAINK[menu.i])}
  else if(k==='ok'||k==='sl')mainGo(MAINK[menu.i]);
  else if(k==='sr')menu=menu.from===undefined?null:menu.from}
function compHTML(){const t=PH(),x=TT();
  return `<h3>${esc(x.tabs.comp)}</h3><p class="plb-hint">${esc(x.comp_hint)}</p>
<div class="pcb"><div class="pcb-top"><button type="button" class="btn primary" data-cb="play">${esc(playing&&!PV?t.stop:t.play)}</button><div class="pcb-bpm" role="group" aria-label="${esc(t.m_tempo)}"><button type="button" data-cb="bm" aria-label="−5">−</button><span><b>${P.bpm}</b><small>${esc(t.bpm)}</small></span><button type="button" data-cb="bp" aria-label="+5">+</button></div></div>
<div class="pcb-tr" role="group" aria-label="${esc(t.m_tracks)}">${t.tracks.map((n,i)=>`<button type="button" class="pt${i}" data-cb="mu${i}" aria-pressed="${!MUTE[i]}">${esc(n)}</button>`).join('')}</div>
<div class="pcb-act">${[['demo',t.m_demo],['copy',t.m_copy],['paste',t.m_paste],['del',t.m_del],['clear',t.m_clear],['share',t.m_share]].map(a=>`<button type="button" class="btn ghost" data-cb="${a[0]}">${esc(a[1])}</button>`).join('')}</div></div>${callBox('comp')}`}
function cbSync(){const p=box.querySelector('.pcb');if(!p)return;const t=PH(),b=p.querySelector('.pcb-bpm b');if(b)b.textContent=P.bpm;
  const pl=p.querySelector('[data-cb="play"]');if(pl)pl.textContent=playing&&!PV?t.stop:t.play;p.querySelectorAll('.pcb-tr button').forEach((e,i)=>e.setAttribute('aria-pressed',!MUTE[i]))}
function sideTabs(){const x=TT();return `<div class="psd" role="tablist">${['lib','quiz','kp','comp'].map(k=>`<button type="button" role="tab" data-side="${k}" aria-selected="${SIDE===k}">${esc(x.tabs[k])}</button>`).join('')}</div>`}
function callBox(kind){const x=TT();let v='';try{v=localStorage.getItem('d11-callname')||''}catch(e){}
  return `<div class="pcall"><h4>${esc(x.c_h)}</h4><div><input type="text" maxlength="20" placeholder="${esc(x.c_name)}" value="${esc(v)}" aria-label="${esc(x.c_name)}"><button type="button" class="btn ghost" data-call="${kind}">${esc(x.c_btn)}</button></div><p class="pcall-msg" role="status"></p></div>`}
function sideHTML(){const x=TT(),y=T9();
  if(SIDE==='quiz'){const ask=Q.st==='ask'||Q.st==='show';
    return `<h3>${esc(x.q_title)}</h3><p class="plb-hint">${esc(x.q_desc)}</p>
<div class="pqs">${ask?Q.opts.map((id,k)=>`<button type="button" data-qa="${k}" class="${Q.st==='show'?(k===Q.ans?'ok':k===Q.pick?'bad':''):''}"><i>${k+1}</i>${esc(tName(id))}</button>`).join(''):''}</div>
<p class="pq-stat"><b>${esc(x.q_score)}: ${Q.score}</b> · ${esc(x.q_best)}: ${QBEST}${ask?' · '+esc(x.q_round)+' '+(Q.r+1)+'/'+QN:''}</p>
${ask?'':`<button type="button" class="btn primary" data-qs="1">${esc(Q.st==='end'?x.q_again:x.q_start)}</button>`}${Q.st==='end'?` <button type="button" class="btn ghost" data-qshare="1">${esc(x.q_share)}</button>`:''}<p class="pcall-msg" role="status"></p>`}
  if(SIDE==='kp')return `<h3>${esc(x.k_title)}</h3><p class="plb-hint">${esc(x.k_desc)}</p>
<table class="pkt">${x.k_keys.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</table>
<div class="plb-gen" role="group" aria-label="${esc(y.genre)}"><span>${esc(y.genre)}</span>${TGEN.map(g=>`<button type="button" data-kg="${g}" aria-pressed="${g===KP.g}">${esc(y.gens[g])}</button>`).join('')}</div>
<div class="pka"><button type="button" class="btn primary" data-kpa="play">${esc(playing&&PLY&&PLY.tu.id==='my'?x.k_stop:x.k_play)}</button><button type="button" class="btn ghost" data-kpa="undo">${esc(x.k_undo)}</button><button type="button" class="btn ghost" data-kpa="clear">${esc(x.k_clear)}</button></div>${callBox('kp')}`;
  if(SIDE==='comp')return compHTML();
  return libHTML()+callBox('lib')}
function sideR(){const el=box.querySelector('.plb');if(!el)return;const inp=el.querySelector('.pcall input'),iv=inp?inp.value:null,sc=el.querySelector('.plb-list'),st=sc?sc.scrollTop:0;
  el.innerHTML=sideTabs()+sideHTML();const i2=el.querySelector('.pcall input');if(i2&&iv!==null)i2.value=iv;const n=el.querySelector('.plb-list');if(n)n.scrollTop=st;
  const h=box.querySelector('.ph-help');if(h)h.open=SIDE==='comp'}
function sideSet(k){if(playing)stop();clearTimeout(qT);SIDE=k;PV=null;
  if(k==='lib')menu={t:'lib'};else if(k==='quiz'){Q.st='idle';menu={t:'quiz'}}else if(k==='kp'){PLY=null;menu={t:'kp'}}else{PLY=null;menu=null}
  phR();sideR()}
function keyLabels(){const x=TT(),t=PH();const mp=menu&&menu.t==='kp'?x.kl:menu&&menu.t==='quiz'?x.ql:menu&&menu.t==='lib'?x.ll:(!menu?t.keys:{});
  box.querySelectorAll('.ph-num button').forEach(b=>{const s=b.querySelector('small');if(s)s.textContent=mp[b.dataset.pk]||''})}

/* ---------- v7.42: more tunes, a card for every tune, search, favourites, play-in-a-row, links to a tune, mini player ---------- */
TUNES.push(
 {id:'danube',c:'cl',k:[2,'maj'],bar:12,bpm:160,n:{ru:'На прекрасном голубом Дунае',uk:'На прекрасному блакитному Дунаї',en:'The Blue Danube',fi:'An der schönen blauen Donau'},by:'J. Strauss II · 1867',
  m:'r:8 D5:4 D5:4 F#5:4 A5:4 A5:12 A6:4 A6:4 r:4 F#6:4 F#6:4 r:4 r:8 D5:4 D5:4 F#5:4 A5:4 A5:12 A6:4 A6:4 r:4 G6:4 G6:4 r:4 r:8 C#5:4 C#5:4 E5:4 B5:4 B5:12 B6:4 B6:4 r:4 G6:4 G6:4 r:4 r:8 C#5:4 C#5:4 E5:4 B5:4 B5:12 B6:4 B6:4 r:4 F#6:4 F#6:4 r:4 r:8 D5:4 D5:4 F#5:4 A5:4 D6:12 r:12'},
 {id:'funeral',c:'cl',k:[10,'min'],bar:16,bpm:60,n:{ru:'Похоронный марш',uk:'Похоронний марш',en:'Funeral March',fi:'Surumarssi'},by:'Chopin · 1839',
  m:'Bb4:4 Bb4:3 Bb4:1 Bb4:4 Db5:3 C5:1 C5:3 Bb4:1 Bb4:3 A4:1 Bb4:8 Bb4:4 Bb4:3 Bb4:1 Bb4:4 Db5:3 C5:1 C5:3 Bb4:1 Bb4:3 A4:1 Bb4:8'},
 {id:'bride',c:'ho',k:[10,'maj'],bar:16,bpm:76,n:{ru:'Свадебный хор',uk:'Весільний хор',en:'Bridal Chorus',fi:'Häämarssi (Lohengrin)'},by:'Wagner · 1850',
  m:'F4:4 Bb4:3 Bb4:1 Bb4:8 F4:4 C5:3 A4:1 Bb4:8 F4:4 Bb4:3 Eb5:1 Eb5:4 D5:3 C5:1 Bb4:4 A4:3 Bb4:1 C5:8'},
 {id:'xmas',c:'ho',k:[0,'maj'],bar:12,bpm:120,n:{ru:'Весёлого Рождества',uk:'Веселого Різдва',en:'We Wish You a Merry Christmas',fi:'We Wish You a Merry Christmas'},by:'английская · XVI в.',
  m:'r:8 G4:4 C5:4 C5:2 D5:2 C5:2 B4:2 A4:4 A4:4 A4:4 D5:4 D5:2 E5:2 D5:2 C5:2 B4:4 G4:4 G4:4 E5:4 E5:2 F5:2 E5:2 D5:2 C5:4 A4:4 G4:2 G4:2 A4:4 D5:4 B4:4 C5:12'},
 {id:'twinkle',c:'fo',k:[0,'maj'],bar:16,bpm:100,n:{ru:'Ах, скажу я вам, мама',uk:'Ах, скажу я вам, мамо',en:'Twinkle, Twinkle, Little Star',fi:'Tuiki tuiki tähtönen'},by:'французская · XVIII в.',
  m:'C5:4 C5:4 G5:4 G5:4 A5:4 A5:4 G5:8 F5:4 F5:4 E5:4 E5:4 D5:4 D5:4 C5:8 G5:4 G5:4 F5:4 F5:4 E5:4 E5:4 D5:8 G5:4 G5:4 F5:4 F5:4 E5:4 E5:4 D5:8 C5:4 C5:4 G5:4 G5:4 A5:4 A5:4 G5:8 F5:4 F5:4 E5:4 E5:4 D5:4 D5:4 C5:8'},
 {id:'jacques',c:'fo',k:[0,'maj'],bar:16,bpm:112,n:{ru:'Братец Жак',uk:'Братик Жак',en:'Frère Jacques',fi:'Jaakko kulta'},by:'французская · XVIII в.',
  m:'C5:4 D5:4 E5:4 C5:4 C5:4 D5:4 E5:4 C5:4 E5:4 F5:4 G5:8 E5:4 F5:4 G5:8 G5:2 A5:2 G5:2 F5:2 E5:4 C5:4 G5:2 A5:2 G5:2 F5:2 E5:4 C5:4 C5:4 G4:4 C5:8 C5:4 G4:4 C5:8'},
 {id:'grace',c:'fo',k:[7,'maj'],bar:12,bpm:84,n:{ru:'О, благодать',uk:'О, благодать',en:'Amazing Grace',fi:'Amazing Grace'},by:'американская · 1835',
  m:'r:8 D4:4 G4:8 B4:2 G4:2 B4:8 A4:4 G4:8 E4:4 D4:8 D4:4 G4:8 B4:2 G4:2 B4:8 A4:4 D5:12 r:8 B4:4 D5:8 B4:2 G4:2 B4:8 A4:4 G4:8 E4:4 D4:8 D4:4 G4:8 B4:2 G4:2 B4:8 A4:4 G4:12'},
 {id:'saints',c:'re',k:[0,'maj'],bar:16,bpm:132,n:{ru:'Когда святые маршируют',uk:'Коли святі марширують',en:'When the Saints Go Marching In',fi:'When the Saints Go Marching In'},by:'американская · XIX в.',
  m:'r:4 C5:4 E5:4 F5:4 G5:16 r:4 C5:4 E5:4 F5:4 G5:16 r:4 C5:4 E5:4 F5:4 G5:8 E5:8 C5:8 E5:8 D5:16 r:4 E5:4 E5:4 D5:4 C5:12 C5:4 E5:8 G5:8 G5:4 F5:12 E5:4 F5:4 G5:4 E5:4 C5:8 D5:8 C5:16'},
 {id:'susanna',c:'re',k:[0,'maj'],bar:16,bpm:120,n:{ru:'О, Сюзанна',uk:'О, Сюзанно',en:'Oh! Susanna',fi:'Oh! Susanna'},by:'Foster · 1848',
  m:'r:12 C5:2 D5:2 E5:4 G5:4 G5:6 A5:2 G5:4 E5:4 C5:6 D5:2 E5:4 E5:4 D5:4 C5:4 D5:12 C5:2 D5:2 E5:4 G5:4 G5:6 A5:2 G5:4 E5:4 C5:6 D5:2 E5:4 E5:4 D5:4 D5:4 C5:16'});
Object.assign(FOLKBY.uk,{'американская · 1835':'американська · 1835','американская · XIX в.':'американська · XIX ст.','французская · XVIII в.':'французька · XVIII ст.'});
Object.assign(FOLKBY.en,{'американская · 1835':'American · 1835','американская · XIX в.':'American · 19th c.','французская · XVIII в.':'French · 18th c.'});
Object.assign(FOLKBY.fi,{'американская · 1835':'amerikkalainen · 1835','американская · XIX в.':'amerikkalainen · 1800-l.','французская · XVIII в.':'ranskalainen · 1700-l.'});
const TD={ // one short card per tune: what the piece is
 elise:{ru:'Пьеса для фортепиано, которую нашли и издали только после смерти Бетховена, в 1867 году.',uk:'П’єса для фортепіано, яку знайшли й видали лише після смерті Бетховена, 1867 року.',en:'A piano piece found and published only after Beethoven’s death, in 1867.',fi:'Pianokappale, joka löydettiin ja julkaistiin vasta Beethovenin kuoleman jälkeen vuonna 1867.'},
 ode:{ru:'Финал Девятой симфонии на стихи Шиллера; сегодня эта мелодия — гимн Евросоюза.',uk:'Фінал Дев’ятої симфонії на вірші Шиллера; сьогодні ця мелодія — гімн Євросоюзу.',en:'The finale of the Ninth Symphony, to words by Schiller; today the tune is the anthem of the EU.',fi:'Yhdeksännen sinfonian finaali Schillerin runoon; nykyään melodia on EU:n hymni.'},
 serenade:{ru:'Серенада для струнных, написанная Моцартом в Вене в 1787 году.',uk:'Серенада для струнних, написана Моцартом у Відні 1787 року.',en:'A serenade for strings Mozart wrote in Vienna in 1787.',fi:'Jousiserenadi, jonka Mozart kirjoitti Wienissä vuonna 1787.'},
 turca:{ru:'Финал фортепианной сонаты № 11 — подражание турецкой военной музыке.',uk:'Фінал фортепіанної сонати № 11 — наслідування турецької військової музики.',en:'The finale of Piano Sonata No. 11, an imitation of Turkish military bands.',fi:'Pianosonaatti nro 11:n finaali, joka jäljittelee turkkilaista sotilasmusiikkia.'},
 sym40:{ru:'Одна из двух симфоний Моцарта в миноре; соль минор и та самая тема из трёх нот.',uk:'Одна з двох симфоній Моцарта в мінорі; соль мінор і та сама тема з трьох нот.',en:'One of Mozart’s only two minor-key symphonies: G minor and that three-note sigh.',fi:'Toinen Mozartin kahdesta mollisinfoniasta: g-molli ja tuttu kolmen nuotin huokaus.'},
 king:{ru:'Музыка к пьесе Ибсена «Пер Гюнт»: тролли гонятся за героем, а темп всё ускоряется.',uk:'Музика до п’єси Ібсена «Пер Гюнт»: тролі женуться за героєм, а темп дедалі швидшає.',en:'From the music for Ibsen’s Peer Gynt: trolls chase the hero as the tempo keeps rising.',fi:'Ibsenin Peer Gyntin näytelmämusiikkia: peikot jahtaavat sankaria ja tempo kiihtyy.'},
 badinerie:{ru:'Последняя часть Оркестровой сюиты № 2 с солирующей флейтой.',uk:'Остання частина Оркестрової сюїти № 2 із солюючою флейтою.',en:'The last movement of Orchestral Suite No. 2, with a solo flute.',fi:'Orkesterisarja nro 2:n viimeinen osa, jossa soolohuilu.'},
 morning:{ru:'Тоже из «Пер Гюнта». Это рассвет в пустыне, хотя её давно считают музыкой северного утра.',uk:'Теж із «Пер Гюнта». Це світанок у пустелі, хоча її давно вважають музикою північного ранку.',en:'Also from Peer Gynt. It depicts a desert sunrise, though most people hear a northern morning.',fi:'Myös Peer Gyntistä. Se kuvaa auringonnousua aavikolla, vaikka moni kuulee siinä pohjoisen aamun.'},
 swan:{ru:'Главная тема «Лебединого озера» — первого балета Чайковского.',uk:'Головна тема «Лебединого озера» — першого балету Чайковського.',en:'The main theme of Swan Lake, Tchaikovsky’s first ballet.',fi:'Joutsenlammen pääteema; se oli Tšaikovskin ensimmäinen baletti.'},
 canon:{ru:'Канон для трёх скрипок и баса; по его гармонии написаны сотни поп-песен.',uk:'Канон для трьох скрипок і басу; на його гармонії написано сотні поп-пісень.',en:'A canon for three violins and bass; hundreds of pop songs reuse its chords.',fi:'Kaanon kolmelle viululle ja bassolle; sadat poplaulut lainaavat sen sointuja.'},
 minuet:{ru:'Из нотной тетради Анны Магдалены Бах. Долго считался пьесой Баха, но автор — Кристиан Петцольд.',uk:'Із нотного зошита Анни Магдалени Бах. Довго вважався п’єсою Баха, але автор — Крістіан Петцольд.',en:'From Anna Magdalena Bach’s notebook. Long credited to Bach, it was written by Christian Petzold.',fi:'Anna Magdalena Bachin nuottivihosta. Sitä pidettiin pitkään Bachin teoksena, mutta sen sävelsi Christian Petzold.'},
 toccata:{ru:'Органная токката, которую приписывают Баху, — одна из самых узнаваемых органных пьес.',uk:'Органна токата, яку приписують Баху, — одна з найвпізнаваніших органних п’єс.',en:'An organ toccata attributed to Bach and one of the best-known organ pieces of all.',fi:'Bachin nimiin luettu urkutokaatta, yksi tunnetuimmista urkukappaleista.'},
 bee:{ru:'Интерлюдия из оперы «Сказка о царе Салтане»: князь Гвидон превращается в шмеля.',uk:'Інтерлюдія з опери «Казка про царя Салтана»: князь Гвідон перетворюється на джмеля.',en:'An interlude from the opera The Tale of Tsar Saltan, where Prince Gvidon turns into a bumblebee.',fi:'Välisoitto oopperasta Tarina tsaari Saltanista: ruhtinas Gvidon muuttuu kimalaiseksi.'},
 spring:{ru:'Первый из четырёх скрипичных концертов «Времена года».',uk:'Перший із чотирьох скрипкових концертів «Пори року».',en:'The first of the four violin concertos of The Four Seasons.',fi:'Ensimmäinen Neljän vuodenajan neljästä viulukonsertosta.'},
 fifth:{ru:'Четыре ноты, с которых начинается Пятая симфония, — пожалуй, самый известный мотив классики.',uk:'Чотири ноти, з яких починається П’ята симфонія, — мабуть, найвідоміший мотив класики.',en:'The four notes that open the Fifth may be the most famous motif in classical music.',fi:'Viidennen sinfonian avaavat neljä nuottia ovat ehkä klassisen musiikin tunnetuin aihe.'},
 danube:{ru:'Самый знаменитый венский вальс; впервые прозвучал в 1867 году.',uk:'Найвідоміший віденський вальс; уперше прозвучав 1867 року.',en:'The most famous Viennese waltz, first heard in 1867.',fi:'Kuuluisin wieniläisvalssi; se esitettiin ensimmäisen kerran vuonna 1867.'},
 funeral:{ru:'Третья часть фортепианной сонаты № 2 Шопена.',uk:'Третя частина фортепіанної сонати № 2 Шопена.',en:'The third movement of Chopin’s Piano Sonata No. 2.',fi:'Chopinin pianosonaatti nro 2:n kolmas osa.'},
 korob:{ru:'Песня на стихи Некрасова; весь мир знает её по игре «Тетрис».',uk:'Пісня на вірші Некрасова; увесь світ знає її з гри «Тетріс».',en:'A song to a poem by Nekrasov; the whole world knows it from Tetris.',fi:'Laulu Nekrasovin runoon; koko maailma tuntee sen Tetriksestä.'},
 shchedryk:{ru:'Украинская щедровка в обработке Николая Леонтовича; в мире её знают как Carol of the Bells.',uk:'Українська щедрівка в обробці Миколи Леонтовича; у світі її знають як Carol of the Bells.',en:'A Ukrainian New Year song arranged by Mykola Leontovych, known worldwide as Carol of the Bells.',fi:'Ukrainalainen uudenvuodenlaulu Mykola Leontovytšin sovituksena; maailmalla se tunnetaan nimellä Carol of the Bells.'},
 green:{ru:'Английская баллада XVI века; её приписывали Генриху VIII, но это легенда.',uk:'Англійська балада XVI століття; її приписували Генріху VIII, але це легенда.',en:'An English ballad of the 16th century; the story that Henry VIII wrote it is a legend.',fi:'Englantilainen balladi 1500-luvulta; tarina Henrik VIII:sta sen tekijänä on legenda.'},
 twinkle:{ru:'Французская песенка XVIII века; Моцарт написал на неё двенадцать вариаций.',uk:'Французька пісенька XVIII століття; Моцарт написав на неї дванадцять варіацій.',en:'An 18th-century French song; Mozart wrote twelve variations on it.',fi:'Ranskalainen laulu 1700-luvulta; Mozart kirjoitti siitä kaksitoista muunnelmaa.'},
 jacques:{ru:'Французский канон: его поют по кругу, вступая друг за другом.',uk:'Французький канон: його співають по колу, вступаючи один за одним.',en:'A French round, sung by voices entering one after another.',fi:'Ranskalainen kaanon, jota lauletaan äänten liittyessä mukaan vuorotellen.'},
 grace:{ru:'Английский гимн на стихи Джона Ньютона; мелодия «New Britain» известна с 1830-х.',uk:'Англійський гімн на вірші Джона Ньютона; мелодія «New Britain» відома з 1830-х.',en:'A hymn to words by John Newton, sung to the tune New Britain since the 1830s.',fi:'John Newtonin sanoittama virsi, jota on laulettu New Britain -sävelmään 1830-luvulta asti.'},
 bells:{ru:'Песня Джеймса Лорда Пирпонта, впервые изданная в 1857 году как «One Horse Open Sleigh».',uk:'Пісня Джеймса Лорда Пірпонта, уперше видана 1857 року як «One Horse Open Sleigh».',en:'A song by James Lord Pierpont, first published in 1857 as One Horse Open Sleigh.',fi:'James Lord Pierpontin laulu, joka julkaistiin vuonna 1857 nimellä One Horse Open Sleigh.'},
 bday:{ru:'Мелодия сестёр Хилл из детской песни «Good Morning to All» 1893 года.',uk:'Мелодія сестер Гілл із дитячої пісні «Good Morning to All» 1893 року.',en:'The Hill sisters’ tune from the 1893 children’s song Good Morning to All.',fi:'Hillin sisarten sävelmä vuoden 1893 lastenlaulusta Good Morning to All.'},
 lullaby:{ru:'«Колыбельная» Брамса, опус 49 № 4.',uk:'«Колискова» Брамса, опус 49 № 4.',en:'Brahms’s Lullaby, Op. 49 No. 4.',fi:'Brahmsin Kehtolaulu, op. 49 nro 4.'},
 auld:{ru:'Шотландская песня на стихи Роберта Бёрнса; её поют в новогоднюю ночь.',uk:'Шотландська пісня на вірші Роберта Бернса; її співають у новорічну ніч.',en:'A Scottish song to words by Robert Burns, sung on New Year’s Eve.',fi:'Skotlantilainen laulu Robert Burnsin sanoihin; sitä lauletaan uudenvuodenaattona.'},
 bride:{ru:'Свадебный хор из оперы Вагнера «Лоэнгрин».',uk:'Весільний хор з опери Вагнера «Лоенгрін».',en:'The Bridal Chorus from Wagner’s opera Lohengrin.',fi:'Häämarssi Wagnerin oopperasta Lohengrin.'},
 xmas:{ru:'Английская народная рождественская песня.',uk:'Англійська народна різдвяна пісня.',en:'A traditional English Christmas song.',fi:'Perinteinen englantilainen joululaulu.'},
 enter:{ru:'Рэгтайм Скотта Джоплина; второй раз прославился в фильме «Афера» 1973 года.',uk:'Регтайм Скотта Джоплина; удруге прославився у фільмі «Афера» 1973 року.',en:'Scott Joplin’s rag, famous a second time through the 1973 film The Sting.',fi:'Scott Joplinin ragtime, joka tuli toistamiseen kuuluisaksi vuoden 1973 elokuvassa Puhallus.'},
 cuca:{ru:'Мексиканская народная песня, особенно популярная со времён революции 1910-х.',uk:'Мексиканська народна пісня, особливо популярна з часів революції 1910-х.',en:'A Mexican folk song, especially popular since the revolution of the 1910s.',fi:'Meksikolainen kansanlaulu, erityisen suosittu 1910-luvun vallankumouksesta lähtien.'},
 saints:{ru:'Американский спиричуэл, ставший гимном новоорлеанского джаза.',uk:'Американський спірічуел, що став гімном новоорлеанського джазу.',en:'An American spiritual that became the anthem of New Orleans jazz.',fi:'Amerikkalainen spirituaali, josta tuli New Orleansin jazzin tunnuslaulu.'},
 susanna:{ru:'Песня Стивена Фостера 1848 года.',uk:'Пісня Стівена Фостера 1848 року.',en:'A song by Stephen Foster from 1848.',fi:'Stephen Fosterin laulu vuodelta 1848.'}};
const TX12={ru:{search:'Найти мелодию',fav:'Избранное',favAdd:'В избранное',favDel:'В избранном',link:'Ссылка на мелодию',linkOk:'Ссылка скопирована',auto:'Подряд',autoT:'Играть мелодии подряд',ring:'На звонок',none:'Ничего не нашлось',all:'Все',count:'мелодий',tapPlay:'Нажми ▶, чтобы послушать',next:'Следующая',playing:'Играет'},
 uk:{search:'Знайти мелодію',fav:'Обране',favAdd:'До обраного',favDel:'В обраному',link:'Посилання на мелодію',linkOk:'Посилання скопійовано',auto:'Поспіль',autoT:'Грати мелодії поспіль',ring:'На дзвінок',none:'Нічого не знайшлося',all:'Усі',count:'мелодій',tapPlay:'Натисни ▶, щоб послухати',next:'Наступна',playing:'Грає'},
 en:{search:'Find a tune',fav:'Favourites',favAdd:'Add to favourites',favDel:'In favourites',link:'Link to this tune',linkOk:'Link copied',auto:'In a row',autoT:'Play tunes in a row',ring:'Set as ringtone',none:'Nothing found',all:'All',count:'tunes',tapPlay:'Press ▶ to listen',next:'Next',playing:'Playing'},
 fi:{search:'Etsi melodiaa',fav:'Suosikit',favAdd:'Lisää suosikkeihin',favDel:'Suosikeissa',link:'Linkki melodiaan',linkOk:'Linkki kopioitu',auto:'Peräkkäin',autoT:'Soita melodiat peräkkäin',ring:'Soittoääneksi',none:'Mitään ei löytynyt',all:'Kaikki',count:'melodiaa',tapPlay:'Paina ▶ kuunnellaksesi',next:'Seuraava',playing:'Soi'}};
const T12=()=>TX12[L()];
const plur=(n,w)=>{const l=L();if(l!=='ru'&&l!=='uk')return w;const f=l==='ru'?['мелодия','мелодии','мелодий']:['мелодія','мелодії','мелодій'],a=n%10,b=n%100;return a===1&&b!==11?f[0]:a>=2&&a<=4&&(b<12||b>14)?f[1]:f[2]};
let FAV=[],QS='';try{const v=JSON.parse(localStorage.getItem('d11-fav')||'[]');if(Array.isArray(v))FAV=v.filter(id=>TUNES.some(t=>t.id===id))}catch(e){}
const favSave=()=>{try{localStorage.setItem('d11-fav',JSON.stringify(FAV))}catch(e){}};
try{const a=JSON.parse(localStorage.getItem('d11-lib-auto')||'false');LIB.auto=!!a}catch(e){LIB.auto=false}
const norm=s=>s.toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
function libList(){if(QS){const q=norm(QS);return TUNES.map((t,i)=>i).filter(i=>{const t=TUNES[i];const k=t.by.split(' · ')[0];return Object.values(t.n).concat([t.by,byOf(t)],Object.values(COMP).map(c=>c[k]||'')).some(s=>s&&norm(s).includes(q))})}
  if(libCat==='fav')return FAV.map(id=>TUNES.findIndex(t=>t.id===id)).filter(i=>i>=0);if(libCat==='all')return TUNES.map((t,i)=>i);return TUNES.map((t,i)=>i).filter(i=>TUNES[i].c===libCat)}
function libNext(){const l=libList(),k=l.indexOf(LIB.i);return l.length?l[(k+1)%l.length]:(LIB.i+1)%TUNES.length}
function tuneLink(){const tu=TUNES[LIB.i];return location.origin+location.pathname+'#t='+tu.id+'~'+LIB.g}
function cardHTML(){const tu=TUNES[LIB.i],l=L(),x=T12(),y=T9(),fav=FAV.includes(tu.id),on=playing&&PLY&&PLY.tu===tu;
  return `<div class="pcard"><div class="pcard-h"><div><b>${esc(tu.n[l]||tu.n.ru)}</b><small>${esc(byOf(tu))} · ${esc(y.cats[tu.c])}</small></div>
<button type="button" class="pcard-play" data-cp="play" aria-label="${esc(on?PH().stop:PH().play)}">${on?'■':'▶'}</button></div>
<p>${esc((TD[tu.id]||{})[l]||(TD[tu.id]||{}).ru||'')}</p>
<div class="pcard-a"><button type="button" data-cp="fav" aria-pressed="${fav}">${fav?'♥':'♡'} ${esc(fav?x.favDel:x.favAdd)}</button><button type="button" data-cp="next">⏭ ${esc(x.next)}</button><button type="button" data-cp="ring">☎ ${esc(x.ring)}</button><button type="button" data-cp="link">🔗 ${esc(x.link)}</button>
<button type="button" data-cp="auto" aria-pressed="${!!LIB.auto}" title="${esc(x.autoT)}">⟳ ${esc(x.auto)}</button></div><p class="pcard-msg" role="status"></p></div>`}
function libHTML(){const x=T9(),z=T12(),l=L(),lst=libList(),cats=['all'].concat(TCAT,FAV.length?['fav']:[]);
  return `<h3>${esc(x.pick)} <small class="plb-n">${TUNES.length} ${esc(plur(TUNES.length,z.count))}</small></h3>
<div class="plb-search"><input type="search" value="${esc(QS)}" placeholder="${esc(z.search)}" aria-label="${esc(z.search)}"></div>
<div class="plb-cats" role="tablist">${cats.map(c=>`<button type="button" role="tab" data-cat="${c}" aria-selected="${!QS&&c===libCat}">${esc(c==='all'?z.all:c==='fav'?'♥ '+z.fav:x.cats[c])}</button>`).join('')}</div>
<div class="plb-list">${lst.length?lst.map(i=>{const tu=TUNES[i];return `<button type="button" data-tune="${i}" aria-pressed="${i===LIB.i}"><b>${FAV.includes(tu.id)?'♥ ':''}${esc(tu.n[l]||tu.n.ru)}</b><small>${esc(byOf(tu))}</small></button>`}).join(''):`<p class="plb-none">${esc(z.none)}</p>`}</div>
<div class="plb-gen" role="group" aria-label="${esc(x.genre)}"><span>${esc(x.genre)}</span>${TGEN.map(g=>`<button type="button" data-gen="${g}" aria-pressed="${g===LIB.g}">${esc(x.gens[g])}</button>`).join('')}</div>
${cardHTML()}<p class="plb-note">${esc(x.libNote)}</p>`}
let lastPh=-1;
function autoNext(){if(!LIB.auto||!PLY||!menu||menu.t!=='lib'||PLY.tu.id==='my')return;libSet(libNext(),undefined,true)}
/* mini player: shows when the phone is off screen while a tune plays */
let MINI=null,phVisible=true;
function miniInit(){if(MINI)return;MINI=document.createElement('div');MINI.className='pmini';MINI.hidden=true;document.body.appendChild(MINI);
  MINI.addEventListener('click',e=>{const b=e.target.closest('[data-mp]');if(!b)return;const a=b.dataset.mp;
    if(a==='stop'){if(playing)stop();else libPlay(true)}else if(a==='next'){menu={t:'lib'};libSet(libNext(),undefined,true)}else if(a==='go'){const f=box.querySelector('.ph');if(f)f.scrollIntoView({behavior:'smooth',block:'center'})}miniR()});
  const ph=box.querySelector('.ph');if(ph&&'IntersectionObserver' in window){new IntersectionObserver(es=>{phVisible=es[0].isIntersecting;miniR()},{threshold:.15}).observe(ph)}}
function miniR(){if(!MINI)return;const show=!phVisible&&playing&&PLY&&MODE==='phone';MINI.hidden=!show;if(!show)return;const tu=PLY.tu,x=T12();
  MINI.innerHTML=`<button type="button" data-mp="go" class="pmini-t"><i>♪</i><span><b>${esc(tu.n[L()]||tu.n.ru)}</b><small>${esc(x.playing)} · ${esc(T9().gens[PLY.g]||'')}</small></span></button><button type="button" data-mp="stop" aria-label="${esc(PH().stop)}">■</button>${tu.id==='my'?'':`<button type="button" data-mp="next" aria-label="${esc(x.next)}">⏭</button>`}`}
{const h=location.hash.match(/^#t=([a-z0-9]+)~([a-z]+)$/);if(h){const i=TUNES.findIndex(t=>t.id===h[1]);if(i>=0){LIB.i=i;if(TGEN.includes(h[2]))LIB.g=h[2];MODE='phone';draw.tl=1}}}

const PKM={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'ok',Escape:'sr',Backspace:'0',Delete:'0',' ':'sl'};
box.addEventListener('keydown',e=>{if(MODE!=='phone'||!e.target.closest||!e.target.closest('.ph')||e.ctrlKey||e.metaKey||e.altKey)return;
  let k=PKM[e.key]||(/^[0-9*#]$/.test(e.key)?e.key:'');if(!k)return;
  if(e.target.tagName==='BUTTON'&&(e.key==='Enter'||e.key===' '))return; // the focused key handles itself
  if(k==='0'&&menu&&e.key==='Backspace')k='sr';
  e.preventDefault();e.stopPropagation();if(initAudio()&&ac.state!=='running')ac.resume();kclick();phKey(k)});
/* hooks for the beat studio (studio.js) */
window.D11A={init:initAudio,ctx:()=>ac,out:()=>duck,dry:()=>master,an:()=>an,
 duck:(t,d)=>{if(duck){const g=duck.gain;g.setTargetAtTime(d,t,.004);g.setTargetAtTime(1,t+.045,.085)}},
 drum:(r,t,v,depth)=>drum(r,t,v,0,depth),
 lead:(k,m,t,d,v,dst)=>{const o=DEST;DEST=dst||o;try{lead(k,m,t,d,v)}finally{DEST=o}},
 bass:(k,m,t,d,v,dst)=>{const o=DEST;DEST=dst||o;try{bass(k,m,t,d,v)}finally{DEST=o}},
 fx:k=>setFx(k),getVol:()=>S.vol,setVol:v=>{S.vol=Math.max(0,Math.min(1,v));if(outG)outG.gain.setTargetAtTime(S.vol,ac.currentTime,.02);save()},
 stopPhone:()=>{if(playing)stop()}};
draw();
addEventListener('d11lang',()=>setTimeout(draw,0));
})();
