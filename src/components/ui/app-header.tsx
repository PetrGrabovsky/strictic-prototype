import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  action?: ReactNode
  title: ReactNode
}

/**
 * The single sticky app bar for every `(app)` screen (DESIGN-SYSTEM §7): 56px
 * tall, 20px inline padding, a `title` slot at the start and an `action` slot
 * at the end. The marketing site keeps its own nav — deliberately not this
 * (DESIGN-SYSTEM §9.3). The action slot stays empty until Settings lands.
 */
export const AppHeader = ({ action, title }: Props) => (
  <header
    className={cn(
      'bg-surface border-line sticky top-0 z-10 shrink-0 border-b',
      'flex h-14 items-center justify-between px-5',
    )}
  >
    <div className="flex min-w-0 items-center">{title}</div>
    {action ? <div className="flex items-center">{action}</div> : null}
  </header>
)
