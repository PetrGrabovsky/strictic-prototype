import { useTranslations } from 'next-intl'
import { StepDots } from '@/components/ui/step-dots'
import type { StepDotStatus } from '@/components/ui/step-dots'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FeatherIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from '@/features/workout/components/icons'
import { formatClock } from '@/features/workout/lib/format'
import { cn } from '@/lib/cn'

type Step = {
  id: string
  status: StepDotStatus
}

type Props = {
  canGoNext: boolean
  canGoPrevious: boolean
  currentIndex: number
  elapsedSeconds: number
  isEasy: boolean
  isMuted: boolean
  onNext: () => void
  onPrevious: () => void
  onToggleMute: () => void
  steps: readonly Step[]
  total: number
}

/** 44px tap target (WCAG 2.5.5) for the icon controls in the top bar. */
const ICON_BUTTON = cn(
  'flex size-11 shrink-0 items-center justify-center',
  'touch-manipulation',
)

/**
 * The workout's own sticky sub-bar under the app header: exercise navigation,
 * the running clock, the light-day marker, mute, and the progress dots.
 */
export const WorkoutControls = ({
  canGoNext,
  canGoPrevious,
  currentIndex,
  elapsedSeconds,
  isEasy,
  isMuted,
  onNext,
  onPrevious,
  onToggleMute,
  steps,
  total,
}: Props) => {
  const t = useTranslations('workout')

  return (
    <div className="bg-d-bg border-d-line sticky top-14 z-20 border-b px-5 pt-2 pb-2.5">
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <div className="flex items-center">
          <button
            aria-label={t('previousExercise')}
            className={cn(ICON_BUTTON, 'text-d-ink disabled:opacity-30')}
            disabled={!canGoPrevious}
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <button
            aria-label={t('nextExercise')}
            className={cn(ICON_BUTTON, 'text-d-ink disabled:opacity-30')}
            disabled={!canGoNext}
            onClick={onNext}
            type="button"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>

        <div className="text-d-ink-2 font-mono text-xs tracking-wide tabular-nums">
          {t('exerciseCounter', { current: currentIndex + 1, total })}
          {` · ${formatClock(elapsedSeconds)}`}
        </div>

        <div className="flex items-center gap-1">
          {isEasy ? (
            <span
              className={cn(
                'text-d-accent inline-flex items-center gap-1',
                'font-mono text-xs tracking-wide uppercase',
              )}
            >
              <FeatherIcon size={13} />
              {t('lighter')}
            </span>
          ) : null}
          <button
            aria-label={t(isMuted ? 'soundOn' : 'soundOff')}
            className={cn(ICON_BUTTON, 'text-d-ink-2')}
            onClick={onToggleMute}
            type="button"
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <StepDots dark steps={steps} />
      </div>
    </div>
  )
}
