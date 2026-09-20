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

    /* 4. Restore theme + accent preference */
    const savedTheme = await store.getMeta('theme');
    const savedAccent = await store.getMeta('accent') || 'gold';
    if(savedTheme === 'light'){
      isLight = true;
      document.body.classList.add('light');
    }
    applyAccent(savedAccent);
    updateThemeColorMeta();

    /* 5. Inject header icons */
    injectHeaderIcons();

    /* 5.1 Render home dashboard */
    renderHome();

    /* 6. Global keyboard shortcuts */
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape'){
        const sess = $('session-overlay');
        if(sess && sess.classList.contains('open')) closeSession();
        
        const settings = document.getElementById('ov-settings');
        if(settings && settings.classList.contains('open')) closeSettings();
      }
    });

    /* 7. Standalone-mode class */
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if(isStandalone) document.documentElement.classList.add('pwa-standalone');

    /* 8. Log */
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

    /* 9. Re-check daily reset when the app comes back to the foreground
          (handles the "left open past midnight" case) */
    document.addEventListener('visibilitychange', async () => {
      if(document.visibilityState !== 'visible') return;
      const didReset = await store.checkDailyReset();
      if(didReset){
        if(typeof renderCatsGrid === 'function') renderCatsGrid();
        if(typeof renderAdkarGrid === 'function') renderAdkarGrid();
      }
    });

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

  if(typeof updateFavsButton === 'function') updateFavsButton();

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
  const bg = getComputedStyle(document.body).getPropertyValue('--bg').trim();
  meta.setAttribute('content', bg || (document.body.classList.contains('light') ? '#e6e9ef' : '#181825'));
}

/* ═══════════════════════════════════════════════════════════
   Theme + Accent settings
   ═══════════════════════════════════════════════════════════ */
const ACCENTS = ['gold', 'peach', 'blue', 'green', 'mauve'];

function applyAccent(accent){
  if(!ACCENTS.includes(accent)) accent = 'gold';
  document.body.dataset.accent = accent;
}

function applyTheme(mode){
  if(mode === 'light'){
    isLight = true;
    document.body.classList.add('light');
  } else {
    isLight = false;
    document.body.classList.remove('light');
  }
  if(typeof updateThemeToggleIcon === 'function') updateThemeToggleIcon();
  updateThemeColorMeta();
}

function setThemeMode(mode){
  applyTheme(mode);
  store.setMeta('theme', mode === 'light' ? 'light' : 'dark');
  updateSettingsUI();
}

function setAccent(accent){
  if(!ACCENTS.includes(accent)) accent = 'gold';
  applyAccent(accent);
  store.setMeta('accent', accent);
  updateThemeColorMeta();
  updateSettingsUI();
}

function openSettings(){
  const menuOverlay = document.querySelector('.menu-overlay.open');
  if(menuOverlay) menuOverlay.classList.remove('open');

  updateSettingsUI();
  const ov = document.getElementById('ov-settings');
  if(ov){
    ov.classList.add('open');
    document.body.classList.add('modal-open');
  }
}

function closeSettings(){
  const ov = document.getElementById('ov-settings');
  if(ov){
    ov.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
}

function updateSettingsUI(){
  const theme = document.body.classList.contains('light') ? 'light' : 'dark';
  const accent = document.body.dataset.accent || 'gold';

  document.querySelectorAll('#ov-settings [data-theme-btn]').forEach(btn => {
    btn.classList.toggle('on', btn.getAttribute('data-theme-btn') === theme);
  });

  document.querySelectorAll('#ov-settings [data-accent-btn]').forEach(btn => {
    btn.classList.toggle('on', btn.getAttribute('data-accent-btn') === accent);
  });
}

window.setThemeMode = setThemeMode;
window.setAccent = setAccent;
window.openSettings = openSettings;
window.closeSettings = closeSettings;

/* Settings chips — one click handler, selection always follows real state */
document.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-accent-btn], [data-theme-btn]');
  if(!chip) return;
  if(chip.hasAttribute('data-accent-btn')){
    setAccent(chip.getAttribute('data-accent-btn'));
  } else {
    setThemeMode(chip.getAttribute('data-theme-btn'));
  }
  updateSettingsUI();
});

/* ═══════════════════════════════════════════════════════════
Attribution footer (v2) — appended into the Settings modal body
every time it opens. Append-only: safe even if an older
injectAttribution exists (this one wins).
═══════════════════════════════════════════════════════════ */
window.injectAttribution = function(){
  const ov = document.getElementById('ov-settings');
  if(!ov) return;
  if(ov.querySelector('.settings-attribution')) return;
  const body = ov.querySelector('.mb') || ov.querySelector('.modal-body') || ov.querySelector('.modal-box') || ov;
  const footer = document.createElement('div');
  footer.className = 'settings-attribution';
  footer.style.cssText = 'margin-top:18px; padding-top:14px; border-top:1px solid var(--border); font-size:11px; color:var(--text3); line-height:1.7; text-align:center; direction:ltr;';
  footer.innerHTML =
    '<strong style="color:var(--text2); display:block; margin-bottom:6px; letter-spacing:.05em; text-transform:uppercase;">Attribution & Sources</strong>' +
    'Adhkar: <a href="https://sunnah.com/hisn" target="_blank" rel="noopener" style="color:var(--accent); text-decoration:none;">Hisn al-Muslim</a> · ' +
    'Prayer: <a href="https://aladhan.com" target="_blank" rel="noopener" style="color:var(--accent); text-decoration:none;">Aladhan API</a><br>' +
    'Palette: <a href="https://catppuccin.com" target="_blank" rel="noopener" style="color:var(--accent); text-decoration:none;">Catppuccin</a> · ' +
    'Fonts: Amiri & Tajawal (OFL)<br>' +
    'Icons: Lucide (ISC) · PDF: PDF.js (Apache 2.0)<br>' +
    '<span style="opacity:.6; margin-top:8px; display:block; font-style:italic;">Built for personal and community use.</span>';
  body.appendChild(footer);
};
(function(){
  const orig = window.openSettings;
  if(typeof orig === 'function'){
    window.openSettings = function(){
      const r = orig.apply(this, arguments);
      try{ window.injectAttribution(); }catch(e){ console.warn('[attrib]', e); }
      return r;
    };
  }
})();