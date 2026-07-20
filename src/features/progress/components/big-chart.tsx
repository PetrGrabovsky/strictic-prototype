import { useEffect, useRef } from 'react'
import { createBarScale } from '@/features/progress/lib/bar-scale'
import type { BarDomain } from '@/features/progress/lib/bar-scale'
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
 * Clamps a 0–1 height fraction so a baseline whose value sits outside the
 * scaled range still renders inside the plot rather than off-canvas.
 */
const clampFraction = (fraction: number): number =>
  Math.min(1, Math.max(0, fraction))

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
    muted: 'bg-accent/25',
    newestAbove: 'text-accent-deep',
  },
  ink: {
    bar: 'bg-ink',
    inside: 'text-surface',
    muted: 'bg-ink/20',
    newestAbove: 'text-ink',
  },
} as const

/** Glyph marking the all-time-record bar; decorative, so kept aria-hidden. */
const PR_STAR = '★'

/** One bar: a stable key, its value, and optional journey-state flags. */
type ChartPoint = {
  /** No session fell in this period — render a faint gap tick, not a bar. */
  isEmpty?: boolean
  /** The current, still-filling period — rendered muted (decision 2). */
  isInProgress?: boolean
  /** The all-time-best bar — marked with a ★ above it. */
  isPr?: boolean
  key: string
  value: number
}

/** A dashed reference line drawn across the plot at a fixed value. */
type ChartBaseline = {
  label: string
  value: number
}

type Props = {
  /** Dashed reference line at a fixed value, e.g. the first-workout start. */
  baseline?: ChartBaseline
  /** Pins the scale to a fixed range so overview, detail and share match. */
  domain?: BarDomain
  format: (value: number) => string
  height?: number
  /** Called with a bar's key on tap; drillable bars become focusable buttons. */
  onSelectBar?: (key: string) => void
  points: readonly ChartPoint[]
  /** Pre-formatted "from – to" date range, shown once under the bars. */
  rangeLabel?: string
  variant?: 'accent' | 'ink'
}

type ChartColumnProps = {
  format: (value: number) => string
  height: number
  isNewest: boolean
  onSelect?: (key: string) => void
  point: ChartPoint
  scale: (value: number) => number
  tone: (typeof VARIANT)[keyof typeof VARIANT]
}

/**
 * A single chart column: an empty period renders a faint gap tick, otherwise a
 * value-scaled bar with its label inside (tall bars) or floated above (short
 * ones). The all-time record gains a ★, the in-progress period renders muted,
 * and a drillable column becomes a focusable button with a ≥44px tap target.
 */
const ChartColumn = ({
  format,
  height,
  isNewest,
  onSelect,
  point,
  scale,
  tone,
}: ChartColumnProps) => {
  const columnStyle = { height: height + GUTTER, width: COLUMN_WIDTH }

  if (point.isEmpty === true) {
    return (
      <div
        className="flex shrink-0 flex-col items-center justify-end"
        style={columnStyle}
      >
        <span aria-hidden className="bg-ink/30 h-0.5 w-3 rounded-full" />
      </div>
    )
  }

  const barHeightPx = Math.max(
    MIN_BAR_HEIGHT_PX,
    Math.round(scale(point.value) * height),
  )
  const isInProgress = point.isInProgress === true
  const isInside = barHeightPx >= INSIDE_THRESHOLD && !isInProgress
  const shouldHighlightNewest = isNewest && !isInProgress
  const label = format(point.value)

  const content = (
    <>
      {point.isPr === true ? (
        <span
          aria-hidden
          className="text-accent-deep text-2xs mb-auto leading-none font-bold"
        >
          {PR_STAR}
        </span>
      ) : null}
      {isInside ? null : (
        <span
          className={cn(
            'text-2xs mb-1 font-mono whitespace-nowrap tabular-nums',
            shouldHighlightNewest
              ? cn(tone.newestAbove, 'font-bold')
              : 'text-ink-3 font-medium',
          )}
        >
          {label}
        </span>
      )}
      <div
        className={cn(
          'flex w-full items-start justify-center rounded-t-sm',
          isInProgress
            ? cn(tone.muted, 'border-ink/40 border-t border-dashed')
            : tone.bar,
        )}
        style={{ height: barHeightPx }}
      >
        {isInside ? (
          <span
            className={cn(
              'text-2xs mt-1.5 font-mono whitespace-nowrap tabular-nums',
              tone.inside,
              shouldHighlightNewest ? 'font-bold' : 'font-semibold',
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    </>
  )

  if (onSelect === undefined) {
    return (
      <div
        className="flex shrink-0 flex-col items-center justify-end"
        style={columnStyle}
      >
        {content}
      </div>
    )
  }

  return (
    <button
      className={cn(
        'relative flex shrink-0 cursor-pointer flex-col items-center justify-end',
        'rounded-sm before:absolute before:-inset-x-1 before:inset-y-0',
        "before:content-['']",
        'hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-accent-deep',
      )}
      onClick={() => onSelect(point.key)}
      style={columnStyle}
      type="button"
    >
      {content}
    </button>
  )
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
  baseline,
  domain,
  format,
  height = 96,
  onSelectBar,
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

  // Empty periods carry no value to normalise against — scale to the real
  // bars, falling back to every point if a window is somehow all-empty.
  const realValues = points
    .filter((point) => point.isEmpty !== true)
    .map((point) => point.value)
  const scaleValues =
    realValues.length > 0 ? realValues : points.map((point) => point.value)
  const fractionOf = createBarScale(scaleValues, domain)
  const tone = VARIANT[variant]
  const lastIndex = points.length - 1

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
          className="relative flex w-max min-w-full items-end justify-end gap-2"
          style={{ height: height + GUTTER }}
        >
          {baseline !== undefined && (
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-0 z-10',
                'border-ink/50 border-t border-dashed',
              )}
              style={{
                bottom: clampFraction(fractionOf(baseline.value)) * height,
              }}
            >
              <span className="text-ink-3 text-2xs bg-surface absolute end-0 -top-4 rounded-sm px-1 font-mono">
                {baseline.label}
              </span>
            </div>
          )}
          {points.map((point, index) => (
            <ChartColumn
              format={format}
              height={height}
              isNewest={index === lastIndex}
              key={point.key}
              onSelect={onSelectBar}
              point={point}
              scale={fractionOf}
              tone={tone}
            />
          ))}
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
