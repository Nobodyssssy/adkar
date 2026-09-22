'use strict';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Books â€” helpers
   â€¢ Search by Arabic/English title, author, description
   â€¢ Filter by category
   â€¢ Resolve file paths to URLs
   â€¢ Reading progress + bookmarks (via store.meta)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const BOOKS_BASE_PATH = 'assets/books/';

/* â”€â”€ Basic lookups â”€â”€ */
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

/* â”€â”€ Search â”€â”€ */
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

/* â”€â”€ Path resolution â”€â”€ */
function resolveBookPath(book){
  if(!book || !book.file) return '';
  return BOOKS_BASE_PATH + book.file.split('/').map(encodeURIComponent).join('/');
}

/* â”€â”€ Category counts â”€â”€ */
function getCategoryBookCounts(){
  const counts = {};
  BOOK_CATEGORIES.forEach(c => {
    counts[c.id] = BOOKS.filter(b => b.category === c.id).length;
  });
  return counts;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Reading progress â€” IndexedDB via store.meta
   Shape: { [bookId]: { page, totalPages, lastRead } }
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Bookmarks â€” per book, list of page numbers
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

let _bookmarks = null;

async function loadBookmarks(){
  if(_bookmarks) return _bookmarks;
  const stored = await store.getMeta('books-bookmarks');
  _bookmarks = (stored && typeof stored === 'object') ? stored : {};
  /* One-shot cleanup: the pin feature was removed. Delete any residual `_pinned`. */
  if('_pinned' in _bookmarks){
    delete _bookmarks['_pinned'];
    await store.setMeta('books-bookmarks', _bookmarks);
  }
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


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Beginner path â€” curated reading order for newcomers.
   Virtual category id: '__beginner' (double underscore = not a real category).
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const BEGINNER_BOOK_IDS = [
  'quran-tadabbur-amal',
  'tafsir-sadi',
  'jazariyyah',
  'bukhari-maktabah',
  'sharh-arbaeen-nawawi',
  'riyad-salihin',
  'tawhid-haqq-allah',
  'ma-la-yasa-u-jahl',
  'manhaj-salikin',
  'hisn-muslim',
];

const BEGINNER_BOOK_NOTES = {
  'quran-tadabbur-amal':  { ar: 'Ø§Ø¨Ø¯Ø£ Ù…Ù† Ù‡Ù†Ø§: ÙƒÙŠÙ ØªØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù‚Ø±Ø¢Ù† ØªØ¯Ø¨Ø±Ù‹Ø§ ÙˆØ¹Ù…Ù„Ù‹Ø§.', en: 'Start here: how to engage the Quran with reflection and action.' },
  'tafsir-sadi':          { ar: 'ØªÙØ³ÙŠØ± Ù…Ø®ØªØµØ± ÙˆØ§Ø¶Ø­ ØªÙ‚Ø±Ø¤Ù‡ ÙŠÙˆÙ…ÙŠÙ‹Ø§ Ù…Ø¹ ÙˆØ±Ø¯Ùƒ.', en: 'A short, clear tafsir to read daily alongside your portion.' },
  'jazariyyah':           { ar: 'Ø£Ø³Ø§Ø³ÙŠØ§Øª Ø§Ù„ØªØ¬ÙˆÙŠØ¯ Ù‚Ø¨Ù„ Ø§Ù„ØªØ¹Ù…Ù‚ ÙÙŠ Ø§Ù„ØªÙ„Ø§ÙˆØ©.', en: 'Tajweed basics before deeper recitation.' },
  'bukhari-maktabah':     { ar: 'Ø£Ø³Ø§Ø³ Ø§Ù„Ø³Ù†Ø©: ØµØ­ÙŠØ­ Ø§Ù„Ø¨Ø®Ø§Ø±ÙŠ.', en: 'The foundation of Sunnah: Sahih al-Bukhari.' },
  'sharh-arbaeen-nawawi': { ar: 'Ø£Ø±Ø¨Ø¹ÙˆÙ† Ø­Ø¯ÙŠØ«Ù‹Ø§ Ù…Ø¹ Ø´Ø±Ø­ Ù…Ø¨Ø³Ø·: Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø­Ø¯ÙŠØ«.', en: 'Forty hadiths with simple commentary: the gateway to hadith.' },
  'riyad-salihin':        { ar: 'Ø­Ø¯ÙŠØ« ÙŠÙˆÙ…ÙŠ ÙŠØ¨Ù†ÙŠ Ø¹Ø§Ø¯Ø© Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©.', en: 'A daily hadith to build a steady habit.' },
  'tawhid-haqq-allah':    { ar: 'Ø£ØµÙ„ Ø§Ù„ØªÙˆØ­ÙŠØ¯: Ø­Ù‚ Ø§Ù„Ù„Ù‡ Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ø¨ÙŠØ¯.', en: 'The core of monotheism: the right of Allah upon His servants.' },
  'ma-la-yasa-u-jahl':    { ar: 'Ù…Ø§ Ù„Ø§ ÙŠØ³Ø¹ Ø§Ù„Ù…Ø³Ù„Ù… Ø¬Ù‡Ù„Ù‡: Ø£Ø³Ø§Ø³ÙŠØ§Øª Ø§Ù„Ø¹Ø¨Ø§Ø¯Ø© ÙˆØ§Ù„Ø£Ø®Ù„Ø§Ù‚.', en: 'Essentials of worship and manners every Muslim must know.' },
  'manhaj-salikin':       { ar: 'Ù…Ù„Ø®Øµ ÙÙ‚Ù‡ÙŠ ÙˆØ§Ø¶Ø­ Ù„Ù„Ø³Ø§Ù„Ùƒ Ø§Ù„Ù…Ø¨ØªØ¯Ø¦.', en: 'A clear fiqh summary for the beginner.' },
  'hisn-muslim':          { ar: 'ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù…Ù„ÙŠ: Ø£Ø°ÙƒØ§Ø± Ø§Ù„ÙŠÙˆÙ… ÙˆØ§Ù„Ù„ÙŠÙ„Ø©.', en: 'Practical application: daily and nightly adhkar.' },
};

function isBeginnerCategoryId(id){
  return id === '__beginner';
}

function getBeginnerBooks(){
  return BEGINNER_BOOK_IDS
    .map(id => getBookById(id))
    .filter(Boolean);
}

function getBeginnerBookNote(bookId){
  const n = BEGINNER_BOOK_NOTES[bookId];
  if(!n) return null;
  const lang = (typeof _booksLang === 'string') ? _booksLang : 'ar';
  return lang === 'ar' ? n.ar : n.en;
}
