'use strict';

/* ═══════════════════════════════════════════════════════════
   Adkar list view
   Uses `categories: []` (array) and `tags: []`.
   `currentCat` filtering is done via categories.includes().
   ═══════════════════════════════════════════════════════════ */

/* Per-category subcategory (tag) filter */
let _tagFilters = {};

function _catItems(catKey){
return data.filter(d =>
Array.isArray(d.categories) && d.categories.includes(catKey)
);
}

function _tagLabel(tag){
if(!tag) return '';
if(typeof HISN_TAGS !== 'undefined' && HISN_TAGS[tag]){
return HISN_TAGS[tag].ar + ' · ' + HISN_TAGS[tag].en;
}
return tag;
}

function setTagFilter(tag){
_tagFilters[currentCat] = tag || null;
renderAdkarGrid();
}

function renderTagFilterRow(catKey){
const tags = [...new Set(_catItems(catKey).flatMap(d => Array.isArray(d.tags) ? d.tags : []))];
if(!tags.length) return '';
const active = _tagFilters[catKey] || null;
const chips = ['', ...tags].map(t => {
const on = (t === '' && !active) || (t !== '' && active === t);
const label = t === '' ? 'الكل · All' : _tagLabel(t);
return `<button class="filter-chip tag ${on ? 'on' : ''}" onclick="setTagFilter('${t}')">${label}</button>`;
}).join('');
return `<div class="adkar-tagbar">${chips}</div>`;
}

function renderAdkarGrid(){
const catKey = currentCat;
let items = _catItems(catKey);
const active = _tagFilters[catKey] || null;
if(active){
items = items.filter(d => Array.isArray(d.tags) && d.tags.includes(active));
}
const g = $('adkar-grid');
if(!items.length){
g.innerHTML = `<div class="adkar-empty"> <div class="adkar-empty-icon">${icon('beads', 40)}</div> <div>No adkar here yet.</div> </div>`;
return;
}
/* Group by first tag = subcategory */
const groups = new Map();
items.forEach(d => {
const key = (Array.isArray(d.tags) && d.tags.length) ? d.tags[0] : '';
if(!groups.has(key)) groups.set(key, []);
groups.get(key).push(d);
});
let html = renderTagFilterRow(catKey);
groups.forEach((list, key) => {
if(groups.size > 1){
html += `<div class="adkar-group-head"><span>${key ? _tagLabel(key) : 'أخرى · Other'}</span><span class="adkar-group-count">${list.length}</span></div>`;
}
html += list.map(d => adkarCardHTML(d, getCat(catKey))).join('');
});
g.innerHTML = html;
}

function adkarCardHTML(d, catObj){
  const catKey = catObj ? catObj.key
                        : (Array.isArray(d.categories) ? d.categories[0] : null);
  const cat = catObj || getCat(catKey);

  const k = `c_${d.id}`;
  const cur = counters[k] || 0;
  const pct = Math.min(100, Math.round(cur / d.repeat * 100));
  const isDone = cur >= d.repeat;
  const isFav = favs.includes(d.id);

  const relBadge = d.reliability
    ? `<span class="badge badge-${d.reliability}">${icon(REL_ICON[d.reliability], 12)} ${REL_LABEL[d.reliability]}</span>`
    : '';

  const translit = d.transliteration
    ? `<div class="adkar-translit">${esc(d.transliteration.slice(0, 120))}</div>`
    : '';

  const catChips = catObj ? '' : renderCatChips(d.categories);
  const tagChips = renderTagChips(d.tags);

  const html = `<div class="adkar-card ${isFav?'fav-glow':''}" style="--cc:${cat.color}" onclick="openDetail(${d.id})">
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
      <button class="adkar-btn fav ${isFav?'on':''}" onclick="toggleFav(${d.id})" title="Favorite" aria-label="${isFav?'Remove from favorites':'Add to favorites'}">${icon(isFav ? 'favorite-filled' : 'favorite-empty', 14)}</button>
      <button class="adkar-btn edit" onclick="openForm(${d.id})" title="Edit">${icon('pencil', 14)}</button>
      <button class="adkar-btn del" onclick="askDelDhikr(${d.id})" title="Delete">${icon('trash', 14)}</button>
    </div>
  </div>`;

  if(typeof injectHeaderIcons === 'function'){
    setTimeout(() => injectHeaderIcons(), 0);
  }

  return html;
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