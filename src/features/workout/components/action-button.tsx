import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * The workout screen's action button — the dark-world counterpart to the light
 * `ui/Button`. Same shape language (rounded-md, centered, icon gap) on the
 * `d-*` palette, with fixed tap heights (48/56px) tuned for mid-set thumbs
 * (BUILD-GUIDE §4). `accent` is dark ink on accent — white fails contrast on
 * orange. Layout (margins, `flex-1`, inline padding) is passed via `className`.
 */
export const actionButtonVariants = cva(
  cn(
    'flex items-center justify-center gap-2 rounded-md touch-manipulation',
    'disabled:pointer-events-none disabled:opacity-40',
  ),
  {
    variants: {
      variant: {
        accent: 'bg-d-accent text-d-bg',
        ink: 'bg-d-ink text-d-bg',
        outline: 'border-d-line-2 text-d-ink border',
      },
      size: {
        sm: 'h-12 text-sm font-semibold',
        md: 'h-12 text-base font-bold',
        lg: 'h-14 text-base font-bold',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { block: true, size: 'md', variant: 'accent' },
  },
)

type Props = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof actionButtonVariants>

export const ActionButton = ({
  block,
  className,
  size,
  variant,
  ...props
}: Props) => (
  <button
    className={cn(actionButtonVariants({ block, size, variant }), className)}
    type="button"
    {...props}
  />
)
