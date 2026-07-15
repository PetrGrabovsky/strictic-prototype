import { useTranslations } from 'next-intl'
import { Stepper } from '@/components/ui/stepper'
import type { SessionTime } from '@/features/onboarding/types'
import { StepHeader } from './step-header'

type Props = {
  onTimeChange: (time: SessionTime) => void
  time: SessionTime
}

const MIN_MINUTES = 10
const MAX_MINUTES = 120
const MINUTES_STEP = 5
const MIN_DAYS = 1
const MAX_DAYS = 7

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

/**
 * Step 4 — the mandatory time budget. Minutes drive how many exercises fit;
 * days set the weekly frequency (capped at the engine's default). Both use the
 * shared press-and-hold {@link Stepper}, with tap-to-type on minutes.
 */
export const TimeStep = ({ onTimeChange, time }: Props) => {
  const t = useTranslations('onboarding.time')

  const setMinutes = (minutesPerSession: number): void =>
    onTimeChange({ ...time, minutesPerSession })

  const setDays = (daysPerWeekAvailable: number): void =>
    onTimeChange({ ...time, daysPerWeekAvailable })

  return (
    <div>
      <StepHeader kicker={t('kicker')} lead={t('lead')} title={t('title')} />

      <div className="mt-8 flex gap-4">
        <Stepper
          decreaseLabel={t('minutesDecrease')}
          increaseLabel={t('minutesIncrease')}
          label={t('minutesLabel')}
          onDecrement={() =>
            setMinutes(
              clamp(
                time.minutesPerSession - MINUTES_STEP,
                MIN_MINUTES,
                MAX_MINUTES,
              ),
            )
          }
          onIncrement={() =>
            setMinutes(
              clamp(
                time.minutesPerSession + MINUTES_STEP,
                MIN_MINUTES,
                MAX_MINUTES,
              ),
            )
          }
          onSet={(value) =>
            setMinutes(clamp(Math.round(value), MIN_MINUTES, MAX_MINUTES))
          }
          value={time.minutesPerSession}
        />
        <Stepper
          decreaseLabel={t('daysDecrease')}
          increaseLabel={t('daysIncrease')}
          label={t('daysLabel')}
          onDecrement={() =>
            setDays(clamp(time.daysPerWeekAvailable - 1, MIN_DAYS, MAX_DAYS))
          }
          onIncrement={() =>
            setDays(clamp(time.daysPerWeekAvailable + 1, MIN_DAYS, MAX_DAYS))
          }
          value={time.daysPerWeekAvailable}
        />
      </div>
    </div>
  )
}
