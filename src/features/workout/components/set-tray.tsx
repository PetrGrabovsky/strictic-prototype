import { useTranslations } from 'next-intl'
import { UndoIcon } from '@/features/workout/components/icons'
import { cn } from '@/lib/cn'
import type { WorkoutSet } from '@/types/workout'

type SetVariant = 'current' | 'done' | 'editing' | 'upcoming'

type Props = {
  exerciseId: string
  focusSetIndex: null | number
  isHold: boolean
  onClearFocus: () => void
  onFocusSet: (index: number) => void
  sets: readonly WorkoutSet[]
}

const SET_BASE = cn(
  'flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md',
  'font-mono text-sm font-bold tabular-nums touch-manipulation',
)

/** Dark text on accent is the readable pairing — white on orange fails (§4). */
const SET_TONE: Record<SetVariant, string> = {
  current: 'border-2 border-d-accent bg-d-accent/10 text-d-accent',
  done: 'bg-d-accent text-d-bg',
  editing:
    'border-2 border-dashed border-d-accent bg-d-accent/10 text-d-accent',
  upcoming: 'border border-dashed border-d-line-2 text-d-ink-3',
}

const setVariant = (
  isDone: boolean,
  isEditing: boolean,
  isCurrent: boolean,
): SetVariant => {
  if (isEditing) {
    return 'editing'
  }
  if (isDone) {
    return 'done'
  }
  if (isCurrent) {
    return 'current'
  }
  return 'upcoming'
}

const renderChipValue = (isHold: boolean, set: WorkoutSet): string =>
  isHold ? `${set.secs ?? 0}s` : String(set.reps)

/**
 * The row of set chips plus the "tap a logged set to edit" hint. Logged sets
 * show their reps (or seconds for holds); the current set pulses; upcoming
 * sets are dashed placeholders. Every number is tabular so nothing jumps.
 */
export const SetTray = ({
  exerciseId,
  focusSetIndex,
  isHold,
  onClearFocus,
  onFocusSet,
  sets,
}: Props) => {
  const t = useTranslations('workout')
  const firstUndone = sets.findIndex((set) => !set.done)
  const doneCount = sets.filter((set) => set.done).length

  const chipLabel = (set: WorkoutSet, position: number): string => {
    if (set.done) {
      return isHold
        ? t('set.doneHold', { index: position + 1, seconds: set.secs ?? 0 })
        : t('set.doneReps', { index: position + 1, reps: set.reps })
    }
    return t(position === firstUndone ? 'set.current' : 'set.upcoming', {
      index: position + 1,
    })
  }

  return (
    <div>
      <div className="mt-5 flex gap-1.5">
        {sets.map((set, position) => {
          const key = `${exerciseId}-${position}`
          const isCurrent = position === firstUndone
          const isEditing = focusSetIndex === position
          const isClickable = set.done || isCurrent
          const variant = setVariant(set.done, isEditing, isCurrent)
          const onClick = set.done ? () => onFocusSet(position) : onClearFocus

          return (
            <button
              aria-current={
                isCurrent && focusSetIndex === null ? 'step' : undefined
              }
              aria-label={chipLabel(set, position)}
              className={cn(SET_BASE, SET_TONE[variant])}
              disabled={!isClickable}
              key={key}
              onClick={isClickable ? onClick : undefined}
              type="button"
            >
              {set.done ? renderChipValue(isHold, set) : position + 1}
            </button>
          )
        })}
      </div>

      {doneCount > 0 ? (
        <div
          className={cn(
            'text-d-ink-3 mt-2 flex items-center gap-1.5',
            'text-2xs font-mono tracking-wide uppercase',
          )}
        >
          <UndoIcon size={11} />
          {t('editHint')}
        </div>
      ) : null}
    </div>
  )
}
