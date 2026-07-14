'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = Readonly<{
  children: ReactNode
  className?: string
}>

/**
 * Reveals its children with a subtle rise the first time they scroll into
 * view. Under `prefers-reduced-motion` the children are shown immediately
 * (no hidden initial state and no transition), so the effect is purely
 * additive for users who opted out of motion.
 */
export const Reveal = ({ children, className }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue
          }

          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.08 },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className={cn(
        'motion-safe:transition-[opacity,transform]',
        'motion-safe:duration-600 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]',
        isVisible
          ? 'opacity-100'
          : cn(
              'translate-y-4.5 opacity-0',
              'motion-reduce:translate-y-0 motion-reduce:opacity-100',
            ),
        className,
      )}
      ref={ref}
    >
      {children}
    </div>
  )
}
