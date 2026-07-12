import { getTranslations, setRequestLocale } from 'next-intl/server'
import { cn } from '@/lib/cn'
import { AudienceSection } from './_components/audience-section'
import { ClosingCta } from './_components/closing-cta'
import { FaqSection } from './_components/faq-section'
import { FeaturesSection } from './_components/features-section'
import { FounderSection } from './_components/founder-section'
import { Hero } from './_components/hero'
import { ManifestoSection } from './_components/manifesto-section'
import { PricingSection } from './_components/pricing-section'
import { ProblemSection } from './_components/problem-section'
import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'
import { StepsSection } from './_components/steps-section'
import { StickyCta } from './_components/sticky-cta'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

const MarketingPage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('landing')

  return (
    <>
      <a
        className={cn(
          'sr-only rounded-br-[10px] focus:not-sr-only',
          'focus:absolute focus:top-0 focus:left-0 focus:z-[100]',
          'focus:bg-ink focus:px-[16px] focus:py-[10px] focus:text-white',
        )}
        href="#obsah"
      >
        {t('skip')}
      </a>

      <SiteHeader />

      <main id="obsah">
        <Hero />
        <ProblemSection />
        <StepsSection />
        <FeaturesSection />
        <ManifestoSection />
        <AudienceSection />
        <FounderSection />
        <PricingSection />
        <FaqSection />
        <ClosingCta />
      </main>

      <SiteFooter />

      <StickyCta label={t('cta.startNoCard')} />
    </>
  )
}

export default MarketingPage
