/**
 * Single source for the public origin and analytics identifiers. These
 * are placeholders until the real domain and Plausible account exist —
 * the launch checklist (docs/reference/strictic-monetization-model.md §6)
 * calls for replacing `strictic.com` in exactly one place, which is here.
 *
 * These are public values (they ship to the browser bundle and appear in
 * crawlable HTML), so they live as plain constants rather than server
 * secrets. When they become real, promote them to `NEXT_PUBLIC_*` env
 * vars read through `@/lib/env`.
 */

/** Absolute production origin, no trailing slash. Feeds `metadataBase`,
 *  canonical URLs, `sitemap.xml`, `robots.txt` and JSON-LD. */
export const SITE_URL = 'https://strictic.com'

/** Plausible site identifier — the registered domain, not the script
 *  host. Placeholder until the account is created. */
export const PLAUSIBLE_DOMAIN = 'strictic.com'

/** Plausible cloud tracking script. Swap for a self-hosted URL (e.g.
 *  `https://plausible.example.com/js/script.js`) if self-hosting. */
export const PLAUSIBLE_SRC = 'https://plausible.io/js/script.js'
