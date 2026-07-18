import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/cn'
import { ContentSection } from './content-section'
import { PlaceholderCard } from './placeholder-card'
import { SectionHeading } from './section-heading'

const FOUNDER_PARAGRAPHS = ['p1', 'p2', 'p3', 'p4'] as const

/** "Who makes it" — the founder's story beside an author-photo slot. */
export const FounderSection = async () => {
  const t = await getTranslations('landing')

  return (
    <ContentSection>
      <SectionHeading kicker={t('founder.kicker')} title={t('founder.h2')} />
      <div
        className={cn(
          'mt-7 grid grid-cols-1 items-center gap-9',
          'split:grid-cols-[1fr_300px]',
        )}
      >
        <div className="text-ink-2 max-w-140 text-base">
          {FOUNDER_PARAGRAPHS.map((id, index) => (
            <p className={index === 0 ? undefined : 'mt-3'} key={id}>
              {t(`founder.${id}`)}
            </p>
          ))}
          <div className="text-ink-3 mt-4 text-xs">{t('founder.sig')}</div>
        </div>
        <PlaceholderCard
          className="min-h-55"
          description={t('founder.imageDescription')}
          title={t('founder.imageTitle')}
        />
      </div>
    </ContentSection>
  )
}
