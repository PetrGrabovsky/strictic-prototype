import { useTranslations } from 'next-intl'
import { IconButton } from '@/components/ui/icon-button'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FeatherIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from '@/components/ui/icons'
import { StepDots } from '@/components/ui/step-dots'
import type { StepDotStatus } from '@/components/ui/step-dots'
import { cn } from '@/lib/cn'
import { formatClock } from '@/lib/format'
import { SECTION_LABEL } from '@/styles/type'

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
    // `top-14` matches the `h-14` AppHeader this bar sticks directly beneath.
    <div className="bg-d-bg border-d-line sticky top-14 z-20 border-b px-5 pt-2 pb-2.5">
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <div className="flex items-center">
          <IconButton
            className="text-d-ink disabled:opacity-30"
            disabled={!canGoPrevious}
            label={t('previousExercise')}
            onClick={onPrevious}
          >
            <ChevronLeftIcon size={20} />
          </IconButton>
          <IconButton
            className="text-d-ink disabled:opacity-30"
            disabled={!canGoNext}
            label={t('nextExercise')}
            onClick={onNext}
          >
            <ChevronRightIcon size={20} />
          </IconButton>
        </div>

        <div className="text-d-ink-2 font-mono text-xs tracking-wide tabular-nums">
          {t('exerciseCounter', { current: currentIndex + 1, total })}
          {` · ${formatClock(elapsedSeconds)}`}
        </div>

        <div className="flex items-center gap-1">
          {isEasy ? (
            <span
              className={cn(
                SECTION_LABEL,
                'text-d-accent inline-flex items-center gap-1',
              )}
            >
              <FeatherIcon size={14} />
              {t('lighter')}
            </span>
          ) : null}
          <IconButton
            className="text-d-ink-2"
            label={t(isMuted ? 'soundOn' : 'soundOff')}
            onClick={onToggleMute}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
          </IconButton>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <StepDots steps={steps} tone="dark" />
      </div>
    </div>
  )
}
