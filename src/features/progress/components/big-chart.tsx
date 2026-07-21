import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { createBarScale } from '@/features/progress/lib/bar-scale'
import type { BarDomain } from '@/features/progress/lib/bar-scale'
import { cn } from '@/lib/cn'
import { SCROLL_RAIL } from '@/styles/layout'

/**
 * Fixed bar width in px (BUILD-GUIDE §4, §5 local exception — DO NOT CHANGE).
 * Bars never stretch to fill the container: a single record must stay a
 * normal-width bar, not a full-width slab that breaks the label centring.
 * Exported so the start-state ghost preview draws bars of the same width.
 */
export const COLUMN_WIDTH = 42
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
  /**
   * Accessible name of the drill button — the bar's own value label alone
   * ("32 kg") would leave a screen reader with no idea which period it opens.
   * Ignored on a chart with no {@link ChartDrill}, where bars are not buttons.
   */
  label?: string
  value: number
}

/** A dashed reference line drawn across the plot at a fixed value. */
type ChartBaseline = {
  /** Named in the footer legend, never over the plot — a chip pinned inside
   * the scrolling content rides along with the bars and buries their labels. */
  label: string
  value: number
}

/**
 * Turns the value bars into a disclosure: each one is a button that opens the
 * caller's detail panel for its own period. Kept as one object because the
 * three parts are meaningless apart — a handler with no panel to point
 * `aria-controls` at is a button that announces nothing.
 */
type ChartDrill = {
  /** Key of the bar whose panel is open, or null when all are closed. */
  expandedKey: null | string
  /** The open bar's button, so the caller can hand focus back on close. */
  expandedRef: RefObject<HTMLButtonElement | null>
  onSelect: (key: string) => void
  /** `id` of the panel the bars control. */
  panelId: string
}

type Props = {
  /** Dashed reference line at a fixed value, e.g. the first-workout start. */
  baseline?: ChartBaseline
  /** Note closing the footer row: the date range, or the session count. */
  caption?: string
  /** Pins the scale to a fixed range so overview, detail and share match. */
  domain?: BarDomain
  /** Wires every value bar up as a disclosure button for a detail panel. */
  drill?: ChartDrill
  format: (value: number) => string
  height?: number
  /** Accessible name of the plot — what the bars measure. */
  label: string
  points: readonly ChartPoint[]
  variant?: 'accent' | 'ink'
}

type ChartColumnProps = {
  drill?: ChartDrill
  format: (value: number) => string
  height: number
  isNewest: boolean
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
  drill,
  format,
  height,
  isNewest,
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

  if (drill === undefined) {
    return (
      <div
        className="flex shrink-0 flex-col items-center justify-end"
        style={columnStyle}
      >
        {content}
      </div>
    )
  }

  const isExpanded = drill.expandedKey === point.key

  return (
    <button
      // `aria-controls` only while the panel exists — pointing at an id that
      // is not in the document is worse than pointing at nothing.
      aria-controls={isExpanded ? drill.panelId : undefined}
      aria-expanded={isExpanded}
      aria-label={point.label}
      className={cn(
        'relative flex shrink-0 cursor-pointer flex-col items-center justify-end',
        'rounded-sm before:absolute before:-inset-x-1 before:inset-y-0',
        "before:content-['']",
        'hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-accent-deep',
        isExpanded && 'bg-ink/10',
      )}
      onClick={() => drill.onSelect(point.key)}
      ref={isExpanded ? drill.expandedRef : undefined}
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
 * scroll (swipe on mobile, scroll rail on a pointer) rather than compressing,
 * and the view starts pinned to the most recent record. Bars that do fit run
 * from the start edge, so a short history reads as room to grow instead of a
 * chart that failed to load. A footer row carries whatever needs naming —
 * the baseline legend, the date range, the session count — outside the
 * scrolling plot, where nothing can ride over a bar. Given a
 * {@link ChartDrill} the bars become disclosure buttons for a detail panel.
 * The value→text mapping, the bars' accessible names and the date range are
 * injected pre-formatted, so this stays free of locale logic.
 */
export const BigChart = ({
  baseline,
  caption,
  domain,
  drill,
  format,
  height = 96,
  label,
  points,
  variant = 'accent',
}: Props) => {
  const trackRef = useRef<HTMLElement>(null)
  const isScrollable = points.length > 1
  const newestKey = points.at(-1)?.key

  // Open on the newest record: pin the scroll to the far end on data change.
  // Keyed on the newest bar as well as the count, so stepping the drill-down
  // to a period with the same number of sessions still re-pins.
  useEffect(() => {
    const track = trackRef.current
    if (track !== null) {
      track.scrollLeft = track.scrollWidth
    }
  }, [newestKey, points.length])

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
  // A single bar spans no range and needs no count spelled out under it.
  const hasCaption = caption !== undefined && isScrollable
  const hasFooter = hasCaption || baseline !== undefined

  return (
    <div>
      {/*
        A labelled `section` — a region — rather than a bare `div`: without
        drill buttons inside there is nothing here for the keyboard to land
        on, so a track wider than its card would be unreachable (WCAG 2.1.1).
        Focusing the track itself hands it the arrow keys, and the label says
        what was just reached. It stays focusable even on a chart that
        currently fits, because whether the bars outgrow the card depends on
        a width only the browser knows — and a named stop on a data chart
        earns itself regardless, as the one way a screen reader finds it.
      */}
      <section
        aria-label={label}
        className={cn(
          SCROLL_RAIL,
          'overflow-y-hidden',
          isScrollable ? 'overflow-x-auto' : 'overflow-x-hidden',
        )}
        ref={trackRef}
        tabIndex={drill === undefined && isScrollable ? 0 : undefined}
      >
        <div
          className="relative flex w-max items-end gap-2"
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
            />
          )}
          {points.map((point, index) => (
            <ChartColumn
              drill={drill}
              format={format}
              height={height}
              isNewest={index === lastIndex}
              key={point.key}
              point={point}
              scale={fractionOf}
              tone={tone}
            />
          ))}
        </div>
      </section>
      {hasFooter ? (
        <div
          className={cn(
            'mt-2 flex flex-wrap items-baseline justify-between',
            'gap-x-3 gap-y-1',
            'text-ink-3 text-2xs font-mono tabular-nums',
          )}
        >
          {baseline === undefined ? null : (
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="border-ink/50 w-4 shrink-0 border-t border-dashed"
              />
              {baseline.label}
            </span>
          )}
          {hasCaption ? <span className="ms-auto">{caption}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
