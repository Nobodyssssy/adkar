'use strict';

/* ═══════════════════════════════════════════════════════════
   Asma al-Husna view
   • Grid of 99 names
   • Search + filter (all / memorized / not)
   • Detail modal with AR/EN toggle
   • Flashcard recitation mode with direction picker
   ═══════════════════════════════════════════════════════════ */

let _asmaLang = 'ar';        /* 'ar' | 'en' */
let _asmaFilter = 'all';     /* 'all' | 'memorized' | 'not-memorized' */
let _asmaQuery = '';

/* Flashcard state */
let _flashDeck = null;
let _flashIdx = 0;
let _flashRevealed = false;
let _flashMode = 'memorized';        /* 'memorized' | 'not-memorized' | 'all' */
let _flashDirection = 'meaning-to-name';   /* 'meaning-to-name' | 'name-to-meaning' | 'mixed' */
let _flashCardDirection = 'meaning-to-name';  /* computed per card in mixed mode */
let _flashStats = { correct: 0, missed: 0 };

/* ═══════════════════════════════════════════════════════════
   Entry / exit
   ═══════════════════════════════════════════════════════════ */
async function openAsmaView(){
  await loadMemorized();
  _asmaQuery = '';
  _asmaFilter = 'all';
  showView('view-asma');
  renderAsmaGrid();
}

function closeAsmaView(){
  stopFlashcards();
  goHome();
}

/* ═══════════════════════════════════════════════════════════
   GRID
   ═══════════════════════════════════════════════════════════ */
function renderAsmaGrid(){
  const host = $('asma-body');
  if(!host) return;

  let list = searchAsma(_asmaQuery);
  if(_asmaFilter === 'memorized')     list = filterMemorized(list);
  if(_asmaFilter === 'not-memorized') list = filterNotMemorized(list);

  const total = ASMA_NAMES.length;
  const memo = getMemorizedCount();
  const pct = Math.round(memo / total * 100);

  host.innerHTML = `
    <div class="asma-header">
      <div class="asma-title-block">
        <div class="asma-title">${_asmaLang === 'ar' ? 'أسماء الله الحسنى' : 'Asma al-Husna'}</div>
        <div class="asma-subtitle">${_asmaLang === 'ar' ? 'الأسماء التسعة والتسعون' : 'The 99 Names of Allah'}</div>
      </div>
      <div class="asma-lang-toggle">
        <button class="quote-lang-btn ${_asmaLang==='ar'?'on':''}" onclick="setAsmaLang('ar')">عربي</button>
        <button class="quote-lang-btn ${_asmaLang==='en'?'on':''}" onclick="setAsmaLang('en')">EN</button>
      </div>
    </div>

    <div class="asma-progress-card">
      <div class="asma-progress-text">
        <span class="asma-progress-count">${memo} / ${total}</span>
        <span class="asma-progress-label">${_asmaLang === 'ar' ? 'محفوظة' : 'memorized'}</span>
      </div>
      <div class="asma-progress-bar">
        <div class="asma-progress-fill" style="width:${pct}%"></div>
      </div>
      <button class="btn-save asma-flash-btn" onclick="startFlashcards()">
        ${_asmaLang === 'ar' ? '🎴 بدء المراجعة' : '🎴 Start flashcards'}
      </button>
    </div>

    <div class="asma-search-wrap">
      <input type="text" id="asma-search" class="fi" placeholder="${
        _asmaLang === 'ar' ? 'ابحث في الأسماء...' : 'Search names...'
      }" value="${esc(_asmaQuery)}" oninput="onAsmaSearch(this.value)">
    </div>

    <div class="asma-filters">
<button class="filter-chip ${_asmaFilter==='memorized'?'on':''}" onclick="setAsmaFilter('memorized')">
  ${_asmaLang === 'ar' ? 'محفوظة' : 'Memorized'} (${memo})
</button>
<button class="filter-chip ${_asmaFilter==='not-memorized'?'on':''}" onclick="setAsmaFilter('not-memorized')">
  ${_asmaLang === 'ar' ? 'غير محفوظة' : 'Not yet'} (${total - memo})
</button>
    </div>

    ${list.length === 0
      ? `<div class="adkar-empty">
           <div class="adkar-empty-icon">🔍</div>
           <div>${_asmaLang === 'ar' ? 'لا توجد نتائج' : 'No results'}</div>
         </div>`
      : `<div class="asma-grid">
           ${list.map(n => asmaCardHTML(n)).join('')}
         </div>`}
  `;
    if(typeof injectHeaderIcons === 'function'){
    setTimeout(() => injectHeaderIcons(), 0);
  }
}

function asmaCardHTML(n){
  const isMemo = isMemorized(n.id);
  const display = _asmaLang === 'ar' ? n.ar : n.transliteration;
  const sub = _asmaLang === 'ar' ? n.transliteration : n.meaningEn;

  return `<div class="asma-card ${isMemo?'memo':''}" onclick="openAsmaDetail(${n.id})">
    <div class="asma-card-num">${n.id}</div>
    <div class="asma-card-ar">${display}</div>
    <div class="asma-card-sub">${esc(sub)}</div>
    ${isMemo ? `<div class="asma-card-check">${icon('check', 16)}</div>` : ''}
  </div>`;
}

/* ═══════════════════════════════════════════════════════════
   UI handlers
   ═══════════════════════════════════════════════════════════ */
async function openAsmaView(){
  await loadMemorized();
  _asmaQuery = '';
  _asmaFilter = 'all';
  showView('view-asma');
  renderAsmaGrid();
  /* Always start at top when opening the view */
  window.scrollTo(0, 0);
}

let _asmaSearchTimer;
function onAsmaSearch(value){
  clearTimeout(_asmaSearchTimer);
  _asmaQuery = value;
  _asmaSearchTimer = setTimeout(() => {
    renderAsmaGrid();
    const input = $('asma-search');
    if(input){
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, 200);
}

/* ═══════════════════════════════════════════════════════════
   DETAIL MODAL
   ═══════════════════════════════════════════════════════════ */
function openAsmaDetail(id){
  const n = getAsmaById(id);
  if(!n) return;

  /* Save scroll position BEFORE locking body */
  window._asmaSavedScroll = window.scrollY || window.pageYOffset || 0;

  ensureAsmaDetailModal();
  renderAsmaDetail(n, _asmaLang);

  $('ov-asma-detail').classList.add('open');
  lockBody();
}

function renderAsmaDetail(n, lang){
  const isMemo = isMemorized(n.id);
  $('asma-detail-title').innerHTML = `${lang === 'ar' ? n.ar : n.transliteration} <span class="asma-detail-id">#${n.id}</span>`;

  $('asma-detail-body').innerHTML = `
    <div class="asma-detail-hero">
      <div class="asma-detail-ar">${n.ar}</div>
      <div class="asma-detail-translit">${esc(n.transliteration)}</div>
      <div class="asma-detail-meaning">${esc(n.meaningEn)}</div>
    </div>

  <div class="asma-detail-actions">
    <button class="btn-save ${isMemo?'memo':''}" onclick="toggleAsmaMemo(${n.id})">
      ${isMemo
        ? (lang === 'ar' ? 'محفوظ ✓' : 'Memorized ✓')
        : (lang === 'ar' ? 'ضع علامة محفوظ' : 'Mark as memorized')}
    </button>
  </div>

    <div class="asma-detail-tafsir ${lang==='ar'?'ar':'en'}">
      ${lang === 'ar' ? n.tafsirAr : n.tafsirEn}
    </div>

    <div class="asma-detail-actions">
      <button class="btn-save ${isMemo?'memo':''}" onclick="toggleAsmaMemo(${n.id})">
        ${isMemo
          ? (lang === 'ar' ? '✅ محفوظ' : '✅ Memorized')
          : (lang === 'ar' ? '⏳ ضع علامة محفوظ' : '⏳ Mark as memorized')}
      </button>
    </div>

    ${n.videoUrl
      ? `<div class="asma-detail-video"><a href="${n.videoUrl}" target="_blank" rel="noopener">📺 ${lang === 'ar' ? 'شاهد الشرح' : 'Watch explanation'}</a></div>`
      : ''}
  `;
}

function closeAsmaDetail(){
  const modal = $('ov-asma-detail');
  if(modal) modal.classList.remove('open');
  unlockBody();

  /* Refresh grid first, then restore scroll position */
  renderAsmaGrid();

  /* Restore saved position after layout settles */
  requestAnimationFrame(() => {
    const y = window._asmaSavedScroll || 0;
    window.scrollTo(0, y);
  });
}

function setAsmaDetailLang(id, lang){
  _asmaLang = lang;
  const n = getAsmaById(id);
  if(!n) return;
  renderAsmaDetail(n, lang);
}

async function toggleAsmaMemo(id){
  await toggleMemorized(id);
  const n = getAsmaById(id);
  if(n) renderAsmaDetail(n, _asmaLang);
  /* Don't re-render the grid while modal is open — it's visible behind
     and would reset scroll. We refresh it on close instead. */
}

function ensureAsmaDetailModal(){
  if($('ov-asma-detail')) return;

  const modal = document.createElement('div');
  modal.className = 'ov center';
  modal.id = 'ov-asma-detail';
  modal.setAttribute('onclick', 'if(event.target===this)closeAsmaDetail()');
  modal.innerHTML = `
    <div class="modal-box" style="max-width:520px">
      <div class="mh">
        <h2 id="asma-detail-title"></h2>
        <button class="btn-close" onclick="closeAsmaDetail()">✕</button>
      </div>
      <div class="mb" id="asma-detail-body"></div>
    </div>`;
  document.body.appendChild(modal);
}

/* ═══════════════════════════════════════════════════════════
   FLASHCARDS
   ═══════════════════════════════════════════════════════════ */

/* ── Entry point ── */
async function startFlashcards(){
  ensureFlashOverlay();
  await loadMemorized();

  /* If nothing memorized yet → skip picker, start with all */
  if(getMemorizedCount() === 0){
    _flashMode = 'all';
    _flashDirection = 'meaning-to-name';
    launchFlashDeck();
    return;
  }

  showFlashPicker();
}

/* ── Mode + direction picker ── */
function showFlashPicker(){
	ensureFlashOverlay();
  const memoCount = getMemorizedCount();
  const total = ASMA_NAMES.length;
  const notMemoCount = total - memoCount;
  const ar = _asmaLang === 'ar';

  $('flash-body').innerHTML = `
    <div class="flash-picker">
      <div class="flash-picker-title">${ar ? '🎴 اختر نوع المراجعة' : '🎴 Choose review mode'}</div>

      <div class="flash-picker-section">
        <div class="flash-picker-section-label">${ar ? '📿 الأسماء' : '📿 Which names'}</div>
        <div class="flash-picker-options">
          <button class="flash-picker-btn ${_flashMode==='memorized'?'selected':''}" onclick="setFlashMode('memorized')">
            <div class="flash-picker-icon">✅</div>
            <div class="flash-picker-name">${ar ? 'المحفوظة' : 'Memorized'}</div>
            <div class="flash-picker-count">${memoCount}</div>
          </button>
          <button class="flash-picker-btn ${_flashMode==='not-memorized'?'selected':''}" onclick="setFlashMode('not-memorized')">
            <div class="flash-picker-icon">⏳</div>
            <div class="flash-picker-name">${ar ? 'غير المحفوظة' : 'Not yet'}</div>
            <div class="flash-picker-count">${notMemoCount}</div>
          </button>
          <button class="flash-picker-btn ${_flashMode==='all'?'selected':''}" onclick="setFlashMode('all')">
            <div class="flash-picker-icon">📿</div>
            <div class="flash-picker-name">${ar ? 'الكل' : 'All'}</div>
            <div class="flash-picker-count">${total}</div>
          </button>
        </div>
      </div>

      <div class="flash-picker-section">
        <div class="flash-picker-section-label">${ar ? '🧭 الاتجاه' : '🧭 Direction'}</div>
        <div class="flash-picker-options">
          <button class="flash-picker-btn ${_flashDirection==='meaning-to-name'?'selected':''}" onclick="setFlashDirection('meaning-to-name')">
            <div class="flash-picker-icon">📖</div>
            <div class="flash-picker-name">${ar ? 'المعنى ← الاسم' : 'Meaning → Name'}</div>
            <div class="flash-picker-desc">${ar ? 'الأفضل للحفظ' : 'Best for memorization'}</div>
          </button>
          <button class="flash-picker-btn ${_flashDirection==='name-to-meaning'?'selected':''}" onclick="setFlashDirection('name-to-meaning')">
            <div class="flash-picker-icon">🌙</div>
            <div class="flash-picker-name">${ar ? 'الاسم ← المعنى' : 'Name → Meaning'}</div>
            <div class="flash-picker-desc">${ar ? 'للتعرف على المعنى' : 'Recognition'}</div>
          </button>
          <button class="flash-picker-btn ${_flashDirection==='mixed'?'selected':''}" onclick="setFlashDirection('mixed')">
            <div class="flash-picker-icon">🎯</div>
            <div class="flash-picker-name">${ar ? 'مختلط' : 'Mixed'}</div>
            <div class="flash-picker-desc">${ar ? 'كلاهما بالتناوب' : 'Alternates'}</div>
          </button>
        </div>
      </div>

      <button class="btn-save" style="width:100%;padding:14px;font-size:15px;margin-top:6px"
              onclick="launchFlashDeck()">
        ${ar ? '▶ ابدأ' : '▶ Start'}
      </button>

      <button class="flash-exit" onclick="stopFlashcards()">
        ${ar ? 'إلغاء' : 'Cancel'}
      </button>
    </div>
  `;

  $('flash-overlay').classList.add('open');
  lockBody();
}

function setFlashMode(mode){
  _flashMode = mode;
  showFlashPicker();
}

function setFlashDirection(dir){
  _flashDirection = dir;
  showFlashPicker();
}

/* ── Launch the deck ── */
function launchFlashDeck(){
  ensureFlashOverlay();
  _flashDeck = buildFlashcardDeck(_flashMode);

  if(!_flashDeck.length){
    const ar = _asmaLang === 'ar';
    toast(ar
      ? (_flashMode === 'memorized' ? 'لا توجد أسماء محفوظة بعد' : 'كل الأسماء محفوظة 🎉')
      : (_flashMode === 'memorized' ? 'No memorized names yet' : 'All names memorized 🎉'));
    showFlashPicker();
    return;
  }

  _flashIdx = 0;
  _flashRevealed = false;
  _flashStats = { correct: 0, missed: 0 };
  computeCardDirection();

  /* Always ensure the overlay is open */
  $('flash-overlay').classList.add('open');
  lockBody();

  renderFlashcard();
}

function computeCardDirection(){
  if(_flashDirection === 'mixed'){
    _flashCardDirection = Math.random() < 0.5 ? 'meaning-to-name' : 'name-to-meaning';
  } else {
    _flashCardDirection = _flashDirection;
  }
}

/* ── Render a single card ── */
function renderFlashcard(){
  if(!_flashDeck || !_flashDeck.length){ stopFlashcards(); return; }

  const n = _flashDeck[_flashIdx];
  const total = _flashDeck.length;
  const pos = _flashIdx + 1;
  const ar = _asmaLang === 'ar';
  const isM2N = _flashCardDirection === 'meaning-to-name';

  /* FRONT of the card */
  let front;
  if(isM2N){
    /* Meaning → Name: front = English meaning */
    front = `
      <div class="flash-front-label">${ar ? 'المعنى' : 'Meaning'}</div>
      <div class="flash-front-meaning">${esc(n.meaningEn)}</div>
    `;
  } else {
    /* Name → Meaning: front = Arabic name + transliteration */
    front = `
      <div class="flash-front-ar">${n.ar}</div>
      <div class="flash-front-translit">${esc(n.transliteration)}</div>
    `;
  }

  /* BACK of the card (revealed) */
  let back = '';
  if(_flashRevealed){
    if(isM2N){
      /* Reveal: Arabic + transliteration (not repeating meaning) */
      back = `
        <div class="flash-back-divider"></div>
        <div class="flash-back-ar">${n.ar}</div>
        <div class="flash-back-translit">${esc(n.transliteration)}</div>
      `;
    } else {
      /* Reveal: English meaning + tafsir */
      back = `
        <div class="flash-back-divider"></div>
        <div class="flash-back-meaning">${esc(n.meaningEn)}</div>
        <div class="flash-back-tafsir ${ar?'ar':'en'}">
          ${ar ? n.tafsirAr : n.tafsirEn}
        </div>
      `;
    }
  }

  /* Direction badge (visible at top of card) */
  const dirLabel = isM2N
    ? (ar ? '📖 معنى ← اسم' : '📖 Meaning → Name')
    : (ar ? '🌙 اسم ← معنى' : '🌙 Name → Meaning');

  $('flash-body').innerHTML = `
    <div class="flash-progress">
      <span>${pos} / ${total}</span>
      <span class="flash-progress-dir">${dirLabel}</span>
    </div>

    <div class="flash-card ${_flashRevealed?'revealed':''}" onclick="revealFlashcard()">
      ${front}
      ${back}
      ${!_flashRevealed ? `<div class="flash-hint">${ar ? '🤔 تذكّر ثم اضغط للكشف' : '🤔 Recall, then tap to reveal'}</div>` : ''}
    </div>

    <div class="flash-controls">
      ${_flashRevealed ? `
        <button class="flash-btn miss" onclick="flashNext(false)">
          ${ar ? '✗ نسيت' : '✗ Missed'}
        </button>
        <button class="flash-btn known" onclick="flashNext(true)">
          ${ar ? '✓ أعرفها' : '✓ I knew it'}
        </button>
      ` : `
        <button class="flash-btn reveal" onclick="revealFlashcard()">
          ${ar ? '👁 اكشف الإجابة' : '👁 Reveal answer'}
        </button>
      `}
    </div>

    <div class="flash-footer-actions">
      <button class="flash-exit" onclick="showFlashPicker()">
        ${ar ? '⚙ تغيير الوضع' : '⚙ Change mode'}
      </button>
      <button class="flash-exit" onclick="stopFlashcards()">
        ${ar ? '✕ إنهاء الجلسة' : '✕ End session'}
      </button>
    </div>
  `;

  /* Safety: ensure overlay is open */
  const overlay = $('flash-overlay');
  if(overlay && !overlay.classList.contains('open')){
    overlay.classList.add('open');
    lockBody();
  }
}

function revealFlashcard(){
  if(_flashRevealed) return;
  _flashRevealed = true;
  renderFlashcard();
}

async function flashNext(knewIt){
  const n = _flashDeck[_flashIdx];

  /* Update memorized state based on answer */
  if(knewIt){
    _flashStats.correct++;
    if(!isMemorized(n.id)) await toggleMemorized(n.id);
  } else {
    _flashStats.missed++;
    if(isMemorized(n.id)) await toggleMemorized(n.id);
  }

  _flashRevealed = false;
  _flashIdx++;

  /* End of deck? */
  if(_flashIdx >= _flashDeck.length){
    renderFlashDone();
    renderAsmaGrid();
    return;
  }

  computeCardDirection();
  renderFlashcard();
}

function renderFlashDone(){
  const ar = _asmaLang === 'ar';
  const { correct, missed } = _flashStats;
  const total = correct + missed;

  $('flash-body').innerHTML = `
    <div class="flash-done">
      <div class="flash-done-icon">🎉</div>
      <div class="flash-done-title">${ar ? 'أحسنت!' : 'Session complete!'}</div>
      <div class="flash-done-stats">
        <div class="flash-stat stat-correct">
          <div class="flash-stat-num">${correct}</div>
          <div class="flash-stat-lbl">${ar ? '✓ صحيح' : '✓ Correct'}</div>
        </div>
        <div class="flash-stat stat-missed">
          <div class="flash-stat-num">${missed}</div>
          <div class="flash-stat-lbl">${ar ? '✗ نسيت' : '✗ Missed'}</div>
        </div>
      </div>
      <div class="flash-done-sub">
        ${ar
          ? `راجعت ${total} اسمًا — ${getMemorizedCount()} / ${ASMA_NAMES.length} محفوظة الآن`
          : `Reviewed ${total} names — ${getMemorizedCount()} / ${ASMA_NAMES.length} now memorized`}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;justify-content:center">
        <button class="btn-save" onclick="showFlashPicker()">
          ${ar ? '🔁 مراجعة أخرى' : '🔁 Another round'}
        </button>
        <button class="btn-cancel" onclick="stopFlashcards();renderAsmaGrid()">
          ${ar ? 'رجوع' : 'Back' }
        </button>
      </div>
    </div>
  `;
}

function stopFlashcards(){
  const el = $('flash-overlay');
  if(el) el.classList.remove('open');
  unlockBody();
  /* Reset flash state so next entry is fresh */
  _flashDeck = null;
  _flashIdx = 0;
  _flashRevealed = false;
  _flashStats = { correct: 0, missed: 0 };
}

function ensureFlashOverlay(){
  if($('flash-overlay')) return;

  const el = document.createElement('div');
  el.className = 'flash-overlay';
  el.id = 'flash-overlay';
  el.innerHTML = `
    <div class="flash-header">
      <div class="flash-title">${_asmaLang === 'ar' ? '🎴 المراجعة' : '🎴 Flashcards'}</div>
      <button class="session-close-btn" onclick="stopFlashcards()">✕</button>
    </div>
    <div class="flash-body" id="flash-body"></div>
  `;
  document.body.appendChild(el);
}