/**
 * Plausible custom events emitted from the landing. Keep this union in
 * sync with the funnel events the dashboard expects
 * (docs/reference/strictic-blueprint.md §5).
 */
type PlausibleEvent = 'landing_cta'

type PlausibleTracker = (event: PlausibleEvent) => void

declare global {
  /**
   * The tracking script (or the init stub in the root layout) assigns this
   * on the global scope. `var` is the only declaration form that augments
   * the global type.
   */
  var plausible: PlausibleTracker | undefined
}

/**
 * Sends a Plausible custom event. No-op on the server and before the
 * script has loaded; the init stub in the root layout queues early calls
 * so none are lost.
 */
export const trackEvent = (event: PlausibleEvent) => {
  globalThis.plausible?.(event)
}
