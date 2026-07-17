'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { BigChart } from '@/features/progress/components/big-chart'
import { ArrowRightIcon, ShareIcon } from '@/features/progress/components/icons'
import type { ExerciseProgress } from '@/features/progress/types'
import { cn } from '@/lib/cn'
import { fmtDateShort, fmtKg } from '@/lib/format'

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
 * the exercise name, the from→to working weight, the weight-over-time
 * {@link BigChart}, and a footer with the session count and a share button.
 * A single-record exercise renders as a "start line" — no delta, no arrow —
 * so a first data point never reads as a broken chart (BUILD-GUIDE §4.3).
 */
export const ExerciseProgressCard = ({
  exercise,
  isTopProgress,
  name,
  onShare,
}: Props) => {
  const t = useTranslations('progress')
  const format = useFormatter()
  const { first, last, series, trend, wDeltaPct } = exercise
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

  const badge = (): string => {
    switch (trend) {
      case 'down': {
        return t('badge.down', { pct: wDeltaPct })
      }
      case 'flat': {
        return t('badge.flat')
      }
      case 'start': {
        return t('badge.start')
      }
      case 'up': {
        return t('badge.up', { pct: wDeltaPct })
      }
    }
  }

  return (
    <div className="border-line-2 bg-surface shadow-card rounded-lg border px-4.5 pt-4.5 pb-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-2xs font-mono font-semibold tracking-widest uppercase',
            isTopProgress ? 'text-accent-deep' : 'text-ink-3',
          )}
        >
          {eyebrow()}
        </span>
        <span
          className={cn(
            'font-mono text-xs font-bold tabular-nums',
            isUp ? 'text-accent-deep' : 'text-ink-3',
          )}
        >
          {badge()}
        </span>
      </div>

      <h3 className="text-ink mt-2 text-lg leading-tight font-semibold tracking-tight">
        {name}
      </h3>

      <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
        {isStart ? null : (
          <>
            <span className="text-ink-3 text-lg font-medium tabular-nums">
              {fmtKg(format, first.w)}
            </span>
            <span className={isUp ? 'text-accent' : 'text-ink-3'}>
              <ArrowRightIcon size={16} />
            </span>
          </>
        )}
        <span
          className={cn(
            'text-[30px] leading-none font-bold tracking-tight tabular-nums',
            isUp ? 'text-accent' : 'text-ink',
          )}
        >
          {fmtKg(format, last.w)}
        </span>
        <span className="text-ink-3 font-mono text-xs tabular-nums">
          {t('card.reps', { reps: last.r })}
        </span>
      </div>

      <p className="text-ink-3 mt-1.5 font-mono text-xs tabular-nums">
        {t('card.workingWeight')}
        {hasEstimate
          ? t('card.strengthEstimate', {
              from: fmtKg(format, first.e1),
              to: fmtKg(format, last.e1),
            })
          : ''}
      </p>

      <div className="mt-3.5">
        <BigChart
          format={(value) => fmtKg(format, value)}
          height={CHART_HEIGHT}
          points={series.map((point) => ({
            key: String(point.date),
            value: point.w,
          }))}
          rangeLabel={t('dateRange', {
            from: fmtDateShort(format, first.date),
            to: fmtDateShort(format, last.date),
          })}
        />
      </div>

      <div className="border-line mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-ink-3 text-2xs font-mono tabular-nums">
          {t('card.sessions', { count: series.length })}
        </span>
        <Button className="min-h-11" onClick={onShare} size="sm" variant="dark">
          <ShareIcon size={14} />
          {t('card.share')}
        </Button>
      </div>
    </div>
  )
}
