import { describe, expect, it } from 'vitest'
import {
  formatBucketDate,
  formatBucketPeriod,
} from '@/features/progress/lib/format-bucket-date'
import type { Formatter } from '@/lib/format'

/**
 * The next-intl formatter reduced to what these helpers call, backed by `Intl`
 * itself — the point of these tests is what ICU does with the options they
 * pass, so stubbing the output would test nothing.
 */
const format: Formatter = {
  dateTime: (value, options) =>
    new Intl.DateTimeFormat('cs', options).format(value),
  dateTimeRange: (start, end, options) =>
    new Intl.DateTimeFormat('cs', options).formatRange(start, end),
  number: (value, options) =>
    new Intl.NumberFormat('cs', options).format(value),
}

/**
 * What Intl puts between a range's ends in Czech: an en dash padded with
 * thin spaces (U+2009). Built from code points so the expectations below
 * cannot silently match an ordinary space typed by hand.
 */
const RANGE_DASH = String.fromCodePoint(0x20_09, 0x20_13, 0x20_09)

/**
 * Characters an axis label may run to. The chart draws it in a 42px column in
 * a 10px monospace face — 5.5px a glyph, measured — so the budget is a count,
 * not an estimate. Kept here rather than imported from the chart: this module
 * is React-free and must not learn about a component to be testable.
 */
const AXIS_CHAR_BUDGET = 7

const july2026 = new Date(2026, 6, 1).getTime()
const october2026 = new Date(2026, 9, 1).getTime()
const july13 = new Date(2026, 6, 13).getTime()
const july20 = new Date(2026, 6, 20).getTime()

describe('formatBucketDate', () => {
  it('abbreviates the month on a month journey', () => {
    expect(formatBucketDate(format, july2026, 'month')).toBe('čvc')
  })

  it('keeps the abbreviation and adds the year on a quarter journey', () => {
    expect(formatBucketDate(format, july2026, 'quarter')).toBe('čvc 26')
  })

  it('names the day on session and week journeys', () => {
    expect(formatBucketDate(format, july13, 'session')).toBe('13. 7.')
    expect(formatBucketDate(format, july13, 'week')).toBe('13. 7.')
  })

  /**
   * Czech spells a month out whenever the year is asked for in the same call,
   * which silently doubled every quarter label until it no longer fit its
   * column — the regression this guards. Asserted per label rather than over
   * the set, so a failure names the label that grew.
   */
  it('keeps every axis label inside the column budget', () => {
    const labels = [
      formatBucketDate(format, july2026, 'month'),
      formatBucketDate(format, july2026, 'quarter'),
      formatBucketDate(format, july13, 'week'),
      formatBucketDate(format, july13, 'session'),
    ]

    for (const label of labels) {
      expect(label.length, label).toBeLessThanOrEqual(AXIS_CHAR_BUDGET)
    }
  })
})

const bucket = (startMs: number, endMs: number) => ({ endMs, startMs })

describe('formatBucketPeriod', () => {
  it('spells the month out in full on a month journey', () => {
    expect(
      formatBucketPeriod(format, bucket(july2026, october2026), 'month'),
    ).toBe('červenec 2026')
  })

  it('abbreviates both ends of a quarter and names the year once', () => {
    expect(
      formatBucketPeriod(format, bucket(july2026, october2026), 'quarter'),
    ).toBe(`čvc${RANGE_DASH}zář 2026`)
  })

  it('reads a week as an inclusive day range', () => {
    expect(formatBucketPeriod(format, bucket(july13, july20), 'week')).toBe(
      `13. 7.${RANGE_DASH}19. 7.`,
    )
  })

  it('names the day of a session bucket', () => {
    expect(formatBucketPeriod(format, bucket(july13, july13), 'session')).toBe(
      '13. 7.',
    )
  })
})
