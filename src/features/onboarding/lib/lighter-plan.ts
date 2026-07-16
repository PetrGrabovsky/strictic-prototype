import {
  estimateMinutesFromPlan,
  MIN_WORKING_SETS,
} from '@/features/onboarding/lib/time-budget'
import type { Plan, PlanExercise } from '@/types/plan'

/**
 * Drop one working set (never below {@link MIN_WORKING_SETS}) — the light-day
 * lever.
 */
const lighten = (exercise: PlanExercise): PlanExercise => ({
  ...exercise,
  sets: Math.max(MIN_WORKING_SETS, exercise.sets - 1),
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

/**
 * Below this weekly frequency there is no microcycle to deload — a once-a-week
 * plan must never run permanently light.
 */
const MIN_DELOAD_FREQUENCY = 2

/**
 * Whether the upcoming session is a deload (rendered via {@link lighterPlan}).
 * The last session of each weekly microcycle runs lighter, so with
 * `completedSessions` already finished and a `frequency`-per-week plan the
 * deload lands on sessions `frequency`, `2·frequency`, … — the earlier
 * sessions of every block stay full, and a once-a-week plan never deloads.
 */
export const isDeloadSession = (
  completedSessions: number,
  frequency: number,
): boolean =>
  frequency >= MIN_DELOAD_FREQUENCY &&
  completedSessions % frequency === frequency - 1
