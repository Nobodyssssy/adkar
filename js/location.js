'use strict';

/* ═══════════════════════════════════════════════════════════
   Location picker — online geocoding + manual coordinates
   • Primary: Open-Meteo Geocoding API (free, no key)
   • Fallback: manual lat/lng input
   • Recent cities cached in IndexedDB
   ═══════════════════════════════════════════════════════════ */

const RECENT_MAX = 5;

/* ═══════════════════════════════════════════════════════════
   Public API — manual location set/clear
   ═══════════════════════════════════════════════════════════ */

async function setManualLocation(lat, lng, label){
  const loc = {
    lat: Number(lat),
    lng: Number(lng),
    label: label || null,
    manual: true,
    ts: Date.now(),
  };
  await store.setMeta('location', loc);
  return loc;
}

async function clearManualLocation(){
  await store.setMeta('location', null);
}

/* ═══════════════════════════════════════════════════════════
   Recent cities — persisted list of last picks
   ═══════════════════════════════════════════════════════════ */

async function getRecentCities(){
  const list = await store.getMeta('recentCities');
  return Array.isArray(list) ? list : [];
}

async function addRecentCity(city){
  const list = await getRecentCities();
  /* Dedupe by name + country */
  const filtered = list.filter(c =>
    !(c.name === city.name && c.country === city.country)
  );
  filtered.unshift(city);
  const trimmed = filtered.slice(0, RECENT_MAX);
  await store.setMeta('recentCities', trimmed);
}

/* ═══════════════════════════════════════════════════════════
   Geocoding — Open-Meteo (free, no key, no rate limit issues)
   ═══════════════════════════════════════════════════════════ */

let _geocodeController = null;

async function geocodeSearch(query){
  const q = (query || '').trim();
  if(q.length < 2) return [];

  /* Cancel any in-flight request */
  if(_geocodeController) _geocodeController.abort();
  _geocodeController = new AbortController();

  const url = `https://geocoding-api.open-meteo.com/v1/search` +
              `?name=${encodeURIComponent(q)}&count=15&language=en&format=json`;

  try{
    const res = await fetch(url, { signal: _geocodeController.signal });
    if(!res.ok) throw new Error('Geocoding failed: ' + res.status);
    const json = await res.json();
    return (json.results || []).map(r => ({
      name: r.name,
      country: r.country || '',
      admin1: r.admin1 || '',
      lat: r.latitude,
      lng: r.longitude,
    }));
  }catch(err){
    if(err.name === 'AbortError') return null;   /* silent cancel */
    console.warn('[geocode]', err);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════
   Modal UI
   ═══════════════════════════════════════════════════════════ */

function openLocationPicker(){
  ensureLocationModal();
  $('location-search').value = '';
  $('ov-location').classList.add('open');
  lockBody();
  renderLocationList('');   /* shows recent cities initially */
  setTimeout(() => $('location-search').focus(), 200);
}

function closeLocationPicker(){
  $('ov-location').classList.remove('open');
  unlockBody();
}

function ensureLocationModal(){
  if($('ov-location')) return;

  const modal = document.createElement('div');
  modal.className = 'ov center';
  modal.id = 'ov-location';
  modal.setAttribute('onclick', 'if(event.target===this)closeLocationPicker()');
  modal.innerHTML = `
    <div class="modal-box" style="max-width:460px">
      <div class="mh">
        <h2>Choose Location</h2>
        <button class="btn-close" onclick="closeLocationPicker()">✕</button>
      </div>
      <div class="mb" style="gap:10px">
        <div class="fg">
          <label class="fl">Search any city worldwide</label>
          <input class="fi" id="location-search" placeholder="e.g. Zurich, Collo, Paris…"
                 oninput="onLocationSearchInput(this.value)" autocomplete="off">
        </div>
        <div id="location-list" style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:6px"></div>
        <div style="border-top:1px solid var(--border);padding-top:10px;display:flex;flex-direction:column;gap:10px">
          <div style="font-size:11px;color:var(--text3);font-weight:700;letter-spacing:.05em;text-transform:uppercase">Or enter coordinates</div>
          <div class="fr2">
            <input class="fi" id="loc-lat" type="number" step="0.0001" placeholder="Latitude" style="direction:ltr">
            <input class="fi" id="loc-lng" type="number" step="0.0001" placeholder="Longitude" style="direction:ltr">
          </div>
          <button class="btn-save" onclick="applyManualCoords()">Use these coordinates</button>
        </div>
        <button class="btn-cancel" style="width:100%" onclick="useGPSLocation()">📍 Use my GPS instead</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

/* Debounce geocoding as user types */
let _geocodeTimer;
function onLocationSearchInput(value){
  clearTimeout(_geocodeTimer);
  const q = value.trim();

  if(q.length < 2){
    renderLocationList('');   /* show recent */
    return;
  }

  /* Immediate UI hint */
  $('location-list').innerHTML =
    `<div style="text-align:center;color:var(--text3);padding:14px;font-size:12px">Searching…</div>`;

  _geocodeTimer = setTimeout(async () => {
    const results = await geocodeSearch(q);
    if(results === null) return;   /* cancelled */
    renderLocationResults(results, q);
  }, 350);
}

/* ═══════════════════════════════════════════════════════════
   Rendering
   ═══════════════════════════════════════════════════════════ */

async function renderLocationList(query){
  const list = $('location-list');
  if(!list) return;

  const q = (query || '').trim();
  if(q.length >= 2) return;   /* handled by geocode results */

  const recent = await getRecentCities();
  if(!recent.length){
    list.innerHTML = `<div style="text-align:center;color:var(--text3);padding:14px;font-size:12px">
      Type at least 2 characters to search any city worldwide.
    </div>`;
    return;
  }

  list.innerHTML = `
    <div style="font-size:11px;color:var(--text3);font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:4px 2px">Recent</div>
    ${recent.map(c => cityRowHTML(c, true)).join('')}
  `;
}

function renderLocationResults(results, query){
  const list = $('location-list');
  if(!list) return;

  if(!results.length){
    list.innerHTML = `<div style="text-align:center;color:var(--text3);padding:14px;font-size:12px">
      No city found for "${esc(query)}".<br>Try another spelling or enter coordinates below.
    </div>`;
    return;
  }

  list.innerHTML = results.map(c => cityRowHTML(c, false)).join('');
}

function cityRowHTML(c, isRecent){
  const detail = [c.admin1, c.country].filter(Boolean).join(', ');
  const label = c.name + (detail ? ' — ' + detail : '');
  const safeName = c.name.replace(/'/g, "\\'");
  const safeCountry = (c.country || '').replace(/'/g, "\\'");
  const safeAdmin = (c.admin1 || '').replace(/'/g, "\\'");
  return `<button class="loc-row"
                  onclick="applyCity('${safeName}','${safeCountry}','${safeAdmin}',${c.lat},${c.lng})">
    <span class="loc-name">${esc(c.name)}${isRecent ? ' ★' : ''}</span>
    <span class="loc-detail">${esc(detail)}</span>
  </button>`;
}

/* ═══════════════════════════════════════════════════════════
   Actions
   ═══════════════════════════════════════════════════════════ */

async function applyCity(name, country, admin, lat, lng){
  const label = [name, admin, country].filter(Boolean).join(', ');
  await setManualLocation(lat, lng, label);
  await addRecentCity({ name, country, admin1: admin, lat, lng });
  closeLocationPicker();
  toast(`📍 ${name} saved`);
  if($('view-prayer').classList.contains('active')){
    openPrayerView();
  }
}

async function applyManualCoords(){
  const lat = parseFloat($('loc-lat').value);
  const lng = parseFloat($('loc-lng').value);
  if(Number.isNaN(lat) || Number.isNaN(lng)){
    toast('⚠️ Enter both latitude and longitude');
    return;
  }
  if(lat < -90 || lat > 90 || lng < -180 || lng > 180){
    toast('⚠️ Coordinates out of range');
    return;
  }
  await setManualLocation(lat, lng, `${lat.toFixed(3)}, ${lng.toFixed(3)}`);
  closeLocationPicker();
  toast(`📍 Location saved`);
  if($('view-prayer').classList.contains('active')){
    openPrayerView();
  }
}

async function useGPSLocation(){
  closeLocationPicker();
  toast('📍 Requesting GPS…');
  try{
    const loc = await getLocation(true);
    await store.setMeta('location', { ...loc, manual: false, label: null });
    toast('✅ GPS location saved');
    if($('view-prayer').classList.contains('active')){
      openPrayerView();
    }
  }catch(err){
    toast('⚠️ ' + err.message);
  }
}