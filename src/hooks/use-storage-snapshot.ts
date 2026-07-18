import { useEffect, useState } from 'react'

/**
 * One-shot load of persisted state for a screen: `null` while the read is in
 * flight, then whatever the loader resolved. A result that lands after the
 * component unmounted is dropped, so a stale read can never set state.
 *
 * `load` must be a module-level loader (stable identity) — the effect re-runs
 * when it changes. Screens put their whole "read storage → decide what this
 * visit looks like" logic inside the loader, so the impure reads (storage,
 * `Date.now()`) stay out of the render path and the component just branches
 * on the snapshot. Interim pattern for the localStorage era: Etapa 6 replaces
 * these client loads with server fetches + Suspense.
 */
export const useStorageSnapshot = <Snapshot>(
  load: () => Promise<Snapshot>,
): null | Snapshot => {
  const [snapshot, setSnapshot] = useState<null | Snapshot>(null)

  useEffect(() => {
    let isActive = true
    void load().then((value) => {
      if (isActive) {
        setSnapshot(value)
      }
    })
    return () => {
      isActive = false
    }
  }, [load])

  return snapshot
}
