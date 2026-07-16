import type { ReactNode } from 'react'

type Props = {
  size?: number
}

type GlyphProps = {
  children: ReactNode
  size: number
}

const DEFAULT_SIZE = 18

/** Shared line-icon frame: inherits `currentColor`, decorative by default. */
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

export const CheckIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M20 6 9 17l-5-5" />
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
