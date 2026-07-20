import type { BucketGranularity } from '@/features/progress/lib/bucket-series'
import { formatShortDate } from '@/lib/format'
import type { Formatter } from '@/lib/format'

/**
 * Formats one endpoint of a bucketed journey's from–to caption at the chart's
 * own resolution: a month journey names the month (`čvc`), a session or week
 * journey keeps the day (`14. 7.`), and a quarter journey — which only ever
 * spans multiple calendar years — carries the year too (`čvc 26`) so the span
 * cannot read as a few months. Locale formatting is delegated to the injected
 * {@link Formatter}, so this stays a pure, framework-free helper.
 */
export const formatBucketDate = (
  format: Formatter,
  date: number,
  granularity: BucketGranularity,
): string => {
  if (granularity === 'quarter') {
    return format.dateTime(new Date(date), { month: 'short', year: '2-digit' })
  }
  if (granularity === 'month') {
    return format.dateTime(new Date(date), { month: 'short' })
  }
  return formatShortDate(format, date)
}
