
## 2026-09-18 — Qibla compass removed

The qibla compass was removed because browser `DeviceOrientationEvent`
produces headings that are ~110° off true north on some Android devices
(tested on Galaxy A52s), and `AbsoluteOrientationSensor` is not reliably
available across browsers. A native sensor-fusion approach is required
for accurate results, which is not possible from a PWA.

Prayer times, countdown, and location features remain. The Qibla direction
is still shown as a text bearing (e.g., "ESE · 118 km to Makkah").
