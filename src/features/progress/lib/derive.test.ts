import { describe, expect, it } from 'vitest'
import { deriveProgress } from '@/features/progress/lib/derive'
import type { ExerciseId } from '@/types/exercise'
import type { ExerciseResult, WorkoutRecord } from '@/types/workout'

const DAY_MS = 86_400_000
/** A fixed clock so every time-window assertion is deterministic. */
const NOW = Date.UTC(2026, 6, 16)

const result = (w: number, r: number, e1: number): ExerciseResult => ({
  e1,
  r,
  w,
})

const record = (
  daysAgo: number,
  ex: Record<string, ExerciseResult>,
  volume = 1000,
): WorkoutRecord => ({
  date: NOW - daysAgo * DAY_MS,
  dur: 3000,
  ex,
  volume,
})

describe('deriveProgress — per-exercise', () => {
  it('marks a single record as a start state without dividing by zero', () => {
    const history = [record(0, { goblet_squat: result(20, 10, 26) })]
    const { exercises } = deriveProgress(['goblet_squat'], history, NOW)

    expect(exercises).toHaveLength(1)
    const [only] = exercises
    expect(only.trend).toBe('start')
    expect(only.weightGainPercent).toBe(0)
    expect(only.strengthGainPercent).toBe(0)
    expect(only.first).toEqual(only.last)
    expect(only.series).toHaveLength(1)
  })

  it('computes an upward working-weight delta across sessions', () => {
    const history = [
      record(14, { goblet_squat: result(20, 10, 26) }),
      record(0, { goblet_squat: result(24, 10, 32) }),
    ]
    const [only] = deriveProgress(['goblet_squat'], history, NOW).exercises

    expect(only.trend).toBe('up')
    expect(only.weightGainPercent).toBe(20) // 20 → 24 kg
    expect(only.first.weightKg).toBe(20)
    expect(only.last.weightKg).toBe(24)
  })

  it('exposes the global weight delta and session-level domain', () => {
    // The 28 kg peak sits mid-series: the domain must catch it, the delta
    // stays first→last regardless.
    const history = [
      record(28, { goblet_squat: result(20, 10, 26) }),
      record(14, { goblet_squat: result(28, 8, 35) }),
      record(0, { goblet_squat: result(24, 10, 32) }),
    ]
    const [only] = deriveProgress(['goblet_squat'], history, NOW).exercises

    expect(only.weightDeltaKg).toBe(4)
    expect(only.weightDomain).toEqual({ max: 28, min: 20 })
  })

  it('folds each exercise into max buckets with a single record star', () => {
    // The 28 kg peak sits mid-series, so it — not the newest bar — is the ★.
    const history = [
      record(28, { goblet_squat: result(20, 10, 26) }),
      record(14, { goblet_squat: result(28, 8, 35) }),
      record(0, { goblet_squat: result(24, 10, 32) }),
    ]
    const [only] = deriveProgress(['goblet_squat'], history, NOW).exercises

    // At most 20 sessions render one bar each, folded by max weight (1:1 here).
    expect(only.weightBuckets.granularity).toBe('session')
    expect(only.weightBuckets.buckets.map((bucket) => bucket.value)).toEqual([
      20, 28, 24,
    ])
    const starred = only.weightBuckets.buckets.filter((bucket) => bucket.isPr)
    expect(starred.map((bucket) => bucket.value)).toEqual([28])
  })

  it('flags a drop and a hold distinctly', () => {
    const down = [
      record(7, { db_ohp: result(16, 10, 21) }),
      record(0, { db_ohp: result(14, 10, 18) }),
    ]
    const flat = [
      record(7, { db_ohp: result(16, 10, 21) }),
      record(0, { db_ohp: result(16, 10, 21) }),
    ]
    expect(deriveProgress(['db_ohp'], down, NOW).exercises[0].trend).toBe(
      'down',
    )
    expect(deriveProgress(['db_ohp'], flat, NOW).exercises[0].trend).toBe(
      'flat',
    )
  })

  it('sorts the biggest gainer first and skips exercises with no history', () => {
    const history = [
      record(14, {
        goblet_squat: result(20, 10, 26),
        db_ohp: result(12, 10, 16),
      }),
      record(0, {
        goblet_squat: result(22, 10, 29),
        db_ohp: result(16, 10, 21),
      }),
    ]
    const ids: ExerciseId[] = ['goblet_squat', 'db_ohp', 'pushup']
    const { exercises } = deriveProgress(ids, history, NOW)

    expect(exercises.map((entry) => entry.id)).toEqual([
      'db_ohp',
      'goblet_squat',
    ])
  })
})

describe('deriveProgress — overview', () => {
  it('keeps volume in chronological order and totals it', () => {
    const history = [
      record(14, { goblet_squat: result(20, 10, 26) }, 800),
      record(0, { goblet_squat: result(24, 10, 32) }, 1200),
    ]
    const data = deriveProgress(['goblet_squat'], history, NOW)

    expect(data.volumeBuckets.granularity).toBe('session')
    expect(data.volumeBuckets.buckets.map((bucket) => bucket.value)).toEqual([
      800, 1200,
    ])
    expect(data.totalVolumeKg).toBe(2000)
    expect(data.weeksSpan).toBe(2)
    expect(data.sessionCount).toBe(2)
  })

  it('counts only sessions inside the 30-day window', () => {
    const history = [
      record(40, { goblet_squat: result(20, 10, 26) }),
      record(10, { goblet_squat: result(22, 10, 29) }),
      record(1, { goblet_squat: result(24, 10, 32) }),
    ]
    expect(deriveProgress(['goblet_squat'], history, NOW).sessionsLast30).toBe(
      2,
    )
  })

  it('lights the current week dot for a session logged today', () => {
    const data = deriveProgress(
      ['goblet_squat'],
      [record(0, { goblet_squat: result(20, 10, 26) })],
      NOW,
    )
    expect(data.weekDots).toHaveLength(10)
    expect(data.weekDots.at(-1)?.active).toBe(true)
    expect(data.weekDots.filter((dot) => dot.active)).toHaveLength(1)
  })

  it('reads a strong recent rhythm', () => {
    // History is stored oldest-first, so the newest session lands last.
    const history = Array.from({ length: 8 }, (_, index) =>
      record((7 - index) * 3, { goblet_squat: result(20, 10, 26) }),
    )
    expect(deriveProgress(['goblet_squat'], history, NOW).consistency).toBe(
      'strong',
    )
  })

  it('reads a long absence as a gap regardless of past volume', () => {
    const history = [record(20, { goblet_squat: result(20, 10, 26) })]
    expect(deriveProgress(['goblet_squat'], history, NOW).consistency).toBe(
      'gap',
    )
  })

  it('handles empty history without throwing', () => {
    const data = deriveProgress([], [], NOW)
    expect(data.exercises).toEqual([])
    expect(data.totalVolumeKg).toBe(0)
    expect(data.weeksSpan).toBe(0)
  })
})
