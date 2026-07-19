'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

/** Ignore sub-pixel jitter; only a deliberate scroll toggles the header. */
const SCROLL_DELTA_PX = 6
/** Keep the header pinned until the reader is clearly past the hero top. */
const REVEAL_ABOVE_PX = 90
/** Past this the header floats over content and gains its glass elevation. */
const ELEVATE_AFTER_PX = 8

type Props = Readonly<{
  children: ReactNode
  className?: string
}>

/**
 * Sticky landing header that auto-hides on the phone. Scrolling down past the
 * hero slides it up so the content — and the bottom sticky CTA — own the small
 * screen; any upward scroll, an intent signal, snaps it back with the sign-in
 * CTA. The hide only applies below the mobile breakpoint: on desktop the
 * header stays pinned, where a permanently visible CTA converts best and the
 * slim bar costs no real estate. The header markup is server-rendered and
 * passed in as `children`; only this thin scroll wrapper is a client
 * component. Scroll reads are rAF-throttled and the listener is passive, so
 * the tracking never blocks the main thread.
 *
 * At the very top the header melts into the hero — no border, no glass; once
 * the reader scrolls past {@link ELEVATE_AFTER_PX} it exposes `data-scrolled`
 * so the caller's classes can fade in the floating-glass elevation.
 */
export const AutoHideHeader = ({ children, className }: Props) => {
  const [isHidden, setIsHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollY = useRef(0)
  const frame = useRef(0)

  useEffect(() => {
    lastScrollY.current = globalThis.scrollY

    const onScroll = () => {
      if (frame.current !== 0) {
        return
      }
      frame.current = globalThis.requestAnimationFrame(() => {
        frame.current = 0
        /* Clamp so rubber-band overscroll never reads as a direction flip. */
        const maxScrollY =
          document.documentElement.scrollHeight - globalThis.innerHeight
        const currentScrollY = Math.min(
          Math.max(globalThis.scrollY, 0),
          maxScrollY,
        )
        setIsScrolled(currentScrollY > ELEVATE_AFTER_PX)
        const delta = currentScrollY - lastScrollY.current
        if (Math.abs(delta) < SCROLL_DELTA_PX) {
          return
        }
        setIsHidden(delta > 0 && currentScrollY > REVEAL_ABOVE_PX)
        lastScrollY.current = currentScrollY
      })
    }

    globalThis.addEventListener('scroll', onScroll, { passive: true })
    /* Sync the elevation once on mount — the page may load mid-scroll. */
    onScroll()
    return () => {
      globalThis.removeEventListener('scroll', onScroll)
      if (frame.current !== 0) {
        globalThis.cancelAnimationFrame(frame.current)
      }
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'ease-out-expo transition-transform duration-300',
        'motion-reduce:transition-none',
        isHidden ? 'max-nav:-translate-y-full' : 'translate-y-0',
        className,
      )}
      data-scrolled={isScrolled || undefined}
    >
      {children}
    </header>
  )
}
