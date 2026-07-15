import type {
  Capabilities,
  Experience,
  Restrictions,
  Sex,
} from '@/features/onboarding/types'
import type { Gear } from '@/types/equipment'
import type { Exercise } from '@/types/exercise'
import type { GoalPrimary } from '@/types/plan'

/** Where an exercise sits in the plan — governs ordering and trim priority. */
export type Role = 'accessory' | 'compound' | 'core'

/**
 * Reason an easier/harder variant was chosen; resolved to a Czech
 * `scaling_note_cs` by the copy layer. Keeps selection free of product copy.
 */
export type NoteKind = 'assist' | 'back_hinge' | 'incline' | 'knee_step'

/** A chosen catalog exercise plus why it filled its slot. */
export type Selected = {
  exercise: Exercise
  note: NoteKind | null
  role: Role
}

/** A {@link Selected} exercise with its full prescription resolved. */
export type PlannedItem = {
  exercise: Exercise
  holdS: null | number
  note: NoteKind | null
  reps: null | number
  restS: number
  role: Role
  sets: number
  startWeightKg: null | number
}

/**
 * The engine's precomputed working context — everything selection and
 * prescription read, derived once from the {@link PlanInput}.
 */
export type EngineContext = {
  capabilities: Capabilities
  experience: Experience
  gear: Gear
  goal: GoalPrimary
  /** Numeric experience level for `level_min` gating (new=0/returning=1/regular=2). */
  level: number
  restrictions: Restrictions
  sex: Sex
}
