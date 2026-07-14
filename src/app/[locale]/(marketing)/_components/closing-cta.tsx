import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/cn'
import { ContentSection } from './content-section'
import { LEAD } from './landing-styles'
import { StartButton } from './start-button'

/** Closing call-to-action on a cream band. `stickyBefore` hides the
 *  mobile sticky CTA once this section is reached. */
export const ClosingCta = async () => {
  const t = await getTranslations('landing')

  return (
    <ContentSection
      className="border-line bg-cream border-t text-center"
      stickyBefore
    >
      <h2
        className={cn(
          'text-[clamp(28px,4.6vw,42px)] font-bold',
          'leading-[1.12] tracking-[-0.02em]',
        )}
      >
        {t('final.h2')}
      </h2>
      <p className={cn(LEAD, 'mx-auto mt-3.5 mb-7 max-w-130')}>
        {t('final.lead')}
      </p>
      <StartButton label={t('final.cta')} />
      <span className="text-ink-3 mt-2.5 block text-xs tracking-[0.08em]">
        {t('cta.micro')}
      </span>
    </ContentSection>
  )
}
