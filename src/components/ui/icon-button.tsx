import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  /** Accessible name — an icon-only button has no visible text to announce. */
  label: string
} & Omit<ComponentPropsWithoutRef<'button'>, 'aria-label'>

/**
 * The one icon-only action: a centered 44px square (WCAG 2.5.5 tap-target
 * floor) whose accessible name the type makes mandatory. Callers add the
 * skin — shape (`rounded-full`), colors, hover — via `className`.
 */
export const IconButton = ({ children, className, label, ...props }: Props) => (
  <button
    aria-label={label}
    className={cn(
      'flex size-11 shrink-0 cursor-pointer items-center justify-center',
      'touch-manipulation',
      className,
    )}
    {...props}
    type="button"
  >
    {children}
  </button>
)
