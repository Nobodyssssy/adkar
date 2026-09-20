'use strict';
/* Search view - fuzzy search + filter chips */
let _searchFilters = {
  category: null,
  grade:    null,
  favOnly:  false,
  tag:      null,
};

/* Search bar relocation / focus preservation */
function _relocateSearchBar(){
  const bar = document.querySelector('.search-bar');
  if(!bar || bar.dataset.relocated === '1') return;
  const firstView = document.querySelector('.view');
  if(!firstView || !firstView.parentElement) return;
  if(bar.parentElement !== firstView.parentElement){
    firstView.parentElement.insertBefore(bar, firstView);
  }
  bar.dataset.relocated = '1';
}
function _syncSearchBar(){
  const bar = document.querySelector('.search-bar');
  if(!bar) return;
  const active = document.querySelector('.view.active');
  const id = active ? active.id : '';
  bar.style.display = (id === 'view-cats' || id === 'view-search') ? 'block' : 'none';
}
function _initSearchBar(){
  _relocateSearchBar();
  _syncSearchBar();
  if(!window._searchBarObserver){
    window._searchBarObserver = new MutationObserver(_syncSearchBar);
    window._searchBarObserver.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', _initSearchBar);
} else {
  _initSearchBar();
}

function handleSearch(){
  const input = $('search-input');
  if(!input) return;
  const raw = input.value.trim();
  $('search-clear').style.display = raw ? 'block' : 'none';

  const hasFilters = _searchFilters.category || _searchFilters.grade
    || _searchFilters.favOnly || _searchFilters.tag;

  if(!raw && !hasFilters){
    showView('view-cats');
    _syncSearchBar();
    requestAnimationFrame(() => input.focus());
    return;
  }

  ensureFilterBar();
  const results = searchAdkar(raw, _searchFilters);

  const parts = [];
  if(raw) parts.push(`"${raw}"`);
  if(_searchFilters.category) parts.push(getCat(_searchFilters.category).ar);
  if(_searchFilters.grade)    parts.push(REL_LABEL[_searchFilters.grade]);
  if(_searchFilters.favOnly)  parts.push('Favorites');
  if(_searchFilters.tag)      parts.push(`#${_searchFilters.tag}`);
  const label = parts.length ? parts.join(' \u00B7 ') : 'all';
  $('search-count').textContent = `${results.length} result(s) - ${label}`;
  renderSearchFilterBar();

  const el = $('search-results');
  if(!results.length){
    el.innerHTML = `<div class="adkar-empty"> <div class="adkar-empty-icon">${icon('search', 40)}</div> <div>No results.<br><button class="btn-cancel" style="margin-top:14px" onclick="clearFilters()">Clear filters</button></div> </div>`;
  } else {
    el.innerHTML = results.map(d => {
      const catKey = Array.isArray(d.categories) ? d.categories[0] : null;
      const cat = getCat(catKey);
      const isFav = favs.includes(d.id);
      return `<div class="search-result-card" style="--cc:${cat.color}" onclick="openDetail(${d.id})"> <div class="src-cat-label" style="color:${cat.color}"> ${cat.ar}${isFav ? ' ' + icon('favorite-filled', 12) : ''} </div> ${d.situation ? `<div class="src-situation">${d.situation}</div>` : ''} <div class="src-text">${d.arabic.slice(0,140)}${d.arabic.length>140?'...':''}</div> ${(d.tags && d.tags.length) ? `<div style="margin-top:6px">${renderTagChips(d.tags)}</div>` : ''} </div>`;
    }).join('');
  }

  showView('view-search');
  _syncSearchBar();

  /* Restore focus to the input immediately after view switch. */
  requestAnimationFrame(() => {
    input.focus();
    const len = input.value.length;
    input.setSelectionRange(len, len);
  });
}

function clearSearch(){
  const input = $('search-input');
  if(input) input.value = '';
  const clearBtn = $('search-clear');
  if(clearBtn) clearBtn.style.display = 'none';
  _searchFilters = { category:null, grade:null, favOnly:false, tag:null };
  showView('view-cats');
  _syncSearchBar();
}

function ensureFilterBar(){
  if($('search-filters')) return;
  const host = $('view-search');
  const bar = document.createElement('div');
  bar.id = 'search-filters';
  bar.className = 'filter-bar';
  host.insertBefore(bar, $('search-results'));
}

function renderSearchFilterBar(){
  const bar = $('search-filters');
  if(!bar) return;
  const catChips = cats.map(c =>
    `<button class="filter-chip ${_searchFilters.category===c.key?'on':''}" style="--cc:${c.color}" onclick="toggleFilter('category','${c.key}')">${c.ar}</button>`
  ).join('');
  const grades = Object.entries(REL_LABEL).map(([k,label]) =>
    `<button class="filter-chip ${_searchFilters.grade===k?'on':''}" onclick="toggleFilter('grade','${k}')">${icon(REL_ICON[k], 12)} ${label}</button>`
  ).join('');
  const tags = getAvailableTags().map(t =>
    `<button class="filter-chip tag ${_searchFilters.tag===t?'on':''}" onclick="toggleFilter('tag','${esc(t)}')">#${esc(t)}</button>`
  ).join('');
  const favChip = `<button class="filter-chip ${_searchFilters.favOnly?'on':''}" onclick="toggleFilter('favOnly',true)">${icon('favorite-filled', 12)} Favorites only</button>`;
  const hasAny = _searchFilters.category || _searchFilters.grade
    || _searchFilters.favOnly || _searchFilters.tag;
  const clearBtn = hasAny
    ? `<button class="filter-chip clear" onclick="clearFilters()">${icon('x', 12)} Clear filters</button>`
    : '';
  bar.innerHTML = `${clearBtn} <div class="filter-group"> <span class="filter-label">Category</span> <div class="filter-row">${catChips}</div> </div> <div class="filter-group"> <span class="filter-label">Grade</span> <div class="filter-row">${grades}${favChip}</div> </div> ${tags ? `<div class="filter-group"> <span class="filter-label">Tags</span> <div class="filter-row">${tags}</div> </div>` : ''}`;
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