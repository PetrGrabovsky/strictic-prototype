import { cn } from '@/lib/cn'

/**
 * The skin every stepper arrow wears on top of `IconButton`: a bordered
 * surface disc. Shared so the carousel's exercise arrows and the chart
 * drill-down's period arrows read as the same control — they do the same
 * thing, one step at a time through a sequence.
 */
export const ARROW_BUTTON = cn(
  'border-line-2 text-ink bg-surface rounded-full border',
  'hover:brightness-95 active:brightness-90',
)
