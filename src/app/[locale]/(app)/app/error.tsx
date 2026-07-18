'use client'

import { RouteError } from '@/components/ui/route-error'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Route-level error boundary for the Home screen. There is no "back home"
 * escape hatch — this *is* home — so recovery is retry-only. The stored plan
 * and history are untouched; "try again" re-mounts the screen and re-reads
 * them.
 */
const HomeError = ({ error, reset }: Props) => (
  <RouteError
    error={error}
    namespace="home.error"
    reset={reset}
    showHomeLink={false}
  />
)

export default HomeError
