'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CountUp } from '@/components/ui/count-up'
import { BigChart } from '@/features/progress/components/big-chart'
import { ExerciseProgressCard } from '@/features/progress/components/exercise-progress-card'
import { HeroCarousel } from '@/features/progress/components/hero-carousel'
import {
  DumbbellIcon,
  HomeIcon,
  TrendingUpIcon,
} from '@/features/progress/components/icons'
import { deriveProgress } from '@/features/progress/lib/derive'
import {
  buildShareCanvas,
  deliverShareImage,
} from '@/features/progress/lib/share-canvas'
import type { ShareCard } from '@/features/progress/lib/share-canvas'
import type { ExerciseProgress, ProgressData } from '@/features/progress/types'
import { Link, useRouter } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { fmtDateShort, fmtKg, fmtVol } from '@/lib/format'
import type { Formatter } from '@/lib/format'
import { PLAUSIBLE_DOMAIN } from '@/lib/site-config'
import { loadHistory, loadPlan } from '@/lib/storage'

/** The start-state note shows until the user has this many logged sessions. */
const START_STATE_SESSIONS = 3
const SHARE_FILENAME = 'strictic-pokrok.png'
const FEEDBACK_TIMEOUT_MS = 4000
const VOLUME_CHART_HEIGHT = 96

type State =
  | { data: ProgressData; status: 'ready' }
  | { status: 'empty' }
  | { status: 'loading' }

/** The mono uppercase section eyebrow (DESIGN-SYSTEM §2 label role). */
const SECTION_LABEL = cn(
  'text-xs font-mono font-medium uppercase tracking-widest text-ink-2',
)

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
  const [state, setState] = useState<State>({ status: 'loading' })
  const [feedback, setFeedback] = useState<null | string>(null)

  useEffect(() => {
    let isActive = true
    void (async () => {
      const [plan, history] = await Promise.all([loadPlan(), loadHistory()])
      if (!isActive) {
        return
      }
      if (plan === null) {
        router.replace('/app/onboarding')
        return
      }
      const records = history ?? []
      if (records.length === 0) {
        setState({ status: 'empty' })
        return
      }
      const exerciseIds = plan.plan
        .filter((entry) => entry.hold_s === null)
        .map((entry) => entry.exercise_id)
      setState({ data: deriveProgress(exerciseIds, records), status: 'ready' })
    })()
    return () => {
      isActive = false
    }
  }, [router])

  if (state.status === 'loading') {
    return (
      <main
        aria-busy="true"
        className="flex flex-1 items-center justify-center px-5"
      >
        <p className={SECTION_LABEL}>{t('loading')}</p>
      </main>
    )
  }

  if (state.status === 'empty') {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <span className="border-line-2 bg-surface text-accent-deep mb-5 flex size-14 items-center justify-center rounded-md border">
          <TrendingUpIcon size={26} />
        </span>
        <h1 className="text-ink text-xl font-semibold tracking-tight">
          {t('empty.title')}
        </h1>
        <p className="text-ink-2 mt-2.5 max-w-[34ch] text-sm leading-relaxed">
          {t('empty.body')}
        </p>
        <Link
          className={cn(
            buttonVariants({ size: 'lg', variant: 'dark' }),
            'mt-7',
          )}
          href="/app"
        >
          <DumbbellIcon size={19} />
          {t('empty.cta')}
        </Link>
      </main>
    )
  }

  const announce = (message: string) => {
    setFeedback(message)
    globalThis.setTimeout(() => setFeedback(null), FEEDBACK_TIMEOUT_MS)
  }

  const shareCardOf = (exercise: ExerciseProgress): ShareCard => {
    const { e1DeltaPct, first, last, series } = exercise
    const count = series.length
    const isImproved = e1DeltaPct > 0
    let statLabel = t('share.deltaLabel')
    if (!isImproved) {
      statLabel = t(
        count === 1 ? 'share.firstRecordLabel' : 'share.sessionsLabel',
      )
    }
    return {
      brand: tCommon('appName'),
      foot: shareDate(format),
      headline: fmtKg(format, last.w),
      kicker: t('share.kicker'),
      name: tExercise(`${exercise.id}.name`),
      spark: series.map((point) => point.w),
      sparkFromLabel: fmtKg(format, first.w),
      sparkToLabel: fmtKg(format, last.w),
      statLabel,
      statValue: isImproved
        ? t('share.deltaValue', { pct: e1DeltaPct })
        : format.number(count),
      subline: t(count > 1 ? 'share.sublineChange' : 'share.sublineStart', {
        from: fmtKg(format, first.w),
        reps: last.r,
        to: fmtKg(format, last.w),
      }),
      tagline: t('share.tagline'),
      url: PLAUSIBLE_DOMAIN,
    }
  }

  const handleShare = async (exercise: ExerciseProgress) => {
    const canvas = await buildShareCanvas(shareCardOf(exercise))
    if (canvas === null) {
      announce(t('share.failed'))
      return
    }
    const outcome = await deliverShareImage(canvas, SHARE_FILENAME)
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
    volumeDates,
    volumeSeries,
    weekDots,
    weeksSpan,
  } = state.data
  const lastVolumeDate = volumeDates.at(-1) ?? volumeDates[0]

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-16">
      <header className="mb-5">
        <p className={SECTION_LABEL}>{t('kicker')}</p>
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
          prevLabel={t('carousel.previous')}
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
          <h2 className={SECTION_LABEL}>{t('volume.heading')}</h2>
          <span className="text-ink-3 font-mono text-xs tabular-nums">
            {t('volume.sessions', { count: sessionCount })}
          </span>
        </div>
        <Card>
          <p className="text-ink text-xl font-semibold tracking-tight tabular-nums">
            <CountUp
              format={(value) => fmtVol(format, value)}
              value={totalVolumeKg}
            />{' '}
            <span className="text-ink-3 text-xs font-normal">
              {t('volume.totalLabel')}
            </span>
          </p>
          <div className="mt-3.5">
            <BigChart
              format={(value) => fmtVol(format, value)}
              height={VOLUME_CHART_HEIGHT}
              points={volumeDates.map((date, index) => ({
                key: String(date),
                value: volumeSeries[index],
              }))}
              rangeLabel={t('dateRange', {
                from: fmtDateShort(format, volumeDates[0]),
                to: fmtDateShort(format, lastVolumeDate),
              })}
              variant="ink"
            />
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <h2 className={SECTION_LABEL}>{t('regularity.heading')}</h2>
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

      <Link
        className={cn(
          buttonVariants({ size: 'lg', variant: 'dark' }),
          'mt-7 w-full',
        )}
        href="/app"
      >
        <HomeIcon size={18} />
        {t('backToPlan')}
      </Link>

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-5"
      >
        {feedback === null ? null : (
          <span className="bg-ink text-surface rounded-full px-4 py-2 text-sm shadow-[0_10px_34px_-8px_rgb(10_10_10/0.55)]">
            {feedback}
          </span>
        )}
      </div>
    </main>
  )
}
