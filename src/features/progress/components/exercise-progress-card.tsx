import { useFormatter, useTranslations } from 'next-intl'
import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRightIcon, ShareIcon } from '@/components/ui/icons'
import { BigChart } from '@/features/progress/components/big-chart'
import { BucketDetail } from '@/features/progress/components/bucket-detail'
import { DeltaBadge } from '@/features/progress/components/delta-badge'
import { GhostPreview } from '@/features/progress/components/ghost-preview'
import { drillIntoBucket } from '@/features/progress/lib/drill-down'
import {
  formatBucketDate,
  formatBucketPeriod,
} from '@/features/progress/lib/format-bucket-date'
import type { ExerciseProgress, ProgressPoint } from '@/features/progress/types'
import { cn } from '@/lib/cn'
import { formatKg } from '@/lib/format'
import { MICRO_LABEL } from '@/styles/type'

/** Per-exercise chart is a touch shorter than the volume chart (reference). */
const CHART_HEIGHT = 88

/** The charted metric of this card: working weight, session by session. */
const weightPoints = (series: readonly ProgressPoint[]) =>
  series.map((point) => ({ date: point.date, value: point.weightKg }))

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
 * reads as a broken chart (BUILD-GUIDE §4.3). On a session that beat every
 * one before it the card switches to its record voice: the eyebrow names the
 * peak and the share button escalates to the accent CTA. Once history is long
 * enough for the overview to fold sessions into periods, every bar opens a
 * {@link BucketDetail} disclosure holding the sessions behind it.
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
    isNewestRecord,
    last,
    series,
    trend,
    weightBuckets,
    weightDeltaKg,
    weightDomain,
    weightGainPercent,
  } = exercise
  const panelId = useId()
  const expandedRef = useRef<HTMLButtonElement>(null)
  const [openBucketKey, setOpenBucketKey] = useState<null | string>(null)
  const isUp = trend === 'up'
  const isStart = trend === 'start'
  const hasEstimate = series.length >= 2
  // A session-level overview is already one bar per workout — there is nothing
  // left to unfold, so its bars stay plain (BUILD-GUIDE, decision: level 1).
  const isDrillable = weightBuckets.granularity !== 'session'
  const openDetail =
    openBucketKey === null
      ? null
      : drillIntoBucket(
          weightPoints(series),
          weightBuckets.buckets,
          openBucketKey,
        )

  // Focus first, close second: the bar is still mounted at this point, so the
  // keyboard lands back where the panel was opened from instead of on nothing.
  const closeDetail = () => {
    expandedRef.current?.focus()
    setOpenBucketKey(null)
  }

  const overviewBars = () =>
    weightBuckets.buckets.map((bucket) => ({
      isEmpty: bucket.isEmpty,
      isPr: bucket.isPr,
      key: bucket.key,
      label:
        isDrillable && !bucket.isEmpty
          ? t('detail.barLabel', {
              period: formatBucketPeriod(
                format,
                bucket,
                weightBuckets.granularity,
              ),
              value: formatKg(format, bucket.value),
            })
          : undefined,
      value: bucket.value,
    }))

  const eyebrow = (): string => {
    // A brand-new peak outranks every other label: it is the one moment the
    // card can say something the user did today, not something they are.
    if (isNewestRecord) {
      return t('trend.record')
    }
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
            isNewestRecord || isTopProgress ? 'text-accent-deep' : 'text-ink-3',
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
            caption={t('rangeCaption', {
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
            domain={weightDomain}
            drill={
              isDrillable
                ? {
                    expandedKey: openBucketKey,
                    expandedRef,
                    onSelect: (key) =>
                      setOpenBucketKey((current) =>
                        current === key ? null : key,
                      ),
                    panelId,
                  }
                : undefined
            }
            format={(value) => formatKg(format, value)}
            height={CHART_HEIGHT}
            label={t('chart.weight', { name })}
            points={overviewBars()}
          />
        )}
        {openDetail === null ? null : (
          <BucketDetail
            baselineKg={first.weightKg}
            detail={openDetail}
            domain={weightDomain}
            exerciseName={name}
            granularity={weightBuckets.granularity}
            height={CHART_HEIGHT}
            id={panelId}
            onClose={closeDetail}
            onStep={setOpenBucketKey}
          />
        )}
      </div>

      <div className="border-line mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-ink-3 text-2xs font-mono tabular-nums">
          {t('card.sessions', { count: series.length })}
        </span>
        {/*
          At a new peak the share prompt escalates to the accent button — the
          emotional high is the only moment worth asking. It steps up to `md`
          with it: ink-on-accent is AAA only at the 19px bold `md` label, so a
          `sm` accent button is never an option (see `buttonVariants`).
        */}
        <Button
          onClick={onShare}
          size={isNewestRecord ? 'md' : 'sm'}
          variant={isNewestRecord ? 'primary' : 'ink'}
        >
          <ShareIcon size={isNewestRecord ? 18 : 14} />
          {t(isNewestRecord ? 'card.shareRecord' : 'card.share')}
        </Button>
      </div>
    </Card>
  )
}
