import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localeAlternates } from '@/i18n/alternates'
import { routing } from '@/i18n/routing'
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
import { StructuredData } from './_components/structured-data'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

type Locale = (typeof routing.locales)[number]

/**
 * Maps each supported locale to its OpenGraph `og:locale`
 * (`language_TERRITORY`). `satisfies` forces an entry per locale, so a
 * new locale without a mapping fails the build instead of silently
 * shipping the wrong `og:locale`.
 */
const OG_LOCALE_BY_LOCALE = { cs: 'cs_CZ' } satisfies Record<Locale, string>

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const title = t('meta.title')
  const description = t('meta.description')
  const path = `/${locale}`
  const ogLocale =
    OG_LOCALE_BY_LOCALE[
      hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
    ]

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: {
        ...localeAlternates(),
        'x-default': `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: tCommon('appName'),
      title,
      description,
      url: path,
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

const MarketingPage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('landing')

  return (
    <>
      <StructuredData locale={locale} />

      <a
        className={cn(
          'sr-only rounded-br-[10px] focus:not-sr-only',
          'focus:absolute focus:top-0 focus:left-0 focus:z-100',
          'focus:bg-ink focus:px-4 focus:py-2.5 focus:text-white',
        )}
        href="#content"
      >
        {t('skip')}
      </a>

      <SiteHeader />

      <main id="content">
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
