import { routing } from '@/i18n/routing'

/**
 * Builds the hreflang map (`locale → href`) covering every supported
 * locale, each href prefixed by `origin`. Pass `''` for root-relative
 * alternates (a page's `<link rel="alternate">`) or an absolute origin
 * for fully-qualified `sitemap.xml` URLs. Centralising it here keeps the
 * page metadata and the sitemap from ever drifting apart.
 */
export const localeAlternates = (origin = ''): Record<string, string> =>
  Object.fromEntries(
    routing.locales.map((locale) => [locale, `${origin}/${locale}`]),
  )
