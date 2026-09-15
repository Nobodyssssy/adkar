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

/* ── Smoothing buffer ── */
const SMOOTH_WINDOW = 8;       /* how many readings to average */
let _headingBuffer = [];       /* recent raw headings */

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

  /* iOS gives `webkitCompassHeading` — most accurate absolute heading */
  if(typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)){
    heading = e.webkitCompassHeading;
  }
  /* Android: use absolute alpha (degrees from north, counterclockwise) */
  else if(e.absolute === true && typeof e.alpha === 'number'){
    heading = (360 - e.alpha) % 360;
  }
  /* Some browsers give compass heading directly */
  else if(typeof e.alpha === 'number'){
    heading = (360 - e.alpha) % 360;
  }

  if(heading === null || Number.isNaN(heading)) return;

  _compassHeading = heading;

  /* Push to buffer, keep the last N */
  _headingBuffer.push(heading);
  if(_headingBuffer.length > SMOOTH_WINDOW) _headingBuffer.shift();

  /* Emit smoothed heading once we have enough samples */
  if(_headingBuffer.length >= 3){
    _smoothedHeading = circularMean(_headingBuffer);
    _compassListeners.forEach(fn => {
      try{ fn(_smoothedHeading); }catch(err){ /* ignore listener errors */ }
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
  _headingBuffer = [];
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
  _headingBuffer = [];
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
  _headingBuffer = [];
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

  /* Circular variance: how spread out are the readings? */
  const angles = _recentRawHeadings.slice(-8);
  let sumSin = 0, sumCos = 0;
  for(const deg of angles){
    const rad = deg * Math.PI / 180;
    sumSin += Math.sin(rad);
    sumCos += Math.cos(rad);
  }
  const r = Math.sqrt(sumSin * sumSin + sumCos * sumCos) / angles.length;
  /* r = 1 → perfect agreement; r = 0 → totally random
     We map r to accuracy: > 0.995 good, > 0.95 fair, else poor */

  if(r > 0.995) return 'good';
  if(r > 0.95)  return 'fair';
  return 'poor';
}

/* Track recent RAW headings for accuracy estimation */
onCompassChange((h) => {
  if(_compassHeading !== null){
    _recentRawHeadings.push(_compassHeading);
    if(_recentRawHeadings.length > 10) _recentRawHeadings.shift();
  }
});