import { setRequestLocale } from 'next-intl/server'
import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

/**
 * The onboarding route. A thin server component: it only pins the request
 * locale, then hands off to the client {@link OnboardingWizard}, which owns all
 * the interactivity — keeping the server/client boundary as deep as it can go.
 */
const OnboardingPage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  return <OnboardingWizard />
}

export default OnboardingPage
