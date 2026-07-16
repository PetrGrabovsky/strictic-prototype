import { cn } from '@/lib/cn'

/** Page gutter + max width shared by header, hero, sections and footer. */
export const WRAP = 'mx-auto max-w-270 px-5.5'

/** Three-up responsive card grid (problem + audience sections). */
export const GRID3 = cn(
  'mt-8.5 grid grid-cols-1 gap-4',
  'min-[760px]:grid-cols-3',
)

/** Small uppercase eyebrow above a section heading. */
export const KICKER = cn(
  'mb-3 block text-xs font-semibold uppercase',
  'tracking-widest text-accent-deep',
)

/** Muted intro paragraph under a section heading. */
export const LEAD = 'max-w-160 text-base text-ink-2'
