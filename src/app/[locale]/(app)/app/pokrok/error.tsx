'use client'

import { RouteError } from '@/components/ui/route-error'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Route-level error boundary for the Progress screen. A crash while deriving
 * or rendering progress is contained here — the app shell and header stay up,
 * only this screen swaps to a recovery card (BUILD-GUIDE §4). History is
 * untouched, so "try again" re-mounts the screen and re-reads it.
 */
const ProgressError = ({ error, reset }: Props) => (
  <RouteError error={error} namespace="progress.error" reset={reset} />
)

export default ProgressError
