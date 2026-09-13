'use strict';

function renderAdkarGrid(){
  const items = data.filter(d => d.cat === currentCat);
  const g = $('adkar-grid');
  if(!items.length){
    g.innerHTML = `<div class="adkar-empty">
      <div class="adkar-empty-icon">📿</div>
      <div>No adkar yet.<br>Tap ＋ Add to create one.</div>
    </div>`;
    return;
  }
  g.innerHTML = items.map(d => adkarCardHTML(d, getCat(d.cat))).join('');
}

function adkarCardHTML(d, catObj){
  const cat = catObj || getCat(d.cat);
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
  return `<div class="adkar-card ${isFav?'fav-glow':''}" style="--cc:${cat.color}" onclick="openDetail(${d.id})">
    <div class="adkar-left">
      ${d.situation ? `<div class="adkar-situation">${d.situation}</div>` : ''}
      <div class="adkar-text">${d.arabic.length > 110 ? d.arabic.slice(0,110)+'...' : d.arabic}</div>
      ${translit}
      <div class="adkar-badges">
        <span class="badge badge-repeat">× ${d.repeat}</span>
        ${relBadge}
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