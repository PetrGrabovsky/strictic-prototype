import type { ExerciseId } from '@/types/exercise'

/**
 * One finished session's result for a single exercise, tagged with its date.
 * The narrow field names (`w`/`r`/`e1`) mirror the stored {@link ExerciseResult}
 * wire format so a point maps 1:1 to a history row.
 */
export type ProgressPoint = {
  date: number
  e1: number
  r: number
  w: number
}

/**
 * Direction of an exercise's working weight over its logged sessions.
 * `start` is the single-record case — a first data point, not a change.
 */
export type ProgressTrend = 'down' | 'flat' | 'start' | 'up'

/**
 * Per-exercise progression derived from history, one card in the hero
 * carousel. `wDeltaPct` drives the sort and the headline; `e1DeltaPct` is the
 * quieter strength-estimate delta shown in the sub-line.
 */
export type ExerciseProgress = {
  e1DeltaPct: number
  first: ProgressPoint
  id: ExerciseId
  last: ProgressPoint
  series: readonly ProgressPoint[]
  trend: ProgressTrend
  wDeltaPct: number
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
  volumeDates: readonly number[]
  volumeSeries: readonly number[]
  weekDots: readonly WeekDot[]
  weeksSpan: number
}
