import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import messages from '@/messages/cs.json'

/**
 * `cs` is the only locale today, so its messages load statically here.
 * This intentionally returns the same `messages` for every `locale` —
 * when a second locale lands, replace this with a per-locale lookup, or
 * each new locale silently renders Czech copy.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return { locale, messages }
})
