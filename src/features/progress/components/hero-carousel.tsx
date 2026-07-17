'use client'

import type { ReactNode, UIEvent } from 'react'
import { useRef, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/features/progress/components/icons'
import { cn } from '@/lib/cn'

/** One page of the carousel: a stable key plus its rendered card. */
type Slide = {
  content: ReactNode
  id: string
}

type Props = {
  ariaLabel: string
  counterLabel: (current: number, total: number) => string
  dotLabel: (position: number) => string
  heading: string
  nextLabel: string
  prevLabel: string
  slides: readonly Slide[]
}

const ARROW_ICON_SIZE = 17

/** 44px round tap target (BUILD-GUIDE/CLAUDE tap-target floor) on a surface. */
const ARROW_CLASS = cn(
  'flex size-11 shrink-0 items-center justify-center rounded-full',
  'border-line-2 text-ink bg-surface cursor-pointer border',
  'touch-manipulation hover:brightness-95 active:brightness-90',
)

/**
 * The per-exercise hero carousel. Scroll position is the single source of
 * truth (BUILD-GUIDE §4): a scroll settles the active index, and the index
 * only ever *mirrors* the scroll to light the right dot — it never drives the
 * scroll (that feedback loop was the reference's original bug). The arrow and
 * dot buttons call the native `scrollTo` (keyboard-operable via Enter/Space);
 * the resulting scroll updates the index through the same `onScroll` path as a
 * swipe. One slide → no controls.
 */
export const HeroCarousel = ({
  ariaLabel,
  counterLabel,
  dotLabel,
  heading,
  nextLabel,
  prevLabel,
  slides,
}: Props) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollFrame = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const total = slides.length
  const hasControls = total > 1

  const pageWidth = (): number => (trackRef.current?.clientWidth ?? 1) || 1

  const clampIndex = (index: number): number =>
    Math.max(0, Math.min(total - 1, index))

  // Mirror the scroll into state, throttled to one update per frame. This is
  // the ONLY writer of `activeIndex`; every navigation routes through a native
  // scroll that lands here.
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (scrollFrame.current !== 0) {
      return
    }
    const track = event.currentTarget
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = 0
      const next = clampIndex(Math.round(track.scrollLeft / pageWidth()))
      setActiveIndex((current) => (current === next ? current : next))
    })
  }

  const scrollToIndex = (index: number) => {
    trackRef.current?.scrollTo({
      behavior: 'smooth',
      left: clampIndex(index) * pageWidth(),
    })
  }

  const pageBy = (direction: -1 | 1) => {
    const track = trackRef.current
    if (track === null) {
      return
    }
    scrollToIndex(Math.round(track.scrollLeft / pageWidth()) + direction)
  }

  return (
    <section aria-label={ariaLabel} aria-roledescription="carousel">
      <div className="mx-0.5 mb-2.5 flex items-center justify-between">
        <h2 className="text-ink-2 font-mono text-xs font-medium tracking-widest uppercase">
          {heading}
        </h2>
        <span className="text-ink-3 font-mono text-xs tabular-nums">
          {counterLabel(activeIndex + 1, total)}
        </span>
      </div>

      <div
        className={cn(
          'flex snap-x snap-mandatory rounded-lg',
          '[-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          hasControls ? 'overflow-x-auto' : 'overflow-x-hidden',
        )}
        onScroll={handleScroll}
        ref={trackRef}
      >
        {slides.map((slide) => (
          <div
            className="box-border shrink-0 grow-0 basis-full snap-center"
            key={slide.id}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {hasControls ? (
        <div className="mt-3.5 flex items-center justify-center gap-3.5">
          <button
            aria-label={prevLabel}
            className={ARROW_CLASS}
            onClick={() => pageBy(-1)}
            type="button"
          >
            <ChevronLeftIcon size={ARROW_ICON_SIZE} />
          </button>

          <div className="flex items-center">
            {slides.map((slide, position) => (
              <button
                aria-current={position === activeIndex}
                aria-label={dotLabel(position)}
                className="flex h-11 touch-manipulation items-center px-1"
                key={slide.id}
                onClick={() => scrollToIndex(position)}
                type="button"
              >
                <span
                  className={cn(
                    'h-1.5 rounded-full transition-[width,background-color] duration-200',
                    position === activeIndex
                      ? 'bg-accent w-4.5'
                      : 'bg-line-2 w-1.5',
                  )}
                />
              </button>
            ))}
          </div>

          <button
            aria-label={nextLabel}
            className={ARROW_CLASS}
            onClick={() => pageBy(1)}
            type="button"
          >
            <ChevronRightIcon size={ARROW_ICON_SIZE} />
          </button>
        </div>
      ) : null}
    </section>
  )
}
