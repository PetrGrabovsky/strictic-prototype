import { getTranslations } from 'next-intl/server'
import { ContentSection } from './content-section'
import { InfoCard } from './info-card'
import { GRID3 } from './landing-styles'
import { SectionHeading } from './section-heading'

const AUDIENCE_CARDS = ['dumbbells', 'comeback', 'time'] as const

/** "Who Strictic is for" — three cards on the target athlete. */
export const AudienceSection = async () => {
  const t = await getTranslations('landing')

  return (
    <ContentSection>
      <SectionHeading kicker={t('audience.kicker')} title={t('audience.h2')} />
      <div className={GRID3}>
        {AUDIENCE_CARDS.map((id) => (
          <InfoCard
            body={t(`audience.cards.${id}.body`)}
            key={id}
            title={t(`audience.cards.${id}.title`)}
          />
        ))}
      </div>
    </ContentSection>
  )
}
