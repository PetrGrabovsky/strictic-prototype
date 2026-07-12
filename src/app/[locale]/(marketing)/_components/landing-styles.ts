import { cn } from '@/lib/cn'

/** Page gutter + max width shared by header, hero, sections and footer. */
export const WRAP = 'mx-auto max-w-[1080px] px-[22px]'

/** Three-up responsive card grid (problem + audience sections). */
export const GRID3 = cn(
  'mt-[34px] grid grid-cols-1 gap-[16px]',
  'min-[760px]:grid-cols-3',
)

/** Small uppercase eyebrow above a section heading. */
export const KICKER = cn(
  'mb-[12px] block text-xs font-semibold uppercase',
  'tracking-[0.14em] text-accent-deep',
)

/** Muted intro paragraph under a section heading. */
export const LEAD = 'max-w-[640px] text-base text-ink-2'
