'use client'

import { useFormatter } from 'next-intl'
import { Card } from '@/components/ui/card'
import { ArrowRightIcon } from '@/components/ui/icons'
import { BigChart } from '@/features/progress/components/big-chart'
import { cn } from '@/lib/cn'
import { formatKg } from '@/lib/format'

/**
 * An illustrative working-weight climb — the one place on the landing that
 * shows the product's real chart, so the numbers are a plausible example, not
 * marketing invention (the note says as much). Explicit ids keep the React
 * keys stable and let the peak be marked by id, not array index. This single
 * array is the only source for the chart, the from→to line and the delta, so
 * they can never drift apart.
 */
const JOURNEY = [
  { id: 'w1', kg: 12 },
  { id: 'w2', kg: 13 },
  { id: 'w3', kg: 14 },
  { id: 'w4', kg: 15 },
  { id: 'w5', kg: 16 },
  { id: 'w6', kg: 17.5 },
] as const

/** Height that matches the in-app exercise chart, so the preview is faithful. */
const CHART_HEIGHT = 88

const WEIGHTS: readonly number[] = JOURNEY.map((point) => point.kg)
const FIRST_KG = JOURNEY[0].kg
const LAST_KG = WEIGHTS.at(-1) ?? FIRST_KG
// The last bar to reach the peak wins the star — a monotonic climb makes that
// the newest, matching how the app stars an all-time best.
const PEAK_ID = JOURNEY[WEIGHTS.lastIndexOf(Math.max(...WEIGHTS))].id
const GAIN_FRACTION = (LAST_KG - FIRST_KG) / FIRST_KG

type Props = Readonly<{
  chartLabel: string
  exerciseLabel: string
  note: string
}>

/**
 * The "cvičíš — a čísla rostou" step's proof: the actual {@link BigChart} the
 * app draws on the Progress screen, fed an illustrative climb, rather than a
 * decorative bar strip. A client leaf because `BigChart` is interactive; the
 * server shell resolves every string and hands it down, keeping translations
 * off the client bundle (mirrors `PhoneMock` → `PhoneMockScreen`).
 */
export const TrainProgressCard = ({
  chartLabel,
  exerciseLabel,
  note,
}: Props) => {
  const format = useFormatter()

  return (
    <Card inset="md">
      <div className="text-2xs text-ink-3 tracking-widest uppercase">
        {exerciseLabel}
      </div>
      <div className="mt-1 mb-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-ink-3 text-lg font-medium tabular-nums">
          {formatKg(format, FIRST_KG)}
        </span>
        <span className="text-accent">
          <ArrowRightIcon size={16} />
        </span>
        <span
          className={cn(
            'text-accent text-2xl leading-none font-extrabold',
            'tracking-tight tabular-nums',
          )}
        >
          {formatKg(format, LAST_KG)}
        </span>
        <span className="text-accent-deep font-mono text-xs font-bold tabular-nums">
          {format.number(GAIN_FRACTION, {
            signDisplay: 'exceptZero',
            style: 'percent',
          })}
        </span>
      </div>
      <BigChart
        format={(value) => formatKg(format, value)}
        height={CHART_HEIGHT}
        label={chartLabel}
        points={JOURNEY.map((point) => ({
          isPr: point.id === PEAK_ID,
          key: point.id,
          value: point.kg,
        }))}
      />
      <small className="text-2xs text-ink-3 mt-3 block tracking-wide">
        {note}
      </small>
    </Card>
  )
}
