import { cn } from '@/lib/cn'

/**
 * The mono uppercase micro-label above a wizard field, section or step kicker.
 * Shared here (mirroring the marketing `landing-styles`) so the one eyebrow
 * style can't drift across the steps, the weight picker and the plan reveal.
 */
export const FIELD_LABEL = cn(
  'text-2xs font-mono font-medium uppercase tracking-[0.14em] text-ink-2',
)
