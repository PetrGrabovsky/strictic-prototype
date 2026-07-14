import type { MetadataRoute } from 'next'
import { localeAlternates } from '@/i18n/alternates'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/site-config'

/**
 * `sitemap.ts` lives at the `src/app` root, not under `[locale]`, so it is
 * served at `/sitemap.xml` and bypasses the next-intl proxy (the matcher
 * skips paths containing a dot). That means it must enumerate the locale
 * prefixes itself — it iterates `routing.locales` to emit one entry per
 * locale, each carrying `hreflang` alternates for every sibling locale.
 *
 * Only the marketing landing exists today. Legal pages (privacy, terms)
 * are still 404 — they get added here once the routes are real, never as
 * placeholder URLs that would list dead links to crawlers.
 */
const sitemap = (): MetadataRoute.Sitemap => {
  const languages = localeAlternates(SITE_URL)

  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
    alternates: { languages },
  }))
}

export default sitemap
