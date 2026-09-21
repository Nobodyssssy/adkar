'use strict';

/* ═══════════════════════════════════════════════════════════
   Reader — PDF.js wrapper
   • Initialises PDF.js worker
   • Loads and caches PDF documents
   • Generates + caches cover thumbnails
   • Renders pages into canvas (used by the reader view)
   ═══════════════════════════════════════════════════════════ */

let _pdfJsReady = false;
let _pdfDocs = {};              /* { bookId: PDFDocumentProxy } */

/* ── Init PDF.js worker ── */
function initPdfJs(){
  if(_pdfJsReady) return;
  if(typeof pdfjsLib === 'undefined'){
    console.warn('[reader] PDF.js not loaded');
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
  _pdfJsReady = true;
}

/* ═══════════════════════════════════════════════════════════
   Load + cache PDF documents
   ═══════════════════════════════════════════════════════════ */
async function loadPdfDocument(bookId){
  if(_pdfDocs[bookId]) return _pdfDocs[bookId];

  const book = getBookById(bookId);
  if(!book) throw new Error('Book not found');

  initPdfJs();
  const url = resolveBookPath(book);

  const loadingTask = pdfjsLib.getDocument({
    url: url,
    cMapUrl: 'js/vendor/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'js/vendor/standard_fonts/',
  });

  const pdf = await loadingTask.promise;
  _pdfDocs[bookId] = pdf;
  return pdf;
}

function getCachedPdf(bookId){
  return _pdfDocs[bookId] || null;
}

function clearPdfCache(bookId){
  if(bookId){
    delete _pdfDocs[bookId];
  } else {
    _pdfDocs = {};
  }
}

/* ═══════════════════════════════════════════════════════════
   Cover thumbnails — generate from page 1
   Cache in IndexedDB under 'book-covers'
   ═══════════════════════════════════════════════════════════ */

const COVER_WIDTH = 140;      /* px, ~thumb */
const COVER_CACHE_KEY = 'book-covers';

let _coverCache = null;

async function loadCoverCache(){
  if(_coverCache) return _coverCache;
  const stored = await store.getMeta(COVER_CACHE_KEY);
  _coverCache = (stored && typeof stored === 'object') ? stored : {};
  return _coverCache;
}

async function saveCoverCache(){
  await store.setMeta(COVER_CACHE_KEY, _coverCache || {});
}

function getCachedCover(bookId){
  if(!_coverCache) return null;
  return _coverCache[bookId] || null;
}

/* Generate + cache cover for one book */
async function generateBookCover(bookId){
  await loadCoverCache();

  /* Already cached? */
  const cached = getCachedCover(bookId);
  if(cached) return cached;

  try{
    const pdf = await loadPdfDocument(bookId);
    const page = await pdf.getPage(1);

    /* Compute scale so width = COVER_WIDTH */
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = COVER_WIDTH / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    /* Convert to data URL — JPEG at moderate quality to keep size small */
    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);

    _coverCache[bookId] = dataUrl;
    await saveCoverCache();
    return dataUrl;

  }catch(err){
    console.warn('[reader] cover generation failed for', bookId, err);
    return null;
  }
}

/* Attach cover to a DOM element (called after grid renders) */
async function attachBookCover(bookId, element){
  if(!element) return;
  await loadCoverCache();

  const cached = getCachedCover(bookId);
  if(cached){
    element.innerHTML = `<img src="${cached}" alt="">`;
    return;
  }

  /* Placeholder stays visible until generated */
  /* Generate in background, then swap */
  generateBookCover(bookId).then(dataUrl => {
    if(dataUrl){
      /* Only swap if element still exists in DOM */
      if(document.body.contains(element)){
        element.innerHTML = `<img src="${dataUrl}" alt="">`;
      }
    }
  });
}

/* Attach covers to all visible book cards */
async function generateCoversForGrid(){
  await loadCoverCache();

  const cards = document.querySelectorAll('[id^="cover-"]');
  for(const card of cards){
    const bookId = card.id.replace(/^cover-/, '');
    await attachBookCover(bookId, card);
  }
}

/* Generate covers for all books — call once on first Books visit */
async function ensureAllCovers(){
  await loadCoverCache();

  const missing = BOOKS.filter(b => !getCachedCover(b.id));
  if(!missing.length) return;

  /* Generate sequentially to avoid hammering PDF.js */
  for(const book of missing){
    await generateBookCover(book.id);
  }
}

/* ── Stats ── */
function getCoverCacheStats(){
  if(!_coverCache) return { count: 0, size: 0 };
  const keys = Object.keys(_coverCache);
  let size = 0;
  keys.forEach(k => { size += (_coverCache[k] || '').length; });
  return { count: keys.length, size };
}

async function clearCoverCache(){
  _coverCache = {};
  await saveCoverCache();
}


/* ═══════════════════════════════════════════════════════════
   Page rendering — used by the reader view
   ═══════════════════════════════════════════════════════════ */

/* Render one page into a canvas at a given CSS width */
async function renderPageToCanvas(pdf, pageNum, canvas, containerWidth, zoomFactor){
  zoomFactor = zoomFactor || 1;

  const page = await pdf.getPage(pageNum);
  const baseViewport = page.getViewport({ scale: 1 });

  /* Fit-to-width scale */
  const fitScale = containerWidth / baseViewport.width;
  const scale = fitScale * zoomFactor;
  const viewport = page.getViewport({ scale });

  /* Account for high-DPI screens */
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = viewport.width + 'px';
  canvas.style.height = viewport.height + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const renderTask = page.render({
    canvasContext: ctx,
    viewport: viewport,
  });

  await renderTask.promise;
  return { width: viewport.width, height: viewport.height };
}

/* Extract table of contents if available */
async function getPdfOutline(pdf){
  try{
    const outline = await pdf.getOutline();
    return outline || [];
  }catch{
    return [];
  }
}

/* Get PDF metadata (title, author, page count) */
async function getPdfMetadata(pdf){
  try{
    const meta = await pdf.getMetadata();
    return {
      title:  meta?.info?.Title  || null,
      author: meta?.info?.Author || null,
      pages:  pdf.numPages,
    };
  }catch{
    return { title: null, author: null, pages: pdf.numPages };
  }
}

/* ═══════════════════════════════════════════════════════════
   Fullscreen helper for reader mode
   ═══════════════════════════════════════════════════════════ */
function enterFullscreen(el){
  if(el.requestFullscreen) el.requestFullscreen().catch(() => {});
}
function exitFullscreen(){
  if(document.fullscreenElement) document.exitFullscreen().catch(() => {});
}