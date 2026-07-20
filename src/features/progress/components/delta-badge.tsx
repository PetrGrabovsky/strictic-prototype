import { useFormatter, useTranslations } from 'next-intl'
import { CountUp } from '@/components/ui/count-up'
import type { ProgressTrend } from '@/features/progress/types'
import { cn } from '@/lib/cn'
import { formatKgDelta } from '@/lib/format'

type Props = {
  percent: number
  trend: ProgressTrend
  weightDeltaKg: number
}

/**
 * The exercise card's headline delta: a count-up of kilograms gained since the
 * first session with the relative change beside it — the concrete brag ("+4
 * kg") reads faster than the percentage alone. Always measured first→last, so
 * it stays honest whatever window the chart shows. A hold or a first record
 * has no delta to animate, so it falls back to a static label. A drop stays
 * neutral ink, never red — a lighter week is not a failure.
 */
export const DeltaBadge = ({ percent, trend, weightDeltaKg }: Props) => {
  const t = useTranslations('progress')
  const format = useFormatter()

  if (trend === 'flat' || trend === 'start') {
    return (
      <span className="text-ink-3 font-mono text-xs font-bold tabular-nums">
        {t(trend === 'flat' ? 'badge.flat' : 'badge.start')}
      </span>
    )
  }

  const isUp = trend === 'up'

  return (
    <span
      className={cn(
        'flex items-baseline gap-1 font-mono tabular-nums',
        isUp ? 'text-accent-deep' : 'text-ink-3',
      )}
    >
      <span className="text-sm font-bold">
        <CountUp
          format={(value) => formatKgDelta(format, value)}
          value={weightDeltaKg}
        />
      </span>
      <span className="text-2xs">
        {t(isUp ? 'badge.up' : 'badge.down', { percent })}
      </span>
    </span>
  )
}
