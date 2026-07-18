import { getExercise } from '@/features/onboarding/lib/catalog'
import type { PlannedItem } from '@/features/onboarding/lib/engine-types'
import type { ExercisePattern } from '@/types/exercise'
import type { PlanExercise } from '@/types/plan'

const WARMUP_MINUTES = 6
const PER_EXERCISE_MINUTES_FACTOR = 0.75
const SECONDS_PER_MINUTE = 60
const DEFAULT_WORK_SECONDS = 40

const ISOLATION_TRIM_REST_SECONDS = 60
const MIN_ACCESSORY_SETS = 2
const MIN_COMPOUND_REST_SECONDS = 90
const UNRANKED = 99

/**
 * The engine's hard floor on working sets: neither the time-budget trim nor
 * the light-day variant ever programs fewer than two working sets of a
 * movement (spec §7). Exported so both levers share one floor and can't drift.
 */
export const MIN_WORKING_SETS = 2

/** Accessory drop order — lowest value first (spec §7 trim ladder). */
const TRIM_RANK: Partial<Record<ExercisePattern, number>> = {
  iso_biceps: 4,
  iso_calves: 0,
  iso_rear_delt: 1,
  iso_side_delt: 5,
  iso_triceps: 2,
  lunge: 3,
}

/** Coverage compounds droppable only under extreme time pressure (spec §7). */
const OPTIONAL_COMPOUND_PATTERNS: ReadonlySet<ExercisePattern> = new Set([
  'push_v',
  'pull_v',
])

const minutesFrom = (count: number, workingSeconds: number): number =>
  WARMUP_MINUTES +
  Math.round(PER_EXERCISE_MINUTES_FACTOR * count) +
  Math.ceil(workingSeconds / SECONDS_PER_MINUTE)

/** Session time estimate (spec hard rule 7 formula) for planned items. */
export const estimateMinutes = (items: readonly PlannedItem[]): number => {
  let working = 0
  for (const item of items) {
    working += item.sets * (item.exercise.secondsPerSetEst + item.restSeconds)
  }
  return minutesFrom(items.length, working)
}

/** Same formula, applied to an already-built {@link PlanExercise} list. */
export const estimateMinutesFromPlan = (
  exercises: readonly PlanExercise[],
): number => {
  let working = 0
  for (const exercise of exercises) {
    const workSeconds =
      getExercise(exercise.exercise_id)?.secondsPerSetEst ??
      DEFAULT_WORK_SECONDS
    working += exercise.sets * (workSeconds + exercise.rest_s)
  }
  return minutesFrom(exercises.length, working)
}

const lowerIsolationRest = (items: readonly PlannedItem[]): PlannedItem[] =>
  items.map((item) =>
    item.role === 'accessory' && item.restSeconds > ISOLATION_TRIM_REST_SECONDS
      ? { ...item, restSeconds: ISOLATION_TRIM_REST_SECONDS }
      : item,
  )

const lowerAccessorySets = (items: readonly PlannedItem[]): PlannedItem[] =>
  items.map((item) =>
    item.role === 'accessory' && item.sets > MIN_ACCESSORY_SETS
      ? { ...item, sets: MIN_ACCESSORY_SETS }
      : item,
  )

const lowerCompoundRest = (items: readonly PlannedItem[]): PlannedItem[] =>
  items.map((item) =>
    item.role === 'compound' && item.restSeconds > MIN_COMPOUND_REST_SECONDS
      ? { ...item, restSeconds: MIN_COMPOUND_REST_SECONDS }
      : item,
  )

const lowerAllSets = (items: readonly PlannedItem[]): PlannedItem[] =>
  items.map((item) =>
    item.sets > MIN_WORKING_SETS ? { ...item, sets: MIN_WORKING_SETS } : item,
  )

const lowestValueAccessoryIndex = (items: readonly PlannedItem[]): number => {
  let bestIndex = -1
  let bestRank = UNRANKED + 1
  for (const [index, item] of items.entries()) {
    if (item.role !== 'accessory') {
      continue
    }
    const rank = TRIM_RANK[item.exercise.pattern] ?? UNRANKED
    if (rank < bestRank) {
      bestRank = rank
      bestIndex = index
    }
  }
  return bestIndex
}

const dropWhileOver = (
  items: readonly PlannedItem[],
  budgetMinutes: number,
  pickIndex: (items: readonly PlannedItem[]) => number,
): readonly PlannedItem[] => {
  let current: readonly PlannedItem[] = items
  while (estimateMinutes(current) > budgetMinutes) {
    const index = pickIndex(current)
    if (index === -1) {
      break
    }
    current = current.filter((_item, position) => position !== index)
  }
  return current
}

const optionalCompoundIndex = (items: readonly PlannedItem[]): number =>
  items.findIndex(
    (item) =>
      item.role === 'compound' &&
      OPTIONAL_COMPOUND_PATTERNS.has(item.exercise.pattern),
  )

/**
 * Fit the plan into the time budget (spec hard rule 7 trim ladder): isolation
 * rest → accessory sets → drop accessories → compound rest floor → all sets →
 * drop the optional vertical compounds. The four core coverage patterns and
 * the core exercise are never dropped, so at sub-realistic budgets the honest
 * estimate can still exceed the target rather than gut the workout.
 */
export const fitToBudget = (
  items: readonly PlannedItem[],
  budgetMinutes: number,
): readonly PlannedItem[] => {
  let current: readonly PlannedItem[] = items
  if (estimateMinutes(current) <= budgetMinutes) {
    return current
  }
  current = lowerIsolationRest(current)
  if (estimateMinutes(current) <= budgetMinutes) {
    return current
  }
  current = lowerAccessorySets(current)
  current = dropWhileOver(current, budgetMinutes, lowestValueAccessoryIndex)
  if (estimateMinutes(current) <= budgetMinutes) {
    return current
  }
  current = lowerCompoundRest(current)
  current = lowerAllSets(current)
  return dropWhileOver(current, budgetMinutes, optionalCompoundIndex)
}
