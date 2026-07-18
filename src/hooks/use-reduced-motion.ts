import { useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const subscribeToReducedMotion = (onChange: () => void) => {
  const query = globalThis.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => {
    query.removeEventListener('change', onChange)
  }
}

const isReducedMotionEnabled = () =>
  globalThis.matchMedia(REDUCED_MOTION_QUERY).matches

/**
 * Tracks `prefers-reduced-motion` through an external store, so the value is
 * read during render (no `setState` in an effect) with no hydration mismatch —
 * the server snapshot is always `false`. JS-driven animations (timers, rAF
 * loops) branch on this; CSS animations use the `motion-safe:`/`motion-reduce:`
 * variants instead.
 */
export const useIsReducedMotion = () =>
  useSyncExternalStore(
    subscribeToReducedMotion,
    isReducedMotionEnabled,
    () => false,
  )
