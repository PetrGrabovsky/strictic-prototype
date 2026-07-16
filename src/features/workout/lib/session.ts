import { getExercise } from '@/features/onboarding/lib/catalog'
import { availableWeights } from '@/features/workout/lib/weights'
import type { WorkoutExercise } from '@/features/workout/types'
import type { Equipment } from '@/types/equipment'
import type { PlanExercise } from '@/types/plan'
import type { ExerciseLog, WorkoutProgress, WorkoutSet } from '@/types/workout'

/** Epley's divisor: 1RM ≈ w · (1 + reps / 30). */
const EPLEY_DIVISOR = 30

/**
 * Estimated one-rep max (Epley). Used only to rank a session's heaviest set
 * for the history record — never shown as a hard number.
 */
export const estimateOneRepMax = (weight: number, reps: number): number =>
  weight * (1 + reps / EPLEY_DIVISOR)

/** Round to one decimal, matching the stored e1RM precision. */
export const roundTenth = (value: number): number => Math.round(value * 10) / 10

/**
 * Whether an exercise counts as finished: explicitly skipped, or every one of
 * its sets is logged. Drives the progress dots and the "whole workout done"
 * check that sends the last set straight to the summary.
 */
export const isExerciseDone = (log: ExerciseLog | undefined): boolean => {
  if (!log) {
    return false
  }
  if (log.status === 'skipped') {
    return true
  }
  return log.sets.length > 0 && log.sets.every((set) => set.done)
}

/**
 * Join each plan exercise with its catalog record and the user's usable
 * weights. Unknown ids (a plan built against a newer catalog) are dropped
 * rather than crashing the screen.
 */
export const resolveExercises = (
  planExercises: readonly PlanExercise[],
  equipment: Equipment,
): WorkoutExercise[] => {
  const resolved: WorkoutExercise[] = []
  for (const planExercise of planExercises) {
    const catalog = getExercise(planExercise.exercise_id)
    if (!catalog) {
      continue
    }
    resolved.push({
      holdSeconds: planExercise.hold_s,
      id: planExercise.exercise_id,
      isHold: catalog.isHold,
      perHand: catalog.perHand,
      restSeconds: planExercise.rest_s,
      sets: planExercise.sets,
      startWeightKg: planExercise.start_weight_kg,
      targetReps: planExercise.reps,
      weights: availableWeights(catalog, equipment),
    })
  }
  return resolved
}

/**
 * The working weight to prefill for a set: the user's carried-forward weight
 * from a past session when there is one, else the plan's conservative start.
 */
const prefillWeight = (
  exercise: WorkoutExercise,
  index: number,
  carried: readonly number[] | undefined,
): number => {
  if (carried && carried.length > 0) {
    return carried[Math.min(index, carried.length - 1)]
  }
  return exercise.startWeightKg ?? 0
}

/**
 * A fresh set of logs for the plan: every set prefilled with its working
 * weight and target reps, nothing done yet. Weights come from saved progress
 * (last session's working weights) when available.
 */
export const buildInitialLogs = (
  exercises: readonly WorkoutExercise[],
  progress: null | WorkoutProgress,
): Record<string, ExerciseLog> => {
  const logs: Record<string, ExerciseLog> = {}
  for (const exercise of exercises) {
    const carried = progress?.entries[exercise.id]?.weights
    const sets: WorkoutSet[] = Array.from(
      { length: exercise.sets },
      (_, index) => ({
        done: false,
        reps: exercise.targetReps ?? 0,
        weight: prefillWeight(exercise, index, carried),
      }),
    )
    logs[exercise.id] = { sets, status: 'pending' }
  }
  return logs
}

/**
 * Merge a resumed session's saved logs onto a fresh scaffold: keep the saved
 * log for any exercise whose set count still matches today's plan, otherwise
 * fall back to the fresh one. Guards against a plan that changed shape (e.g. a
 * light day) between saving and resuming.
 */
export const reconcileLogs = (
  exercises: readonly WorkoutExercise[],
  saved: Record<string, ExerciseLog>,
  progress: null | WorkoutProgress,
): Record<string, ExerciseLog> => {
  const fresh = buildInitialLogs(exercises, progress)
  const merged: Record<string, ExerciseLog> = {}
  for (const exercise of exercises) {
    const savedLog = saved[exercise.id]
    const freshLog = fresh[exercise.id]
    const canReuse =
      Boolean(savedLog) && savedLog?.sets.length === freshLog.sets.length
    merged[exercise.id] = canReuse && savedLog ? savedLog : freshLog
  }
  return merged
}
