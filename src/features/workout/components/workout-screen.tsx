'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { LoadingScreen } from '@/components/ui/loading-screen'
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
import { useStorageSnapshot } from '@/hooks/use-storage-snapshot'
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

type WorkoutSnapshot =
  | {
      exercises: readonly WorkoutExercise[]
      initialElapsedSeconds: number
      initialLogs: Record<string, ExerciseLog>
      initialProgress: null | WorkoutProgress
      isEasy: boolean
      profile: Profile
      startIndex: number
      status: 'ready'
    }
  | { status: 'onboarding' }

/**
 * Reads storage and assembles everything the session needs: today's plan
 * (lighter on a deload), the equipment-resolved exercises and — within the
 * resume window — an interrupted session's logs and position. A missing
 * profile or plan means onboarding is unfinished.
 */
const loadWorkoutSnapshot = async (): Promise<WorkoutSnapshot> => {
  const [profile, plan, history, progress, session] = await Promise.all([
    loadProfile(),
    loadPlan(),
    loadHistory(),
    loadProgress(),
    loadSession(),
  ])
  if (profile === null || plan === null) {
    return { status: 'onboarding' }
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
  return {
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
  }
}

/**
 * Client entry for the workout: hands the loaded snapshot to
 * {@link WorkoutSession}, or redirects to onboarding when there is nothing to
 * train from yet — matching the Home screen's guard.
 */
export const WorkoutScreen = () => {
  const t = useTranslations('workout')
  const router = useRouter()
  const snapshot = useStorageSnapshot(loadWorkoutSnapshot)

  const isOnboardingNeeded = snapshot?.status === 'onboarding'

  useEffect(() => {
    if (isOnboardingNeeded) {
      router.replace('/app/onboarding')
    }
  }, [isOnboardingNeeded, router])

  if (snapshot === null || isOnboardingNeeded) {
    return <LoadingScreen label={t('loading')} tone="dark" />
  }

  return (
    <WorkoutSession
      exercises={snapshot.exercises}
      initialElapsedSeconds={snapshot.initialElapsedSeconds}
      initialLogs={snapshot.initialLogs}
      initialProgress={snapshot.initialProgress}
      isEasy={snapshot.isEasy}
      profile={snapshot.profile}
      startIndex={snapshot.startIndex}
    />
  )
}
