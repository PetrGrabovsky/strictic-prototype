import { gearFrom } from '@/features/onboarding/lib/catalog'
import {
  coachSummary,
  honestNotes,
  planName,
  scalingNote,
  WARMUP_CS,
  whyThisForYou,
} from '@/features/onboarding/lib/copy'
import type {
  EngineContext,
  PlannedItem,
  Selected,
} from '@/features/onboarding/lib/engine-types'
import { prescribeAll } from '@/features/onboarding/lib/prescription'
import { buildSelection } from '@/features/onboarding/lib/selection'
import {
  estimateMinutes,
  fitToBudget,
} from '@/features/onboarding/lib/time-budget'
import type {
  Experience,
  PlanInput,
  Restrictions,
} from '@/features/onboarding/types'
import type { ExercisePattern } from '@/types/exercise'
import type { Plan, PlanExercise, PlanMeta } from '@/types/plan'

/** Numeric experience level for catalog `level_min` gating (spec §3.1). */
const LEVEL: Record<Experience, number> = { new: 0, regular: 2, returning: 1 }

/** Upper bound on exercise count by experience (spec hard rule 5). */
const MAX_EXERCISES: Record<Experience, number> = {
  new: 8,
  regular: 11,
  returning: 9,
}

const DEFAULT_FREQUENCY = 3

const buildContext = (input: PlanInput): EngineContext => ({
  capabilities: input.capabilities,
  experience: input.experience,
  gear: gearFrom(input.equipment),
  goal: input.goalPrimary,
  level: LEVEL[input.experience],
  restrictions: input.restrictions,
  sex: input.sex,
})

/**
 * Trim the accessory tail to the experience count cap (spec hard rule 5),
 * keeping the highest-value accessories and leaving compounds + core intact.
 */
const capAccessories = (
  selection: readonly Selected[],
  maxExercises: number,
): Selected[] => {
  const compounds = selection.filter((item) => item.role === 'compound')
  const accessories = selection.filter((item) => item.role === 'accessory')
  const cores = selection.filter((item) => item.role === 'core')
  const allowed = Math.max(0, maxExercises - compounds.length - cores.length)
  return [...compounds, ...accessories.slice(0, allowed), ...cores]
}

/** Weekly frequency (spec hard rule 9): default 3, never above availability. */
const frequencyFor = (daysAvailable: number): number =>
  Math.min(daysAvailable, DEFAULT_FREQUENCY)

const detectedConstraints = (restrictions: Restrictions): string[] => {
  const constraints: string[] = []
  if (restrictions.shoulder) {
    constraints.push('shoulder')
  }
  if (restrictions.back) {
    constraints.push('low_back')
  }
  if (restrictions.knee) {
    constraints.push('knee')
  }
  return constraints
}

const toPlanExercise = (
  item: PlannedItem,
  goal: EngineContext['goal'],
): PlanExercise => ({
  exercise_id: item.exercise.id,
  hold_s: item.holdSeconds,
  reps: item.reps,
  rest_s: item.restSeconds,
  scaling_note_cs: scalingNote(item.note),
  sets: item.sets,
  start_weight_kg: item.startWeightKg,
  why_this_for_you_cs: whyThisForYou(item.exercise, goal),
})

/**
 * The deterministic plan engine (spec §0, STRICTIC-MVP §4): select from the
 * catalog and assemble a full-body plan whose shape matches the AI coach's
 * contract ({@link Plan}). Pure — no I/O, no framework, no LLM.
 */
export const buildPlan = (input: PlanInput): Plan => {
  const context = buildContext(input)
  const selection = capAccessories(
    buildSelection(context),
    MAX_EXERCISES[context.experience],
  )
  const prescribed = prescribeAll(selection, context, input.equipment)
  const items = fitToBudget(prescribed, input.time.minutesPerSession)
  const frequency = frequencyFor(input.time.daysPerWeekAvailable)

  const excludedPatterns: ExercisePattern[] = context.restrictions.shoulder
    ? ['push_v']
    : []

  const meta: PlanMeta = {
    coach_summary_cs: coachSummary(context.goal, frequency),
    detected_constraints: detectedConstraints(context.restrictions),
    excluded_patterns: excludedPatterns,
    frequency_per_week: frequency,
    goal_primary: context.goal,
    honest_notes_cs: honestNotes(context.goal),
    plan_name_cs: planName(context.goal, frequency),
    session_time_est_min: estimateMinutes(items),
    split: 'full_body',
  }

  return {
    meta,
    plan: items.map((item) => toPlanExercise(item, context.goal)),
    warmup_cs: WARMUP_CS,
  }
}
