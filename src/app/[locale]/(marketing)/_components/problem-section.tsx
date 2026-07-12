import { getTranslations } from 'next-intl/server'
import { ContentSection } from './content-section'
import { InfoCard } from './info-card'
import { GRID3 } from './landing-styles'
import { SectionHeading } from './section-heading'

const PROBLEM_CARDS = ['plan', 'circus', 'free'] as const

/** "Why another fitness app" — three cards on what rivals get wrong. */
export const ProblemSection = async () => {
  const t = await getTranslations('landing')

  return (
    <ContentSection>
      <SectionHeading kicker={t('problem.kicker')} title={t('problem.h2')} />
      <div className={GRID3}>
        {PROBLEM_CARDS.map((id) => (
          <InfoCard
            body={t(`problem.cards.${id}.body`)}
            key={id}
            title={t(`problem.cards.${id}.title`)}
          />
        ))}
      </div>
    </ContentSection>
  )
}
