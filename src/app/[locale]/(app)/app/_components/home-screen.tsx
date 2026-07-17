'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Disc } from '@/components/ui/disc'
import {
  isDeloadSession,
  lighterPlan,
} from '@/features/onboarding/lib/lighter-plan'
import { Link, useRouter } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { loadHistory, loadPlan, loadProfile } from '@/lib/storage'
import type { Plan, PlanExercise } from '@/types/plan'

/** The mono uppercase micro-label (DESIGN-SYSTEM §2 label role). */
const LABEL_CLASS = cn(
  'text-2xs font-mono font-medium uppercase tracking-widest text-ink-2',
)

type ViewState =
  { isLighterDay: boolean; plan: Plan; status: 'ready' } | { status: 'loading' }

/** Dumbbell mark for the primary CTA; inherits `currentColor`. */
const DumbbellIcon = () => (
  <svg
    aria-hidden
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="20"
  >
    <path d="M6 8v8M3.5 9.5v5M18 8v8M20.5 9.5v5M6 12h12" />
  </svg>
)

/** Feather mark for the lighter-day badge; inherits `currentColor`. */
const FeatherIcon = () => (
  <svg
    aria-hidden
    fill="none"
    height="18"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="18"
  >
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8 2 22M17.5 15H9" />
  </svg>
)

/** Trending-up mark for the Progress link; inherits `currentColor`. */
const TrendingUpIcon = () => (
  <svg
    aria-hidden
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="20"
  >
    <path d="M22 7 13.5 15.5l-5-5L2 17M16 7h6v6" />
  </svg>
)

/**
 * The Home screen: today's workout drawn from the persisted plan. A client
 * component because the profile, plan and history all live in `localStorage`
 * (server reads return `null` until the Supabase swap in Etapa 6). No profile
 * or plan yet → the user hasn't finished onboarding, so we send them there.
 */
export const HomeScreen = () => {
  const t = useTranslations('home')
  const tExercise = useTranslations('exercises')
  const router = useRouter()
  const [view, setView] = useState<ViewState>({ status: 'loading' })

  useEffect(() => {
    let isActive = true
    void (async () => {
      const [profile, plan, history] = await Promise.all([
        loadProfile(),
        loadPlan(),
        loadHistory(),
      ])
      if (!isActive) {
        return
      }
      if (profile === null || plan === null) {
        router.replace('/app/onboarding')
        return
      }
      const completedSessions = history?.length ?? 0
      const isLighterDay = isDeloadSession(
        completedSessions,
        plan.meta.frequency_per_week,
      )
      setView({ isLighterDay, plan, status: 'ready' })
    })()
    return () => {
      isActive = false
    }
  }, [router])

  if (view.status === 'loading') {
    return (
      <main
        aria-busy="true"
        className="flex flex-1 items-center justify-center px-5"
      >
        <p className={LABEL_CLASS}>{t('loading')}</p>
      </main>
    )
  }

  const { isLighterDay, plan } = view
  const todayPlan = isLighterDay ? lighterPlan(plan) : plan

  const effortLabel = (exercise: PlanExercise): string =>
    exercise.hold_s === null
      ? t('setsReps', { reps: exercise.reps ?? 0, sets: exercise.sets })
      : t('setsHold', { seconds: exercise.hold_s, sets: exercise.sets })

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6 pb-8">
      <header>
        <p className={LABEL_CLASS}>{t('kicker')}</p>
        <h1 className="text-ink mt-2 text-3xl font-bold tracking-tight">
          {plan.meta.plan_name_cs}
        </h1>
      </header>

      {isLighterDay ? (
        <Card className="bg-cream/60 mt-5 flex items-start gap-3">
          <span className="text-accent-deep mt-0.5 flex shrink-0">
            <FeatherIcon />
          </span>
          <div>
            <p className="text-ink text-sm font-semibold">
              {t('lighterDay.title')}
            </p>
            <p className="text-ink-2 mt-1 text-sm leading-relaxed">
              {t('lighterDay.description')}
            </p>
          </div>
        </Card>
      ) : null}

      <p className={cn(LABEL_CLASS, 'mt-6 mb-2')}>{t('todayWorkout')}</p>

      <Card className="overflow-hidden p-0">
        <ol>
          {todayPlan.plan.map((exercise, index) => (
            <li
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                index > 0 && 'border-line border-t',
              )}
              key={exercise.exercise_id}
            >
              <Disc>{index + 1}</Disc>
              <p className="text-ink min-w-0 flex-1 text-base font-semibold">
                {tExercise(`${exercise.exercise_id}.name`)}
              </p>
              <p className="text-ink-2 shrink-0 font-mono text-sm tabular-nums">
                {effortLabel(exercise)}
              </p>
            </li>
          ))}
        </ol>
      </Card>

      <Link
        className={cn(
          buttonVariants({ size: 'lg', variant: 'primary' }),
          'mt-8 w-full',
        )}
        href="/app/trenink"
      >
        <DumbbellIcon />
        {t('cta')}
      </Link>

      <Link
        className={cn(
          buttonVariants({ size: 'lg', variant: 'ghost' }),
          'mt-3 w-full',
        )}
        href="/app/pokrok"
      >
        <TrendingUpIcon />
        {t('progressCta')}
      </Link>
    </main>
  )
}
