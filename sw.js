/* ─────────────────────────────────────────────
   Service Worker — adkar app
   Strategy:
     • Precache app shell on install
     • Cache-first for same-origin assets
     • Network-first for HTML navigation (so updates flow)
     • Stale-while-revalidate for fonts
   ───────────────────────────────────────────── */

const VERSION = 'v2.7.2';
const CACHE = `sahib-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',

  './css/base.css',
  './css/layout.css',
  './css/views/home.css',
  './css/views/adkar.css',
  './css/views/prayer.css',
  './css/views/hijri.css',
  './css/views/asma.css',
  './css/views/flashcards.css',
  './css/views/books.css',
  './css/views/tasbih.css',
  './css/components.css',
  './css/responsive.css',
  
  './assets/icons/sprite.svg',
  './assets/fonts/Amiri-Regular.woff2',
  './assets/fonts/Amiri-Bold.woff2',
  './assets/fonts/Tajawal-Regular.woff2',
  './assets/fonts/Tajawal-Medium.woff2',
  './assets/fonts/Tajawal-Bold.woff2',

  './js/config.js',
  './js/utils.js',
  './js/icons.js',
  './js/scroll-preserve.js',
  './js/dict.js',
  './js/vendor/fuse.min.js',
  './js/db.js',
  './js/store.js',
  './js/data-defaults.js',
  './js/hisn-data.js',
  './js/state.js',
  './js/search.js',
  './js/prayer.js',
  './js/qibla.js',
  './js/location.js',
  './js/quotes.js',
  './js/dates.js',
  './js/hijri-events.js',
  './js/hijri-calendar.js',
  './js/asma-data.js',
  './js/asma.js',
  './js/books-data.js',
  './js/books.js',
  './js/reader.js',
  './js/vendor/pdf.min.js',
  './js/vendor/pdf.worker.min.js',

  './js/views/cats.js',
  './js/views/home.js',
  './js/views/adkar.js',
  './js/views/search.js',
  './js/views/favs.js',
  './js/views/detail.js',
  './js/views/session.js',
  './js/views/form.js',
  './js/views/catmgr.js',
  './js/views/confirm.js',
  './js/views/menu.js',
  './js/views/quote.js',
  './js/views/prayer.js',
  './js/views/hijri.js',
  './js/views/asma.js',
  './js/views/books.js',
  './js/views/tasbih.js',
  './js/views/reader.js',
  './js/io.js',
  './js/app.js',

  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
/* ── Install: precache the shell ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[sw] precache failed', err))
  );
});

/* ── Activate: drop old caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => (k.startsWith('adkar-') || k.startsWith('sahib-')) && k !== CACHE)
            .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch handling ── */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  const isSameOrigin = url.origin === self.location.origin;

  /* Only handle same-origin requests (fonts are now local) */
  if (!isSameOrigin) return;

  /* PDFs and Range requests are handled natively by the browser for streaming */
  if (url.pathname.includes('/assets/books/') || url.pathname.endsWith('.pdf') || req.headers.has('range')) {
    return;
  }

  /* HTML navigation → network-first, fall back to cache when offline */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  /* Same-origin static assets → cache-first */
  event.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
    )
  );
});

/* ── Allow the page to trigger skipWaiting ── */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});