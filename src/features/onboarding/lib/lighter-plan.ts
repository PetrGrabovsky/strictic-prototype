import { estimateMinutesFromPlan } from '@/features/onboarding/lib/time-budget'
import type { Plan, PlanExercise } from '@/types/plan'

const MIN_SETS = 2

/** Drop one working set (never below {@link MIN_SETS}) — the light-day lever. */
const lighten = (exercise: PlanExercise): PlanExercise => ({
  ...exercise,
  sets: Math.max(MIN_SETS, exercise.sets - 1),
})

/**
 * The lighter variant of a plan for the home screen's "lehčí den" marker
 * (STRICTIC-PLAN Stage 5). Same exercises and weights — so working weights
 * still map by `exercise_id` — just one fewer set each and a recomputed time.
 */
export const lighterPlan = (plan: Plan): Plan => {
  const lighter = plan.plan.map((exercise) => lighten(exercise))
  return {
    ...plan,
    meta: {
      ...plan.meta,
      session_time_est_min: estimateMinutesFromPlan(lighter),
    },
    plan: lighter,
  }
}
