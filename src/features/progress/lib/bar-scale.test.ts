import { describe, expect, it } from 'vitest'
import { createBarScale } from '@/features/progress/lib/bar-scale'

describe('createBarScale', () => {
  it('puts a lone bar at mid height', () => {
    const scale = createBarScale([50])

    expect(scale(50)).toBe(0.62)
  })

  it('scales the smallest value to the base and the largest to full', () => {
    const scale = createBarScale([10, 20, 30])

    expect(scale(10)).toBe(0.3)
    expect(scale(20)).toBeCloseTo(0.65)
    expect(scale(30)).toBe(1)
  })

  it('renders a flat series at the base height', () => {
    const scale = createBarScale([25, 25, 25])

    expect(scale(25)).toBe(0.3)
  })
})
