import type { EngineContext } from '@/features/onboarding/lib/engine-types'
import type { Experience } from '@/features/onboarding/types'
import type { Equipment, EquipmentId, Gear } from '@/types/equipment'
import type { Exercise, ExerciseId } from '@/types/exercise'

type Anchor = { female: number; male: number }

/** The three weight-bearing implements a starting load can be rounded to. */
type LoadableImplement = 'barbell' | 'dumbbells' | 'kettlebell'

/** Named anchor groups so several exercises can share one starting weight. */
type AnchorGroup =
  | 'bar_curl'
  | 'bar_hinge'
  | 'bar_press'
  | 'bar_row'
  | 'calf'
  | 'carry'
  | 'curl'
  | 'hinge'
  | 'lateral'
  | 'press_h'
  | 'press_v'
  | 'rear_delt'
  | 'row'
  | 'shrug'
  | 'squat'
  | 'swing'
  | 'triceps'

/**
 * Conservative per-hand starting anchors for experience=new (spec §10). The
 * dumbbell/kettlebell numbers are verbatim from the spec; the four `bar_*`
 * (total-weight) anchors are a documented engine estimate — the spec gives no
 * barbell numbers, only that rounding runs against the total-weight list.
 *
 * TODO(phase-2): revisit the `bar_*` anchors against real barbell numbers
 * once the spec provides them — these are the engine's own guess, not spec.
 */
const ANCHORS: Record<AnchorGroup, Anchor> = {
  bar_curl: { female: 12, male: 20 },
  bar_hinge: { female: 25, male: 40 },
  bar_press: { female: 20, male: 30 },
  bar_row: { female: 20, male: 30 },
  calf: { female: 10, male: 14 },
  carry: { female: 8, male: 12 },
  curl: { female: 5, male: 8 },
  hinge: { female: 8, male: 12 },
  lateral: { female: 3, male: 5 },
  press_h: { female: 6, male: 10 },
  press_v: { female: 5, male: 8 },
  rear_delt: { female: 3, male: 5 },
  row: { female: 8, male: 12 },
  shrug: { female: 10, male: 14 },
  squat: { female: 8, male: 12 },
  swing: { female: 8, male: 16 },
  triceps: { female: 5, male: 8 },
}

const ANCHOR_GROUP: Partial<Record<ExerciseId, AnchorGroup>> = {
  bb_bent_row: 'bar_row',
  bb_curl: 'bar_curl',
  bb_floor_press: 'bar_press',
  bb_rdl: 'bar_hinge',
  bulgarian_split_squat: 'squat',
  chest_supported_row: 'row',
  db_bench_press: 'press_h',
  db_bent_row: 'row',
  db_calf_raise: 'calf',
  db_curl: 'curl',
  db_floor_press: 'press_h',
  db_hammer_curl: 'curl',
  db_lateral_raise: 'lateral',
  db_oh_triceps: 'triceps',
  db_ohp: 'press_v',
  db_rdl: 'hinge',
  db_rear_delt_fly: 'rear_delt',
  db_row_bench: 'row',
  db_shrug: 'shrug',
  db_single_leg_rdl: 'hinge',
  db_split_squat: 'squat',
  goblet_squat: 'squat',
  hip_thrust_db: 'hinge',
  kb_swing: 'swing',
  reverse_lunge_db: 'squat',
  step_up_db: 'squat',
  suitcase_carry: 'carry',
}

/** Experience adds weight steps on top of the new-lifter anchor (spec §10). */
const EXPERIENCE_STEP: Record<Experience, number> = {
  new: 0,
  regular: 2,
  returning: 1,
}

const WEIGHT_SOURCE: Record<
  LoadableImplement,
  (equipment: Equipment) => readonly number[]
> = {
  barbell: (equipment) => equipment.barbell.weightsKg,
  dumbbells: (equipment) => equipment.dumbbells.weightsKg,
  kettlebell: (equipment) => equipment.kettlebell.weightsKg,
}

const isLoadable = (item: EquipmentId): item is LoadableImplement =>
  Object.hasOwn(WEIGHT_SOURCE, item)

/**
 * The user's weight list for the implement this exercise loads. Driven by the
 * exercise's own equipment alternatives (spec §3.1) rather than its id: the
 * first alternative the user fully owns decides the implement — so an exercise
 * offered as dumbbell-or-kettlebell rounds against whichever they actually own.
 */
export const implementWeights = (
  exercise: Exercise,
  equipment: Equipment,
  gear: Gear,
): null | readonly number[] => {
  for (const alternative of exercise.equipment) {
    if (alternative.some((item) => !gear[item])) {
      continue
    }
    const implement = alternative.find(isLoadable)
    if (implement) {
      return WEIGHT_SOURCE[implement](equipment)
    }
  }
  return null
}

/**
 * Conservative starting load (spec hard rule 10): take the new-lifter anchor
 * for the user's sex (unspecified → the lower, female anchor), snap DOWN to
 * the nearest weight they own, then add the experience step. Null for any
 * non-external exercise.
 */
export const startWeight = (
  exercise: Exercise,
  equipment: Equipment,
  context: EngineContext,
): null | number => {
  if (exercise.loadType !== 'external') {
    return null
  }
  const group = ANCHOR_GROUP[exercise.id]
  const owned = implementWeights(exercise, equipment, context.gear)
  if (!group || !owned || owned.length === 0) {
    return null
  }
  const sorted = owned.toSorted((a, b) => a - b)
  const anchor = ANCHORS[group]
  const base = context.sex === 'male' ? anchor.male : anchor.female
  const snappedIndex = sorted.findLastIndex((weight) => weight <= base)
  const startIndex = snappedIndex === -1 ? 0 : snappedIndex
  const index = Math.min(
    startIndex + EXPERIENCE_STEP[context.experience],
    sorted.length - 1,
  )
  return sorted[index]
}
