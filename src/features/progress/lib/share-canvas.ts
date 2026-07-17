import { tokens } from '@/styles/tokens'

/** The share image is a fixed 1080×1080 square (DESIGN-SYSTEM §3, §7). */
const CANVAS_SIZE = 1080
const MARGIN = 92
const FALLBACK_FAMILY = 'system-ui, sans-serif'

const SPARK_TOP = 648
const SPARK_HEIGHT = 190
const SPARK_GAP = 12
const SPARK_MAX_POINTS = 14
const BAR_RADIUS = 8
const SPARK_BASE_FRACTION = 0.3
const SPARK_SPAN_FRACTION = 0.7
const SPARK_SINGLE_FRACTION = 0.62

type Ctx = CanvasRenderingContext2D

/**
 * Everything drawn onto the share card. All copy is passed in already
 * localized and formatted — the drawing code holds no strings of its own, so
 * it stays i18n-free (CLAUDE.md) and the caller owns every translatable word.
 */
export type ShareCard = {
  brand: string
  foot: string
  headline: string
  kicker: string
  name: string
  spark: readonly number[]
  sparkFromLabel: string
  sparkToLabel: string
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
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const fontOf = (family: string, weight: number, size: number): string =>
  `${weight} ${size}px ${family}`

/** Truncate to fit `maxWidth`, appending an ellipsis when it had to cut. */
const fitText = (ctx: Ctx, text: string, maxWidth: number): string => {
  if (ctx.measureText(text).width <= maxWidth) {
    return text
  }
  let clipped = text
  while (
    clipped.length > 4 &&
    ctx.measureText(`${clipped}…`).width > maxWidth
  ) {
    clipped = clipped.slice(0, -1)
  }
  return `${clipped}…`
}

const drawStat = (
  ctx: Ctx,
  family: string,
  x: number,
  y: number,
  value: string,
  label: string,
): void => {
  ctx.textAlign = 'left'
  ctx.fillStyle = tokens.dark.ink
  ctx.font = fontOf(family, 700, 52)
  ctx.fillText(value, x, y)
  ctx.fillStyle = withAlpha(tokens.dark.ink, 0.4)
  ctx.font = fontOf(family, 600, 22)
  ctx.fillText(label, x, y + 34)
}

/** The mini bar chart under the headline, newest bar at full strength. */
const drawSpark = (ctx: Ctx, family: string, card: ShareCard): void => {
  const points = card.spark.slice(-SPARK_MAX_POINTS)
  if (points.length === 0) {
    return
  }
  const left = MARGIN
  const width = CANVAS_SIZE - 2 * MARGIN
  const floor = SPARK_TOP + SPARK_HEIGHT
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const lastIndex = points.length - 1

  ctx.strokeStyle = withAlpha(tokens.dark.ink, 0.1)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(left, floor)
  ctx.lineTo(left + width, floor)
  ctx.stroke()

  const barWidth = (width - SPARK_GAP * lastIndex) / points.length
  const fractionOf = (value: number): number =>
    points.length === 1
      ? SPARK_SINGLE_FRACTION
      : SPARK_BASE_FRACTION + SPARK_SPAN_FRACTION * ((value - min) / range)

  for (const [index, value] of points.entries()) {
    const barHeight = fractionOf(value) * SPARK_HEIGHT
    const x = left + index * (barWidth + SPARK_GAP)
    ctx.globalAlpha = index === lastIndex ? 1 : 0.5
    ctx.fillStyle = tokens.dark.accent
    ctx.beginPath()
    ctx.roundRect(x, floor - barHeight, barWidth, barHeight, [
      BAR_RADIUS,
      BAR_RADIUS,
      0,
      0,
    ])
    ctx.fill()
  }
  ctx.globalAlpha = 1

  if (points.length > 1) {
    const firstBar = fractionOf(points[0]) * SPARK_HEIGHT
    ctx.textAlign = 'left'
    ctx.fillStyle = withAlpha(tokens.dark.ink, 0.5)
    ctx.font = fontOf(family, 600, 24)
    ctx.fillText(card.sparkFromLabel, left, floor - firstBar - 16)
  }
  const lastBar = fractionOf(points[lastIndex]) * SPARK_HEIGHT
  ctx.textAlign = 'right'
  ctx.fillStyle = tokens.dark.ink
  ctx.font = fontOf(family, 700, 27)
  ctx.fillText(card.sparkToLabel, left + width, floor - lastBar - 16)
  ctx.textAlign = 'left'
}

const drawHeader = (ctx: Ctx, family: string, card: ShareCard): void => {
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = tokens.dark.ink
  ctx.font = fontOf(family, 700, 46)
  ctx.fillText(card.brand, MARGIN, MARGIN + 40)
  const brandWidth = ctx.measureText(card.brand).width
  ctx.fillStyle = tokens.dark.accent
  ctx.beginPath()
  ctx.arc(MARGIN + brandWidth + 20, MARGIN + 22, 7, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = 'right'
  ctx.fillStyle = withAlpha(tokens.dark.ink, 0.45)
  ctx.font = fontOf(family, 600, 23)
  ctx.fillText(card.kicker.toUpperCase(), CANVAS_SIZE - MARGIN, MARGIN + 34)
  ctx.textAlign = 'left'
}

const drawFooter = (ctx: Ctx, family: string, card: ShareCard): void => {
  const line = CANVAS_SIZE - 150
  ctx.strokeStyle = withAlpha(tokens.dark.ink, 0.12)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGIN, line)
  ctx.lineTo(CANVAS_SIZE - MARGIN, line)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = withAlpha(tokens.dark.ink, 0.8)
  ctx.font = fontOf(family, 600, 27)
  ctx.fillText(card.tagline, MARGIN, line + 46)
  ctx.fillStyle = withAlpha(tokens.dark.ink, 0.32)
  ctx.font = fontOf(family, 500, 22)
  ctx.fillText(card.foot, MARGIN, line + 80)

  ctx.textAlign = 'right'
  ctx.fillStyle = tokens.dark.accent
  ctx.font = fontOf(family, 700, 30)
  ctx.fillText(card.url, CANVAS_SIZE - MARGIN, line + 60)
  ctx.textAlign = 'left'
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
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    return null
  }
  try {
    await document.fonts.ready
  } catch {
    // Fonts may be unavailable in some environments; paint with the fallback.
  }
  const family = getComputedStyle(document.body).fontFamily || FALLBACK_FAMILY

  ctx.fillStyle = tokens.dark.bg
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  const glow = ctx.createRadialGradient(
    CANVAS_SIZE * 0.84,
    CANVAS_SIZE * 0.12,
    0,
    CANVAS_SIZE * 0.84,
    CANVAS_SIZE * 0.12,
    CANVAS_SIZE * 0.92,
  )
  glow.addColorStop(0, withAlpha(tokens.dark.accent, 0.2))
  glow.addColorStop(1, withAlpha(tokens.dark.accent, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  drawHeader(ctx, family, card)

  ctx.fillStyle = tokens.dark.accent
  ctx.font = fontOf(family, 600, 26)
  ctx.fillText(card.kicker.toUpperCase(), MARGIN, 300)

  ctx.fillStyle = tokens.dark.ink
  ctx.font = fontOf(family, 700, 60)
  ctx.fillText(fitText(ctx, card.name, CANVAS_SIZE - 2 * MARGIN), MARGIN, 384)

  ctx.font = fontOf(family, 800, 150)
  ctx.fillText(card.headline, MARGIN, 540)
  ctx.fillStyle = withAlpha(tokens.dark.ink, 0.45)
  ctx.font = fontOf(family, 600, 40)
  ctx.fillText(card.subline, MARGIN, 600)

  drawSpark(ctx, family, card)
  drawStat(ctx, family, MARGIN, 905, card.statValue, card.statLabel)
  drawFooter(ctx, family, card)

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
    canvas.toBlob((result) => resolve(result), 'image/png', 0.95)
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
