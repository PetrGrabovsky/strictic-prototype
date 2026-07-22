/**
 * The Strictic mark as raw SVG geometry, kept in one place so every surface —
 * the app `Logo` component, the `next/og` OpenGraph card, the share image's
 * canvas — renders the identical glyph. Neither `next/og` (Satori, which can't
 * read the Tailwind `className` the component styles with) nor a `<canvas>`
 * can reuse the component itself, so they share this data instead: SVG for the
 * first two, `Path2D` for the canvas.
 */

/** Intrinsic dimensions the paths are authored in, in user units. */
export const LOGO_MARK_VIEWBOX_WIDTH = 1116
export const LOGO_MARK_VIEWBOX_HEIGHT = 1500

/** `viewBox` string for inline SVG (`Logo`, OG card). */
export const LOGO_MARK_VIEWBOX = `0 0 ${LOGO_MARK_VIEWBOX_WIDTH} ${LOGO_MARK_VIEWBOX_HEIGHT}`

/**
 * Width : height ratio of the mark's viewBox. A rendered width is always
 * derived from the height, so the glyph fills its box edge-to-edge instead of
 * letterboxing inside mismatched dimensions.
 */
export const LOGO_MARK_ASPECT_RATIO =
  LOGO_MARK_VIEWBOX_WIDTH / LOGO_MARK_VIEWBOX_HEIGHT

/** The three filled sub-paths of the mark, in paint order. */
export const LOGO_MARK_PATHS = [
  'M0 738.156V1059.89L663.321 1442.86V1121.13L0 738.156Z',
  'M352.97 0L0 203.781V631.843L762.289 1071.95V1500L1115.26 1296.22V868.168L352.97 428.051V0Z',
  'M451.938 57.1396V378.878L1115.26 761.847V440.108L451.938 57.1396Z',
] as const
