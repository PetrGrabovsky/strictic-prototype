'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, cardVariants } from '@/components/ui/card'
import { CountUp } from '@/components/ui/count-up'
import { DumbbellIcon, HomeIcon, TrendingUpIcon } from '@/components/ui/icons'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { StatusScreen } from '@/components/ui/status-screen'
import { BigChart } from '@/features/progress/components/big-chart'
import { ExerciseProgressCard } from '@/features/progress/components/exercise-progress-card'
import { HeroCarousel } from '@/features/progress/components/hero-carousel'
import { deriveProgress } from '@/features/progress/lib/derive'
import {
  formatBucketDate,
  formatBucketPeriod,
} from '@/features/progress/lib/format-bucket-date'
import {
  buildShareCanvas,
  deliverShareImage,
} from '@/features/progress/lib/share-canvas'
import type {
  ShareCard,
  ShareMessage,
} from '@/features/progress/lib/share-canvas'
import type { ExerciseProgress, ProgressData } from '@/features/progress/types'
import { useStorageSnapshot } from '@/hooks/use-storage-snapshot'
import { useRouter } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { formatKg, formatKgDelta, formatVolume } from '@/lib/format'
import type { Formatter } from '@/lib/format'
import { PLAUSIBLE_DOMAIN, SITE_URL } from '@/lib/site-config'
import { loadHistory, loadPlan } from '@/lib/storage'
import { SCREEN } from '@/styles/layout'
import { SECTION_LABEL } from '@/styles/type'

/** The start-state note shows until the user has this many logged sessions. */
const START_STATE_SESSIONS = 3
const SHARE_FILENAME = 'strictic-pokrok.png'
const FEEDBACK_TIMEOUT_MS = 4000
const VOLUME_CHART_HEIGHT = 96

type ProgressSnapshot =
  | { data: ProgressData; status: 'ready' }
  | { status: 'empty' }
  | { status: 'onboarding' }

/**
 * Reads storage and decides what this visit shows: no plan → onboarding, no
 * history → the empty state, otherwise the fully derived progress data. All
 * impure reads (storage, the derive clock) happen here, outside render.
 */
const loadProgressSnapshot = async (): Promise<ProgressSnapshot> => {
  const [plan, history] = await Promise.all([loadPlan(), loadHistory()])
  if (plan === null) {
    return { status: 'onboarding' }
  }
  const records = history ?? []
  if (records.length === 0) {
    return { status: 'empty' }
  }
  const exerciseIds = plan.plan
    .filter((entry) => entry.hold_s === null)
    .map((entry) => entry.exercise_id)
  return { data: deriveProgress(exerciseIds, records), status: 'ready' }
}

/**
 * Today's date for the share image footer. Kept at module scope so its one
 * impure read (the current time, captured at share-click) sits outside the
 * component's render path, where reading the clock would be a purity break.
 */
const shareDate = (format: Formatter): string =>
  format.dateTime(Date.now(), {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })

/**
 * The Progress screen. A client component because everything it renders —
 * scroll-driven carousel, canvas share image, count-up — is interactive and
 * reads `localStorage` (server reads are null until the Supabase swap). No
 * plan yet means onboarding is unfinished, so it redirects there; no history
 * yet shows the empty state, not a broken chart.
 */
export const ProgressScreen = () => {
  const t = useTranslations('progress')
  const tExercise = useTranslations('exercises')
  const tCommon = useTranslations('common')
  const format = useFormatter()
  const router = useRouter()
  const snapshot = useStorageSnapshot(loadProgressSnapshot)
  const [feedback, setFeedback] = useState<null | string>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const isOnboardingNeeded = snapshot?.status === 'onboarding'

  useEffect(() => {
    if (isOnboardingNeeded) {
      router.replace('/app/onboarding')
    }
  }, [isOnboardingNeeded, router])

  // Cancel a pending toast hide on unmount so it never fires into nothing.
  useEffect(() => () => globalThis.clearTimeout(feedbackTimer.current), [])

  if (snapshot === null || isOnboardingNeeded) {
    return <LoadingScreen label={t('loading')} />
  }

  if (snapshot.status === 'empty') {
    return (
      <StatusScreen
        action={
          <ButtonLink className="mt-3" href="/app" size="lg" variant="ink">
            <DumbbellIcon size={20} />
            {t('empty.cta')}
          </ButtonLink>
        }
        description={t('empty.body')}
        icon={
          <span
            className={cn(
              cardVariants({ inset: 'none' }),
              'text-accent-deep flex size-14 items-center justify-center',
            )}
          >
            <TrendingUpIcon size={28} />
          </span>
        }
        title={t('empty.title')}
      />
    )
  }

  // Replacing the timer with each message keeps rapid shares honest: the
  // newest toast always gets its full display window.
  const announce = (message: string) => {
    globalThis.clearTimeout(feedbackTimer.current)
    setFeedback(message)
    feedbackTimer.current = globalThis.setTimeout(
      () => setFeedback(null),
      FEEDBACK_TIMEOUT_MS,
    )
  }

  const shareCardOf = (exercise: ExerciseProgress): ShareCard => {
    const {
      first,
      id,
      last,
      series,
      strengthGainPercent,
      weeksSpan,
      weightBuckets,
      weightDeltaKg,
      weightDomain,
    } = exercise
    const count = series.length
    const isImproved = strengthGainPercent > 0
    const from = formatKg(format, first.weightKg)
    const to = formatKg(format, last.weightKg)

    let statLabel = t('share.deltaLabel')
    if (!isImproved) {
      statLabel = t(
        count === 1 ? 'share.firstRecordLabel' : 'share.sessionsLabel',
      )
    }

    // The gain is the reason anyone looks twice, so it takes the card's
    // biggest slot — but only when there is one. A flat or regressed journey
    // falls back to today's weight rather than bragging about "+0 kg".
    const hasGain = weightDeltaKg > 0
    const journeySubline = (): string => {
      if (count === 1) {
        return t('share.sublineStart', { reps: last.reps, to })
      }
      return weeksSpan > 0
        ? t('share.sublineJourney', { from, to, weeks: weeksSpan })
        : t('share.sublineChange', { from, reps: last.reps, to })
    }

    return {
      bars: weightBuckets.buckets.map((bucket) => ({
        isEmpty: bucket.isEmpty,
        value: bucket.value,
      })),
      barsDomain: weightDomain,
      barsFromLabel: from,
      barsToLabel: to,
      brand: tCommon('appName'),
      footer: shareDate(format),
      headline: hasGain ? formatKgDelta(format, weightDeltaKg) : to,
      kicker: t('share.kicker'),
      name: tExercise(`${id}.name`),
      statLabel,
      statValue: isImproved
        ? t('share.deltaValue', { percent: strengthGainPercent })
        : format.number(count),
      subline: journeySubline(),
      tagline: t('share.tagline'),
      url: PLAUSIBLE_DOMAIN,
    }
  }

  /**
   * The words that travel with the image. A real number in the sentence is
   * what makes a recipient curious, so the full brag is used wherever the
   * journey supports it; everything else falls back to a plain, honest line.
   */
  const shareMessageOf = (exercise: ExerciseProgress): ShareMessage => {
    const { first, id, last, weeksSpan, weightDeltaKg } = exercise
    const hasStory = weightDeltaKg > 0 && weeksSpan > 0
    return {
      text: hasStory
        ? t('share.message', {
            from: formatKg(format, first.weightKg),
            name: tExercise(`${id}.name`),
            to: formatKg(format, last.weightKg),
            weeks: weeksSpan,
          })
        : t('share.messageSimple'),
      url: SITE_URL,
    }
  }

  const handleShare = async (exercise: ExerciseProgress) => {
    const canvas = await buildShareCanvas(shareCardOf(exercise))
    if (canvas === null) {
      announce(t('share.failed'))
      return
    }
    const outcome = await deliverShareImage(
      canvas,
      SHARE_FILENAME,
      shareMessageOf(exercise),
    )
    if (outcome === 'downloaded') {
      announce(t('share.downloaded'))
    } else if (outcome === 'failed') {
      announce(t('share.failed'))
    }
  }

  const {
    consistency,
    exercises,
    sessionCount,
    sessionsLast30,
    totalVolumeKg,
    volumeBuckets,
    weekDots,
    weeksSpan,
  } = snapshot.data

  return (
    <main className={cn(SCREEN, 'pb-16')}>
      <header className="mb-5">
        <p className={cn(SECTION_LABEL, 'text-ink-2')}>{t('kicker')}</p>
        <h1 className="text-ink mt-2 text-2xl font-bold tracking-tight">
          {weeksSpan > 0
            ? t('titleWithSpan', { weeks: weeksSpan })
            : t('title')}
        </h1>
      </header>

      {sessionCount < START_STATE_SESSIONS ? (
        <Card className="text-ink-2 mb-5 text-sm leading-relaxed">
          {t('startNote')}
        </Card>
      ) : null}

      {exercises.length > 0 ? (
        <HeroCarousel
          ariaLabel={t('carousel.label')}
          counterLabel={(current, total) =>
            t('carousel.counter', { current, total })
          }
          dotLabel={(position) => t('carousel.dot', { position: position + 1 })}
          heading={t('carousel.heading')}
          nextLabel={t('carousel.next')}
          previousLabel={t('carousel.previous')}
          slides={exercises.map((exercise, index) => ({
            content: (
              <ExerciseProgressCard
                exercise={exercise}
                isTopProgress={index === 0 && exercise.trend === 'up'}
                name={tExercise(`${exercise.id}.name`)}
                onShare={() => void handleShare(exercise)}
              />
            ),
            id: exercise.id,
          }))}
        />
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className={cn(SECTION_LABEL, 'text-ink-2')}>
            {t('volume.heading')}
          </h2>
          <span className="text-ink-3 font-mono text-xs tabular-nums">
            {t('volume.sessions', { count: sessionCount })}
          </span>
        </div>
        <Card>
          <p className="text-ink text-xl font-semibold tracking-tight tabular-nums">
            <CountUp
              format={(value) => formatVolume(format, value)}
              value={totalVolumeKg}
            />{' '}
            <span className="text-ink-3 text-xs font-normal">
              {t('volume.totalLabel')}
            </span>
          </p>
          <div className="mt-3.5">
            <BigChart
              format={(value) => formatVolume(format, value)}
              height={VOLUME_CHART_HEIGHT}
              label={t('chart.volume')}
              points={volumeBuckets.buckets.map((bucket) => ({
                axisLabel: formatBucketDate(
                  format,
                  bucket.startMs,
                  volumeBuckets.granularity,
                ),
                isEmpty: bucket.isEmpty,
                isInProgress: bucket.isInProgress,
                key: bucket.key,
                // A skipped period draws a decorative tick, so without this a
                // screen reader would get the bare axis label and nothing else.
                label: bucket.isEmpty
                  ? t('chart.emptyPeriod', {
                      period: formatBucketPeriod(
                        format,
                        bucket,
                        volumeBuckets.granularity,
                      ),
                    })
                  : undefined,
                value: bucket.value,
              }))}
              variant="ink"
            />
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <h2 className={cn(SECTION_LABEL, 'text-ink-2')}>
          {t('regularity.heading')}
        </h2>
        <Card className="mt-3">
          <p className="text-ink text-xl font-semibold tracking-tight">
            <span className="tabular-nums">{sessionsLast30}</span>{' '}
            <span className="text-ink-3 text-sm font-normal">
              {t('regularity.windowLabel')}
            </span>
          </p>
          <div className="mt-3.5 flex items-center gap-1.5">
            {weekDots.map((dot) => (
              <div
                className={cn(
                  'h-2 flex-1 rounded-sm',
                  dot.active ? 'bg-accent' : 'bg-line-field',
                )}
                key={dot.weekStart}
              />
            ))}
          </div>
          <div className="text-ink-3 text-2xs mt-2 flex justify-between font-mono">
            <span>{t('regularity.rangeStart')}</span>
            <span>{t('regularity.rangeEnd')}</span>
          </div>
          <p className="text-ink-2 mt-3 text-sm leading-relaxed">
            {t(`consistency.${consistency}`)}
          </p>
        </Card>
      </section>

      <ButtonLink className="mt-7 w-full" href="/app" size="lg" variant="ink">
        <HomeIcon size={18} />
        {t('backToPlan')}
      </ButtonLink>

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-5"
      >
        {feedback === null ? null : (
          <span className="bg-ink text-surface shadow-toast rounded-full px-4 py-2 text-sm">
            {feedback}
          </span>
        )}
      </div>
    </main>
  )
}
