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

const COMPOUND_REST_S: Record<GoalPrimary, number> = {
  fat_loss: 120,
  health: 120,
  hypertrophy: 120,
  strength: 180,
}

const ISOLATION_REPS = 12
const ISOLATION_REST_S = 90
const CORE_HOLD_S = 40
const CORE_REST_S = 45
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
    return CORE_REST_S
  }
  if (role === 'compound') {
    return COMPOUND_REST_S[goal]
  }
  return ISOLATION_REST_S
}

/**
 * Assign sets, reps/hold, rest and starting weight to one selected exercise
 * (spec hard rules 6, 8, 10). Holds carry `holdS`; everything else carries
 * `reps`.
 */
const prescribeOne = (
  selected: Selected,
  ctx: EngineContext,
  equipment: Equipment,
): PlannedItem => {
  const { exercise, note, role } = selected
  return {
    exercise,
    holdS: exercise.isHold ? CORE_HOLD_S : null,
    note,
    reps: exercise.isHold ? null : repsFor(exercise, role, ctx.goal),
    restS: restFor(role, ctx.goal),
    role,
    sets: DEFAULT_SETS,
    startWeightKg: startWeight(exercise, equipment, ctx),
  }
}

/** Prescribe every selected exercise in order. */
export const prescribeAll = (
  selection: readonly Selected[],
  ctx: EngineContext,
  equipment: Equipment,
): PlannedItem[] =>
  selection.map((selected) => prescribeOne(selected, ctx, equipment))
