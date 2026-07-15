import { z } from 'zod'
import type { ExerciseId, ExercisePattern } from '@/types/exercise'

/**
 * Primary training goal (spec §4 `goal_primary`). The MVP wizard offers these
 * as chips; `fat_loss`/`health` reuse the hypertrophy prescription (spec §8).
 * Kept as a zod enum so it is the single source shared by the engine input
 * ({@link PlanInput}) and the {@link Plan} output contract.
 */
export const goalPrimarySchema = z.enum([
  'fat_loss',
  'health',
  'hypertrophy',
  'strength',
])

export type GoalPrimary = z.infer<typeof goalPrimarySchema>

/**
 * Plan-level metadata (spec §4 `meta`). Snake_case field names are the wire
 * contract: the deterministic engine and the Phase-2 AI generator must emit
 * byte-identical shapes so the rest of the app never learns which produced it
 * (STRICTIC-MVP §4).
 */
export type PlanMeta = {
  /** 3–5 honest Czech sentences: what they get, why, what to expect. */
  coach_summary_cs: string
  /** Injuries/limitations found, snake_case English (e.g. `low_back`). */
  detected_constraints: readonly string[]
  /** Movement patterns dropped because of a constraint (e.g. `push_v`). */
  excluded_patterns: readonly ExercisePattern[]
  frequency_per_week: number
  goal_primary: GoalPrimary
  /** 0–3 blunt caveats (e.g. diet drives fat loss). */
  honest_notes_cs: readonly string[]
  /** Short, ownable Czech plan name, e.g. `Svaly doma · 3× týdně`. */
  plan_name_cs: string
  session_time_est_min: number
  /** The MVP only programs a single repeated full-body template. */
  split: 'full_body'
}

/**
 * One prescribed exercise in a plan (spec §4 `plan[]`). `reps` xor `hold_s` is
 * populated (holds carry `hold_s`); `start_weight_kg` is set only for
 * `load_type: external` exercises and always comes from the user's own weight
 * list.
 */
export type PlanExercise = {
  exercise_id: ExerciseId
  hold_s: null | number
  reps: null | number
  rest_s: number
  /** Set only when an easier/harder variant was chosen (spec §4). */
  scaling_note_cs: null | string
  sets: number
  start_weight_kg: null | number
  /** One personal Czech sentence referencing their gear/goal/capability. */
  why_this_for_you_cs: string
}

/**
 * The full generated plan (spec §4). Produced by the deterministic engine
 * today ({@link buildPlan}); the AI coach returns the same shape in Phase 2.
 */
export type Plan = {
  meta: PlanMeta
  plan: readonly PlanExercise[]
  warmup_cs: string
}
