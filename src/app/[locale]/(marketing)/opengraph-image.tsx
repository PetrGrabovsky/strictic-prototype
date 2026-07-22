import { ImageResponse } from 'next/og'
import {
  LOGO_MARK_ASPECT_RATIO,
  LOGO_MARK_PATHS,
  LOGO_MARK_VIEWBOX,
} from '@/components/ui/logo-mark'
import { BRAND_WORDMARK } from '@/lib/brand'
import messages from '@/messages/cs.json'
import { tokens } from '@/styles/tokens'

/**
 * Generated 1200×630 OpenGraph/Twitter card. Built with `next/og` so no
 * binary asset ships in the repo; Next wires the result into `og:image`
 * and `twitter:image` for this route automatically. The type is set in
 * Inter — the same face `next/font` serves the site — pulled from Google
 * Fonts and cached (see {@link loadInterSubset}).
 *
 * The right half draws the product's signature: the journey chart. It
 * echoes the on-screen and shared canvas (rising accent bars on a floor
 * line, older periods dimmed so the eye lands on the newest), so a shared
 * link unfurls as visible progress rather than a bare wordmark. The bars
 * are an illustrative climb, not anyone's data — this is the marketing
 * route, which carries no user history.
 */
export const alt = messages.landing.meta.ogImageAlt
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const colors = tokens.dark

/** Card copy. Kept as constants so the visible text and the font subset
 *  fetched for it can never drift apart. The wordmark is the shared lowercase
 *  logo lockup ({@link BRAND_WORDMARK}), not a capitalised heading, so the card
 *  reads as the same brand mark the app and marketing headers show. */
const KICKER = 'Domácí silový trénink'
const WORDMARK = BRAND_WORDMARK
const SLOGAN = messages.landing.hero.slogan
const URL_LABEL = 'strictic.com'
const BADGE = 'Zdarma · bez reklam · offline'

/** Hero logo lockup: the mark leads and stands a touch proud of the wordmark,
 *  echoing the header lockup. Reproduced here rather than sharing the `Logo`
 *  component because Satori can't apply its Tailwind classes — only the mark's
 *  geometry is shared (see `logo-mark.ts`). */
const WORDMARK_SIZE = 104
const MARK_HEIGHT = 112
const LOCKUP_GAP = 28

/**
 * The illustrative journey, one entry per period. `height` is a fraction of
 * the tallest bar; a mostly-rising climb with small dips reads as real
 * training rather than a straight ramp, and the last is `1` so the newest
 * period is the peak. Each carries a stable `key` so the render never keys a
 * bar on its array index (`react/no-array-index-key`).
 */
const JOURNEY: readonly { height: number; key: string }[] = [
  { height: 0.28, key: 'p01' },
  { height: 0.33, key: 'p02' },
  { height: 0.31, key: 'p03' },
  { height: 0.39, key: 'p04' },
  { height: 0.45, key: 'p05' },
  { height: 0.43, key: 'p06' },
  { height: 0.52, key: 'p07' },
  { height: 0.6, key: 'p08' },
  { height: 0.58, key: 'p09' },
  { height: 0.7, key: 'p10' },
  { height: 0.82, key: 'p11' },
  { height: 1, key: 'p12' },
]
const BAR_WIDTH = 22
const BAR_GAP = 10
const BAR_MAX_HEIGHT = 210
const BAR_RADIUS = 6
/** Older periods recede to half strength; the newest bar stays full accent
 *  — the same emphasis the share canvas and the on-screen chart use. */
const DIMMED_BAR_OPACITY = 0.5

const GOOGLE_FONTS_API = 'https://fonts.googleapis.com/css2'

/**
 * Fetches one Inter weight from Google Fonts as raw TTF bytes for Satori
 * (`next/og` can't read the browser `next/font` face server-side). The
 * `text` param returns a subset covering exactly the glyphs the card
 * renders — including Czech diacritics — and `force-cache` collapses the
 * two hops to a one-time download rather than per request.
 */
const loadInterSubset = async (weight: number, text: string) => {
  const family = `Inter:wght@${weight}`
  const cssUrl =
    `${GOOGLE_FONTS_API}?family=${encodeURIComponent(family)}` +
    `&text=${encodeURIComponent(text)}`
  const cssResponse = await fetch(cssUrl, { cache: 'force-cache' })
  const css = await cssResponse.text()

  const fontUrl = css.match(/src:\s*url\((https:\/\/[^)]+)\)/u)?.[1]
  if (!fontUrl) {
    throw new Error(`Inter ${weight}: no font URL in Google Fonts response`)
  }

  const fontResponse = await fetch(fontUrl, { cache: 'force-cache' })
  return fontResponse.arrayBuffer()
}

/** The rising bar chart on the card's right, grounded on a floor line. */
const Journey = () => {
  const lastIndex = JOURNEY.length - 1
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: BAR_GAP,
        height: BAR_MAX_HEIGHT,
        borderBottom: `2px solid ${colors.line}`,
      }}
    >
      {JOURNEY.map((bar, index) => (
        <div
          key={bar.key}
          style={{
            display: 'flex',
            width: BAR_WIDTH,
            height: bar.height * BAR_MAX_HEIGHT,
            backgroundColor: colors.accent,
            opacity: index === lastIndex ? 1 : DIMMED_BAR_OPACITY,
            borderTopLeftRadius: BAR_RADIUS,
            borderTopRightRadius: BAR_RADIUS,
          }}
        />
      ))}
    </div>
  )
}

const OpengraphImage = async () => {
  const [regular, bold, extraBold] = await Promise.all([
    loadInterSubset(400, `${SLOGAN}${URL_LABEL}${BADGE}`),
    loadInterSubset(700, KICKER),
    loadInterSubset(800, `${WORDMARK}.`),
  ])

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: colors.bg,
        // Accent glow top-right, at the same 20% strength (`33` = 0.2 alpha)
        // the share canvas uses, so both surfaces carry one brand light.
        backgroundImage: `radial-gradient(circle at 84% 12%, ${colors.accent}33, ${colors.accent}00 55%)`,
        color: colors.ink,
        padding: 80,
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: 'uppercase',
          color: colors.accent,
        }}
      >
        {KICKER}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 48,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: LOCKUP_GAP,
            }}
          >
            <svg
              fill={colors.ink}
              height={MARK_HEIGHT}
              viewBox={LOGO_MARK_VIEWBOX}
              width={MARK_HEIGHT * LOGO_MARK_ASPECT_RATIO}
            >
              {LOGO_MARK_PATHS.map((path) => (
                <path d={path} key={path} />
              ))}
            </svg>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                fontSize: WORDMARK_SIZE,
                fontWeight: 800,
                letterSpacing: -4,
              }}
            >
              {WORDMARK}
              <span style={{ color: colors.accent }}>.</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 44, color: colors.ink2 }}>
            {SLOGAN}
          </div>
        </div>

        <Journey />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 28,
          color: colors.ink2,
        }}
      >
        <span>{URL_LABEL}</span>
        <span style={{ color: colors.green }}>{BADGE}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
        { name: 'Inter', data: extraBold, weight: 800, style: 'normal' },
      ],
    },
  )
}

export default OpengraphImage
