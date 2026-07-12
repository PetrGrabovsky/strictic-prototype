import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ContentSection } from './content-section'
import { InfoCard } from './info-card'
import { SectionHeading } from './section-heading'

const FEATURE_CARDS = ['progress', 'mindless', 'chart', 'offline'] as const

// Hoisted so `t.rich`'s inline tag isn't re-created each render.
const renderBoldInk = (chunks: ReactNode) => (
  <b className="text-ink">{chunks}</b>
)

/** "What Strictic does" — four feature cards plus the anti-feature box. */
export const FeaturesSection = async () => {
  const t = await getTranslations('landing')

  return (
    <ContentSection id="umi">
      <SectionHeading kicker={t('features.kicker')} title={t('features.h2')} />
      <div className="mt-[34px] grid grid-cols-1 gap-[18px] min-[760px]:grid-cols-2">
        {FEATURE_CARDS.map((id) => (
          <InfoCard
            body={t(`features.cards.${id}.body`)}
            key={id}
            title={t(`features.cards.${id}.title`)}
          />
        ))}
      </div>
      <div
        className={cn(
          'border-line mt-[18px] rounded-md border border-l-4',
          'border-l-accent bg-surface px-[20px] py-[18px]',
          'text-ink-2 text-base',
        )}
      >
        {t.rich('features.antibox', { b: renderBoldInk })}
      </div>
    </ContentSection>
  )
}
