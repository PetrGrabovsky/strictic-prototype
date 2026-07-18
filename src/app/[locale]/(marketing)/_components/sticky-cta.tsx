'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { StartButton } from './start-button'

type Props = Readonly<{
  label: string
}>

/**
 * Mobile-only sticky sign-in bar in the thumb zone — the phone's primary
 * conversion CTA. It shows once the hero has scrolled out of view and hides
 * again around the closing CTA (which carries its own sign-in). It pairs with
 * the auto-hiding header: while the reader scrolls down the header is gone, so
 * this bar keeps sign-in one tap away; desktop never renders it, where the
 * pinned header CTA stays in reach. While hidden it is `inert`, so its button
 * is neither focusable nor announced.
 */
export const StickyCta = ({ label }: Props) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('[data-sticky-after]')
    if (!hero) {
      return
    }
    const closing = document.querySelector('[data-sticky-before]')

    let isHeroGone = false
    let isClosingReached = false
    const sync = () => {
      setIsVisible(isHeroGone && !isClosingReached)
    }

    const heroObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isHeroGone = !entry.isIntersecting
        }
        sync()
      },
      { threshold: 0 },
    )
    heroObserver.observe(hero)

    const closingObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isClosingReached = entry.isIntersecting
        }
        sync()
      },
      { threshold: 0.15 },
    )
    if (closing) {
      closingObserver.observe(closing)
    }

    return () => {
      heroObserver.disconnect()
      closingObserver.disconnect()
    }
  }, [])

  return (
    <div
      className={cn(
        'max-nav:block fixed inset-x-0 bottom-0 z-60 hidden',
        'border-line-2 bg-bg/90 border-t p-4 backdrop-blur-md',
        'ease-out-expo transition-transform duration-300',
        'motion-reduce:transition-none',
        isVisible ? 'translate-y-0' : 'translate-y-[110%]',
      )}
      inert={!isVisible}
    >
      <StartButton className="w-full" label={label} />
    </div>
  )
}
