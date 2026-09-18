'use strict';

/* ═══════════════════════════════════════════════════════════
   Prayer times view
   • Loads today's times via prayer.js
   • Renders the list with next prayer highlighted
   • Shows Qibla direction with a rotating-ring compass
   ═══════════════════════════════════════════════════════════ */

let _prayerData = null;
let _countdownTimer = null;
let _compassUnsub = null;
let _compassAccuracyTimer = null;
let _currentQibla = null;

/* ═══════════════════════════════════════════════════════════
   ENTRY POINTS
   ═══════════════════════════════════════════════════════════ */
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
function renderPrayerLoading(){
  $('prayer-body').innerHTML = `
    <div class="prayer-loading">
      <div class="prayer-spinner"></div>
      <div>Loading prayer times…</div>
    </div>`;
}

function renderPrayerError(msg){
  const noLocation = msg === 'No location set' || !msg;
  $('prayer-body').innerHTML = `
    <div class="prayer-error">
      <div style="color:var(--accent);margin-bottom:14px">${icon('mosque', 40)}</div>
      <div style="font-weight:700;margin-bottom:6px">${
        noLocation ? 'Choose your location' : 'Could not load prayer times'
      }</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:18px;max-width:340px;margin-left:auto;margin-right:auto">${
        noLocation
          ? 'Pick your city manually, or use GPS for the most accurate times.'
          : esc(msg)
      }</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn-save" onclick="openLocationPicker()" data-icon="map-pin"><span class="btn-icon"></span><span>Pick a city</span></button>
        <button class="btn-cancel" onclick="useGPSLocation()" data-icon="compass"><span class="btn-icon"></span><span>Use GPS</span></button>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:20px;max-width:340px;margin-left:auto;margin-right:auto;line-height:1.6">
        Tip: GPS only works over HTTPS. Picking a city manually works everywhere, offline, on any device.
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

  const hijri = today.hijri
    ? `${today.hijri.day} ${today.hijri.month} ${today.hijri.year} AH`
    : '';

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
        ${icon('map-pin', 12)} ${location.label ? esc(location.label) + ' · ' : ''}${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}
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
        <div class="prayer-qibla-head">
        Qibla Direction
        <button class="qibla-help-btn" onclick="showCalibrationHelp()" title="How to calibrate">?</button>
      </div>
      <div class="qibla-compass-wrap">
        <div class="qibla-pointer-fixed"></div>

        <div class="qibla-ring" id="qibla-ring" style="transform:rotate(0deg)">
          <div class="qibla-mark n">N</div>
          <div class="qibla-mark e">E</div>
          <div class="qibla-mark s">S</div>
          <div class="qibla-mark w">W</div>

          <div class="qibla-kaaba" id="qibla-kaaba" style="transform:rotate(${qibla}deg)">
            <div class="qibla-kaaba-icon">🕋</div>
          </div>

          <div class="qibla-center"></div>
        </div>

        <div class="qibla-readout" id="qibla-degrees">${qibla.toFixed(0)}°</div>
      </div>

      <div class="prayer-qibla-info">
        ${cardinal} · ${dist.toFixed(0)} km to Makkah
      </div>

      <div class="qibla-compass-status" id="qibla-compass-status"></div>
	        <div id="qibla-debug" style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3);margin-top:6px;direction:ltr;text-align:center;line-height:1.6"></div>

      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <button class="btn-save" style="flex:1;min-width:140px" onclick="enableLiveCompass(${qibla})" data-icon="compass">
          <span class="btn-icon"></span><span id="compass-btn-label">Enable live compass</span>
        </button>
        <button class="btn-cancel" style="flex:1;min-width:140px" onclick="openLocationPicker()" data-icon="map-pin">
          <span class="btn-icon"></span><span>Choose location</span>
        </button>
        <button class="btn-cancel" style="flex:1;min-width:140px" onclick="refreshLocation()" data-icon="rotate-ccw">
          <span class="btn-icon"></span><span>Refresh</span>
        </button>
      </div>
    </div>
  `;

  _currentQibla = qibla;
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
   REFRESH LOCATION
   ═══════════════════════════════════════════════════════════ */
async function refreshLocation(){
  toast('Updating location…');
  try{
    const loc = await requestGPSLocation();
    const now = new Date();
    const key = monthKey(loc.lat, loc.lng, now.getFullYear(), now.getMonth() + 1);
    const cached = await store.getMeta(key);
    if(!cached){
      await ensureCache();
    }
    toast('✓ Location updated');
    openPrayerView();
  }catch(err){
    toast(err.message);
  }
}

/* ═══════════════════════════════════════════════════════════
   LIVE COMPASS — fixed pointer + rotating ring + Kaaba marker
   ═══════════════════════════════════════════════════════════ */
async function enableLiveCompass(qiblaDeg){
  const status = $('qibla-compass-status');
  const ring   = $('qibla-ring');
  const deg    = $('qibla-degrees');
  const card   = document.querySelector('.prayer-qibla-card');

  if(!status || !ring) return;

  if(isCompassActive()){
    stopLiveCompass();
    status.textContent = 'Compass off';
    status.className = 'qibla-compass-status';
    if(card) card.classList.remove('aligned');
    return;
  }

  status.textContent = 'Activating compass…';
  status.className = 'qibla-compass-status loading';

  const res = await startCompass();
  if(!res.ok){
    status.textContent = res.reason;
    status.className = 'qibla-compass-status error';
    return;
  }

  _compassUnsub = onCompassChange((heading) => {
    /* Since Android's `alpha` is not true north, we don't rely on it.
       Instead, we rotate the ring so that when the phone's raw
       heading equals the qibla bearing, the Kaaba marker is at the
       fixed pointer. This works regardless of the phone's reference frame. */
    const ringAngle = qiblaDeg - heading;
    ring.style.transform = `rotate(${ringAngle}deg)`;

    /* How far off we are from the qibla */
    let diff = qiblaDeg - heading;
    while(diff > 180)  diff -= 360;
    while(diff < -180) diff += 360;

    const absDiff = Math.abs(diff);
    /* Phone compasses have ~±10° physical accuracy; matching iOS Compass
       uses ~10° for the "aligned" state. */
    const aligned = absDiff <= 10;
    const close   = absDiff <= 25 && !aligned;

    if(deg) deg.textContent = Math.round(absDiff) + '°';
    if(card){
      card.classList.toggle('aligned', aligned);
      card.classList.toggle('close',   close);
    }
  });

  _compassAccuracyTimer = setInterval(() => {
    const isAligned = document.querySelector('.prayer-qibla-card.aligned');
    if(isAligned){
      status.textContent = '✓ Facing Qibla';
      status.className = 'qibla-compass-status active good';
      return;
    }
    const acc = compassAccuracy();
    const map = {
      good:    { label: 'Live · Facing reading stable',                cls: 'good' },
      fair:    { label: 'Live · Reading stable',                       cls: 'fair' },
      poor:    { label: 'Live · Slight movement — holding still helps',cls: 'poor' },
      unknown: { label: 'Live · Starting…',                            cls: 'loading' },
    };
    const info = map[acc] || map.unknown;
    status.textContent = info.label;
    status.className = 'qibla-compass-status active ' + info.cls;
  }, 2000);

  const btnLabel = document.getElementById('compass-btn-label');
  if(btnLabel) btnLabel.textContent = 'Stop compass';
}

function stopLiveCompass(){
  if(_compassUnsub){ _compassUnsub(); _compassUnsub = null; }
  if(_compassAccuracyTimer){ clearInterval(_compassAccuracyTimer); _compassAccuracyTimer = null; }
  stopCompass();

  const ring = $('qibla-ring');
  if(ring) ring.style.transform = 'rotate(0deg)';
  if($('qibla-degrees')) $('qibla-degrees').textContent = (_currentQibla || 0).toFixed(0) + '°';

  const card = document.querySelector('.prayer-qibla-card');
  if(card) card.classList.remove('aligned');

  const btnLabel = document.getElementById('compass-btn-label');
  if(btnLabel) btnLabel.textContent = 'Enable live compass';
}

/* ═══════════════════════════════════════════════════════════
   Compass calibration help modal
   ═══════════════════════════════════════════════════════════ */
function showCalibrationHelp(){
  let modal = $('ov-qibla-help');
  if(!modal){
    modal = document.createElement('div');
    modal.className = 'ov center';
    modal.id = 'ov-qibla-help';
    modal.setAttribute('onclick', 'if(event.target===this)closeCalibrationHelp()');
    modal.innerHTML = `
      <div class="modal-box" style="max-width:380px">
        <div class="mh">
          <h2>Calibrate compass</h2>
          <button class="btn-close" onclick="closeCalibrationHelp()" data-icon="x"><span class="btn-icon"></span></button>
        </div>
        <div class="mb" style="text-align:center;gap:14px">
          <img src="assets/compass/calibrate.avif"
               alt="Move phone in figure-8 motion"
               style="max-width:100%;border-radius:var(--rs);background:var(--surface2)">
          <div style="font-size:14px;color:var(--text2);line-height:1.7">
            Hold your phone and move it in a
            <strong style="color:var(--accent)">figure-8</strong>
            motion a few times.
          </div>
          <div style="font-size:12px;color:var(--text3);line-height:1.6">
            This helps the compass find true north. Do it away from metal
            objects and electronics for best results.
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    if(typeof injectHeaderIcons === 'function') injectHeaderIcons();
  }
  modal.classList.add('open');
  lockBody();
}

function closeCalibrationHelp(){
  const modal = $('ov-qibla-help');
  if(modal) modal.classList.remove('open');
  unlockBody();
}