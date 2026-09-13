'use strict';

function openDetail(id){
  const d = data.find(x => x.id === id);
  if(!d) return;
  detailId = id;
  const cat = getCat(d.cat);
  const k = `c_${id}`;
  if(!counters[k]) counters[k] = 0;
  const isFav = favs.includes(id);
  $('d-cat-lbl').textContent = cat.ar;
  $('d-fav-btn').textContent = isFav ? '★' : '☆';
  $('d-fav-btn').style.color = isFav ? '#e8c97a' : 'var(--text3)';
  const relBadge = d.reliability
    ? `<div style="display:flex;justify-content:center">
         <span class="badge badge-${d.reliability}" style="font-size:12px;padding:3px 10px">${REL_LABEL[d.reliability]}</span>
       </div>`
    : '';
  const translit = d.transliteration
    ? `<div class="translit-box">${esc(d.transliteration)}</div>`
    : '';
  $('d-body').innerHTML = `
    ${d.situation ? `<div><span class="situation-pill">${d.situation}</span></div>` : ''}
    <div class="arabic-big">${d.arabic}</div>
    ${translit}
    ${relBadge}
    ${d.hadith ? `<div class="info-box hadith-box"><div class="info-label">📖 Source</div>${d.hadith}</div>` : ''}
    ${d.virtue ? `<div class="info-box virtue-box"><div class="info-label">✨ Virtue</div>${d.virtue}</div>` : ''}
    <div class="counter-wrap">
      <div class="info-label" style="text-align:center;margin-bottom:12px;direction:ltr">Counter</div>
      <div class="counter-row">
        <button class="cbtn" onclick="dec(${id})">−</button>
        <div>
          <div class="cval" id="cv-${id}">${counters[k]}</div>
          <div class="ctgt">Target: ${d.repeat}×</div>
        </div>
        <button class="cbtn" onclick="inc(${id})">+</button>
      </div>
      <div class="pbar"><div class="pfill" id="cp-${id}" style="width:${Math.min(100, Math.round(counters[k]/d.repeat*100))}%"></div></div>
      <button class="reset-btn" onclick="resetCtr(${id})">↺ Reset</button>
    </div>`;
  $('ov-detail').classList.add('open');
  lockBody();
}

function closeDetail(){
  $('ov-detail').classList.remove('open');
  detailId = null;
  unlockBody();
  if(currentCat) renderAdkarGrid();
  renderCatsGrid();
}

function inc(id){
  const k = `c_${id}`;
  const d = data.find(x => x.id === id);
  counters[k] = (counters[k] || 0) + 1;
  persistCounters();
  $(`cv-${id}`).textContent = counters[k];
  $(`cp-${id}`).style.width = Math.min(100, Math.round(counters[k]/d.repeat*100)) + '%';
  if(counters[k] === d.repeat) toast('✅ Completed');
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
  saveCtrs();
  $(`cv-${id}`).textContent = 0;
  $(`cp-${id}`).style.width = '0%';
}