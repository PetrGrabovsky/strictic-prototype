import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Disc } from '@/components/ui/disc'
import type { StepDotStatus } from '@/components/ui/step-dots'
import { RestOverlay } from '@/features/workout/components/rest-overlay'
import { SetInput } from '@/features/workout/components/set-input'
import { SetTray } from '@/features/workout/components/set-tray'
import { WorkoutActions } from '@/features/workout/components/workout-actions'
import { WorkoutControls } from '@/features/workout/components/workout-controls'
import { WorkoutSummary } from '@/features/workout/components/workout-summary'
import { buildFinishResult } from '@/features/workout/lib/finish'
import { isExerciseDone } from '@/features/workout/lib/session'
import { snapWeight, stepWeight } from '@/features/workout/lib/weights'
import type { WorkoutExercise } from '@/features/workout/types'
import { useAudio } from '@/hooks/use-audio'
import { useHaptics } from '@/hooks/use-haptics'
import { useWakeLock } from '@/hooks/use-wake-lock'
import { useRouter } from '@/i18n/routing'
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

type Props = {
  exercises: readonly WorkoutExercise[]
  initialElapsedSeconds: number
  initialLogs: Logs
  initialProgress: null | WorkoutProgress
  isEasy: boolean
  profile: Profile
  startIndex: number
}

type Rest = {
  left: number
  total: number
}

type Hold = {
  seconds: number
  setIndex: number
}

type Summary = {
  completedCount: number
  skippedNames: string[]
  volumeKg: number
}

type RestContext = {
  cta: string
  detail: string
  heading: string
  isLast: boolean
  name: string
  onContinue: () => void
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
 * The live workout state machine: set logging, rest, skips, editing and the
 * finish/summary transition. It owns the wake lock, audio/haptics cues and the
 * session persistence; all scoring lives in the pure `lib/finish` helper.
 */
export const WorkoutSession = ({
  exercises,
  initialElapsedSeconds,
  initialLogs,
  initialProgress,
  isEasy,
  profile,
  startIndex,
}: Props) => {
  const t = useTranslations('workout')
  const tExercise = useTranslations('exercises')
  const router = useRouter()
  const audio = useAudio()
  const haptics = useHaptics()

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

  const previousRestLeft = useRef<null | number>(null)
  const elapsedRef = useRef(initialElapsedSeconds)

  useWakeLock(phase === 'active')

  useEffect(() => {
    if (phase !== 'active') {
      return
    }
    const timer = setInterval(() => {
      setElapsedSeconds((value) => value + 1)
      setRest((current) =>
        current !== null && current.left > 0
          ? { ...current, left: current.left - 1 }
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
    const left = rest === null ? null : rest.left
    const isCountdownRunning =
      previousRestLeft.current !== null && previousRestLeft.current > 0
    if (left === 0 && isCountdownRunning) {
      if (!isMuted) {
        audio.restDone()
      }
      haptics.vibrate(REST_END_VIBRATION)
    }
    previousRestLeft.current = left
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
    return (
      <WorkoutSummary
        completedCount={summary.completedCount}
        durationSeconds={elapsedSeconds}
        isEasy={isEasy}
        onLeave={() => router.replace('/app')}
        skippedNames={summary.skippedNames}
        volumeKg={summary.volumeKg}
      />
    )
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
  const navMax = frontierIndex === -1 ? exercises.length - 1 : frontierIndex
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
    setRest({ left: exercise.restSeconds, total: exercise.restSeconds })
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
    haptics.vibrate(TAP_VIBRATION_MS)
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

  const setWeightValue = (value: number) => {
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
    haptics.vibrate(TAP_VIBRATION_MS)
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

  const handleForward = () => {
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
    haptics.vibrate(TAP_VIBRATION_MS)
    if (isLastExercise) {
      finishWorkout(nextLogs)
      return
    }
    setIndex(index + 1)
  }

  const toggleMute = () => {
    const isNext = !isMuted
    setIsMuted(isNext)
    audio.unlock()
    void saveProfile({ ...profile, muted: isNext })
  }

  const addRestTime = () => {
    setRest((current) => {
      if (current === null) {
        return current
      }
      const left = current.left + REST_BONUS_SECONDS
      return { left, total: Math.max(current.total, left) }
    })
  }

  const discardWorkout = () => {
    void clearSession()
    router.replace('/app')
  }

  const setDetail = (exercise: WorkoutExercise, set: WorkoutSet): string => {
    if (exercise.isHold) {
      return exercise.holdSeconds === null
        ? ''
        : t('rest.holdDetail', { seconds: exercise.holdSeconds })
    }
    return t('rest.loadDetail', { reps: set.reps, weight: set.weight })
  }

  const describeRest = (): RestContext => {
    if (!isAllSetsDone) {
      return {
        cta: t('rest.startSet', { index: firstUndoneIndex + 1 }),
        detail: setDetail(currentExercise, sets[firstUndoneIndex]),
        heading: t('rest.nextSet', {
          index: firstUndoneIndex + 1,
          total: sets.length,
        }),
        isLast: false,
        name: tExercise(`${currentExercise.id}.name`),
        onContinue: () => setRest(null),
      }
    }
    if (!isLastExercise) {
      const nextExercise = exercises[index + 1]
      return {
        cta: t('rest.nextExerciseCta'),
        detail: setDetail(nextExercise, logs[nextExercise.id].sets[0]),
        heading: t('rest.nextExercise'),
        isLast: false,
        name: tExercise(`${nextExercise.id}.name`),
        onContinue: () => goToExercise(index + 1),
      }
    }
    return {
      cta: t('finishWorkout'),
      detail: '',
      heading: t('rest.lastDoneHeading'),
      isLast: true,
      name: t('rest.lastDoneName'),
      onContinue: handleForward,
    }
  }

  const restContext = rest === null ? null : describeRest()
  const holdRunningSeconds =
    hold !== null && hold.setIndex === heroIndex ? hold.seconds : null

  return (
    <main className="bg-d-bg text-d-ink flex flex-1 flex-col">
      <WorkoutControls
        canGoNext={index < navMax}
        canGoPrevious={index > 0}
        currentIndex={index}
        elapsedSeconds={elapsedSeconds}
        isEasy={isEasy}
        isMuted={isMuted}
        onNext={() => goToExercise(index + 1)}
        onPrevious={() => goToExercise(index - 1)}
        onToggleMute={toggleMute}
        steps={steps}
        total={exercises.length}
      />

      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-5 pb-40">
        <div className="flex items-start gap-3">
          <Disc dark>{index + 1}</Disc>
          <h1 className="text-d-ink mt-0.5 text-xl leading-tight font-semibold">
            {tExercise(`${currentExercise.id}.name`)}
          </h1>
        </div>

        <SetTray
          exerciseId={currentExercise.id}
          focusSetIndex={focusSetIndex}
          isHold={currentExercise.isHold}
          onClearFocus={() => setFocusSetIndex(null)}
          onFocusSet={(position) => setFocusSetIndex(position)}
          sets={sets}
        />

        <SetInput
          doneCount={doneCount}
          exercise={currentExercise}
          heroSet={heroSet}
          holdRunningSeconds={holdRunningSeconds}
          isEditing={isEditing}
          onAdjustReps={adjustReps}
          onAdjustWeight={adjustWeight}
          onLogSet={logSet}
          onSaveEdit={saveEdit}
          onSetReps={setReps}
          onSetWeight={setWeightValue}
          onStartHold={startHold}
          onStopHold={stopHold}
          onUndoSet={undoSet}
        />

        <WorkoutActions
          canSaveAndExit={hasAnyLogged}
          continueIndex={frontierIndex}
          isConfirmingDiscard={isConfirmingDiscard}
          isLastExercise={isLastExercise}
          isReviewing={isReviewing}
          onCancelDiscard={() => setIsConfirmingDiscard(false)}
          onConfirmDiscard={discardWorkout}
          onContinueReview={() => goToExercise(frontierIndex)}
          onForward={handleForward}
          onRequestDiscard={() => setIsConfirmingDiscard(true)}
          onSaveAndExit={() => finishWorkout(logs)}
          onSkip={skipExercise}
        />
      </div>

      {rest !== null && restContext !== null ? (
        <RestOverlay
          ctaLabel={restContext.cta}
          detail={restContext.detail}
          elapsedSeconds={elapsedSeconds}
          heading={restContext.heading}
          isEasy={isEasy}
          isLastStep={restContext.isLast}
          name={restContext.name}
          onAddTime={addRestTime}
          onContinue={restContext.onContinue}
          remainingSeconds={rest.left}
          totalSeconds={rest.total}
        />
      ) : null}
    </main>
  )
}
