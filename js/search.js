'use strict';

/* ═══════════════════════════════════════════════════════════
   Fuzzy search — Fuse.js wrapper
   • Builds a flat searchable string per dhikr
   • Weights: Arabic 3, transliteration 2, tags 1.5, situation 1.5, hadith/virtue 1
   • Rebuilds the index whenever data changes
   • Provides filter-aware search across all fields
   ═══════════════════════════════════════════════════════════ */

let _fuse = null;

/* Build the searchable shape. Field weights do the ranking.
   Anything listed in `keys` is a top-level field Fuse reads. */
function buildSearchDoc(d){
  const catNames = (d.categories || [])
    .map(k => {
      const c = getCat(k);
      return (c.ar || '') + ' ' + (c.en || '');
    }).join(' ');

  return {
    id: d.id,
    arabic:          normalizeAr(d.arabic || ''),
    transliteration: normalizeEn(d.transliteration || ''),
    situation:       normalizeAr(d.situation || ''),
    hadith:          normalizeAr(d.hadith || ''),
    virtue:          normalizeAr(d.virtue || ''),
    tags:            (d.tags || []).map(t => normalizeEn(t)).join(' '),
    categories:      normalizeAr(catNames),
  };
}

function rebuildSearchIndex(){
  if(typeof Fuse === 'undefined'){
    console.warn('[search] Fuse.js not loaded — search will fall back to simple mode');
    _fuse = null;
    return;
  }
  const docs = data.map(buildSearchDoc);
  _fuse = new Fuse(docs, {
    includeScore: true,
    threshold: 0.35,          /* 0 = exact, 1 = anything. 0.35 is a good balance. */
    ignoreLocation: true,     /* match anywhere in the string */
    minMatchCharLength: 2,
    keys: [
      { name: 'arabic',          weight: 3.0 },
      { name: 'transliteration', weight: 2.0 },
      { name: 'tags',            weight: 1.5 },
      { name: 'situation',       weight: 1.5 },
      { name: 'hadith',          weight: 1.0 },
      { name: 'virtue',          weight: 1.0 },
      { name: 'categories',      weight: 1.0 },
    ],
  });
}

/* ── Filter helpers ── */
function applyFilters(items, filters){
  return items.filter(d => {
    if(filters.category && !(d.categories || []).includes(filters.category)) return false;
    if(filters.grade    && d.reliability !== filters.grade)                    return false;
    if(filters.favOnly  && !favs.includes(d.id))                               return false;
    if(filters.tag      && !(d.tags || []).includes(filters.tag))              return false;
    return true;
  });
}

/* ── Main search entry point ── */
function searchAdkar(rawQuery, filters){
  filters = filters || {};
  const q = (rawQuery || '').trim();

  let results;

  if(!q){
    /* No query → filter-only mode. Return all matches, sorted by id. */
    results = data.filter(d => true).sort((a, b) => a.id - b.id);
  } else {
    /* Normalize query for both scripts. Build a combined search string:
       - Arabic normalized (for Arabic input)
       - Latin normalized (for Latin input)
       Fuse will match whichever produces hits. */
    const nqAr = normalizeAr(q);
    const nqEn = normalizeEn(q);

    let hits = [];

    if(_fuse){
      /* Query both forms, merge results, dedupe by id, keep best score */
      const seen = new Map();

      const merge = (list) => {
        list.forEach(r => {
          const id = r.item.id;
          const existing = seen.get(id);
          if(!existing || r.score < existing.score){
            seen.set(id, { id, score: r.score });
          }
        });
      };

      if(nqAr) merge(_fuse.search(nqAr));
      if(nqEn && nqEn !== nqAr) merge(_fuse.search(nqEn));

      /* Expand Latin query → Arabic equivalents and search those too */
      if(nqEn && typeof expandQueryToArabic === 'function'){
        const arExpansions = expandQueryToArabic(q);
        arExpansions.forEach(arForm => {
          const nArForm = normalizeAr(arForm);
          if(nArForm) merge(_fuse.search(nArForm));
        });
      }

      hits = [...seen.values()].sort((a, b) => a.score - b.score);
    } else {
      /* Fallback: simple substring match (in case Fuse.js didn't load) */
      hits = data
        .filter(d => {
          const hay = [
            normalizeAr(d.arabic),
            normalizeEn(d.transliteration),
            normalizeAr(d.situation),
            normalizeAr(d.hadith),
            normalizeAr(d.virtue),
            normalizeEn((d.tags || []).join(' ')),
          ].join(' ');
          return hay.includes(nqAr) || hay.includes(nqEn);
        })
        .map(d => ({ id: d.id, score: 0 }));
    }

    /* Map hit IDs → full objects, preserving Fuse's ranking */
    const byId = new Map(data.map(d => [d.id, d]));
    results = hits.map(h => byId.get(h.id)).filter(Boolean);
  }

  /* Apply filters (category, grade, favOnly, tag) */
  return applyFilters(results, filters);
}

/* ── Collect available filter values from current data ── */
function getAvailableTags(){
  const set = new Set();
  data.forEach(d => (d.tags || []).forEach(t => set.add(t)));
  return [...set].sort();
}