import { getTranslations, setRequestLocale } from 'next-intl/server'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

/**
 * Placeholder for the workout screen — the real set-by-set flow is the next
 * step in Etapa 5. It exists now only so the Home CTA ("Jdu cvičit") has a
 * destination to route to.
 */
const TrainingPage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('training')

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-8">
      <p className="text-ink-2 text-center text-sm">{t('placeholder')}</p>
    </main>
  )
}

export default TrainingPage
