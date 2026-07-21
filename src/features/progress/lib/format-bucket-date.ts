import type {
  BucketGranularity,
  SeriesBucket,
} from '@/features/progress/lib/bucket-series'
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

/**
 * Names the whole period a bucket covers, for the drill-down header and the
 * bars' accessible names: `červenec 2026`, `13. 7. – 19. 7.`, `čvc – zář
 * 2026`. Ranges go through `Intl.DateTimeFormat.formatRange` (next-intl's
 * `dateTimeRange`), which collapses the parts both ends share instead of
 * printing them twice. A session bucket has no span, so it names its day.
 */
export const formatBucketPeriod = (
  format: Formatter,
  bucket: Pick<SeriesBucket, 'endMs' | 'startMs'>,
  granularity: BucketGranularity,
): string => {
  if (granularity === 'month') {
    return format.dateTime(new Date(bucket.startMs), {
      month: 'long',
      year: 'numeric',
    })
  }
  if (granularity === 'session') {
    return formatShortDate(format, bucket.startMs)
  }
  const start = new Date(bucket.startMs)
  // `endMs` is exclusive, `formatRange` inclusive: a week ending Monday 00:00
  // would otherwise read as eight days.
  const end = new Date(bucket.endMs - 1)
  return granularity === 'quarter'
    ? format.dateTimeRange(start, end, { month: 'short', year: 'numeric' })
    : format.dateTimeRange(start, end, { day: 'numeric', month: 'numeric' })
}
