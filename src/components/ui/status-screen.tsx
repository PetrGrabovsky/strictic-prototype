import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  action?: ReactNode
  description: string
  icon?: ReactNode
  title: string
  tone?: 'dark' | 'light'
}

/**
 * The one centered full-screen status layout — empty states and route error
 * boundaries share it, so "nothing here yet" and "something broke" speak with
 * one voice. `tone="dark"` recolours it for the training world; `icon` and
 * `action` are optional slots above the title and below the copy.
 */
export const StatusScreen = ({
  action,
  description,
  icon,
  title,
  tone = 'light',
}: Props) => (
  <main
    className={cn(
      'flex flex-1 flex-col items-center justify-center gap-4',
      'px-6 py-16 text-center',
      tone === 'dark' && 'bg-d-bg text-d-ink',
    )}
  >
    {icon}
    <h1
      className={cn(
        'text-xl font-semibold tracking-tight',
        tone === 'dark' ? 'text-d-ink' : 'text-ink',
      )}
    >
      {title}
    </h1>
    <p
      className={cn(
        'max-w-xs text-sm leading-relaxed',
        tone === 'dark' ? 'text-d-ink-2' : 'text-ink-2',
      )}
    >
      {description}
    </p>
    {action}
  </main>
)
