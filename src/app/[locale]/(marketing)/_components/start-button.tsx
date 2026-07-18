'use client'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { trackEvent } from './analytics'
import { useAuthModal } from './auth-modal-provider'

/** The two roles a landing CTA can play; size is a separate axis. */
export type StartButtonVariant = 'ghost' | 'primary'

type Props = Readonly<{
  className?: string
  label: string
  size?: 'lg' | 'md'
  variant?: StartButtonVariant
}>

/**
 * Landing sign-in CTA. Opens the shared {@link AuthModal}; the real auth
 * flow lands in Etapa 6, so the modal itself is still a mock. Defaults to
 * the large primary CTA; the header passes `size="md"`, the free pricing
 * tier `variant="ghost"`.
 */
export const StartButton = ({
  className,
  label,
  size = 'lg',
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
      className={cn(buttonVariants({ size, variant }), className)}
      onClick={handleClick}
      type="button"
    >
      {label}
    </button>
  )
}
