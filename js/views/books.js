'use strict';

/* ═══════════════════════════════════════════════════════════
   Books library view — categories first, drill down to books
   • Landing: category cards (+ continue-reading strip + search)
   • Category: book list for that category
   • Detail: book modal with start/continue
   ═══════════════════════════════════════════════════════════ */

let _booksLang = 'ar';          /* 'ar' | 'en' */
let _booksCategory = null;      /* null = category landing, else category id */
let _booksQuery = '';
let _booksDetailId = null;

/* ═══════════════════════════════════════════════════════════
   Entry / exit
   ═══════════════════════════════════════════════════════════ */
async function openBooksView(){
  await loadReadingProgress();
  await loadBookmarks();          // ← add this line
  _booksQuery = '';
  _booksCategory = null;
  showView('view-books');
  renderBooksGrid();
}

function closeBooksView(){
  /* Smart back: if inside a category, go back one step */
  if(_booksCategory){
    closeBooksCategory();
    return;
  }
  /* Otherwise, exit to home */
  goHome();
}

/* ═══════════════════════════════════════════════════════════
   MAIN RENDER — dispatches to category view or book list
   ═══════════════════════════════════════════════════════════ */
function renderBooksGrid(){
  const host = $('books-body');
  if(!host) return;

  /* Search active → book list (regardless of category) */
  if(_booksQuery.trim()){
    renderBookList(host, searchBooks(_booksQuery), true);
    return;
  }

  /* Category drill-down */
  if(_booksCategory){
    const list = getBooksByCategory(_booksCategory);
    renderBookList(host, list, false);
    return;
  }

  /* Default: category landing */
  renderCategoryLanding(host);
}

/* ═══════════════════════════════════════════════════════════
   LANDING — categories + continue reading + search
   ═══════════════════════════════════════════════════════════ */
function renderCategoryLanding(host){
  const counts = getCategoryBookCounts();
  const recentlyRead = getRecentlyReadBooks(3);
  const total = BOOKS.length;

  host.innerHTML = `
    <div class="books-header">
      <div class="books-title-block">
        <div class="books-title">${_booksLang === 'ar' ? 'المكتبة' : 'Library'}</div>
        <div class="books-subtitle">${_booksLang === 'ar' ? `${total} كتاب` : `${total} books`}</div>
      </div>
      <div class="quote-lang-toggle">
        <button class="quote-lang-btn ${_booksLang==='ar'?'on':''}" onclick="setBooksLang('ar')">عربي</button>
        <button class="quote-lang-btn ${_booksLang==='en'?'on':''}" onclick="setBooksLang('en')">EN</button>
      </div>
    </div>

    <div class="asma-search-wrap">
      <input type="text" id="books-search" class="fi" placeholder="${
        _booksLang === 'ar' ? 'ابحث في الكتب والمؤلفين...' : 'Search books & authors...'
      }" value="${esc(_booksQuery)}" oninput="onBooksSearch(this.value)">
    </div>

    ${recentlyRead.length ? `
      <div class="books-section">
        <div class="books-section-title">${_booksLang === 'ar' ? '📖 متابعة القراءة' : '📖 Continue reading'}</div>
        <div class="continue-strip">
          ${recentlyRead.map(b => continueCardHTML(b)).join('')}
        </div>
      </div>
    ` : ''}

    <div class="books-section">
      <div class="books-section-title">${_booksLang === 'ar' ? '📚 الفئات' : '📚 Categories'}</div>
      <div class="cat-cards-grid">
        ${BOOK_CATEGORIES.map(cat => categoryCardHTML(cat, counts[cat.id] || 0)).join('')}
      </div>
    </div>
  `;
    if(typeof injectHeaderIcons === 'function'){
    setTimeout(() => injectHeaderIcons(), 0);
  }

  /* Attach covers to continue-reading cards */
  if(typeof generateCoversForGrid === 'function'){
    setTimeout(() => generateCoversForGrid(), 50);
  }
}

/* ── Category card ── */
function categoryCardHTML(cat, count){
  const items = BOOKS.filter(b => b.category === cat.id);
  const started = items.filter(b => {
    const p = getBookProgress(b.id);
    return p && p.page > 1;
  }).length;
  const finished = items.filter(b => {
    const p = getBookProgress(b.id);
    return p && p.totalPages && p.page >= p.totalPages;
  }).length;

  const progressLine = _booksLang === 'ar'
    ? `${count} ${count === 1 ? 'كتاب' : 'كتب'}${started ? ` · ${started} قيد القراءة` : ''}`
    : `${count} ${count === 1 ? 'book' : 'books'}${started ? ` · ${started} reading` : ''}`;

  return `
    <div class="cat-card-lg" style="--cc:${cat.color}" onclick="openBooksCategory('${cat.id}')">
      <div class="cat-card-lg-inner">
        <div class="cat-card-lg-ar">${cat.ar}</div>
        <div class="cat-card-lg-divider"></div>
        <div class="cat-card-lg-en">${cat.en}</div>
        <div class="cat-card-lg-count">${progressLine}</div>
      </div>
    </div>
  `;
}

/* ── Continue reading card ── */
function continueCardHTML(b){
  const progress = getBookProgress(b.id);
  const pct = (progress && progress.totalPages)
    ? Math.round(progress.page / progress.totalPages * 100)
    : 0;
  const title = _booksLang === 'ar' ? b.titleAr : (b.titleEn || b.titleAr);

const pinnedIds = (_bookmarks && _bookmarks['_pinned']) || [];
const isPinned = pinnedIds.includes(b.id);

return `
    <div class="continue-card" onclick="openBookDetail('${b.id}')">
      ${isPinned ? `<div class="continue-pin-badge">★</div>` : ''}
      <div class="continue-cover" id="cover-${b.id}">
        <div class="book-cover-placeholder">${icon('book-open', 30)}</div>
      </div>
      <div class="continue-title">${esc(title)}</div>
      <div class="continue-progress-bar">
        <div class="continue-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="continue-progress-text">${pct}%</div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════
   BOOK LIST — inside a category or search results
   ═══════════════════════════════════════════════════════════ */
function renderBookList(host, list, isSearch){
  const cat = isSearch ? null : getCategoryById(_booksCategory);
  const backLabel = _booksLang === 'ar' ? '← الفئات' : '← Categories';
  const title = isSearch
    ? (_booksLang === 'ar' ? 'نتائج البحث' : 'Search results')
    : (_booksLang === 'ar' ? cat.ar : cat.en);
  const subtitle = isSearch
    ? `${list.length}`
    : (_booksLang === 'ar' ? `${list.length} كتاب` : `${list.length} books`);

  host.innerHTML = `
    <div class="books-list-header">
      <div class="books-list-title-wrap">
        <div class="books-list-title">${esc(title)}</div>
        <div class="books-list-sub">${subtitle}</div>
      </div>
      <div class="quote-lang-toggle">
        <button class="quote-lang-btn ${_booksLang==='ar'?'on':''}" onclick="setBooksLang('ar')">عربي</button>
        <button class="quote-lang-btn ${_booksLang==='en'?'on':''}" onclick="setBooksLang('en')">EN</button>
      </div>
    </div>

    <div class="asma-search-wrap">
      <input type="text" id="books-search" class="fi" placeholder="${
        _booksLang === 'ar' ? 'ابحث في الكتب والمؤلفين...' : 'Search books & authors...'
      }" value="${esc(_booksQuery)}" oninput="onBooksSearch(this.value)">
    </div>

    ${list.length === 0
      ? `<div class="adkar-empty">
           <div class="adkar-empty-icon">📚</div>
           <div>${_booksLang === 'ar' ? 'لا توجد نتائج' : 'No results'}</div>
         </div>`
      : `<div class="books-grid">
           ${list.map(b => bookCardHTML(b)).join('')}
         </div>`}
  `;

  if(typeof generateCoversForGrid === 'function'){
    setTimeout(() => generateCoversForGrid(), 50);
  }
}

/* ── Individual book card (used in book list) ── */
function bookCardHTML(b){
  const cat = getCategoryById(b.category);
  const progress = getBookProgress(b.id);
  const isRead = !!progress;
  const isFinished = progress && progress.totalPages && progress.page >= progress.totalPages;

  const title = _booksLang === 'ar' ? b.titleAr : (b.titleEn || b.titleAr);
  const author = _booksLang === 'ar' ? b.author : (b.authorEn || b.author);

  let progressLine = '';
  if(isRead && progress.totalPages){
    const pct = Math.round(progress.page / progress.totalPages * 100);
    progressLine = `
      <div class="book-progress-bar">
        <div class="book-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="book-progress-text">
        ${isFinished
          ? (_booksLang === 'ar' ? '✓ منتهي' : '✓ Finished')
          : (_booksLang === 'ar'
              ? `صفحة ${progress.page} / ${progress.totalPages}`
              : `Page ${progress.page} of ${progress.totalPages}`)}
      </div>`;
  }

  return `<div class="book-card" style="--cc:${cat.color}" onclick="openBookDetail('${b.id}')">
    <div class="book-cover" id="cover-${b.id}">
      <div class="book-cover-placeholder">${icon('book-open', 30)}</div>
    </div>
    <div class="book-info">
      <div class="book-cat-badge" style="background:${cat.color}22;color:${cat.color};border-color:${cat.color}">${_booksLang === 'ar' ? cat.ar : cat.en}</div>
      <div class="book-title">${esc(title)}</div>
      <div class="book-author">${esc(author)}</div>
      ${progressLine}
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */
function getRecentlyReadBooks(limit){
  limit = limit || 3;
  if(!_readingProgress) _readingProgress = {};

  /* Pinned book IDs — books the user starred to pin to Continue reading */
  const pinnedIds = (_bookmarks && _bookmarks['_pinned']) || [];

  /* Combine: pinned (in pin order) + recently-read (unfinished, by lastRead desc) */
  const seen = new Set();
  const result = [];

  /* 1. Pinned books first, in the order they were pinned */
  for(const id of pinnedIds){
    if(seen.has(id)) continue;
    const book = getBookById(id);
    if(book){
      result.push(book);
      seen.add(id);
    }
  }

  /* 2. Recently-read unfinished books, in reverse-chronological order */
  const recent = Object.entries(_readingProgress)
    .filter(([_, p]) => p && p.lastRead && (!p.totalPages || p.page < p.totalPages))
    .sort((a, b) => b[1].lastRead - a[1].lastRead);

  for(const [id] of recent){
    if(result.length >= limit) break;
    if(seen.has(id)) continue;
    const book = getBookById(id);
    if(book){
      result.push(book);
      seen.add(id);
    }
  }

  return result.slice(0, limit);
}

/* ═══════════════════════════════════════════════════════════
   UI handlers
   ═══════════════════════════════════════════════════════════ */
function setBooksLang(lang){
  _booksLang = lang;
  renderBooksGrid();
}

function openBooksCategory(catId){
  _booksCategory = catId;
  _booksQuery = '';
  renderBooksGrid();
}

function closeBooksCategory(){
  _booksCategory = null;
  _booksQuery = '';
  renderBooksGrid();
}

let _booksSearchTimer;
function onBooksSearch(value){
  clearTimeout(_booksSearchTimer);
  _booksQuery = value;
  _booksSearchTimer = setTimeout(() => {
    renderBooksGrid();
    const input = $('books-search');
    if(input){
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, 200);
}

/* ═══════════════════════════════════════════════════════════
   DETAIL MODAL
   ═══════════════════════════════════════════════════════════ */
function openBookDetail(id){
  const b = getBookById(id);
  if(!b) return;
  _booksDetailId = id;

  /* Save scroll position BEFORE locking body */
  window._booksSavedScroll = window.scrollY || window.pageYOffset || 0;

  ensureBookDetailModal();
  renderBookDetail(b);

  $('ov-book-detail').classList.add('open');
  lockBody();
}

function renderBookDetail(b){
  const cat = getCategoryById(b.category);
  const progress = getBookProgress(b.id);
  const isRead = !!progress && progress.page > 1;
  const isFinished = progress && progress.totalPages && progress.page >= progress.totalPages;
  const ar = _booksLang === 'ar';

  const title = ar ? b.titleAr : (b.titleEn || b.titleAr);
  const author = ar ? b.author : (b.authorEn || b.author);
  const description = ar ? b.descriptionAr : (b.descriptionEn || b.descriptionAr);

  $('book-detail-title').innerHTML = esc(title);

  $('book-detail-body').innerHTML = `
    <div class="book-detail-hero">
      <div class="book-detail-cover" id="detail-cover-${b.id}">
        <div class="book-cover-placeholder">${icon('book-open', 30)}</div>
      </div>
      <div class="book-detail-meta">
        <div class="book-cat-badge" style="background:${cat.color}22;color:${cat.color};border-color:${cat.color}">
          ${ar ? cat.ar : cat.en}
        </div>
        <div class="book-detail-author">${esc(author)}</div>
      </div>
    </div>

    <div class="book-detail-desc ${ar?'ar':'en'}">
      ${esc(description)}
    </div>

    ${isRead ? `
      <div class="book-detail-progress">
        <div class="book-progress-bar">
          <div class="book-progress-fill" style="width:${progress.totalPages ? Math.round(progress.page/progress.totalPages*100) : 0}%"></div>
        </div>
        <div class="book-progress-text">
          ${isFinished
            ? (ar ? '✓ انتهيت من هذا الكتاب' : '✓ Finished reading')
            : (ar ? `توقفت عند صفحة ${progress.page}` : `Stopped at page ${progress.page}`)}
        </div>
      </div>` : ''}

    <div class="book-detail-actions">
      <button class="btn-save" style="flex:1;padding:14px;font-size:15px" onclick="readBook('${b.id}')">
        ${isRead
          ? (ar ? '📖 متابعة القراءة' : '📖 Continue reading')
          : (ar ? '📖 ابدأ القراءة' : '📖 Start reading')}
      </button>
    </div>

    ${isRead ? `
      <button class="book-reset-btn" onclick="resetBookProgress('${b.id}')">
        ${ar ? '↺ إعادة تعيين التقدم' : '↺ Reset progress'}
      </button>` : ''}
  `;

  /* Attach cover to the detail view */
  const coverEl = $(`detail-cover-${b.id}`);
  if(coverEl && typeof attachBookCover === 'function'){
    setTimeout(() => attachBookCover(b.id, coverEl), 30);
  }
}

function closeBookDetail(){
  const modal = $('ov-book-detail');
  if(modal) modal.classList.remove('open');
  unlockBody();
  _booksDetailId = null;

  renderBooksGrid();

  requestAnimationFrame(() => {
    const y = window._booksSavedScroll || 0;
    window.scrollTo(0, y);
  });
}

function ensureBookDetailModal(){
  if($('ov-book-detail')) return;

  const modal = document.createElement('div');
  modal.className = 'ov center';
  modal.id = 'ov-book-detail';
  modal.setAttribute('onclick', 'if(event.target===this)closeBookDetail()');
  modal.innerHTML = `
    <div class="modal-box" style="max-width:520px">
      <div class="mh">
        <h2 id="book-detail-title"></h2>
        <button class="btn-close" onclick="closeBookDetail()">✕</button>
      </div>
      <div class="mb" id="book-detail-body"></div>
    </div>`;
  document.body.appendChild(modal);
}

async function resetBookProgress(id){
  const ar = _booksLang === 'ar';
  if(!confirm(ar ? 'هل تريد إعادة تعيين التقدم في هذا الكتاب؟' : 'Reset progress for this book?')) return;
  await clearBookProgress(id);
  const b = getBookById(id);
  if(b) renderBookDetail(b);
  toast(ar ? 'تمت إعادة التعيين' : 'Progress reset');
}

/* ═══════════════════════════════════════════════════════════
   READER LAUNCHER
   ═══════════════════════════════════════════════════════════ */
function readBook(id){
  const b = getBookById(id);
  if(!b) return;

  /* Close the detail modal */
  closeBookDetail();

  /* Open the in-app reader */
  openReader(id);
}