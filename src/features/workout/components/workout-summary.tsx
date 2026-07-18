import { useFormatter, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, cardVariants } from '@/components/ui/card'
import { CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { formatDuration, formatVolume } from '@/lib/format'
import { SCREEN } from '@/styles/layout'
import { MICRO_LABEL } from '@/styles/type'

type Props = {
  completedCount: number
  durationSeconds: number
  isEasy: boolean
  onLeave: () => void
  skippedNames: readonly string[]
  volumeKg: number
}

const STAT_CARD = cn(cardVariants({ tone: 'dark' }), 'flex-1 text-center')

const STAT_LABEL = cn(MICRO_LABEL, 'text-d-ink-3')

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

  return (
    <main className="bg-d-bg text-d-ink flex flex-1 flex-col">
      <div className={cn(SCREEN, 'pt-10')}>
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
            <p className={STAT_LABEL}>{t('summary.volumeLabel')}</p>
            <p className="text-d-ink mt-1.5 text-2xl font-bold tabular-nums">
              {formatVolume(format, volumeKg)}
            </p>
          </div>
          <div className={STAT_CARD}>
            <p className={STAT_LABEL}>{t('summary.durationLabel')}</p>
            <p className="text-d-ink mt-1.5 text-2xl font-bold tabular-nums">
              {formatDuration(format, durationSeconds)}
            </p>
          </div>
        </div>

        {skippedNames.length > 0 ? (
          <Card className="mt-4" tone="dark">
            <p className={STAT_LABEL}>{t('summary.skippedLabel')}</p>
            <p className="text-d-ink-2 mt-1.5 text-sm">
              {skippedNames.join(' · ')}
            </p>
          </Card>
        ) : null}

        <p className="text-d-ink-3 mt-6 text-center text-xs">
          {t('summary.saved')}
        </p>

        <Button
          className="mt-auto w-full"
          onClick={onLeave}
          size="lg"
          tone="dark"
        >
          {t('summary.backHome')}
        </Button>
      </div>
    </main>
  )
}
