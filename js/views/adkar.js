'use strict';

/* ═══════════════════════════════════════════════════════════
   Adkar list view
   Uses `categories: []` (array) and `tags: []`.
   `currentCat` filtering is done via categories.includes().
   ═══════════════════════════════════════════════════════════ */

function renderAdkarGrid(){
  const items = data.filter(d =>
    Array.isArray(d.categories) && d.categories.includes(currentCat)
  );
  const g = $('adkar-grid');
  if(!items.length){
    g.innerHTML = `<div class="adkar-empty">
      <div class="adkar-empty-icon">📿</div>
      <div>No adkar yet.<br>Tap ＋ Add to create one.</div>
    </div>`;
    return;
  }
  g.innerHTML = items.map(d => adkarCardHTML(d, getCat(currentCat))).join('');
}

function adkarCardHTML(d, catObj){
  /* For cards shown in a specific category, use that category's color.
     For cards shown in favorites (no specific cat), use the first category. */
  const catKey = catObj ? catObj.key
                        : (Array.isArray(d.categories) ? d.categories[0] : null);
  const cat = catObj || getCat(catKey);

  const k = `c_${d.id}`;
  const cur = counters[k] || 0;
  const pct = Math.min(100, Math.round(cur / d.repeat * 100));
  const isDone = cur >= d.repeat;
  const isFav = favs.includes(d.id);

  const relBadge = d.reliability
    ? `<span class="badge badge-${d.reliability}">${REL_LABEL[d.reliability]}</span>`
    : '';

  const translit = d.transliteration
    ? `<div class="adkar-translit">${esc(d.transliteration.slice(0, 120))}</div>`
    : '';

  /* Show category chips only in favorites view (where catKey is null) */
  const catChips = catObj ? '' : renderCatChips(d.categories);

  /* Show tag chips if any */
  const tagChips = renderTagChips(d.tags);

  return `<div class="adkar-card ${isFav?'fav-glow':''}" style="--cc:${cat.color}" onclick="openDetail(${d.id})">
    <div class="adkar-left">
      ${d.situation ? `<div class="adkar-situation">${d.situation}</div>` : ''}
      <div class="adkar-text">${d.arabic.length > 110 ? d.arabic.slice(0,110)+'...' : d.arabic}</div>
      ${translit}
      <div class="adkar-badges">
        ${catChips}
        <span class="badge badge-repeat">× ${d.repeat}</span>
        ${relBadge}
        ${tagChips}
      </div>
    </div>
    <div class="adkar-meta">${progressRing(pct, cat.color, isDone)}</div>
    <div class="adkar-actions" onclick="event.stopPropagation()">
      <button class="adkar-btn fav ${isFav?'on':''}" onclick="toggleFav(${d.id})">★</button>
      <button class="adkar-btn edit" onclick="openForm(${d.id})">✏️</button>
      <button class="adkar-btn del" onclick="askDelDhikr(${d.id})">🗑️</button>
    </div>
  </div>`;
}

/* Small helpers for chips — used in favorites + detail views */
function renderCatChips(catKeys){
  if(!Array.isArray(catKeys) || !catKeys.length) return '';
  return catKeys.map(key => {
    const c = getCat(key);
    return `<span class="badge badge-cat" style="background:${c.color}22;border-color:${c.color};color:${c.color}">${c.ar}</span>`;
  }).join('');
}

function renderTagChips(tags){
  if(!Array.isArray(tags) || !tags.length) return '';
  return tags.map(t =>
    `<span class="badge badge-tag">#${esc(t)}</span>`
  ).join('');
}