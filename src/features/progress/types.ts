import type { BarDomain } from '@/features/progress/lib/bar-scale'
import type { BucketedSeries } from '@/features/progress/lib/bucket-series'
import type { ExerciseId } from '@/types/exercise'

/**
 * One finished session's result for a single exercise, tagged with its date.
 * The derive layer translates the stored wire fields (`w`/`r`/`e1`, see
 * {@link ExerciseResult}) into these readable names, so everything above it
 * speaks the domain language.
 */
export type ProgressPoint = {
  date: number
  estimatedMax: number
  reps: number
  weightKg: number
}

/**
 * Direction of an exercise's working weight over its logged sessions.
 * `start` is the single-record case — a first data point, not a change.
 */
export type ProgressTrend = 'down' | 'flat' | 'start' | 'up'

/**
 * Per-exercise progression derived from history, one card in the hero
 * carousel. `weightGainPercent` drives the sort and the headline;
 * `strengthGainPercent` is the quieter strength-estimate delta shown in the
 * sub-line. `weightDeltaKg` and `weightDomain` are always global — measured
 * from the very first session, independent of any visible chart window.
 * `weightBuckets` is the same history folded into the journey overview
 * (`max` per period); `series` stays the raw per-session data the header and
 * share sparkline read.
 */
export type ExerciseProgress = {
  first: ProgressPoint
  id: ExerciseId
  last: ProgressPoint
  series: readonly ProgressPoint[]
  strengthGainPercent: number
  trend: ProgressTrend
  weightBuckets: BucketedSeries
  weightDeltaKg: number
  weightDomain: BarDomain
  weightGainPercent: number
}

/**
 * How faithfully the user has trained lately — selects the coaching line
 * under the regularity chart. Ordered from cold to hot in intent, not value.
 */
export type Consistency = 'gap' | 'solid' | 'starting' | 'strong'

/** One week in the regularity strip: whether it was trained, keyed by start. */
export type WeekDot = {
  active: boolean
  weekStart: number
}

/** Everything the Progress screen renders, derived purely from history. */
export type ProgressData = {
  consistency: Consistency
  exercises: readonly ExerciseProgress[]
  sessionCount: number
  sessionsLast30: number
  totalVolumeKg: number
  /** Whole-history volume folded for the overview (`sum` per period). */
  volumeBuckets: BucketedSeries
  /** Raw per-session dates, kept for the chart's from–to range caption. */
  volumeDates: readonly number[]
  weekDots: readonly WeekDot[]
  weeksSpan: number
}
