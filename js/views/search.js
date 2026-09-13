'use strict';

/* ═══════════════════════════════════════════════════════════
   Search view — fuzzy search + filter chips
   Filter state is kept in a module-local object.
   ═══════════════════════════════════════════════════════════ */

let _searchFilters = {
  category: null,
  grade:    null,
  favOnly:  false,
  tag:      null,
};

function handleSearch(){
  const raw = $('search-input').value.trim();
  $('search-clear').style.display = raw ? 'block' : 'none';

  /* Empty query + no filters → return to cats */
  const hasFilters = _searchFilters.category || _searchFilters.grade
                  || _searchFilters.favOnly || _searchFilters.tag;
  if(!raw && !hasFilters){ showView('view-cats'); return; }

  /* Ensure filter bar exists */
  ensureFilterBar();

  /* Run search */
  const results = searchAdkar(raw, _searchFilters);

  /* Update count line */
  const parts = [];
  if(raw) parts.push(`"${raw}"`);
  if(_searchFilters.category) parts.push(getCat(_searchFilters.category).ar);
  if(_searchFilters.grade)    parts.push(REL_LABEL[_searchFilters.grade]);
  if(_searchFilters.favOnly)  parts.push('★');
  if(_searchFilters.tag)      parts.push(`#${_searchFilters.tag}`);
  const label = parts.length ? parts.join(' · ') : 'all';

  $('search-count').textContent = `${results.length} result(s) — ${label}`;

  renderSearchFilterBar();

  /* Render results */
  const el = $('search-results');
  if(!results.length){
    el.innerHTML = `<div class="adkar-empty">
      <div class="adkar-empty-icon">🔍</div>
      <div>No results.<br><button class="btn-cancel" style="margin-top:14px" onclick="clearFilters()">Clear filters</button></div>
    </div>`;
  } else {
    el.innerHTML = results.map(d => {
      const catKey = Array.isArray(d.categories) ? d.categories[0] : null;
      const cat = getCat(catKey);
      const isFav = favs.includes(d.id);
      return `<div class="search-result-card" style="--cc:${cat.color}" onclick="openDetail(${d.id})">
        <div class="src-cat-label" style="color:${cat.color}">
          ${cat.ar}${isFav ? ' · ★' : ''}
        </div>
        ${d.situation ? `<div class="src-situation">${d.situation}</div>` : ''}
        <div class="src-text">${d.arabic.slice(0,140)}${d.arabic.length>140?'...':''}</div>
        ${(d.tags && d.tags.length) ? `<div style="margin-top:6px">${renderTagChips(d.tags)}</div>` : ''}
      </div>`;
    }).join('');
  }

  showView('view-search');
}

function clearSearch(){
  $('search-input').value = '';
  $('search-clear').style.display = 'none';
  /* Also drop filters */
  _searchFilters = { category:null, grade:null, favOnly:false, tag:null };
  showView('view-cats');
}

/* ═══════════════════════════════════════════════════════════
   FILTER UI
   ═══════════════════════════════════════════════════════════ */

function ensureFilterBar(){
  if($('search-filters')) return;
  const host = $('view-search');
  const bar = document.createElement('div');
  bar.id = 'search-filters';
  bar.className = 'filter-bar';
  /* Insert before the results container */
  host.insertBefore(bar, $('search-results'));
}

function renderSearchFilterBar(){
  const bar = $('search-filters');
  if(!bar) return;

  const catChips = cats.map(c =>
    `<button class="filter-chip ${_searchFilters.category===c.key?'on':''}"
             style="--cc:${c.color}"
             onclick="toggleFilter('category','${c.key}')">${c.ar}</button>`
  ).join('');

  const grades = Object.entries(REL_LABEL).map(([k,label]) =>
    `<button class="filter-chip ${_searchFilters.grade===k?'on':''}"
             onclick="toggleFilter('grade','${k}')">${label}</button>`
  ).join('');

  const tags = getAvailableTags().map(t =>
    `<button class="filter-chip tag ${_searchFilters.tag===t?'on':''}"
             onclick="toggleFilter('tag','${esc(t)}')">#${esc(t)}</button>`
  ).join('');

  const favChip = `<button class="filter-chip ${_searchFilters.favOnly?'on':''}"
                            onclick="toggleFilter('favOnly',true)">★ Favorites only</button>`;

  const hasAny = _searchFilters.category || _searchFilters.grade
              || _searchFilters.favOnly || _searchFilters.tag;
  const clearBtn = hasAny
    ? `<button class="filter-chip clear" onclick="clearFilters()">✕ Clear filters</button>`
    : '';

  bar.innerHTML = `
    ${clearBtn}
    <div class="filter-group">
      <span class="filter-label">Category</span>
      <div class="filter-row">${catChips}</div>
    </div>
    <div class="filter-group">
      <span class="filter-label">Grade</span>
      <div class="filter-row">${grades}${favChip}</div>
    </div>
    ${tags ? `<div class="filter-group">
      <span class="filter-label">Tags</span>
      <div class="filter-row">${tags}</div>
    </div>` : ''}
  `;
}

function toggleFilter(key, val){
  if(key === 'favOnly'){
    _searchFilters.favOnly = !_searchFilters.favOnly;
  } else {
    _searchFilters[key] = (_searchFilters[key] === val) ? null : val;
  }
  handleSearch();
}

function clearFilters(){
  _searchFilters = { category:null, grade:null, favOnly:false, tag:null };
  handleSearch();
}