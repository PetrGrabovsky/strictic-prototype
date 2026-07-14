import { getTranslations } from 'next-intl/server'
import { SITE_URL } from '@/lib/site-config'
import { FAQ_ITEMS } from './faq-items'

const PRICE_CURRENCY = 'CZK'
/** Mirrors the visible pricing section: free tier and the annual Plus. */
const FREE_PRICE = '0'
const PLUS_ANNUAL_PRICE = '990'

type Props = Readonly<{ locale: string }>

/**
 * Serializes a value to a JSON-LD payload, escaping `<` so a stray
 * `</script>` inside translated copy can never break out of the tag.
 */
const toJsonLd = (data: unknown) =>
  JSON.stringify(data).replaceAll('<', String.raw`\u003c`)

/**
 * Injects `SoftwareApplication` and `FAQPage` structured data. The FAQ
 * questions/answers are read from the same `faq.items` messages and the
 * shared {@link FAQ_ITEMS} order as the visible {@link FaqSection}, so the
 * markup mirrors the page verbatim (a Google requirement — paraphrased
 * FAQ structured data is treated as misleading).
 */
export const StructuredData = async ({ locale }: Props) => {
  const t = await getTranslations({ locale, namespace: 'landing' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tCommon('appName'),
    description: t('meta.description'),
    applicationCategory: 'HealthApplication',
    // Web/PWA today; add native platforms here only once the apps ship.
    operatingSystem: 'Web',
    url: `${SITE_URL}/${locale}`,
    offers: [
      {
        '@type': 'Offer',
        name: t('pricing.free.title'),
        price: FREE_PRICE,
        priceCurrency: PRICE_CURRENCY,
      },
      {
        '@type': 'Offer',
        name: t('pricing.plus.title'),
        price: PLUS_ANNUAL_PRICE,
        priceCurrency: PRICE_CURRENCY,
      },
    ],
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((id) => ({
      '@type': 'Question',
      name: t(`faq.items.${id}.question`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`faq.items.${id}.answer`),
      },
    })),
  }

  return (
    <>
      {[softwareApplication, faqPage].map((graph) => (
        <script
          // eslint-disable-next-line react/no-danger -- escaped JSON-LD
          dangerouslySetInnerHTML={{ __html: toJsonLd(graph) }}
          key={graph['@type']}
          type="application/ld+json"
        />
      ))}
    </>
  )
}
