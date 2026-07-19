import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

/**
 * Like `sitemap.ts`, this sits at the `src/app` root and is served at
 * `/robots.txt`, outside the locale prefix. The authed app shell lives
 * under a locale prefix (e.g. `/cs/app`), so a wildcard `app` rule keeps
 * it out of the index for every locale (present and future) while the
 * marketing pages stay fully crawlable.
 */
const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: '/*/app',
  },
  sitemap: `${SITE_URL}/sitemap.xml`,
})

export default robots
