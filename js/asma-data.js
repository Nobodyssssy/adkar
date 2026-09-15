'use strict';

/* ═══════════════════════════════════════════════════════════
   99 Names of Allah — Asma al-Husna
   Tirmidhi's list (Sunan al-Tirmidhi 3507)
   Each name: Arabic + transliteration + English meaning +
   Arabic tafsir + English tafsir.
   videoUrl: optional, null for now.
   ═══════════════════════════════════════════════════════════ */

const ASMA_NAMES = [

  /* ─── 1 ─── */
  {
    id: 1,
    ar: 'الرَّحْمَٰن',
    transliteration: 'Ar-Rahman',
    meaningEn: 'The Most Compassionate',
    tafsirAr: 'الرحمن: اسم جامع لصفة الرحمة التي وسعت كل شيء، وهي رحمة عامة تشمل المؤمن والكافر في الدنيا.',
    tafsirEn: 'Ar-Rahman: A name encompassing the vast mercy of Allah that embraces all creation in this world — believers and non-believers alike.',
    videoUrl: null
  },

  /* ─── 2 ─── */
  {
    id: 2,
    ar: 'الرَّحِيم',
    transliteration: 'Ar-Raheem',
    meaningEn: 'The Most Merciful',
    tafsirAr: 'الرحيم: رحمة خاصة بالمؤمنين في الدنيا والآخرة، فهو يوفقهم ويغفر لهم ويرحمهم.',
    tafsirEn: 'Ar-Raheem: A special mercy reserved for the believers in this life and the Hereafter — guiding, forgiving, and nurturing them.',
    videoUrl: null
  },

  /* ─── 3 ─── */
  {
    id: 3,
    ar: 'الْمَلِك',
    transliteration: 'Al-Malik',
    meaningEn: 'The King, The Sovereign',
    tafsirAr: 'الملك: المالك المتصرف في ملكه كيف يشاء، لا يُنازع في ملكه، وكل شيء تحت قهره وتصرفه.',
    tafsirEn: 'Al-Malik: The absolute sovereign who disposes of His kingdom as He wills — none shares His dominion, and all things are under His command.',
    videoUrl: null
  },

  /* ─── 4 ─── */
  {
    id: 4,
    ar: 'الْقُدُّوس',
    transliteration: 'Al-Quddus',
    meaningEn: 'The Most Holy',
    tafsirAr: 'القدوس: المنزّه عن كل عيب ونقص، الموصوف بصفات الكمال والجلال.',
    tafsirEn: 'Al-Quddus: The utterly pure, free from every defect or imperfection, described with the attributes of absolute perfection and majesty.',
    videoUrl: null
  },

  /* ─── 5 ─── */
  {
    id: 5,
    ar: 'السَّلَام',
    transliteration: 'As-Salam',
    meaningEn: 'The Source of Peace',
    tafsirAr: 'السلام: السالم من كل عيب، ومنه السلام لخلقه، أي الناجي بسلامته من كل شر.',
    tafsirEn: 'As-Salam: The One free from every defect, from whom all peace emanates, and in whom every safety is found.',
    videoUrl: null
  },

  /* ─── 6 ─── */
  {
    id: 6,
    ar: 'الْمُؤْمِن',
    transliteration: 'Al-Mu\'min',
    meaningEn: 'The Granter of Security',
    tafsirAr: 'المؤمن: الذي يؤمّن خلقه من الظلم، ويصدق وعده، وهو مصدر الأمن والاطمئنان.',
    tafsirEn: 'Al-Mu\'min: The One who grants security to His creation, fulfils His promises, and is the source of all safety and tranquility.',
    videoUrl: null
  },

  /* ─── 7 ─── */
  {
    id: 7,
    ar: 'الْمُهَيْمِن',
    transliteration: 'Al-Muhaymin',
    meaningEn: 'The Guardian, The Protector',
    tafsirAr: 'المهيمن: الرقيب على كل شيء، الحفيظ لكل شيء، لا يعزب عن علمه شيء.',
    tafsirEn: 'Al-Muhaymin: The Watcher over all things, the Preserver of everything — nothing escapes His knowledge.',
    videoUrl: null
  },

  /* ─── 8 ─── */
  {
    id: 8,
    ar: 'الْعَزِيز',
    transliteration: 'Al-Aziz',
    meaningEn: 'The Almighty',
    tafsirAr: 'العزيز: القوي الذي لا يُغلب، الغالب على أمره، لا يعجزه شيء في الأرض ولا في السماء.',
    tafsirEn: 'Al-Aziz: The invincible Almighty who cannot be overcome — nothing in the heavens or earth can thwart His will.',
    videoUrl: null
  },

  /* ─── 9 ─── */
  {
    id: 9,
    ar: 'الْجَبَّار',
    transliteration: 'Al-Jabbar',
    meaningEn: 'The Compeller, The Restorer',
    tafsirAr: 'الجبار: الذي يجبر الكسير، ويغني الفقير، ويصلح كل شيء بجبروته وقهره.',
    tafsirEn: 'Al-Jabbar: The One who mends every broken thing, enriches the poor, and restores all affairs through His might.',
    videoUrl: null
  },

  /* ─── 10 ─── */
  {
    id: 10,
    ar: 'الْمُتَكَبِّر',
    transliteration: 'Al-Mutakabbir',
    meaningEn: 'The Supreme, The Majestic',
    tafsirAr: 'المتكبر: المتعالي عن صفات الخلق، ذو الكبرياء والعظمة، لا يجوز لأحد أن يتكبر عليه.',
    tafsirEn: 'Al-Mutakabbir: Exalted above all creation, possessor of true greatness and majesty — none may claim supremacy over Him.',
    videoUrl: null
  },

  /* ─── 11 ─── */
  {
    id: 11,
    ar: 'الْخَالِق',
    transliteration: 'Al-Khaliq',
    meaningEn: 'The Creator',
    tafsirAr: 'الخالق: الذي خلق كل شيء وخلقه على غير مثال سابق، المبدع لكل ما سواه.',
    tafsirEn: 'Al-Khaliq: The One who creates everything from nothing, the originator of all that exists.',
    videoUrl: null
  },

  /* ─── 12 ─── */
  {
    id: 12,
    ar: 'الْبَارِئ',
    transliteration: 'Al-Bari\'',
    meaningEn: 'The Originator',
    tafsirAr: 'البارئ: الذي برأ الخلق أي خلقهم بريئًا من التفاوت والاختلاف على غير مثال.',
    tafsirEn: 'Al-Bari\': The Originator who brings creation into being without any prior model, flaw, or discrepancy.',
    videoUrl: null
  },

  /* ─── 13 ─── */
  {
    id: 13,
    ar: 'الْمُصَوِّر',
    transliteration: 'Al-Musawwir',
    meaningEn: 'The Fashioner of Forms',
    tafsirAr: 'المصور: الذي صوّر كل مخلوق على صورة خاصة، لا يشبهه فيها غيره.',
    tafsirEn: 'Al-Musawwir: The One who shapes each creature in its own unique form, giving every creation its distinct appearance.',
    videoUrl: null
  },

  /* ─── 14 ─── */
  {
    id: 14,
    ar: 'الْغَفَّار',
    transliteration: 'Al-Ghaffar',
    meaningEn: 'The Ever-Forgiving',
    tafsirAr: 'الغفار: الذي يغفر الذنوب، ويعفو عن العيوب، ويستر الخطايا مهما تكررت.',
    tafsirEn: 'Al-Ghaffar: The One who repeatedly forgives sins, pardons faults, and covers errors no matter how often they occur.',
    videoUrl: null
  },

  /* ─── 15 ─── */
  {
    id: 15,
    ar: 'الْقَهَّار',
    transliteration: 'Al-Qahhar',
    meaningEn: 'The Subduer',
    tafsirAr: 'القهار: الذي قهر كل شيء، وخضع له كل شيء، القادر على كل شيء بلا معين.',
    tafsirEn: 'Al-Qahhar: The One who subjugates all things — everything submits to Him, and He is able over all things.',
    videoUrl: null
  },

  /* ─── 16 ─── */
  {
    id: 16,
    ar: 'الْوَهَّاب',
    transliteration: 'Al-Wahhab',
    meaningEn: 'The Bestower of Gifts',
    tafsirAr: 'الوهاب: الذي يهب العطايا بلا مقابل، ويعطي بلا سؤال، لا يمنعه بخل ولا ينقصه عطاء.',
    tafsirEn: 'Al-Wahhab: The One who grants gifts freely without return, gives without being asked, and is never diminished by generosity.',
    videoUrl: null
  },

  /* ─── 17 ─── */
  {
    id: 17,
    ar: 'الرَّزَّاق',
    transliteration: 'Ar-Razzaq',
    meaningEn: 'The Provider',
    tafsirAr: 'الرزاق: الذي يرزق كل مخلوق، ويوصل إليه رزقه، لا ينساه ولا ينساه رزقه أبدًا.',
    tafsirEn: 'Ar-Razzaq: The One who provides for every creature, delivering their sustenance — none is ever forgotten.',
    videoUrl: null
  },

  /* ─── 18 ─── */
  {
    id: 18,
    ar: 'الْفَتَّاح',
    transliteration: 'Al-Fattah',
    meaningEn: 'The Opener, The Reliever',
    tafsirAr: 'الفتاح: الذي يفتح أبواب الرحمة والرزق، ويفتح المغلقة من الأمور بعلمه وحكمته.',
    tafsirEn: 'Al-Fattah: The One who opens the doors of mercy and provision, and unlocks closed matters through His wisdom.',
    videoUrl: null
  },

  /* ─── 19 ─── */
  {
    id: 19,
    ar: 'الْعَلِيم',
    transliteration: 'Al-Alim',
    meaningEn: 'The All-Knowing',
    tafsirAr: 'العليم: المحيط علمه بكل شيء، يعلم ما كان وما سيكون وما لم يكن لو كان كيف يكون.',
    tafsirEn: 'Al-Alim: The One whose knowledge encompasses all things — what was, what will be, and what could have been.',
    videoUrl: null
  },

  /* ─── 20 ─── */
  {
    id: 20,
    ar: 'الْقَابِض',
    transliteration: 'Al-Qabid',
    meaningEn: 'The Withholder',
    tafsirAr: 'القابض: الذي يقبض الرزق والأرواح بحكمته، ويقبض القلوب بسطوته.',
    tafsirEn: 'Al-Qabid: The One who withholds provision and souls by His wisdom, and constricts hearts by His authority.',
    videoUrl: null
  },

  /* ─── 21 ─── */
  {
    id: 21,
    ar: 'الْبَاسِط',
    transliteration: 'Al-Basit',
    meaningEn: 'The Extender',
    tafsirAr: 'الباسط: الذي يبسط الرزق لمن يشاء، ويوسع القلوب بالطمأنينة والرضا.',
    tafsirEn: 'Al-Basit: The One who extends provision to whom He wills, and expands hearts with tranquility and contentment.',
    videoUrl: null
  },

  /* ─── 22 ─── */
  {
    id: 22,
    ar: 'الْخَافِض',
    transliteration: 'Al-Khafid',
    meaningEn: 'The Abaser',
    tafsirAr: 'الخافض: الذي يخفض المتكبرين، ويذل الجبابرة، ويعزّ من يشاء ويذل من يشاء.',
    tafsirEn: 'Al-Khafid: The One who humbles the arrogant and abases tyrants, honouring whom He wills and humbling whom He wills.',
    videoUrl: null
  },

  /* ─── 23 ─── */
  {
    id: 23,
    ar: 'الرَّافِع',
    transliteration: 'Ar-Rafi\'',
    meaningEn: 'The Exalter',
    tafsirAr: 'الرافع: الذي يرفع أولياءه بالطاعة، ويرفع درجات أهل العلم والإيمان.',
    tafsirEn: 'Ar-Rafi\': The One who raises His allies through obedience, and elevates the ranks of the people of knowledge and faith.',
    videoUrl: null
  },

  /* ─── 24 ─── */
  {
    id: 24,
    ar: 'الْمُعِزّ',
    transliteration: 'Al-Mu\'izz',
    meaningEn: 'The Bestower of Honour',
    tafsirAr: 'المعز: الذي يعزّ من يشاء من عباده، فلا يُذل، ولا يُقهر، عزه لا يُنازع.',
    tafsirEn: 'Al-Mu\'izz: The One who honours whom He wills of His servants — none can humiliate them, and His honour is beyond challenge.',
    videoUrl: null
  },

  /* ─── 25 ─── */
  {
    id: 25,
    ar: 'الْمُذِلّ',
    transliteration: 'Al-Mudhill',
    meaningEn: 'The Humiliator',
    tafsirAr: 'المذل: الذي يذل من يشاء من الجبابرة والطواغيت، بعدله وحكمته.',
    tafsirEn: 'Al-Mudhill: The One who humbles whom He wills of the arrogant and tyrants, by His justice and wisdom.',
    videoUrl: null
  },

  /* ─── 26 ─── */
  {
    id: 26,
    ar: 'السَّمِيع',
    transliteration: 'As-Sami\'',
    meaningEn: 'The All-Hearing',
    tafsirAr: 'السميع: الذي يسمع كل شيء، لا تخفى عليه دعوة داعٍ، ولا صوت نجوى.',
    tafsirEn: 'As-Sami\': The One who hears all things — no call, no secret whisper escapes His hearing.',
    videoUrl: null
  },

  /* ─── 27 ─── */
  {
    id: 27,
    ar: 'الْبَصِير',
    transliteration: 'Al-Basir',
    meaningEn: 'The All-Seeing',
    tafsirAr: 'البصير: الذي يرى كل شيء، ولو دقّ وخفي، فيرى أعمال العباد وأحوالهم جميعًا.',
    tafsirEn: 'Al-Basir: The One who sees all things, even the smallest and most hidden — He sees all deeds and states.',
    videoUrl: null
  },

  /* ─── 28 ─── */
  {
    id: 28,
    ar: 'الْحَكَم',
    transliteration: 'Al-Hakam',
    meaningEn: 'The Impartial Judge',
    tafsirAr: 'الحكم: الذي يحكم بالحق، ولا رادّ لحكمه، ولا معقّب لقضائه.',
    tafsirEn: 'Al-Hakam: The One who judges with truth — His ruling cannot be overturned, and His decree cannot be appealed.',
    videoUrl: null
  },

  /* ─── 29 ─── */
  {
    id: 29,
    ar: 'الْعَدْل',
    transliteration: 'Al-\'Adl',
    meaningEn: 'The Utterly Just',
    tafsirAr: 'العدل: الذي لا يظلم أحدًا، حكمه كله عدل، ولا يقبل إلا العدل من عباده.',
    tafsirEn: 'Al-\'Adl: The One who wrongs none — all His judgments are just, and He accepts only justice from His servants.',
    videoUrl: null
  },

  /* ─── 30 ─── */
  {
    id: 30,
    ar: 'اللَّطِيف',
    transliteration: 'Al-Latif',
    meaningEn: 'The Subtle, The Most Gentle',
    tafsirAr: 'اللطيف: الذي يعلم دقائق الأمور، ويلطف بعباده بطرق لا يعلمها العبد، ويوصله إلى الخير.',
    tafsirEn: 'Al-Latif: The One aware of the subtlest matters, who shows gentleness to His servants in ways they do not perceive, guiding them to good.',
    videoUrl: null
  },

  /* ─── 31 ─── */
  {
    id: 31,
    ar: 'الْخَبِير',
    transliteration: 'Al-Khabir',
    meaningEn: 'The All-Aware',
    tafsirAr: 'الخبير: العالم بحقائق الأمور وبواطنها، لا يعزب عنه خبر في الأرض ولا في السماء.',
    tafsirEn: 'Al-Khabir: The One who knows the inner realities of all things — no news in heaven or earth escapes Him.',
    videoUrl: null
  },

  /* ─── 32 ─── */
  {
    id: 32,
    ar: 'الْحَلِيم',
    transliteration: 'Al-Halim',
    meaningEn: 'The Most Forbearing',
    tafsirAr: 'الحليم: الذي لا يعاجل بالعقوبة، يحلم على عباده مع معاصيهم، ويعفو مع قدرته.',
    tafsirEn: 'Al-Halim: The One who does not hasten punishment, forbearing with His servants despite their sins, pardoning while fully able to punish.',
    videoUrl: null
  },

  /* ─── 33 ─── */
  {
    id: 33,
    ar: 'الْعَظِيم',
    transliteration: 'Al-\'Adhim',
    meaningEn: 'The Magnificent',
    tafsirAr: 'العظيم: ذو العظمة في ذاته وصفاته، لا يعجز عن شيء، ولا يعجزه شيء.',
    tafsirEn: 'Al-\'Adhim: The possessor of absolute greatness in His essence and attributes — nothing overpowers Him.',
    videoUrl: null
  },

  /* ─── 34 ─── */
  {
    id: 34,
    ar: 'الْغَفُور',
    transliteration: 'Al-Ghafur',
    meaningEn: 'The Ever-Forgiving',
    tafsirAr: 'الغفور: الذي يغفر الذنوب، ويستر العيوب، ويقبل التوبة من عباده مهما عظُمت ذنوبهم.',
    tafsirEn: 'Al-Ghafur: The One who forgives sins, covers faults, and accepts repentance from His servants, however great their sins.',
    videoUrl: null
  },

  /* ─── 35 ─── */
  {
    id: 35,
    ar: 'الشَّكُور',
    transliteration: 'Ash-Shakur',
    meaningEn: 'The Most Appreciative',
    tafsirAr: 'الشكور: الذي يشكر القليل من العمل، ويعطي عليه الجزيل من الثواب.',
    tafsirEn: 'Ash-Shakur: The One who appreciates the smallest deed and rewards it with abundant recompense.',
    videoUrl: null
  },

  /* ─── 36 ─── */
  {
    id: 36,
    ar: 'الْعَلِيّ',
    transliteration: 'Al-\'Aliyy',
    meaningEn: 'The Most High',
    tafsirAr: 'العلي: الذي له العلو المطلق بذاته وقدره وقهره، فوق كل شيء بذاته وصفاته.',
    tafsirEn: 'Al-\'Aliyy: Possessor of absolute elevation in His essence, power, and dominion — above all things.',
    videoUrl: null
  },

  /* ─── 37 ─── */
  {
    id: 37,
    ar: 'الْكَبِير',
    transliteration: 'Al-Kabir',
    meaningEn: 'The Most Great',
    tafsirAr: 'الكبير: الذي كل شيء دونه صغير، لا يُدرك قدره ولا تُحد عظمته.',
    tafsirEn: 'Al-Kabir: The One beside whom everything is small — His magnitude is beyond comprehension and limit.',
    videoUrl: null
  },

  /* ─── 38 ─── */
  {
    id: 38,
    ar: 'الْحَفِيظ',
    transliteration: 'Al-Hafiz',
    meaningEn: 'The Preserver',
    tafsirAr: 'الحفيظ: الذي يحفظ كل شيء، ويحفظ أعمال العباد، ويحفظ أولياءه من كل سوء.',
    tafsirEn: 'Al-Hafiz: The One who preserves all things, records the deeds of His servants, and protects His allies from all harm.',
    videoUrl: null
  },

  /* ─── 39 ─── */
  {
    id: 39,
    ar: 'الْمُقِيت',
    transliteration: 'Al-Muqit',
    meaningEn: 'The Sustainer',
    tafsirAr: 'المقيت: الذي خلق الأقوات، ويوصلها إلى الأبدان، ويقيت كل نفس بما تحتاج.',
    tafsirEn: 'Al-Muqit: The One who creates all sustenance, delivers it to bodies, and provides every soul with what it needs.',
    videoUrl: null
  },

  /* ─── 40 ─── */
  {
    id: 40,
    ar: 'الْحَسِيب',
    transliteration: 'Al-Hasib',
    meaningEn: 'The Reckoner',
    tafsirAr: 'الحسيب: الذي يحاسب عباده على أعمالهم، ويكفي من توكل عليه، ويحفظ كل شيء.',
    tafsirEn: 'Al-Hasib: The One who takes account of His servants\' deeds, suffices those who trust in Him, and preserves all things.',
    videoUrl: null
  },

  /* ─── 41 ─── */
  {
    id: 41,
    ar: 'الْجَلِيل',
    transliteration: 'Al-Jalil',
    meaningEn: 'The Majestic',
    tafsirAr: 'الجليل: ذو الجلال والعظمة، موصوف بصفات الكمال، لا يشاركه أحد في جلاله.',
    tafsirEn: 'Al-Jalil: Possessor of majesty and greatness, described with the attributes of perfection — none shares His grandeur.',
    videoUrl: null
  },

  /* ─── 42 ─── */
  {
    id: 42,
    ar: 'الْكَرِيم',
    transliteration: 'Al-Karim',
    meaningEn: 'The Most Generous',
    tafsirAr: 'الكريم: الذي يعطي بلا سؤال، ويجود بلا حساب، ويغفر بلا تعنيف.',
    tafsirEn: 'Al-Karim: The One who gives without being asked, grants generously without reckoning, and forgives without reproach.',
    videoUrl: null
  },

  /* ─── 43 ─── */
  {
    id: 43,
    ar: 'الرَّقِيب',
    transliteration: 'Ar-Raqib',
    meaningEn: 'The Watchful',
    tafsirAr: 'الرقيب: الذي يراقب كل شيء، لا يغفل عن شيء، ويعلم أحوال العباد جميعًا.',
    tafsirEn: 'Ar-Raqib: The One who watches over all things — never heedless, fully aware of every state of every servant.',
    videoUrl: null
  },

  /* ─── 44 ─── */
  {
    id: 44,
    ar: 'الْمُجِيب',
    transliteration: 'Al-Mujib',
    meaningEn: 'The Responsive',
    tafsirAr: 'المجيب: الذي يجيب دعاء الداعين، ويستجيب لعباده إذا دعوه، ويعطيهم سؤالهم.',
    tafsirEn: 'Al-Mujib: The One who answers the call of those who call upon Him, responding when they ask.',
    videoUrl: null
  },

  /* ─── 45 ─── */
  {
    id: 45,
    ar: 'الْوَاسِع',
    transliteration: 'Al-Wasi\'',
    meaningEn: 'The All-Encompassing',
    tafsirAr: 'الواسع: الذي وسع علمه كل شيء، ووسعت رحمته كل شيء، ووسع جوده كل سائل.',
    tafsirEn: 'Al-Wasi\': The One whose knowledge embraces all things, whose mercy encompasses all, and whose generosity reaches every seeker.',
    videoUrl: null
  },

  /* ─── 46 ─── */
  {
    id: 46,
    ar: 'الْحَكِيم',
    transliteration: 'Al-Hakim',
    meaningEn: 'The All-Wise',
    tafsirAr: 'الحكيم: الذي يضع كل شيء في موضعه، ويعلم بحقائق الأمور وعواقبها، وحكمه كلها بالغة في الحكمة.',
    tafsirEn: 'Al-Hakim: The One who places everything in its proper place, knowing the truth and outcome of all matters — His wisdom is absolute.',
    videoUrl: null
  },

  /* ─── 47 ─── */
  {
    id: 47,
    ar: 'الْوَدُود',
    transliteration: 'Al-Wadud',
    meaningEn: 'The Most Loving',
    tafsirAr: 'الودود: الذي يحب أولياءه ويحبونه، ويكون معهم بلطفه ورحمته، ويحب عباده الصالحين.',
    tafsirEn: 'Al-Wadud: The One who loves His allies and is loved by them, drawing near with kindness and mercy, loving His righteous servants.',
    videoUrl: null
  },

  /* ─── 48 ─── */
  {
    id: 48,
    ar: 'الْمَجِيد',
    transliteration: 'Al-Majid',
    meaningEn: 'The Glorious',
    tafsirAr: 'المجيد: ذو الشرف والعز والكرم، واسع الفضل، عظيم الإحسان.',
    tafsirEn: 'Al-Majid: Possessor of honour, might, and generosity — vast in grace, magnificent in benevolence.',
    videoUrl: null
  },

  /* ─── 49 ─── */
  {
    id: 49,
    ar: 'الْبَاعِث',
    transliteration: 'Al-Ba\'ith',
    meaningEn: 'The Resurrector',
    tafsirAr: 'الباعث: الذي يبعث الخلق يوم القيامة، ويبعث الهداية في القلوب، ويبعث للناس من يدلهم على الخير.',
    tafsirEn: 'Al-Ba\'ith: The One who will resurrect creation on the Day of Judgment, who awakens guidance in hearts, and sends callers to good.',
    videoUrl: null
  },

  /* ─── 50 ─── */
  {
    id: 50,
    ar: 'الشَّهِيد',
    transliteration: 'Ash-Shahid',
    meaningEn: 'The Witness',
    tafsirAr: 'الشهيد: المطلع على كل شيء، حاضر مع كل شيء بعلمه، يشهد أعمال العباد ويحصيها.',
    tafsirEn: 'Ash-Shahid: The One who witnesses all things, present with everything through His knowledge, witnessing and recording His servants\' deeds.',
    videoUrl: null
  },


  /* ─── 51 ─── */
  {
    id: 51,
    ar: 'الْحَقّ',
    transliteration: 'Al-Haqq',
    meaningEn: 'The Absolute Truth',
    tafsirAr: 'الحق: الذي وجوده حق، ووعده حق، وكل ما منه حق، لا يزول ولا يتغير.',
    tafsirEn: 'Al-Haqq: The One whose existence is absolute truth, whose promise is truth, and from whom all truth emanates.',
    videoUrl: null
  },

  /* ─── 52 ─── */
  {
    id: 52,
    ar: 'الْوَكِيل',
    transliteration: 'Al-Wakil',
    meaningEn: 'The Trustee, The Disposer of Affairs',
    tafsirAr: 'الوكيل: الذي يقوم بمصالح عباده، ويكفي من توكل عليه، ويدبر أمور خلقه.',
    tafsirEn: 'Al-Wakil: The One who manages the affairs of His servants, suffices those who rely on Him, and directs all creation.',
    videoUrl: null
  },

  /* ─── 53 ─── */
  {
    id: 53,
    ar: 'الْقَوِيّ',
    transliteration: 'Al-Qawiyy',
    meaningEn: 'The Most Strong',
    tafsirAr: 'القوي: التام القوة، لا يعجزه شيء، ولا يلحقه ضعف ولا تعب.',
    tafsirEn: 'Al-Qawiyy: Possessor of perfect strength — nothing overpowers Him, no weakness or fatigue touches Him.',
    videoUrl: null
  },

  /* ─── 54 ─── */
  {
    id: 54,
    ar: 'الْمَتِين',
    transliteration: 'Al-Matin',
    meaningEn: 'The Firm, The Steadfast',
    tafsirAr: 'المتين: الشديد القوة، الذي لا تنقطع قوته ولا يلحقه خلل، قوته ثابتة لا تتزعزع.',
    tafsirEn: 'Al-Matin: The One of unwavering strength, whose power never fails nor weakens, firm and unshakable.',
    videoUrl: null
  },

  /* ─── 55 ─── */
  {
    id: 55,
    ar: 'الْوَلِيّ',
    transliteration: 'Al-Waliyy',
    meaningEn: 'The Protecting Friend',
    tafsirAr: 'الولي: الذي يتولى عباده المؤمنين بالحفظ والرعاية والنصرة، لا يخذل من تولاه.',
    tafsirEn: 'Al-Waliyy: The One who protects, nurtures, and supports His believing servants — never abandoning those who turn to Him.',
    videoUrl: null
  },

  /* ─── 56 ─── */
  {
    id: 56,
    ar: 'الْحَمِيد',
    transliteration: 'Al-Hamid',
    meaningEn: 'The Praiseworthy',
    tafsirAr: 'الحميد: الذي يُحمد على كل حال، وهو المحمود في ذاته وصفاته وأفعاله.',
    tafsirEn: 'Al-Hamid: The One who is praised in every state — praised in His essence, attributes, and actions.',
    videoUrl: null
  },

  /* ─── 57 ─── */
  {
    id: 57,
    ar: 'الْمُحْصِي',
    transliteration: 'Al-Muhsi',
    meaningEn: 'The All-Enumerating',
    tafsirAr: 'المحصي: الذي أحصى كل شيء عددًا، لا يفوته شيء، ولا يشتبه عليه أحد.',
    tafsirEn: 'Al-Muhsi: The One who enumerates all things, nothing escapes His count, no one is confused with another.',
    videoUrl: null
  },

  /* ─── 58 ─── */
  {
    id: 58,
    ar: 'الْمُبْدِئ',
    transliteration: 'Al-Mubdi\'',
    meaningEn: 'The Originator',
    tafsirAr: 'المبدئ: الذي أنشأ الخلق وبدأه على غير مثال سابق، ثم يبدئ الخلق مرة أخرى يوم القيامة.',
    tafsirEn: 'Al-Mubdi\': The One who began creation without any prior model, and who will bring it forth again on the Day of Judgment.',
    videoUrl: null
  },

  /* ─── 59 ─── */
  {
    id: 59,
    ar: 'الْمُعِيد',
    transliteration: 'Al-Mu\'id',
    meaningEn: 'The Restorer',
    tafsirAr: 'المعيد: الذي يعيد الخلق بعد الموت، ويعيد الأمور إلى نصابها، لا يعجزه إعادة شيء.',
    tafsirEn: 'Al-Mu\'id: The One who restores creation after death, returning all matters to their proper state — nothing is beyond Him to restore.',
    videoUrl: null
  },

  /* ─── 60 ─── */
  {
    id: 60,
    ar: 'الْمُحْيِي',
    transliteration: 'Al-Muhyi',
    meaningEn: 'The Giver of Life',
    tafsirAr: 'المحيي: الذي يحيي الأموات، ويحيي القلوب بالإيمان، ويهب الحياة لمن يشاء.',
    tafsirEn: 'Al-Muhyi: The One who gives life to the dead, revives hearts through faith, and grants life to whom He wills.',
    videoUrl: null
  },

  /* ─── 61 ─── */
  {
    id: 61,
    ar: 'الْمُمِيت',
    transliteration: 'Al-Mumit',
    meaningEn: 'The Bringer of Death',
    tafsirAr: 'المميت: الذي يميت كل شيء في الدنيا بأجله المحدد، لا مفر منه، لا أحد يستطيع تأخير الموت.',
    tafsirEn: 'Al-Mumit: The One who causes every living thing to die at its appointed time — none can delay death.',
    videoUrl: null
  },

  /* ─── 62 ─── */
  {
    id: 62,
    ar: 'الْحَيُّ',
    transliteration: 'Al-Hayy',
    meaningEn: 'The Ever-Living',
    tafsirAr: 'الحي: الذي له الحياة الكاملة، لا يموت ولا يفنى، حياته ذاتية أبدية سرمدية.',
    tafsirEn: 'Al-Hayy: Possessor of perfect and eternal life — He never dies, never perishes, His life being inherent and everlasting.',
    videoUrl: null
  },

  /* ─── 63 ─── */
  {
    id: 63,
    ar: 'الْقَيُّوم',
    transliteration: 'Al-Qayyum',
    meaningEn: 'The Self-Subsisting Sustainer',
    tafsirAr: 'القيوم: الذي قام بنفسه، وأقام كل شيء، لا يحتاج إلى غيره، وكل شيء يحتاج إليه.',
    tafsirEn: 'Al-Qayyum: The One who is self-subsisting and sustains all else — He needs none, while all need Him.',
    videoUrl: null
  },

  /* ─── 64 ─── */
  {
    id: 64,
    ar: 'الْوَاجِد',
    transliteration: 'Al-Wajid',
    meaningEn: 'The Perceiver, The Finder',
    tafsirAr: 'الواجد: الذي لا يعجزه شيء يطلبه، ولا يفوته شيء أراده، الغني الذي لا يفقد شيئًا.',
    tafsirEn: 'Al-Wajid: The One who is never unable to attain what He seeks, never misses what He wills — the Self-Sufficient who lacks nothing.',
    videoUrl: null
  },

  /* ─── 65 ─── */
  {
    id: 65,
    ar: 'الْمَاجِد',
    transliteration: 'Al-Majid',
    meaningEn: 'The Noble, The Illustrious',
    tafsirAr: 'الماجد: ذو المجد والعز، العظيم الكرم، لا ينقص عطاؤه ولا ينفد جوده.',
    tafsirEn: 'Al-Majid: Possessor of nobility and honour, of immense generosity — His giving never diminishes nor depletes.',
    videoUrl: null
  },

  /* ─── 66 ─── */
  {
    id: 66,
    ar: 'الْوَاحِد',
    transliteration: 'Al-Wahid',
    meaningEn: 'The One',
    tafsirAr: 'الواحد: الذي لا شريك له، ولا نظير، لا يقبل التجزئة ولا التعدد، واحد في ذاته وصفاته.',
    tafsirEn: 'Al-Wahid: The One without partner or equal, indivisible and unique — one in His essence and attributes.',
    videoUrl: null
  },

  /* ─── 67 ─── */
  {
    id: 67,
    ar: 'الْأَحَد',
    transliteration: 'Al-Ahad',
    meaningEn: 'The Unique, The Indivisible',
    tafsirAr: 'الأحد: الفرد الذي لا شريك له في ربوبيته وألوهيته، لا يصح أن يشارك في أسمائه وصفاته.',
    tafsirEn: 'Al-Ahad: The Unique who has no partner in His lordship or divinity — none shares His names or attributes.',
    videoUrl: null
  },

  /* ─── 68 ─── */
  {
    id: 68,
    ar: 'الصَّمَد',
    transliteration: 'As-Samad',
    meaningEn: 'The Eternal, The Self-Sufficient',
    tafsirAr: 'الصمد: الذي يُصمد إليه في الحوائج، السيد الذي كمل في سؤدده، لا يقضى دونه أمر.',
    tafsirEn: 'As-Samad: The Eternal upon whom all depend for their needs, the Master of perfect sovereignty — no affair is decided without Him.',
    videoUrl: null
  },

  /* ─── 69 ─── */
  {
    id: 69,
    ar: 'الْقَادِر',
    transliteration: 'Al-Qadir',
    meaningEn: 'The Capable',
    tafsirAr: 'القادر: الذي لا يعجزه شيء، إذا أراد شيئًا قال له كن فيكون، قادر على كل شيء.',
    tafsirEn: 'Al-Qadir: The One whom nothing overpowers — when He wills a thing, He says "Be" and it is, capable of all things.',
    videoUrl: null
  },

  /* ─── 70 ─── */
  {
    id: 70,
    ar: 'الْمُقْتَدِر',
    transliteration: 'Al-Muqtadir',
    meaningEn: 'The Omnipotent, The Powerful Determiner',
    tafsirAr: 'المقتدر: التام القدرة، الذي ينفذ أمره، ويقضي ما يشاء بلا معارض.',
    tafsirEn: 'Al-Muqtadir: Possessor of perfect power, whose command is always carried out, decreeing what He wills without any obstacle.',
    videoUrl: null
  },

  /* ─── 71 ─── */
  {
    id: 71,
    ar: 'الْمُقَدِّم',
    transliteration: 'Al-Muqaddim',
    meaningEn: 'The Expediter, The Promoter',
    tafsirAr: 'المقدم: الذي يقدم من يشاء من عباده، فيرفع منازلهم، ويقربهم إليه بفضله.',
    tafsirEn: 'Al-Muqaddim: The One who advances whom He wills of His servants, raising their ranks and drawing them near by His grace.',
    videoUrl: null
  },

  /* ─── 72 ─── */
  {
    id: 72,
    ar: 'الْمُؤَخِّر',
    transliteration: 'Al-Mu\'akhkhir',
    meaningEn: 'The Delayer, The Retarder',
    tafsirAr: 'المؤخر: الذي يؤخر من يشاء من عباده، ويؤخر ما يشاء من الأمور لحكمة يريدها.',
    tafsirEn: 'Al-Mu\'akhkhir: The One who delays whom He wills of His servants and defers what He wills of affairs, according to His wisdom.',
    videoUrl: null
  },

  /* ─── 73 ─── */
  {
    id: 73,
    ar: 'الْأَوَّل',
    transliteration: 'Al-Awwal',
    meaningEn: 'The First',
    tafsirAr: 'الأول: الذي ليس قبله شيء، الأزلي الذي لا بداية له، كان ولا شيء معه.',
    tafsirEn: 'Al-Awwal: The One before whom nothing existed — eternal, without beginning, present when nothing else was.',
    videoUrl: null
  },

  /* ─── 74 ─── */
  {
    id: 74,
    ar: 'الْآخِر',
    transliteration: 'Al-Akhir',
    meaningEn: 'The Last',
    tafsirAr: 'الآخر: الذي ليس بعده شيء، الباقي بعد فناء الخلق، لا نهاية له.',
    tafsirEn: 'Al-Akhir: The One after whom nothing exists — remaining after all creation perishes, without end.',
    videoUrl: null
  },

  /* ─── 75 ─── */
  {
    id: 75,
    ar: 'الظَّاهِر',
    transliteration: 'Az-Zahir',
    meaningEn: 'The Manifest',
    tafsirAr: 'الظاهر: الذي ظهر بأدلته وآياته، وظهر فوق كل شيء بعظمته وقدرته.',
    tafsirEn: 'Az-Zahir: The One made manifest through His signs and evidence, evident above all things by His greatness and power.',
    videoUrl: null
  },

  /* ─── 76 ─── */
  {
    id: 76,
    ar: 'الْبَاطِن',
    transliteration: 'Al-Batin',
    meaningEn: 'The Hidden',
    tafsirAr: 'الباطن: العالم بكل خفي، القريب من كل شيء، الذي لا تدركه الأبصار ولا تحيط به العقول.',
    tafsirEn: 'Al-Batin: The One aware of every hidden thing, near to all, whom eyes cannot perceive nor minds encompass.',
    videoUrl: null
  },

  /* ─── 77 ─── */
  {
    id: 77,
    ar: 'الْوَالِي',
    transliteration: 'Al-Wali',
    meaningEn: 'The Governor, The Protecting Friend',
    tafsirAr: 'الوالي: الذي يلي أمور الخلق بتدبيره وحكمته، مالك الأمور ومتوليها بنفسه.',
    tafsirEn: 'Al-Wali: The One who governs the affairs of creation with His management and wisdom — owner and disposer of all matters.',
    videoUrl: null
  },

  /* ─── 78 ─── */
  {
    id: 78,
    ar: 'الْمُتَعَالِي',
    transliteration: 'Al-Muta\'ali',
    meaningEn: 'The Supremely Exalted',
    tafsirAr: 'المتعالي: الذي تنزه عن صفات المخلوقين، وتعالى عن كل نقص وعيب، العلي بذاته وصفاته.',
    tafsirEn: 'Al-Muta\'ali: The One far above the attributes of creation, exalted above every defect — Most High in His essence and attributes.',
    videoUrl: null
  },

  /* ─── 79 ─── */
  {
    id: 79,
    ar: 'الْبَرّ',
    transliteration: 'Al-Barr',
    meaningEn: 'The Source of All Goodness',
    tafsirAr: 'البر: الذي وسع خلقه برّه وإحسانه، لا ينقص برّه ولا ينفد إحسانه.',
    tafsirEn: 'Al-Barr: The One whose goodness and kindness encompass all creation — His benevolence never diminishes nor ends.',
    videoUrl: null
  },

  /* ─── 80 ─── */
  {
    id: 80,
    ar: 'التَّوَّاب',
    transliteration: 'At-Tawwab',
    meaningEn: 'The Ever-Pardoning',
    tafsirAr: 'التواب: الذي يقبل توبة عباده مهما تكررت، ويرجع عليهم برحمته، ويفرح بتوبتهم.',
    tafsirEn: 'At-Tawwab: The One who accepts the repentance of His servants however often they return, turning to them with mercy, rejoicing in their return.',
    videoUrl: null
  },

  /* ─── 81 ─── */
  {
    id: 81,
    ar: 'الْمُنْتَقِم',
    transliteration: 'Al-Muntaqim',
    meaningEn: 'The Avenger',
    tafsirAr: 'المنتقم: الذي ينتقم من الظالمين بعدله، وينتصر للمظلومين، لا يفوت أحدًا بما كسب.',
    tafsirEn: 'Al-Muntaqim: The One who takes vengeance on the oppressors with justice, defends the wronged, and lets none escape their deeds.',
    videoUrl: null
  },

  /* ─── 82 ─── */
  {
    id: 82,
    ar: 'الْعَفُوّ',
    transliteration: 'Al-\'Afuww',
    meaningEn: 'The Pardoner',
    tafsirAr: 'العفو: الذي يعفو عن السيئات، ويمحو الذنوب، ولا يعاقب من أناب إليه.',
    tafsirEn: 'Al-\'Afuww: The One who pardons sins, erases errors, and does not punish those who turn to Him.',
    videoUrl: null
  },

  /* ─── 83 ─── */
  {
    id: 83,
    ar: 'الرَّءُوف',
    transliteration: 'Ar-Ra\'uf',
    meaningEn: 'The Most Kind',
    tafsirAr: 'الرءوف: شديد الرحمة والعطف على عباده، يرحمهم برحمته الواسعة، ويلطف بهم في كل حال.',
    tafsirEn: 'Ar-Ra\'uf: The One of intense mercy and tenderness toward His servants, embracing them with vast compassion and kindness in every state.',
    videoUrl: null
  },

  /* ─── 84 ─── */
  {
    id: 84,
    ar: 'مَالِكُ الْمُلْك',
    transliteration: 'Malik al-Mulk',
    meaningEn: 'Master of the Kingdom',
    tafsirAr: 'مالك الملك: المتصرف في ملكه كما يشاء، يؤتي الملك من يشاء، وينزع الملك ممن يشاء، ويعز ويذل.',
    tafsirEn: 'Malik al-Mulk: The absolute disposer of His kingdom — He grants dominion to whom He wills and takes it from whom He wills, honouring and humbling.',
    videoUrl: null
  },

  /* ─── 85 ─── */
  {
    id: 85,
    ar: 'ذُو الْجَلَالِ وَالْإِكْرَام',
    transliteration: 'Dhul-Jalali wal-Ikram',
    meaningEn: 'Possessor of Majesty and Honour',
    tafsirAr: 'ذو الجلال والإكرام: الموصوف بالجلال والعظمة، والمنعم بالكرم والإحسان على عباده.',
    tafsirEn: 'Dhul-Jalali wal-Ikram: The One described with majesty and greatness, and who bestows generosity and honour upon His servants.',
    videoUrl: null
  },

  /* ─── 86 ─── */
  {
    id: 86,
    ar: 'الْمُقْسِط',
    transliteration: 'Al-Muqsit',
    meaningEn: 'The Equitable',
    tafsirAr: 'المقسط: العادل في حكمه، المنصف للمظلوم من الظالم، لا يظلم مثقال ذرة.',
    tafsirEn: 'Al-Muqsit: The One just in His judgment, granting the wronged their due from the oppressor — He wrongs not even an atom\'s weight.',
    videoUrl: null
  },

  /* ─── 87 ─── */
  {
    id: 87,
    ar: 'الْجَامِع',
    transliteration: 'Al-Jami\'',
    meaningEn: 'The Gatherer',
    tafsirAr: 'الجامع: الذي يجمع الخلائق يوم القيامة ليوم لا ريب فيه، ويجمع بين المتفرقات بقدرته.',
    tafsirEn: 'Al-Jami\': The One who will gather all creation on the Day of Judgment, gathering scattered things by His power.',
    videoUrl: null
  },

  /* ─── 88 ─── */
  {
    id: 88,
    ar: 'الْغَنِيّ',
    transliteration: 'Al-Ghaniyy',
    meaningEn: 'The Self-Sufficient',
    tafsirAr: 'الغني: الذي لا يحتاج إلى شيء، وكل شيء يحتاج إليه، غناه ذاتي، وفقر الخلق إليه دائم.',
    tafsirEn: 'Al-Ghaniyy: The One who needs nothing, while all things need Him — His self-sufficiency is inherent, and creation\'s need of Him is constant.',
    videoUrl: null
  },

  /* ─── 89 ─── */
  {
    id: 89,
    ar: 'الْمُغْنِي',
    transliteration: 'Al-Mughni',
    meaningEn: 'The Enricher',
    tafsirAr: 'المغني: الذي يغني من يشاء من عباده بفضله، ويكفيهم من رزقه، ويغنيهم بجوده.',
    tafsirEn: 'Al-Mughni: The One who enriches whom He wills of His servants by His grace, sufficing them from His provision and enriching them through His generosity.',
    videoUrl: null
  },

  /* ─── 90 ─── */
  {
    id: 90,
    ar: 'الْمَانِع',
    transliteration: 'Al-Mani\'',
    meaningEn: 'The Preventer of Harm',
    tafsirAr: 'المانع: الذي يمنع الضر عن عباده، ويمنع ما يريد منعه بحكمته، لا مانع لما أعطى ولا معطي لما منع.',
    tafsirEn: 'Al-Mani\': The One who prevents harm from His servants, preventing what He wills by His wisdom — none can prevent what He gives nor give what He prevents.',
    videoUrl: null
  },

  /* ─── 91 ─── */
  {
    id: 91,
    ar: 'الضَّارّ',
    transliteration: 'Ad-Darr',
    meaningEn: 'The Distresser',
    tafsirAr: 'الضار: الذي يقدّر الضر بحكمته، وليس في ملكه شر محض، بل لحكمة بالغة.',
    tafsirEn: 'Ad-Darr: The One who decrees harm by His wisdom — there is no pure evil in His dominion, only profound wisdom.',
    videoUrl: null
  },

  /* ─── 92 ─── */
  {
    id: 92,
    ar: 'النَّافِع',
    transliteration: 'An-Nafi\'',
    meaningEn: 'The Bestower of Benefits',
    tafsirAr: 'النافع: الذي يقدّر النفع لعباده، ويوصل الخير إليهم، ويجعل في كل شيء منفعة بحكمته.',
    tafsirEn: 'An-Nafi\': The One who decrees benefit for His servants, delivering good to them and placing benefit in all things by His wisdom.',
    videoUrl: null
  },

  /* ─── 93 ─── */
  {
    id: 93,
    ar: 'النُّور',
    transliteration: 'An-Nur',
    meaningEn: 'The Light',
    tafsirAr: 'النور: الذي أنار السماوات والأرض، وهدى قلوب المؤمنين بنوره، فهو نور الهداية في القلوب.',
    tafsirEn: 'An-Nur: The One who illuminated the heavens and the earth, guiding the hearts of believers with His light — the light of guidance in hearts.',
    videoUrl: null
  },

  /* ─── 94 ─── */
  {
    id: 94,
    ar: 'الْهَادِي',
    transliteration: 'Al-Hadi',
    meaningEn: 'The Guide',
    tafsirAr: 'الهادي: الذي يهدي خلقه إلى ما فيه صلاحهم، ويهدي المؤمنين إلى صراطه المستقيم.',
    tafsirEn: 'Al-Hadi: The One who guides His creation to what is good for them, and guides the believers to His straight path.',
    videoUrl: null
  },

  /* ─── 95 ─── */
  {
    id: 95,
    ar: 'الْبَدِيع',
    transliteration: 'Al-Badi\'',
    meaningEn: 'The Incomparable Originator',
    tafsirAr: 'البديع: الذي خلق الخلق على غير مثال سابق، لا نظير له في ذاته وصفاته وأفعاله.',
    tafsirEn: 'Al-Badi\': The One who creates without any prior model — incomparable in His essence, attributes, and actions.',
    videoUrl: null
  },

  /* ─── 96 ─── */
  {
    id: 96,
    ar: 'الْبَاقِي',
    transliteration: 'Al-Baqi',
    meaningEn: 'The Everlasting',
    tafsirAr: 'الباقي: الذي لا يفنى ولا يزول، باقٍ بعد فناء كل شيء، لا نهاية لبقائه.',
    tafsirEn: 'Al-Baqi: The One who never perishes nor ends — remaining after all things fade, His existence without end.',
    videoUrl: null
  },

  /* ─── 97 ─── */
  {
    id: 97,
    ar: 'الْوَارِث',
    transliteration: 'Al-Warith',
    meaningEn: 'The Inheritor',
    tafsirAr: 'الوارث: الذي يرث الأرض ومن عليها، الباقي بعد فناء الخلق، مالك كل شيء بعد زوال ملكهم.',
    tafsirEn: 'Al-Warith: The One who inherits the earth and all upon it — remaining after creation perishes, owner of all things after their ownership ends.',
    videoUrl: null
  },

  /* ─── 98 ─── */
  {
    id: 98,
    ar: 'الرَّشِيد',
    transliteration: 'Ar-Rashid',
    meaningEn: 'The Guide to the Right Path',
    tafsirAr: 'الرشيد: الذي أفعاله على سنن الحكمة والصواب، يرشد الخلق إلى مصالحهم، ويهديهم إلى سبيل الرشاد.',
    tafsirEn: 'Ar-Rashid: The One whose actions follow perfect wisdom and correctness, guiding creation to their interests and leading them to the path of rightness.',
    videoUrl: null
  },

  /* ─── 99 ─── */
  {
    id: 99,
    ar: 'الصَّبُور',
    transliteration: 'As-Sabur',
    meaningEn: 'The Most Patient',
    tafsirAr: 'الصبور: الذي لا يعاجل العصاة بالعقوبة، يحلم عليهم ويؤخر العقوبة، مع كمال قدرته على الأخذ.',
    tafsirEn: 'As-Sabur: The One who does not hasten punishment for sinners, forbearing with them and delaying the penalty — despite His perfect ability to seize them.',
    videoUrl: null
  }

];

/* ─── Placeholder — Batch 2 will extend this array ─── */
const ASMA_COUNT = ASMA_NAMES.length;