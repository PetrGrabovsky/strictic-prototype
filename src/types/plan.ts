import { z } from 'zod'
import { exerciseIdSchema, exercisePatternSchema } from '@/types/exercise'

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
 * (STRICTIC-MVP §4). Validated on read so a stored plan of an outdated shape is
 * discarded rather than crashing the app.
 */
export const planMetaSchema = z.object({
  coach_summary_cs: z.string(), // 3–5 honest Czech sentences: what/why/expect
  detected_constraints: z.array(z.string()).readonly(), // e.g. `low_back`
  excluded_patterns: z.array(exercisePatternSchema).readonly(), // e.g. `push_v`
  frequency_per_week: z.number(),
  goal_primary: goalPrimarySchema,
  honest_notes_cs: z.array(z.string()).readonly(), // 0–3 blunt caveats
  plan_name_cs: z.string(), // short, ownable, e.g. `Svaly doma · 3× týdně`
  session_time_est_min: z.number(),
  split: z.literal('full_body'), // MVP programs one repeated full-body template
})

export type PlanMeta = z.infer<typeof planMetaSchema>

/**
 * One prescribed exercise in a plan (spec §4 `plan[]`). `reps` xor `hold_s` is
 * populated (holds carry `hold_s`); `start_weight_kg` is set only for
 * `load_type: external` exercises and always comes from the user's own weight
 * list.
 */
export const planExerciseSchema = z.object({
  exercise_id: exerciseIdSchema,
  hold_s: z.number().nullable(),
  reps: z.number().nullable(),
  rest_s: z.number(),
  scaling_note_cs: z.string().nullable(), // set only when a variant was chosen
  sets: z.number(),
  start_weight_kg: z.number().nullable(),
  why_this_for_you_cs: z.string(), // one personal Czech sentence for the user
})

export type PlanExercise = z.infer<typeof planExerciseSchema>

/**
 * The full generated plan (spec §4). Produced by the deterministic engine
 * today ({@link buildPlan}); the AI coach returns the same shape in Phase 2.
 * Persisted verbatim under {@link PLAN_STORAGE_KEY} so Home can render it
 * without recomputing (the engine input is richer than the stored profile).
 */
export const planSchema = z.object({
  meta: planMetaSchema,
  plan: z.array(planExerciseSchema).readonly(),
  warmup_cs: z.string(),
})

export type Plan = z.infer<typeof planSchema>
