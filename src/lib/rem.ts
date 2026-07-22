/** Root font size the design tokens are authored against (browser default). */
const ROOT_FONT_SIZE_PX = 16

/**
 * Decimal places kept in the emitted value. Four is sub-pixel at any root size
 * (0.0001rem ≈ 0.0016px) and trims the binary-fraction noise a raw division
 * leaves behind — `58.08 / 16` would otherwise print `3.6300000000000003rem`.
 */
const REM_PRECISION = 4

/**
 * Converts a measurement written in design pixels into a `rem` length, so it
 * grows with the reader's text size instead of pinning itself to the browser's
 * default. Only inline styles need this — every Tailwind spacing and type
 * utility is already rem.
 *
 * Geometry that carries text must scale with it: a chart column frozen at
 * 42px while its labels double at a 200% font size ends up with the labels
 * overlapping each other, which WCAG 1.4.4 counts as lost content. Ratios
 * between values written this way stay invariant, so any arithmetic done in
 * design pixels before the conversion holds at every text size.
 */
export const rem = (px: number): string =>
  `${Number((px / ROOT_FONT_SIZE_PX).toFixed(REM_PRECISION))}rem`
