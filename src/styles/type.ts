import { cn } from '@/lib/cn'

/**
 * The mono uppercase micro-label (DESIGN-SYSTEM §2 label role): wizard field
 * legends, screen kickers, card eyebrows. Every constant in this module is
 * typography only — tone-agnostic, so both palettes share one voice. The
 * caller adds the ink (`text-ink-2`, `text-d-ink-3`, an accent…) and layout.
 */
export const MICRO_LABEL = cn(
  'text-2xs font-mono font-medium uppercase tracking-widest',
)

/**
 * The same label voice one step louder — section headings inside app
 * screens (Progress volume/regularity blocks, workout card headers).
 */
export const SECTION_LABEL = cn(
  'font-mono text-xs font-medium uppercase tracking-widest',
)

/**
 * A quiet tertiary text action — discard, undo, "back home". Deliberately
 * whisper-level next to real buttons, but still a full ≥44px tap target.
 */
export const QUIET_ACTION = cn(
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5',
  'text-2xs touch-manipulation font-mono tracking-wide uppercase',
)
