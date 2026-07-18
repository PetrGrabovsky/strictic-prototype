import { createBarScale } from '@/features/progress/lib/bar-scale'
import { tokens } from '@/styles/tokens'

/** The share image is a fixed 1080×1080 square (DESIGN-SYSTEM §3, §7). */
const CANVAS_SIZE = 1080
const MARGIN = 92
const FALLBACK_FAMILY = 'system-ui, sans-serif'

const SPARKLINE_TOP = 648
const SPARKLINE_HEIGHT = 190
const SPARKLINE_GAP = 12
const SPARKLINE_MAX_POINTS = 14
const BAR_RADIUS = 8

/** Vertical anchors of the card's text blocks (canvas y coordinates). */
const KICKER_Y = 300
const NAME_Y = 384
const HEADLINE_Y = 540
const SUBLINE_Y = 600
const STAT_Y = 905

type CanvasContext = CanvasRenderingContext2D

/**
 * Everything drawn onto the share card. All copy is passed in already
 * localized and formatted — the drawing code holds no strings of its own, so
 * it stays i18n-free (CLAUDE.md) and the caller owns every translatable word.
 */
export type ShareCard = {
  brand: string
  footer: string
  headline: string
  kicker: string
  name: string
  sparkline: readonly number[]
  sparklineFromLabel: string
  sparklineToLabel: string
  statLabel: string
  statValue: string
  subline: string
  tagline: string
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

/** The mini bar chart under the headline, newest bar at full strength. */
const drawSparkline = (
  context: CanvasContext,
  family: string,
  card: ShareCard,
): void => {
  const points = card.sparkline.slice(-SPARKLINE_MAX_POINTS)
  if (points.length === 0) {
    return
  }
  const left = MARGIN
  const width = CANVAS_SIZE - 2 * MARGIN
  const floor = SPARKLINE_TOP + SPARKLINE_HEIGHT
  const lastIndex = points.length - 1

  context.strokeStyle = withAlpha(tokens.dark.ink, 0.1)
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(left, floor)
  context.lineTo(left + width, floor)
  context.stroke()

  const barWidth = (width - SPARKLINE_GAP * lastIndex) / points.length
  const fractionOf = createBarScale(points)

  for (const [index, value] of points.entries()) {
    const barHeight = fractionOf(value) * SPARKLINE_HEIGHT
    const x = left + index * (barWidth + SPARKLINE_GAP)
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

  if (points.length > 1) {
    const firstBar = fractionOf(points[0]) * SPARKLINE_HEIGHT
    context.textAlign = 'left'
    context.fillStyle = withAlpha(tokens.dark.ink, 0.5)
    context.font = fontOf(family, 600, 24)
    context.fillText(card.sparklineFromLabel, left, floor - firstBar - 16)
  }
  const lastBar = fractionOf(points[lastIndex]) * SPARKLINE_HEIGHT
  context.textAlign = 'right'
  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 700, 27)
  context.fillText(card.sparklineToLabel, left + width, floor - lastBar - 16)
  context.textAlign = 'left'
}

const drawHeader = (
  context: CanvasContext,
  family: string,
  card: ShareCard,
): void => {
  context.textBaseline = 'alphabetic'
  context.textAlign = 'left'
  context.fillStyle = tokens.dark.ink
  context.font = fontOf(family, 700, 46)
  context.fillText(card.brand, MARGIN, MARGIN + 40)
  const brandWidth = context.measureText(card.brand).width
  context.fillStyle = tokens.dark.accent
  context.beginPath()
  context.arc(MARGIN + brandWidth + 20, MARGIN + 22, 7, 0, Math.PI * 2)
  context.fill()

  context.textAlign = 'right'
  context.fillStyle = withAlpha(tokens.dark.ink, 0.45)
  context.font = fontOf(family, 600, 23)
  context.fillText(card.kicker.toUpperCase(), CANVAS_SIZE - MARGIN, MARGIN + 34)
  context.textAlign = 'left'
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

  drawSparkline(context, family, card)
  drawStat(context, family, MARGIN, STAT_Y, card.statValue, card.statLabel)
  drawFooter(context, family, card)

  return canvas
}

/**
 * Turns the rendered canvas into a PNG and hands it off: the native share
 * sheet when the platform can share files (mobile), otherwise a download.
 * A cancelled share sheet counts as handled, not a failure.
 */
export const deliverShareImage = async (
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<ShareOutcome> => {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
  if (blob === null) {
    return 'failed'
  }
  const file = new File([blob], filename, { type: 'image/png' })
  const canShareFile =
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  if (canShareFile) {
    try {
      await navigator.share({ files: [file] })
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
