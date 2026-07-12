import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['cs'],
  defaultLocale: 'cs',
  localePrefix: 'always',
})

/**
 * These MUST be used everywhere instead of `next/link` and
 * `next/navigation` — otherwise the locale prefix silently drops from
 * the URL.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
