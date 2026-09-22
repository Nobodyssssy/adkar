'use strict';

/* ═══════════════════════════════════════════════════════════
   Forbidden prayer times — hadith reference
   Sahih Muslim 1373 — 'Uqbah ibn 'Amir al-Juhani
   ═══════════════════════════════════════════════════════════ */
const FORBIDDEN_TIMES_HADITH = {
  ar: 'عَنْ عُقْبَةَ بْنِ عَامِرٍ الْجُهَنِيِّ قَالَ: «ثَلَاثُ سَاعَاتٍ كَانَ رَسُولُ اللَّهِ ﷺ يَنْهَانَا أَنْ نُصَلِّيَ فِيهِنَّ أَوْ أَنْ نَقْبُرَ فِيهِنَّ مَوْتَانَا: حِينَ تَطْلُعُ الشَّمْسُ بَازِغَةً حَتَّى تَرْتَفِعَ، وَحِينَ يَقُومُ قَائِمُ الظَّهِيرَةِ حَتَّى تَزُولَ الشَّمْسُ، وَحِينَ تَضَيَّفُ الشَّمْسُ لِلْغُرُوبِ حَتَّى تَغْرُبَ».',
  en: '‘Uqbah ibn ‘Amir al-Juhani said: "There are three times at which the Messenger of Allah ﷺ forbade us to pray or to bury our dead: when the sun has clearly started to rise until it is fully risen, when it is directly overhead at midday until it has passed its zenith, and when the sun starts to set until it has fully set."',
  source: 'Sahih Muslim 1373',
  sourceUrl: 'https://sunnah.com/muslim:1373',
  noteEn: 'Voluntary prayers are forbidden in these windows. Fard prayers and the 2 sunnah rak\'ahs before Fajr are exempt (per the more correct view).',
  noteAr: 'تُنهى الصلوات التطوعية في هذه الأوقات. أما الفرائض وسنة الفجر القبلية فمستثناة (على القول الراجح).',
};

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
  /* Return cached location if we have one and it's not stale */
  if(!forceRefresh){
    const cached = await store.getMeta('location');
    if(cached && cached.lat && cached.lng && cached.ts){
      const ageDays = (Date.now() - cached.ts) / (1000 * 60 * 60 * 24);
      if(ageDays < 30) return cached;
    }
  }

  /* No cached location. Do NOT call GPS here — that's an explicit user action.
     Throw a marker error so callers can prompt the user to pick a location. */
  const err = new Error('No location set');
  err.code = 'NO_LOCATION';
  throw err;
}

/* ── Explicit GPS request — ONLY called from a user gesture ── */
async function requestGPSLocation(){
  if(!navigator.geolocation){
    throw new Error('Geolocation not supported by this browser');
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: Date.now(),
          manual: false,
        };
        await store.setMeta('location', loc);
        resolve(loc);
      },
      (err) => {
        let msg = 'Could not get location';
        if(err.code === 1){
          msg = 'Location blocked. Enable it in your browser settings, then try again.';
        } else if(err.code === 2){
          msg = 'Location unavailable. Try again outdoors.';
        } else if(err.code === 3){
          msg = 'Location timed out. Try again.';
        } else {
          msg = 'Location error: ' + err.message;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 3600000 }
    );
  });
}
/* Strip "(CEST)" or any suffix from a time string: "05:22 (CEST)" → "05:22" */
function cleanTime(t){
  if(!t) return '00:00';
  return String(t).trim().split(/\s+/)[0];
}

/* Remember the most recent month we successfully fetched, so we can
   serve it when the network is down and the current month is not cached. */
async function _rememberLastGoodMonth(data, lat, lng, year, month){
  try{
    await store.setMeta('prayer-last-good', {
      data,
      ts: Date.now(),
      lat, lng, year, month,
    });
  }catch(e){
    console.warn('[prayer] could not persist last-good month', e);
  }
}

/* Read the last-good snapshot, or null if there is none. */
async function _loadLastGoodMonth(){
  try{
    const snap = await store.getMeta('prayer-last-good');
    if(snap && Array.isArray(snap.data) && snap.data.length){
      return snap;
    }
  }catch(e){
    console.warn('[prayer] could not read last-good month', e);
  }
  return null;
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

const mapped = json.data.map(day => ({
    date: day.date.gregorian.date,       /* DD-MM-YYYY */
    weekday: day.date.gregorian.weekday.en,
    hijri: {
      day: day.date.hijri.day,
      month:   day.date.hijri.month.en,
      monthAr: day.date.hijri.month.ar,
      year:    day.date.hijri.year,
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
  await _rememberLastGoodMonth(mapped, lat, lng, year, month);
  return mapped;
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
async function getToday(forceRefresh = false){
  const loc = await getLocation(forceRefresh);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const key = monthKey(loc.lat, loc.lng, year, month);

  let cached = forceRefresh ? null : await store.getMeta(key);

  if(!cached){
    try{
      console.log('[prayer] Fetching month', month, year);
      const data = await fetchMonth(loc.lat, loc.lng, year, month);
      cached = { data, ts: Date.now() };
      await store.setMeta(key, cached);
    }catch(err){
      console.warn('[prayer] fetch failed, trying last-good snapshot', err.message);
      const snap = await _loadLastGoodMonth();
      if(!snap) throw err;
      cached = { data: snap.data, ts: snap.ts, stale: true };
    }
  }

  const todayStr =
    String(now.getDate()).padStart(2,'0') + '-' +
    String(month).padStart(2,'0') + '-' + year;

  const today = cached.data.find(d => d.date === todayStr);
  return { today, location: loc, cachedAt: cached.ts, stale: !!cached.stale };
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC — getMonth()
   Returns the full month array (30 entries).
   ═══════════════════════════════════════════════════════════ */
async function getMonth(year, month){
  const loc = await getLocation();
  const key = monthKey(loc.lat, loc.lng, year, month);
  const cached = await store.getMeta(key);
  if(cached) return { data: cached.data, ts: cached.ts, stale: false };
  try{
    const data = await fetchMonth(loc.lat, loc.lng, year, month);
    const ts = Date.now();
    await store.setMeta(key, { data, ts });
    return { data, ts, stale: false };
  }catch(err){
    console.warn('[prayer] getMonth fetch failed, falling back to last-good', err.message);
    const snap = await _loadLastGoodMonth();
    if(snap) return { data: snap.data, ts: snap.ts, stale: true };
    throw err;
  }
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