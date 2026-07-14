import type { EquipmentId } from '@/types/equipment'

/**
 * Movement pattern (spec §3.1). Compound patterns plus `iso_*` slots the
 * compounds miss (side/rear delts, biceps, triceps, traps, calves).
 */
export type ExercisePattern =
  | 'carry'
  | 'core'
  | 'hinge'
  | 'iso_biceps'
  | 'iso_calves'
  | 'iso_rear_delt'
  | 'iso_side_delt'
  | 'iso_traps'
  | 'iso_triceps'
  | 'lunge'
  | 'pull_h'
  | 'pull_v'
  | 'push_h'
  | 'push_v'
  | 'squat'

/** How the exercise is loaded (spec §3.1). */
export type LoadType = 'band' | 'bodyweight' | 'external'

/** Muscle vocabulary used by `primary`/`secondary`. */
export type Muscle =
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'core'
  | 'forearms'
  | 'front_delts'
  | 'glutes'
  | 'hamstrings'
  | 'hip_flexors'
  | 'lats'
  | 'lower_back'
  | 'obliques'
  | 'quads'
  | 'rear_delts'
  | 'side_delts'
  | 'traps'
  | 'triceps'
  | 'upper_back'

/** Every catalog id — constrains `Exercise.id` and the scaling references. */
export type ExerciseId =
  | 'ab_rollout'
  | 'air_squat'
  | 'band_assisted_pullup'
  | 'band_curl'
  | 'band_lateral_raise'
  | 'band_ohp'
  | 'band_pull_apart'
  | 'band_row'
  | 'bb_bent_row'
  | 'bb_curl'
  | 'bb_floor_press'
  | 'bb_rdl'
  | 'bulgarian_split_squat'
  | 'chest_supported_row'
  | 'chinup'
  | 'db_bench_press'
  | 'db_bent_row'
  | 'db_calf_raise'
  | 'db_curl'
  | 'db_floor_press'
  | 'db_hammer_curl'
  | 'db_lateral_raise'
  | 'db_oh_triceps'
  | 'db_ohp'
  | 'db_rdl'
  | 'db_rear_delt_fly'
  | 'db_row_bench'
  | 'db_shrug'
  | 'db_single_leg_rdl'
  | 'db_split_squat'
  | 'deadbug'
  | 'decline_pushup'
  | 'diamond_pushup'
  | 'glute_bridge_bw'
  | 'goblet_squat'
  | 'hip_thrust_db'
  | 'hollow_hold'
  | 'incline_pushup'
  | 'kb_swing'
  | 'negative_pullup'
  | 'pike_pushup'
  | 'plank'
  | 'pullup'
  | 'pushup'
  | 'reverse_lunge_db'
  | 'side_plank'
  | 'step_up_db'
  | 'suitcase_carry'

/**
 * A catalog exercise (spec §3.1 record format). This is versioned reference
 * data in git, not a DB table (ARCHITECTURE §4) — the deterministic engine
 * and the future AI generator only SELECT from it, never write it.
 */
export type Exercise = {
  /**
   * Equipment alternatives: OR between the outer entries, AND within each.
   * An empty list means bodyweight (no equipment required).
   */
  equipment: readonly (readonly EquipmentId[])[]
  /** Stable id; also the key in {@link WorkoutRecord.ex} and progress maps. */
  id: ExerciseId
  /** Measured by time held rather than reps (plank family). */
  isHold: boolean
  /** Minimum experience: 0 new · 1 returning · 2 regular. */
  levelMin: 0 | 1 | 2
  loadType: LoadType
  /** i18n key for the Czech name (`exercises.<id>.name`), never raw text. */
  nameKey: string
  pattern: ExercisePattern
  /** Loaded one implement per hand (per-hand weight) vs. a single implement. */
  perHand: boolean
  primary: readonly Muscle[]
  /** Easier/harder swaps for capability scaling; ids point back into the catalog. */
  scaling: { easier?: ExerciseId; harder?: ExerciseId }
  secondary: readonly Muscle[]
  /** Estimated seconds of pure work for one set (no rest) — feeds time budgeting. */
  secondsPerSetEst: number
  /** Trains one side at a time. */
  unilateral: boolean
}
