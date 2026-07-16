import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

type Props = ComponentPropsWithoutRef<'div'>

/**
 * The app surface card (DESIGN-SYSTEM §7): `surface` fill, hairline `line`
 * border, `radius-md` corners and default `p-4` padding. Override the padding
 * through `className` — it merges via `cn`, so `p-0` (a list whose rows own
 * their spacing) or a different fill wins over the defaults.
 */
export const Card = ({ className, ...props }: Props) => (
  <div
    className={cn('border-line bg-surface rounded-md border p-4', className)}
    {...props}
  />
)
