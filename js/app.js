'use strict';

/* ═══════════════════════════════════════════════════════════
   App bootstrap
   • Load state from IndexedDB (async)
   • Migrate from localStorage on first run
   • Then render the UI
   ═══════════════════════════════════════════════════════════ */

(async function boot(){
  try{
    /* 1. Load everything from IndexedDB into memory */
    await initState();

    /* 2. Daily reset check (now async) */
    await store.checkDailyReset();

    /* 3. Build the fuzzy search index (once data is loaded) */
    rebuildSearchIndex();

    /* 4. Restore theme preference */
    const savedTheme = await store.getMeta('theme');
    if(savedTheme === 'light'){
      isLight = true;
      document.body.classList.add('light');
    }
    /* Update header toggle icon */
    const themeBtn = $('theme-toggle-btn');
    if(themeBtn) themeBtn.textContent = isLight ? '🌙' : '☀️';

    /* 5. Render home dashboard */
    renderHome();

    /* 4. Global keyboard shortcuts */
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape'){
        const sess = $('session-overlay');
        if(sess && sess.classList.contains('open')) closeSession();
      }
    });

    /* 5. Standalone-mode class */
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if(isStandalone) document.documentElement.classList.add('pwa-standalone');

    /* 6. Log */
  console.log(
    '%cصاحب · Sahib' + (isStandalone ? ' (installed)' : ''),
    'color:#c9a84c;font-weight:bold'
  );
  }catch(err){
    console.error('[app] boot failed:', err);
    /* Fallback: still try to render, might work with partial state */
    try{ renderCatsGrid(); }catch(e2){}
  }
})();