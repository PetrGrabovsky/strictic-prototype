import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { ContentSection } from './content-section'
import { PlaceholderCard } from './placeholder-card'
import { SectionHeading } from './section-heading'

const STEP_ITEMS = ['equipment', 'plan', 'train'] as const

// Decorative volume bars (heights in %). Explicit ids keep React keys
// stable despite repeated heights.
const PROGRESS_BARS = [
  { height: 34, id: 'w1' },
  { height: 34, id: 'w2' },
  { height: 45, id: 'w3' },
  { height: 45, id: 'w4' },
  { height: 57, id: 'w5' },
  { height: 68, id: 'w6' },
  { height: 68, id: 'w7' },
  { height: 80, id: 'w8' },
  { height: 100, id: 'w9' },
] as const

/**
 * "How it works" — three numbered steps. The final step shows a live
 * progress card; the others show a screenshot placeholder.
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
              <Card inset="md">
                <div className="text-2xs text-ink-3 tracking-widest uppercase">
                  {t('steps.items.train.progressLabel')}
                </div>
                <div className="mt-1 mb-3 flex items-baseline gap-2.5">
                  <span className="text-2xl font-extrabold tabular-nums">
                    {t('steps.items.train.progressValue')}
                  </span>
                  <span className="text-green text-xs font-semibold">
                    {t('steps.items.train.progressDelta')}
                  </span>
                </div>
                <div aria-hidden className="flex h-14 items-end gap-1.5">
                  {PROGRESS_BARS.map((bar) => (
                    <span
                      className="bg-accent flex-1 rounded-t-sm opacity-90"
                      key={bar.id}
                      style={{ height: `${bar.height}%` }}
                    />
                  ))}
                </div>
                <small className="text-2xs text-ink-3 mt-2.5 block tracking-wide">
                  {t('steps.items.train.progressNote')}
                </small>
              </Card>
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
