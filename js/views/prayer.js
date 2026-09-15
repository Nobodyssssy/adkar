'use strict';

/* ═══════════════════════════════════════════════════════════
   Prayer times view
   • Loads today's times via prayer.js
   • Renders the list with next prayer highlighted
   • Shows Qibla direction + countdown to next prayer
   • Refresh button to force-fetch
   ═══════════════════════════════════════════════════════════ */

'use strict';

let _prayerData = null;         /* cached today's payload */
let _countdownTimer = null;
let _compassUnsub = null;       /* unsubscribe function for compass heading */
let _currentQibla = null;       /* current qibla bearing, so we can recompute */

/* ═══════════════════════════════════════════════════════════
   Loading / error states
   ═══════════════════════════════════════════════════════════ */

function renderPrayerLoading(){
  $('prayer-body').innerHTML = `
    <div class="prayer-loading">
      <div class="prayer-spinner"></div>
      <div>Loading prayer times…</div>
    </div>`;
}

function renderPrayerError(msg){
  $('prayer-body').innerHTML = `
    <div class="prayer-error">
      <div style="font-size:40px;margin-bottom:12px">🕌</div>
      <div style="font-weight:700;margin-bottom:6px">Could not get your location</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:18px;max-width:340px;margin-left:auto;margin-right:auto">${esc(msg)}</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn-save" onclick="openLocationPicker()">📍 Choose location</button>
        <button class="btn-cancel" onclick="openPrayerView()">↻ Retry GPS</button>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:20px;max-width:340px;margin-left:auto;margin-right:auto;line-height:1.6">
        Tip: GPS only works over HTTPS. You can pick your city manually — it works everywhere, offline, on any device.
      </div>
    </div>`;
}

async function openPrayerView(){
  showView('view-prayer');
  renderPrayerLoading();

  try{
    const result = await getToday();
    _prayerData = result;
    renderPrayerView();
    startCountdown();
  }catch(err){
    console.error('[prayer-view]', err);
    renderPrayerError(err.message);
  }
}

function closePrayerView(){
  if(_countdownTimer){ clearInterval(_countdownTimer); _countdownTimer = null; }
  stopLiveCompass();
  goHome();
}

/* ═══════════════════════════════════════════════════════════
   RENDER STATES
   ═══════════════════════════════════════════════════════════ */
function renderPrayerView(){
  if(!_prayerData || !_prayerData.today){
    renderPrayerError('No data for today');
    return;
  }

  const { today, location } = _prayerData;
  const t = today.timings;
  const next = findNextPrayer(t);
  const qibla = qiblaBearing(location.lat, location.lng);
  const dist = distanceToKaaba(location.lat, location.lng);
  const cardinal = bearingToCardinal(qibla);

  /* Hijri line */
  const hijri = today.hijri
    ? `${today.hijri.day} ${today.hijri.month} ${today.hijri.year} AH`
    : '';

  /* Prayer list — order and Arabic labels */
  const prayers = [
    { name: 'Fajr',    ar: 'الفجر',   time: t.Fajr },
    { name: 'Sunrise', ar: 'الشروق',  time: t.Sunrise, isSunrise: true },
    { name: 'Dhuhr',   ar: 'الظهر',   time: t.Dhuhr },
    { name: 'Asr',     ar: 'العصر',   time: t.Asr },
    { name: 'Maghrib', ar: 'المغرب',  time: t.Maghrib },
    { name: 'Isha',    ar: 'العشاء',  time: t.Isha },
  ];

  const list = prayers.map(p => {
    const isNext = p.name === next.name && !p.isSunrise;
    return `<div class="prayer-row ${isNext?'next':''} ${p.isSunrise?'sunrise':''}">
      <span class="prayer-icon">${isNext ? '▶' : (p.isSunrise ? '☀' : '•')}</span>
      <span class="prayer-name">${p.name}</span>
      <span class="prayer-arabic">${p.ar}</span>
      <span class="prayer-time">${p.time}</span>
    </div>`;
  }).join('');

  $('prayer-body').innerHTML = `
    <div class="prayer-card">
      <div class="prayer-date">${today.weekday}, ${today.date}</div>
      ${hijri ? `<div class="prayer-hijri">${hijri}</div>` : ''}
      <div class="prayer-loc">
        📍 ${location.label ? esc(location.label) + ' · ' : ''}${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}
        · <a href="#" onclick="event.preventDefault();openLocationPicker()" style="color:var(--accent);text-decoration:underline">Change</a>
      </div>
    </div>

    <div class="prayer-countdown-card">
      <div class="prayer-countdown-label">Next prayer</div>
      <div class="prayer-countdown-name">${next.name}${next.tomorrow ? ' (tomorrow)' : ''}</div>
      <div class="prayer-countdown-time">${next.time}</div>
      <div class="prayer-countdown-remaining" id="prayer-countdown-remaining">
        in ${formatCountdown(next.minutesLeft)}
      </div>
    </div>

    <div class="prayer-list-card">
      ${list}
    </div>

    <div class="prayer-qibla-card">
      <div class="prayer-qibla-head">Qibla Direction</div>
      <div class="prayer-qibla-compass" id="qibla-compass">
        <div class="qibla-arrow" id="qibla-arrow">▲</div>
        <div class="qibla-degrees" id="qibla-degrees">${qibla.toFixed(1)}°</div>
      </div>
      <div class="prayer-qibla-info">
        ${cardinal} · ${dist.toFixed(0)} km to Makkah
      </div>
      <div class="qibla-compass-status" id="qibla-compass-status"></div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <button class="btn-save" style="flex:1;min-width:140px" onclick="enableLiveCompass(${qibla})">
          🧭 Enable live compass
        </button>
        <button class="btn-cancel" style="flex:1;min-width:140px" onclick="openLocationPicker()">
          📍 Choose location
        </button>
        <button class="btn-cancel" style="flex:1;min-width:140px" onclick="refreshLocation()">
          ↻ Refresh
        </button>
      </div>
    </div>
  `;

  /* Save current qibla bearing for later (live compass uses this) */
  _currentQibla = qibla;

  /* Apply arrow rotation via CSS */
  const arrow = $('qibla-arrow');
  if(arrow) arrow.style.transform = `rotate(${qibla}deg)`;
}
  /* ═══════════════════════════════════════════════════════════
   LIVE COMPASS — enable, subscribe, rotate arrow in real time
   ═══════════════════════════════════════════════════════════ */
async function enableLiveCompass(qiblaDeg){
  const status = $('qibla-compass-status');
  const arrow  = $('qibla-arrow');
  const deg    = $('qibla-degrees');
  const box    = $('qibla-compass');

  if(!status || !arrow) return;

  /* Already active → stop */
  if(isCompassActive()){
    stopLiveCompass();
    status.textContent = 'Compass off';
    status.className = 'qibla-compass-status';
    return;
  }

  status.textContent = '⏳ Activating compass…';
  status.className = 'qibla-compass-status loading';

  const res = await startCompass();
  if(!res.ok){
    status.textContent = '⚠️ ' + res.reason;
    status.className = 'qibla-compass-status error';
    return;
  }

  /* Subscribe to heading changes */
  _compassUnsub = onCompassChange((heading) => {
    const rotation = computeArrowRotation(qiblaDeg, heading);
    arrow.style.transform = `rotate(${rotation}deg)`;
    if(deg) deg.textContent = rotation.toFixed(0) + '°';
  });

  /* Mark the box as live */
  if(box) box.classList.add('live');

  /* Update status line + accuracy dot every 2s */
  status.className = 'qibla-compass-status active';
  status.textContent = '🧭 Live — rotate your phone';

  /* Start accuracy monitor */
  _compassAccuracyTimer = setInterval(() => {
    const acc = compassAccuracy();
    const map = {
      good:    { label: '🟢 Good signal',  cls: 'good' },
      fair:    { label: '🟡 Fair signal',  cls: 'fair' },
      poor:    { label: '🔴 Weak signal — move away from metal', cls: 'poor' },
      unknown: { label: '⚪ Calibrating…', cls: 'loading' },
    };
    const info = map[acc] || map.unknown;
    status.textContent = '🧭 Live — ' + info.label;
    status.className = 'qibla-compass-status active ' + info.cls;
  }, 2000);

  /* Change button label to "stop" */
  const btn = document.querySelector('.prayer-qibla-card .btn-save');
  if(btn) btn.textContent = '🧭 Stop compass';
}

let _compassAccuracyTimer = null;

function stopLiveCompass(){
  if(_compassUnsub){ _compassUnsub(); _compassUnsub = null; }
  if(_compassAccuracyTimer){ clearInterval(_compassAccuracyTimer); _compassAccuracyTimer = null; }
  stopCompass();
  const box = $('qibla-compass');
  if(box) box.classList.remove('live');
  const btn = document.querySelector('.prayer-qibla-card .btn-save');
  if(btn) btn.textContent = '🧭 Enable live compass';
}
  
/* ═══════════════════════════════════════════════════════════
   COUNTDOWN — updates every 60 seconds
   ═══════════════════════════════════════════════════════════ */
function startCountdown(){
  if(_countdownTimer) clearInterval(_countdownTimer);
  _countdownTimer = setInterval(() => {
    if(!_prayerData || !_prayerData.today) return;
    const el = $('prayer-countdown-remaining');
    if(!el) return;
    const next = findNextPrayer(_prayerData.today.timings);
    el.textContent = `in ${formatCountdown(next.minutesLeft)}`;
  }, 60000);
}

/* ═══════════════════════════════════════════════════════════
   REFRESH — force location re-acquisition + fetch fresh times
   ═══════════════════════════════════════════════════════════ */
async function refreshLocation(){
  toast('📍 Updating location…');
  try{
    const loc = await getLocation(true);   /* force refresh */
    /* Fetch this month with the new coords */
    const now = new Date();
    const key = monthKey(loc.lat, loc.lng, now.getFullYear(), now.getMonth() + 1);
    const cached = await store.getMeta(key);
    if(!cached){
      await ensureCache();
    }
    toast('✅ Location updated');
    openPrayerView();
  }catch(err){
    toast('⚠️ ' + err.message);
  }
}