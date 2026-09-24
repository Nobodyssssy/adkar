'use strict';

/* ==========================================================================
   Offline books
   - Dedicated Cache Storage bucket for book PDFs: sahib-books
   - Beginner-path URLs are hardcoded from js/books-data.js so the service
     worker can precache a small subset without resolving Arabic filenames
     at runtime.
   - Everything else is lazy cached on first read.
   ========================================================================== */

const OFFLINE_BOOKS_CACHE = 'sahib-books';
const OFFLINE_BOOKS_BASE  = 'assets/books/';

/* The 10 beginner-path book URLs, resolved at authoring time from
   js/books-data.js. Do not edit by hand without re-checking that file. */
const BEGINNER_BOOK_URLS = {
  'jazariyyah':           'assets/books/1.%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D9%88%D8%B9%D9%84%D9%88%D9%85%D9%87%20-%20Quran%20%26%20Its%20Sciences/Noor-Book.com%20%D8%A7%D9%84%D9%85%D9%82%D8%AF%D9%85%D8%A9%20%D8%A7%D9%84%D8%AC%D8%B2%D8%B1%D9%8A%D8%A9%203%20.pdf',
  'tawhid-haqq-allah':    'assets/books/4.%20%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9%20%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF%20-%20Islamic%20Creed%20%26%20Theology/%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF%20%D8%A7%D9%84%D8%B0%D9%8A%20%D9%87%D9%88%20%D8%AD%D9%82%20%D8%A7%D9%84%D9%84%D9%87%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%B9%D8%A8%D9%8A%D8%AF%20%D9%85%D8%A4%D9%84%D9%81%20%D8%A7%D9%84%D9%83%D8%AA%D8%A7%D8%A8%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%A8%D9%86%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8.pdf',
  'ma-la-yasa-u-jahl':    'assets/books/4.%20%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9%20%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF%20-%20Islamic%20Creed%20%26%20Theology/%D9%85%D8%A7%20%D9%84%D8%A7%20%D9%8A%D8%B3%D8%B9%20%D8%A7%D9%84%D9%85%D8%B3%D9%84%D9%85%20%D8%AC%D9%87%D9%84%D9%87.pdf',
  'manhaj-salikin':       'assets/books/5.%20%D8%A7%D9%84%D9%81%D9%82%D9%87%20%D9%88%D8%A3%D8%B5%D9%88%D9%84%D9%87%20-%20Islamic%20Jurisprudence%20(Fiqh)/%D9%85%D9%86%D9%87%D8%AC%20%D8%A7%D9%84%D8%B3%D8%A7%D9%84%D9%83%D9%8A%D9%86%20%D9%88%D8%AA%D9%88%D8%B6%D9%8A%D8%AD%20%D8%A7%D9%84%D9%81%D9%82%D9%87%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86.pdf',
  'hisn-muslim':          'assets/books/6.%20%D8%A7%D9%84%D8%B1%D9%82%D8%A7%D8%A6%D9%82%D8%8C%20%D8%A7%D9%84%D8%A3%D8%B0%D9%83%D8%A7%D8%B1%20%D9%88%D8%A7%D9%84%D8%AA%D8%B2%D9%83%D9%8A%D8%A9%20-%20Purification%20of%20the%20Soul%20%26%20Adhkar/%D8%AD%D8%B5%D9%86%20%D8%A7%D9%84%D9%85%D8%B3%D9%84%D9%85.pdf',
};

/* The 5 large beginner-path books. Cached on first read, or via the
   "Download all" button in Settings. Not precached on install. */
const LARGE_BOOK_URLS = {
  'quran-tadabbur-amal':  'assets/books/1.%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D9%88%D8%B9%D9%84%D9%88%D9%85%D9%87%20-%20Quran%20%26%20Its%20Sciences/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%AA%D8%AF%D8%A8%D8%B1%20%D9%88%D8%B9%D9%85%D9%84.pdf',
  'tafsir-sadi':          'assets/books/1.%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D9%88%D8%B9%D9%84%D9%88%D9%85%D9%87%20-%20Quran%20%26%20Its%20Sciences/%D8%AA%D9%8A%D8%B3%D9%8A%D8%B1%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20%D8%A7%D9%84%D8%B1%D8%AD%D9%85%D9%86%20%D9%81%D9%8A%20%D8%AA%D9%81%D8%B3%D9%8A%D8%B1%20%D9%83%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D9%86%D8%A7%D9%86%20%3D%20%D8%AA%D9%81%D8%B3%D9%8A%D8%B1%20%D8%A7%D9%84%D8%B3%D8%B9%D8%AF%D9%8A%20(%D8%B7.%20%D8%AF%D8%A7%D8%B1%20%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AB).pdf',
  'bukhari-maktabah':     'assets/books/2.%20%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AB%20%D8%A7%D9%84%D8%B4%D8%B1%D9%8A%D9%81%20%D9%88%D8%B9%D9%84%D9%88%D9%85%D9%87%20-%20Hadith%20%26%20Its%20Sciences/%D8%B5%D8%AD%D9%8A%D8%AD%20%D8%A7%D9%84%D8%A8%D8%AE%D8%A7%D8%B1%D9%8A%20%D9%85%D9%83%D8%AA%D8%A8%D8%A9.pdf',
  'sharh-arbaeen-nawawi': 'assets/books/2.%20%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AB%20%D8%A7%D9%84%D8%B4%D8%B1%D9%8A%D9%81%20%D9%88%D8%B9%D9%84%D9%88%D9%85%D9%87%20-%20Hadith%20%26%20Its%20Sciences/sharh_arbaeen_nawawi.pdf',
  'riyad-salihin':        'assets/books/2.%20%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AB%20%D8%A7%D9%84%D8%B4%D8%B1%D9%8A%D9%81%20%D9%88%D8%B9%D9%84%D9%88%D9%85%D9%87%20-%20Hadith%20%26%20Its%20Sciences/%D8%B1%D9%8A%D8%A7%D8%B6%20%D8%A7%D9%84%D8%B5%D8%A7%D9%84%D8%AD%D9%8A%D9%86%20%D9%85%D9%86%20%D9%83%D9%84%D8%A7%D9%85%20%D8%B1%D8%B3%D9%88%D9%84%20%D8%A7%D9%84%D9%84%D9%87%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D8%B9%D8%A7%D8%B1%D9%81%D9%8A%D9%86-%20%D8%A7%D9%84%D9%86%D9%88%D9%88%D9%8A%20-%20%D8%B7%20%D8%AF%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%86%D9%87%D8%A7%D8%AC.pdf',
};

/* Fast lookup: id -> fully-qualified same-origin URL (relative). */
const ALL_KNOWN_BOOK_URLS = Object.assign({}, BEGINNER_BOOK_URLS, LARGE_BOOK_URLS);

/* Build a URL from an id. Falls back to the current resolveBookPath helper
   when the id is unknown (e.g. non-beginner books from BOOKS). */
function offlineBookUrl(id){
  if(ALL_KNOWN_BOOK_URLS[id]) return ALL_KNOWN_BOOK_URLS[id];
  if(typeof resolveBookPath === 'function'){
    const b = (typeof getBookById === 'function') ? getBookById(id) : null;
    if(b) return resolveBookPath(b);
  }
  return null;
}

async function offlineBooksCache(){
  return caches.open(OFFLINE_BOOKS_CACHE);
}

async function isBookCached(id){
  const url = offlineBookUrl(id);
  if(!url) return false;
  const c = await offlineBooksCache();
  const r = await c.match(url);
  return !!r;
}

async function listCachedBookIds(){
  const c = await offlineBooksCache();
  const keys = await c.keys();
  const urls = keys.map(r => new URL(r.url).pathname.replace(/^\/adkar\//, ''));
  const out = [];
  for(const [id, u] of Object.entries(ALL_KNOWN_BOOK_URLS)){
    if(urls.includes(u)) out.push(id);
  }
  return out;
}

async function cacheBookById(id, signal){
  const url = offlineBookUrl(id);
  if(!url) throw new Error('Unknown book id: ' + id);
  const c = await offlineBooksCache();
  const existing = await c.match(url);
  if(existing) return { id, cached: true, skipped: true };
  const res = await fetch(url, { signal });
  if(!res.ok) throw new Error('HTTP ' + res.status + ' for ' + id);
  await c.put(url, res.clone());
  return { id, cached: true, skipped: false };
}

async function cacheBeginnerBooks(onProgress, signal){
  const ids = Object.keys(BEGINNER_BOOK_URLS).concat(Object.keys(LARGE_BOOK_URLS));
  let done = 0;
  for(const id of ids){
    if(signal && signal.aborted) throw new Error('aborted');
    await cacheBookById(id, signal);
    done++;
    if(typeof onProgress === 'function') onProgress(done, ids.length, id);
  }
  return done;
}

async function clearOfflineBooks(){
  await caches.delete(OFFLINE_BOOKS_CACHE);
}

/* Expose for inline handlers and for the reader to check cached state. */
window.OFFLINE_BOOKS = {
  CACHE: OFFLINE_BOOKS_CACHE,
  BEGINNER_BOOK_URLS,
  LARGE_BOOK_URLS,
  ALL_KNOWN_BOOK_URLS,
  offlineBookUrl,
  isBookCached,
  listCachedBookIds,
  cacheBookById,
  cacheBeginnerBooks,
  clearOfflineBooks,
};