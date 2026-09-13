'use strict';

/* ═══════════════════════════════════════════════════════════
   Prayer times view
   • Loads today's times via prayer.js
   • Renders the list with next prayer highlighted
   • Shows Qibla direction + countdown to next prayer
   • Refresh button to force-fetch
   ═══════════════════════════════════════════════════════════ */

let _prayerData = null;         /* cached today's payload */
let _countdownTimer = null;

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
  goHome();
}

/* ═══════════════════════════════════════════════════════════
   RENDER STATES
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
      <div class="prayer-qibla-compass">
        <div class="qibla-arrow" id="qibla-arrow">▲</div>
        <div class="qibla-degrees">${qibla.toFixed(1)}°</div>
      </div>
      <div class="prayer-qibla-info">
        ${cardinal} · ${dist.toFixed(0)} km to Makkah
      </div>
      <button class="btn-cancel" style="margin-top:12px" onclick="refreshLocation()">
        📍 Update location
      </button>
    </div>
  `;

  /* Apply arrow rotation via CSS (points to Qibla when device is upright) */
  const arrow = $('qibla-arrow');
  if(arrow) arrow.style.transform = `rotate(${qibla}deg)`;
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