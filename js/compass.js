'use strict';

/* ═══════════════════════════════════════════════════════════
   Compass — live device heading for Qibla rotation
   • Uses DeviceOrientationEvent (magnetometer on phones)
   • iOS 13+ requires requestPermission() from a user gesture
   • Falls back gracefully on desktop (no compass)
   • Emits a heading in degrees (0-360, clockwise from North)
   ═══════════════════════════════════════════════════════════ */

let _compassActive = false;
let _compassHeading = null;   /* last known heading, 0-360 */
let _compassListeners = [];   /* callbacks for heading changes */
let _compassSupported = null; /* null = unknown, true/false after first check */

/* ── Feature detection ── */
function compassSupported(){
  if(_compassSupported !== null) return _compassSupported;
  _compassSupported =
    typeof window !== 'undefined' &&
    typeof DeviceOrientationEvent !== 'undefined';
  return _compassSupported;
}

/* ── Handle a deviceorientation event ── */
function _handleOrientation(e){
  /* iOS gives `webkitCompassHeading` — most accurate absolute heading */
  if(typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)){
    _compassHeading = e.webkitCompassHeading;
  }
  /* Android: use absolute alpha (degrees from north, counterclockwise) */
  else if(e.absolute === true && typeof e.alpha === 'number'){
    /* Convert alpha (counterclockwise from north) to clockwise heading */
    _compassHeading = (360 - e.alpha) % 360;
  }
  /* Some browsers give compass heading directly */
  else if(typeof e.alpha === 'number'){
    _compassHeading = (360 - e.alpha) % 360;
  }

  if(_compassHeading !== null){
    _compassListeners.forEach(fn => {
      try{ fn(_compassHeading); }catch(err){ /* ignore listener errors */ }
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   startCompass()
   Returns: Promise<{ ok: boolean, reason?: string }>
   ═══════════════════════════════════════════════════════════ */
async function startCompass(){
  if(_compassActive) return { ok: true };

  if(!compassSupported()){
    return { ok: false, reason: 'Compass not supported on this device' };
  }

  /* iOS 13+ needs explicit permission from a user gesture */
  if(typeof DeviceOrientationEvent.requestPermission === 'function'){
    try{
      const res = await DeviceOrientationEvent.requestPermission();
      if(res !== 'granted'){
        return { ok: false, reason: 'Compass permission denied' };
      }
    }catch(err){
      return { ok: false, reason: 'Compass permission error: ' + err.message };
    }
  }

  window.addEventListener('deviceorientationabsolute', _handleOrientation, true);
  window.addEventListener('deviceorientation', _handleOrientation, true);
  _compassActive = true;
  return { ok: true };
}

/* ── Stop listening ── */
function stopCompass(){
  if(!_compassActive) return;
  window.removeEventListener('deviceorientationabsolute', _handleOrientation, true);
  window.removeEventListener('deviceorientation', _handleOrientation, true);
  _compassActive = false;
  _compassHeading = null;
}

/* ── Subscribe to heading changes ── */
function onCompassChange(callback){
  _compassListeners.push(callback);
  /* Return unsubscribe function */
  return () => {
    _compassListeners = _compassListeners.filter(fn => fn !== callback);
  };
}

/* ── Current heading ── */
function getCompassHeading(){
  return _compassHeading;
}

/* ── Is compass running? ── */
function isCompassActive(){
  return _compassActive;
}

/* ═══════════════════════════════════════════════════════════
   Compute the arrow rotation
   rotation = qiblaBearing - deviceHeading
   Normalized to [-180, 180] for smooth animation
   ═══════════════════════════════════════════════════════════ */
function computeArrowRotation(qiblaDeg, deviceHeading){
  if(deviceHeading == null) return qiblaDeg;
  let diff = qiblaDeg - deviceHeading;
  while(diff > 180)  diff -= 360;
  while(diff < -180) diff += 360;
  return diff;
}

/* ═══════════════════════════════════════════════════════════
   Accuracy heuristic — how reliable is the heading?
   Some phones give noisy readings. We monitor the deltas.
   ═══════════════════════════════════════════════════════════ */
let _recentHeadings = [];
function compassAccuracy(){
  if(_recentHeadings.length < 5) return 'unknown';
  const diffs = [];
  for(let i = 1; i < _recentHeadings.length; i++){
    let d = _recentHeadings[i] - _recentHeadings[i - 1];
    if(d > 180)  d -= 360;
    if(d < -180) d += 360;
    diffs.push(Math.abs(d));
  }
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  if(avg < 3)  return 'good';
  if(avg < 10) return 'fair';
  return 'poor';
}

/* Track recent headings for accuracy estimation */
onCompassChange((h) => {
  _recentHeadings.push(h);
  if(_recentHeadings.length > 10) _recentHeadings.shift();
});