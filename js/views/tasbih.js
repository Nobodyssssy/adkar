'use strict';

/* ═══════════════════════════════════════════════════════════
   Tasbih counter view
   • One persisted counter, tap/click/hotkey to increment by 1
   • Settings panel (target, colour, hotkey info)
   ═══════════════════════════════════════════════════════════ */

const TASBIH_COLORS = [
  { key: 'peach', label: 'Peach', accent: '#fab387', glow: 'rgba(250,179,135,.25)' },
  { key: 'green', label: 'Green', accent: '#a6e3a1', glow: 'rgba(166,227,161,.25)' },
  { key: 'gold',  label: 'Gold',  accent: '#c9a84c', glow: 'rgba(201,168,76,.25)'  },
  { key: 'mauve', label: 'Mauve', accent: '#cba6f7', glow: 'rgba(203,166,247,.25)' },
  { key: 'teal',  label: 'Teal',  accent: '#94e2d5', glow: 'rgba(148,226,213,.25)' },
  { key: 'blue',  label: 'Blue',  accent: '#89b4fa', glow: 'rgba(137,180,250,.25)' },
];

const TASBIH_TARGETS = [33, 99, 100];

let _tasbihState = null;

/* ═══════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════ */
async function _loadTasbihState(){
  if(_tasbihState) return _tasbihState;
  const saved = await store.getMeta('tasbih');
  _tasbihState = Object.assign({
    count:        0,
    target:       33,
    customTarget: null,
    color:        'peach',
  }, saved || {});
  return _tasbihState;
}

async function _saveTasbihState(){
  if(!_tasbihState) return;
  await store.setMeta('tasbih', _tasbihState);
}

/* ═══════════════════════════════════════════════════════════
   ENTRY / EXIT
   ═══════════════════════════════════════════════════════════ */
async function openTasbihView(){
  await _loadTasbihState();
  showView('view-tasbih');
  renderTasbihView();
  _attachTasbihKeyHandler();
  window.scrollTo(0, 0);
}

function closeTasbihView(){
  _detachTasbihKeyHandler();
  goHome();
}

/* ═══════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════ */
function renderTasbihView(){
  const host = $('tasbih-body');
  if(!host || !_tasbihState) return;

  const s = _tasbihState;
  const color = TASBIH_COLORS.find(c => c.key === s.color) || TASBIH_COLORS[0];
  const target = s.target === 'custom' ? (s.customTarget || 0) : s.target;
  const pct = target > 0 ? Math.min(100, Math.round(s.count / target * 100)) : 0;
  const done = target > 0 && s.count >= target;

  const R = 90, C = 2 * Math.PI * R;
  const dash = C * pct / 100;

  host.innerHTML = `
    <div class="tasbih-wrap" style="--tb-accent:${color.accent}; --tb-glow:${color.glow};">

      <!-- Settings button (top-right of the wrap) -->
      <button class="tasbih-settings-btn" onclick="tasbihOpenSettings()" title="Settings" aria-label="Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      <!-- Progress ring + count -->
      <div class="tasbih-ring-wrap">
        <svg class="tasbih-ring" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="${R}"
                  fill="none" stroke="var(--surface2)" stroke-width="8"/>
          <circle cx="100" cy="100" r="${R}"
                  fill="none" stroke="${color.accent}" stroke-width="8"
                  stroke-linecap="round"
                  stroke-dasharray="${dash} ${C}"
                  transform="rotate(-90 100 100)"
                  style="transition: stroke-dasharray .3s ease;"/>
        </svg>
        <div class="tasbih-center">
          <div class="tasbih-count ${done ? 'done' : ''}" id="tasbih-count">${s.count}</div>
          <div class="tasbih-target">
            ${target > 0 ? `/ ${target}` : 'no target'}
          </div>
        </div>
      </div>

      <!-- Big tap button -->
      <button class="tasbih-tap-btn" id="tasbih-tap" onclick="tasbihIncrement()">
        <span class="tasbih-tap-plus">+1</span>
        <span class="tasbih-tap-hint">tap · click · space</span>
      </button>

      <!-- Actions -->
      <div class="tasbih-actions">
        <button class="tasbih-reset" onclick="tasbihConfirmReset()">
          Reset
        </button>
      </div>
    </div>
  `;

  if(typeof injectHeaderIcons === 'function'){
    setTimeout(() => injectHeaderIcons(), 0);
  }
}

/* ═══════════════════════════════════════════════════════════
   INCREMENT
   ═══════════════════════════════════════════════════════════ */
function tasbihIncrement(){
  if(!_tasbihState) return;
  _tasbihState.count += 1;
  _saveTasbihState();
  _renderTasbihCount();

  if(navigator.vibrate) navigator.vibrate(15);

  const btn = $('tasbih-tap');
  if(btn){
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
  }
}

function _renderTasbihCount(){
  const el = $('tasbih-count');
  if(!el || !_tasbihState) return;
  const s = _tasbihState;
  el.textContent = s.count;

  const target = s.target === 'custom' ? (s.customTarget || 0) : s.target;
  const done = target > 0 && s.count >= target;
  el.classList.toggle('done', done);

  const ring = document.querySelector('.tasbih-ring circle:nth-child(2)');
  if(ring){
    const R = 90, C = 2 * Math.PI * R;
    const pct = target > 0 ? Math.min(100, s.count / target * 100) : 0;
    ring.setAttribute('stroke-dasharray', `${C * pct / 100} ${C}`);
  }

  const tEl = document.querySelector('.tasbih-target');
  if(tEl) tEl.textContent = target > 0 ? `/ ${target}` : 'no target';
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS PANEL
   ═══════════════════════════════════════════════════════════ */
function tasbihOpenSettings(){
  if(!_tasbihState) return;
  const s = _tasbihState;
  const target = s.target === 'custom' ? (s.customTarget || 0) : s.target;

  let modal = $('ov-tasbih-settings');
  if(!modal){
    modal = document.createElement('div');
    modal.className = 'ov center';
    modal.id = 'ov-tasbih-settings';
    modal.setAttribute('onclick', 'if(event.target===this)tasbihCloseSettings()');
    modal.innerHTML = `
      <div class="modal-box" style="max-width:420px">
        <div class="mh">
          <h2>Tasbih settings</h2>
             <button class="btn-close" onclick="tasbihCloseSettings()" aria-label="Close">${icon('x', 16)}</button>
        </div>
        <div class="mb" id="tasbih-settings-body"></div>
      </div>`;
    document.body.appendChild(modal);
  }

  /* Build the body fresh each time */
  const body = $('tasbih-settings-body');
  body.innerHTML = `
    <!-- Target -->
    <div class="tasbih-section">
      <div class="tasbih-section-label">Target</div>
      <div class="tasbih-chips">
        ${TASBIH_TARGETS.map(n => `
          <button class="tasbih-chip ${s.target === n ? 'on' : ''}"
                  onclick="tasbihSetTarget(${n})">${n}</button>
        `).join('')}
        <button class="tasbih-chip ${s.target === 'custom' ? 'on' : ''}"
                onclick="tasbihSetCustomTarget()">custom${s.target === 'custom' ? ' · ' + target : ''}</button>
      </div>
    </div>

    <!-- Colour -->
    <div class="tasbih-section">
      <div class="tasbih-section-label">Colour</div>
      <div class="tasbih-colors">
        ${TASBIH_COLORS.map(c => `
          <button class="tasbih-color ${s.color === c.key ? 'on' : ''}"
                  style="--c:${c.accent}"
                  onclick="tasbihSetColor('${c.key}')"
                  title="${c.label}"></button>
        `).join('')}
      </div>
    </div>

    <!-- Hotkeys -->
    <div class="tasbih-section">
      <div class="tasbih-section-label" style="display:flex;align-items:center;justify-content:center;gap:8px;">
        Hotkeys
        <button class="tasbih-info-btn" onclick="tasbihToggleHotkeyInfo()" aria-label="About hotkeys">?</button>
      </div>
      <div class="tasbih-hotkeys">
        <div class="tasbih-hotkey-row"><kbd>Space</kbd><span>increment</span></div>
        <div class="tasbih-hotkey-row"><kbd>Enter</kbd><span>increment</span></div>
        <div class="tasbih-hotkey-row"><kbd>↑</kbd><span>increment</span></div>
      </div>
      <div class="tasbih-hotkey-note" id="tasbih-hotkey-info" style="display:none">
        Hotkeys work only while the Tasbih view is open and no text field is focused.
        The big tap button and hotkeys all increment by +1.
      </div>
    </div>
  `;

  modal.classList.add('open');
  lockBody();
}

function tasbihCloseSettings(){
  const modal = $('ov-tasbih-settings');
  if(modal) modal.classList.remove('open');
  unlockBody();
  /* Re-render the main view so target/colour changes reflect immediately */
  renderTasbihView();
}

function tasbihToggleHotkeyInfo(){
  const el = $('tasbih-hotkey-info');
  if(!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS ACTIONS
   ═══════════════════════════════════════════════════════════ */
function tasbihSetTarget(n){
  if(!_tasbihState) return;
  _tasbihState.target = n;
  _saveTasbihState();
  tasbihOpenSettings();   /* re-render body */
}

function tasbihSetCustomTarget(){
  if(!_tasbihState) return;
  const current = _tasbihState.customTarget || 33;
  const raw = prompt('Enter target (positive number):', String(current));
  if(raw == null) return;
  const n = parseInt(raw, 10);
  if(!Number.isFinite(n) || n <= 0){
    toast('Enter a positive number');
    return;
  }
  _tasbihState.target = 'custom';
  _tasbihState.customTarget = n;
  _saveTasbihState();
  tasbihOpenSettings();
}

function tasbihSetColor(key){
  if(!_tasbihState) return;
  if(!TASBIH_COLORS.find(c => c.key === key)) return;
  _tasbihState.color = key;
  _saveTasbihState();
  tasbihOpenSettings();
}

/* ═══════════════════════════════════════════════════════════
   RESET
   ═══════════════════════════════════════════════════════════ */
function tasbihConfirmReset(){
  if(!_tasbihState || _tasbihState.count === 0){
    toast('Already at zero');
    return;
  }
  const modal = $('ov-confirm');
  if(modal){
    $('conf-ico').innerHTML = icon('rotate-ccw', 32);
    $('conf-t').textContent = 'Reset counter?';
    $('conf-x').textContent = `Current count: ${_tasbihState.count}. This cannot be undone.`;
    const delBtn = modal.querySelector('.btn-del');
    const origClick = delBtn.onclick;
    delBtn.textContent = 'Reset';
    delBtn.onclick = () => {
      tasbihDoReset();
      delBtn.onclick = origClick;
      delBtn.textContent = 'Delete';
      closeConfirm();
    };
    modal.classList.add('open');
    lockBody();
  } else {
    if(confirm('Reset count to zero?')) tasbihDoReset();
  }
}

function tasbihDoReset(){
  if(!_tasbihState) return;
  _tasbihState.count = 0;
  _saveTasbihState();
  _renderTasbihCount();
  toast('Counter reset');
}

/* ═══════════════════════════════════════════════════════════
   KEYBOARD
   ═══════════════════════════════════════════════════════════ */
function _attachTasbihKeyHandler(){
  document.addEventListener('keydown', _tasbihKeyDown);
}

function _detachTasbihKeyHandler(){
  document.removeEventListener('keydown', _tasbihKeyDown);
}

function _tasbihKeyDown(e){
  const view = $('view-tasbih');
  if(!view || !view.classList.contains('active')) return;

  /* Ignore typing in fields */
  const tag = (e.target.tagName || '').toLowerCase();
  if(tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

  /* Don't fire hotkeys when a modal is open */
  if(document.querySelector('.ov.open, .session-overlay.open')) return;

  if(e.code === 'Space' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp'){
    e.preventDefault();
    tasbihIncrement();
  }
}