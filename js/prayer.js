'use strict';

/* ═══════════════════════════════════════════════════════════
   Prayer times — Aladhan API + IndexedDB cache
   • Method 19 = Algeria (Ministry of Religious Affairs)
   • Fetches a full month at a time
   • Prefetches up to 90 days ahead for offline use
   ═══════════════════════════════════════════════════════════ */

const PRAYER_METHOD     = 19;   /* Algeria — most accurate for your region */
const PRAYER_SCHOOL     = 0;    /* 0 = Shafi (standard) | 1 = Hanafi */
const PRAYER_CACHE_DAYS = 90;   /* Prefetch this many days ahead */

/* ═══════════════════════════════════════════════════════════
   LOCATION — cached for 30 days, refreshed on demand
   ═══════════════════════════════════════════════════════════ */
async function getLocation(forceRefresh = false){
  if(!forceRefresh){
    const cached = await store.getMeta('location');
    if(cached && cached.lat && cached.lng && cached.ts){
      const ageDays = (Date.now() - cached.ts) / (1000 * 60 * 60 * 24);
      if(ageDays < 30) return cached;
    }
  }

  return new Promise((resolve, reject) => {
    if(!navigator.geolocation){
      reject(new Error('Geolocation not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: Date.now(),
        };
        await store.setMeta('location', loc);
        resolve(loc);
      },
      (err) => reject(new Error('Location error: ' + err.message)),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 3600000 }
    );
  });
}

/* Strip "(CEST)" or any suffix from a time string: "05:22 (CEST)" → "05:22" */
function cleanTime(t){
  if(!t) return '00:00';
  return String(t).trim().split(/\s+/)[0];
}

/* ═══════════════════════════════════════════════════════════
   API — fetch a month of prayer times
   ═══════════════════════════════════════════════════════════ */
async function fetchMonth(lat, lng, year, month){
  const url =
    `https://api.aladhan.com/v1/calendar` +
    `?latitude=${lat}&longitude=${lng}` +
    `&method=${PRAYER_METHOD}&school=${PRAYER_SCHOOL}` +
    `&month=${month}&year=${year}`;

  const res = await fetch(url);
  if(!res.ok) throw new Error('Aladhan API returned ' + res.status);
  const json = await res.json();

  return json.data.map(day => ({
    date: day.date.gregorian.date,       /* DD-MM-YYYY */
    weekday: day.date.gregorian.weekday.en,
    hijri: {
      day: day.date.hijri.day,
      month: day.date.hijri.month.en,
      year: day.date.hijri.year,
    },
    timings: {
      Fajr:    cleanTime(day.timings.Fajr),
      Sunrise: cleanTime(day.timings.Sunrise),
      Dhuhr:   cleanTime(day.timings.Dhuhr),
      Asr:     cleanTime(day.timings.Asr),
      Maghrib: cleanTime(day.timings.Maghrib),
      Isha:    cleanTime(day.timings.Isha),
    },
  }));
}

/* ═══════════════════════════════════════════════════════════
   CACHE key builder
   ═══════════════════════════════════════════════════════════ */
function monthKey(lat, lng, year, month){
  return `prayer-${lat.toFixed(3)}-${lng.toFixed(3)}-${year}-${String(month).padStart(2,'0')}`;
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC — getToday()
   Cache-first; fetches the current month if missing.
   ═══════════════════════════════════════════════════════════ */
async function getToday(){
  const loc = await getLocation();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const key = monthKey(loc.lat, loc.lng, year, month);

  let cached = await store.getMeta(key);

  if(!cached){
    console.log('[prayer] Fetching month', month, year);
    const data = await fetchMonth(loc.lat, loc.lng, year, month);
    cached = { data, ts: Date.now() };
    await store.setMeta(key, cached);
  }

  const todayStr =
    String(now.getDate()).padStart(2,'0') + '-' +
    String(month).padStart(2,'0') + '-' + year;

  const today = cached.data.find(d => d.date === todayStr);
  return { today, location: loc, cachedAt: cached.ts };
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC — getMonth()
   Returns the full month array (30 entries).
   ═══════════════════════════════════════════════════════════ */
async function getMonth(year, month){
  const loc = await getLocation();
  const key = monthKey(loc.lat, loc.lng, year, month);
  const cached = await store.getMeta(key);
  if(cached) return cached.data;
  const data = await fetchMonth(loc.lat, loc.lng, year, month);
  await store.setMeta(key, { data, ts: Date.now() });
  return data;
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC — ensureCache()
   Prefetches up to 90 days ahead (in monthly chunks).
   Safe to call on every boot — skips months already cached.
   ═══════════════════════════════════════════════════════════ */
async function ensureCache(){
  let loc;
  try{
    loc = await getLocation();
  }catch(err){
    console.warn('[prayer] No location — skipping prefetch:', err.message);
    return { ok: false, reason: err.message };
  }

  const now = new Date();
  const monthsToFetch = Math.ceil(PRAYER_CACHE_DAYS / 30) + 1;
  let fetched = 0;

  for(let i = 0; i < monthsToFetch; i++){
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const key = monthKey(loc.lat, loc.lng, y, m);
    const cached = await store.getMeta(key);
    if(!cached){
      try{
        const data = await fetchMonth(loc.lat, loc.lng, y, m);
        await store.setMeta(key, { data, ts: Date.now() });
        fetched++;
        console.log('[prayer] Cached month', m, y);
      }catch(err){
        console.warn('[prayer] Failed to cache month', m, y, err.message);
      }
    }
  }
  return { ok: true, fetched, location: loc };
}

/* ═══════════════════════════════════════════════════════════
   HELPERS — find the next prayer from today's list
   ═══════════════════════════════════════════════════════════ */
function findNextPrayer(timings){
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const order = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];   /* skip Sunrise */

  /* Robust parser: handles "05:22", "05:22 (CEST)", "5:22", etc. */
  const parseHM = (str) => {
    if(!str) return [0, 0];
    const clean = String(str).trim().split(/\s+/)[0];   /* strip suffix */
    const parts = clean.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return [
      Number.isFinite(h) ? h : 0,
      Number.isFinite(m) ? m : 0,
    ];
  };

  for(const name of order){
    const [h, m] = parseHM(timings[name]);
    const prayerMin = h * 60 + m;
    if(prayerMin > nowMin){
      return { name, time: timings[name], minutesLeft: prayerMin - nowMin };
    }
  }

  /* All prayers have passed today → next is Fajr tomorrow */
  const [fh, fm] = parseHM(timings.Fajr);
  const tomorrowFajr = (24 * 60) - nowMin + (fh * 60 + fm);
  return { name: 'Fajr', time: timings.Fajr, minutesLeft: tomorrowFajr, tomorrow: true };
}


/* ═══════════════════════════════════════════════════════════
   formatCountdown — "45 min" / "2h 15m"
   ═══════════════════════════════════════════════════════════ */
function formatCountdown(minutes){
  if(!Number.isFinite(minutes) || minutes < 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if(h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}