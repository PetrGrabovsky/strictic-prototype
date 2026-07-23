import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/cn'
import { ContentSection } from './content-section'
import { PlaceholderCard } from './placeholder-card'
import { SectionHeading } from './section-heading'
import { TrainProgressCard } from './train-progress-card'

const STEP_ITEMS = ['equipment', 'plan', 'train'] as const

/**
 * "How it works" — three numbered steps. The final step shows the app's real
 * progress chart with an illustrative climb; the others show a screenshot
 * placeholder.
 */
export const StepsSection = async () => {
  const t = await getTranslations('landing')

  return (
    <ContentSection id="jak">
      <SectionHeading kicker={t('steps.kicker')} title={t('steps.h2')} />
      <div className="mt-7">
        {STEP_ITEMS.map((id, index) => (
          <div
            className={cn(
              'grid grid-cols-1 items-center gap-4 border-t',
              'border-line py-7',
              'split:grid-cols-[64px_1fr_0.9fr] split:gap-6',
              index === STEP_ITEMS.length - 1 && 'border-b',
            )}
            key={id}
          >
            <div className="text-accent-deep text-base font-semibold tabular-nums">
              {`0${index + 1}`}
            </div>
            <div>
              <h3 className="leading-heading mb-1.5 text-lg tracking-tight">
                {t(`steps.items.${id}.title`)}
              </h3>
              <p className="text-ink-2 max-w-105 text-base">
                {t(`steps.items.${id}.body`)}
              </p>
            </div>
            {id === 'train' ? (
              <TrainProgressCard
                chartLabel={t('steps.items.train.progressChartLabel')}
                exerciseLabel={t('steps.items.train.progressLabel')}
                note={t('steps.items.train.progressNote')}
              />
            ) : (
              <PlaceholderCard
                description={t(`steps.items.${id}.imageDescription`)}
                title={t(`steps.items.${id}.imageTitle`)}
              />
            )}
          </div>
        ))}
      </div>
    </ContentSection>
  )
}
