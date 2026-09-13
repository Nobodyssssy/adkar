'use strict';

/* ═══════════════════════════════════════════════════════════
   Store — high-level persistence layer
   Backed by IndexedDB (via js/db.js)
   Handles:
     • First-run migration from localStorage
     • Cached in-memory copies for fast synchronous reads
     • Writes that keep IndexedDB + memory in sync
   ═══════════════════════════════════════════════════════════ */

const store = (() => {

  /* ── In-memory caches (populated by loadAll) ── */
  let _cache = {
    cats: [],
    adkar: [],
    favs: [],
    counters: {},   // { [id]: count }
    meta: {}
  };

  let _ready = false;
  let _readyResolvers = [];

  function _markReady(){
    _ready = true;
    _readyResolvers.forEach(fn => fn());
    _readyResolvers = [];
  }

  function whenReady(){
    if(_ready) return Promise.resolve();
    return new Promise(resolve => _readyResolvers.push(resolve));
  }

  /* ═══════════════════════════════════════════════════════════
     MIGRATION — localStorage → IndexedDB (runs once)
     ═══════════════════════════════════════════════════════════ */
  async function migrateFromLocalStorage(){
    const alreadyMigrated = await db.meta.get('migrated');
    if(alreadyMigrated) return;

    console.log('[store] First run — migrating from localStorage…');

    /* Read whatever localStorage has (may be null for a fresh install) */
    const lsCats     = readLS('cats');
    const lsData     = readLS('adkar');
    const lsFavs     = readLS('favs');
    const lsCounters = readLS('counters');

    /* Only migrate if there's actually something there */
    if(lsCats && Array.isArray(lsCats))       await db.cats.putMany(lsCats);
    if(lsData && Array.isArray(lsData))       await db.adkar.putMany(lsData);
    if(lsFavs && Array.isArray(lsFavs))       await db.favs.putMany(lsFavs);
    if(lsCounters && typeof lsCounters === 'object'){
      /* localStorage counters keys look like `c_101` → strip prefix for DB */
      const clean = {};
      Object.entries(lsCounters).forEach(([k, v]) => {
        const id = Number(String(k).replace(/^c_/, ''));
        if(!Number.isNaN(id)) clean[id] = v;
      });
      await db.counters.setMany(clean);
    }

    await db.meta.set('migrated', true);
    console.log('[store] Migration complete.');
  }

  function readLS(key){
    try{
      const raw = localStorage.getItem(key);
      if(raw == null) return null;
      return JSON.parse(raw);
    }catch{ return null; }
  }

  /* ═══════════════════════════════════════════════════════════
     LOAD — pull everything into memory once at boot
     ═══════════════════════════════════════════════════════════ */
  async function loadAll(){
    /* Migration first (no-op if already done) */
    await migrateFromLocalStorage();

    const [cats, adkar, favs, countersArr, metaAll] = await Promise.all([
      db.cats.getAll(),
      db.adkar.getAll(),
      db.favs.getAll(),
      db.counters.getAll(),
      /* meta: read specific keys we care about */
      Promise.all([
        db.meta.get('lastReset').then(v => ['lastReset', v]),
        db.meta.get('prefs').then(v => ['prefs', v]),
      ]).then(entries => Object.fromEntries(entries)),
    ]);

    _cache.cats     = cats;
    _cache.adkar    = adkar;
    _cache.favs     = favs;
    _cache.counters = {};
    countersArr.forEach(row => { _cache.counters[row.id] = row.count; });
    _cache.meta     = metaAll;

    _markReady();
    return _cache;
  }

  /* ═══════════════════════════════════════════════════════════
     GETTERS (synchronous — serve from memory cache)
     ═══════════════════════════════════════════════════════════ */
  function getCats()     { return _cache.cats; }
  function getAdkar()    { return _cache.adkar; }
  function getFavs()     { return _cache.favs; }
  function getCounters() { return _cache.counters; }
  function getLastReset(){ return _cache.meta.lastReset || ''; }
  function getPrefs()    { return _cache.meta.prefs || {}; }

  /* ═══════════════════════════════════════════════════════════
     WRITERS — update DB + memory cache
     ═══════════════════════════════════════════════════════════ */

  /* ── CATEGORIES ── */
  async function saveCats(list){
    _cache.cats = list;
    await db.cats.clear();
    await db.cats.putMany(list);
  }
  async function putCat(cat){
    await db.cats.put(cat);
    const i = _cache.cats.findIndex(c => c.key === cat.key);
    if(i >= 0) _cache.cats[i] = cat; else _cache.cats.push(cat);
  }
  async function deleteCat(key){
    await db.cats.delete(key);
    _cache.cats = _cache.cats.filter(c => c.key !== key);
  }

  /* ── ADKAR ── */
  async function saveAdkar(list){
    _cache.adkar = list;
    await db.adkar.clear();
    await db.adkar.putMany(list);
  }
  async function putAdkar(item){
    await db.adkar.put(item);
    const i = _cache.adkar.findIndex(a => a.id === item.id);
    if(i >= 0) _cache.adkar[i] = item; else _cache.adkar.push(item);
  }
  async function deleteAdkar(id){
    await db.adkar.delete(id);
    _cache.adkar = _cache.adkar.filter(a => a.id !== id);
  }
  async function deleteAdkarByCat(catKey){
    await db.adkar.deleteByCat(catKey);
    _cache.adkar = _cache.adkar.filter(a => a.cat !== catKey);
  }

  /* ── FAVORITES ── */
  async function saveFavs(ids){
    _cache.favs = [...ids];
    await db.favs.clear();
    await db.favs.putMany(ids);
  }
  async function addFav(id){
    if(_cache.favs.includes(id)) return;
    _cache.favs.push(id);
    await db.favs.add(id);
  }
  async function removeFav(id){
    _cache.favs = _cache.favs.filter(x => x !== id);
    await db.favs.remove(id);
  }

  /* ── COUNTERS ── */
  async function saveCounters(obj){
    _cache.counters = { ...obj };
    await db.counters.clear();
    await db.counters.setMany(obj);
  }
  async function setCounter(id, count){
    _cache.counters[id] = count;
    await db.counters.set(id, count);
  }
  async function clearCounters(){
    _cache.counters = {};
    await db.counters.clear();
  }

  /* ── META ── */
  async function setMeta(key, value){
    _cache.meta[key] = value;
    await db.meta.set(key, value);
  }
  async function getMeta(key){
    if(key in _cache.meta) return _cache.meta[key];
    return db.meta.get(key);
  }

  /* ═══════════════════════════════════════════════════════════
     DAILY RESET
     ═══════════════════════════════════════════════════════════ */
  async function checkDailyReset(){
    const today = new Date().toDateString();
    const last  = _cache.meta.lastReset || '';
    if(last !== today){
      await clearCounters();
      await setMeta('lastReset', today);
      const el = document.getElementById('daily-reset-info');
      if(el){
        el.textContent = 'Counters reset for today';
        setTimeout(() => { el.textContent = ''; }, 4000);
      }
      return true;
    }
    return false;
  }

  /* ═══════════════════════════════════════════════════════════
     CLEANUP — remove old localStorage keys after first successful run
     ═══════════════════════════════════════════════════════════ */
  function purgeLocalStorageAfterMigration(){
    try{
      ['cats', 'adkar', 'favs', 'counters', 'lastReset'].forEach(k => {
        if(localStorage.getItem(k) !== null){
          localStorage.removeItem(k);
          console.log('[store] purged localStorage key:', k);
        }
      });
    }catch(e){ /* ignore */ }
  }

  /* ═══════════════════════════════════════════════════════════
     Public API
     ═══════════════════════════════════════════════════════════ */
  return {
    /* lifecycle */
    loadAll,
    whenReady,
    isReady: () => _ready,
    purgeLocalStorageAfterMigration,

    /* getters */
    getCats, getAdkar, getFavs, getCounters,
    getLastReset, getPrefs, getMeta,

    /* writers */
    saveCats, putCat, deleteCat,
    saveAdkar, putAdkar, deleteAdkar, deleteAdkarByCat,
    saveFavs, addFav, removeFav,
    saveCounters, setCounter, clearCounters,
    setMeta,

    /* misc */
    checkDailyReset,

    /* diagnostic */
    _cache: () => _cache,
  };
})();