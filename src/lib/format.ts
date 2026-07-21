/**
 * The minimal formatter contract these helpers depend on — satisfied by the
 * next-intl formatter from `useFormatter()` (client) or `getFormatter()`
 * (server). Declared structurally so `lib/format` stays a pure, framework- and
 * React-free module that imports nothing; the caller injects the instance.
 */
export type Formatter = {
  // Method syntax (not arrow properties) so parameters stay bivariant: the
  // next-intl formatter's option types are narrower than the `Intl.*` ones,
  // and strict contravariance would otherwise reject a real `useFormatter()`.
  dateTime(value: Date | number, options?: Intl.DateTimeFormatOptions): string
  dateTimeRange(
    start: Date | number,
    end: Date | number,
    options?: Intl.DateTimeFormatOptions,
  ): string
  number(value: number, options?: Intl.NumberFormatOptions): string
}

/** Volume switches from kilograms to tonnes at and above this many kg. */
const TONNE_IN_KG = 1000

/**
 * Weight with its unit, locale-formatted, e.g. `16 kg`, `17,5 kg` (cs). Use
 * for a single working weight (per hand where the exercise is per-hand).
 */
export const formatKg = (format: Formatter, kg: number): string =>
  format.number(kg, {
    style: 'unit',
    unit: 'kilogram',
    unitDisplay: 'short',
    maximumFractionDigits: 2,
  })

/**
 * A signed weight change, e.g. `+4 kg`, `-2,5 kg`, `0 kg` (cs) — for a delta
 * chip where the leading sign is the whole point. Zero shows no sign. Pair
 * with `tabular-nums` so the digits stay put while a count-up animates them.
 */
export const formatKgDelta = (format: Formatter, kg: number): string =>
  format.number(kg, {
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
    style: 'unit',
    unit: 'kilogram',
    unitDisplay: 'short',
  })

/**
 * Training volume; rolls over to tonnes from 1000 kg, e.g. `840 kg`,
 * `5,4 t` (cs). The `t` symbol is appended literally — `tonne` is not an
 * Intl-sanctioned unit — while the number itself is still locale-formatted.
 */
export const formatVolume = (format: Formatter, kg: number): string =>
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
export const formatDuration = (format: Formatter, seconds: number): string => {
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
export const formatShortDate = (
  format: Formatter,
  date: Date | number,
): string =>
  format.dateTime(typeof date === 'number' ? new Date(date) : date, {
    day: 'numeric',
    month: 'numeric',
  })

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600

const pad = (value: number): string => String(value).padStart(2, '0')

/**
 * A digital clock for the elapsed-time and rest displays: `m:ss`, growing to
 * `h:mm:ss` only past an hour. Locale-independent (the digits are the same in
 * every language) and Intl-free, so unlike the helpers above it takes no
 * `Formatter`. Pair with a `tabular-nums` class so the digits never shift
 * width as they tick (BUILD-GUIDE §4).
 */
export const formatClock = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / SECONDS_PER_HOUR)
  const minutes = Math.floor((safe % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const seconds = safe % SECONDS_PER_MINUTE
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${minutes}:${pad(seconds)}`
}
