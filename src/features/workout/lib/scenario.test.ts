import { describe, expect, it } from 'vitest'
import { buildFinishResult } from '@/features/workout/lib/finish'
import {
  buildInitialLogs,
  isExerciseDone,
} from '@/features/workout/lib/session'
import type { WorkoutExercise } from '@/features/workout/types'
import type { ExerciseLog } from '@/types/workout'

const squat: WorkoutExercise = {
  holdSeconds: null,
  id: 'goblet_squat',
  isHold: false,
  perHand: false,
  restSeconds: 90,
  sets: 3,
  startWeightKg: 20,
  targetReps: 12,
  weights: [16, 18, 20, 22, 24],
}
const bench: WorkoutExercise = {
  ...squat,
  id: 'db_bench_press',
  perHand: true,
  startWeightKg: 16,
}
const plank: WorkoutExercise = {
  holdSeconds: 40,
  id: 'plank',
  isHold: true,
  perHand: false,
  restSeconds: 60,
  sets: 3,
  startWeightKg: null,
  targetReps: null,
  weights: [],
}
const plan = [squat, bench, plank]

/** Mirror of the component's `advanceAfterSet` branch: whole workout done? */
const isWorkoutDone = (logs: Record<string, ExerciseLog>): boolean =>
  plan.every((exercise) => isExerciseDone(logs[exercise.id]))

const markDone = (log: ExerciseLog, upTo: number): ExerciseLog => ({
  ...log,
  sets: log.sets.map((set, index) =>
    index <= upTo ? { ...set, done: true } : set,
  ),
})

describe('workout flow (rest-flow + data integrity)', () => {
  it('rests after a mid-exercise set, never after the final set', () => {
    const logs = buildInitialLogs(plan, null)

    // Last set of exercise 1 (squat) — bench + plank still pending.
    const afterSquat = { ...logs, goblet_squat: markDone(logs.goblet_squat, 2) }
    expect(isWorkoutDone(afterSquat)).toBe(false) // → rest (prep next exercise)

    // Every set of every exercise logged: the final set finishes the workout.
    const allDone: Record<string, ExerciseLog> = {
      db_bench_press: markDone(logs.db_bench_press, 2),
      goblet_squat: markDone(logs.goblet_squat, 2),
      plank: markDone(logs.plank, 2),
    }
    expect(isWorkoutDone(allDone)).toBe(true) // → summary, NOT an empty rest
  })

  it('keeps a skipped exercise’s finished sets in the volume', () => {
    const logs = buildInitialLogs(plan, null)
    // Two sets of the squat done, then the exercise is skipped mid-way.
    const skipped: Record<string, ExerciseLog> = {
      ...logs,
      goblet_squat: { ...markDone(logs.goblet_squat, 1), status: 'skipped' },
    }
    const { record } = buildFinishResult({
      elapsedSeconds: 400,
      exercises: plan,
      isEasy: false,
      logs: skipped,
      progress: null,
    })
    // 12·20 + 12·20 from the two finished sets — the skip did not zero them.
    expect(record?.volume).toBe(480)
    expect(record?.ex.goblet_squat).toEqual({ e1: 28, r: 12, w: 20 })
  })

  it('save-and-exit writes exactly the work really done', () => {
    const logs = buildInitialLogs(plan, null)
    // Only the squat's first set done, then "end and save what I have".
    const partial = { ...logs, goblet_squat: markDone(logs.goblet_squat, 0) }
    const { record } = buildFinishResult({
      elapsedSeconds: 130,
      exercises: plan,
      isEasy: false,
      logs: partial,
      progress: null,
    })
    // `record` is byte-for-byte what saveHistory() persists to localStorage.
    expect(record?.volume).toBe(240)
    expect(Object.keys(record?.ex ?? {})).toEqual(['goblet_squat'])
  })
})
