'use strict';

/* ═══════════════════════════════════════════════════════════
   Application state — loaded from IndexedDB via store
   Loaded ONCE at boot (async), then referenced synchronously.
   ═══════════════════════════════════════════════════════════ */

/* Mutable globals — populated by initState() */
let cats     = [];
let data     = [];
let nextId   = 1;
let nextCk   = 200;
let favs     = [];
let counters = {};
let lastReset= '';

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
let sessItems    = [];
let sessIdx      = 0;
let sessTapCount = 0;

/* ═══════════════════════════════════════════════════════════
   Boot — called once by app.js before rendering
   ═══════════════════════════════════════════════════════════ */
async function initState(){
  /* Load from IndexedDB (this also migrates from localStorage if needed) */
  const cache = await store.loadAll();

  /* Seed defaults if empty (first install, or DB wiped) */
  const hasCats  = cache.cats.length > 0;
  const hasAdkar = cache.adkar.length > 0;

  if(!hasCats){
    cats = defaultCats();
    await store.saveCats(cats);
  } else {
    cats = cache.cats;
  }

  if(!hasAdkar){
    data = defaultData();
    await store.saveAdkar(data);
  } else {
    data = cache.adkar;
  }

  /* ── One-time merge of Hisn al-Muslim dataset (js/hisn-data.js) ──
     Uses HISN_VERSION for idempotent re-merge: bump it in hisn-data.js
     every time you edit the dataset, and this runs again automatically. */
  if(typeof HISN_ADKAR !== 'undefined' && HISN_ADKAR.length){
    const storedVersion  = (await store.getMeta('hisnMergedV2')) || 0;
    const currentVersion = (typeof HISN_VERSION === 'number') ? HISN_VERSION : 1;

    if(storedVersion < currentVersion){
      const norm = (typeof hisnNormalize === 'function') ? hisnNormalize : (s => String(s || ''));
      const existing = new Set(data.map(d => norm(d.arabic) + '|' + (d.repeat || 1)));
      let hid = Math.max(0, ...data.map(d => d.id)) + 1;
      let added = 0;

      HISN_ADKAR.forEach(item => {
        const key = norm(item.arabic) + '|' + (item.repeat || 1);
        if(key && !existing.has(key)){
          existing.add(key);
          data.push({
            id: hid++,
            categories: [item.cat],
            tags: item.tags || [],
            repeat: item.repeat || 1,
            reliability: item.reliability || null,
            situation: item.situation || '',
            arabic: item.arabic,
            hadith: item.hadith || '',
            virtue: item.virtue || '',
            transliteration: item.transliteration || ''
          });
          added++;
        }
      });

if(added) await store.saveAdkar(data);
await store.setMeta('hisnMergedV2', currentVersion);
console.log('[hisn] merged ' + added + ' new adkar, skipped ' + (HISN_ADKAR.length - added) + ' duplicates (v' + currentVersion + ')');
}

/* ── Self-heal: if the DB is somehow missing Hisn entries, re-merge now.
This runs on every boot and is cheap (a Set lookup over ~267 items).
It makes the merge immune to stale flags, race conditions, or a
first-install where hisn-data.js loaded a beat after initState ran. */
const hisnInData = data.filter(d => d.hadith && String(d.hadith).indexOf('Hisn al-Muslim') === 0).length;
if(hisnInData < HISN_ADKAR.length * 0.5){
const norm = (typeof hisnNormalize === 'function') ? hisnNormalize : (s => String(s || ''));
const existing = new Set(data.map(d => norm(d.arabic) + '|' + (d.repeat || 1)));
let hid = Math.max(0, ...data.map(d => d.id)) + 1;
let healed = 0;
HISN_ADKAR.forEach(item => {
const key = norm(item.arabic) + '|' + (item.repeat || 1);
if(key && !existing.has(key)){
existing.add(key);
data.push({
id: hid++,
categories: [item.cat],
tags: item.tags || [],
repeat: item.repeat || 1,
reliability: item.reliability || null,
situation: item.situation || '',
arabic: item.arabic,
hadith: item.hadith || '',
virtue: item.virtue || '',
transliteration: item.transliteration || ''
});
healed++;
}
});
if(healed){
await store.saveAdkar(data);
await store.setMeta('hisnMergedV2', currentVersion);
console.log('[hisn] self-heal re-merged ' + healed + ' entries (found only ' + hisnInData + '/' + HISN_ADKAR.length + ')');
}
}
}

  /* Favorites + counters + meta */
  favs     = cache.favs;
  counters = cache.counters;
  lastReset= cache.meta.lastReset || '';

  /* Compute next IDs */
  nextId = Math.max(0, ...data.map(d => d.id)) + 1;
  /* Custom categories start at cat_200 — find highest */
  const customNums = cats
    .map(c => c.key)
    .filter(k => k.startsWith('cat_'))
    .map(k => parseInt(k.slice(4), 10))
    .filter(n => !Number.isNaN(n));
  nextCk = Math.max(199, ...customNums) + 1;

  /* After successful migration, purge localStorage (once, safely) */
  const migrated = await store.getMeta('migrated');
  if(migrated){
    store.purgeLocalStorageAfterMigration();
  }
}

/* ═══════════════════════════════════════════════════════════
   Persistence helpers — async, fire-and-forget
   These update the DB AND the in-memory state (already updated
   by callers in most cases — kept for compatibility).
   ═══════════════════════════════════════════════════════════ */

const saveCats = () => store.saveCats(cats);
const saveData = () => store.saveAdkar(data);
const saveFavs = () => store.saveFavs(favs);
const saveCtrs = () => store.saveCounters(counters);

/* Debounced counter write (still useful — batches rapid taps) */
const persistCounters = debounce(() => {
  /* Only persist counters that changed since last flush.
     Simplest correct approach: dump the whole map. */
  store.saveCounters(counters);
}, 350);

/* Helper */
const getCat = key =>
  cats.find(c => c.key === key) || {ar:key, en:key, color:'#c9a84c', key};