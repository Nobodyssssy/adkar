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

  ensureReaderOverlay();
  $('reader-overlay').classList.add('open');
  lockBody();

  /* Reset the pin button state — ensures a fresh pin state for the new book */
  const pinBtn = $('reader-bookmark-btn');
  if(pinBtn){
    pinBtn.classList.remove('pinned');
    pinBtn.style.color = '';
  }

  renderReaderLoading();
  try{
    _readerPdf = await loadPdfDocument(bookId);
    _readerTotalPages = _readerPdf.numPages;

    await loadReadingProgress();
    await loadBookmarks();

    const progress = getBookProgress(bookId);
    if(progress && progress.page > 1){
      _readerCurrentPage = Math.min(progress.page, _readerTotalPages);
    } else {
      _readerCurrentPage = 1;
    }

    _readerToc = await getPdfOutline(_readerPdf);

    renderReaderUI();
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
  if($('reader-overlay')) return;

  const el = document.createElement('div');
  el.className = 'reader-overlay';
  el.id = 'reader-overlay';
  el.innerHTML = `
    <div class="reader-topbar" id="reader-topbar">
      <div class="reader-topbar-actions">
        <button class="reader-icon-btn" id="reader-sidebar-btn" onclick="toggleReaderSidebar()" title="Contents" data-icon="panel-left"><span class="btn-icon"></span></button>
        <button class="reader-icon-btn" id="reader-bookmark-btn" onclick="toggleReaderPin()" title="Pin to Continue reading" data-icon="bookmark"><span class="btn-icon"></span></button>
        <button class="reader-icon-btn" onclick="toggleReaderSettings()" title="Settings" data-icon="sliders"><span class="btn-icon"></span></button>
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
  $('reader-body').innerHTML = `
    <div class="reader-loading">
      <div class="prayer-spinner"></div>
      <div>Loading book…</div>
    </div>`;
  $('reader-bottombar').style.display = 'none';
  $('reader-topbar').style.display = 'flex';
  $('reader-title').textContent = getBookById(_readerBookId)?.titleAr || 'Loading';
}

function renderReaderError(msg){
  $('reader-body').innerHTML = `
    <div class="reader-error">
      <div style="font-size:40px;margin-bottom:12px">${icon('book-open', 40)}</div>
      <div style="font-weight:700;margin-bottom:6px">Could not open book</div>
      <div style="font-size:12px;color:var(--text3)">${esc(msg)}</div>
      <button class="btn-cancel" style="margin-top:16px" onclick="closeReader()">Close</button>
    </div>`;
  $('reader-bottombar').style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════
   Main UI render
   ═══════════════════════════════════════════════════════════ */
function renderReaderUI(){
  const book = getBookById(_readerBookId);

  $('reader-title').textContent = book?.titleAr || '';
  $('reader-page-info').textContent = `${_readerCurrentPage} / ${_readerTotalPages}`;
  $('reader-jump-input').max = _readerTotalPages;
  $('reader-jump-input').value = _readerCurrentPage;

  updateReaderBookmarkBtn();

  document.querySelectorAll('.reader-setting-btn[data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === _readerMode);
  });

  $('reader-bottombar').style.display = 'flex';
  $('reader-topbar').style.display = 'flex';
}

function updateReaderBookmarkBtn(){
  const btn = $('reader-bookmark-btn');
  if(!btn) return;
  const starred = _bookmarks?.['_pinned'] || [];
  const isPinned = starred.includes(_readerBookId);
  btn.classList.toggle('pinned', isPinned);
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
    wrap.style.minHeight = '200px';

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
   BOOKMARK (Pin)
   ═══════════════════════════════════════════════════════════ */
async function toggleReaderPin(){
  if(!_readerBookId) return;
  await loadBookmarks();

  if(!_bookmarks) _bookmarks = {};
  if(!Array.isArray(_bookmarks['_pinned'])) _bookmarks['_pinned'] = [];

  const starred = _bookmarks['_pinned'];
  const idx = starred.indexOf(_readerBookId);
  const isPinned = idx >= 0;

  if(isPinned){
    starred.splice(idx, 1);
  } else {
    starred.push(_readerBookId);
  }

  await store.setMeta('books-bookmarks', _bookmarks);

  updateReaderBookmarkBtn();

  const book = getBookById(_readerBookId);
  toast(isPinned
    ? `Unpinned "${book?.titleAr || 'book'}"`
    : `Pinned "${book?.titleAr || 'book'}" to Continue reading`);
}

function toggleReaderBookmark(){ return toggleReaderPin(); }

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