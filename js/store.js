'use strict';
/* ═══════════════════════════════════════════════════════════
Store — high-level persistence layer
Backed by IndexedDB (via js/db.js)
═══════════════════════════════════════════════════════════ */
const store = (() => {
  let _cache = { cats: [], adkar: [], favs: [], counters: {}, meta: {} };
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

  async function migrateFromLocalStorage(){
    const alreadyMigrated = await db.meta.get('migrated');
    if(alreadyMigrated) return;
    console.log('[store] First run — migrating from localStorage…');
    const lsCats = readLS('cats'), lsData = readLS('adkar'), lsFavs = readLS('favs'), lsCounters = readLS('counters');
    if(lsCats && Array.isArray(lsCats)) await db.cats.putMany(lsCats);
    if(lsData && Array.isArray(lsData)) await db.adkar.putMany(lsData);
    if(lsFavs && Array.isArray(lsFavs)) await db.favs.putMany(lsFavs);
    if(lsCounters && typeof lsCounters === 'object'){
      for (const [k, v] of Object.entries(lsCounters)) {
        const id = Number(String(k).replace(/^c_/, ''));
        if(!Number.isNaN(id)) await db.counters.set(id, v);
      }
    }
    await db.meta.set('migrated', true);
  }
  function readLS(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch{ return null; } }

  async function loadAll(){
    await migrateFromLocalStorage();
    const [cats, adkar, favs, countersArr, metaAll] = await Promise.all([
       db.cats.getAll(), db.adkar.getAll(), db.favs.getAll(), db.counters.getAll(),
       Promise.all([ db.meta.get('lastReset').then(v=>['lastReset',v]), db.meta.get('prefs').then(v=>['prefs',v]) ]).then(Object.fromEntries),
     ]);
    _cache.cats = cats; _cache.adkar = adkar; _cache.favs = favs; _cache.meta = metaAll;
_cache.counters = {};
countersArr.forEach(row => { _cache.counters[`c_${row.id}`] = row.count; });
    _markReady();
    return _cache;
  }

  function getCats(){ return _cache.cats; }
  function getAdkar(){ return _cache.adkar; }
  function getFavs(){ return _cache.favs; }
  function getCounters(){ return _cache.counters; }
  function getLastReset(){ return _cache.meta.lastReset || ''; }
  function getPrefs(){ return _cache.meta.prefs || {}; }

  async function saveCats(list){ _cache.cats = list; await db.cats.clear(); await db.cats.putMany(list); }
  async function putCat(cat){ await db.cats.put(cat); const i = _cache.cats.findIndex(c => c.key === cat.key); if(i >= 0) _cache.cats[i] = cat; else _cache.cats.push(cat); }
  async function deleteCat(key){ await db.cats.delete(key); _cache.cats = _cache.cats.filter(c => c.key !== key); }

  async function saveAdkar(list){ _cache.adkar = list; await db.adkar.clear(); await db.adkar.putMany(list); }
  async function putAdkar(item){ await db.adkar.put(item); const i = _cache.adkar.findIndex(a => a.id === item.id); if(i >= 0) _cache.adkar[i] = item; else _cache.adkar.push(item); }
  async function deleteAdkar(id){ await db.adkar.delete(id); _cache.adkar = _cache.adkar.filter(a => a.id !== id); }
  async function deleteAdkarByCat(catKey){ await db.adkar.deleteByCat(catKey); _cache.adkar = _cache.adkar.filter(a => a.cat !== catKey); }

  async function saveFavs(ids){ _cache.favs = [...ids]; await db.favs.clear(); await db.favs.putMany(ids); }
  async function addFav(id){ if(_cache.favs.includes(id)) return; _cache.favs.push(id); await db.favs.add(id); }
  async function removeFav(id){ _cache.favs = _cache.favs.filter(x => x !== id); await db.favs.remove(id); }

  /* FIX: Save counters one by one to avoid setMany IndexedDB crash */
  async function saveCounters(obj){
    _cache.counters = { ...obj };
    await db.counters.clear();
    for (const [k, v] of Object.entries(obj)) {
      const id = Number(String(k).replace(/^c_/, ''));
      if (!Number.isNaN(id)) await db.counters.set(id, v);
    }
  }
  async function setCounter(id, count){ _cache.counters[id] = count; await db.counters.set(id, count); }
  async function clearCounters(){ _cache.counters = {}; await db.counters.clear(); }

  async function setMeta(key, value){ _cache.meta[key] = value; await db.meta.set(key, value); }
  async function getMeta(key){ if(key in _cache.meta) return _cache.meta[key]; return db.meta.get(key); }

  async function checkDailyReset(){
    const today = new Date().toDateString();
    const last  = _cache.meta.lastReset || '';
    if(last !== today){
      await clearCounters();
      await setMeta('lastReset', today);
      const el = document.getElementById('daily-reset-info');
      if(el){ el.textContent = 'Counters reset for today'; setTimeout(() => { el.textContent = ''; }, 4000); }
      return true;
    }
    return false;
  }

  function purgeLocalStorageAfterMigration(){
    try{ ['cats', 'adkar', 'favs', 'counters', 'lastReset'].forEach(k => { if(localStorage.getItem(k) !== null) localStorage.removeItem(k); }); }catch(e){}
  }

  return {
    loadAll, whenReady, isReady: () => _ready, purgeLocalStorageAfterMigration,
    getCats, getAdkar, getFavs, getCounters, getLastReset, getPrefs, getMeta,
    saveCats, putCat, deleteCat, saveAdkar, putAdkar, deleteAdkar, deleteAdkarByCat,
    saveFavs, addFav, removeFav, saveCounters, setCounter, clearCounters,
    setMeta, checkDailyReset, _cache: () => _cache,
  };
})();