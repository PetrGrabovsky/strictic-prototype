const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600

const pad = (value: number): string => String(value).padStart(2, '0')

/**
 * A digital clock for the elapsed-time and rest displays: `m:ss`, growing to
 * `h:mm:ss` only past an hour. Paired with a `tabular-nums` class so the digits
 * never shift width as they tick (BUILD-GUIDE §4).
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
