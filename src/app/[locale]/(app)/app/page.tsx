import { setRequestLocale } from 'next-intl/server'
import { HomeScreen } from './_components/home-screen'

type Props = Readonly<{
  params: Promise<{ locale: string }>
}>

const AppHomePage = async ({ params }: Props) => {
  const { locale } = await params
  setRequestLocale(locale)

  return <HomeScreen />
}

export default AppHomePage
