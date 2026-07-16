import { useFormatter, useTranslations } from 'next-intl'
import { ActionButton } from '@/features/workout/components/action-button'
import { CheckIcon } from '@/features/workout/components/icons'
import { cn } from '@/lib/cn'

type Props = {
  completedCount: number
  durationSeconds: number
  isEasy: boolean
  onLeave: () => void
  skippedNames: readonly string[]
  volumeKg: number
}

/** At or above this the volume reads better in tonnes than kilograms. */
const VOLUME_TON_THRESHOLD = 1000
const SECONDS_PER_MINUTE = 60

const STAT_CARD = cn(
  'bg-d-card border-d-line-2 flex-1 rounded-md border p-4 text-center',
)

/**
 * The post-workout summary: what was actually moved and how long it took,
 * drawn from the finish result the session already persisted. Its numbers come
 * straight from the saved record, so a skipped or cut-short workout reports its
 * real work — never zeros (BUILD-GUIDE §4).
 */
export const WorkoutSummary = ({
  completedCount,
  durationSeconds,
  isEasy,
  onLeave,
  skippedNames,
  volumeKg,
}: Props) => {
  const t = useTranslations('workout')
  const format = useFormatter()
  const minutes = Math.max(1, Math.round(durationSeconds / SECONDS_PER_MINUTE))
  const volumeText =
    volumeKg >= VOLUME_TON_THRESHOLD
      ? t('summary.volumeTons', {
          value: format.number(volumeKg / VOLUME_TON_THRESHOLD, {
            maximumFractionDigits: 1,
          }),
        })
      : t('summary.volumeKg', {
          value: format.number(volumeKg, { maximumFractionDigits: 0 }),
        })

  return (
    <main className="bg-d-bg text-d-ink flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-10 pb-8">
        <div className="flex flex-col items-center text-center">
          <span className="bg-d-green/20 text-d-green flex size-14 items-center justify-center rounded-full">
            <CheckIcon size={28} />
          </span>
          <h1 className="text-d-ink mt-4 text-2xl font-bold tracking-tight">
            {t(isEasy ? 'summary.titleEasy' : 'summary.title')}
          </h1>
          <p className="text-d-ink-2 mt-1 text-sm">
            {t('summary.exercisesDone', { count: completedCount })}
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <div className={STAT_CARD}>
            <p className="text-d-ink-3 text-2xs font-mono tracking-wide uppercase">
              {t('summary.volumeLabel')}
            </p>
            <p className="text-d-ink mt-1.5 text-2xl font-bold tabular-nums">
              {volumeText}
            </p>
          </div>
          <div className={STAT_CARD}>
            <p className="text-d-ink-3 text-2xs font-mono tracking-wide uppercase">
              {t('summary.durationLabel')}
            </p>
            <p className="text-d-ink mt-1.5 text-2xl font-bold tabular-nums">
              {t('summary.duration', { minutes })}
            </p>
          </div>
        </div>

        {skippedNames.length > 0 ? (
          <div className="border-d-line bg-d-card mt-4 rounded-md border p-4">
            <p className="text-d-ink-3 text-2xs font-mono tracking-wide uppercase">
              {t('summary.skippedLabel')}
            </p>
            <p className="text-d-ink-2 mt-1.5 text-sm">
              {skippedNames.join(' · ')}
            </p>
          </div>
        ) : null}

        <p className="text-d-ink-3 mt-6 text-center text-xs">
          {t('summary.saved')}
        </p>

        <ActionButton className="mt-auto" onClick={onLeave} size="lg">
          {t('summary.backHome')}
        </ActionButton>
      </div>
    </main>
  )
}
