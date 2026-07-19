/**
 * Most bars the journey overview renders before stepping up to a coarser
 * period — the finest granularity fitting this cap wins. Twenty columns of
 * fixed `COLUMN_WIDTH` still swipe comfortably on a phone; more is noise.
 */
export const MAX_OVERVIEW_BARS = 20

/** Bucket period; `session` is one bar per workout, no calendar periods. */
export type BucketGranularity = 'month' | 'quarter' | 'session' | 'week'

/** How the sessions inside a period fold into one bar. */
export type BucketAggregate = 'max' | 'sum'

/** One session reduced to the charted metric. */
export type SeriesPoint = {
  date: number
  value: number
}

/** One rendered bar of a bucketed journey chart. */
export type SeriesBucket = {
  /** Exclusive period end (ms); equals `startMs` for a session bucket. */
  endMs: number
  /** Period holds no sessions — render as a muted gap tick, never drop. */
  isEmpty: boolean
  /** Period contains "now", still collecting sessions. */
  isInProgress: boolean
  /** All-time best — the single ★ of the chart. */
  isPr: boolean
  /** Stable render key: the period start in ms. */
  key: string
  sessionCount: number
  /** Inclusive period start (ms); a session bucket's session date. */
  startMs: number
  value: number
}

/** A whole series folded for the overview, plus how it was folded. */
export type BucketedSeries = {
  buckets: readonly SeriesBucket[]
  granularity: BucketGranularity
}

type PeriodGranularity = Exclude<BucketGranularity, 'session'>

/** Local-time period start: weeks begin Monday, quarters in Jan/Apr/Jul/Oct. */
const startOfPeriod = (ms: number, granularity: PeriodGranularity): number => {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  if (granularity === 'week') {
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
    return date.getTime()
  }
  const month =
    granularity === 'month'
      ? date.getMonth()
      : Math.floor(date.getMonth() / 3) * 3
  return new Date(date.getFullYear(), month, 1).getTime()
}

const nextPeriodStart = (
  startMs: number,
  granularity: PeriodGranularity,
): number => {
  const date = new Date(startMs)
  if (granularity === 'week') {
    date.setDate(date.getDate() + 7)
    return date.getTime()
  }
  const monthStep = granularity === 'month' ? 1 : 3
  return new Date(date.getFullYear(), date.getMonth() + monthStep, 1).getTime()
}

/** Every period start from the one holding `firstMs` through `nowMs`'s. */
const periodStarts = (
  firstMs: number,
  nowMs: number,
  granularity: PeriodGranularity,
): number[] => {
  const lastStart = startOfPeriod(nowMs, granularity)
  const starts: number[] = []
  for (
    let cursor = startOfPeriod(firstMs, granularity);
    cursor <= lastStart;
    cursor = nextPeriodStart(cursor, granularity)
  ) {
    starts.push(cursor)
  }
  return starts
}

/**
 * Finest calendar granularity whose bar count fits the overview cap.
 * Quarter is the hard cap — twenty quarters is five years of history.
 */
const choosePeriod = (firstMs: number, nowMs: number) => {
  const weeks = periodStarts(firstMs, nowMs, 'week')
  if (weeks.length <= MAX_OVERVIEW_BARS) {
    return { granularity: 'week' as const, starts: weeks }
  }
  const months = periodStarts(firstMs, nowMs, 'month')
  if (months.length <= MAX_OVERVIEW_BARS) {
    return { granularity: 'month' as const, starts: months }
  }
  return {
    granularity: 'quarter' as const,
    starts: periodStarts(firstMs, nowMs, 'quarter'),
  }
}

const sessionBuckets = (points: readonly SeriesPoint[]): SeriesBucket[] =>
  points.map((point) => ({
    endMs: point.date,
    isEmpty: false,
    isInProgress: false,
    isPr: false,
    key: String(point.date),
    sessionCount: 1,
    startMs: point.date,
    value: point.value,
  }))

const aggregateValues = (
  values: readonly number[],
  aggregate: BucketAggregate,
): number =>
  aggregate === 'max'
    ? Math.max(...values)
    : values.reduce((sum, value) => sum + value, 0)

/**
 * Stars the earliest bucket holding the all-time best value — one ★ per
 * chart, so linear progression cannot inflate every bar into a "PR". An
 * unfinished `sum` bucket never counts: a partial period must not read as
 * a record. `max` is partial-period-safe and stays eligible.
 */
const markPr = (
  buckets: readonly SeriesBucket[],
  aggregate: BucketAggregate,
): readonly SeriesBucket[] => {
  const eligible = buckets.filter(
    (bucket) =>
      !bucket.isEmpty && !(aggregate === 'sum' && bucket.isInProgress),
  )
  if (eligible.length === 0) {
    return buckets
  }
  const bestValue = Math.max(...eligible.map((bucket) => bucket.value))
  const bestKey = eligible.find((bucket) => bucket.value === bestValue)?.key
  return buckets.map((bucket) =>
    bucket.key === bestKey ? { ...bucket, isPr: true } : bucket,
  )
}

/**
 * Folds a date-ascending series into the journey overview: the whole
 * history, always, auto-bucketed to at most {@link MAX_OVERVIEW_BARS} bars.
 * Up to the cap every session is its own bar (young accounts — no
 * drill-down); beyond it the finest fitting calendar period wins. Bucketed
 * charts span the first session through today, so a lapse stays visible as
 * empty buckets instead of silently compressing away.
 */
export const bucketSeries = (
  points: readonly SeriesPoint[],
  aggregate: BucketAggregate,
  now: number = Date.now(),
): BucketedSeries => {
  const firstPoint = points.at(0)
  const lastPoint = points.at(-1)
  if (firstPoint === undefined || lastPoint === undefined) {
    return { buckets: [], granularity: 'session' }
  }
  if (points.length <= MAX_OVERVIEW_BARS) {
    return {
      buckets: markPr(sessionBuckets(points), aggregate),
      granularity: 'session',
    }
  }
  // A clock running behind the newest session must not truncate the axis.
  const effectiveNow = Math.max(now, lastPoint.date)
  const { granularity, starts } = choosePeriod(firstPoint.date, effectiveNow)
  const lastIndex = starts.length - 1
  const buckets = starts.map((startMs, index) => {
    const endMs = nextPeriodStart(startMs, granularity)
    const values = points
      .filter((point) => point.date >= startMs && point.date < endMs)
      .map((point) => point.value)
    return {
      endMs,
      isEmpty: values.length === 0,
      isInProgress: index === lastIndex,
      isPr: false,
      key: String(startMs),
      sessionCount: values.length,
      startMs,
      value: values.length === 0 ? 0 : aggregateValues(values, aggregate),
    }
  })
  return { buckets: markPr(buckets, aggregate), granularity }
}
