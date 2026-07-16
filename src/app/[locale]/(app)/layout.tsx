import type { ReactNode } from 'react'
import { AppHeader } from '@/components/ui/app-header'
import { Logo } from '@/components/ui/logo'

type Props = Readonly<{ children: ReactNode }>

/**
 * The `(app)` shell: the shared {@link AppHeader} above every authenticated
 * screen (Home, onboarding, workout…), with each page's own `<main>` filling
 * the remaining height via `flex-1`. The header stays put; only the content
 * below it changes between screens.
 */
const AppLayout = ({ children }: Props) => (
  <div className="flex min-h-dvh flex-col">
    <AppHeader title={<Logo withWordmark />} />
    {children}
  </div>
)

export default AppLayout
