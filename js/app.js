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

    /* 1b. Load icon sprite into the DOM (so <use> references work) */
    await loadIconSprite();
	
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
    updateThemeColorMeta();

    /* 5. Inject header icons */
    injectHeaderIcons();

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

/* Load sprite.svg into the hidden mount, so <use> can find icons */
async function loadIconSprite(){
  const mount = document.getElementById('svg-sprite-mount');
  if(!mount) return;
  if(mount.dataset.loaded === '1') return;
  try{
    const res = await fetch('assets/icons/sprite.svg');
    if(res.ok){
      mount.innerHTML = await res.text();
      mount.dataset.loaded = '1';
    }
  }catch(err){
    console.warn('[icons] sprite load failed', err);
  }
}

/* Inject SVG icons into the header after sprite is loaded */
function injectHeaderIcons(){
  /* Header buttons */
  const btnMenu = $('btn-menu');
  if(btnMenu) btnMenu.innerHTML = icon('menu', 18);

  const btnFavs = $('btn-favs');
  if(btnFavs) btnFavs.innerHTML = icon('star', 18);

  const btnAdd = document.querySelector('.btn-add-icon');
  if(btnAdd) btnAdd.innerHTML = icon('plus', 18);

  updateThemeToggleIcon();

  /* Search icon */
  const searchIcon = document.querySelector('.search-icon');
  if(searchIcon) searchIcon.innerHTML = icon('search', 14);

  /* Menu items */
  document.querySelectorAll('.menu-item[data-icon]').forEach(btn => {
    const name = btn.getAttribute('data-icon');
    const slot = btn.querySelector('.menu-icon');
    if(name && slot) slot.innerHTML = icon(name, 18);
  });

  /* Any element with data-icon that contains a .btn-icon span (global, any view) */
  document.querySelectorAll('[data-icon] > .btn-icon').forEach(span => {
    const parent = span.parentElement;
    const name = parent.getAttribute('data-icon');
    if(name && !span.dataset.injected) {
      span.innerHTML = icon(name, 15);
      span.dataset.injected = '1';
    }
  });

  /* Standalone .search-clear with data-icon (no wrapper) */
  const clearBtn = document.querySelector('.search-clear');
  if(clearBtn && clearBtn.children.length === 0){
    clearBtn.innerHTML = icon('x', 16);
  }
}

/* Sync the theme toggle icon with current state */
function updateThemeToggleIcon(){
  const btn = $('theme-toggle-btn');
  if(!btn) return;
  /* In light mode, show moon (to switch to dark); in dark mode, show sun */
  btn.innerHTML = isLight ? icon('moon', 18) : icon('sun', 18);
}

/* Sync the theme-color meta tag with the current theme */
function updateThemeColorMeta(){
  const meta = document.querySelector('meta[name="theme-color"]');
  if(!meta) return;
  const isLight = document.body.classList.contains('light');
  meta.setAttribute('content', isLight ? '#faf8f3' : '#0d0f14');
}