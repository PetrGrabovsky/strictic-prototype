import { describe, expect, it } from 'vitest'
import { buildPlan } from '@/features/onboarding/lib/build-plan'
import {
  isDeloadSession,
  lighterPlan,
} from '@/features/onboarding/lib/lighter-plan'
import type { PlanInput } from '@/features/onboarding/types'

const DUMBBELLS_2_24 = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]

const input: PlanInput = {
  capabilities: { pullupsNow: '4+', pushupsNow: '16+' },
  equipment: {
    ab_wheel: false,
    bands: { available: false, levels: [] },
    barbell: { available: false, weightsKg: [] },
    bench: true,
    dumbbells: { available: true, perHand: true, weightsKg: DUMBBELLS_2_24 },
    kettlebell: { available: false, weightsKg: [] },
    pullup_bar: true,
  },
  experience: 'regular',
  goalPrimary: 'hypertrophy',
  restrictions: { back: false, knee: false, shoulder: false },
  sex: 'male',
  time: { daysPerWeekAvailable: 3, minutesPerSession: 60 },
}

describe('lighterPlan', () => {
  const plan = buildPlan(input)
  const lighter = lighterPlan(plan)

  it('keeps the same exercises in the same order', () => {
    expect(lighter.plan.map((entry) => entry.exercise_id)).toEqual(
      plan.plan.map((entry) => entry.exercise_id),
    )
  })

  it('drops one set per exercise but never below two', () => {
    for (const [index, entry] of lighter.plan.entries()) {
      const original = plan.plan[index]
      expect(entry.sets).toBeLessThanOrEqual(original.sets)
      expect(entry.sets).toBeGreaterThanOrEqual(2)
      expect(entry.sets).toBe(Math.max(2, original.sets - 1))
    }
  })

  it('recomputes a shorter or equal session time', () => {
    expect(lighter.meta.session_time_est_min).toBeLessThanOrEqual(
      plan.meta.session_time_est_min,
    )
  })
})

describe('isDeloadSession', () => {
  it('deloads the last session of each 3×/week microcycle', () => {
    const deload = [0, 1, 2, 3, 4, 5].map((done) => isDeloadSession(done, 3))
    expect(deload).toEqual([false, false, true, false, false, true])
  })

  it('deloads every other session at 2×/week', () => {
    const deload = [0, 1, 2, 3].map((done) => isDeloadSession(done, 2))
    expect(deload).toEqual([false, true, false, true])
  })

  it('never deloads a once-a-week plan', () => {
    expect([0, 1, 2].map((done) => isDeloadSession(done, 1))).toEqual([
      false,
      false,
      false,
    ])
  })
})
