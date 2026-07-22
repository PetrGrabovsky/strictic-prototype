import {
  LOGO_MARK_ASPECT_RATIO,
  LOGO_MARK_PATHS,
  LOGO_MARK_VIEWBOX_HEIGHT,
} from '@/components/ui/logo-mark'
import { createBarScale } from '@/features/progress/lib/bar-scale'
import type { BarDomain } from '@/features/progress/lib/bar-scale'
import { MAX_OVERVIEW_BARS } from '@/features/progress/lib/bucket-series'
import { tokens } from '@/styles/tokens'

/**
 * The share image is a 1080×1920 story (9:16) — the format Stories fill edge to
 * edge (Instagram/Facebook/WhatsApp Status, Snapchat), where a workout brag
 * actually gets shared. Revised from the original 1:1 square (DESIGN-SYSTEM §3,
 * §7): the square letterboxed on every Stories surface, and chat apps render a
 * portrait image just as happily, so a single tall format serves every channel
 * and drops the "which format" choice entirely.
 */
const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920
const MARGIN = 96
const CONTENT_WIDTH = CANVAS_WIDTH - 2 * MARGIN
const FALLBACK_FAMILY = 'system-ui, sans-serif'

const BARS_TOP = 1070
const BARS_HEIGHT = 300
const BARS_GAP = 14
const BAR_RADIUS = 10
/** Clearance between a bar's top and the from/to label floating above it. */
const BARS_LABEL_GAP = 18
/** A skipped period's tick: a short dash on the floor, as wide as this bar. */
const GAP_TICK_WIDTH_FRACTION = 0.45
const GAP_TICK_HEIGHT = 6

/**
 * Vertical anchors of the card's text blocks (canvas y coordinates), tuned as a
 * top-to-bottom poster with the hero delta as the largest element: brand,
 * kicker, name, delta, subline, journey, stat, footer.
 */
const KICKER_Y = 460
const NAME_Y = 552
const NAME_SIZE = 64
const NAME_LINE_HEIGHT = 74
const NAME_MAX_LINES = 2
const HEADLINE_Y = 840
const SUBLINE_Y = 968
const STAT_Y = 1450
/**
 * Conversion band — CTA hook, trust badge and link — pulled up into the
 * Stories-safe zone. A Story is where the image gets shared, yet Stories ignore
 * the link params in the share payload, so the *printed* link is the only funnel
 * a Story has; it must clear the reply bar that overlays the frame's lowest
 * ~250px. The brand + date sit below it as sacrificial chrome — fine to lose to
 * that overlay, and still shown when the image is saved or sent in chat.
 */
const CONVERT_DIVIDER_Y = 1535
const CONVERT_CTA_Y = 1592
const CONVERT_LINK_Y = 1648
const FOOTER_Y = 1824

/** The logo lockup top-left: mark, wordmark, accent dot. */
const BRAND_BASELINE = 200
const BRAND_SIZE = 52
/** Inter's cap height as a fraction of its font size — centres the mark on
 *  the wordmark's optical middle rather than sitting it on the baseline. */
const BRAND_CAP_RATIO = 0.72
/** The mark stands a touch proud of the wordmark, as it does in the headers. */
const BRAND_MARK_HEIGHT = 58
const BRAND_MARK_GAP = 18
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
  badge: string
  bars: readonly ShareBar[]
  barsDomain?: BarDomain
  barsFromLabel: string
  barsToLabel: string
  brand: string
  cta: string
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

/**
 * Word-wraps `text` into at most `maxLines` lines that each fit `maxWidth`. The
 * tall story frame has the vertical room a square did not, so a long exercise
 * name reads in full across two lines instead of being cut with an ellipsis;
 * only a name that still overruns the last line is clipped by {@link fitText}.
 */
const wrapLines = (
  context: CanvasContext,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const [index, word] of words.entries()) {
    const candidate = current === '' ? word : `${current} ${word}`
    if (current !== '' && context.measureText(candidate).width > maxWidth) {
      lines.push(current)
      if (lines.length === maxLines - 1) {
        lines.push(fitText(context, words.slice(index).join(' '), maxWidth))
        return lines
      }
      current = word
    } else {
      current = candidate
    }
  }
  if (current !== '') {
    lines.push(fitText(context, current, maxWidth))
  }
  return lines
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
  context.font = fontOf(family, 700, 60)
  context.fillText(value, x, y)
  context.fillStyle = withAlpha(tokens.dark.ink, 0.4)
  context.font = fontOf(family, 600, 24)
  context.fillText(label, x, y + 42)
}

/**
 * The bucketed journey under the headline: one column per period. The peak (the
 * all-time-best bucket) burns at full accent while the rest are dimmed — the
 * same bucket the on-screen chart stars, so the brightest bar is always the
 * tallest. Highlighting the newest instead would light a *shorter* bar whenever
 * a later period plateaus below an earlier peak, which reads as a broken chart;
 * today's number is already called out by the bold "to" label above the last
 * bar, so nothing is lost. A skipped period keeps its slot as a floor tick — the
 * same honesty the on-screen chart owes (decision 7), so a lapsed month never
 * silently shortens the story.
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
  const width = CONTENT_WIDTH
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

  // The bar to burn at full accent: the highest value, ties going to the later
  // period so a flat-at-the-top series still lights the newest bar.
  let peakIndex = -1
  for (const [index, bar] of bars.entries()) {
    if (
      !bar.isEmpty &&
      (peakIndex === -1 || bar.value >= bars[peakIndex].value)
    ) {
      peakIndex = index
    }
  }

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
    context.globalAlpha = index === peakIndex ? 1 : 0.5
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
    context.font = fontOf(family, 600, 26)
    context.fillText(
      card.barsFromLabel,
      left,
      floor - heightOf(first) - BARS_LABEL_GAP,
    )
  }
  const last = bars[lastIndex]
  context.textAlign = 'right'
  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 700, 32)
  context.fillText(
    card.barsToLabel,
    left + width,
    floor - (last.isEmpty ? 0 : heightOf(last)) - BARS_LABEL_GAP,
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

/**
 * The reason a stranger scrolling past acts: what the app is (the CTA hook, in
 * the product's own words), that it costs nothing (the green trust badge) and
 * where to get it (the link, the biggest reachable element). It sits in the
 * Stories-safe band so the one funnel a Story has survives the reply-bar
 * overlay. The hero brag above still dominates — this is a footer, not a pitch,
 * or the sharer would not post it.
 */
const drawCallToAction = (
  context: CanvasContext,
  family: string,
  card: ShareCard,
): void => {
  context.strokeStyle = withAlpha(tokens.dark.ink, 0.12)
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(MARGIN, CONVERT_DIVIDER_Y)
  context.lineTo(CANVAS_WIDTH - MARGIN, CONVERT_DIVIDER_Y)
  context.stroke()

  context.textAlign = 'left'
  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 700, 38)
  context.fillText(card.cta, MARGIN, CONVERT_CTA_Y)

  context.fillStyle = tokens.dark.green
  context.font = fontOf(family, 600, 28)
  context.fillText(card.badge, MARGIN, CONVERT_LINK_Y)

  context.textAlign = 'right'
  context.fillStyle = tokens.dark.accent
  context.font = fontOf(family, 700, 40)
  context.fillText(card.url, CANVAS_WIDTH - MARGIN, CONVERT_LINK_Y)
  context.textAlign = 'left'
}

/**
 * Brand line and date at the very bottom — sacrificial chrome. It carries no
 * funnel (the conversion band above owns that), so losing it to the Stories
 * reply-bar overlay costs nothing, while a saved or chat-shared image still gets
 * the tagline and the date's quiet "this is a real, recent result" signal.
 */
const drawBrandFooter = (
  context: CanvasContext,
  family: string,
  card: ShareCard,
): void => {
  context.fillStyle = withAlpha(tokens.dark.ink, 0.3)
  context.font = fontOf(family, 500, 24)
  context.textAlign = 'left'
  context.fillText(card.tagline, MARGIN, FOOTER_Y)
  context.textAlign = 'right'
  context.fillText(card.footer, CANVAS_WIDTH - MARGIN, FOOTER_Y)
  context.textAlign = 'left'
}

/**
 * Renders the shareable progress image on a 1080×1920 canvas. Canvas cannot
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
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
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
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  // One brand light, top-right, matching the OG card — a soft accent glow over
  // the upper third of the tall frame, fading out before the journey chart.
  const glow = context.createRadialGradient(
    CANVAS_WIDTH * 0.82,
    CANVAS_HEIGHT * 0.06,
    0,
    CANVAS_WIDTH * 0.82,
    CANVAS_HEIGHT * 0.06,
    CANVAS_WIDTH * 0.95,
  )
  glow.addColorStop(0, withAlpha(tokens.dark.accent, 0.2))
  glow.addColorStop(1, withAlpha(tokens.dark.accent, 0))
  context.fillStyle = glow
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  drawHeader(context, family, card)

  context.fillStyle = tokens.dark.accent
  context.font = fontOf(family, 600, 30)
  context.fillText(card.kicker.toUpperCase(), MARGIN, KICKER_Y)

  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 700, NAME_SIZE)
  const nameLines = wrapLines(context, card.name, CONTENT_WIDTH, NAME_MAX_LINES)
  for (const [index, nameLine] of nameLines.entries()) {
    context.fillText(nameLine, MARGIN, NAME_Y + index * NAME_LINE_HEIGHT)
  }

  context.font = fontOf(family, 800, 190)
  context.fillText(card.headline, MARGIN, HEADLINE_Y)
  context.fillStyle = withAlpha(tokens.dark.ink, 0.45)
  context.font = fontOf(family, 600, 46)
  context.fillText(card.subline, MARGIN, SUBLINE_Y)

  drawJourney(context, family, card)
  drawStat(context, family, MARGIN, STAT_Y, card.statValue, card.statLabel)
  drawCallToAction(context, family, card)
  drawBrandFooter(context, family, card)

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
