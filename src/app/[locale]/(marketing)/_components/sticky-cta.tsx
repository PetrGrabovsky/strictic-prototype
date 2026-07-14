'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { StartButton } from './start-button'

type Props = Readonly<{
  label: string
}>

/**
 * Mobile-only sticky sign-in bar. Shows once the hero has scrolled out of
 * view and hides again around the closing CTA, mirroring the reference
 * landing. Desktop never renders it — the header CTA stays in reach
 * there. While hidden it is `inert`, so its button is neither focusable
 * nor announced.
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
        'fixed inset-x-0 bottom-0 z-60 hidden max-[760px]:block',
        'border-line-2 bg-bg/90 border-t p-4 backdrop-blur-md',
        'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'motion-reduce:transition-none',
        isVisible ? 'translate-y-0' : 'translate-y-[110%]',
      )}
      inert={!isVisible}
    >
      <StartButton className="w-full py-4" label={label} />
    </div>
  )
}
