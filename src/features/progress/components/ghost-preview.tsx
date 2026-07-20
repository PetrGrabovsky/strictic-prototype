import { COLUMN_WIDTH } from '@/features/progress/components/big-chart'
import { cn } from '@/lib/cn'

/** The lone real record sits low so the promised future bars climb above it. */
const REAL_BAR_FRACTION = 0.32
/** Height fractions of the decorative future bars, climbing to the right. */
const GHOST_BAR_FRACTIONS = [0.5, 0.66, 0.82, 0.96]

type Props = {
  copy: string
  firstLabel: string
  /** Plot height in px — pass the card's chart height so the two stay in sync. */
  height: number
}

/**
 * The start state's stand-in for the real chart: the user's single record as a
 * solid bar, then ghost bars climbing away from it to promise the curve fills
 * in as they keep training. The ghost bars carry no data — dashed and faint,
 * they stay aria-hidden so a screen reader hears only the record and the copy.
 */
export const GhostPreview = ({ copy, firstLabel, height }: Props) => (
  <div>
    <div className="flex items-end justify-start gap-2" style={{ height }}>
      <div
        className="flex shrink-0 flex-col items-center justify-end"
        style={{ width: COLUMN_WIDTH }}
      >
        <span className="text-ink-3 text-2xs mb-1 font-mono tabular-nums">
          {firstLabel}
        </span>
        <div
          className="bg-accent w-full rounded-t-sm"
          style={{ height: height * REAL_BAR_FRACTION }}
        />
      </div>
      {GHOST_BAR_FRACTIONS.map((fraction) => (
        <div
          aria-hidden
          className={cn(
            'bg-accent/15 shrink-0 rounded-t-sm',
            'border-accent/25 border-t border-dashed',
          )}
          key={fraction}
          style={{ height: height * fraction, width: COLUMN_WIDTH }}
        />
      ))}
    </div>
    <p className="text-ink-3 mt-2 text-xs leading-relaxed">{copy}</p>
  </div>
)
