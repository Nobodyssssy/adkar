'use strict';

/* ═══════════════════════════════════════════════════════════
   Compass — live device heading for Qibla rotation
   • Uses DeviceOrientationEvent (magnetometer on phones)
   • iOS 13+ requires requestPermission() from a user gesture
   • Falls back gracefully on desktop (no compass)
   • Emits a smoothed heading in degrees (0-360, clockwise from North)
   ═══════════════════════════════════════════════════════════ */

let _compassActive = false;
let _compassHeading = null;    /* last RAW heading, 0-360 */
let _smoothedHeading = null;   /* last SMOOTHED heading */
let _compassListeners = [];    /* callbacks for heading changes */
let _compassSupported = null;  /* null = unknown, true/false after first check */


/* ═══════════════════════════════════════════════════════════
   Circular mean — averages angles correctly (no 359/0 wrap issues)
   ═══════════════════════════════════════════════════════════ */
function circularMean(angles){
  if(!angles.length) return null;
  let sumSin = 0, sumCos = 0;
  for(const deg of angles){
    const rad = deg * Math.PI / 180;
    sumSin += Math.sin(rad);
    sumCos += Math.cos(rad);
  }
  const meanRad = Math.atan2(sumSin / angles.length, sumCos / angles.length);
  let meanDeg = meanRad * 180 / Math.PI;
  if(meanDeg < 0) meanDeg += 360;
  return meanDeg;
}

/* ═══════════════════════════════════════════════════════════
   Feature detection
   ═══════════════════════════════════════════════════════════ */
function compassSupported(){
  if(_compassSupported !== null) return _compassSupported;
  _compassSupported =
    typeof window !== 'undefined' &&
    typeof DeviceOrientationEvent !== 'undefined';
  return _compassSupported;
}

/* ═══════════════════════════════════════════════════════════
   Handle a deviceorientation event — push to buffer, emit smoothed
   ═══════════════════════════════════════════════════════════ */
function _handleOrientation(e){
  let heading = null;

  /* ── iOS: webkitCompassHeading is already true magnetic north ── */
  if(typeof e.webkitCompassHeading === 'number' &&
     !Number.isNaN(e.webkitCompassHeading)){
    heading = e.webkitCompassHeading;
  }
  /* ── Android: combined Euler-angle formula ──
     This is more forgiving than the pure alpha approach and doesn't
     suffer the 180° flip that the rotation-matrix formula had.
     Reference: known-good Qibla apps use this pattern. */
  else if(typeof e.alpha === 'number' && !Number.isNaN(e.alpha)){
    const alpha = e.alpha;
    const beta  = e.beta  || 0;
    const gamma = e.gamma || 0;

    /* Samsung (and some other Android) devices report alpha 180°
       out of phase with what the standard formula expects.
       Compensate by adding 180° before normalizing. */
    let compass = -(alpha + beta * gamma / 90) + 180;
    compass = ((compass % 360) + 360) % 360;
    heading = compass;
  }

  /* ── Debug readout (visible in the compass card if the element exists) ── */
  const dbg = document.getElementById('qibla-debug');
  if(dbg){
    dbg.textContent =
      `a:${e.alpha != null ? e.alpha.toFixed(0) : '--'}  ` +
      `b:${e.beta  != null ? e.beta.toFixed(0)  : '--'}  ` +
      `g:${e.gamma != null ? e.gamma.toFixed(0) : '--'}  ` +
      `abs:${e.absolute ? 'Y' : 'N'}  ` +
      `h:${heading != null ? heading.toFixed(0) : '--'}`;
  }

  if(heading === null || Number.isNaN(heading)) return;

  _compassHeading = heading;

  /* ── Low-pass filter (exponential smoothing) ──
     This is more responsive than a buffer average and
     doesn't introduce the "spin the long way around" lag.
     smoothingFactor: 0.15 = fairly smooth, still responsive.
     Lower = smoother but more lag. Higher = more jitter. */
  const smoothingFactor = 0.15;

  if(_smoothedHeading === null){
    /* First reading — just take it as-is */
    _smoothedHeading = heading;
  } else {
    /* Compute the shortest-path difference (handles 0/360 wrap) */
    let diff = heading - _smoothedHeading;
    while(diff > 180)  diff -= 360;
    while(diff < -180) diff += 360;

    /* Apply the filter */
    _smoothedHeading = _smoothedHeading + smoothingFactor * diff;

    /* Normalize back to [0, 360) */
    _smoothedHeading = ((_smoothedHeading % 360) + 360) % 360;
  }

  /* Emit */
  _compassListeners.forEach(fn => {
    try{ fn(_smoothedHeading); }catch(err){ /* ignore */ }
  });
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
  _smoothedHeading = null;
}

/* ── Subscribe to heading changes ── */
function onCompassChange(callback){
  _compassListeners.push(callback);
  return () => {
    _compassListeners = _compassListeners.filter(fn => fn !== callback);
  };
}

/* ── Current headings ── */
function getCompassHeading(){ return _smoothedHeading; }
function getRawCompassHeading(){ return _compassHeading; }

/* ── Is compass running? ── */
function isCompassActive(){
  return _compassActive;
}

/* ── Reset calibration buffer ── */
function resetCompassCalibration(){
	  _smoothedHeading = null;
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
   Accuracy — measures the jitter of recent RAW readings
   • We use a wider window and looser thresholds now
   • 'poor' only when readings are genuinely chaotic
   ═══════════════════════════════════════════════════════════ */
let _recentRawHeadings = [];

function compassAccuracy(){
  if(_recentRawHeadings.length < 6) return 'unknown';

  const angles = _recentRawHeadings.slice(-8);
  let sumSin = 0, sumCos = 0;
  for(const deg of angles){
    const rad = deg * Math.PI / 180;
    sumSin += Math.sin(rad);
    sumCos += Math.cos(rad);
  }
  const r = Math.sqrt(sumSin * sumSin + sumCos * sumCos) / angles.length;

  /* Loosened thresholds: most phones produce r in the 0.97-0.999 range
     even when "stable". Only flag genuinely chaotic readings as poor. */
  if(r > 0.98) return 'good';
  if(r > 0.90) return 'fair';
  return 'poor';
}

/* Track recent RAW headings for accuracy estimation */
onCompassChange((h) => {
  if(_compassHeading !== null){
    _recentRawHeadings.push(_compassHeading);
    if(_recentRawHeadings.length > 10) _recentRawHeadings.shift();
  }
});