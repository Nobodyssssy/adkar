'use strict';

/* ═══════════════════════════════════════════════════════════
   Books — helpers
   • Search by Arabic/English title, author, description
   • Filter by category
   • Resolve file paths to URLs
   • Reading progress + bookmarks (via store.meta)
   ═══════════════════════════════════════════════════════════ */

const BOOKS_BASE_PATH = 'assets/books/';

/* ── Basic lookups ── */
function getBookById(id){
  return BOOKS.find(b => b.id === id) || null;
}

function getBooksByCategory(categoryId){
  if(!categoryId || categoryId === 'all') return BOOKS;
  return BOOKS.filter(b => b.category === categoryId);
}

function getCategoryById(id){
  return BOOK_CATEGORIES.find(c => c.id === id) || null;
}

/* ── Search ── */
function searchBooks(query){
  const q = (query || '').trim();
  if(!q) return BOOKS;

  const nqAr = (typeof normalizeAr === 'function') ? normalizeAr(q) : q.toLowerCase();
  const nqEn = (typeof normalizeEn === 'function') ? normalizeEn(q) : q.toLowerCase();

  return BOOKS.filter(b => {
    const hayAr = [b.titleAr, b.author, b.descriptionAr || ''].join(' ');
    const hayEn = [b.titleEn || '', b.authorEn || '', b.descriptionEn || ''].join(' ');
    const normAr = (typeof normalizeAr === 'function') ? normalizeAr(hayAr) : hayAr.toLowerCase();
    const normEn = (typeof normalizeEn === 'function') ? normalizeEn(hayEn) : hayEn.toLowerCase();

    return (nqAr && normAr.includes(nqAr)) || (nqEn && normEn.includes(nqEn));
  });
}

/* ── Path resolution ── */
function resolveBookPath(book){
  if(!book || !book.file) return '';
  return BOOKS_BASE_PATH + book.file.split('/').map(encodeURIComponent).join('/');
}

/* Path to a rasterized page JPG for books with book.rasterPages set.
   Example: assets/books/<cat>/<file-stem>-pages/page-001.jpg */
function resolveRasterPagePath(book, pageNum){
  if(!book || !book.file || !book.rasterPages) return '';
  const pdfPath = book.file.replace(/\.pdf$/i, '');
  const pageName = 'page-' + String(pageNum).padStart(3, '0') + '.jpg';
  return BOOKS_BASE_PATH
    + (pdfPath + '-pages/' + pageName).split('/').map(encodeURIComponent).join('/');
}

/* ── Category counts ── */
function getCategoryBookCounts(){
  const counts = {};
  BOOK_CATEGORIES.forEach(c => {
    counts[c.id] = BOOKS.filter(b => b.category === c.id).length;
  });
  return counts;
}

/* ═══════════════════════════════════════════════════════════
   Reading progress — IndexedDB via store.meta
   Shape: { [bookId]: { page, totalPages, lastRead } }
   ═══════════════════════════════════════════════════════════ */

let _readingProgress = null;

async function loadReadingProgress(){
  if(_readingProgress) return _readingProgress;
  const stored = await store.getMeta('books-progress');
  _readingProgress = (stored && typeof stored === 'object') ? stored : {};
  return _readingProgress;
}

function getBookProgress(bookId){
  if(!_readingProgress) return null;
  return _readingProgress[bookId] || null;
}

async function saveBookProgress(bookId, page, totalPages){
  if(!_readingProgress) await loadReadingProgress();
  _readingProgress[bookId] = {
    page: page || 1,
    totalPages: totalPages || null,
    lastRead: Date.now(),
  };
  await store.setMeta('books-progress', _readingProgress);
}

async function clearBookProgress(bookId){
  if(!_readingProgress) await loadReadingProgress();
  delete _readingProgress[bookId];
  await store.setMeta('books-progress', _readingProgress);
}

/* ═══════════════════════════════════════════════════════════
   Bookmarks — per book, list of page numbers
   ═══════════════════════════════════════════════════════════ */

let _bookmarks = null;

async function loadBookmarks(){
  if(_bookmarks) return _bookmarks;
  const stored = await store.getMeta('books-bookmarks');
  _bookmarks = (stored && typeof stored === 'object') ? stored : {};
  return _bookmarks;
}

function getBookBookmarks(bookId){
  if(!_bookmarks) return [];
  return _bookmarks[bookId] || [];
}

async function toggleBookBookmark(bookId, page){
  if(!_bookmarks) await loadBookmarks();
  const list = _bookmarks[bookId] || [];
  const idx = list.indexOf(page);
  if(idx >= 0) list.splice(idx, 1);
  else list.push(page);
  list.sort((a, b) => a - b);
  _bookmarks[bookId] = list;
  await store.setMeta('books-bookmarks', _bookmarks);
  return list;
}

function isBookPageBookmarked(bookId, page){
  if(!_bookmarks) return false;
  return (_bookmarks[bookId] || []).includes(page);
}