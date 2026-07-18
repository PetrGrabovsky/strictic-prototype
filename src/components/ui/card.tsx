import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * The one surface card for the whole product (DESIGN-SYSTEM §7): hairline
 * border, `radius-md` corners, `surface` fill — `tone="dark"` swaps the same
 * shape onto the training screen's `d-*` palette. `inset` is the only other
 * axis: `sm` (16px) for compact app cards, `md` (20px) for content blocks,
 * `lg` (24px) for roomy marketing cards, `none` for lists/accordions whose
 * rows own their spacing. Exported as `cardVariants` too, for elements that
 * can't be a `div` (`<details>`, `<li>`).
 */
export const cardVariants = cva('rounded-md border', {
  variants: {
    inset: {
      lg: 'p-6',
      md: 'p-5',
      none: '',
      sm: 'p-4',
    },
    tone: {
      dark: 'border-d-line-2 bg-d-card',
      light: 'border-line bg-surface',
    },
  },
  defaultVariants: { inset: 'sm', tone: 'light' },
})

type Props = ComponentPropsWithoutRef<'div'> & VariantProps<typeof cardVariants>

export const Card = ({ className, inset, tone, ...props }: Props) => (
  <div className={cn(cardVariants({ inset, tone }), className)} {...props} />
)
