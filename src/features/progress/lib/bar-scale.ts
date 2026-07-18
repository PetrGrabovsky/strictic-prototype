/** Fraction of the chart height the smallest value still reaches. */
const BASE_FRACTION = 0.3
/** The remaining headroom the min→max range is spread across. */
const SPAN_FRACTION = 0.7
/** A lone bar sits mid-height — there is no min/max to scale it against. */
const SINGLE_FRACTION = 0.62

/**
 * Builds the value → height-fraction scale shared by the on-screen bar chart
 * (`BigChart`) and the canvas share card, so the app and the exported image
 * always draw identical proportions. Values normalise between a visible base
 * and full height; a flat series renders every bar at the base. Callers guard
 * against an empty series before scaling.
 */
export const createBarScale = (values: readonly number[]) => {
  const minimum = Math.min(...values)
  const span = Math.max(...values) - minimum || 1
  return (value: number): number =>
    values.length === 1
      ? SINGLE_FRACTION
      : BASE_FRACTION + SPAN_FRACTION * ((value - minimum) / span)
}
