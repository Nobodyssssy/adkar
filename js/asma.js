'use strict';

/* ═══════════════════════════════════════════════════════════
   Asma al-Husna — helpers
   • Search by any field
   • Memorized tracking (IndexedDB via store.meta)
   • Shuffled order for flashcards
   ═══════════════════════════════════════════════════════════ */

/* ── Get a name by ID ── */
function getAsmaById(id){
  return ASMA_NAMES.find(n => n.id === id) || null;
}

/* ── Search names ── */
function searchAsma(query){
  const q = (query || '').trim();
  if(!q) return ASMA_NAMES;

  const nqAr = (typeof normalizeAr === 'function') ? normalizeAr(q) : q.toLowerCase();
  const nqEn = (typeof normalizeEn === 'function') ? normalizeEn(q) : q.toLowerCase();

  return ASMA_NAMES.filter(n => {
    const hayAr = [
      n.ar,
      n.transliteration || '',
      n.tafsirAr || '',
    ].join(' ');
    const hayEn = [
      n.transliteration || '',
      n.meaningEn || '',
      n.tafsirEn || '',
    ].join(' ');

    const normHayAr = (typeof normalizeAr === 'function') ? normalizeAr(hayAr) : hayAr.toLowerCase();
    const normHayEn = (typeof normalizeEn === 'function') ? normalizeEn(hayEn) : hayEn.toLowerCase();

    return (nqAr && normHayAr.includes(nqAr)) || (nqEn && normHayEn.includes(nqEn));
  });
}

/* ═══════════════════════════════════════════════════════════
   Memorized tracking
   Stored as a Set in memory + persisted to IndexedDB meta
   ═══════════════════════════════════════════════════════════ */

let _memorizedSet = null;

async function loadMemorized(){
  if(_memorizedSet) return _memorizedSet;
  const stored = await store.getMeta('asma-memorized');
  _memorizedSet = new Set(Array.isArray(stored) ? stored : []);
  return _memorizedSet;
}

function isMemorized(id){
  return _memorizedSet ? _memorizedSet.has(id) : false;
}

async function toggleMemorized(id){
  if(!_memorizedSet) await loadMemorized();
  if(_memorizedSet.has(id)) _memorizedSet.delete(id);
  else _memorizedSet.add(id);
  await store.setMeta('asma-memorized', [..._memorizedSet]);
  return _memorizedSet.has(id);
}

function getMemorizedCount(){
  return _memorizedSet ? _memorizedSet.size : 0;
}

/* ── Filter helpers ── */
function filterMemorized(names){
  return names.filter(n => isMemorized(n.id));
}

function filterNotMemorized(names){
  return names.filter(n => !isMemorized(n.id));
}

/* ═══════════════════════════════════════════════════════════
   Flashcards — shuffled order
   ═══════════════════════════════════════════════════════════ */

function shuffleArray(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Build a deck for the flashcard mode */
function buildFlashcardDeck(mode){
  /* mode: 'all' | 'not-memorized' | 'memorized' */
  let pool = ASMA_NAMES;
  if(mode === 'not-memorized') pool = filterNotMemorized(ASMA_NAMES);
  if(mode === 'memorized')     pool = filterMemorized(ASMA_NAMES);
  return shuffleArray(pool);
}