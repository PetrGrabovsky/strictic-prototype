import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { PLAUSIBLE_DOMAIN, PLAUSIBLE_SRC, SITE_URL } from '@/lib/site-config'
import '../globals.css'

const inter = Inter({
  display: 'swap',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
})

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])

type Props = Readonly<{
  children: ReactNode
  params: Promise<{ locale: string }>
}>

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }))

export const generateMetadata = async ({
  params,
}: Pick<Props, 'params'>): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('appName'),
      template: `%s · ${t('appName')}`,
    },
  }
}

const LocaleLayout = async ({ children, params }: Props) => {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'

  return (
    <html
      className={cn(inter.variable, 'h-full antialiased')}
      dir={dir}
      lang={locale}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>

        {/*
         * Plausible — privacy-friendly, cookieless analytics. Rendered as a
         * plain `async` script so React 19 hoists it into <head> with
         * `data-domain` intact (Plausible reads that off its own tag). The
         * init stub queues `plausible()` calls fired before the script
         * finishes loading. Domain/src are placeholders until the account
         * exists (see `@/lib/site-config`).
         */}
        <script async data-domain={PLAUSIBLE_DOMAIN} src={PLAUSIBLE_SRC} />
        <script
          // eslint-disable-next-line react/no-danger -- static init stub
          dangerouslySetInnerHTML={{
            __html:
              'window.plausible=window.plausible||function(){' +
              '(window.plausible.q=window.plausible.q||[]).push(arguments)}',
          }}
        />
      </body>
    </html>
  )
}

export default LocaleLayout
