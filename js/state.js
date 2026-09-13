'use strict';

/* Mutable global state — kept in one place so modules can share it */
let cats     = store.get(STORAGE_KEYS.cats, null) || defaultCats();
let data     = store.get(STORAGE_KEYS.data, null) || defaultData();
let nextId   = Math.max(0, ...data.map(d => d.id)) + 1;
let nextCk   = 200;
let favs     = store.get(STORAGE_KEYS.favs, []);
let counters = store.get(STORAGE_KEYS.counters, {});
let lastReset= localStorage.getItem(STORAGE_KEYS.lastReset) || '';

/* UI state */
let currentCat = null;
let editId     = null;
let delId      = null;
let delCat     = null;
let editCatKey = null;
let newColor   = PAL[0];
let editColor  = PAL[0];
let detailId   = null;
let isLight    = false;

/* Session state */
let sessItems   = [];
let sessIdx     = 0;
let sessTapCount= 0;

/* Persistence helpers */
const saveCats  = () => store.set(STORAGE_KEYS.cats, cats);
const saveData  = () => store.set(STORAGE_KEYS.data, data);
const saveFavs  = () => store.set(STORAGE_KEYS.favs, favs);
const saveCtrs  = () => store.set(STORAGE_KEYS.counters, counters);

const getCat = key =>
  cats.find(c => c.key === key) || {ar:key, en:key, color:'#c9a84c', key};

/* ── Debounced counter persistence (bug fix #5) ── */
const persistCounters = debounce(saveCtrs, 350);