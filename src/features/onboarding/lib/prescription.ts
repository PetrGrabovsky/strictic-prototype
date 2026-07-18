import type {
  EngineContext,
  PlannedItem,
  Role,
  Selected,
} from '@/features/onboarding/lib/engine-types'
import { startWeight } from '@/features/onboarding/lib/start-weight'
import type { Equipment } from '@/types/equipment'
import type { Exercise, ExerciseId } from '@/types/exercise'
import type { GoalPrimary } from '@/types/plan'

const DEFAULT_SETS = 3

const COMPOUND_REPS: Record<GoalPrimary, number> = {
  fat_loss: 10,
  health: 10,
  hypertrophy: 10,
  strength: 5,
}

const COMPOUND_REST_SECONDS: Record<GoalPrimary, number> = {
  fat_loss: 120,
  health: 120,
  hypertrophy: 120,
  strength: 180,
}

const ISOLATION_REPS = 12
const ISOLATION_REST_SECONDS = 90
const CORE_HOLD_SECONDS = 40
const CORE_REST_SECONDS = 45
const DEFAULT_BODYWEIGHT_REPS = 10

/** Bodyweight rep targets tied to capability, never a generic 12 (spec §8). */
const BODYWEIGHT_REPS: Partial<Record<ExerciseId, number>> = {
  ab_rollout: 10,
  air_squat: 15,
  band_assisted_pullup: 6,
  chinup: 8,
  deadbug: 10,
  decline_pushup: 10,
  diamond_pushup: 12,
  glute_bridge_bw: 15,
  incline_pushup: 10,
  negative_pullup: 6,
  pike_pushup: 10,
  pullup: 8,
  pushup: 12,
}

const nonBodyweightReps = (role: Role, goal: GoalPrimary): number =>
  role === 'compound' ? COMPOUND_REPS[goal] : ISOLATION_REPS

const repsFor = (exercise: Exercise, role: Role, goal: GoalPrimary): number =>
  exercise.loadType === 'bodyweight'
    ? (BODYWEIGHT_REPS[exercise.id] ?? DEFAULT_BODYWEIGHT_REPS)
    : nonBodyweightReps(role, goal)

const restFor = (role: Role, goal: GoalPrimary): number => {
  if (role === 'core') {
    return CORE_REST_SECONDS
  }
  if (role === 'compound') {
    return COMPOUND_REST_SECONDS[goal]
  }
  return ISOLATION_REST_SECONDS
}

/**
 * Assign sets, reps/hold, rest and starting weight to one selected exercise
 * (spec hard rules 6, 8, 10). Holds carry `holdSeconds`; everything else carries
 * `reps`.
 */
const prescribeOne = (
  selected: Selected,
  context: EngineContext,
  equipment: Equipment,
): PlannedItem => {
  const { exercise, note, role } = selected
  return {
    exercise,
    holdSeconds: exercise.isHold ? CORE_HOLD_SECONDS : null,
    note,
    reps: exercise.isHold ? null : repsFor(exercise, role, context.goal),
    restSeconds: restFor(role, context.goal),
    role,
    sets: DEFAULT_SETS,
    startWeightKg: startWeight(exercise, equipment, context),
  }
}

/** Prescribe every selected exercise in order. */
export const prescribeAll = (
  selection: readonly Selected[],
  context: EngineContext,
  equipment: Equipment,
): PlannedItem[] =>
  selection.map((selected) => prescribeOne(selected, context, equipment))
