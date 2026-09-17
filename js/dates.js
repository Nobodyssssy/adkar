'use strict';

/* ═══════════════════════════════════════════════════════════
   Date formatter — Gregorian + Hijri
   • Uses Intl.DateTimeFormat with islamic-umalqura calendar
   • No network needed — the browser has the Hijri calendar built in
   • Handles both Arabic and English labels
   ═══════════════════════════════════════════════════════════ */

/* Arabic month names for the Hijri calendar */
const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

/* Arabic weekday names */
const WEEKDAYS_AR = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء',
  'الخميس', 'الجمعة', 'السبت'
];

/* English Gregorian month names (short) */
const MONTHS_EN = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
];

/* ═══════════════════════════════════════════════════════════
   Get Hijri date — using Intl.DateTimeFormat
   Returns { day, month (0-11), year, monthNameAr }
   ═══════════════════════════════════════════════════════════ */
function getHijriParts(date){
  date = date || new Date();
  try{
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day:   'numeric',
      month: 'numeric',
      year:  'numeric',
    });
    const parts = fmt.formatToParts(date);
    const out = { day: 1, month: 0, year: 1447 };
    for(const p of parts){
      if(p.type === 'day')   out.day   = parseInt(p.value, 10);
      if(p.type === 'month') out.month = parseInt(p.value, 10);  /* 1-indexed: 1=Muharram, 9=Ramadan */
      if(p.type === 'year')  out.year  = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
    }
    out.monthNameAr = HIJRI_MONTHS_AR[out.month] || '';
    return out;
  }catch(err){
    console.warn('[dates] Hijri format failed', err);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   Format the full header date line
   e.g. "25 ربيع الأول 1447 · الأربعاء 15 سبتمبر"
   ═══════════════════════════════════════════════════════════ */
function formatHeaderDate(date){
  date = date || new Date();
  const hijri = getHijriParts(date);

  const weekdayAr = WEEKDAYS_AR[date.getDay()];
  const dayG = date.getDate();
  const monthG = MONTHS_EN[date.getMonth()];
  const yearG = date.getFullYear();

  /* If Hijri failed, fall back to Gregorian only */
  if(!hijri){
    return `${weekdayAr} ${dayG} ${monthG} ${yearG}`;
  }

  return `${hijri.day} ${hijri.monthNameAr} ${hijri.year} هـ · ${weekdayAr} ${dayG} ${monthG}`;
}

/* ═══════════════════════════════════════════════════════════
   Short form — for compact spaces
   ═══════════════════════════════════════════════════════════ */
function formatShortHijri(date){
  date = date || new Date();
  const h = getHijriParts(date);
  if(!h) return '';
  return `${h.day} ${h.monthNameAr} ${h.year}`;
}

/* ═══════════════════════════════════════════════════════════
   Render into the header element
   ═══════════════════════════════════════════════════════════ */
function renderHeaderDate(){
  const arEl = document.getElementById('header-date-ar');
  const enEl = document.getElementById('header-date-en');
  if(!arEl || !enEl) return;

  const date = new Date();
  const hijri = getHijriParts(date);
  const weekdayAr = WEEKDAYS_AR[date.getDay()];

  /* Arabic line: الأحد 2 ربيع الثاني 1448 */
  if(hijri){
    arEl.textContent = `${weekdayAr} ${hijri.day} ${hijri.monthNameAr} ${hijri.year}`;
  } else {
    arEl.textContent = '';
  }

  /* English line: Tuesday 15 Sep 2026 */
  const weekdayEn = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthEn = MONTHS_EN[date.getMonth()];
  enEl.textContent = `${weekdayEn} ${date.getDate()} ${monthEn} ${date.getFullYear()}`;
}

/* ═══════════════════════════════════════════════════════════
   Auto-refresh at midnight — check every minute
   ═══════════════════════════════════════════════════════════ */
let _lastDateStr = '';
function checkHeaderDateChange(){
  const today = new Date().toDateString();
  if(today !== _lastDateStr){
    _lastDateStr = today;
    renderHeaderDate();
  }
}

/* Date watcher moved to home dashboard */
/* (kept as no-op for compatibility) */