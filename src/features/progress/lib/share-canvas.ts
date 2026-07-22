import {
  LOGO_MARK_ASPECT_RATIO,
  LOGO_MARK_PATHS,
  LOGO_MARK_VIEWBOX_HEIGHT,
} from '@/components/ui/logo-mark'
import { createBarScale } from '@/features/progress/lib/bar-scale'
import type { BarDomain } from '@/features/progress/lib/bar-scale'
import { MAX_OVERVIEW_BARS } from '@/features/progress/lib/bucket-series'
import { tokens } from '@/styles/tokens'

/** The share image is a fixed 1080×1080 square (DESIGN-SYSTEM §3, §7). */
const CANVAS_SIZE = 1080
const MARGIN = 92
const FALLBACK_FAMILY = 'system-ui, sans-serif'

const BARS_TOP = 648
const BARS_HEIGHT = 190
const BARS_GAP = 12
const BAR_RADIUS = 8
/** A skipped period's tick: a short dash on the floor, as wide as this bar. */
const GAP_TICK_WIDTH_FRACTION = 0.45
const GAP_TICK_HEIGHT = 5

/** Vertical anchors of the card's text blocks (canvas y coordinates). */
const KICKER_Y = 300
const NAME_Y = 384
const HEADLINE_Y = 540
const SUBLINE_Y = 600
const STAT_Y = 905

/** The logo lockup top-left: mark, wordmark, accent dot. */
const BRAND_BASELINE = MARGIN + 40
const BRAND_SIZE = 46
/** Inter's cap height as a fraction of its font size — centres the mark on
 *  the wordmark's optical middle rather than sitting it on the baseline. */
const BRAND_CAP_RATIO = 0.72
/** The mark stands a touch proud of the wordmark, as it does in the headers. */
const BRAND_MARK_HEIGHT = 50
const BRAND_MARK_GAP = 16
/** The wordmark's closing period, painted in the accent — the logo's single
 *  accent glyph, the same one the app header and the OG card render. */
const BRAND_ACCENT_DOT = '.'

type CanvasContext = CanvasRenderingContext2D

/** One column of the card's journey chart — a bucket, or a skipped period. */
export type ShareBar = {
  /** No session fell in this period — draw a gap tick, never a zero bar. */
  isEmpty: boolean
  value: number
}

/**
 * Everything drawn onto the share card. All copy is passed in already
 * localized and formatted — the drawing code holds no translatable copy of its
 * own (only the brand's fixed accent period), so it stays i18n-free (CLAUDE.md)
 * and the caller owns every translatable word.
 * `bars` is the same bucketed journey the Progress screen charts, and
 * `barsDomain` pins it to the exercise's session-level scale so the shared
 * image and the app draw identical proportions (BUILD-GUIDE decision 4).
 */
export type ShareCard = {
  bars: readonly ShareBar[]
  barsDomain?: BarDomain
  barsFromLabel: string
  barsToLabel: string
  brand: string
  footer: string
  headline: string
  kicker: string
  name: string
  statLabel: string
  statValue: string
  subline: string
  tagline: string
  url: string
}

/**
 * The brag text and landing URL that travel beside the image. Without them a
 * shared PNG is a dead end — the recipient sees the result and has no way to
 * reach the app, which is the whole point of the share loop.
 */
export type ShareMessage = {
  text: string
  url: string
}

type ShareOutcome = 'downloaded' | 'failed' | 'shared'

/**
 * A token hex plus an alpha channel, as an `rgba()` string — the only way to
 * get a translucent token color onto a canvas, which can't read the CSS
 * variables (BUILD-GUIDE §4.4). Every color still originates in `tokens.ts`.
 */
const withAlpha = (hex: string, alpha: number): string => {
  const value = hex.replace('#', '')
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

const fontOf = (family: string, weight: number, size: number): string =>
  `${weight} ${size}px ${family}`

/** Clipping stops here — fewer characters would be unreadable anyway. */
const MIN_CLIPPED_CHARS = 4

/** Truncate to fit `maxWidth`, appending an ellipsis when it had to cut. */
const fitText = (
  context: CanvasContext,
  text: string,
  maxWidth: number,
): string => {
  if (context.measureText(text).width <= maxWidth) {
    return text
  }
  let clipped = text
  while (
    clipped.length > MIN_CLIPPED_CHARS &&
    context.measureText(`${clipped}…`).width > maxWidth
  ) {
    clipped = clipped.slice(0, -1)
  }
  return `${clipped}…`
}

const drawStat = (
  context: CanvasContext,
  family: string,
  x: number,
  y: number,
  value: string,
  label: string,
): void => {
  context.textAlign = 'left'
  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 700, 52)
  context.fillText(value, x, y)
  context.fillStyle = withAlpha(tokens.dark.ink, 0.4)
  context.font = fontOf(family, 600, 22)
  context.fillText(label, x, y + 34)
}

/**
 * The bucketed journey under the headline: one column per period, newest at
 * full strength and the rest dimmed so the eye lands on today's number. A
 * period the user skipped keeps its slot as a floor tick — the same honesty
 * the on-screen chart owes (decision 7), and a lapsed month never silently
 * shortens the story.
 */
const drawJourney = (
  context: CanvasContext,
  family: string,
  card: ShareCard,
): void => {
  const bars = card.bars.slice(-MAX_OVERVIEW_BARS)
  if (bars.length === 0) {
    return
  }
  const left = MARGIN
  const width = CANVAS_SIZE - 2 * MARGIN
  const floor = BARS_TOP + BARS_HEIGHT
  const lastIndex = bars.length - 1

  context.strokeStyle = withAlpha(tokens.dark.ink, 0.1)
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(left, floor)
  context.lineTo(left + width, floor)
  context.stroke()

  const barWidth = (width - BARS_GAP * lastIndex) / bars.length
  // Empty periods carry no value to normalise against — scale to the real
  // bars only, or the pinned domain when the caller shares one. An all-empty
  // window falls back to every bar so no height can come out NaN.
  const filled = bars.filter((bar) => !bar.isEmpty)
  const scaled = filled.length > 0 ? filled : bars
  const fractionOf = createBarScale(
    scaled.map((bar) => bar.value),
    card.barsDomain,
  )
  const heightOf = (bar: ShareBar): number =>
    fractionOf(bar.value) * BARS_HEIGHT

  for (const [index, bar] of bars.entries()) {
    const x = left + index * (barWidth + BARS_GAP)
    if (bar.isEmpty) {
      const tickWidth = barWidth * GAP_TICK_WIDTH_FRACTION
      context.fillStyle = withAlpha(tokens.dark.ink, 0.25)
      context.beginPath()
      context.roundRect(
        x + (barWidth - tickWidth) / 2,
        floor - GAP_TICK_HEIGHT,
        tickWidth,
        GAP_TICK_HEIGHT,
        GAP_TICK_HEIGHT / 2,
      )
      context.fill()
      continue
    }
    const barHeight = heightOf(bar)
    context.globalAlpha = index === lastIndex ? 1 : 0.5
    context.fillStyle = tokens.dark.accent
    context.beginPath()
    context.roundRect(x, floor - barHeight, barWidth, barHeight, [
      BAR_RADIUS,
      BAR_RADIUS,
      0,
      0,
    ])
    context.fill()
  }
  context.globalAlpha = 1

  const first = bars[0]
  if (bars.length > 1 && !first.isEmpty) {
    context.textAlign = 'left'
    context.fillStyle = withAlpha(tokens.dark.ink, 0.5)
    context.font = fontOf(family, 600, 24)
    context.fillText(card.barsFromLabel, left, floor - heightOf(first) - 16)
  }
  const last = bars[lastIndex]
  context.textAlign = 'right'
  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 700, 27)
  context.fillText(
    card.barsToLabel,
    left + width,
    floor - (last.isEmpty ? 0 : heightOf(last)) - 16,
  )
  context.textAlign = 'left'
}

/**
 * The logo lockup — mark, wordmark, accent dot — top-left. It is the same
 * glyph the app header and the OG card show: the geometry is the shared
 * `LOGO_MARK_*`, painted here as a `Path2D` because a canvas can't mount the
 * `Logo` component. The kicker deliberately sits with the exercise name
 * further down and nowhere else — printing it up here too said the same word
 * twice on one card.
 */
const drawHeader = (
  context: CanvasContext,
  family: string,
  card: ShareCard,
): void => {
  const centerY = BRAND_BASELINE - (BRAND_SIZE * BRAND_CAP_RATIO) / 2
  const markWidth = BRAND_MARK_HEIGHT * LOGO_MARK_ASPECT_RATIO

  context.save()
  context.translate(MARGIN, centerY - BRAND_MARK_HEIGHT / 2)
  const markScale = BRAND_MARK_HEIGHT / LOGO_MARK_VIEWBOX_HEIGHT
  context.scale(markScale, markScale)
  context.fillStyle = tokens.dark.ink
  for (const path of LOGO_MARK_PATHS) {
    // Canvas `fill(Path2D)`, not `Array#fill` seeding a shared reference —
    // this unicorn rule keys on the method name alone and mis-flags a valid
    // draw call. Filling each sub-path separately matches the OG/SVG render.
    // eslint-disable-next-line unicorn/no-array-fill-with-reference-type
    context.fill(new Path2D(path))
  }
  context.restore()

  const wordmarkX = MARGIN + markWidth + BRAND_MARK_GAP
  context.textBaseline = 'alphabetic'
  context.textAlign = 'left'
  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 800, BRAND_SIZE)
  context.fillText(card.brand, wordmarkX, BRAND_BASELINE)

  // The accent dot is the wordmark's closing period — same glyph, baseline and
  // spacing as the app and OG lockups, not a free-floating circle.
  const brandWidth = context.measureText(card.brand).width
  context.fillStyle = tokens.dark.accent
  context.fillText(BRAND_ACCENT_DOT, wordmarkX + brandWidth, BRAND_BASELINE)
}

const drawFooter = (
  context: CanvasContext,
  family: string,
  card: ShareCard,
): void => {
  const line = CANVAS_SIZE - 150
  context.strokeStyle = withAlpha(tokens.dark.ink, 0.12)
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(MARGIN, line)
  context.lineTo(CANVAS_SIZE - MARGIN, line)
  context.stroke()

  context.textAlign = 'left'
  context.fillStyle = withAlpha(tokens.dark.ink, 0.8)
  context.font = fontOf(family, 600, 27)
  context.fillText(card.tagline, MARGIN, line + 46)
  context.fillStyle = withAlpha(tokens.dark.ink, 0.32)
  context.font = fontOf(family, 500, 22)
  context.fillText(card.footer, MARGIN, line + 80)

  context.textAlign = 'right'
  context.fillStyle = tokens.dark.accent
  context.font = fontOf(family, 700, 30)
  context.fillText(card.url, CANVAS_SIZE - MARGIN, line + 60)
  context.textAlign = 'left'
}

/**
 * Renders the shareable progress image on a 1080×1080 canvas. Canvas cannot
 * read the app's CSS color variables, so every fill comes from the JS token
 * mirror (`@/styles/tokens`) — the dark-theme palette, since the card is a
 * dark surface (BUILD-GUIDE §4.4). The font family is read from the live DOM
 * so the self-hosted Inter (a hashed `next/font` name, not the literal
 * "Inter") actually paints, after waiting for it to load.
 */
export const buildShareCanvas = async (
  card: ShareCard,
): Promise<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const context = canvas.getContext('2d')
  if (context === null) {
    return null
  }
  try {
    await document.fonts.ready
  } catch {
    // Fonts may be unavailable in some environments; paint with the fallback.
  }
  const family = getComputedStyle(document.body).fontFamily || FALLBACK_FAMILY

  context.fillStyle = tokens.dark.bg
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  const glow = context.createRadialGradient(
    CANVAS_SIZE * 0.84,
    CANVAS_SIZE * 0.12,
    0,
    CANVAS_SIZE * 0.84,
    CANVAS_SIZE * 0.12,
    CANVAS_SIZE * 0.92,
  )
  glow.addColorStop(0, withAlpha(tokens.dark.accent, 0.2))
  glow.addColorStop(1, withAlpha(tokens.dark.accent, 0))
  context.fillStyle = glow
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  drawHeader(context, family, card)

  context.fillStyle = tokens.dark.accent
  context.font = fontOf(family, 600, 26)
  context.fillText(card.kicker.toUpperCase(), MARGIN, KICKER_Y)

  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 700, 60)
  context.fillText(
    fitText(context, card.name, CANVAS_SIZE - 2 * MARGIN),
    MARGIN,
    NAME_Y,
  )

  context.font = fontOf(family, 800, 150)
  context.fillText(card.headline, MARGIN, HEADLINE_Y)
  context.fillStyle = withAlpha(tokens.dark.ink, 0.45)
  context.font = fontOf(family, 600, 40)
  context.fillText(card.subline, MARGIN, SUBLINE_Y)

  drawJourney(context, family, card)
  drawStat(context, family, MARGIN, STAT_Y, card.statValue, card.statLabel)
  drawFooter(context, family, card)

  return canvas
}

/**
 * The richest payload this platform will accept: the image together with the
 * brag text and landing URL where possible, the bare image otherwise. The
 * combination is probed rather than assumed — `navigator.share` rejects a
 * payload some targets cannot carry, and losing the whole share to get the
 * URL across would be a bad trade.
 */
const shareablePayload = (
  file: File,
  message: ShareMessage,
): null | ShareData => {
  if (typeof navigator.canShare !== 'function') {
    return null
  }
  const withMessage = {
    files: [file],
    text: message.text,
    url: message.url,
  }
  if (navigator.canShare(withMessage)) {
    return withMessage
  }
  const imageOnly = { files: [file] }
  return navigator.canShare(imageOnly) ? imageOnly : null
}

/**
 * Turns the rendered canvas into a PNG and hands it off: the native share
 * sheet when the platform can share files (mobile), otherwise a download.
 * The `message` rides along so the recipient gets a clickable way back to the
 * app instead of an anonymous image — the one step that turns a share into a
 * visit. A cancelled share sheet counts as handled, not a failure.
 */
export const deliverShareImage = async (
  canvas: HTMLCanvasElement,
  filename: string,
  message: ShareMessage,
): Promise<ShareOutcome> => {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
  if (blob === null) {
    return 'failed'
  }
  const file = new File([blob], filename, { type: 'image/png' })
  const payload = shareablePayload(file, message)
  if (payload !== null) {
    try {
      await navigator.share(payload)
      return 'shared'
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return 'shared'
      }
      // Any other share error falls through to a download.
    }
  }
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.download = filename
  anchor.href = url
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
