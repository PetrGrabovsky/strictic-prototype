import { domainOf } from '@/features/progress/lib/bar-scale'
import type {
  Consistency,
  ExerciseProgress,
  ProgressData,
  ProgressPoint,
  ProgressTrend,
  WeekDot,
} from '@/features/progress/types'
import type { ExerciseId } from '@/types/exercise'
import type { WorkoutHistory } from '@/types/workout'

const DAY_MS = 86_400_000
const WEEK_MS = 7 * DAY_MS
/** Sessions within this many days count toward the "last 30 days" tally. */
const RECENT_WINDOW_DAYS = 30
/** The regularity chart shows one bar per week for this many weeks back. */
const REGULARITY_WEEKS = 10
/** A gap longer than this flips the coaching line to "life happens". */
const GAP_DAYS_THRESHOLD = 12
const STRONG_SESSIONS = 8
const SOLID_SESSIONS = 4

/**
 * Percentage change from `from` to `to`, rounded. Guards the zero baseline so
 * a first-ever record (or a bodyweight exercise with no load) yields 0, never
 * a divide-by-zero — the single-record "start state" (BUILD-GUIDE §4.3).
 */
const percentChange = (from: number, to: number): number =>
  from > 0 ? Math.round((to / from - 1) * 100) : 0

const trendOf = (
  pointCount: number,
  weightGainPercent: number,
): ProgressTrend => {
  if (pointCount < 2) {
    return 'start'
  }
  if (weightGainPercent > 0) {
    return 'up'
  }
  if (weightGainPercent < 0) {
    return 'down'
  }
  return 'flat'
}

const consistencyOf = (
  lastGapDays: number,
  sessionsLast30: number,
): Consistency => {
  if (lastGapDays > GAP_DAYS_THRESHOLD) {
    return 'gap'
  }
  if (sessionsLast30 >= STRONG_SESSIONS) {
    return 'strong'
  }
  if (sessionsLast30 >= SOLID_SESSIONS) {
    return 'solid'
  }
  return 'starting'
}

/**
 * The chronological series of one exercise's top sets across all history.
 * This is the wire→domain boundary: the stored `w`/`r`/`e1` fields become
 * readable names here, and nothing above this layer sees them again.
 */
const seriesFor = (
  exerciseId: ExerciseId,
  history: WorkoutHistory,
): ProgressPoint[] =>
  history.flatMap((record) => {
    if (!Object.hasOwn(record.ex, exerciseId)) {
      return []
    }
    const result = record.ex[exerciseId]
    return [
      {
        date: record.date,
        estimatedMax: result.e1,
        reps: result.r,
        weightKg: result.w,
      },
    ]
  })

/**
 * One card per plan exercise that has at least one logged session, sorted by
 * the biggest working-weight gain first (the carousel opens on the user's
 * proudest number), breaking ties by the strength-estimate gain.
 */
const buildExercises = (
  exerciseIds: readonly ExerciseId[],
  history: WorkoutHistory,
): ExerciseProgress[] =>
  exerciseIds
    .flatMap((id) => {
      const series = seriesFor(id, history)
      const first = series.at(0)
      const last = series.at(-1)
      if (first === undefined || last === undefined) {
        return []
      }
      const weightGainPercent = percentChange(first.weightKg, last.weightKg)
      return [
        {
          first,
          id,
          last,
          series,
          strengthGainPercent: percentChange(
            first.estimatedMax,
            last.estimatedMax,
          ),
          trend: trendOf(series.length, weightGainPercent),
          weightDeltaKg: last.weightKg - first.weightKg,
          weightDomain: domainOf(series.map((point) => point.weightKg)),
          weightGainPercent,
        },
      ]
    })
    .toSorted(
      (a, b) =>
        b.weightGainPercent - a.weightGainPercent ||
        b.strengthGainPercent - a.strengthGainPercent,
    )

/**
 * Turns raw history into everything the Progress screen shows: per-exercise
 * progression, the volume-per-session series, and the regularity summary.
 * Pure and clock-injectable (`now`) so the time-window maths — last-30-days,
 * the 10-week dots, the "since when" gap — stay deterministic under test.
 * `exerciseIds` is the plan's non-hold exercises, in plan order; only those
 * with logged history become cards.
 */
export const deriveProgress = (
  exerciseIds: readonly ExerciseId[],
  history: WorkoutHistory,
  now: number = Date.now(),
): ProgressData => {
  const recentCutoff = now - RECENT_WINDOW_DAYS * DAY_MS
  const sessionsLast30 = history.filter(
    (record) => record.date > recentCutoff,
  ).length

  const firstRecord = history.at(0)
  const lastRecord = history.at(-1)

  const weeksSpan =
    history.length > 1 && firstRecord !== undefined && lastRecord !== undefined
      ? Math.max(1, Math.round((lastRecord.date - firstRecord.date) / WEEK_MS))
      : 0

  const lastGapDays =
    lastRecord === undefined
      ? GAP_DAYS_THRESHOLD + 1
      : Math.floor((now - lastRecord.date) / DAY_MS)

  const weekDots: WeekDot[] = Array.from(
    { length: REGULARITY_WEEKS },
    (_, week) => {
      const end = now - (REGULARITY_WEEKS - 1 - week) * WEEK_MS
      const weekStart = end - WEEK_MS
      return {
        active: history.some(
          (record) => record.date > weekStart && record.date <= end,
        ),
        weekStart,
      }
    },
  )

  return {
    consistency: consistencyOf(lastGapDays, sessionsLast30),
    exercises: buildExercises(exerciseIds, history),
    sessionCount: history.length,
    sessionsLast30,
    totalVolumeKg: history.reduce((sum, record) => sum + record.volume, 0),
    volumeDates: history.map((record) => record.date),
    volumeSeries: history.map((record) => record.volume),
    weekDots,
    weeksSpan,
  }
}
