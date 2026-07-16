import { describe, expect, it } from 'vitest'
import { buildFinishResult } from '@/features/workout/lib/finish'
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

const set = (isDone: boolean, reps: number, weight: number) => ({
  done: isDone,
  reps,
  weight,
})

describe('buildFinishResult', () => {
  it('counts finished sets of a skipped exercise into the volume', () => {
    const logs: Record<string, ExerciseLog> = {
      goblet_squat: {
        sets: [set(true, 12, 20), set(true, 10, 20), set(false, 12, 20)],
        status: 'skipped',
      },
    }

    const { progress, record } = buildFinishResult({
      elapsedSeconds: 100,
      exercises: [squat],
      isEasy: false,
      logs,
      progress: null,
    })

    // 12·20 + 10·20 — the untouched third set contributes nothing.
    expect(record?.volume).toBe(440)
    expect(record?.ex.goblet_squat).toEqual({ e1: 28, r: 12, w: 20 })
    // A skip neither progresses nor regresses: no bump, weights held.
    expect(progress.entries.goblet_squat?.bump).toBeNull()
  })

  it('bumps the weight when every set hits the target', () => {
    const logs: Record<string, ExerciseLog> = {
      goblet_squat: {
        sets: [set(true, 12, 20), set(true, 12, 20), set(true, 12, 20)],
        status: 'done',
      },
    }

    const { progress, record } = buildFinishResult({
      elapsedSeconds: 200,
      exercises: [squat],
      isEasy: false,
      logs,
      progress: null,
    })

    expect(record?.volume).toBe(720)
    expect(progress.entries.goblet_squat?.bump).toEqual({ from: 20, to: 22 })
    expect(progress.entries.goblet_squat?.weights).toEqual([22, 22, 22])
  })

  it('holds the weight on a light day even at target', () => {
    const logs: Record<string, ExerciseLog> = {
      goblet_squat: {
        sets: [set(true, 12, 20), set(true, 12, 20), set(true, 12, 20)],
        status: 'done',
      },
    }

    const { progress } = buildFinishResult({
      elapsedSeconds: 200,
      exercises: [squat],
      isEasy: true,
      logs,
      progress: null,
    })

    expect(progress.entries.goblet_squat?.bump).toBeNull()
  })

  it('stores hold durations and keeps them out of the volume', () => {
    const logs: Record<string, ExerciseLog> = {
      plank: {
        sets: [set(true, 0, 0), set(true, 0, 0), set(true, 0, 0)].map(
          (base, index) => ({ ...base, secs: [40, 35, 30][index] }),
        ),
        status: 'done',
      },
    }

    const { progress, record } = buildFinishResult({
      elapsedSeconds: 300,
      exercises: [plank],
      isEasy: false,
      logs,
      progress: null,
    })

    // Only a hold was done → no rankable set → no history record.
    expect(record).toBeNull()
    expect(progress.entries.plank?.secs).toEqual([40, 35, 30])
  })

  it('writes no record when nothing was finished', () => {
    const logs: Record<string, ExerciseLog> = {
      goblet_squat: {
        sets: [set(false, 12, 20), set(false, 12, 20), set(false, 12, 20)],
        status: 'pending',
      },
    }

    const { progress, record } = buildFinishResult({
      elapsedSeconds: 30,
      exercises: [squat],
      isEasy: false,
      logs,
      progress: null,
    })

    expect(record).toBeNull()
    expect(progress.last?.volume).toBe(0)
  })
})
