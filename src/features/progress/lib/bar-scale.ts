/** Fraction of the chart height the smallest value still reaches. */
const BASE_FRACTION = 0.3
/** The remaining headroom the min→max range is spread across. */
const SPAN_FRACTION = 0.7
/** A lone bar sits mid-height — there is no min/max to scale it against. */
const SINGLE_FRACTION = 0.62

/** The min/max a series' scale anchors to, shared across its every view. */
export type BarDomain = {
  max: number
  min: number
}

/**
 * Builds the value → height-fraction scale shared by the on-screen bar chart
 * (`BigChart`) and the canvas share card, so the app and the exported image
 * always draw identical proportions. Values normalise between a visible base
 * and full height; a flat series renders every bar at the base. An explicit
 * `domain` pins the scale to a fixed range instead of the visible values —
 * one domain per series keeps overview, detail and share card comparable.
 * Callers guard against an empty series before scaling.
 */
export const createBarScale = (
  values: readonly number[],
  domain?: BarDomain,
) => {
  const minimum = domain?.min ?? Math.min(...values)
  const span = (domain?.max ?? Math.max(...values)) - minimum || 1
  return (value: number): number =>
    values.length === 1 && domain === undefined
      ? SINGLE_FRACTION
      : BASE_FRACTION + SPAN_FRACTION * ((value - minimum) / span)
}

/**
 * The extremes of one series, computed once at session level so every view
 * of that series (overview buckets, drill-down detail, share canvas) draws
 * to the same scale. Callers guard against an empty series.
 */
export const domainOf = (values: readonly number[]): BarDomain => ({
  max: Math.max(...values),
  min: Math.min(...values),
})
