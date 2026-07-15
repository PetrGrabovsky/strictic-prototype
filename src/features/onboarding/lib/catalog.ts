import { EXERCISES } from '@/data/exercises'
import type { Equipment, Gear } from '@/types/equipment'
import type { Exercise, ExerciseId } from '@/types/exercise'

const CATALOG: ReadonlyMap<ExerciseId, Exercise> = new Map(
  EXERCISES.map((exercise) => [exercise.id, exercise]),
)

/** Look up a catalog exercise by id (undefined if the id is unknown). */
export const getExercise = (id: ExerciseId): Exercise | undefined =>
  CATALOG.get(id)

/**
 * Flatten the stored {@link Equipment} into the "do they own X?" view the
 * catalog matcher needs (spec §2 → §3.1 equipment alternatives).
 */
export const gearFrom = (equipment: Equipment): Gear => ({
  ab_wheel: equipment.ab_wheel,
  bands: equipment.bands.available,
  barbell: equipment.barbell.available,
  bench: equipment.bench,
  dumbbells: equipment.dumbbells.available,
  kettlebell: equipment.kettlebell.available,
  pullup_bar: equipment.pullup_bar,
})

/**
 * Feasibility (spec hard rule 1): an exercise is usable when it needs no
 * equipment, or at least one of its alternatives is fully owned (OR across
 * alternatives, AND within one).
 */
export const isFeasible = (exercise: Exercise, gear: Gear): boolean =>
  exercise.equipment.length === 0 ||
  exercise.equipment.some((alternative) =>
    alternative.every((item) => gear[item]),
  )
