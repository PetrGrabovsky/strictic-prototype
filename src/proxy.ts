import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

/**
 * next-intl's locale negotiation, exposed through Next.js 16's `proxy`
 * convention (the renamed `middleware`). Runs on every non-excluded
 * request to apply the locale prefix and resolve the active locale.
 */
export const proxy = createMiddleware(routing)

export const config = {
  // Next.js statically extracts this value from the AST at build time, so
  // it must stay a plain string literal: a `String.raw` tagged template
  // can't be parsed and breaks the build. This is also Next's own
  // documented canonical matcher form.
  // eslint-disable-next-line unicorn/prefer-string-raw
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
