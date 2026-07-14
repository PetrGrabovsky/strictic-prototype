import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/cn'
import { ContentSection } from './content-section'
import { FAQ_ITEMS } from './faq-items'
import { SectionHeading } from './section-heading'

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
          className="border-line bg-surface mt-3 overflow-hidden rounded-md border"
          key={id}
        >
          <summary
            className={cn(
              'flex cursor-pointer list-none justify-between gap-3',
              'px-5 py-4.5 text-base font-semibold',
              '[&::-webkit-details-marker]:hidden',
            )}
          >
            <span>{t(`faq.items.${id}.question`)}</span>
            <span aria-hidden className="faq-marker text-accent-deep text-lg" />
          </summary>
          <div className="text-ink-2 px-5 pb-4.5 text-sm">
            {t(`faq.items.${id}.answer`)}
          </div>
        </details>
      ))}
    </ContentSection>
  )
}
