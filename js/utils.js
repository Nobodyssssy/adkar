'use strict';

const $ = id => document.getElementById(id);

/* ── Arabic normalization (diacritic + alef-insensitive) ── */
const AR_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const AR_TATWEEL = /\u0640/g;
function normalizeAr(s){
  if(!s) return '';
  return String(s)
    .replace(AR_DIACRITICS, '')      // strip tashkeel
    .replace(AR_TATWEEL, '')         // strip tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}
function normalizeEn(s){
  if(!s) return '';
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
/** Fuzzy-ish match: query tokens must all appear as substrings */
function fuzzyMatch(haystack, query){
  if(!query) return true;
  const h = haystack;
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  return tokens.every(t => h.includes(t));
}

/* ── TOAST ── */
let _toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── DEBOUNCE ── */
function debounce(fn, wait){
  let _t;
  return function(...args){
    clearTimeout(_t);
    _t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* ── ESCAPE HTML ── */
function esc(s){
  if(s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── PROGRESS RING ── */
function progressRing(pct, size){
  size = size || 36;
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, pct)));
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}"
            fill="none" stroke="var(--border)" stroke-width="3"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}"
            fill="none" stroke="var(--accent)" stroke-width="3"
            stroke-dasharray="${c}"
            stroke-dashoffset="${offset}"
            stroke-linecap="round"
            transform="rotate(-90 ${size/2} ${size/2})"/>
  </svg>`;
}

/* ── Debounce ── */
function debounce(fn, wait){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* ── Tiny HTML escape (for user-entered fields if ever injected) ── */
function esc(s){
  if(s == null) return '';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

/* ── SVG progress ring ── */
function progressRing(pct, color, isDone){
  const r = 14, C = 2 * Math.PI * r;
  const dash = Math.round(C * pct / 100);
  const stroke = isDone ? '#4caf89' : color;
  const label = (!isDone && pct > 0) ? pct + '%' : '';
  return `<svg style="transform:rotate(-90deg)" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="${r}" fill="none" stroke="var(--border)" stroke-width="2.5"/>
    ${pct>0 ? `<circle cx="18" cy="18" r="${r}" fill="none" stroke="${stroke}"
      stroke-width="2.5" stroke-dasharray="${dash} ${Math.round(C)}"
      stroke-linecap="round"/>` : ''}
    <text x="18" y="22" text-anchor="middle" fill="${stroke}"
      font-size="8" font-family="Tajawal,sans-serif">${label}</text>
  </svg>`;
}