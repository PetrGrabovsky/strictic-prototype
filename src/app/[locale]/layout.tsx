import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/cn'
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

  return { title: t('appName') }
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
      </body>
    </html>
  )
}

export default LocaleLayout
