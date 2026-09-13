'use strict';

function startSession(){
  const items = data.filter(d => d.cat === currentCat);
  if(!items.length){ toast('No adkar in this category'); return; }
  sessItems = [...items];
  sessIdx = 0;
  sessTapCount = 0;
  $('sess-title').textContent = getCat(currentCat).ar;
  $('session-overlay').classList.add('open');
  lockBody();
  renderSessionStep();
}

function closeSession(){
  $('session-overlay').classList.remove('open');
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
    ? `<span class="badge badge-${d.reliability}" style="font-size:12px;padding:3px 10px">${REL_LABEL[d.reliability]}</span>`
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
    </div>
    ${d.hadith ? `<div class="session-info session-hadith"><strong style="color:var(--accent)">📖</strong> ${d.hadith}</div>` : ''}
    ${d.virtue ? `<div class="session-info session-virtue"><strong style="color:var(--green)">✨</strong> ${d.virtue}</div>` : ''}
    <div class="session-counter-area">
      <button class="session-tap-btn ${isDone?'done':''}" id="sess-tap" onclick="sessionTap(${d.id},${d.repeat})">
        <span id="sess-tap-num">${sessTapCount}</span>
        <span class="session-tap-label">TAP</span>
      </button>
      <div class="session-count-display" id="sess-count-disp">${isDone ? '✅ Done' : remaining + ' left'}</div>
      <div class="session-prog-bar">
        <div class="session-prog-fill ${isDone?'done-fill':''}" id="sess-pfill" style="width:${pct}%"></div>
      </div>
    </div>`;

  $('sess-next-btn').textContent = sessIdx < sessItems.length - 1 ? 'Next →' : 'Finish ✓';
  $('sess-footer').style.display = 'flex';
}

function sessionTap(id, target){
  const k = `c_${id}`;
  counters[k] = (counters[k] || 0) + 1;
  persistCounters();
  sessTapCount = counters[k];
  const pct = Math.min(100, Math.round(sessTapCount / target * 100));
  const isDone = sessTapCount >= target;
  $('sess-tap-num').textContent = sessTapCount;
  $('sess-count-disp').textContent = isDone ? '✅ Done' : Math.max(0, target - sessTapCount) + ' left';
  $('sess-pfill').style.width = pct + '%';
  const tapBtn = $('sess-tap');
  if(isDone){
    tapBtn.classList.add('done');
    $('sess-pfill').classList.add('done-fill');
    toast('✅ Completed');
  }
}

function sessionNext(){
  sessIdx++;
  sessTapCount = 0;
  if(sessIdx >= sessItems.length) renderSessionDone();
  else renderSessionStep();
}

function sessionSkip(){
  sessIdx++;
  sessTapCount = 0;
  if(sessIdx >= sessItems.length) renderSessionDone();
  else renderSessionStep();
}

function sessionPrev(){
  if(sessIdx === 0) return;
  sessIdx--;
  /* Bug fix #6: reload tap count from storage so going back is consistent */
  sessTapCount = 0;
  renderSessionStep();
}

function renderSessionDone(){
  $('sess-body').innerHTML = `
    <div class="session-done">
      <div class="session-done-icon">🌟</div>
      <div class="session-done-title">Session complete!</div>
      <div class="session-done-title" style="font-size:18px">جزاك الله خيراً</div>
      <div class="session-done-sub">You completed all ${sessItems.length} adkar in this session.</div>
      <button class="btn-session-next" onclick="closeSession()" style="margin-top:8px">Back ←</button>
    </div>`;
  $('sess-footer').style.display = 'none';
  $('sess-back-btn').style.opacity = '0.3';
  $('sess-back-btn').style.pointerEvents = 'none';
}