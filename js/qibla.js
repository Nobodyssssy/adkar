'use strict';

/* ═══════════════════════════════════════════════════════════
   Qibla direction — pure math, no network
   • Computes the great-circle bearing from user to Kaaba
   • Bearing is measured clockwise from true North (0° = N, 90° = E)
   ═══════════════════════════════════════════════════════════ */

/* Kaaba coordinates (well-known, fixed) */
const KAABA_LAT = 21.4224779;
const KAABA_LNG = 39.8251832;

/* Convert degrees → radians */
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;

/**
 * Compute the initial great-circle bearing from (lat, lng) to the Kaaba.
 * @param {number} lat  user latitude in degrees
 * @param {number} lng  user longitude in degrees
 * @returns {number}    bearing in degrees [0, 360), clockwise from North
 */
function qiblaBearing(lat, lng){
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δλ = toRad(KAABA_LNG - lng);

  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let θ = toDeg(Math.atan2(x, y));
  /* Normalize to [0, 360) */
  θ = (θ + 360) % 360;
  return θ;
}

/**
 * Given a device heading (0-360, clockwise from North),
 * return the rotation angle to apply to a Qibla arrow image
 * so that it points toward the Kaaba.
 * Result is [-180, 180]: how many degrees to rotate clockwise
 * from "up" (device heading).
 */
function qiblaRotation(deviceHeading, qiblaDeg){
  let diff = qiblaDeg - deviceHeading;
  /* Normalize to [-180, 180] for a smooth arrow */
  while(diff > 180) diff -= 360;
  while(diff < -180) diff += 360;
  return diff;
}

/**
 * Cardinal direction name for a given bearing (English).
 */
function bearingToCardinal(deg){
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  const idx = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return dirs[idx];
}

/**
 * Haversine distance (km) from user to Kaaba.
 * Used for display: "You are 3,724 km from Makkah".
 */
function distanceToKaaba(lat, lng){
  const R = 6371; /* Earth radius in km */
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δφ = toRad(KAABA_LAT - lat);
  const Δλ = toRad(KAABA_LNG - lng);
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}