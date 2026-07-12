import { getTranslations, setRequestLocale } from 'next-intl/server'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

const MarketingPage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('common')

  return (
    <main className="flex flex-1 items-center justify-center">
      <h1 className="text-ink text-2xl font-semibold">{t('appName')}</h1>
    </main>
  )
}

export default MarketingPage
