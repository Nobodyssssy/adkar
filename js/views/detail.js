'use strict';

function openDetail(id){
  const d = data.find(x => x.id === id);
  if(!d) return;
  detailId = id;

  /* Save scroll position BEFORE locking body */
  window._adkarSavedScroll = window.scrollY || window.pageYOffset || 0;

  const catKey = Array.isArray(d.categories) ? d.categories[0] : null;
  const cat = getCat(catKey);
  const k = `c_${id}`;
  if(!counters[k]) counters[k] = 0;

  const isFav = favs.includes(id);
  $('d-cat-lbl').textContent = cat.ar;
  const favBtn = $('d-fav-btn');
  favBtn.innerHTML = icon(isFav ? 'favorite-filled' : 'favorite-empty', 20);
  favBtn.style.color = isFav ? 'var(--accent2)' : 'var(--text3)';
  favBtn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');

  const relBadge = d.reliability
    ? `<div style="display:flex;justify-content:center">
         <span class="badge badge-${d.reliability}" style="font-size:12px;padding:3px 10px">${icon(REL_ICON[d.reliability], 12)} ${REL_LABEL[d.reliability]}</span>
       </div>`
    : '';
  const translit = d.transliteration
    ? `<div class="translit-box">${esc(d.transliteration)}</div>`
    : '';

  /* Show all categories + tags in the detail view */
  const catChips = renderCatChips(d.categories);
  const tagChips = '';
  const chipsRow = (catChips || tagChips)
    ? `<div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap">${catChips}${tagChips}</div>`
    : '';

  $('d-body').innerHTML = `
    ${d.situation ? `<div><span class="situation-pill">${d.situation}</span></div>` : ''}
    <div class="arabic-big">${d.arabic}</div>
    ${translit}
    ${relBadge}
    ${chipsRow}
    ${d.hadith ? `<div class="info-box hadith-box"><div class="info-label">${icon('book-open', 14)} Source</div>${d.hadith}</div>` : ''}
    ${d.virtue ? `<div class="info-box virtue-box"><div class="info-label">${icon('sparkles', 14)} Virtue</div>${d.virtue}</div>` : ''}
    <div class="counter-wrap">
      <div class="info-label" style="text-align:center;margin-bottom:12px;direction:ltr">Counter</div>
      <div class="counter-row">
        <button class="cbtn" onclick="dec(${id})">${icon('minus', 20)}</button>
        <div>
          <div class="cval" id="cv-${id}">${counters[k]}</div>
          <div class="ctgt">Target: ${d.repeat}×</div>
        </div>
        <button class="cbtn" onclick="inc(${id})">${icon('plus', 20)}</button>
      </div>
      <div class="pbar"><div class="pfill" id="cp-${id}" style="width:${Math.min(100, Math.round(counters[k]/d.repeat*100))}%"></div></div>
      <button class="reset-btn" onclick="resetCtr(${id})" data-icon="rotate-ccw">
        <span class="btn-icon"></span>
        <span>Reset</span>
      </button>
    </div>`;
  $('ov-detail').classList.add('open');
  lockBody();

  if(typeof injectHeaderIcons === 'function'){
    setTimeout(() => injectHeaderIcons(), 0);
  }
}

function closeDetail(){
  $('ov-detail').classList.remove('open');
  detailId = null;
  unlockBody();

  if(currentCat) renderAdkarGrid();
  renderCatsGrid();

  requestAnimationFrame(() => {
    const y = window._adkarSavedScroll || 0;
    window.scrollTo(0, y);
  });
}

function inc(id){
  const k = `c_${id}`;
  const d = data.find(x => x.id === id);
  counters[k] = (counters[k] || 0) + 1;
  persistCounters();
  $(`cv-${id}`).textContent = counters[k];
  $(`cp-${id}`).style.width = Math.min(100, Math.round(counters[k]/d.repeat*100)) + '%';
  if(counters[k] === d.repeat) toast('Completed', 'check-circle');
}

function dec(id){
  const k = `c_${id}`;
  const d = data.find(x => x.id === id);
  if((counters[k] || 0) > 0) counters[k]--;
  persistCounters();
  $(`cv-${id}`).textContent = counters[k];
  $(`cp-${id}`).style.width = Math.min(100, Math.round(counters[k]/d.repeat*100)) + '%';
}

function resetCtr(id){
  counters[`c_${id}`] = 0;
  store.setCounter(id, 0);
  $(`cv-${id}`).textContent = 0;
  $(`cp-${id}`).style.width = '0%';
}