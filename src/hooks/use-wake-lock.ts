'use client'

import { useEffect } from 'react'

/**
 * Holds the screen awake while `active` (e.g. during a workout) via the
 * Screen Wake Lock API. The lock drops when the tab is backgrounded, so it is
 * re-requested on return to visibility; it is released on cleanup or when
 * `active` turns false. A no-op where the API is unsupported.
 */
export const useWakeLock = (isActive: boolean): void => {
  useEffect(() => {
    if (
      !isActive ||
      typeof navigator === 'undefined' ||
      !('wakeLock' in navigator)
    ) {
      return
    }

    let sentinel: null | WakeLockSentinel = null
    let isReleased = false

    const acquire = async (): Promise<void> => {
      if (document.visibilityState !== 'visible') {
        return
      }
      try {
        sentinel = await navigator.wakeLock.request('screen')
        if (isReleased) {
          void sentinel.release()
          sentinel = null
        }
      } catch {
        // Request can reject (not visible, policy, unsupported) — non-fatal.
      }
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible' && sentinel === null) {
        void acquire()
      }
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      isReleased = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void sentinel?.release()
      sentinel = null
    }
  }, [isActive])
}
