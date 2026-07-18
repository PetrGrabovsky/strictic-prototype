import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * The one button for the whole product — the landing, the app and the dark
 * training screen share it, so a button never looks different depending on
 * where it sits. Three roles: `primary` (dark ink on accent — white fails
 * contrast on orange, BUILD-GUIDE §4), `ink` (solid ink), `ghost` (outlined
 * surface). `tone="dark"` swaps the same three roles onto the `d-*` palette
 * for the training world. Sizes are fixed heights (44/48/56px) so every
 * button is a real tap target, not a padding guess.
 */
export const buttonVariants = cva(
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2',
    'rounded-md font-semibold whitespace-nowrap touch-manipulation',
    'transition-[filter,background-color,border-color] duration-100 ease-out',
    'hover:brightness-95 active:brightness-90',
    'disabled:pointer-events-none disabled:opacity-50',
  ),
  {
    variants: {
      size: {
        sm: 'h-11 px-4 text-sm',
        md: 'h-12 px-5 text-sm',
        lg: 'h-14 px-7 text-base',
      },
      tone: { dark: '', light: '' },
      variant: { ghost: 'border', ink: '', primary: '' },
    },
    compoundVariants: [
      { className: 'bg-accent text-d-bg', tone: 'light', variant: 'primary' },
      { className: 'bg-ink text-surface', tone: 'light', variant: 'ink' },
      {
        className: 'border-line-2 text-ink hover:border-ink bg-surface',
        tone: 'light',
        variant: 'ghost',
      },
      { className: 'bg-d-accent text-d-bg', tone: 'dark', variant: 'primary' },
      { className: 'bg-d-ink text-d-bg', tone: 'dark', variant: 'ink' },
      {
        className: 'border-d-line-2 text-d-ink',
        tone: 'dark',
        variant: 'ghost',
      },
    ],
    defaultVariants: { size: 'md', tone: 'light', variant: 'primary' },
  },
)

type Props = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants>

export const Button = ({ className, size, tone, variant, ...props }: Props) => (
  <button
    className={cn(buttonVariants({ size, tone, variant }), className)}
    type="button"
    {...props}
  />
)
