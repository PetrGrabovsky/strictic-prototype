import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createBarScale } from '@/features/progress/lib/bar-scale'
import type { BarDomain } from '@/features/progress/lib/bar-scale'
import { cn } from '@/lib/cn'
import { rem } from '@/lib/rem'
import { SCROLL_RAIL } from '@/styles/layout'

/**
 * Fixed bar width in design px (BUILD-GUIDE §4, §5 local exception — DO NOT
 * CHANGE). Bars never stretch to fill the container: a single record must stay
 * a normal-width bar, not a full-width slab that breaks the label centring.
 * Rendered through {@link rem}, so "fixed" means fixed relative to the text it
 * carries, not to the browser's default font size. Exported so the start-state
 * ghost preview draws bars of the same width.
 */
export const COLUMN_WIDTH = 42

/**
 * The column's width as a CSS length. It grows with the reader's text so the
 * labels never outgrow the bar they sit in, but it never shrinks below the
 * design width: a reader who makes text *smaller* is not asking for a tap
 * target under 44px (WCAG 2.5.5), which a purely proportional column would
 * give them. Exported for the ghost preview, whose bars must line up with it.
 */
export const COLUMN_WIDTH_CSS = `max(${rem(COLUMN_WIDTH)}, ${COLUMN_WIDTH}px)`
/** Row under the plot carrying each column's period name, when one is given. */
const AXIS_HEIGHT = 16
/** Headroom above the tallest bar for an over-the-bar label. */
const GUTTER = 20
/**
 * The value label's own box: a 15px line inset 6px from the bar's top edge,
 * both measured in the browser. A number picked to feel safe instead is what
 * kept labels outside bars that had plenty of room for them.
 */
const INSIDE_LABEL_HEIGHT = 21
/** Clearance below the inside label, so it never sits flush on the baseline. */
const INSIDE_LABEL_CLEARANCE = 4
/** Labels move inside the bars once the *shortest* bar is at least this tall. */
const INSIDE_THRESHOLD = INSIDE_LABEL_HEIGHT + INSIDE_LABEL_CLEARANCE
/** Shortest a bar ever renders, so an empty/near-zero value still shows. */
const MIN_BAR_HEIGHT_PX = 2
/**
 * Width of one glyph in the labels' monospace face — measured, and exact
 * rather than typical: eight of any character render to 43.99px, at every
 * weight the chart uses. In design px like {@link COLUMN_WIDTH}, and both
 * scale together, so the budget below holds at any text size.
 */
const MONO_CHAR_WIDTH = 5.5
/**
 * Longest label that still fits inside a bar. `22,5 kg` (7) is the widest the
 * bar can hold; `106,3 kg` (8) would hang over both of its edges, putting dark
 * text half on the bar and half on the card. Above the bars the same label has
 * the whole column pitch to spread into, so length only gates going inside.
 */
const MAX_INSIDE_LABEL_CHARS = Math.floor(COLUMN_WIDTH / MONO_CHAR_WIDTH)

/** Pixel height of a bar from its scaled 0–1 fraction, never below the floor. */
const scaledBarHeight = (fraction: number, height: number): number =>
  Math.max(MIN_BAR_HEIGHT_PX, Math.round(fraction * height))

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
  /**
   * The period this bar covers, pre-formatted — `čvc`, `13. 7.`. Printed under
   * the bar as the chart's x axis, which is the only place a sighted reader
   * can learn what a bar *is*: the value label says `14 kg` and nothing else.
   * Omitted on every point, the axis row is not rendered at all.
   */
  axisLabel?: string
  /** No session fell in this period — render a faint gap tick, not a bar. */
  isEmpty?: boolean
  /** The current, still-filling period — rendered muted (decision 2). */
  isInProgress?: boolean
  /** The all-time-best bar — marked with a ★ above it. */
  isPr?: boolean
  key: string
  /**
   * Accessible name of the column. On a drill button it replaces the contents
   * outright — the bar's own value label ("32 kg") would leave a screen reader
   * with no idea which period it opens. On an empty period it is announced on
   * its own, because the gap tick is decorative and the axis label alone
   * ("bře") says nothing about there being no session. Elsewhere it is unused:
   * a plain bar already reads out its value and its axis label.
   */
  label?: string
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
  /**
   * A note printed under the plot — the session count. Suppressed on a
   * single-bar chart, which has nothing to summarise.
   */
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

type ChartBarProps = {
  format: (value: number) => string
  height: number
  /** Decided once for the whole chart — see {@link BigChart}. */
  isLabelInside: boolean
  isNewest: boolean
  point: ChartPoint
  scale: (value: number) => number
  tone: (typeof VARIANT)[keyof typeof VARIANT]
}

type ChartColumnProps = ChartBarProps & {
  /** Height reserved for the axis label, or 0 on a chart without an axis. */
  axisHeight: number
  drill?: ChartDrill
}

type ColumnAxisProps = {
  /** Reserved row height, or 0 on a chart whose points carry no axis label. */
  height: number
  /** The column states its period some other way — don't say it twice. */
  isDecorative?: boolean
  label?: string
}

/**
 * The x-axis cell under one column, naming the period that column covers.
 * It renders inside the column rather than as a separate aligned row: that
 * makes the period name part of a drill button's tap target — with the months
 * on screen, the name is the obvious thing to reach for. On the detail chart,
 * where bars are not buttons and nothing else carries the date, this text is
 * what a screen reader gets; on a drill button, that button's `aria-label`
 * replaces it; on an empty period, the column's own note supersedes it.
 */
const ColumnAxis = ({ height, isDecorative, label }: ColumnAxisProps) =>
  height === 0 ? null : (
    <span
      aria-hidden={isDecorative}
      className={cn(
        'text-ink-3 text-2xs w-full truncate pt-1 text-center',
        'font-mono leading-none tabular-nums',
      )}
      style={{ height: rem(height) }}
    >
      {label}
    </span>
  )

/**
 * The visual half of a value column: a ★ on the all-time record, the value
 * label — inside the bar or floated just above it, as the chart decided for
 * every bar at once — and the bar itself, muted under a dashed cap while its
 * period is still filling. A still-filling bar keeps its label above whatever
 * the rest of the chart does: the pale fill and the dashed cap say the number
 * is provisional, and a label sunk into that bar would undo it. Split out of
 * {@link ChartColumn}, which keeps only the column's geometry and the question
 * of whether it is a button.
 */
const ChartBar = ({
  format,
  height,
  isLabelInside,
  isNewest,
  point,
  scale,
  tone,
}: ChartBarProps) => {
  const barHeightPx = scaledBarHeight(scale(point.value), height)
  const isInProgress = point.isInProgress === true
  const isInside = isLabelInside && !isInProgress
  const shouldHighlightNewest = isNewest && !isInProgress
  const label = format(point.value)

  return (
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
        style={{ height: rem(barHeightPx) }}
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
}

/**
 * A single chart column: an empty period renders a faint gap tick, otherwise a
 * {@link ChartBar}, and either way the axis label naming the period below it.
 * A drillable column becomes a focusable button with a ≥44px tap target.
 */
const ChartColumn = ({ axisHeight, drill, ...bar }: ChartColumnProps) => {
  const { height, point } = bar
  const columnStyle = {
    height: rem(height + GUTTER + axisHeight),
    width: COLUMN_WIDTH_CSS,
  }
  if (point.isEmpty === true) {
    return (
      <div
        className="flex shrink-0 flex-col items-center justify-end"
        style={columnStyle}
      >
        {point.label === undefined ? null : (
          <span className="sr-only">{point.label}</span>
        )}
        <span aria-hidden className="bg-ink/30 h-0.5 w-3 rounded-full" />
        <ColumnAxis
          height={axisHeight}
          isDecorative={point.label !== undefined}
          label={point.axisLabel}
        />
      </div>
    )
  }

  const content = (
    <>
      <ChartBar {...bar} />
      <ColumnAxis height={axisHeight} label={point.axisLabel} />
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
        // No focus utility here on purpose: the global `:focus-visible` in
        // `globals.css` already rings every column the same way, and the
        // track reserves the room that ring needs to stay unclipped.
        'hover:brightness-105',
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
 * A horizontally-scrolling bar chart with a label on every bar — inside the
 * bars when the shortest of them has room, floated above them all when it does
 * not — and the newest record highlighted. Bars keep a fixed width and overflow
 * into a horizontal scroll (swipe on mobile, scroll rail on a pointer) rather
 * than compressing, and the view starts pinned to the most recent record. Bars
 * that do fit run from the start edge, so a short history reads as room to grow
 * instead of a chart that failed to load. Points carrying an
 * {@link ChartPoint.axisLabel} get an x axis under the plot, which is what
 * turns a row of bars into a timeline, and an optional caption closes a footer
 * row below it — outside the scrolling plot, where nothing can ride over a bar.
 * Given a {@link ChartDrill} the bars become disclosure buttons for a detail
 * panel. The value→text mapping and the bars' accessible names are injected
 * pre-formatted, so this stays free of locale logic.
 */
export const BigChart = ({
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
  // Whether the bars *actually* outgrow the card, as opposed to the guess
  // below — only layout can answer it, and only after a paint.
  const [doesOverflow, setDoesOverflow] = useState(false)
  // A guess, deliberately: `overflow-x` has to be `auto` before anything can
  // measure whether the track scrolls, so this cannot wait for the measurement.
  // One bar can never overflow, and is also the only chart with nothing to
  // summarise in a caption below.
  const hasMultipleBars = points.length > 1
  const hasDrillButtons = drill !== undefined
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

  // Only a chart whose bars are not buttons can ever need the tab stop, so
  // only that chart measures. Watching both boxes covers the two ways the
  // answer changes: the card resizing around the bars, and the bars
  // themselves changing in number.
  useEffect(() => {
    const track = trackRef.current
    if (hasDrillButtons || track === null) {
      return
    }
    const plot = track.firstElementChild
    if (plot === null) {
      return
    }
    const sync = () => setDoesOverflow(track.scrollWidth > track.clientWidth)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(track)
    observer.observe(plot)
    return () => observer.disconnect()
  }, [hasDrillButtons, points.length])

  if (points.length === 0) {
    return <div style={{ height: rem(height) }} />
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
  const axisHeight = points.some((point) => point.axisLabel !== undefined)
    ? AXIS_HEIGHT
    : 0
  // Where the value labels sit is settled once, for the whole chart, rather
  // than bar by bar: two bars a few pixels apart in height would otherwise be
  // labelled in two different places and two different colours, which reads as
  // two kinds of data. Either every bar can hold its label — tall enough for
  // the text and wide enough for it — or none does and they all float above.
  const isLabelInside = realValues.every(
    (value) =>
      scaledBarHeight(fractionOf(value), height) >= INSIDE_THRESHOLD &&
      format(value).length <= MAX_INSIDE_LABEL_CHARS,
  )
  const hasCaption = caption !== undefined && hasMultipleBars

  return (
    <div>
      {/*
        A labelled `section` — a region — rather than a bare `div`, so a
        screen reader can find the chart by name whatever else is true of it.
        It becomes a tab stop only when the bars really do outgrow the card
        *and* there are no drill buttons inside to tab through: then focusing
        the track is the one way a keyboard can pan it (WCAG 2.1.1). A track
        that fits gets no `tabIndex` — a stop that does nothing once reached
        is noise on the way to the controls that matter.
      */}
      <section
        aria-label={label}
        className={cn(
          SCROLL_RAIL,
          'overflow-y-hidden',
          // Room for a focused *column's* ring, which reaches 5px past its box
          // (the global `:focus-visible` in `globals.css` — 2px wide at a 3px
          // offset) and which this element would clip: `overflow-x: auto`
          // forces the vertical axis to clip too, so unpadded the ring lost
          // its top edge and both ends of the track lost their sides. The
          // matching negative margin spends the inset on the card's own
          // gutter, so nothing on screen moves. `SCROLL_RAIL`'s `pb-2` already
          // clears the bottom. Sized one step over the ring so it still clears
          // it for a reader who shrinks text — the inset is rem, the ring px.
          // Only the button chart takes it. With no drill the track itself is
          // the tab stop (see `tabIndex` below), and an element's own outline
          // is never clipped by its own overflow — but the inset would still
          // push that ring 8px further out on every side, and upwards that
          // lands it inside the detail panel's `‹ › ✕` row.
          hasDrillButtons && '-mx-2 -mt-2 px-2 pt-2',
          hasMultipleBars ? 'overflow-x-auto' : 'overflow-x-hidden',
        )}
        ref={trackRef}
        tabIndex={!hasDrillButtons && doesOverflow ? 0 : undefined}
      >
        {/*
          `relative` is load-bearing, not decoration: without it this track's
          overflow propagates out to the document once the chart sits inside
          the carousel's snap scroller, and the whole page gains a sideways
          scroll into empty space. Only reproducible with two or more exercise
          cards, so a single-exercise plan will never show it.
        */}
        <div
          className="relative flex w-max items-end gap-2"
          style={{ height: rem(height + GUTTER + axisHeight) }}
        >
          {points.map((point, index) => (
            <ChartColumn
              axisHeight={axisHeight}
              drill={drill}
              format={format}
              height={height}
              isLabelInside={isLabelInside}
              isNewest={index === lastIndex}
              key={point.key}
              point={point}
              scale={fractionOf}
              tone={tone}
            />
          ))}
        </div>
      </section>
      {hasCaption ? (
        <p
          className={cn(
            'text-ink-3 text-2xs mt-2 text-end',
            'font-mono tabular-nums',
          )}
        >
          {caption}
        </p>
      ) : null}
    </div>
  )
}
