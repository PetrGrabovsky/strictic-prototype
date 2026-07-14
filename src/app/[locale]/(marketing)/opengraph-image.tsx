import { ImageResponse } from 'next/og'
import messages from '@/messages/cs.json'
import { tokens } from '@/styles/tokens'

/**
 * Generated 1200×630 OpenGraph/Twitter card. Built with `next/og` so no
 * binary asset ships in the repo; Next wires the result into `og:image`
 * and `twitter:image` for this route automatically. The type is set in
 * Inter — the same face `next/font` serves the site — pulled from Google
 * Fonts and cached (see {@link loadInterSubset}). Replace with a designed
 * screenshot before launch (docs/reference/strictic-monetization-model.md
 * §6) if richer art is wanted.
 */
export const alt = messages.landing.meta.ogImageAlt
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const colors = tokens.dark

/** Card copy. Kept as constants so the visible text and the font subset
 *  fetched for it can never drift apart. */
const KICKER = 'Domácí silový trénink'
const WORDMARK = 'Strictic'
const SLOGAN = messages.landing.hero.slogan
const URL_LABEL = 'strictic.com'
const BADGE = 'Zdarma · bez reklam · offline'

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

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: -4,
          }}
        >
          {WORDMARK}
          <span style={{ color: colors.accent }}>.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 44, color: colors.ink2 }}>
          {SLOGAN}
        </div>
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
