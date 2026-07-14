import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  dark?: boolean
  dim?: boolean
}

/**
 * A 38px numbered circle. Filled (accent-outlined) when active; outlined only
 * when `dim`. `dark` swaps to the training-screen palette.
 */
export const Disc = ({ children, dark = false, dim = false }: Props) => {
  let tone = 'border-accent bg-ink text-white'
  if (dim) {
    tone = 'border-line-2 text-accent bg-transparent'
  } else if (dark) {
    tone = 'border-accent text-d-ink bg-black'
  }

  return (
    <div
      className={cn(
        'flex size-9.5 shrink-0 items-center justify-center rounded-full',
        'border-2 text-base font-semibold',
        tone,
      )}
    >
      {children}
    </div>
  )
}
