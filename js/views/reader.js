'use strict';

/* ═══════════════════════════════════════════════════════════
   Reader view — Z-library style
   • Continuous scroll mode (default)
   • Flip mode (one page at a time)
   • Zoom, bookmarks, TOC, progress
   ═══════════════════════════════════════════════════════════ */

/* ── Reader state ── */
let _readerBookId = null;
let _readerPdf = null;
let _readerTotalPages = 0;
let _readerCurrentPage = 1;
let _readerMode = 'scroll';      /* 'scroll' | 'flip' */
let _readerZoom = 1;             /* 1 = fit width */
let _readerControlsVisible = true;
let _readerToc = [];
let _readerRenderedPages = new Set();
let _readerObserver = null;
let _readerAutoSaveTimer = null;
let _readerScrolledToRestore = false;
let _readerTheme = 'light';
let _readerBlobUrl = null;

/* ═══════════════════════════════════════════════════════════
   Open / close
   ═══════════════════════════════════════════════════════════ */
async function openReader(bookId){
  const book = getBookById(bookId);
  if(!book) return;

  _readerBookId = bookId;
  _readerMode = 'scroll';
  _readerZoom = 1;
  _readerCurrentPage = 1;
  _readerRenderedPages.clear();
  _readerScrolledToRestore = false;
  _readerTheme = 'light';

  ensureReaderOverlay();
  $('reader-overlay').classList.add('open');
  lockBody();

  renderReaderLoading();
  try{
    let overrideUrl = null;
    if(book.isLocal){
      overrideUrl = await getLocalBookBlobUrl(bookId);
      if(!overrideUrl) throw new Error('Local book not found');
      _readerBlobUrl = overrideUrl;
    }
    _readerPdf = await loadPdfDocument(bookId, overrideUrl);
    _readerTotalPages = _readerPdf.numPages;
    _readerToc = await getPdfOutline(_readerPdf);

    await loadReadingProgress();
    await loadBookmarks();

    const progress = getBookProgress(bookId);
    if(progress && progress.page > 1){
      _readerCurrentPage = Math.min(progress.page, _readerTotalPages);
    } else {
      _readerCurrentPage = 1;
    }

    renderReaderUI();
    updateReaderDarkModeBtn();
    applyReaderTheme();
    await renderReaderContent();

  }catch(err){
    console.error('[reader]', err);
    renderReaderError(err.message);
  }
}

/* ═══════════════════════════════════════════════════════════
   Overlay structure
   ═══════════════════════════════════════════════════════════ */
function ensureReaderOverlay(){
  const existing = $('reader-overlay');
  if(existing){
    /* Rebuild if the cached overlay predates the dark-mode button */
    if(existing.querySelector('#reader-darkmode-btn')){
      return;
    }
    existing.remove();
  }

  const el = document.createElement('div');
  el.className = 'reader-overlay';
  el.id = 'reader-overlay';
  el.innerHTML = `
    <div class="reader-topbar" id="reader-topbar">
      <div class="reader-topbar-actions">
        <button class="reader-icon-btn" id="reader-sidebar-btn" onclick="toggleReaderSidebar()" title="Contents" data-icon="panel-left"><span class="btn-icon"></span></button>
        <button class="reader-icon-btn" id="reader-page-bookmark-btn" onclick="togglePageBookmark()" title="Bookmark this page" aria-label="Bookmark this page"><span class="btn-icon"></span></button>
        <button class="reader-icon-btn" id="reader-bookmarks-list-btn" onclick="openReaderBookmarksPanel()" title="Bookmarks list" aria-label="Bookmarks list" data-icon="list"><span class="btn-icon"></span></button>
        <button class="reader-icon-btn" onclick="toggleReaderSettings()" title="Settings" data-icon="sliders"><span class="btn-icon"></span></button>
        <button class="reader-icon-btn" id="reader-darkmode-btn" onclick="toggleReaderDarkMode()" title="Reader theme" aria-label="Reader theme"><span class="btn-icon"></span></button>
        <button class="reader-icon-btn" id="reader-fullscreen-btn" onclick="toggleReaderFullscreen()" title="Full screen" data-icon="maximize"><span class="btn-icon"></span></button>
      </div>
      <div class="reader-title" id="reader-title"></div>
      <button class="reader-icon-btn" onclick="closeReader()" title="Close" data-icon="x"><span class="btn-icon"></span></button>
    </div>

    <div class="reader-body" id="reader-body"></div>

    <div class="reader-bottombar" id="reader-bottombar">
      <button class="reader-icon-btn" onclick="readerPrevPage()" title="Previous" data-icon="chevron-right"><span class="btn-icon"></span></button>
      <div class="reader-page-info" id="reader-page-info"></div>
      <button class="reader-icon-btn" onclick="readerNextPage()" title="Next" data-icon="chevron-left"><span class="btn-icon"></span></button>
    </div>

    <div class="reader-settings-panel" id="reader-settings-panel">
      <div class="reader-setting-group">
        <span class="reader-setting-label">Mode</span>
        <div class="reader-setting-buttons">
          <button class="reader-setting-btn" data-mode="scroll" onclick="setReaderMode('scroll')">Scroll</button>
          <button class="reader-setting-btn" data-mode="flip" onclick="setReaderMode('flip')">Flip</button>
        </div>
      </div>

      <div class="reader-setting-group">
        <span class="reader-setting-label">Zoom</span>
        <div class="reader-setting-buttons">
          <button class="reader-setting-btn" onclick="readerZoomOut()">−</button>
          <button class="reader-setting-btn" onclick="readerZoomReset()">Reset</button>
          <button class="reader-setting-btn" onclick="readerZoomIn()">+</button>
        </div>
      </div>

      <div class="reader-setting-group">
        <button class="reader-setting-btn wide" onclick="toggleReaderSidebar('thumbs')">Page thumbnails</button>
      </div>

      <div class="reader-setting-group">
        <span class="reader-setting-label">Jump to page</span>
        <input type="number" class="reader-page-input" id="reader-jump-input"
               min="1" max="1" onkeydown="if(event.key==='Enter')readerJumpToPage(this.value)">
      </div>
    </div>

    <div class="reader-sidebar" id="reader-sidebar"></div>
  `;
  document.body.appendChild(el);

  if(typeof injectHeaderIcons === 'function'){
    injectHeaderIcons();
  }
}

/* ═══════════════════════════════════════════════════════════
   Loading / error states
   ═══════════════════════════════════════════════════════════ */
function renderReaderLoading(){
  const body = $('reader-body');
  if(body){
    body.innerHTML = `
      <div class="reader-loading">
        <div class="prayer-spinner"></div>
        <div>Loading book...</div>
      </div>`;
  }
  const bot = $('reader-bottombar');
  if(bot) bot.style.display = 'none';
  const top = $('reader-topbar');
  if(top) top.style.display = 'flex';
  const title = $('reader-title');
  if(title) title.textContent = getBookById(_readerBookId)?.titleAr || 'Loading';
}

function renderReaderError(msg){
  const body = $('reader-body');
  if(body){
    body.innerHTML = `
      <div class="reader-error">
        <div style="font-size:40px;margin-bottom:12px">${icon('book-open', 40)}</div>
        <div style="font-weight:700;margin-bottom:6px">Could not open book</div>
        <div style="font-size:12px;color:var(--text3)">${esc(msg)}</div>
        <button class="btn-cancel" style="margin-top:16px" onclick="closeReader()">Close</button>
      </div>`;
  }
  const bot = $('reader-bottombar');
  if(bot) bot.style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════
   Main UI render
   ═══════════════════════════════════════════════════════════ */
function renderReaderUI(){
  const book = getBookById(_readerBookId);

  const title = $('reader-title');
  if(title) title.textContent = book?.titleAr || '';

  const info = $('reader-page-info');
  if(info) info.textContent = `${_readerCurrentPage} / ${_readerTotalPages}`;

  const jump = $('reader-jump-input');
  if(jump){
    jump.max = _readerTotalPages;
    jump.value = _readerCurrentPage;
  }

  updateReaderBookmarkBtn();

  document.querySelectorAll('.reader-setting-btn[data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === _readerMode);
  });

  const bot = $('reader-bottombar');
  if(bot) bot.style.display = 'flex';
  const top = $('reader-topbar');
  if(top) top.style.display = 'flex';
}

function updateReaderBookmarkBtn(){
  const pageBtn = $('reader-page-bookmark-btn');
  if(!pageBtn) return;
  const saved = getBookBookmarks(_readerBookId).includes(_readerCurrentPage);
  pageBtn.classList.toggle('pinned', saved);
  pageBtn.innerHTML = `<span class="btn-icon">${icon(saved ? 'bookmark-filled' : 'bookmark-outline', 18)}</span>`;
  const label = saved ? `Remove bookmark from page ${_readerCurrentPage}` : `Bookmark page ${_readerCurrentPage}`;
  pageBtn.setAttribute('title', label);
  pageBtn.setAttribute('aria-label', label);
}

/* ═══════════════════════════════════════════════════════════
   READER THEME (3 modes, cycled by one button)
   - 'light'    : page shown as-is, dark chrome
   - 'dark'     : page inverted (invert + hue-rotate)
   - 'original' : page un-inverted on white paper, dark chrome
   ═══════════════════════════════════════════════════════════ */
const _READER_THEMES = ['light', 'dark', 'sepia'];

function updateReaderDarkModeBtn(){
  const btn = $('reader-darkmode-btn');
  if(!btn) return;

  /* Button always shows the NEXT mode (click target) */
  const nextIndex = (_READER_THEMES.indexOf(_readerTheme) + 1) % _READER_THEMES.length;
  const nextTheme = _READER_THEMES[nextIndex];

  const iconId =
    nextTheme === 'light' ? 'light-mode' :
    nextTheme === 'dark'  ? 'dark-mode'  :
                            'sepia-mode';

  const label =
    nextTheme === 'light' ? 'Switch to light page' :
    nextTheme === 'dark'  ? 'Switch to dark page'  :
                            'Switch to sepia page';

  btn.innerHTML = `<span class="btn-icon">${icon(iconId, 18)}</span>`;
  btn.setAttribute('title', label);
  btn.setAttribute('aria-label', label);

  applyReaderTheme();
}

function toggleReaderDarkMode(){
  const idx = _READER_THEMES.indexOf(_readerTheme);
  _readerTheme = _READER_THEMES[(idx + 1) % _READER_THEMES.length];
  updateReaderDarkModeBtn();
}

function applyReaderTheme(){
  const root = $('reader-overlay');
  if(!root) return;
  root.classList.toggle('reader-dark',  _readerTheme === 'dark');
  root.classList.toggle('reader-sepia', _readerTheme === 'sepia');
}

/* ═══════════════════════════════════════════════════════════
   Content rendering — dispatch by mode
   ═══════════════════════════════════════════════════════════ */
async function renderReaderContent(){
  if(_readerMode === 'scroll'){
    await renderScrollMode();
  } else {
    await renderFlipMode();
  }
}

/* ═══════════════════════════════════════════════════════════
   SCROLL MODE — all pages stacked in a scroll container
   ═══════════════════════════════════════════════════════════ */
async function renderScrollMode(){
  const body = $('reader-body');
  body.innerHTML = `<div class="reader-scroll" id="reader-scroll"></div>`;
  const container = $('reader-scroll');

  const width = Math.min(container.clientWidth || 700, 900);

  for(let i = 1; i <= _readerTotalPages; i++){
    const wrap = document.createElement('div');
    wrap.className = 'reader-page-wrap';
    wrap.id = `reader-page-${i}`;
    wrap.dataset.page = i;
    wrap.style.aspectRatio = '1 / 1.414';
    const canvas = document.createElement('canvas');
    canvas.className = 'reader-canvas';
    wrap.appendChild(canvas);

    const pageNum = document.createElement('div');
    pageNum.className = 'reader-page-num';
    pageNum.textContent = i;
    wrap.appendChild(pageNum);

    container.appendChild(wrap);
  }

  if(_readerCurrentPage > 1){
    for(let i = 1; i <= _readerCurrentPage; i++){
      const wrap = $(`reader-page-${i}`);
      if(wrap){
        await renderScrollPage(i, wrap, width);
        _readerRenderedPages.add(i);
      }
    }
    const target = $(`reader-page-${_readerCurrentPage}`);
    if(target){
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    setTimeout(() => {
      _readerScrolledToRestore = true;
    }, 300);
  } else {
    _readerScrolledToRestore = true;
  }

  setupScrollObserver(width);
}

async function renderScrollPage(pageNum, wrapEl, width){
  try{
    const canvas = wrapEl.querySelector('canvas');
    const size = await renderPageToCanvas(_readerPdf, pageNum, canvas, width, _readerZoom);
    wrapEl.style.minHeight = size.height + 'px';
  }catch(err){
    console.warn('[reader] page', pageNum, 'failed', err);
  }
}

function setupScrollObserver(pageWidth){
  if(_readerObserver) _readerObserver.disconnect();

  _readerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const pageNum = parseInt(entry.target.dataset.page, 10);

      if(entry.isIntersecting && !_readerRenderedPages.has(pageNum)){
        renderScrollPage(pageNum, entry.target, pageWidth);
        _readerRenderedPages.add(pageNum);
      }

      if(entry.isIntersecting && entry.intersectionRatio > 0.4){
        if(!_readerScrolledToRestore) return;
        _readerCurrentPage = pageNum;
        updateReaderProgressUI();
        scheduleAutoSave();
      }
    });
  }, {
    root: null,
    rootMargin: '300px 0px',
    threshold: [0, 0.4, 1]
  });

  document.querySelectorAll('.reader-page-wrap').forEach(el => _readerObserver.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   FLIP MODE — one page at a time
   ═══════════════════════════════════════════════════════════ */
async function renderFlipMode(){
  const body = $('reader-body');
  body.innerHTML = `<div class="reader-flip"><canvas class="reader-canvas" id="reader-flip-canvas"></canvas></div>`;

  const container = body.querySelector('.reader-flip');
  const width = Math.min(container.clientWidth || 700, 900);

  await renderFlipCurrentPage(width);
  setupFlipGestures();
}

async function renderFlipCurrentPage(width){
  width = width || Math.min($('reader-body').clientWidth || 700, 900);
  const canvas = $('reader-flip-canvas');
  if(!canvas) return;
  try{
    await renderPageToCanvas(_readerPdf, _readerCurrentPage, canvas, width, _readerZoom);
  }catch(err){
    console.warn('[reader] flip page failed', err);
  }
  updateReaderProgressUI();
  scheduleAutoSave();
}

function closeReader(){
  if(_readerBookId && _readerCurrentPage){
    saveBookProgress(_readerBookId, _readerCurrentPage, _readerTotalPages);
  }

  if(_readerObserver){ _readerObserver.disconnect(); _readerObserver = null; }
  if(_readerAutoSaveTimer){ clearTimeout(_readerAutoSaveTimer); _readerAutoSaveTimer = null; }

  /* Close the WASM doc handle to free memory */
  if(_readerPdf && typeof clearPdfCache === 'function'){
    clearPdfCache(_readerBookId);
  }

  if(_readerBlobUrl){
    try{ URL.revokeObjectURL(_readerBlobUrl); }catch(e){}
    _readerBlobUrl = null;
  }

  const el = $('reader-overlay');
  if(el) el.classList.remove('open');
  unlockBody();

  _readerBookId = null;
  _readerPdf = null;
  _readerTotalPages = 0;
  _readerCurrentPage = 1;
  _readerRenderedPages.clear();
  _readerScrolledToRestore = true;

  if(typeof renderBooksGrid === 'function') renderBooksGrid();
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════ */
function readerNextPage(){
  if(_readerCurrentPage >= _readerTotalPages) return;
  _readerCurrentPage++;
  gotoReaderPage(_readerCurrentPage);
}

function readerPrevPage(){
  if(_readerCurrentPage <= 1) return;
  _readerCurrentPage--;
  gotoReaderPage(_readerCurrentPage);
}

function gotoReaderPage(page){
  page = Math.max(1, Math.min(_readerTotalPages, parseInt(page, 10) || 1));
  _readerCurrentPage = page;
  updateReaderProgressUI();
  updateReaderBookmarkBtn();
  scheduleAutoSave();

  if(_readerMode === 'scroll'){
    const target = $(`reader-page-${page}`);
    if(target) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
  } else {
    renderFlipCurrentPage();
  }
}

function readerJumpToPage(val){
  const n = parseInt(val, 10);
  if(Number.isNaN(n)) return;
  gotoReaderPage(n);
  toggleReaderSettings();
}

function updateReaderProgressUI(){
  const info = $('reader-page-info');
  if(info) info.textContent = `${_readerCurrentPage} / ${_readerTotalPages}`;

  const jump = $('reader-jump-input');
  if(jump) jump.value = _readerCurrentPage;

  updateReaderBookmarkBtn();
}

function scheduleAutoSave(){
  if(!_readerScrolledToRestore) return;

  if(_readerAutoSaveTimer) clearTimeout(_readerAutoSaveTimer);
  _readerAutoSaveTimer = setTimeout(() => {
    if(_readerBookId && _readerCurrentPage){
      saveBookProgress(_readerBookId, _readerCurrentPage, _readerTotalPages);
    }
  }, 800);
}

/* ═══════════════════════════════════════════════════════════
   MODE / ZOOM
   ═══════════════════════════════════════════════════════════ */
async function setReaderMode(mode){
  if(mode !== 'scroll' && mode !== 'flip') return;
  if(_readerMode === mode) return;

  _readerMode = mode;
  _readerRenderedPages.clear();

  document.querySelectorAll('.reader-setting-btn[data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  await renderReaderContent();
}

async function readerZoomIn(){
  if(_readerZoom >= 3) return;
  _readerZoom = Math.min(3, _readerZoom + 0.25);
  await refreshReaderPages();
}

async function readerZoomOut(){
  if(_readerZoom <= 0.5) return;
  _readerZoom = Math.max(0.5, _readerZoom - 0.25);
  await refreshReaderPages();
}

async function readerZoomReset(){
  _readerZoom = 1;
  await refreshReaderPages();
}

async function refreshReaderPages(){
  if(_readerMode === 'scroll'){
    _readerRenderedPages.clear();
    const width = Math.min($('reader-scroll').clientWidth || 700, 900);
    const visiblePages = [];
    document.querySelectorAll('.reader-page-wrap').forEach(el => {
      if(el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < window.innerHeight){
        visiblePages.push(el.dataset.page);
      }
    });
    for(let i = Math.max(1, _readerCurrentPage - 2); i <= Math.min(_readerTotalPages, _readerCurrentPage + 2); i++){
      visiblePages.push(String(i));
    }
    for(const p of [...new Set(visiblePages)]){
      const wrap = $(`reader-page-${p}`);
      if(wrap) await renderScrollPage(parseInt(p, 10), wrap, width);
      _readerRenderedPages.add(parseInt(p, 10));
    }
  } else {
    await renderFlipCurrentPage();
  }
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS PANEL
   ═══════════════════════════════════════════════════════════ */
function toggleReaderSettings(){
  const panel = $('reader-settings-panel');
  if(!panel) return;
  panel.classList.toggle('open');
}

/* ═══════════════════════════════════════════════════════════
   BOOKMARK 
   ═══════════════════════════════════════════════════════════ */
async function togglePageBookmark(){
  if(!_readerBookId) return;
  await loadBookmarks();
  await toggleBookBookmark(_readerBookId, _readerCurrentPage);
  updateReaderBookmarkBtn();
  if(typeof updateFavsButton === 'function') updateFavsButton();
  if(typeof refreshFavsMenuCounts === 'function') refreshFavsMenuCounts();
  const has = getBookBookmarks(_readerBookId).includes(_readerCurrentPage);
  toast(has ? `Bookmarked page ${_readerCurrentPage}` : `Removed bookmark on page ${_readerCurrentPage}`);
}

function openReaderBookmarksPanel(){
  if(!_readerBookId) return;
  const sb = $('reader-sidebar');
  if(!sb) return;

  _sidebarOpen = true;
  _sidebarMode = 'bookmarks';
  sb.classList.add('open');
  renderReaderBookmarks();
}

function renderReaderBookmarks(){
  const sb = $('reader-sidebar');
  const list = getBookBookmarks(_readerBookId);

  sb.innerHTML = `
    <div class="reader-sidebar-title">
      <span>Bookmarks</span>
      <button class="reader-sidebar-close" onclick="toggleReaderSidebar()" title="Close" data-icon="x"><span class="btn-icon"></span></button>
    </div>
    <div class="reader-toc" id="reader-bookmarks-list"></div>`;

  const host = $('reader-bookmarks-list');

  if(!list.length){
    host.innerHTML = `<div style="padding:16px;color:var(--text3);font-size:13px">No bookmarks yet. Use the bookmark button above the page to save one.</div>`;
  } else {
    list.forEach(page => {
      const row = document.createElement('div');
      row.className = 'reader-toc-item';
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';

      const label = document.createElement('span');
      label.textContent = `Page ${page}`;
      label.style.cursor = 'pointer';
      label.style.flex = '1';
      label.onclick = () => {
        gotoReaderPage(page);
        if(window.innerWidth < 700) toggleReaderSidebar();
      };

      const del = document.createElement('button');
      del.className = 'reader-icon-btn';
      del.style.padding = '4px 6px';
      del.innerHTML = `<span class="btn-icon">${icon('trash-2', 14)}</span>`;
      del.setAttribute('title', `Remove bookmark on page ${page}`);
      del.setAttribute('aria-label', `Remove bookmark on page ${page}`);
      del.onclick = async (e) => {
        e.stopPropagation();
        await loadBookmarks();
        await toggleBookBookmark(_readerBookId, page);
        renderReaderBookmarks();
        updateReaderBookmarkBtn();
      };

      row.appendChild(label);
      row.appendChild(del);
      host.appendChild(row);
    });
  }

  if(typeof injectHeaderIcons === 'function') injectHeaderIcons();
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR — thumbnails or TOC
   ═══════════════════════════════════════════════════════════ */
let _sidebarOpen = false;
let _sidebarMode = 'thumbs';

async function toggleReaderSidebar(mode){
  const sb = $('reader-sidebar');
  if(!sb) return;

  if(!mode){
    if(_sidebarOpen){
      _sidebarOpen = false;
      sb.classList.remove('open');
      return;
    }
    mode = _sidebarMode || (_readerToc.length ? 'toc' : 'thumbs');
  }

  if(_sidebarOpen && _sidebarMode === mode){
    _sidebarOpen = false;
    sb.classList.remove('open');
    return;
  }

  _sidebarOpen = true;
  _sidebarMode = mode;
  sb.classList.add('open');

  if(mode === 'toc' && _readerToc.length){
    renderReaderToc();
  } else if(mode === 'bookmarks'){
    renderReaderBookmarks();
  } else {
    renderReaderThumbs();
  }
}

async function renderReaderThumbs(){
  const sb = $('reader-sidebar');
  sb.innerHTML = `
    <div class="reader-sidebar-title">
      <span>Pages</span>
      <button class="reader-sidebar-close" onclick="toggleReaderSidebar()" title="Close" data-icon="x"><span class="btn-icon"></span></button>
    </div>
    <div class="reader-thumbs" id="reader-thumbs"></div>`;
  const host = $('reader-thumbs');

  if(typeof injectHeaderIcons === 'function') injectHeaderIcons();

  const THUMB_WIDTH = 80;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if(!entry.isIntersecting) return;
      const el = entry.target;
      if(el.dataset.rendered === '1') return;
      el.dataset.rendered = '1';
      const pageNum = parseInt(el.dataset.page, 10);

      try{
        const page = await _readerPdf.getPage(pageNum);
        const baseVp = page.getViewport({ scale: 1 });
        const scale = THUMB_WIDTH / baseVp.width;
        const vp = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/jpeg', 0.7);
        el.innerHTML = '';
        el.appendChild(img);

        const num = document.createElement('div');
        num.className = 'reader-thumb-num';
        num.textContent = pageNum;
        el.appendChild(num);
      }catch(err){
        console.warn('[reader] thumb', pageNum, 'failed', err);
      }
      observer.unobserve(el);
    });
  }, { root: host, rootMargin: '200px' });

  for(let i = 1; i <= _readerTotalPages; i++){
    const thumb = document.createElement('div');
    thumb.className = 'reader-thumb' + (i === _readerCurrentPage ? ' current' : '');
    thumb.dataset.page = i;
    thumb.onclick = () => {
      gotoReaderPage(i);
      if(window.innerWidth < 700) toggleReaderSidebar();
    };
    host.appendChild(thumb);
    observer.observe(thumb);
  }

  setTimeout(() => {
    const current = host.querySelector('.reader-thumb.current');
    if(current) current.scrollIntoView({ block: 'center' });
  }, 100);
}

function renderReaderToc(){
  const sb = $('reader-sidebar');
  sb.innerHTML = `
    <div class="reader-sidebar-title">
      <span>Contents</span>
      <button class="reader-sidebar-close" onclick="toggleReaderSidebar()" title="Close" data-icon="x"><span class="btn-icon"></span></button>
    </div>
    <div class="reader-toc" id="reader-toc"></div>`;
  const host = $('reader-toc');

  if(typeof injectHeaderIcons === 'function') injectHeaderIcons();

  function renderItems(items, depth){
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'reader-toc-item';
      row.style.paddingLeft = (12 + depth * 16) + 'px';
      row.textContent = item.title;
      row.onclick = async () => {
        try{
          let pageNum = 1;
          if(item.dest){
            const dest = typeof item.dest === 'string'
              ? await _readerPdf.getDestination(item.dest)
              : item.dest;
            if(dest && dest[0]){
              const ref = dest[0];
              if(typeof ref === 'object' && ref.num !== undefined){
                const idx = await _readerPdf.getPageIndex(ref);
                pageNum = idx + 1;
              }
            }
          }
          gotoReaderPage(pageNum);
          if(window.innerWidth < 700) toggleReaderSidebar();
        }catch(err){
          console.warn('[reader] toc jump failed', err);
        }
      };
      host.appendChild(row);
      if(item.items && item.items.length){
        renderItems(item.items, depth + 1);
      }
    });
  }
  renderItems(_readerToc, 0);
}

/* ═══════════════════════════════════════════════════════════
   FULLSCREEN
   ═══════════════════════════════════════════════════════════ */
function toggleReaderFullscreen(){
  const el = $('reader-overlay');
  if(!document.fullscreenElement){
    if(el.requestFullscreen) el.requestFullscreen().catch(() => {});
  } else {
    if(document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
}

function updateReaderFullscreenIcon(){
  const btn = $('reader-fullscreen-btn');
  if(!btn) return;
  btn.innerHTML = `<span class="btn-icon" data-injected="1">${icon(
    document.fullscreenElement ? 'minimize' : 'maximize', 15
  )}</span>`;
}

/* ═══════════════════════════════════════════════════════════
   TOGGLE CONTROLS (tap center)
   ═══════════════════════════════════════════════════════════ */
function toggleReaderControls(){
  const top = $('reader-topbar');
  const bot = $('reader-bottombar');
  _readerControlsVisible = !_readerControlsVisible;
  if(top) top.classList.toggle('hidden', !_readerControlsVisible);
  if(bot) bot.classList.toggle('hidden', !_readerControlsVisible);
}

/* ═══════════════════════════════════════════════════════════
   FLIP MODE GESTURES
   ═══════════════════════════════════════════════════════════ */
function setupFlipGestures(){
  const body = $('reader-body');
  if(!body) return;

  let startX = 0, startY = 0, startTime = 0;

  body.onclick = (e) => {
    if(e.target.closest('.reader-icon-btn')) return;
    toggleReaderControls();
  };

  body.ontouchstart = (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  };

  body.ontouchend = (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const dt = Date.now() - startTime;

    if(Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 300){
      toggleReaderControls();
      return;
    }

    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 700){
      if(dx < 0) readerNextPage();
      else readerPrevPage();
    }
  };
}

/* ═══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  const overlay = $('reader-overlay');
  if(!overlay || !overlay.classList.contains('open')) return;

  switch(e.key){
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
      e.preventDefault();
      readerNextPage();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      readerPrevPage();
      break;
    case 'Home':
      e.preventDefault();
      gotoReaderPage(1);
      break;
    case 'End':
      e.preventDefault();
      gotoReaderPage(_readerTotalPages);
      break;
    case 'Escape':
      e.preventDefault();
      if($('reader-settings-panel')?.classList.contains('open')){
        toggleReaderSettings();
      } else {
        closeReader();
      }
      break;
    case '+':
    case '=':
      e.preventDefault();
      readerZoomIn();
      break;
    case '-':
      readerZoomOut();
      break;
  }
});

/* Sync fullscreen button icon */
document.addEventListener('fullscreenchange', updateReaderFullscreenIcon);