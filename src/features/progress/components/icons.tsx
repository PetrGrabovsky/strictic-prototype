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

export const ArrowRightIcon = ({ size = DEFAULT_SIZE }: Props) => (
  <Glyph size={size}>
    <path d="M5 12h14M13 6l6 6-6 6" />
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
