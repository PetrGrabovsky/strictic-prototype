import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { ContentSection } from './content-section'
import { PriceCard } from './price-card'
import { SectionHeading } from './section-heading'

const FREE_FEATURES = [
  'plan',
  'guidance',
  'progression',
  'progress',
  'offline',
] as const
const PLUS_FEATURES = ['coach', 'revision', 'questions', 'sync'] as const

// Hoisted so `t.rich`'s inline tag isn't re-created each render.
const renderBold = (chunks: ReactNode) => <b>{chunks}</b>

/** Pricing: the forever-free tier next to the paid "Plus" coach tier. */
export const PricingSection = async () => {
  const t = await getTranslations('landing')

  const freeFeatures = FREE_FEATURES.map((id) => ({
    id,
    label: t(`pricing.free.features.${id}`),
  }))
  const plusFeatures = PLUS_FEATURES.map((id) => ({
    id,
    label:
      id === 'coach'
        ? t.rich('pricing.plus.features.coach', { b: renderBold })
        : t(`pricing.plus.features.${id}`),
  }))

  return (
    <ContentSection id="cenik">
      <SectionHeading kicker={t('pricing.kicker')} title={t('pricing.h2')} />
      <div className="mt-8.5 grid grid-cols-1 items-stretch gap-4.5 min-[760px]:grid-cols-2">
        <PriceCard
          ctaLabel={t('pricing.free.cta')}
          features={freeFeatures}
          period={t('pricing.free.period')}
          price={t('pricing.free.price')}
          sub={t('pricing.free.sub')}
          title={t('pricing.free.title')}
        />
        <PriceCard
          ctaLabel={t('pricing.plus.cta')}
          ctaVariant="ghost"
          featured
          features={plusFeatures}
          note={t('pricing.plus.note')}
          period={t('pricing.plus.period')}
          price={t('pricing.plus.price')}
          sub={t('pricing.plus.sub')}
          tag={t('pricing.plus.tag')}
          title={t('pricing.plus.title')}
        />
      </div>
    </ContentSection>
  )
}
