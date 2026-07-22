import { useFormatter, useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { IconButton } from '@/components/ui/icon-button'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '@/components/ui/icons'
import { BigChart } from '@/features/progress/components/big-chart'
import type { BarDomain } from '@/features/progress/lib/bar-scale'
import type { BucketGranularity } from '@/features/progress/lib/bucket-series'
import type { BucketDrillDown } from '@/features/progress/lib/drill-down'
import { formatBucketPeriod } from '@/features/progress/lib/format-bucket-date'
import { cn } from '@/lib/cn'
import { formatKg, formatShortDate } from '@/lib/format'
import { ARROW_BUTTON } from '@/styles/controls'
import { MICRO_LABEL } from '@/styles/type'

const ICON_SIZE = 16

type Props = {
  detail: BucketDrillDown
  /** Shared with the overview and the share card, so bar heights compare. */
  domain: BarDomain
  /** Names the panel apart from the one a neighbouring card may also open. */
  exerciseName: string
  granularity: BucketGranularity
  height: number
  /** `id` the opening bar points its `aria-controls` at. */
  id: string
  onClose: () => void
  onStep: (key: string) => void
}

/**
 * Level 1 of the journey chart: the sessions folded into one overview bar,
 * drawn against the same scale as every other view of the series (decision 4),
 * so a stubby row of bars reads as "early days" without any extra chrome to
 * say so. `‹ ›` walk the neighbouring periods and skip the empty ones, and the
 * period name is a live region so stepping is announced, not just seen.
 */
export const BucketDetail = ({
  detail,
  domain,
  exerciseName,
  granularity,
  height,
  id,
  onClose,
  onStep,
}: Props) => {
  const t = useTranslations('progress')
  const format = useFormatter()
  const panelRef = useRef<HTMLElement>(null)

  // Tapping a bar low on the screen would otherwise open the detail below the
  // fold, and the tap would read as "nothing happened". `nearest` scrolls the
  // least it can, so a panel already in view never moves; the animation is
  // left to the global `html { scroll-behavior }`, which already drops to
  // `auto` under `prefers-reduced-motion`.
  useEffect(() => {
    panelRef.current?.scrollIntoView({ block: 'nearest' })
  }, [])

  // A disclosure leaves focus wherever the user put it — usually still on the
  // bar that opened this — so Escape has to be caught on the document rather
  // than on the panel. The listener lives exactly as long as the panel does.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  /**
   * Edge arrows stay focusable and merely `aria-disabled`: a real `disabled`
   * would drop keyboard focus to nowhere the moment the last step lands on it.
   * Dimmed to half rather than to the usual whisper — WCAG exempts inactive
   * controls from contrast, but an arrow a keyboard can still reach should
   * clear the 3:1 floor anyway (measured 3.7:1 on the card).
   */
  const stepProps = (key: null | string) => ({
    'aria-disabled': key === null,
    className: cn(
      ARROW_BUTTON,
      key === null && 'cursor-default opacity-50 hover:brightness-100',
    ),
    onClick: () => {
      if (key !== null) {
        onStep(key)
      }
    },
  })

  const period = formatBucketPeriod(format, detail, granularity)

  return (
    <section
      aria-label={t('detail.label', { name: exerciseName })}
      className="border-line mt-3 border-t pt-3"
      id={id}
      ref={panelRef}
    >
      <div className="flex items-center gap-1">
        <IconButton
          {...stepProps(detail.previousKey)}
          label={t('detail.previous')}
        >
          <ChevronLeftIcon size={ICON_SIZE} />
        </IconButton>
        <p
          aria-live="polite"
          className={cn(MICRO_LABEL, 'text-ink-2 min-w-0 flex-1 text-center')}
        >
          {period}
        </p>
        <IconButton {...stepProps(detail.nextKey)} label={t('detail.next')}>
          <ChevronRightIcon size={ICON_SIZE} />
        </IconButton>
        <IconButton
          className="text-ink-3 hover:text-ink ms-1"
          label={t('detail.close')}
          onClick={onClose}
        >
          <CloseIcon size={ICON_SIZE} />
        </IconButton>
      </div>

      {/*
        The gap holds the chart's own focus ring, not just air: the track
        below is a tab stop whenever its bars overflow, and the ring reaches
        5px past it. At `mt-2` that left 3px and read as touching the arrows.
      */}
      <div className="mt-3">
        <BigChart
          caption={t('card.sessions', { count: detail.sessions.length })}
          domain={domain}
          format={(value) => formatKg(format, value)}
          height={height}
          label={t('chart.detail', { period })}
          points={detail.sessions.map((session) => ({
            ...session,
            axisLabel: formatShortDate(format, session.date),
          }))}
        />
      </div>
    </section>
  )
}
