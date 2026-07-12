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
          'mt-[30px] grid grid-cols-1 items-center gap-[38px]',
          'min-[820px]:grid-cols-[1fr_300px]',
        )}
      >
        <div className="text-ink-2 max-w-[560px] text-base">
          {FOUNDER_PARAGRAPHS.map((id, index) => (
            <p className={index === 0 ? undefined : 'mt-[12px]'} key={id}>
              {t(`founder.${id}`)}
            </p>
          ))}
          <div className="text-ink-3 mt-[16px] text-xs">{t('founder.sig')}</div>
        </div>
        <PlaceholderCard
          className="min-h-[220px]"
          description={t('founder.imgDesc')}
          title={t('founder.imgTitle')}
        />
      </div>
    </ContentSection>
  )
}
