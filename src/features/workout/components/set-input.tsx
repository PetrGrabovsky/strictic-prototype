import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cardVariants } from '@/components/ui/card'
import { CheckIcon, PlayIcon, UndoIcon } from '@/components/ui/icons'
import { Stepper } from '@/components/ui/stepper'
import type { WorkoutExercise } from '@/features/workout/types'
import { cn } from '@/lib/cn'
import { QUIET_ACTION, SECTION_LABEL } from '@/styles/type'
import type { WorkoutSet } from '@/types/workout'

type Props = {
  doneCount: number
  exercise: WorkoutExercise
  heroSet: null | WorkoutSet
  holdRunningSeconds: null | number
  isEditing: boolean
  onAdjustReps: (delta: number) => void
  onAdjustWeight: (direction: -1 | 1) => void
  onLogSet: () => void
  onSaveEdit: () => void
  onSetReps: (value: number) => void
  onSetWeight: (value: number) => void
  onStartHold: () => void
  onStopHold: () => void
  onUndoSet: () => void
}

type LoadedProps = Omit<Props, 'heroSet'> & { heroSet: WorkoutSet }

type DoneProps = {
  doneCount: number
  totalSets: number
}

type EditActionsProps = {
  onSave: () => void
  onUndo: () => void
}

type HeaderProps = {
  exercise: WorkoutExercise
  isEditing: boolean
}

const CARD = cn(cardVariants({ tone: 'dark' }), 'mt-3')

const QUIET_BUTTON = cn(QUIET_ACTION, 'text-d-ink-3 mt-2 w-full')

/**
 * The focused set: reps steppers, a hold timer, or — once every set is
 * logged and the user isn't editing — a "done" card. Dark ink on the accent
 * log button keeps contrast readable (BUILD-GUIDE §4); every number is
 * tabular so values don't jump as they change.
 */
export const SetInput = (props: Props) => {
  if (props.heroSet === null) {
    return (
      <ExerciseDoneCard
        doneCount={props.doneCount}
        totalSets={props.exercise.sets}
      />
    )
  }
  if (props.exercise.isHold) {
    return <HoldInput {...props} heroSet={props.heroSet} />
  }
  return <RepsInput {...props} heroSet={props.heroSet} />
}

const CardHeader = ({ exercise, isEditing }: HeaderProps) => {
  const t = useTranslations('workout')
  const target = exercise.isHold
    ? t('targetHold', { seconds: exercise.holdSeconds ?? 0 })
    : t('targetReps', { reps: exercise.targetReps ?? 0 })

  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          SECTION_LABEL,
          'text-d-accent inline-flex items-center gap-2',
        )}
      >
        {isEditing ? <UndoIcon size={14} /> : null}
        {t(isEditing ? 'set.editingLabel' : 'set.activeLabel')}
      </span>
      <span className="text-d-ink-3 font-mono text-xs tabular-nums">
        {target}
      </span>
    </div>
  )
}

const EditActions = ({ onSave, onUndo }: EditActionsProps) => {
  const t = useTranslations('workout')
  return (
    <div>
      <Button
        className="mt-3 w-full"
        onClick={onSave}
        size="sm"
        tone="dark"
        variant="ghost"
      >
        <CheckIcon size={16} />
        {t('saveEdit')}
      </Button>
      <button className={QUIET_BUTTON} onClick={onUndo} type="button">
        <UndoIcon size={14} />
        {t('undoSet')}
      </button>
    </div>
  )
}

const RepsInput = ({
  exercise,
  heroSet,
  isEditing,
  onAdjustReps,
  onAdjustWeight,
  onLogSet,
  onSaveEdit,
  onSetReps,
  onSetWeight,
  onUndoSet,
}: LoadedProps) => {
  const t = useTranslations('workout')
  const weightLabel = t(exercise.perHand ? 'weightUnitPerHand' : 'weightUnit')
  const edge = isEditing ? 'border-l-2 border-dashed' : 'border-l-2'

  return (
    <div className={cn(CARD, 'border-l-d-accent', edge)}>
      <CardHeader exercise={exercise} isEditing={isEditing} />
      <div className="mt-3 flex gap-3">
        <Stepper
          active
          decreaseLabel={t('repsDecrease')}
          increaseLabel={t('repsIncrease')}
          label={t('repsLabel')}
          onDecrement={() => onAdjustReps(-1)}
          onIncrement={() => onAdjustReps(1)}
          onSet={onSetReps}
          tone="dark"
          value={heroSet.reps}
        />
        <Stepper
          active
          decreaseLabel={t('weightDecrease')}
          increaseLabel={t('weightIncrease')}
          label={weightLabel}
          onDecrement={() => onAdjustWeight(-1)}
          onIncrement={() => onAdjustWeight(1)}
          onSet={onSetWeight}
          tone="dark"
          value={heroSet.weight}
        />
      </div>
      {isEditing ? (
        <EditActions onSave={onSaveEdit} onUndo={onUndoSet} />
      ) : (
        <Button className="mt-3 w-full" onClick={onLogSet} tone="dark">
          <CheckIcon size={18} />
          {t('logSet')}
        </Button>
      )}
    </div>
  )
}

const HoldInput = ({
  exercise,
  heroSet,
  holdRunningSeconds,
  isEditing,
  onSaveEdit,
  onStartHold,
  onStopHold,
  onUndoSet,
}: LoadedProps) => {
  const t = useTranslations('workout')
  const isRunning = holdRunningSeconds !== null

  return (
    <div className={cn(CARD, 'border-l-d-accent border-l-2')}>
      <CardHeader exercise={exercise} isEditing={isEditing} />
      <div className="py-4 text-center">
        <span className="text-d-ink text-2xl font-semibold tabular-nums">
          {holdDisplay(isEditing, heroSet, holdRunningSeconds, t('holdReady'))}
        </span>
      </div>
      {isEditing ? (
        <EditActions onSave={onSaveEdit} onUndo={onUndoSet} />
      ) : null}
      {!isEditing && isRunning ? (
        <Button className="mt-3 w-full" onClick={onStopHold} tone="dark">
          <CheckIcon size={18} />
          {t('stopHold')}
        </Button>
      ) : null}
      {!isEditing && !isRunning ? (
        <Button
          className="mt-3 w-full"
          onClick={onStartHold}
          size="sm"
          tone="dark"
          variant="ghost"
        >
          <PlayIcon size={16} />
          {t('startHold')}
        </Button>
      ) : null}
    </div>
  )
}

const ExerciseDoneCard = ({ doneCount, totalSets }: DoneProps) => {
  const t = useTranslations('workout')
  return (
    <div
      className={cn(
        CARD,
        'border-l-d-green flex items-center gap-3 border-l-2',
      )}
    >
      <span className="bg-d-green/20 text-d-green flex size-10 items-center justify-center rounded-full">
        <CheckIcon size={20} />
      </span>
      <div>
        <p className="text-d-ink text-base font-semibold">
          {t('exerciseDone')}
        </p>
        <p className="text-d-ink-2 mt-0.5 font-mono text-xs tabular-nums">
          {t('setsLogged', { done: doneCount, total: totalSets })}
        </p>
      </div>
    </div>
  )
}

const holdDisplay = (
  isEditing: boolean,
  heroSet: WorkoutSet,
  runningSeconds: null | number,
  readyLabel: string,
): string => {
  if (isEditing) {
    return `${heroSet.secs ?? 0}s`
  }
  if (runningSeconds !== null) {
    return `${runningSeconds}s`
  }
  return readyLabel
}
