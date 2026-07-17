import { setRequestLocale } from 'next-intl/server'
import { ProgressScreen } from '@/features/progress/components/progress-screen'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

/**
 * The Progress screen route. A thin server shell: it fixes the request locale,
 * then hands off to the client {@link ProgressScreen}, which reads the
 * persisted plan and history and renders the per-exercise carousel, volume
 * chart and shareable images (all interactive/canvas work is client-side).
 */
const ProgressPage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  return <ProgressScreen />
}

export default ProgressPage
