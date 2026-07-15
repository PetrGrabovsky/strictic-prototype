import {
  countFeasibleExercises,
  gearFrom,
} from '@/features/onboarding/lib/catalog'
import type {
  Capabilities,
  Experience,
  PlanInput,
  Restrictions,
  SessionTime,
  Sex,
} from '@/features/onboarding/types'
import { planInputSchema, sessionTimeSchema } from '@/features/onboarding/types'
import type { BandLevel, Equipment } from '@/types/equipment'
import type { GoalPrimary } from '@/types/plan'
import type { Profile } from '@/types/profile'

/**
 * The mutable answers the wizard collects before it can assemble a valid
 * {@link PlanInput}. `experience`/`goalPrimary` start `null` (no honest
 * default — the user must choose); everything else carries a safe default so
 * the engine always has a complete profile once those two are picked.
 */
export type WizardDraft = {
  capabilities: Capabilities
  equipment: Equipment
  experience: Experience | null
  goalPrimary: GoalPrimary | null
  restrictions: Restrictions
  sex: Sex
  time: SessionTime
}

/** Standard adjustable-dumbbell increments the user multi-selects from (kg). */
export const STANDARD_DUMBBELL_WEIGHTS: readonly number[] = [
  2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40,
]

/** Standard total-load barbell weights (kg). */
export const STANDARD_BARBELL_WEIGHTS: readonly number[] = [
  20, 30, 40, 50, 60, 70, 80, 90, 100,
]

/** Standard cast/competition kettlebell sizes (kg). */
export const STANDARD_KETTLEBELL_WEIGHTS: readonly number[] = [
  8, 12, 16, 20, 24, 28, 32,
]

/** Band strengths, ordered light → heavy, for the bands multi-select. */
export const BAND_LEVELS: readonly BandLevel[] = ['light', 'medium', 'heavy']

/** Below this many equipment-feasible exercises we nudge for more gear. */
export const LOW_EXERCISE_HINT_THRESHOLD = 6

/** A fresh draft: dumbbells + bench on (the recommended base), rest opt-in. */
export const createInitialDraft = (): WizardDraft => ({
  capabilities: { pullupsNow: 'unknown', pushupsNow: 'unknown' },
  equipment: {
    ab_wheel: false,
    bands: { available: false, levels: [] },
    barbell: { available: false, weightsKg: [] },
    bench: true,
    dumbbells: {
      available: true,
      perHand: true,
      weightsKg: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
    },
    kettlebell: { available: false, weightsKg: [] },
    pullup_bar: false,
  },
  experience: null,
  goalPrimary: null,
  restrictions: { back: false, knee: false, shoulder: false },
  sex: 'unspecified',
  time: { daysPerWeekAvailable: 3, minutesPerSession: 45 },
})

/**
 * How many catalog exercises the chosen gear can support at all (ignores
 * experience/time — it is the equipment-feasibility preview shown on the
 * equipment step, matching the reference's "we'll build N exercises" line).
 */
export const feasibleExerciseCount = (equipment: Equipment): number =>
  countFeasibleExercises(gearFrom(equipment))

/**
 * The equipment step is valid unless an owned loadable implement has no
 * weights selected (starting weights would be impossible) or bands are owned
 * with no strength chosen. Bodyweight-only is allowed on purpose (spec FAQ).
 */
export const isEquipmentStepValid = (equipment: Equipment): boolean => {
  const { bands, barbell, dumbbells, kettlebell } = equipment
  if (dumbbells.available && dumbbells.weightsKg.length === 0) {
    return false
  }
  if (barbell.available && barbell.weightsKg.length === 0) {
    return false
  }
  if (kettlebell.available && kettlebell.weightsKg.length === 0) {
    return false
  }
  return !(bands.available && bands.levels.length === 0)
}

export const isAboutStepValid = (draft: WizardDraft): boolean =>
  draft.experience !== null

export const isGoalStepValid = (draft: WizardDraft): boolean =>
  draft.goalPrimary !== null

export const isTimeStepValid = (draft: WizardDraft): boolean =>
  sessionTimeSchema.safeParse(draft.time).success

/**
 * Assemble the validated engine input. Pull-up capability is forced to
 * `unknown` without a bar so a stale answer (bar toggled off after answering)
 * never leaks into the plan. Throws if a required choice is still missing —
 * callers gate on the step validators above before calling this.
 */
export const draftToPlanInput = (draft: WizardDraft): PlanInput =>
  planInputSchema.parse({
    capabilities: {
      pullupsNow: draft.equipment.pullup_bar
        ? draft.capabilities.pullupsNow
        : 'unknown',
      pushupsNow: draft.capabilities.pushupsNow,
    },
    equipment: draft.equipment,
    experience: draft.experience,
    goalPrimary: draft.goalPrimary,
    restrictions: draft.restrictions,
    sex: draft.sex,
    time: draft.time,
  })

/**
 * Persisted profile derived from the wizard: equipment and goal are stored
 * verbatim — {@link Profile} now shares the plan's goal vocabulary, so the
 * chip value goes straight in with no translation. The `?? 'health'` guard
 * only covers the unreachable pre-goal call; the finish gate blocks generation
 * until a goal is chosen.
 */
export const draftToProfile = (draft: WizardDraft): Profile => ({
  equipment: draft.equipment,
  goal: draft.goalPrimary ?? 'health',
  muted: false,
})
