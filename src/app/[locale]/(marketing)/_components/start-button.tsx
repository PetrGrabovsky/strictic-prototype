'use client'

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

  return (
    <button
      className={buttonClass(variant, className)}
      onClick={openAuthModal}
      type="button"
    >
      {label}
    </button>
  )
}
