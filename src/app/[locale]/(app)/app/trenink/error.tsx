'use client'

import { RouteError } from '@/components/ui/route-error'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Route-level error boundary for the workout. A crash mid-session is contained
 * here — the app shell and header stay up, only this screen swaps to a recovery
 * card (BUILD-GUIDE §4). Logged sets are already persisted to the session, so
 * "try again" re-mounts the flow and resumes where the user left off.
 */
const TrainingError = ({ error, reset }: Props) => (
  <RouteError
    error={error}
    namespace="workout.error"
    reset={reset}
    tone="dark"
  />
)

export default TrainingError
