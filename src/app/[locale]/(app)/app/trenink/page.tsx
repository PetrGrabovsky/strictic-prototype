import { setRequestLocale } from 'next-intl/server'
import { WorkoutScreen } from '@/features/workout/components/workout-screen'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

/**
 * The workout screen route. A thin server shell: it fixes the request locale,
 * then hands off to the client {@link WorkoutScreen}, which reads the persisted
 * plan and drives the set-by-set flow (plan/profile live in `localStorage`
 * until the Supabase swap in Etapa 6, so the interactive work is client-side).
 */
const TrainingPage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  return <WorkoutScreen />
}

export default TrainingPage
