'use strict';
/* js/adhkar-taxonomy.js
   Curated subcategory table per top-level adhkar bucket.
   Consumed by js/views/adkar.js to render the chip row inside a bucket.
   Each entry: { key, ar, en }. Order is fixed (not sorted by count).
   The bucket key must match a `categories[]` value in js/hisn-data.js.
   The subtag key must match the second half of a `bucket:subtag` tag
   written by the v4 tag pass.
*/
window.ADHKAR_SUBCATS = {
  nawm: [
    { key: 'waking', ar: 'الاستيقاظ',      en: 'Waking' },
    { key: 'sleep',  ar: 'قبل النوم',       en: 'Before Sleep' },
    { key: 'night',  ar: 'الليل',           en: 'Night' },
    { key: 'dream',  ar: 'الرؤيا والحلم',   en: 'Dreams' }
  ],
  wudu: [
    { key: 'wudu',     ar: 'الوضوء',  en: 'Wudu' },
    { key: 'bathroom', ar: 'الخلاء',  en: 'Restroom' }
  ],
  masjid: [
    { key: 'going',    ar: 'الذهاب',   en: 'Going' },
    { key: 'entering', ar: 'الدخول',   en: 'Entering' },
    { key: 'athan',    ar: 'الأذان',   en: 'Athan' },
    { key: 'iqamah',   ar: 'الإقامة',  en: 'Iqamah' },
    { key: 'leaving',  ar: 'الخروج',   en: 'Leaving' }
  ],
  salah: [
    { key: 'istiftah',     ar: 'الاستفتاح',      en: 'Opening' },
    { key: 'ruku',         ar: 'الركوع',         en: 'Bowing' },
    { key: 'rising',       ar: 'الرفع',          en: 'Rising' },
    { key: 'sujud',        ar: 'السجود',         en: 'Prostration' },
    { key: 'jalsa',        ar: 'الجلسة',         en: 'Sitting' },
    { key: 'tashahhud',    ar: 'التشهد',         en: 'Tashahhud' },
    { key: 'before-salam', ar: 'قبل السلام',     en: 'Before Salam' },
    { key: 'qunut',        ar: 'القنوت',         en: 'Qunut' },
    { key: 'tilawah',      ar: 'سجود التلاوة',   en: 'Recitation' },
    { key: 'waswas',       ar: 'الوسوسة',        en: 'Whisperings' },
    { key: 'istikhara',    ar: 'الاستخارة',      en: 'Istikhara' },
    { key: 'hajah',        ar: 'صلاة الحاجة',    en: 'Need' }
  ],
  salah_after: [
    { key: 'after-fard',   ar: 'بعد المكتوبة',  en: 'After Fard' },
    { key: 'after-witr',   ar: 'بعد الوتر',     en: 'After Witr' },
    { key: 'maghrib-fajr', ar: 'المغرب والفجر', en: 'Maghrib & Fajr' },
    { key: 'tasbih-33',    ar: 'التسبيح',       en: 'Tasbih' }
  ],
  sabah: [
    { key: 'core',       ar: 'أذكار الصباح', en: 'Morning Core' },
    { key: 'protection', ar: 'الحماية',      en: 'Protection' },
    { key: 'dua',        ar: 'أدعية',        en: 'Du\'a' }
  ],
  masaa: [
    { key: 'core',       ar: 'أذكار المساء', en: 'Evening Core' },
    { key: 'protection', ar: 'الحماية',      en: 'Protection' },
    { key: 'dua',        ar: 'أدعية',        en: 'Du\'a' }
  ],
  duaa: [
    { key: 'anxiety',  ar: 'الهم والحزن',       en: 'Anxiety' },
    { key: 'distress', ar: 'الكرب',             en: 'Distress' },
    { key: 'enemy',    ar: 'العدو والسلطان',    en: 'Enemy' },
    { key: 'doubt',    ar: 'الشك',              en: 'Doubt' },
    { key: 'debt',     ar: 'الدين',             en: 'Debt' },
    { key: 'sin',      ar: 'الذنب',             en: 'Sin' },
    { key: 'shaytan',  ar: 'الشيطان',           en: 'Shaytan' },
    { key: 'mishap',   ar: 'المصائب',           en: 'Mishaps' },
    { key: 'weather',  ar: 'الطقس',             en: 'Weather' },
    { key: 'newborn',  ar: 'المولود',           en: 'Newborn' },
    { key: 'marriage', ar: 'الزواج',            en: 'Marriage' },
    { key: 'praise',   ar: 'الثناء',            en: 'Praise' },
    { key: 'daily',    ar: 'أدعية يومية',       en: 'Daily' }
  ],
  dhikr: [
    { key: 'tasbih',    ar: 'التسبيح',           en: 'Tasbih' },
    { key: 'tahlil',    ar: 'التهليل',           en: 'Tahlil' },
    { key: 'istighfar', ar: 'الاستغفار',         en: 'Istighfar' },
    { key: 'salawat',   ar: 'الصلاة على النبي',  en: 'Salawat' },
    { key: 'hawqala',   ar: 'الحوقلة',           en: 'Hawqala' },
    { key: 'count-100', ar: 'مائة',              en: '100x' },
    { key: 'count-33',  ar: 'ثلاث وثلاثون',      en: '33x' },
    { key: 'count-10',  ar: 'عشر',               en: '10x' },
    { key: 'count-7',   ar: 'سبع',               en: '7x' },
    { key: 'count-3',   ar: 'ثلاث',              en: '3x' }
  ],
  food: [
    { key: 'before',  ar: 'قبل الطعام',       en: 'Before' },
    { key: 'after',   ar: 'بعد الطعام',       en: 'After' },
    { key: 'fasting', ar: 'الصيام',           en: 'Fasting' },
    { key: 'host',    ar: 'الضيف والمضيف',    en: 'Host' },
    { key: 'fruit',   ar: 'الثمر',            en: 'Fruit' }
  ],
  travel: [
    { key: 'leaving',   ar: 'الخروج',   en: 'Leaving' },
    { key: 'mounting',  ar: 'الركوب',   en: 'Mounting' },
    { key: 'during',    ar: 'السفر',    en: 'During' },
    { key: 'arriving',  ar: 'الوصول',   en: 'Arriving' },
    { key: 'returning', ar: 'العودة',   en: 'Returning' },
    { key: 'market',    ar: 'السوق',    en: 'Market' },
    { key: 'lodging',   ar: 'النزول',   en: 'Lodging' }
  ],
  hajj: [
    { key: 'ihram',      ar: 'الإحرام',   en: 'Ihram' },
    { key: 'talbiyah',   ar: 'التلبية',   en: 'Talbiyah' },
    { key: 'tawaf',      ar: 'الطواف',    en: 'Tawaf' },
    { key: 'sai',        ar: 'السعي',     en: "Sa'i" },
    { key: 'arafat',     ar: 'عرفة',      en: 'Arafat' },
    { key: 'muzdalifah', ar: 'المزدلفة',  en: 'Muzdalifah' },
    { key: 'jamarat',    ar: 'الجمار',    en: 'Jamarat' }
  ],
  sickness: [
    { key: 'visiting',  ar: 'عيادة المريض',  en: 'Visiting' },
    { key: 'patient',   ar: 'دعاء المريض',   en: 'Patient' },
    { key: 'pain',      ar: 'وجع الجسد',     en: 'Pain' },
    { key: 'deathbed',  ar: 'عند اليأس',     en: 'Deathbed' }
  ],
  janazah: [
    { key: 'closing-eyes',   ar: 'إغماض الميت',      en: 'Closing Eyes' },
    { key: 'funeral-prayer', ar: 'الصلاة على الميت', en: 'Funeral Prayer' },
    { key: 'child',          ar: 'الطفل',            en: 'Child' },
    { key: 'condolence',     ar: 'التعزية',          en: 'Condolence' },
    { key: 'burial',         ar: 'الدفن',            en: 'Burial' },
    { key: 'graves',         ar: 'زيارة القبور',     en: 'Graves' },
    { key: 'deathbed',       ar: 'تلقين المحتضر',    en: 'Talqin' }
  ],
  clothing: [
    { key: 'wearing',     ar: 'لبس الثوب',      en: 'Wearing' },
    { key: 'new',         ar: 'الثوب الجديد',   en: 'New' },
    { key: 'undressing',  ar: 'وضع الثوب',      en: 'Undressing' },
    { key: 'congratulate', ar: 'التهنئة',       en: 'Congratulate' }
  ],
  home: [
    { key: 'leaving',  ar: 'الخروج من المنزل', en: 'Leaving' },
    { key: 'entering', ar: 'الدخول إلى المنزل', en: 'Entering' }
  ],
  aam: [
    { key: 'salawat-info', ar: 'فضل الصلاة على النبي', en: 'Salawat Virtues' },
    { key: 'salam',        ar: 'إفشاء السلام',         en: 'Greeting' },
    { key: 'sneeze',       ar: 'العطاس',               en: 'Sneezing' },
    { key: 'gathering',    ar: 'المجالس',              en: 'Gatherings' },
    { key: 'thanks',       ar: 'الشكر والثناء',        en: 'Thanks' },
    { key: 'istighfar',    ar: 'الاستغفار والتوبة',    en: 'Istighfar' },
    { key: 'dhikr-info',   ar: 'فضل الأذكار',          en: 'Dhikr Virtues' },
    { key: 'misc',         ar: 'متفرقات',              en: 'Misc' }
  ]
};

/* Reverse lookup: given a bucket and a subtag, return { ar, en } or null. */
window.ADHKAR_SUBCAT_LABEL = function(bucket, key){
  const list = window.ADHKAR_SUBCATS && window.ADHKAR_SUBCATS[bucket];
  if (!Array.isArray(list)) return null;
  for (let i = 0; i < list.length; i++) if (list[i].key === key) return list[i];
  return null;
};