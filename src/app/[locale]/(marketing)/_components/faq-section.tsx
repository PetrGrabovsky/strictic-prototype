import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/cn'
import { ContentSection } from './content-section'
import { SectionHeading } from './section-heading'

const FAQ_ITEMS = [
  'dumbbells',
  'free',
  'offline',
  'install',
  'beginner',
  'weightloss',
  'youtube',
  'minimal',
] as const

/**
 * FAQ accordion. The +/- marker is driven by `details[open]` in
 * globals.css, so the toggle works without any client JS.
 */
export const FaqSection = async () => {
  const t = await getTranslations('landing')

  return (
    <ContentSection id="faq">
      <SectionHeading kicker={t('faq.kicker')} title={t('faq.h2')} />
      {FAQ_ITEMS.map((id) => (
        <details
          className="border-line bg-surface mt-[12px] overflow-hidden rounded-md border"
          key={id}
        >
          <summary
            className={cn(
              'flex cursor-pointer list-none justify-between gap-[12px]',
              'px-[20px] py-[18px] text-base font-semibold',
              '[&::-webkit-details-marker]:hidden',
            )}
          >
            <span>{t(`faq.items.${id}.question`)}</span>
            <span aria-hidden className="faq-marker text-accent-deep text-lg" />
          </summary>
          <div className="text-ink-2 px-[20px] pb-[18px] text-sm">
            {t(`faq.items.${id}.answer`)}
          </div>
        </details>
      ))}
    </ContentSection>
  )
}
