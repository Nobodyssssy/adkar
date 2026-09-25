/* =================================================================
   Service Worker - adkar app
   Strategy:
     - Precache app shell on install
     - Cache-first for same-origin assets
     - Network-first for HTML navigation (so updates flow)
     - Stale-while-revalidate for fonts
   ================================================================= */

const VERSION = 'v2.10.43';
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
  './js/adhkar-taxonomy.js',
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
  './js/offline-books.js',
  './js/offline-ui.js',
  './js/reader.js',
  './js/vendor/embedpdf/engines/dist/index.js',
  './js/vendor/embedpdf/engines/dist/lib/pdfium/index.js',
  './js/vendor/embedpdf/engines/dist/lib/converters/index.js',
  './js/vendor/embedpdf/engines/dist/direct-engine-C8xTbxym.js',
  './js/vendor/embedpdf/engines/dist/browser-BKLM0ThC.js',
  './js/vendor/embedpdf/engines/dist/pdf-engine-D9v0RfKe.js',
  './js/vendor/embedpdf/pdfium/dist/index.browser.js',
  './js/vendor/embedpdf/pdfium/dist/pdfium.wasm',
  './js/vendor/embedpdf/models/dist/index.js',
  './js/vendor/embedpdf/fonts-arabic/dist/index.js',
  './js/vendor/embedpdf/fonts-latin/dist/index.js',

  './js/views/cats.js',
  './js/views/home.js',
  './js/views/adkar.js',
  './js/views/search.js',
  './js/views/favs.js',
  './js/views/favs-menu.js',
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
/* â”€â”€ Install: precache the shell â”€â”€ */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try { await cache.addAll(APP_SHELL); } catch (err) { console.warn('[sw] app shell precache failed', err); }

      /* Small beginner-path PDFs, cached on install. ~14 MB. */
      const smallBooks = [
        './assets/books/1.%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D9%88%D8%B9%D9%84%D9%88%D9%85%D9%87%20-%20Quran%20%26%20Its%20Sciences/Noor-Book.com%20%D8%A7%D9%84%D9%85%D9%82%D8%AF%D9%85%D8%A9%20%D8%A7%D9%84%D8%AC%D8%B2%D8%B1%D9%8A%D8%A9%203%20.pdf',
        './assets/books/4.%20%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9%20%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF%20-%20Islamic%20Creed%20%26%20Theology/%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF%20%D8%A7%D9%84%D8%B0%D9%8A%20%D9%87%D9%88%20%D8%AD%D9%82%20%D8%A7%D9%84%D9%84%D9%87%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%B9%D8%A8%D9%8A%D8%AF%20%D9%85%D8%A4%D9%84%D9%81%20%D8%A7%D9%84%D9%83%D8%AA%D8%A7%D8%A8%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%A8%D9%86%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8.pdf',
        './assets/books/4.%20%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9%20%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF%20-%20Islamic%20Creed%20%26%20Theology/%D9%85%D8%A7%20%D9%84%D8%A7%20%D9%8A%D8%B3%D8%B9%20%D8%A7%D9%84%D9%85%D8%B3%D9%84%D9%85%20%D8%AC%D9%87%D9%84%D9%87.pdf',
        './assets/books/5.%20%D8%A7%D9%84%D9%81%D9%82%D9%87%20%D9%88%D8%A3%D8%B5%D9%88%D9%84%D9%87%20-%20Islamic%20Jurisprudence%20(Fiqh)/%D9%85%D9%86%D9%87%D8%AC%20%D8%A7%D9%84%D8%B3%D8%A7%D9%84%D9%83%D9%8A%D9%86%20%D9%88%D8%AA%D9%88%D8%B6%D9%8A%D8%AD%20%D8%A7%D9%84%D9%81%D9%82%D9%87%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86.pdf',
        './assets/books/6.%20%D8%A7%D9%84%D8%B1%D9%82%D8%A7%D8%A6%D9%82%D8%8C%20%D8%A7%D9%84%D8%A3%D8%B0%D9%83%D8%A7%D8%B1%20%D9%88%D8%A7%D9%84%D8%AA%D8%B2%D9%83%D9%8A%D8%A9%20-%20Purification%20of%20the%20Soul%20%26%20Adhkar/%D8%AD%D8%B5%D9%86%20%D8%A7%D9%84%D9%85%D8%B3%D9%84%D9%85.pdf',
      ];
      const booksCache = await caches.open('sahib-books');
      for (const url of smallBooks) {
        try {
          const existing = await booksCache.match(url);
          if (existing) continue;
          const res = await fetch(url);
          if (res && res.ok) await booksCache.put(url, res.clone());
        } catch (err) {
          console.warn('[sw] book precache failed', url, err);
        }
      }

      await self.skipWaiting();
    })()
  );
});

/* â”€â”€ Activate: drop old caches â”€â”€ */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => (k.startsWith('adkar-') || k.startsWith('sahib-')) && k !== CACHE && k !== 'sahib-books')
            .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* â”€â”€ Fetch handling â”€â”€ */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  const isSameOrigin = url.origin === self.location.origin;

  /* Only handle same-origin requests (fonts are now local) */
  if (!isSameOrigin) return;

    /* Range requests: let the browser stream them directly. */
  if (req.headers.has('range')) return;

  /* Book PDFs: if the URL is already in the offline-books cache, serve it;
     otherwise pass through to the network. Lazy caching on first read is
     done by js/offline-books.js, not here. */
  if (url.pathname.includes('/assets/books/') || url.pathname.endsWith('.pdf')) {
    event.respondWith(
      caches.open('sahib-books').then((c) =>
        c.match(req).then((cached) => cached || fetch(req))
      )
    );
    return;
  }

  /* HTML navigation â†’ network-first, fall back to cache when offline */
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

  /* Same-origin static assets â†’ cache-first */
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

/* â”€â”€ Allow the page to trigger skipWaiting â”€â”€ */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});