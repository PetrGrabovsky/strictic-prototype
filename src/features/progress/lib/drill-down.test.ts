import { describe, expect, it } from 'vitest'
import { bucketSeries } from '@/features/progress/lib/bucket-series'
import type { SeriesPoint } from '@/features/progress/lib/bucket-series'
import { drillIntoBucket } from '@/features/progress/lib/drill-down'

/** Local-time noon — timezone-stable and DST-proof for bucket boundaries. */
const on = (year: number, month: number, day: number): number =>
  new Date(year, month - 1, day, 12).getTime()

/** Index of the session carrying the all-time best value (30 March). */
const RECORD_INDEX = 12

/**
 * 22 weekly sessions: January through March, then all of April skipped, then
 * May and June. Past the overview cap, so this folds into month buckets — the
 * only shape a drill-down ever sees.
 */
const sessions: SeriesPoint[] = [
  ...Array.from({ length: 13 }, (_, week) => on(2026, 1, 5 + week * 7)),
  ...Array.from({ length: 9 }, (_, week) => on(2026, 5, 4 + week * 7)),
].map((date, index) => ({
  date,
  value: index === RECORD_INDEX ? 100 : 40 + index,
}))

const { buckets } = bucketSeries(sessions, 'max', on(2026, 6, 30))

/** Month buckets in order: January, February, March, April, May, June. */
const keyOfMonth = (month: number): string => buckets[month - 1].key

describe('drillIntoBucket', () => {
  it('unfolds a bucket into the sessions it holds, and no others', () => {
    const detail = drillIntoBucket(sessions, buckets, keyOfMonth(3))

    expect(detail?.sessions.map((session) => session.value)).toEqual([
      48, 49, 50, 51, 100,
    ])
  })

  it('stars the all-time best only in the bucket that holds it', () => {
    const march = drillIntoBucket(sessions, buckets, keyOfMonth(3))
    const may = drillIntoBucket(sessions, buckets, keyOfMonth(5))

    expect(march?.sessions.filter((session) => session.isPr)).toHaveLength(1)
    expect(march?.sessions.at(-1)?.isPr).toBe(true)
    // The record is a property of the whole journey, not of the open window:
    // a month with no all-time best gets no ★ at all.
    expect(may?.sessions.some((session) => session.isPr)).toBe(false)
  })

  it('steps over a skipped period instead of into it', () => {
    const march = drillIntoBucket(sessions, buckets, keyOfMonth(3))

    // April holds nothing, so `›` jumps straight to May.
    expect(march?.nextKey).toBe(keyOfMonth(5))
    expect(march?.previousKey).toBe(keyOfMonth(2))
  })

  it('reports the ends of the journey as nowhere left to step', () => {
    const january = drillIntoBucket(sessions, buckets, keyOfMonth(1))
    const june = drillIntoBucket(sessions, buckets, keyOfMonth(6))

    expect(january?.previousKey).toBeNull()
    expect(june?.nextKey).toBeNull()
  })

  it('refuses a skipped period and an unknown key alike', () => {
    expect(drillIntoBucket(sessions, buckets, keyOfMonth(4))).toBeNull()
    expect(drillIntoBucket(sessions, buckets, 'not-a-bucket')).toBeNull()
  })

  it('has nothing to unfold when a bar is already one session', () => {
    const single = sessions.slice(0, 3)
    const perSession = bucketSeries(single, 'max', on(2026, 1, 20))

    expect(perSession.granularity).toBe('session')
    expect(
      drillIntoBucket(single, perSession.buckets, perSession.buckets[0].key),
    ).toBeNull()
  })
})
