import { useTranslations } from 'next-intl'
import { ActionButton } from '@/features/workout/components/action-button'
import {
  CheckIcon,
  ChevronRightIcon,
  SkipForwardIcon,
} from '@/features/workout/components/icons'
import { cn } from '@/lib/cn'

type Props = {
  canSaveAndExit: boolean
  continueIndex: number
  isConfirmingDiscard: boolean
  isLastExercise: boolean
  isReviewing: boolean
  onCancelDiscard: () => void
  onConfirmDiscard: () => void
  onContinueReview: () => void
  onForward: () => void
  onRequestDiscard: () => void
  onSaveAndExit: () => void
  onSkip: () => void
}

const DISCARD_BUTTON = cn(
  'text-d-ink-3 mt-1 w-full py-2.5 text-center touch-manipulation',
  'font-mono text-2xs tracking-wide uppercase',
)

/**
 * The stacked action rail below the set input: skip, advance/finish, the
 * "end and save what I have" escape hatch (only once something is logged), and
 * a two-tap discard. Advancing is split from skipping so a skip's finished sets
 * are never mistaken for an abandon.
 */
export const WorkoutActions = ({
  canSaveAndExit,
  continueIndex,
  isConfirmingDiscard,
  isLastExercise,
  isReviewing,
  onCancelDiscard,
  onConfirmDiscard,
  onContinueReview,
  onForward,
  onRequestDiscard,
  onSaveAndExit,
  onSkip,
}: Props) => {
  const t = useTranslations('workout')

  return (
    <div className="mt-6 flex flex-col gap-2.5">
      <ActionButton onClick={onSkip} size="sm" variant="outline">
        <SkipForwardIcon size={16} />
        {t('skip')}
      </ActionButton>

      {isReviewing ? (
        <ActionButton onClick={onContinueReview} variant="ink">
          {t('continueTo', { index: continueIndex + 1 })}
          <ChevronRightIcon size={20} />
        </ActionButton>
      ) : (
        <ActionButton onClick={onForward} variant="ink">
          {t(isLastExercise ? 'finishWorkout' : 'nextExercise')}
          <ChevronRightIcon size={20} />
        </ActionButton>
      )}

      {canSaveAndExit ? (
        <ActionButton onClick={onSaveAndExit} size="sm" variant="outline">
          <CheckIcon size={16} />
          {t('saveAndExit')}
        </ActionButton>
      ) : null}

      {isConfirmingDiscard ? (
        <div className="flex gap-2.5">
          <ActionButton onClick={onCancelDiscard} size="sm" variant="outline">
            {t('discardCancel')}
          </ActionButton>
          <ActionButton
            className="font-bold"
            onClick={onConfirmDiscard}
            size="sm"
          >
            {t('discardConfirm')}
          </ActionButton>
        </div>
      ) : (
        <button
          className={DISCARD_BUTTON}
          onClick={onRequestDiscard}
          type="button"
        >
          {t('discard')}
        </button>
      )}
    </div>
  )
}
