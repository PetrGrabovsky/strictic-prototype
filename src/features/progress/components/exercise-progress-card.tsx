import { useFormatter, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRightIcon, ShareIcon } from '@/components/ui/icons'
import { BigChart } from '@/features/progress/components/big-chart'
import { DeltaBadge } from '@/features/progress/components/delta-badge'
import { GhostPreview } from '@/features/progress/components/ghost-preview'
import { formatBucketDate } from '@/features/progress/lib/format-bucket-date'
import type { ExerciseProgress } from '@/features/progress/types'
import { cn } from '@/lib/cn'
import { formatKg } from '@/lib/format'
import { MICRO_LABEL } from '@/styles/type'

/** Per-exercise chart is a touch shorter than the volume chart (reference). */
const CHART_HEIGHT = 88

type Props = {
  exercise: ExerciseProgress
  isTopProgress: boolean
  name: string
  onShare: () => void
}

/**
 * One hero card in the Progress carousel: the trend eyebrow and delta badge,
 * the exercise name, the from→to working weight, the bucketed weight-over-time
 * {@link BigChart}, and a footer with the session count and a share button.
 * A single-record exercise renders as a "start line" — no delta, no arrow, and
 * a {@link GhostPreview} in place of real bars — so a first data point never
 * reads as a broken chart (BUILD-GUIDE §4.3).
 */
export const ExerciseProgressCard = ({
  exercise,
  isTopProgress,
  name,
  onShare,
}: Props) => {
  const t = useTranslations('progress')
  const format = useFormatter()
  const {
    first,
    last,
    series,
    trend,
    weightBuckets,
    weightDeltaKg,
    weightDomain,
    weightGainPercent,
  } = exercise
  const isUp = trend === 'up'
  const isStart = trend === 'start'
  const hasEstimate = series.length >= 2

  const eyebrow = (): string => {
    if (isTopProgress) {
      return t('trend.topProgress')
    }
    switch (trend) {
      case 'down': {
        return t('trend.down')
      }
      case 'flat': {
        return t('trend.flat')
      }
      case 'start': {
        return t('trend.start')
      }
      case 'up': {
        return t('trend.up')
      }
    }
  }

  return (
    <Card className="shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            MICRO_LABEL,
            isTopProgress ? 'text-accent-deep' : 'text-ink-3',
          )}
        >
          {eyebrow()}
        </span>
        <DeltaBadge
          percent={weightGainPercent}
          trend={trend}
          weightDeltaKg={weightDeltaKg}
        />
      </div>

      <h3 className="text-ink mt-2 text-lg leading-tight font-semibold tracking-tight">
        {name}
      </h3>

      <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
        {isStart ? null : (
          <>
            <span className="text-ink-3 text-lg font-medium tabular-nums">
              {formatKg(format, first.weightKg)}
            </span>
            <span className={isUp ? 'text-accent' : 'text-ink-3'}>
              <ArrowRightIcon size={16} />
            </span>
          </>
        )}
        <span
          className={cn(
            'text-2xl leading-none font-bold tracking-tight tabular-nums',
            isUp ? 'text-accent' : 'text-ink',
          )}
        >
          {formatKg(format, last.weightKg)}
        </span>
        <span className="text-ink-3 font-mono text-xs tabular-nums">
          {t('card.reps', { reps: last.reps })}
        </span>
      </div>

      <p className="text-ink-3 mt-1.5 font-mono text-xs tabular-nums">
        {t('card.workingWeight')}
        {hasEstimate
          ? t('card.strengthEstimate', {
              from: formatKg(format, first.estimatedMax),
              to: formatKg(format, last.estimatedMax),
            })
          : ''}
      </p>

      <div className="mt-3.5">
        {isStart ? (
          <GhostPreview
            copy={t('ghost')}
            firstLabel={formatKg(format, first.weightKg)}
            height={CHART_HEIGHT}
          />
        ) : (
          <BigChart
            domain={weightDomain}
            format={(value) => formatKg(format, value)}
            height={CHART_HEIGHT}
            points={weightBuckets.buckets.map((bucket) => ({
              isEmpty: bucket.isEmpty,
              isPr: bucket.isPr,
              key: bucket.key,
              value: bucket.value,
            }))}
            rangeLabel={t('rangeCaption', {
              from: formatBucketDate(
                format,
                first.date,
                weightBuckets.granularity,
              ),
              period: t(`granularity.${weightBuckets.granularity}`),
              to: formatBucketDate(
                format,
                last.date,
                weightBuckets.granularity,
              ),
            })}
          />
        )}
      </div>

      <div className="border-line mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-ink-3 text-2xs font-mono tabular-nums">
          {t('card.sessions', { count: series.length })}
        </span>
        <Button onClick={onShare} size="sm" variant="ink">
          <ShareIcon size={14} />
          {t('card.share')}
        </Button>
      </div>
    </Card>
  )
}
