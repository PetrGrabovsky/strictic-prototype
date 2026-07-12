'use client'

import type { ButtonVariant } from './button-classes'
import { buttonClass } from './button-classes'

type Props = Readonly<{
  className?: string
  label: string
  variant?: ButtonVariant
}>

const handleClick = () => {
  // TODO(auth step): open the sign-in modal instead of logging.
  console.info('Strictic sign-in CTA — auth wiring lands next step')
}

/**
 * Landing sign-in CTA. The real auth flow (modal / OAuth) arrives in a
 * later step; for now the click is intentionally inert so the button is
 * visually complete without wiring anything up yet.
 */
export const StartButton = ({
  className,
  label,
  variant = 'primary',
}: Props) => (
  <button
    className={buttonClass(variant, className)}
    onClick={handleClick}
    type="button"
  >
    {label}
  </button>
)
