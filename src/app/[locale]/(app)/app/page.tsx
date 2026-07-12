import { getTranslations, setRequestLocale } from 'next-intl/server'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

const AppShellPage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('app')

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <p className="text-ink-2 text-sm">{t('placeholder')}</p>
    </main>
  )
}

export default AppShellPage
