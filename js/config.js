'use strict';

const PAL = ['#f5a623','#4c7fc9','#8b4cc9','#4caf89','#c9604c','#c94c8b',
             '#4cc9c9','#7fc94c','#c97f4c','#c94c4c','#4c4cc9','#c9c94c'];

const CAT_ICONS = {
  sabah:        'sunrise',
  masaa:        'sunset',
  nawm:         'moon',
  istiqaz:      'sun',
  salah:        'mosque',
  salah_after:  'sparkles',
  salah_in:     'hand-heart',
  wudu:         'droplet',
  masjid:       'mosque',
  taam:         'utensils',
  safar:        'plane',
  mutafarriqa:  'layers',
  quran:        'book-open',
  aam:          'circle-dot',
  duaa:         'hand-heart'
};

const CAT_ICON_DEFAULT = 'layers';

const REL_LABEL = {
  sahih: 'Sahih',
  hasan: 'Hasan',
  daif:  "Da'if"
};

const REL_ICON = {
  sahih: 'check-circle',
  hasan: 'circle-dot',
  daif:  'alert'
};

const STORAGE_KEYS = {
  cats:     'cats',
  data:     'adkar',
  favs:     'favs',
  counters: 'counters',
  lastReset:'lastReset',
  prefs:    'prefs'
};