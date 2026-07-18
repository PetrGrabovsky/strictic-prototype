/**
 * Fires a vibration pattern on supported devices. Haptics intentionally run
 * regardless of the app's mute setting — mute governs SOUND, not touch
 * feedback (BUILD-GUIDE §4) — so callers do not gate this on mute.
 */
export const vibrate = (pattern: number | number[]): void => {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.vibrate !== 'function'
  ) {
    return
  }
  try {
    navigator.vibrate(pattern)
  } catch {
    // Vibration is a progressive enhancement; ignore unsupported engines.
  }
}
