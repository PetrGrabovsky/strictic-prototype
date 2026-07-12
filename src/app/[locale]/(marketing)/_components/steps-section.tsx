import { getTranslations } from 'next-intl/server'
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
      <div className="mt-[30px]">
        {STEP_ITEMS.map((id, index) => (
          <div
            className={cn(
              'grid grid-cols-1 items-center gap-[16px] border-t',
              'border-line py-[30px]',
              'min-[820px]:grid-cols-[64px_1fr_0.9fr] min-[820px]:gap-[26px]',
              index === STEP_ITEMS.length - 1 && 'border-b',
            )}
            key={id}
          >
            <div className="text-accent-deep text-base font-semibold tabular-nums">
              {`0${index + 1}`}
            </div>
            <div>
              <h3 className="mb-[6px] text-lg leading-[1.12] tracking-[-0.02em]">
                {t(`steps.items.${id}.title`)}
              </h3>
              <p className="text-ink-2 max-w-[420px] text-base">
                {t(`steps.items.${id}.body`)}
              </p>
            </div>
            {id === 'train' ? (
              <div className="border-line bg-surface rounded-md border p-[22px]">
                <div className="text-2xs text-ink-3 tracking-[0.14em] uppercase">
                  {t('steps.items.train.progLabel')}
                </div>
                <div className="mt-[4px] mb-[12px] flex items-baseline gap-[10px]">
                  <span className="text-[34px] font-extrabold tabular-nums">
                    {t('steps.items.train.progValue')}
                  </span>
                  <span className="text-green text-xs font-semibold">
                    {t('steps.items.train.progDelta')}
                  </span>
                </div>
                <div aria-hidden className="flex h-[56px] items-end gap-[6px]">
                  {PROGRESS_BARS.map((bar) => (
                    <i
                      className="bg-accent flex-1 rounded-t-[6px] opacity-90"
                      key={bar.id}
                      style={{ height: `${bar.height}%` }}
                    />
                  ))}
                </div>
                <small className="text-2xs text-ink-3 mt-[10px] block tracking-[0.08em]">
                  {t('steps.items.train.progNote')}
                </small>
              </div>
            ) : (
              <PlaceholderCard
                description={t(`steps.items.${id}.imgDesc`)}
                title={t(`steps.items.${id}.imgTitle`)}
              />
            )}
          </div>
        ))}
      </div>
    </ContentSection>
  )
}
