import type { ReactNode } from 'react'
import { AuthModalProvider } from './_components/auth-modal-provider'

type Props = Readonly<{ children: ReactNode }>

const MarketingLayout = ({ children }: Props) => (
  <AuthModalProvider>{children}</AuthModalProvider>
)

export default MarketingLayout
