import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import type { StepDotStatus } from '@/components/ui/step-dots'
import { buildFinishResult } from '@/features/workout/lib/finish'
import { isExerciseDone } from '@/features/workout/lib/session'
import { snapWeight, stepWeight } from '@/features/workout/lib/weights'
import type { WorkoutExercise } from '@/features/workout/types'
import { useAudio } from '@/hooks/use-audio'
import { useWakeLock } from '@/hooks/use-wake-lock'
import { useRouter } from '@/i18n/routing'
import { vibrate } from '@/lib/haptics'
import {
  clearSession,
  loadHistory,
  saveHistory,
  saveProfile,
  saveProgress,
  saveSession,
} from '@/lib/storage'
import type { Profile } from '@/types/profile'
import type {
  ExerciseLog,
  ExerciseStatus,
  WorkoutProgress,
  WorkoutRecord,
  WorkoutSet,
} from '@/types/workout'

type Logs = Record<string, ExerciseLog>

/** Everything the loader hands the session — see `WorkoutScreen`. */
export type WorkoutSessionInput = {
  exercises: readonly WorkoutExercise[]
  initialElapsedSeconds: number
  initialLogs: Logs
  initialProgress: null | WorkoutProgress
  isEasy: boolean
  profile: Profile
  startIndex: number
}

type Rest = {
  remainingSeconds: number
  totalSeconds: number
}

type Hold = {
  seconds: number
  setIndex: number
}

/** The rest overlay's content plus its live countdown. */
export type RestPanel = {
  ctaLabel: string
  detail: string
  heading: string
  isLastStep: boolean
  name: string
  onContinue: () => void
  remainingSeconds: number
  totalSeconds: number
}

type Step = {
  id: string
  status: StepDotStatus
}

/** The running workout: everything the active screen renders and calls. */
export type ActiveSession = {
  addRestTime: () => void
  adjustReps: (delta: number) => void
  adjustWeight: (direction: -1 | 1) => void
  cancelDiscard: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  clearFocus: () => void
  confirmDiscard: () => void
  continueIndex: number
  continueReview: () => void
  currentExercise: WorkoutExercise
  doneCount: number
  elapsedSeconds: number
  exerciseCount: number
  exerciseIndex: number
  focusSet: (index: number) => void
  focusSetIndex: null | number
  forward: () => void
  goToNext: () => void
  goToPrevious: () => void
  hasAnyLogged: boolean
  heroSet: null | WorkoutSet
  holdRunningSeconds: null | number
  isConfirmingDiscard: boolean
  isEditing: boolean
  isLastExercise: boolean
  isMuted: boolean
  isReviewing: boolean
  logSet: () => void
  phase: 'active'
  requestDiscard: () => void
  rest: null | RestPanel
  saveAndExit: () => void
  saveEdit: () => void
  setReps: (value: number) => void
  sets: readonly WorkoutSet[]
  setWeight: (value: number) => void
  skipExercise: () => void
  startHold: () => void
  steps: readonly Step[]
  stopHold: () => void
  toggleMute: () => void
  undoSet: () => void
}

/** The finished workout: what the summary screen shows and its exit. */
export type SummarySession = {
  completedCount: number
  durationSeconds: number
  leave: () => void
  phase: 'summary'
  skippedNames: readonly string[]
  volumeKg: number
}

type Summary = {
  completedCount: number
  skippedNames: string[]
  volumeKg: number
}

const ONE_SECOND_MS = 1000
const TAP_VIBRATION_MS = 14
const REST_END_VIBRATION = [40, 60, 40]
const REST_BONUS_SECONDS = 30
const MAX_HISTORY_ENTRIES = 120

const withStatus = (
  logs: Logs,
  exerciseId: string,
  status: ExerciseStatus,
): Logs => ({
  ...logs,
  [exerciseId]: { ...logs[exerciseId], status },
})

const withUpdatedSet = (
  logs: Logs,
  exerciseId: string,
  targetIndex: number,
  update: (set: WorkoutSet) => WorkoutSet,
): Logs => ({
  ...logs,
  [exerciseId]: {
    ...logs[exerciseId],
    sets: logs[exerciseId].sets.map((set, position) =>
      position === targetIndex ? update(set) : set,
    ),
  },
})

const statusAfterLeaving = (log: ExerciseLog): ExerciseStatus => {
  if (log.status === 'skipped') {
    return 'skipped'
  }
  return log.sets.some((set) => set.done) ? 'done' : 'pending'
}

const appendRecord = async (record: WorkoutRecord): Promise<void> => {
  const history = await loadHistory()
  const next = [...(history ?? []), record].slice(-MAX_HISTORY_ENTRIES)
  await saveHistory(next)
}

/**
 * The live workout state machine: set logging, rest, holds, skips, editing
 * and the finish/summary transition. It owns the wake lock, the audio and
 * haptic cues and the crash-safe session persistence; all scoring lives in
 * the pure `lib/finish` helper, and all layout in `WorkoutSession`, which
 * just renders what this hook returns.
 */
export const useWorkoutSession = ({
  exercises,
  initialElapsedSeconds,
  initialLogs,
  initialProgress,
  isEasy,
  profile,
  startIndex,
}: WorkoutSessionInput): ActiveSession | SummarySession => {
  const t = useTranslations('workout')
  const tExercise = useTranslations('exercises')
  const router = useRouter()
  const audio = useAudio()

  const [phase, setPhase] = useState<'active' | 'summary'>('active')
  const [index, setIndex] = useState(startIndex)
  const [logs, setLogs] = useState<Logs>(initialLogs)
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds)
  const [rest, setRest] = useState<null | Rest>(null)
  const [hold, setHold] = useState<Hold | null>(null)
  const [focusSetIndex, setFocusSetIndex] = useState<null | number>(null)
  const [isMuted, setIsMuted] = useState(profile.muted)
  const [summary, setSummary] = useState<null | Summary>(null)
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false)

  const previousRestRemaining = useRef<null | number>(null)
  const elapsedRef = useRef(initialElapsedSeconds)

  useWakeLock(phase === 'active')

  useEffect(() => {
    if (phase !== 'active') {
      return
    }
    const timer = setInterval(() => {
      setElapsedSeconds((value) => value + 1)
      setRest((current) =>
        current !== null && current.remainingSeconds > 0
          ? { ...current, remainingSeconds: current.remainingSeconds - 1 }
          : current,
      )
      setHold((current) =>
        current === null
          ? current
          : { ...current, seconds: current.seconds + 1 },
      )
    }, ONE_SECOND_MS)
    return () => {
      clearInterval(timer)
    }
  }, [phase])

  // Rest-over cue: fire once as the countdown crosses zero. Haptics run even
  // when muted — mute governs sound only (BUILD-GUIDE §4).
  useEffect(() => {
    const remaining = rest === null ? null : rest.remainingSeconds
    const isCountdownRunning =
      previousRestRemaining.current !== null &&
      previousRestRemaining.current > 0
    if (remaining === 0 && isCountdownRunning) {
      if (!isMuted) {
        audio.restDone()
      }
      vibrate(REST_END_VIBRATION)
    }
    previousRestRemaining.current = remaining
  })

  // Keep the latest elapsed time without re-persisting every tick.
  useEffect(() => {
    elapsedRef.current = elapsedSeconds
  }, [elapsedSeconds])

  // Persist the session on every meaningful change so a refresh or crash
  // mid-workout resumes where the user left off (never on the per-second tick).
  useEffect(() => {
    if (phase !== 'active') {
      return
    }
    void saveSession({
      easy: isEasy,
      elapsed: elapsedRef.current,
      idx: index,
      logs,
      ts: Date.now(),
    })
  }, [index, isEasy, logs, phase])

  if (phase === 'summary' && summary !== null) {
    return {
      completedCount: summary.completedCount,
      durationSeconds: elapsedSeconds,
      leave: () => router.replace('/app'),
      phase: 'summary',
      skippedNames: summary.skippedNames,
      volumeKg: summary.volumeKg,
    }
  }

  const currentExercise = exercises[index]
  const log = logs[currentExercise.id]
  const sets = log.sets
  const firstUndoneIndex = sets.findIndex((set) => !set.done)
  const isAllSetsDone = firstUndoneIndex === -1
  const isEditing = focusSetIndex !== null
  const heroIndex = focusSetIndex ?? firstUndoneIndex
  const heroSet = heroIndex >= 0 ? sets[heroIndex] : null
  const doneCount = sets.filter((set) => set.done).length
  const frontierIndex = exercises.findIndex(
    (exercise) => !isExerciseDone(logs[exercise.id]),
  )
  const isReviewing = frontierIndex !== -1 && index < frontierIndex
  const maxReachableIndex =
    frontierIndex === -1 ? exercises.length - 1 : frontierIndex
  const hasAnyLogged = exercises.some((exercise) =>
    logs[exercise.id]?.sets.some((set) => set.done),
  )
  const isLastExercise = index >= exercises.length - 1

  const stepStatus = (
    exercise: WorkoutExercise,
    position: number,
  ): StepDotStatus => {
    if (isExerciseDone(logs[exercise.id])) {
      return 'done'
    }
    return position === index ? 'current' : 'upcoming'
  }

  const steps = exercises.map((exercise, position) => ({
    id: exercise.id,
    status: stepStatus(exercise, position),
  }))

  const finishWorkout = (sourceLogs: Logs) => {
    const result = buildFinishResult({
      elapsedSeconds,
      exercises,
      isEasy,
      logs: sourceLogs,
      progress: initialProgress,
    })
    void saveProgress(result.progress)
    if (result.record !== null) {
      void appendRecord(result.record)
    }
    void clearSession()
    const skippedNames = exercises
      .filter((exercise) => sourceLogs[exercise.id]?.status === 'skipped')
      .map((exercise) => tExercise(`${exercise.id}.name`))
    const completedCount = exercises.filter((exercise) => {
      const entry = sourceLogs[exercise.id]
      return entry.status !== 'skipped' && entry.sets.some((set) => set.done)
    }).length
    setSummary({
      completedCount,
      skippedNames,
      volumeKg: result.progress.last?.volume ?? 0,
    })
    setRest(null)
    setHold(null)
    setPhase('summary')
  }

  const advanceAfterSet = (exercise: WorkoutExercise, nextLogs: Logs) => {
    const isWorkoutDone = exercises.every((item) =>
      isExerciseDone(nextLogs[item.id]),
    )
    if (isWorkoutDone) {
      const finalLogs = withStatus(nextLogs, exercise.id, 'done')
      setLogs(finalLogs)
      finishWorkout(finalLogs)
      return
    }
    setLogs(nextLogs)
    setRest({
      remainingSeconds: exercise.restSeconds,
      totalSeconds: exercise.restSeconds,
    })
  }

  const logSet = () => {
    if (heroSet === null) {
      return
    }
    const nextSets = sets.map((set, position) => {
      if (position === heroIndex) {
        return { ...set, done: true }
      }
      if (!currentExercise.isHold && position === heroIndex + 1) {
        return { ...set, reps: heroSet.reps, weight: heroSet.weight }
      }
      return set
    })
    const nextLogs = {
      ...logs,
      [currentExercise.id]: { ...log, sets: nextSets },
    }
    audio.unlock()
    if (!isMuted) {
      audio.tick()
    }
    vibrate(TAP_VIBRATION_MS)
    setFocusSetIndex(null)
    advanceAfterSet(currentExercise, nextLogs)
  }

  const editHeroSet = (update: (set: WorkoutSet) => WorkoutSet) => {
    if (heroSet === null) {
      return
    }
    setLogs(withUpdatedSet(logs, currentExercise.id, heroIndex, update))
  }

  const adjustReps = (delta: number) => {
    editHeroSet((set) => ({ ...set, reps: Math.max(0, set.reps + delta) }))
  }

  const setReps = (value: number) => {
    editHeroSet((set) => ({ ...set, reps: Math.max(0, Math.round(value)) }))
  }

  const adjustWeight = (direction: -1 | 1) => {
    editHeroSet((set) => ({
      ...set,
      weight: stepWeight(currentExercise.weights, set.weight, direction),
    }))
  }

  const setWeight = (value: number) => {
    editHeroSet((set) => ({
      ...set,
      weight: snapWeight(currentExercise.weights, value),
    }))
  }

  const saveEdit = () => {
    setFocusSetIndex(null)
  }

  const undoSet = () => {
    if (focusSetIndex === null) {
      return
    }
    const nextLogs = withUpdatedSet(
      logs,
      currentExercise.id,
      focusSetIndex,
      (set) => ({ ...set, done: false }),
    )
    setLogs(nextLogs)
    setRest(null)
    setFocusSetIndex(null)
  }

  const startHold = () => {
    if (heroSet === null) {
      return
    }
    audio.unlock()
    setHold({ seconds: 0, setIndex: heroIndex })
  }

  const stopHold = () => {
    if (hold === null) {
      return
    }
    const seconds = hold.seconds
    const nextLogs = withUpdatedSet(
      logs,
      currentExercise.id,
      hold.setIndex,
      (set) => ({ ...set, done: true, secs: seconds }),
    )
    audio.unlock()
    if (!isMuted) {
      audio.tick()
    }
    vibrate(TAP_VIBRATION_MS)
    setHold(null)
    advanceAfterSet(currentExercise, nextLogs)
  }

  const goToExercise = (target: number) => {
    const nextLogs = withStatus(
      logs,
      currentExercise.id,
      statusAfterLeaving(log),
    )
    const clamped = Math.max(0, Math.min(exercises.length - 1, target))
    setLogs(nextLogs)
    setRest(null)
    setHold(null)
    setFocusSetIndex(null)
    setIndex(clamped)
  }

  const forward = () => {
    if (!isLastExercise) {
      goToExercise(index + 1)
      return
    }
    const nextLogs = withStatus(
      logs,
      currentExercise.id,
      statusAfterLeaving(log),
    )
    setLogs(nextLogs)
    finishWorkout(nextLogs)
  }

  const skipExercise = () => {
    const nextLogs = withStatus(logs, currentExercise.id, 'skipped')
    setLogs(nextLogs)
    setRest(null)
    setHold(null)
    setFocusSetIndex(null)
    vibrate(TAP_VIBRATION_MS)
    if (isLastExercise) {
      finishWorkout(nextLogs)
      return
    }
    setIndex(index + 1)
  }

  const toggleMute = () => {
    const isNextIsMuted = !isMuted
    setIsMuted(isNextIsMuted)
    audio.unlock()
    void saveProfile({ ...profile, muted: isNextIsMuted })
  }

  const addRestTime = () => {
    setRest((current) => {
      if (current === null) {
        return current
      }
      const remainingSeconds = current.remainingSeconds + REST_BONUS_SECONDS
      return {
        remainingSeconds,
        totalSeconds: Math.max(current.totalSeconds, remainingSeconds),
      }
    })
  }

  const confirmDiscard = () => {
    void clearSession()
    router.replace('/app')
  }

  const describeSet = (exercise: WorkoutExercise, set: WorkoutSet): string => {
    if (exercise.isHold) {
      return exercise.holdSeconds === null
        ? ''
        : t('rest.holdDetail', { seconds: exercise.holdSeconds })
    }
    return t('rest.loadDetail', { reps: set.reps, weight: set.weight })
  }

  const describeRest = (current: Rest): RestPanel => {
    const countdown = {
      remainingSeconds: current.remainingSeconds,
      totalSeconds: current.totalSeconds,
    }
    if (!isAllSetsDone) {
      return {
        ...countdown,
        ctaLabel: t('rest.startSet', { index: firstUndoneIndex + 1 }),
        detail: describeSet(currentExercise, sets[firstUndoneIndex]),
        heading: t('rest.nextSet', {
          index: firstUndoneIndex + 1,
          total: sets.length,
        }),
        isLastStep: false,
        name: tExercise(`${currentExercise.id}.name`),
        onContinue: () => setRest(null),
      }
    }
    if (!isLastExercise) {
      const nextExercise = exercises[index + 1]
      return {
        ...countdown,
        ctaLabel: t('rest.nextExerciseCta'),
        detail: describeSet(nextExercise, logs[nextExercise.id].sets[0]),
        heading: t('rest.nextExercise'),
        isLastStep: false,
        name: tExercise(`${nextExercise.id}.name`),
        onContinue: () => goToExercise(index + 1),
      }
    }
    return {
      ...countdown,
      ctaLabel: t('finishWorkout'),
      detail: '',
      heading: t('rest.lastDoneHeading'),
      isLastStep: true,
      name: t('rest.lastDoneName'),
      onContinue: forward,
    }
  }

  return {
    addRestTime,
    adjustReps,
    adjustWeight,
    canGoNext: index < maxReachableIndex,
    canGoPrevious: index > 0,
    cancelDiscard: () => setIsConfirmingDiscard(false),
    clearFocus: () => setFocusSetIndex(null),
    confirmDiscard,
    continueIndex: frontierIndex,
    continueReview: () => goToExercise(frontierIndex),
    currentExercise,
    doneCount,
    elapsedSeconds,
    exerciseCount: exercises.length,
    exerciseIndex: index,
    focusSet: (target: number) => setFocusSetIndex(target),
    focusSetIndex,
    forward,
    goToNext: () => goToExercise(index + 1),
    goToPrevious: () => goToExercise(index - 1),
    hasAnyLogged,
    heroSet,
    holdRunningSeconds:
      hold !== null && hold.setIndex === heroIndex ? hold.seconds : null,
    isConfirmingDiscard,
    isEditing,
    isLastExercise,
    isMuted,
    isReviewing,
    logSet,
    phase: 'active',
    requestDiscard: () => setIsConfirmingDiscard(true),
    rest: rest === null ? null : describeRest(rest),
    saveAndExit: () => finishWorkout(logs),
    saveEdit,
    setReps,
    setWeight,
    sets,
    skipExercise,
    startHold,
    steps,
    stopHold,
    toggleMute,
    undoSet,
  }
}
