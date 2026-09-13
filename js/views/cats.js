'use strict';

/* ═══════════════════════════════════════════════════════════
   Categories grid
   Counts items by checking categories.includes(key)
   ═══════════════════════════════════════════════════════════ */

function renderCatsGrid(){
  /* Render the daily quote card above the categories */
  if(typeof renderQuoteCard === 'function') renderQuoteCard();

  const g = $('cats-grid');
  g.innerHTML = cats.map(c => {
    const items = data.filter(d =>
      Array.isArray(d.categories) && d.categories.includes(c.key)
    );
    const n = items.length;
    const done = items.filter(d => (counters[`c_${d.id}`]||0) >= d.repeat).length;
    const pct = n > 0 ? Math.round(done / n * 100) : 0;
    const icon = CAT_ICONS[c.key] || '📿';
    return `<div class="cat-card" style="--cc:${c.color}" onclick="openCat('${c.key}')">
      <div class="cat-icon" style="background:${c.color}22">${icon}</div>
      <div class="cat-name">${c.ar}</div>
      <div class="cat-en">${c.en}</div>
      <span class="cat-count" style="color:${c.color};border-color:${c.color};background:${c.color}18">${n} adkar</span>
      ${n>0?`<div class="cat-prog-bar"><div class="cat-prog-fill" style="width:${pct}%;background:${c.color}"></div></div>
      <div style="font-size:10px;color:var(--text3)">${done}/${n} done today</div>`:''}
      <div class="cat-edit-row" onclick="event.stopPropagation()">
        <button class="cat-sm-btn edit" onclick="openEditCat('${c.key}')">✏️</button>
        <button class="cat-sm-btn del" onclick="askDelCat('${c.key}')">🗑️</button>
      </div>
    </div>`;
  }).join('')
  + `<div class="cat-new-card" onclick="openCatMgr()">
       <span style="font-size:24px">＋</span><span>New category</span>
     </div>`;
}

function openCat(key){
  currentCat = key;
  $('adkar-view-title').textContent = getCat(key).ar;
  renderAdkarGrid();
  showView('view-adkar');
}

function showView(id){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(id).classList.add('active');
}

function goHome(){
  showView('view-cats');
  currentCat = null;
  clearSearch();
  $('btn-favs').classList.remove('active');
  renderCatsGrid();
}

function toggleTheme(){
  isLight = !isLight;
  document.body.classList.toggle('light', isLight);
  $('theme-btn').textContent = isLight ? '☀️' : '🌙';
}