'use strict';

async function startSession(){
  let items = data.filter(d =>
    Array.isArray(d.categories) && d.categories.includes(currentCat)
  );
  const activeTag = (typeof _tagFilters !== 'undefined' && _tagFilters[currentCat]) ? _tagFilters[currentCat] : null;
  if(activeTag){
    items = items.filter(d => Array.isArray(d.tags) && d.tags.includes(activeTag));
  }
  if(!items.length){ toast('No adkar in this selection'); return; }

  sessItems = [...items].sort((a, b) => {
    const ra = a.repeat || 1;
    const rb = b.repeat || 1;
    if(ra !== rb) return ra - rb;
    return (a.id || 0) - (b.id || 0);
  });

  sessIdx = 0;
  sessTapCount = 0;

  /* Resume at the first incomplete dhikr, based on live counters. */
  sessIdx = 0;
  for(let i = 0; i < sessItems.length; i++){
    const d = sessItems[i];
    const k = `c_${d.id}`;
    if((counters[k] || 0) < d.repeat){ sessIdx = i; break; }
    if(i === sessItems.length - 1) sessIdx = i;
  }
  sessTapCount = counters[`c_${sessItems[sessIdx].id}`] || 0;

  const titleBase = getCat(currentCat).ar;
  const titleTag  = activeTag ? ' · ' + ((typeof _tagLabel === 'function') ? _tagLabel(activeTag) : activeTag) : '';
  $('sess-title').textContent = titleBase + titleTag;

  $('session-overlay').classList.add('open');
  $('session-overlay').classList.remove('is-done');
  $('sess-body').style.borderBottom = '';
  $('sess-body').style.borderRadius = '';
  lockBody();
  renderSessionStep();
}

function closeSession(){
  $('session-overlay').classList.remove('open');
  $('session-overlay').classList.remove('is-done');
  var body = $('sess-body');
  body.style.borderBottom = '';
  body.style.borderRadius = '';
  unlockBody();
  renderAdkarGrid();
  renderCatsGrid();
}

function renderSessionStep(){
  if(sessIdx >= sessItems.length){ renderSessionDone(); return; }
  const d = sessItems[sessIdx];
  const k = `c_${d.id}`;
  if(!counters[k]) counters[k] = 0;
  sessTapCount = counters[k];
  const remaining = Math.max(0, d.repeat - sessTapCount);
  const pct = Math.min(100, Math.round(sessTapCount / d.repeat * 100));
  const isDone = sessTapCount >= d.repeat;

  $('sess-prog-text').textContent = `${sessIdx + 1} / ${sessItems.length}`;
  $('sess-back-btn').style.opacity = sessIdx === 0 ? '0.3' : '1';
  $('sess-back-btn').style.pointerEvents = sessIdx === 0 ? 'none' : 'auto';

  const relBadge = d.reliability
    ? `<span class="badge badge-${d.reliability}" style="font-size:12px;padding:3px 10px">${icon(REL_ICON[d.reliability], 12)} ${REL_LABEL[d.reliability]}</span>`
    : '';
  const translit = d.transliteration
    ? `<div class="session-info" style="background:var(--surface2);border:1px solid var(--border);direction:ltr;text-align:center;font-style:italic;font-size:12px;color:var(--text3)">${esc(d.transliteration)}</div>`
    : '';

  $('sess-body').innerHTML = `
    ${d.situation ? `<div class="session-situation">${d.situation}</div>` : ''}
    <div class="session-arabic">${d.arabic}</div>
    ${translit}
    <div class="session-badges">
      <span class="badge badge-repeat" style="font-size:12px;padding:3px 10px">× ${d.repeat}</span>
      ${relBadge}
      ${renderTagChips(d.tags)}
    </div>
    ${d.hadith ? `<div class="session-info session-hadith">${d.hadith}</div>` : ''}
    ${d.virtue ? `<div class="session-info session-virtue">${d.virtue}</div>` : ''}
    <div class="session-counter-area">
      <button class="session-tap-btn ${isDone?'done':''}" id="sess-tap" onclick="sessionTap(${d.id},${d.repeat})">
        <span id="sess-tap-num">${sessTapCount}</span>
        <span class="session-tap-label">TAP</span>
      </button>
      <div class="session-count-display" id="sess-count-disp">${isDone ? 'Done' : remaining + ' left'}</div>
      <div class="session-prog-bar">
        <div class="session-prog-fill ${isDone?'done-fill':''}" id="sess-pfill" style="width:${pct}%"></div>
      </div>
    </div>`;

  $('sess-next-btn').textContent = sessIdx < sessItems.length - 1 ? 'Next' : 'Finish';
  $('sess-next-btn').classList.toggle('done', isDone);
  $('sess-footer').style.display = 'flex';

  var body = $('sess-body');
  body.style.borderBottom = '';
  body.style.borderRadius = '';
}

async function _saveSessProgress(){
  if(!currentCat || sessIdx >= sessItems.length) return;
  try{
    await store.setMeta('sessProgress', {
      cat: currentCat,
      idx: sessIdx,
      tap: sessTapCount,
    });
  }catch(e){ console.warn('[sess] save progress failed', e); }
}

async function _clearSessProgress(){
  try{ await store.setMeta('sessProgress', null); }catch(e){}
}

function sessionTap(id, target){
  const k = `c_${id}`;
  counters[k] = (counters[k] || 0) + 1;
  persistCounters();
  sessTapCount = counters[k];
  _saveSessProgress();

  const pct = Math.min(100, Math.round(sessTapCount / target * 100));
  const isDone = sessTapCount >= target;

  $('sess-tap-num').textContent = sessTapCount;
  $('sess-count-disp').textContent = isDone ? 'Done' : Math.max(0, target - sessTapCount) + ' left';
  $('sess-pfill').style.width = pct + '%';

  const tapBtn = $('sess-tap');
  const nextBtn = $('sess-next-btn');
  if(isDone){
    tapBtn.classList.add('done');
    nextBtn.classList.add('done');
    $('sess-pfill').classList.add('done-fill');
    toast('Completed', 'check');
  } else {
    tapBtn.classList.remove('done');
    nextBtn.classList.remove('done');
    $('sess-pfill').classList.remove('done-fill');
  }
}

function sessionNext(){
  sessIdx++; sessTapCount = 0;
  if(sessIdx >= sessItems.length){ _clearSessProgress(); renderSessionDone(); }
  else { renderSessionStep(); _saveSessProgress(); }
}

function sessionSkip(){
  sessIdx++; sessTapCount = 0;
  if(sessIdx >= sessItems.length){ _clearSessProgress(); renderSessionDone(); }
  else { renderSessionStep(); _saveSessProgress(); }
}

function sessionPrev(){
  if(sessIdx === 0) return;
  sessIdx--; sessTapCount = 0;
  renderSessionStep();
  _saveSessProgress();
}

function renderSessionDone(){
  $('sess-body').innerHTML = `
    <div class="session-done">
      <div class="session-done-icon">${icon('check-circle', 64)}</div>
      <div class="session-done-title">Session complete!</div>
      <div class="session-done-title" style="font-size:18px">جزاك الله خيراً</div>
      <div class="session-done-sub">You completed all ${sessItems.length} adkar in this session.</div>
      <button class="btn-session-next" onclick="closeSession()" style="margin-top:8px">Back</button>
    </div>`;
  $('sess-footer').style.display = 'none';
  $('session-overlay').classList.add('is-done');

  if(window.innerWidth >= 768){
    var body = $('sess-body');
    body.style.borderBottom = '1px solid var(--border)';
    body.style.borderRadius = '0 0 20px 20px';
  }
  $('sess-back-btn').style.opacity = '0.3';
  $('sess-back-btn').style.pointerEvents = 'none';
}