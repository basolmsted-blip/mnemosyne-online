/** Calibration for the shared flashlight. Units: pixels, milliseconds, 0–1 opacity.
 * Navigation, source credits and individual object depths live in _data/exhibition.yml.
 * Featured investigation settings there remain disabled until publication approval.
 */
export const exhibitionLighting = Object.freeze({
  enabled: true,
  colorTemperature: 2400,
  beamRadius: 220,
  hotspotRadius: 75,
  ambientVisibility: 0.25,
  pointerSmoothing: 60,
  shadowsEnabled: true,
  lightDepth: 360,
  shadowIntensity: 0.92,
  shadowSoftness: 0.65,
});
export const exhibitionAudio = Object.freeze({enabledByDefault:false, volume:0.23, fadeIn:2, fadeOut:1.5});
// A narrow desktop window or preview pane is still a desktop.
export function desktopEligible() {
  const touchTablet = /iPad|Tablet|Android/i.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  return !touchTablet && !navigator.userAgentData?.mobile &&
    matchMedia('(hover: hover) and (pointer: fine)').matches;
}
export const preference = {
  get(key) { try { return localStorage.getItem(`mnemosyne-${key}`); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(`mnemosyne-${key}`, value); } catch { /* Private mode still works. */ } },
};
