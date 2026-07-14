import { cn } from '@/lib/cn'

export type ButtonVariant = 'ghost' | 'nav' | 'primary'

const BASE = cn(
  'inline-flex cursor-pointer items-center justify-center gap-2',
  'rounded-md px-7.5 py-4 text-base leading-none font-bold',
  'transition-[transform,box-shadow,background-color] duration-100 ease-out',
)

const VARIANTS: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-accent text-d-bg',
    'hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(255,77,28,0.28)]',
  ),
  ghost: cn(
    'border border-line-2 bg-transparent font-semibold text-ink',
    'hover:border-ink',
  ),
  nav: cn(
    'bg-accent px-4.5 py-3 text-sm font-semibold text-d-bg',
    'hover:bg-accent-deep hover:text-white',
  ),
}

/**
 * Shared CTA styling for both the interactive `StartButton` (a
 * `<button>`) and the plain hash-anchor variants on the landing, so the
 * two never drift apart. `cn` lets a later class in `extra` win a
 * Tailwind conflict.
 */
export const buttonClass = (variant: ButtonVariant, extra?: string) =>
  cn(BASE, VARIANTS[variant], extra)
