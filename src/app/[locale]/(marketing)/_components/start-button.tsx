'use client'

import { trackEvent } from './analytics'
import { useAuthModal } from './auth-modal-provider'
import type { ButtonVariant } from './button-classes'
import { buttonClass } from './button-classes'

type Props = Readonly<{
  className?: string
  label: string
  variant?: ButtonVariant
}>

/**
 * Landing sign-in CTA. Opens the shared {@link AuthModal}; the real auth
 * flow lands in Etapa 6, so the modal itself is still a mock.
 */
export const StartButton = ({
  className,
  label,
  variant = 'primary',
}: Props) => {
  const openAuthModal = useAuthModal()

  // Record the funnel's "landing → wizard start" step before the modal
  // opens, so the event fires even if the modal render throws.
  const handleClick = () => {
    trackEvent('landing_cta')
    openAuthModal()
  }

  return (
    <button
      className={buttonClass(variant, className)}
      onClick={handleClick}
      type="button"
    >
      {label}
    </button>
  )
}
