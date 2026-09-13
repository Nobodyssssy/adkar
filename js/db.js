'use strict';

/* ═══════════════════════════════════════════════════════════
   IndexedDB layer — adkar app
   Async, promise-based, offline-first.
   Stores: cats, adkar, favs, counters, meta
   ═══════════════════════════════════════════════════════════ */

const DB_NAME    = 'adkar-db';
const DB_VERSION = 2;

let _dbPromise = null;

function openDB(){
  if(_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if(!db.objectStoreNames.contains('cats')){
        db.createObjectStore('cats', { keyPath: 'key' });
      }
      if(!db.objectStoreNames.contains('adkar')){
        const s = db.createObjectStore('adkar', { keyPath: 'id' });
        s.createIndex('cat', 'cat', { unique: false });
        s.createIndex('reliability', 'reliability', { unique: false });
      }

      /* v2: add multi-value index on `categories` array + `tags` array.
         IndexedDB supports array indexes — a dhikr with
         categories: ['sabah','masaa'] will be indexed under both. */
      if(event.oldVersion < 2){
        const tx = event.target.transaction;
        if(tx.objectStoreNames.contains('adkar')){
          const store = tx.objectStore('adkar');
          if(!store.indexNames.contains('categories')){
            store.createIndex('categories', 'categories', { unique: false, multiEntry: true });
          }
          if(!store.indexNames.contains('tags')){
            store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          }
        }
      }
      if(!db.objectStoreNames.contains('favs')){
        db.createObjectStore('favs', { keyPath: 'id' });
      }
      if(!db.objectStoreNames.contains('counters')){
        db.createObjectStore('counters', { keyPath: 'id' });
      }
      if(!db.objectStoreNames.contains('meta')){
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });

  return _dbPromise;
}

/* ── Generic helpers ── */
function tx(storeName, mode = 'readonly'){
  return openDB().then((db) => {
    const t = db.transaction(storeName, mode);
    return { t, store: t.objectStore(storeName) };
  });
}

function reqToPromise(req){
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function txComplete(t){
  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror    = () => reject(t.error);
    t.onabort    = () => reject(t.error);
  });
}

/* ═══════════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════════ */

const db = {

  /* ── CATEGORIES ── */
  cats: {
    getAll: () => tx('cats').then(({store}) => reqToPromise(store.getAll())),
    get:    (key) => tx('cats').then(({store}) => reqToPromise(store.get(key))),
    put:    (obj) => tx('cats', 'readwrite').then(async ({store, t}) => {
      store.put(obj); await txComplete(t); return obj;
    }),
    putMany: (arr) => tx('cats', 'readwrite').then(async ({store, t}) => {
      arr.forEach(o => store.put(o)); await txComplete(t);
    }),
    delete: (key) => tx('cats', 'readwrite').then(async ({store, t}) => {
      store.delete(key); await txComplete(t);
    }),
    clear:  () => tx('cats', 'readwrite').then(async ({store, t}) => {
      store.clear(); await txComplete(t);
    }),
  },

  /* ── ADKAR ── */
  adkar: {
    getAll: () => tx('adkar').then(({store}) => reqToPromise(store.getAll())),
    get:    (id) => tx('adkar').then(({store}) => reqToPromise(store.get(id))),
    byCat:  (catKey) => tx('adkar').then(({store}) => {
      const idx = store.index('cat');
      return reqToPromise(idx.getAll(catKey));
    }),
    put:    (obj) => tx('adkar', 'readwrite').then(async ({store, t}) => {
      store.put(obj); await txComplete(t); return obj;
    }),
    putMany: (arr) => tx('adkar', 'readwrite').then(async ({store, t}) => {
      arr.forEach(o => store.put(o)); await txComplete(t);
    }),
    delete: (id) => tx('adkar', 'readwrite').then(async ({store, t}) => {
      store.delete(id); await txComplete(t);
    }),
    deleteByCat: (catKey) => tx('adkar', 'readwrite').then(async ({store, t}) => {
      const idx = store.index('cat');
      const cursorReq = idx.openCursor(IDBKeyRange.only(catKey));
      cursorReq.onsuccess = (e) => {
        const cur = e.target.result;
        if(cur){ store.delete(cur.primaryKey); cur.continue(); }
      };
      await txComplete(t);
    }),
    clear:  () => tx('adkar', 'readwrite').then(async ({store, t}) => {
      store.clear(); await txComplete(t);
    }),
  },

  /* ── FAVORITES ── */
  favs: {
    getAll: () => tx('favs').then(({store}) => reqToPromise(store.getAll()))
                  .then(arr => arr.map(x => x.id)),
    has:    (id) => tx('favs').then(({store}) => reqToPromise(store.get(id)))
                  .then(x => !!x),
    add:    (id) => tx('favs', 'readwrite').then(async ({store, t}) => {
      store.put({ id }); await txComplete(t);
    }),
    remove: (id) => tx('favs', 'readwrite').then(async ({store, t}) => {
      store.delete(id); await txComplete(t);
    }),
    putMany: (ids) => tx('favs', 'readwrite').then(async ({store, t}) => {
      ids.forEach(id => store.put({ id })); await txComplete(t);
    }),
    clear:  () => tx('favs', 'readwrite').then(async ({store, t}) => {
      store.clear(); await txComplete(t);
    }),
  },

  /* ── COUNTERS ── */
  counters: {
    getAll: () => tx('counters').then(({store}) => reqToPromise(store.getAll())),
    get:    (id) => tx('counters').then(({store}) => reqToPromise(store.get(id))),
    set:    (id, count) => tx('counters', 'readwrite').then(async ({store, t}) => {
      store.put({ id, count, updatedAt: Date.now() }); await txComplete(t);
    }),
    setMany: (obj) => tx('counters', 'readwrite').then(async ({store, t}) => {
      Object.entries(obj).forEach(([id, count]) =>
        store.put({ id: Number(id), count, updatedAt: Date.now() }));
      await txComplete(t);
    }),
    clear:  () => tx('counters', 'readwrite').then(async ({store, t}) => {
      store.clear(); await txComplete(t);
    }),
  },

  /* ── META (preferences, migration flags) ── */
  meta: {
    get: (key) => tx('meta').then(({store}) => reqToPromise(store.get(key)))
                  .then(x => x ? x.value : undefined),
    set: (key, value) => tx('meta', 'readwrite').then(async ({store, t}) => {
      store.put({ key, value }); await txComplete(t);
    }),
    delete: (key) => tx('meta', 'readwrite').then(async ({store, t}) => {
      store.delete(key); await txComplete(t);
    }),
  },

  /* ── Wipe (used for import-replace) ── */
  async wipeAll(){
    await db.cats.clear();
    await db.adkar.clear();
    await db.favs.clear();
    await db.counters.clear();
  },

};