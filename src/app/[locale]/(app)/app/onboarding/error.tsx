'use client'

import { RouteError } from '@/components/ui/route-error'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Route-level error boundary for the onboarding wizard. The draft lives in
 * React state, so a crash loses at most the current answers — "try again"
 * re-mounts a fresh wizard; a finished plan would already be persisted.
 */
const OnboardingError = ({ error, reset }: Props) => (
  <RouteError error={error} namespace="onboarding.error" reset={reset} />
)

export default OnboardingError
