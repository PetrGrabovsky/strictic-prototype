'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import {
  isDeloadSession,
  lighterPlan,
} from '@/features/onboarding/lib/lighter-plan'
import { WorkoutSession } from '@/features/workout/components/workout-session'
import {
  buildInitialLogs,
  reconcileLogs,
  resolveExercises,
} from '@/features/workout/lib/session'
import type { WorkoutExercise } from '@/features/workout/types'
import { useRouter } from '@/i18n/routing'
import { SESSION_RESUME_WINDOW_MS } from '@/lib/constants'
import {
  loadHistory,
  loadPlan,
  loadProfile,
  loadProgress,
  loadSession,
} from '@/lib/storage'
import type { Profile } from '@/types/profile'
import type { ExerciseLog, WorkoutProgress } from '@/types/workout'

type Ready = {
  exercises: readonly WorkoutExercise[]
  initialElapsedSeconds: number
  initialLogs: Record<string, ExerciseLog>
  initialProgress: null | WorkoutProgress
  isEasy: boolean
  profile: Profile
  startIndex: number
  status: 'ready'
}

type LoaderState = Ready | { status: 'loading' }

/**
 * Client entry for the workout: loads the persisted plan/profile/history from
 * storage (server reads are null until the Supabase swap), computes today's
 * plan — lighter on a deload — and resumes a recent in-progress session. No
 * profile or plan yet means onboarding is unfinished, so it redirects there,
 * matching the Home screen's guard.
 */
export const WorkoutScreen = () => {
  const t = useTranslations('workout')
  const router = useRouter()
  const [state, setState] = useState<LoaderState>({ status: 'loading' })

  useEffect(() => {
    let isActive = true
    void (async () => {
      const [profile, plan, history, progress, session] = await Promise.all([
        loadProfile(),
        loadPlan(),
        loadHistory(),
        loadProgress(),
        loadSession(),
      ])
      if (!isActive) {
        return
      }
      if (profile === null || plan === null) {
        router.replace('/app/onboarding')
        return
      }
      const resumable =
        session !== null && Date.now() - session.ts < SESSION_RESUME_WINDOW_MS
          ? session
          : null
      const isEasy =
        resumable === null
          ? isDeloadSession(history?.length ?? 0, plan.meta.frequency_per_week)
          : resumable.easy
      const todayPlan = isEasy ? lighterPlan(plan) : plan
      const exercises = resolveExercises(todayPlan.plan, profile.equipment)
      setState({
        exercises,
        initialElapsedSeconds: resumable?.elapsed ?? 0,
        initialLogs:
          resumable === null
            ? buildInitialLogs(exercises, progress)
            : reconcileLogs(exercises, resumable.logs, progress),
        initialProgress: progress,
        isEasy,
        profile,
        startIndex:
          resumable === null
            ? 0
            : Math.min(resumable.idx, Math.max(0, exercises.length - 1)),
        status: 'ready',
      })
    })()
    return () => {
      isActive = false
    }
  }, [router])

  if (state.status === 'loading') {
    return (
      <main
        aria-busy="true"
        className="bg-d-bg flex flex-1 items-center justify-center"
      >
        <p className="text-d-ink-3 text-2xs font-mono tracking-widest uppercase">
          {t('loading')}
        </p>
      </main>
    )
  }

  return (
    <WorkoutSession
      exercises={state.exercises}
      initialElapsedSeconds={state.initialElapsedSeconds}
      initialLogs={state.initialLogs}
      initialProgress={state.initialProgress}
      isEasy={state.isEasy}
      profile={state.profile}
      startIndex={state.startIndex}
    />
  )
}
