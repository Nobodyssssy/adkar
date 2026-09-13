'use strict';

const store = (() => {
  function get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(raw == null) return fallback;
      return JSON.parse(raw);
    }catch{ return fallback; }
  }
  function set(key, val){
    try{ localStorage.setItem(key, JSON.stringify(val)); }
    catch(e){ console.error('store.set failed', key, e); }
  }
  function remove(key){ localStorage.removeItem(key); }

  /* Daily counter reset */
  function checkDailyReset(){
    const today = new Date().toDateString();
    const last = localStorage.getItem(STORAGE_KEYS.lastReset) || '';
    if(last !== today){
      set(STORAGE_KEYS.counters, {});
      localStorage.setItem(STORAGE_KEYS.lastReset, today);
      const el = document.getElementById('daily-reset-info');
      if(el){
        el.textContent = 'Counters reset for today';
        setTimeout(() => { el.textContent = ''; }, 4000);
      }
      return true;
    }
    return false;
  }

  return { get, set, remove, checkDailyReset };
})();