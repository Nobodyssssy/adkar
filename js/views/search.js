'use strict';

function handleSearch(){
  const raw = $('search-input').value.trim();
  $('search-clear').style.display = raw ? 'block' : 'none';
  if(!raw){ showView('view-cats'); return; }

  const nq = normalizeAr(raw);
  const ne = normalizeEn(raw);

  const results = data.filter(d => {
    const hay = [
      normalizeAr(d.arabic),
      normalizeAr(d.situation || ''),
      normalizeAr(d.hadith   || ''),
      normalizeAr(d.virtue   || '')
    ].join(' ');
    const hayLatin = normalizeEn([
      d.transliteration, d.hadith, d.virtue,
      ...(Array.isArray(d.tags) ? d.tags : [])
    ].join(' '));
    return (nq && fuzzyMatch(hay, nq)) || (ne && fuzzyMatch(hayLatin, ne));
  });

  $('search-count').textContent = `${results.length} result(s) for "${raw}"`;
  const el = $('search-results');
  if(!results.length){
    el.innerHTML = `<div class="adkar-empty">
      <div class="adkar-empty-icon">🔍</div>
      <div>No results</div>
    </div>`;
  } else {
    el.innerHTML = results.map(d => {
      const catKey = Array.isArray(d.categories) ? d.categories[0] : null;
      const cat = getCat(catKey);
      return `<div class="search-result-card" style="--cc:${cat.color}" onclick="openDetail(${d.id})">
        <div class="src-cat-label" style="color:${cat.color}">${cat.ar}</div>
        ${d.situation ? `<div class="src-situation">${d.situation}</div>` : ''}
        <div class="src-text">${d.arabic.slice(0,120)}${d.arabic.length>120?'...':''}</div>
      </div>`;
    }).join('');
  }
  showView('view-search');
}

function clearSearch(){
  $('search-input').value = '';
  $('search-clear').style.display = 'none';
  showView('view-cats');
}