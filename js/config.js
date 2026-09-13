'use strict';

const PAL = ['#f5a623','#4c7fc9','#8b4cc9','#4caf89','#c9604c','#c94c8b',
             '#4cc9c9','#7fc94c','#c97f4c','#c94c4c','#4c4cc9','#c9c94c'];

const CAT_ICONS = {
  sabah:'🌅', masaa:'🌆', nawm:'🌙', istiqaz:'☀️',
  salah:'🕌', salah_after:'📿', salah_in:'🤲',
  wudu:'💧', masjid:'🕌', taam:'🍽️', safar:'✈️',
  mutafarriqa:'📋', quran:'📖', aam:'📿', duaa:'🤲'
};

const REL_LABEL = {
  sahih: '✅ Sahih',
  hasan: '🔵 Hasan',
  daif:  "🔴 Da'if"
};

const STORAGE_KEYS = {
  cats:     'cats',
  data:     'adkar',
  favs:     'favs',
  counters: 'counters',
  lastReset:'lastReset',
  prefs:    'prefs'
};