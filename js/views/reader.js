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
let _readerRenderedPages = new Set();   /* in scroll mode, which pages are rendered */
let _readerObserver = null;      /* IntersectionObserver for scroll mode */
let _readerAutoSaveTimer = null;
let _readerBookmarked = false;
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

  /* Show the overlay in loading state */
  ensureReaderOverlay();
  $('reader-overlay').classList.add('open');
  lockBody();
  renderReaderLoading();

  try{
    /* Load PDF */
    _readerPdf = await loadPdfDocument(bookId);
    _readerTotalPages = _readerPdf.numPages;

    /* Load progress + bookmarks */
    await loadReadingProgress();
    await loadBookmarks();

    /* Restore last page */
    const progress = getBookProgress(bookId);
    if(progress && progress.page > 1){
      _readerCurrentPage = Math.min(progress.page, _readerTotalPages);
    } else {
      _readerCurrentPage = 1;
    }

    /* Load TOC (optional) */
    _readerToc = await getPdfOutline(_readerPdf);

    /* Render main UI */
    renderReaderUI();

    /* Render pages */
    await renderReaderContent();

    /* Auto-open TOC sidebar on desktop if available */
    if(_readerToc && _readerToc.length > 0 && window.innerWidth > 700){
      setTimeout(() => toggleReaderSidebar('toc'), 400);
    }

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
      <button class="reader-icon-btn" onclick="closeReader()" title="Close">✕</button>
      <div class="reader-title" id="reader-title"></div>
      <div class="reader-topbar-actions">
        <button class="reader-icon-btn" id="reader-bookmark-btn" onclick="toggleReaderBookmark()" title="Bookmark">☆</button>
        <button class="reader-icon-btn" onclick="toggleReaderSettings()" title="Settings">⚙</button>
        <button class="reader-icon-btn" id="reader-fullscreen-btn" onclick="toggleReaderFullscreen()" title="Full screen">⛶</button>
      </div>
    </div>

    <div class="reader-body" id="reader-body"></div>

    <div class="reader-bottombar" id="reader-bottombar">
      <button class="reader-icon-btn" onclick="readerPrevPage()" title="Previous">‹</button>
      <div class="reader-page-info" id="reader-page-info"></div>
      <button class="reader-icon-btn" onclick="readerNextPage()" title="Next">›</button>
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

      ${_readerToc && _readerToc.length ? `
      <div class="reader-setting-group">
        <button class="reader-setting-btn wide" onclick="toggleReaderSidebar()">📑 Table of contents</button>
      </div>` : ''}

      <div class="reader-setting-group">
        <button class="reader-setting-btn wide" onclick="toggleReaderSidebar()">📄 Page thumbnails</button>
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
      <div style="font-size:40px;margin-bottom:12px">📕</div>
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

  /* Bookmark state */
  updateReaderBookmarkBtn();

  /* Mode button states */
  document.querySelectorAll('.reader-setting-btn[data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === _readerMode);
  });

  /* Show bars */
  $('reader-bottombar').style.display = 'flex';
  $('reader-topbar').style.display = 'flex';
}

function updateReaderBookmarkBtn(){
  const btn = $('reader-bookmark-btn');
  if(!btn) return;
  const isBm = isBookPageBookmarked(_readerBookId, _readerCurrentPage);
  btn.textContent = isBm ? '★' : '☆';
  btn.style.color = isBm ? '#e8c97a' : '';
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

  /* Compute page width for canvas rendering */
  const width = Math.min(container.clientWidth || 700, 900);

  /* Render every page as a canvas container, in order */
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

  /* If restoring to a page > 1, pre-render pages 1..target so the
     container's height is correct and the target is at the right position. */
  if(_readerCurrentPage > 1){
    for(let i = 1; i <= _readerCurrentPage; i++){
      const wrap = $(`reader-page-${i}`);
      if(wrap){
        await renderScrollPage(i, wrap, width);
        _readerRenderedPages.add(i);
      }
    }
    /* Now scroll to the target */
    const target = $(`reader-page-${_readerCurrentPage}`);
    if(target){
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    /* Wait for layout to settle, then flip the flag */
    setTimeout(() => {
      _readerScrolledToRestore = true;
    }, 300);
  } else {
    /* Starting at page 1 — nothing to restore, unlock immediately */
    _readerScrolledToRestore = true;
  }

  /* Start observing other pages lazily */
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

      /* Render when visible */
      if(entry.isIntersecting && !_readerRenderedPages.has(pageNum)){
        renderScrollPage(pageNum, entry.target, pageWidth);
        _readerRenderedPages.add(pageNum);
      }

         /* Update current page indicator when scrolled into view significantly.
         Skip until restore scroll has finished — otherwise we'd overwrite
         the saved page with page 1 immediately after opening. */
      if(entry.isIntersecting && entry.intersectionRatio > 0.4){
        if(!_readerScrolledToRestore) return;   /* still restoring */
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
  /* Save progress before closing */
  if(_readerBookId && _readerCurrentPage){
    saveBookProgress(_readerBookId, _readerCurrentPage, _readerTotalPages);
  }

  /* Cleanup timers + observers */
  if(_readerObserver){ _readerObserver.disconnect(); _readerObserver = null; }
  if(_readerAutoSaveTimer){ clearTimeout(_readerAutoSaveTimer); _readerAutoSaveTimer = null; }

  /* Hide overlay + unlock body */
  const el = $('reader-overlay');
  if(el) el.classList.remove('open');
  unlockBody();

  /* Reset state */
  _readerBookId = null;
  _readerPdf = null;
  _readerTotalPages = 0;
  _readerCurrentPage = 1;
  _readerRenderedPages.clear();
  _readerScrolledToRestore = true;

  /* Refresh the book list to show updated progress */
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

/* ── Auto-save progress (throttled) ── */
function scheduleAutoSave(){
  /* Don't save until we've finished restoring position */
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

  /* Update button states */
  document.querySelectorAll('.reader-setting-btn[data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  /* Re-render content in new mode, preserving current page */
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
    /* Redraw visible pages at the new zoom */
    _readerRenderedPages.clear();
    const width = Math.min($('reader-scroll').clientWidth || 700, 900);
    const visiblePages = [];
    document.querySelectorAll('.reader-page-wrap').forEach(el => {
      if(el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < window.innerHeight){
        visiblePages.push(el.dataset.page);
      }
    });
    /* Also redraw pages around current page to avoid blanks */
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
async function toggleReaderBookmark(){
  if(!_readerBookId) return;
  await toggleBookBookmark(_readerBookId, _readerCurrentPage);
  updateReaderBookmarkBtn();
  const isBm = isBookPageBookmarked(_readerBookId, _readerCurrentPage);
  toast(isBm
    ? `★ Bookmarked page ${_readerCurrentPage}`
    : `☆ Removed bookmark for page ${_readerCurrentPage}`);
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR — thumbnails or TOC
   ═══════════════════════════════════════════════════════════ */
let _sidebarOpen = false;
let _sidebarMode = 'thumbs';   /* 'thumbs' | 'toc' */

async function toggleReaderSidebar(mode){
  mode = mode || _sidebarMode;
  const sb = $('reader-sidebar');
  if(!sb) return;

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
  sb.innerHTML = `<div class="reader-sidebar-title">Pages</div>
    <div class="reader-thumbs" id="reader-thumbs"></div>`;
  const host = $('reader-thumbs');

  /* Only render thumbnails lazily — generate as user scrolls the sidebar too */
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

  /* Scroll to current page thumbnail */
  setTimeout(() => {
    const current = host.querySelector('.reader-thumb.current');
    if(current) current.scrollIntoView({ block: 'center' });
  }, 100);
}

function renderReaderToc(){
  const sb = $('reader-sidebar');
  sb.innerHTML = `<div class="reader-sidebar-title">Table of contents</div>
    <div class="reader-toc" id="reader-toc"></div>`;
  const host = $('reader-toc');

  function renderItems(items, depth){
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'reader-toc-item';
      row.style.paddingLeft = (12 + depth * 16) + 'px';
      row.textContent = item.title;
      row.onclick = async () => {
        try{
          /* Resolve destination to page number */
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
    const btn = $('reader-fullscreen-btn');
    if(btn) btn.textContent = '⤡';
  } else {
    if(document.exitFullscreen) document.exitFullscreen().catch(() => {});
    const btn = $('reader-fullscreen-btn');
    if(btn) btn.textContent = '⛶';
  }
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
   FLIP MODE GESTURES — swipe left/right + tap to toggle controls
   ═══════════════════════════════════════════════════════════ */
function setupFlipGestures(){
  const body = $('reader-body');
  if(!body) return;

  let startX = 0, startY = 0, startTime = 0;

  body.onclick = (e) => {
    /* Don't toggle on button taps */
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

    /* Tap detection */
    if(Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 300){
      toggleReaderControls();
      return;
    }

    /* Swipe detection — horizontal dominant */
    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 700){
      /* RTL support: swipe right = next page in Arabic books? Most PDFs
         are laid out LTR (numbered pages), so right = prev, left = next.
         We keep LTR for simplicity. */
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
document.addEventListener('fullscreenchange', () => {
  const btn = $('reader-fullscreen-btn');
  if(btn) btn.textContent = document.fullscreenElement ? '⤡' : '⛶';
});