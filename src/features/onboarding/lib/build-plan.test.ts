import { describe, expect, it } from 'vitest'
import { buildPlan } from '@/features/onboarding/lib/build-plan'
import {
  gearFrom,
  getExercise,
  isFeasible,
} from '@/features/onboarding/lib/catalog'
import type { PlanInput } from '@/features/onboarding/types'
import type { Equipment } from '@/types/equipment'
import type { ExercisePattern } from '@/types/exercise'
import type { Plan } from '@/types/plan'

const DUMBBELLS_2_24 = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]
const WHY_MAX_CHARS = 200

const emptyEquipment = (): Equipment => ({
  ab_wheel: false,
  bands: { available: false, levels: [] },
  barbell: { available: false, weightsKg: [] },
  bench: false,
  dumbbells: { available: false, perHand: true, weightsKg: [] },
  kettlebell: { available: false, weightsKg: [] },
  pullup_bar: false,
})

const baseInput = (overrides: Partial<PlanInput>): PlanInput => ({
  capabilities: { pullupsNow: 'unknown', pushupsNow: 'unknown' },
  equipment: emptyEquipment(),
  experience: 'new',
  goalPrimary: 'hypertrophy',
  restrictions: { back: false, knee: false, shoulder: false },
  sex: 'male',
  time: { daysPerWeekAvailable: 3, minutesPerSession: 45 },
  ...overrides,
})

const hasPattern = (plan: Plan, pattern: ExercisePattern): boolean =>
  plan.plan.some((entry) => getExercise(entry.exercise_id)?.pattern === pattern)

const hasLegDay = (plan: Plan): boolean =>
  hasPattern(plan, 'squat') || hasPattern(plan, 'lunge')

const totalSets = (plan: Plan): number =>
  plan.plan.reduce((sum, entry) => sum + entry.sets, 0)

/** Shared invariants every generated plan must uphold. */
const expectSoundPlan = (plan: Plan, input: PlanInput): void => {
  const gear = gearFrom(input.equipment)
  expect(plan.plan.length).toBeGreaterThan(0)
  for (const entry of plan.plan) {
    const catalogExercise = getExercise(entry.exercise_id)
    expect(catalogExercise).toBeDefined()
    if (!catalogExercise) {
      continue
    }
    // Feasibility (hard rule 1): only gear the user owns.
    expect(isFeasible(catalogExercise, gear)).toBe(true)
    // Weights (hard rule 2): external → real listed weight; else null.
    if (catalogExercise.loadType === 'external') {
      expect(entry.start_weight_kg).not.toBeNull()
    } else {
      expect(entry.start_weight_kg).toBeNull()
    }
    // reps XOR hold, and a personal, bounded why.
    expect(entry.reps === null).toBe(entry.hold_s !== null)
    expect(entry.why_this_for_you_cs.length).toBeGreaterThan(0)
    expect(entry.why_this_for_you_cs.length).toBeLessThanOrEqual(WHY_MAX_CHARS)
    expect(entry.sets).toBeGreaterThanOrEqual(2)
    expect(entry.sets).toBeLessThanOrEqual(4)
  }
}

describe('buildPlan — persona 1 (Petr, regular, full gear, 4+ pull-ups)', () => {
  const input = baseInput({
    capabilities: { pullupsNow: '4+', pushupsNow: '16+' },
    equipment: {
      ...emptyEquipment(),
      bench: true,
      dumbbells: { available: true, perHand: true, weightsKg: DUMBBELLS_2_24 },
      pullup_bar: true,
    },
    experience: 'regular',
    sex: 'male',
    time: { daysPerWeekAvailable: 3, minutesPerSession: 45 },
  })
  const plan = buildPlan(input)

  it('is sound and honours the time budget', () => {
    expectSoundPlan(plan, input)
    expect(plan.meta.session_time_est_min).toBeLessThanOrEqual(45)
    expect(plan.meta.frequency_per_week).toBe(3)
    expect(plan.meta.goal_primary).toBe('hypertrophy')
  })

  it('covers every movement pattern', () => {
    expect(hasLegDay(plan)).toBe(true)
    expect(hasPattern(plan, 'hinge')).toBe(true)
    expect(hasPattern(plan, 'push_h')).toBe(true)
    expect(hasPattern(plan, 'pull_h')).toBe(true)
    expect(hasPattern(plan, 'push_v')).toBe(true)
    expect(hasPattern(plan, 'pull_v')).toBe(true)
    expect(hasPattern(plan, 'core')).toBe(true)
  })

  it('picks the full pull-up for a 4+ capability', () => {
    const pullV = plan.plan.find(
      (entry) => getExercise(entry.exercise_id)?.pattern === 'pull_v',
    )
    expect(pullV?.exercise_id).toBe('pullup')
  })

  it('snaps external weights onto the owned dumbbell set', () => {
    for (const entry of plan.plan) {
      if (entry.start_weight_kg !== null) {
        expect(DUMBBELLS_2_24).toContain(entry.start_weight_kg)
      }
    }
  })
})

describe('buildPlan — persona 2 (pull-up bar + bands, 0 pull-ups, new)', () => {
  const input = baseInput({
    capabilities: { pullupsNow: '0', pushupsNow: 'unknown' },
    equipment: {
      ...emptyEquipment(),
      bands: { available: true, levels: ['light', 'medium'] },
      pullup_bar: true,
    },
    experience: 'new',
    time: { daysPerWeekAvailable: 3, minutesPerSession: 40 },
  })
  const plan = buildPlan(input)

  it('is sound and fits the budget', () => {
    expectSoundPlan(plan, input)
    expect(plan.meta.session_time_est_min).toBeLessThanOrEqual(40)
  })

  it('scales the vertical pull to band-assisted with a note and 5–8 reps', () => {
    const pullV = plan.plan.find(
      (entry) => getExercise(entry.exercise_id)?.pattern === 'pull_v',
    )
    expect(pullV?.exercise_id).toBe('band_assisted_pullup')
    expect(pullV?.scaling_note_cs).not.toBeNull()
    expect(pullV?.reps).toBeGreaterThanOrEqual(5)
    expect(pullV?.reps).toBeLessThanOrEqual(8)
  })

  it('still covers the pushing and pulling patterns with bands/bodyweight', () => {
    expect(hasLegDay(plan)).toBe(true)
    expect(hasPattern(plan, 'push_h')).toBe(true)
    expect(hasPattern(plan, 'pull_h')).toBe(true)
    expect(hasPattern(plan, 'core')).toBe(true)
  })
})

describe('buildPlan — persona 3 (25 min, 2×/week, dumbbells only)', () => {
  const dumbbellsOnly = {
    ...emptyEquipment(),
    dumbbells: { available: true, perHand: true, weightsKg: DUMBBELLS_2_24 },
  }
  const tightInput = baseInput({
    equipment: dumbbellsOnly,
    experience: 'returning',
    time: { daysPerWeekAvailable: 2, minutesPerSession: 25 },
  })
  const roomyInput = baseInput({
    equipment: dumbbellsOnly,
    experience: 'returning',
    time: { daysPerWeekAvailable: 2, minutesPerSession: 60 },
  })
  const tight = buildPlan(tightInput)
  const roomy = buildPlan(roomyInput)

  it('is feasible and capped by the tight time budget', () => {
    expectSoundPlan(tight, tightInput)
    expect(tight.plan.length).toBeLessThanOrEqual(6)
    expect(tight.meta.frequency_per_week).toBe(2)
  })

  it('trims volume relative to the same profile with more time', () => {
    expect(totalSets(tight)).toBeLessThan(totalSets(roomy))
    expect(tight.meta.session_time_est_min).toBeLessThan(
      roomy.meta.session_time_est_min,
    )
  })
})

describe('buildPlan — persona 5 (knee restriction, returning)', () => {
  const input = baseInput({
    equipment: {
      ...emptyEquipment(),
      bench: true,
      dumbbells: { available: true, perHand: true, weightsKg: DUMBBELLS_2_24 },
    },
    experience: 'returning',
    restrictions: { back: false, knee: true, shoulder: false },
  })
  const plan = buildPlan(input)

  it('is sound and flags the knee constraint', () => {
    expectSoundPlan(plan, input)
    expect(plan.meta.detected_constraints).toContain('knee')
  })

  it('avoids deep lunges (no Bulgarian split squat)', () => {
    const ids = plan.plan.map((entry) => entry.exercise_id)
    expect(ids).not.toContain('bulgarian_split_squat')
  })
})

describe('buildPlan — persona 6 (shoulder restriction)', () => {
  const input = baseInput({
    equipment: {
      ...emptyEquipment(),
      bench: true,
      dumbbells: { available: true, perHand: true, weightsKg: DUMBBELLS_2_24 },
      pullup_bar: true,
    },
    experience: 'returning',
    restrictions: { back: false, knee: false, shoulder: true },
  })
  const plan = buildPlan(input)

  it('is sound and flags the shoulder constraint', () => {
    expectSoundPlan(plan, input)
    expect(plan.meta.detected_constraints).toContain('shoulder')
  })

  it('excludes vertical pressing and keeps horizontal push coverage', () => {
    expect(plan.meta.excluded_patterns).toContain('push_v')
    expect(hasPattern(plan, 'push_v')).toBe(false)
    expect(hasPattern(plan, 'push_h')).toBe(true)
  })
})
