import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  CheckIcon,
  ChevronRightIcon,
  SkipForwardIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { QUIET_ACTION } from '@/styles/type'

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

const DISCARD_BUTTON = cn(QUIET_ACTION, 'text-d-ink-3 mt-1 w-full')

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
      <Button
        className="w-full"
        onClick={onSkip}
        size="sm"
        tone="dark"
        variant="ghost"
      >
        <SkipForwardIcon size={16} />
        {t('skip')}
      </Button>

      {isReviewing ? (
        <Button
          className="w-full"
          onClick={onContinueReview}
          tone="dark"
          variant="ink"
        >
          {t('continueTo', { index: continueIndex + 1 })}
          <ChevronRightIcon size={20} />
        </Button>
      ) : (
        <Button
          className="w-full"
          onClick={onForward}
          tone="dark"
          variant="ink"
        >
          {t(isLastExercise ? 'finishWorkout' : 'nextExercise')}
          <ChevronRightIcon size={20} />
        </Button>
      )}

      {canSaveAndExit ? (
        <Button
          className="w-full"
          onClick={onSaveAndExit}
          size="sm"
          tone="dark"
          variant="ghost"
        >
          <CheckIcon size={16} />
          {t('saveAndExit')}
        </Button>
      ) : null}

      {isConfirmingDiscard ? (
        <div className="flex gap-2.5">
          <Button
            className="flex-1"
            onClick={onCancelDiscard}
            size="md"
            tone="dark"
            variant="ghost"
          >
            {t('discardCancel')}
          </Button>
          <Button
            className="flex-1"
            onClick={onConfirmDiscard}
            size="md"
            tone="dark"
          >
            {t('discardConfirm')}
          </Button>
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
