'use strict';

/* ── Body scroll lock helpers ── */
function lockBody(){
  document.body.classList.add('modal-open');
}
function unlockBody(){
  /* Only unlock if NO other .ov is open */
  const anyOpen = document.querySelector('.ov.open, .session-overlay.open');
  if(!anyOpen) document.body.classList.remove('modal-open');
}

function openCatMgr(){
  renderCatListBody();
  $('ov-cats').classList.add('open');
  lockBody();
}

function closeCatMgr(){
  $('ov-cats').classList.remove('open');
  $('newcat-form').style.display = 'none';
  unlockBody();
}

function renderCatListBody(){
  const el = $('cat-list-body');
  if(!cats.length){
    el.innerHTML = `<div style="text-align:center;color:var(--text3);padding:14px">No categories</div>`;
    return;
  }
  el.innerHTML = cats.map(c => {
    const n = data.filter(d => d.cat === c.key).length;
    return `<div class="cat-list-row">
      <span class="clr-dot" style="background:${c.color}"></span>
      <span class="clr-ar">${c.ar}</span>
      <span class="clr-en">${c.en}</span>
      <span class="clr-n">(${n})</span>
      <div class="clr-acts">
        <button class="crb edit" onclick="event.stopPropagation();openEditCat('${c.key}')">✏️</button>
        <button class="crb del" onclick="event.stopPropagation();askDelCat('${c.key}')">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function toggleNewCatForm(){
  const f = $('newcat-form');
  const isHidden = f.style.display === 'none' || f.style.display === '';
  if(isHidden){
    f.style.display = 'flex';
    f.style.flexDirection = 'column';
    newColor = PAL[0];
    renderSwatches('sw-new', newColor, c => { newColor = c; });
  } else {
    f.style.display = 'none';
  }
}

function addCat(){
  const ar = $('nc-ar').value.trim();
  const en = $('nc-en').value.trim();
  if(!ar || !en){ toast('⚠️ Both names required'); return; }
  cats.push({key:'cat_'+(nextCk++), ar, en, color:newColor});
  saveCats();
  $('nc-ar').value = '';
  $('nc-en').value = '';
  $('newcat-form').style.display = 'none';
  renderCatListBody();
  renderCatsGrid();
  toast('✅ Category added');
}

function openEditCat(key){
  const c = getCat(key);
  editCatKey = key;
  editColor = c.color;
  $('ec-ar').value = c.ar;
  $('ec-en').value = c.en;
  /* Ensure swatches render AFTER modal is in DOM/open, avoids race */
  renderSwatches('sw-edit', c.color, col => { editColor = col; });
  $('ov-editcat').classList.add('open');
  lockBody();
}

function closeEditCat(){
  $('ov-editcat').classList.remove('open');
  editCatKey = null;
  unlockBody();
  /* If cat manager is still open underneath, keep it visible */
  if($('ov-cats').classList.contains('open')) renderCatListBody();
}

function saveEditCat(){
  const ar = $('ec-ar').value.trim();
  const en = $('ec-en').value.trim();
  if(!ar || !en){ toast('⚠️ Both names required'); return; }
  const i = cats.findIndex(c => c.key === editCatKey);
  if(i < 0){ closeEditCat(); return; }
  cats[i] = {...cats[i], ar, en, color:editColor};
  saveCats();
  closeEditCat();
  renderCatListBody();
  renderCatsGrid();
  toast('✏️ Category updated');
}

/* Swatch rendering — uses data-color, robust to browser differences */
function renderSwatches(cid, selected, cb){
  const host = $(cid);
  if(!host) return;
  host.innerHTML = PAL.map(c =>
    `<span class="sw ${c === selected ? 'on' : ''}" data-color="${c}"
       style="background:${c}" onclick="pickSw('${cid}','${c}')"></span>`
  ).join('');
  window['_cb_' + cid] = cb;
}

function pickSw(cid, color){
  const host = $(cid);
  if(!host) return;
  host.querySelectorAll('.sw').forEach(s => {
    s.classList.toggle('on', s.dataset.color === color);
  });
  const cb = window['_cb_' + cid];
  if(typeof cb === 'function') cb(color);
}