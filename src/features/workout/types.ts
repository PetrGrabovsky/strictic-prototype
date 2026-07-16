import type { ExerciseId } from '@/types/exercise'

/**
 * One exercise resolved for a live workout: its plan prescription joined with
 * the catalog facts the screen needs (hold vs. reps, per-hand loading) and the
 * user's own usable weights for dialing the load. This is the single shape the
 * workout components and the finish/progression logic consume — neither ever
 * reaches back into the raw {@link Plan} or the catalog.
 */
export type WorkoutExercise = {
  holdSeconds: null | number
  id: ExerciseId
  isHold: boolean
  perHand: boolean
  restSeconds: number
  sets: number
  startWeightKg: null | number
  targetReps: null | number
  weights: readonly number[]
}
