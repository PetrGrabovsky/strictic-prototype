import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * The one button style for the app. `primary` uses dark ink on accent
 * (white fails contrast on orange — BUILD-GUIDE §4); `dark` is a solid ink
 * button; `ghost` is an outlined surface button.
 */
export const buttonVariants = cva(
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2',
    'rounded-md font-semibold whitespace-nowrap',
    'transition-[filter,background-color,border-color] duration-100 ease-out',
    'hover:brightness-95 active:brightness-90',
    'disabled:pointer-events-none disabled:opacity-50',
  ),
  {
    variants: {
      variant: {
        primary: 'bg-accent text-d-bg',
        dark: 'bg-ink text-surface',
        ghost: 'border-line-2 text-ink hover:border-ink border bg-surface',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-3 text-sm',
        lg: 'px-7.5 py-4 text-base',
      },
    },
    defaultVariants: { size: 'md', variant: 'primary' },
  },
)

type Props = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants>

export const Button = ({ className, size, variant, ...props }: Props) => (
  <button
    className={cn(buttonVariants({ size, variant }), className)}
    type="button"
    {...props}
  />
)
