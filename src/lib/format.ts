/**
 * The minimal formatter contract these helpers depend on — satisfied by the
 * next-intl formatter from `useFormatter()` (client) or `getFormatter()`
 * (server). Declared structurally so `lib/format` stays a pure, framework- and
 * React-free module that imports nothing; the caller injects the instance.
 */
export type Formatter = {
  dateTime: (
    value: Date | number,
    options?: Intl.DateTimeFormatOptions,
  ) => string
  number: (value: number, options?: Intl.NumberFormatOptions) => string
}

/** Volume switches from kilograms to tonnes at and above this many kg. */
const TONNE_IN_KG = 1000

/**
 * Weight with its unit, locale-formatted, e.g. `16 kg`, `17,5 kg` (cs). Use
 * for a single working weight (per hand where the exercise is per-hand).
 */
export const fmtKg = (format: Formatter, kg: number): string =>
  format.number(kg, {
    style: 'unit',
    unit: 'kilogram',
    unitDisplay: 'short',
    maximumFractionDigits: 2,
  })

/**
 * Training volume; rolls over to tonnes from 1000 kg, e.g. `840 kg`,
 * `5,4 t` (cs). The `t` symbol is appended literally — `tonne` is not an
 * Intl-sanctioned unit — while the number itself is still locale-formatted.
 */
export const fmtVol = (format: Formatter, kg: number): string =>
  kg >= TONNE_IN_KG
    ? `${format.number(kg / TONNE_IN_KG, { maximumFractionDigits: 1 })} t`
    : format.number(kg, {
        style: 'unit',
        unit: 'kilogram',
        unitDisplay: 'short',
        maximumFractionDigits: 0,
      })

/**
 * Workout length from seconds, e.g. `1 h 34 min`, `45 min`, `< 1 min` (cs).
 * Hours and minutes use Intl unit formatting so the labels localize too.
 */
export const fmtDur = (format: Formatter, seconds: number): string => {
  const totalMinutes = Math.max(0, Math.round(seconds / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const hourPart = format.number(hours, {
    style: 'unit',
    unit: 'hour',
    unitDisplay: 'short',
  })
  const minutePart = format.number(minutes, {
    style: 'unit',
    unit: 'minute',
    unitDisplay: 'short',
  })
  if (hours > 0) {
    return minutes > 0 ? `${hourPart} ${minutePart}` : hourPart
  }
  if (totalMinutes > 0) {
    return minutePart
  }
  return `< ${format.number(1, { style: 'unit', unit: 'minute', unitDisplay: 'short' })}`
}

/** Short day-and-month date, e.g. `14. 7.` (cs). Accepts ms or a `Date`. */
export const fmtDateShort = (format: Formatter, date: Date | number): string =>
  format.dateTime(typeof date === 'number' ? new Date(date) : date, {
    day: 'numeric',
    month: 'numeric',
  })
