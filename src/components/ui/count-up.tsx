import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useIsReducedMotion } from '@/hooks/use-reduced-motion'

const DEFAULT_DURATION_MS = 650

type Props = {
  durationMs?: number
  format?: (value: number) => ReactNode
  value: number
}

/**
 * Eases a number from 0 to `value` on mount (cubic ease-out). Honours
 * `prefers-reduced-motion` by jumping straight to the final value. Locale
 * formatting is delegated to the caller via `format`, so this stays free of
 * manual number formatting.
 */
export const CountUp = ({
  durationMs = DEFAULT_DURATION_MS,
  format,
  value,
}: Props) => {
  const isReducedMotion = useIsReducedMotion()
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    if (isReducedMotion) {
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number): void => {
      const progress = Math.min(1, (now - start) / durationMs)
      setAnimated(value * (1 - (1 - progress) ** 3))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [durationMs, isReducedMotion, value])

  // Under reduced motion the final value renders directly — no animation
  // state ever starts, so there is nothing to ease.
  const displayed = isReducedMotion ? value : animated

  return format ? format(displayed) : Math.round(displayed)
}
