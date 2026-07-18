import { useEffect, useRef } from 'react'
import { createBarScale } from '@/features/progress/lib/bar-scale'
import { cn } from '@/lib/cn'
import { SCROLLBAR_HIDDEN } from '@/styles/layout'

/**
 * Fixed bar width in px (BUILD-GUIDE §4, §5 local exception — DO NOT CHANGE).
 * Bars never stretch to fill the container: a single record must stay a
 * normal-width bar, not a full-width slab that breaks the label centring.
 */
const COLUMN_WIDTH = 42
/** Headroom above the tallest bar for an over-the-bar label. */
const GUTTER = 20
/** A label fits inside the bar only once the bar is at least this tall. */
const INSIDE_THRESHOLD = 30
/** Shortest a bar ever renders, so an empty/near-zero value still shows. */
const MIN_BAR_HEIGHT_PX = 2

/**
 * On the accent (orange) bars the inside label must be dark — white fails
 * contrast on orange (BUILD-GUIDE §4). On the dark ink bars it must be white.
 * The over-the-bar label for the newest record uses the AA-safe deep accent
 * (plain accent fails as small text on the page background — §4/§5).
 */
const VARIANT = {
  accent: {
    bar: 'bg-accent',
    inside: 'text-ink',
    newestAbove: 'text-accent-deep',
  },
  ink: { bar: 'bg-ink', inside: 'text-surface', newestAbove: 'text-ink' },
} as const

/** One bar: a stable key (a session date) plus the value it represents. */
type ChartPoint = {
  key: string
  value: number
}

type Props = {
  format: (value: number) => string
  height?: number
  points: readonly ChartPoint[]
  /** Pre-formatted "from – to" date range, shown once under the bars. */
  rangeLabel?: string
  variant?: 'accent' | 'ink'
}

/**
 * A horizontally-scrolling bar chart with a label on every bar — inside when
 * the bar is tall enough, otherwise floated just above it — and the newest
 * record highlighted. Bars keep a fixed width and overflow into a horizontal
 * scroll (swipe on mobile) rather than compressing, and the view starts
 * pinned to the most recent record. The value→text mapping and the date range
 * are injected pre-formatted, so this stays free of locale logic.
 */
export const BigChart = ({
  format,
  height = 96,
  points,
  rangeLabel,
  variant = 'accent',
}: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const isScrollable = points.length > 1

  // Open on the newest record: pin the scroll to the far end on data change.
  useEffect(() => {
    const track = trackRef.current
    if (track !== null) {
      track.scrollLeft = track.scrollWidth
    }
  }, [points.length])

  if (points.length === 0) {
    return <div style={{ height }} />
  }

  const fractionOf = createBarScale(points.map((point) => point.value))
  const tone = VARIANT[variant]
  const lastIndex = points.length - 1

  const barHeight = (value: number): number =>
    Math.max(MIN_BAR_HEIGHT_PX, Math.round(fractionOf(value) * height))

  return (
    <div>
      <div
        className={cn(
          SCROLLBAR_HIDDEN,
          'overflow-y-hidden',
          isScrollable ? 'overflow-x-auto' : 'overflow-x-hidden',
        )}
        ref={trackRef}
      >
        <div
          className="flex w-max min-w-full items-end justify-end gap-2"
          style={{ height: height + GUTTER }}
        >
          {points.map((point, index) => {
            const barHeightPx = barHeight(point.value)
            const isInside = barHeightPx >= INSIDE_THRESHOLD
            const isNewest = index === lastIndex
            return (
              <div
                className="flex shrink-0 flex-col items-center justify-end"
                key={point.key}
                style={{ height: height + GUTTER, width: COLUMN_WIDTH }}
              >
                {isInside ? null : (
                  <span
                    className={cn(
                      'text-2xs mb-1 font-mono whitespace-nowrap tabular-nums',
                      isNewest
                        ? cn(tone.newestAbove, 'font-bold')
                        : 'text-ink-3 font-medium',
                    )}
                  >
                    {format(point.value)}
                  </span>
                )}
                <div
                  className={cn(
                    'flex w-full items-start justify-center rounded-t-sm',
                    tone.bar,
                  )}
                  style={{ height: barHeightPx }}
                >
                  {isInside ? (
                    <span
                      className={cn(
                        'text-2xs mt-1.5 font-mono whitespace-nowrap tabular-nums',
                        tone.inside,
                        isNewest ? 'font-bold' : 'font-semibold',
                      )}
                    >
                      {format(point.value)}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {rangeLabel !== undefined && isScrollable ? (
        <p className="text-ink-3 text-2xs mt-2 text-end font-mono">
          {rangeLabel}
        </p>
      ) : null}
    </div>
  )
}
