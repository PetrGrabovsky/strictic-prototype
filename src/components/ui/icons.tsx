import type { ReactNode } from 'react'

type Props = {
  size?: number
}

type GlyphProps = {
  children: ReactNode
  size: number
}

const DEFAULT_SIZE = 18

/**
 * The one line-icon frame for the whole app: a 24-grid stroke SVG that
 * inherits `currentColor` and is decorative (`aria-hidden`) by default — the
 * surrounding control carries the accessible label. Every line icon below is
 * just a path set inside this frame, so stroke width, caps and joins stay
 * identical everywhere and no feature re-rolls its own SVG boilerplate. Brand
 * marks that can't inherit a single colour (Google, Apple) stay separate.
 */
const Glyph = ({ children, size }: GlyphProps) => (
  <svg
    aria-hidden
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    width={size}
  >
    {children}
  </svg>
)

export const ChevronLeftIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="m15 18-6-6 6-6" />
  </Glyph>
)

export const ChevronRightIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="m9 18 6-6-6-6" />
  </Glyph>
)

export const ArrowRightIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Glyph>
)

export const CheckIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M20 6 9 17l-5-5" />
  </Glyph>
)

export const CloseIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Glyph>
)

export const PlayIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M6 4v16l14-8z" />
  </Glyph>
)

export const SkipForwardIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M5 4v16l10-8zM19 5v14" />
  </Glyph>
)

export const UndoIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M9 14 4 9l5-5M4 9h11a4 4 0 0 1 0 8h-1" />
  </Glyph>
)

export const FeatherIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8 2 22M17.5 15H9" />
  </Glyph>
)

export const VolumeOnIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M11 5 6 9H2v6h4l5 4zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </Glyph>
)

export const VolumeOffIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" />
  </Glyph>
)

export const ShareIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
  </Glyph>
)

export const TrendingUpIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M22 7 13.5 15.5l-5-5L2 17M16 7h6v6" />
  </Glyph>
)

export const HomeIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Glyph>
)

export const DumbbellIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M6 8v8M3.5 9.5v5M18 8v8M20.5 9.5v5M6 12h12" />
  </Glyph>
)
