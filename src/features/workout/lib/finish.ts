import { estimateOneRepMax, roundTenth } from '@/features/workout/lib/session'
import { nextWeightUp } from '@/features/workout/lib/weights'
import type { WorkoutExercise } from '@/features/workout/types'
import type {
  ExerciseLog,
  ExerciseResult,
  ProgressEntry,
  WorkoutProgress,
  WorkoutRecord,
} from '@/types/workout'

type FinishArgs = {
  elapsedSeconds: number
  exercises: readonly WorkoutExercise[]
  isEasy: boolean
  logs: Record<string, ExerciseLog>
  progress: null | WorkoutProgress
}

type FinishResult = {
  progress: WorkoutProgress
  record: null | WorkoutRecord
}

type Tally = {
  best: ExerciseResult | null
  volume: number
}

/**
 * Sum the volume of and pick the heaviest of the sets the user actually
 * finished. Only `done` sets count — this is the guarantee that a skipped or
 * half-finished exercise contributes its real work, never zeros or its
 * untouched target (BUILD-GUIDE §4 data integrity).
 */
const tallyDoneSets = (log: ExerciseLog): Tally => {
  let best: ExerciseResult | null = null
  let volume = 0
  for (const set of log.sets) {
    if (!set.done) {
      continue
    }
    volume += set.reps * set.weight
    const estimate = estimateOneRepMax(set.weight, set.reps)
    if (best === null || estimate > best.e1) {
      best = { e1: roundTenth(estimate), r: set.reps, w: set.weight }
    }
  }
  return { best, volume }
}

/**
 * Next session's progression state for one reps exercise. On a light day
 * weights hold; otherwise hitting the target reps in every set bumps the load
 * one notch (when the user owns a heavier weight), else the actual weights
 * carry forward. A skipped exercise keeps its prior weights and clears any
 * pending bump — it neither progresses nor regresses on a skip.
 */
const progressEntryFor = (
  exercise: WorkoutExercise,
  log: ExerciseLog,
  isEasy: boolean,
  prior: ProgressEntry | undefined,
): ProgressEntry => {
  if (log.status === 'skipped') {
    return {
      bump: null,
      weights: prior?.weights ?? log.sets.map((set) => set.weight),
    }
  }
  const firstWeight = log.sets[0]?.weight ?? exercise.startWeightKg ?? 0
  if (isEasy) {
    return {
      bump: null,
      weights: prior?.weights ?? log.sets.map(() => firstWeight),
    }
  }
  const target = exercise.targetReps
  const isHitTarget =
    target !== null &&
    log.sets.every((set) => set.done) &&
    log.sets.every((set) => set.reps >= target)
  const raised = nextWeightUp(exercise.weights, firstWeight)
  if (isHitTarget && raised !== null) {
    return {
      bump: { from: firstWeight, to: raised },
      weights: log.sets.map(() => raised),
    }
  }
  return { bump: null, weights: log.sets.map((set) => set.weight) }
}

/**
 * Roll a finished (or abandoned) workout into the two persisted islands: the
 * history record for the Progress screen and the per-exercise progression
 * state. Pure — the caller owns the storage writes. `record` is null when
 * nothing was logged (a workout opened and left untouched writes no history).
 */
export const buildFinishResult = ({
  elapsedSeconds,
  exercises,
  isEasy,
  logs,
  progress,
}: FinishArgs): FinishResult => {
  const entries: Record<string, ProgressEntry> = { ...progress?.entries }
  const recordExercises: Record<string, ExerciseResult> = {}
  let volume = 0

  for (const exercise of exercises) {
    const log = logs[exercise.id]
    if (!log) {
      continue
    }
    if (exercise.isHold) {
      entries[exercise.id] = {
        secs: log.sets.map((set) => set.secs ?? 0),
        weights: entries[exercise.id]?.weights ?? [],
      }
      continue
    }
    const tally = tallyDoneSets(log)
    volume += tally.volume
    if (tally.best !== null) {
      recordExercises[exercise.id] = tally.best
    }
    entries[exercise.id] = progressEntryFor(
      exercise,
      log,
      isEasy,
      entries[exercise.id],
    )
  }

  const roundedVolume = Math.round(volume)
  const now = Date.now()
  const hasResults = Object.keys(recordExercises).length > 0
  const record: null | WorkoutRecord = hasResults
    ? {
        date: now,
        dur: elapsedSeconds,
        ex: recordExercises,
        volume: roundedVolume,
        ...(isEasy && { easy: true }),
      }
    : null

  return {
    progress: { entries, last: { date: now, volume: roundedVolume } },
    record,
  }
}
