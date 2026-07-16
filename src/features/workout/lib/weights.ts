import { gearFrom } from '@/features/onboarding/lib/catalog'
import { implementWeights } from '@/features/onboarding/lib/start-weight'
import type { Equipment } from '@/types/equipment'
import type { Exercise } from '@/types/exercise'

/** Below this gap two weights count as the same dialed value (float slop). */
const WEIGHT_EPSILON = 1e-9

/**
 * The user's usable loading weights for one exercise, ascending. Reuses the
 * engine's implement-matching (the first fully-owned alternative decides the
 * implement) so the workout dials the exact plates onboarding rounded against.
 * Empty when the movement is bodyweight or band — nothing to dial.
 */
export const availableWeights = (
  exercise: Exercise,
  equipment: Equipment,
): readonly number[] => {
  const owned = implementWeights(exercise, equipment, gearFrom(equipment))
  return owned === null ? [] : owned.toSorted((a, b) => a - b)
}

/** Snap a free-typed weight to the nearest weight the user actually owns. */
export const snapWeight = (
  weights: readonly number[],
  value: number,
): number => {
  if (weights.length === 0) {
    return value
  }
  let best = weights[0]
  for (const weight of weights) {
    if (Math.abs(weight - value) < Math.abs(best - value)) {
      best = weight
    }
  }
  return best
}

/**
 * Step to the adjacent owned weight in `direction` (−1/+1). Falls back to a
 * 1 kg nudge when the user owns no weight list (shouldn't happen for a loaded
 * exercise, but keeps the stepper honest rather than crashing).
 */
export const stepWeight = (
  weights: readonly number[],
  current: number,
  direction: -1 | 1,
): number => {
  if (weights.length === 0) {
    return Math.max(0, current + direction)
  }
  const snapped = snapWeight(weights, current)
  const nextIndex = weights.indexOf(snapped) + direction
  if (nextIndex < 0 || nextIndex >= weights.length) {
    return snapped
  }
  return weights[nextIndex]
}

/** The next owned weight strictly above `current`, or null at the ceiling. */
export const nextWeightUp = (
  weights: readonly number[],
  current: number,
): null | number => {
  for (const weight of weights) {
    if (weight > current + WEIGHT_EPSILON) {
      return weight
    }
  }
  return null
}
