import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  dim?: boolean
  tone?: 'dark' | 'light'
}

/**
 * A 36px numbered circle. Filled (accent-outlined) when active; outlined only
 * when `dim`. `tone="dark"` swaps to the training-screen palette.
 */
export const Disc = ({ children, dim = false, tone = 'light' }: Props) => {
  let palette = 'border-accent bg-ink text-surface'
  if (dim) {
    palette = 'border-line-2 text-accent bg-transparent'
  } else if (tone === 'dark') {
    palette = 'border-accent text-d-ink bg-d-bg'
  }

  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full',
        'border-2 text-base font-semibold',
        palette,
      )}
    >
      {children}
    </div>
  )
}
