import { describe, expect, it } from 'vitest'
import { bucketSeries } from '@/features/progress/lib/bucket-series'

/** Local-time noon — timezone-stable and DST-proof for bucket boundaries. */
const on = (year: number, month: number, day: number): number =>
  new Date(year, month - 1, day, 12).getTime()

const point = (date: number, value: number) => ({ date, value })

describe('bucketSeries — granularity', () => {
  it('keeps one bar per session up to the overview cap', () => {
    const points = [
      point(on(2026, 5, 4), 40),
      point(on(2026, 6, 1), 45),
      point(on(2026, 7, 6), 50),
    ]
    const { buckets, granularity } = bucketSeries(
      points,
      'max',
      on(2026, 7, 16),
    )

    expect(granularity).toBe('session')
    expect(buckets).toHaveLength(3)
    expect(buckets.map((bucket) => bucket.value)).toEqual([40, 45, 50])
    expect(
      buckets.every((bucket) => !bucket.isEmpty && !bucket.isInProgress),
    ).toBe(true)
  })

  it('folds more than the cap into weekly buckets', () => {
    // 21 sessions across 11 weeks, two per week (one in the last).
    const points = Array.from({ length: 11 }, (_, week) => [
      point(on(2026, 1, 5 + week * 7), 40 + week),
      point(on(2026, 1, 7 + week * 7), 41 + week),
    ])
      .flat()
      .slice(0, 21)
    const { buckets, granularity } = bucketSeries(
      points,
      'max',
      on(2026, 3, 16),
    )

    expect(granularity).toBe('week')
    expect(buckets).toHaveLength(11)
    expect(buckets.at(0)?.sessionCount).toBe(2)
  })

  it('steps up to months when weeks would overflow the cap', () => {
    const points = Array.from({ length: 25 }, (_, week) =>
      point(on(2026, 1, 5 + week * 7), 40 + week),
    )
    const { buckets, granularity } = bucketSeries(
      points,
      'max',
      on(2026, 6, 26),
    )

    expect(granularity).toBe('month')
    expect(buckets).toHaveLength(6)
  })

  it('caps at quarters even past twenty of them', () => {
    const points = Array.from({ length: 72 }, (_, month) =>
      point(on(2020, 1 + month, 15), 40 + month),
    )
    const { buckets, granularity } = bucketSeries(
      points,
      'max',
      on(2025, 12, 1),
    )

    expect(granularity).toBe('quarter')
    expect(buckets).toHaveLength(24)
  })

  it('returns no buckets for an empty series', () => {
    expect(bucketSeries([], 'max', on(2026, 7, 16)).buckets).toHaveLength(0)
  })
})

describe('bucketSeries — gaps and aggregation', () => {
  it('renders lapses as empty buckets through today', () => {
    // 22 sessions Jan–early Mar, then nothing; "today" is 31 May.
    const points = Array.from({ length: 22 }, (_, index) =>
      point(on(2026, 1, 1 + index * 3), 40 + index),
    )
    const { buckets, granularity } = bucketSeries(
      points,
      'max',
      on(2026, 5, 31),
    )

    expect(granularity).toBe('month')
    expect(buckets).toHaveLength(5)
    expect(buckets.at(3)?.isEmpty).toBe(true)
    expect(buckets.at(3)?.sessionCount).toBe(0)
    expect(buckets.at(4)?.isEmpty).toBe(true)
    expect(buckets.at(4)?.isInProgress).toBe(true)
  })

  it('aggregates a bucket by max for strength and sum for volume', () => {
    // 21 daily sessions = exactly three Monday-aligned weeks.
    const points = Array.from({ length: 21 }, (_, index) =>
      point(on(2026, 1, 5 + index), 10 + index),
    )
    const now = on(2026, 1, 25)

    expect(bucketSeries(points, 'max', now).buckets.at(0)?.value).toBe(16)
    expect(bucketSeries(points, 'sum', now).buckets.at(0)?.value).toBe(91)
  })
})

describe('bucketSeries — PR marking', () => {
  it('stars exactly one bucket — the earliest all-time best', () => {
    const values = [40, 50, 60, 60, 55]
    const points = values.map((value, index) =>
      point(on(2026, 3, 2 + index * 2), value),
    )
    const { buckets } = bucketSeries(points, 'max', on(2026, 3, 12))

    expect(buckets.filter((bucket) => bucket.isPr)).toHaveLength(1)
    expect(buckets.at(2)?.isPr).toBe(true)
  })

  it('keeps a partial sum bucket out of PR but lets max win it', () => {
    // Three full weeks plus a big two-session week still in progress.
    const points = [
      ...Array.from({ length: 21 }, (_, index) =>
        point(on(2026, 1, 5 + index), 10 + index),
      ),
      point(on(2026, 1, 26), 100),
      point(on(2026, 1, 27), 101),
    ]
    const now = on(2026, 1, 27)
    const sumBuckets = bucketSeries(points, 'sum', now).buckets
    const maxBuckets = bucketSeries(points, 'max', now).buckets

    expect(sumBuckets.at(3)?.isInProgress).toBe(true)
    expect(sumBuckets.at(3)?.isPr).toBe(false)
    expect(sumBuckets.at(2)?.isPr).toBe(true)
    expect(maxBuckets.at(3)?.isPr).toBe(true)
  })

  it('handles a single session as its own starred bar', () => {
    const { buckets, granularity } = bucketSeries(
      [point(on(2026, 7, 1), 40)],
      'max',
      on(2026, 7, 16),
    )

    expect(granularity).toBe('session')
    expect(buckets).toHaveLength(1)
    expect(buckets.at(0)?.isPr).toBe(true)
  })

  it('gives a flat series a single star on the first bar', () => {
    const points = [40, 40, 40].map((value, index) =>
      point(on(2026, 6, 1 + index * 7), value),
    )
    const { buckets } = bucketSeries(points, 'max', on(2026, 6, 20))

    expect(buckets.map((bucket) => bucket.isPr)).toEqual([true, false, false])
  })
})
