'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { ButtonLink } from '@/components/ui/button-link'
import { Card } from '@/components/ui/card'
import { Disc } from '@/components/ui/disc'
import {
  DumbbellIcon,
  FeatherIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { LoadingScreen } from '@/components/ui/loading-screen'
import {
  isDeloadSession,
  lighterPlan,
} from '@/features/onboarding/lib/lighter-plan'
import { useStorageSnapshot } from '@/hooks/use-storage-snapshot'
import { useRouter } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { loadHistory, loadPlan, loadProfile } from '@/lib/storage'
import { SCREEN } from '@/styles/layout'
import { MICRO_LABEL } from '@/styles/type'
import type { Plan, PlanExercise } from '@/types/plan'

type HomeSnapshot =
  | { isLighterDay: boolean; plan: Plan; status: 'ready' }
  | { status: 'onboarding' }

/**
 * Reads storage and decides what Home shows: a missing profile or plan means
 * onboarding is unfinished; otherwise today's plan plus the deload marker.
 */
const loadHomeSnapshot = async (): Promise<HomeSnapshot> => {
  const [profile, plan, history] = await Promise.all([
    loadProfile(),
    loadPlan(),
    loadHistory(),
  ])
  if (profile === null || plan === null) {
    return { status: 'onboarding' }
  }
  return {
    isLighterDay: isDeloadSession(
      history?.length ?? 0,
      plan.meta.frequency_per_week,
    ),
    plan,
    status: 'ready',
  }
}

/**
 * The Home screen: today's workout drawn from the persisted plan. A client
 * component because the profile, plan and history all live in `localStorage`
 * (server reads return `null` until the Supabase swap in Etapa 6).
 */
export const HomeScreen = () => {
  const t = useTranslations('home')
  const tExercise = useTranslations('exercises')
  const router = useRouter()
  const snapshot = useStorageSnapshot(loadHomeSnapshot)

  const isOnboardingNeeded = snapshot?.status === 'onboarding'

  useEffect(() => {
    if (isOnboardingNeeded) {
      router.replace('/app/onboarding')
    }
  }, [isOnboardingNeeded, router])

  if (snapshot === null || isOnboardingNeeded) {
    return <LoadingScreen label={t('loading')} />
  }

  const { isLighterDay, plan } = snapshot
  const todayPlan = isLighterDay ? lighterPlan(plan) : plan

  const effortLabel = (exercise: PlanExercise): string =>
    exercise.hold_s === null
      ? t('setsReps', { reps: exercise.reps ?? 0, sets: exercise.sets })
      : t('setsHold', { seconds: exercise.hold_s, sets: exercise.sets })

  return (
    <main className={SCREEN}>
      <header>
        <p className={cn(MICRO_LABEL, 'text-ink-2')}>{t('kicker')}</p>
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

      <p className={cn(MICRO_LABEL, 'text-ink-2 mt-6 mb-2')}>
        {t('todayWorkout')}
      </p>

      <Card className="overflow-hidden" inset="none">
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

      <ButtonLink className="mt-8 w-full" href="/app/trenink" size="lg">
        <DumbbellIcon size={20} />
        {t('cta')}
      </ButtonLink>

      <ButtonLink
        className="mt-3 w-full"
        href="/app/pokrok"
        size="lg"
        variant="ghost"
      >
        <TrendingUpIcon size={20} />
        {t('progressCta')}
      </ButtonLink>
    </main>
  )
}
