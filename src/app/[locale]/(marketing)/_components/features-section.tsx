import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { cardVariants } from '@/components/ui/card'
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
      <div className="nav:grid-cols-2 mt-8 grid grid-cols-1 gap-4">
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
          cardVariants({ inset: 'none' }),
          'border-l-accent border-l-4 px-5 py-4',
          'text-ink-2 mt-4 text-base',
        )}
      >
        {t.rich('features.antibox', { b: renderBoldInk })}
      </div>
    </ContentSection>
  )
}
