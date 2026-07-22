import type {
  SeriesBucket,
  SeriesPoint,
} from '@/features/progress/lib/bucket-series'

/** One session inside a drilled bucket, ready for the detail chart. */
export type DrillSession = {
  /** When it was logged (ms) — the detail chart's x axis names the day. */
  date: number
  /** The all-time best session of the whole series — the chart's single ★. */
  isPr: boolean
  /** Stable render key: the session date in ms. */
  key: string
  value: number
}

/** One bucket opened up: its own sessions, plus where `‹ ›` lead from here. */
export type BucketDrillDown = {
  /** Exclusive period end (ms), for naming the period the sessions sit in. */
  endMs: number
  /** Newer neighbour that holds sessions, or null at the newest end. */
  nextKey: null | string
  /** Older neighbour that holds sessions, or null at the oldest end. */
  previousKey: null | string
  sessions: readonly DrillSession[]
  /** Inclusive period start (ms). */
  startMs: number
}

/**
 * The nearest neighbour in `step`'s direction that holds sessions. Empty
 * periods are skipped rather than stepped into: the overview already shows the
 * gap honestly (decision 7), and paging into a blank chart is a dead end.
 */
const neighbourKey = (
  buckets: readonly SeriesBucket[],
  from: number,
  step: -1 | 1,
): null | string => {
  const ahead =
    step === 1 ? buckets.slice(from + 1) : buckets.slice(0, from).toReversed()
  return ahead.find((bucket) => !bucket.isEmpty)?.key ?? null
}

/**
 * Opens one overview bucket into the sessions it folded away — level 1 of the
 * journey chart. It reads whatever granularity the overview picked, so the
 * drill target is always the tapped bucket's own range, never a hardcoded
 * month (decision 3). Returns null for a key naming no bucket or an empty one,
 * which is also the answer for a session-level overview: nothing left to
 * unfold, one bar already being one session.
 */
export const drillIntoBucket = (
  points: readonly SeriesPoint[],
  buckets: readonly SeriesBucket[],
  key: string,
): BucketDrillDown | null => {
  const bucket = buckets.find((entry) => entry.key === key)
  if (bucket === undefined) {
    return null
  }
  const inside = points.filter(
    (point) => point.date >= bucket.startMs && point.date < bucket.endMs,
  )
  if (inside.length === 0) {
    return null
  }
  // The ★ keeps the meaning it has in the overview — the all-time best, once
  // per chart — so a bucket that never held the record shows no star at all.
  const bestValue = Math.max(...points.map((point) => point.value))
  const recordDate = points.find((point) => point.value === bestValue)?.date
  const index = buckets.indexOf(bucket)
  return {
    endMs: bucket.endMs,
    nextKey: neighbourKey(buckets, index, 1),
    previousKey: neighbourKey(buckets, index, -1),
    sessions: inside.map((point) => ({
      date: point.date,
      isPr: point.date === recordDate,
      key: String(point.date),
      value: point.value,
    })),
    startMs: bucket.startMs,
  }
}
