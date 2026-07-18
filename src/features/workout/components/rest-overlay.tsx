import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRightIcon, PlayIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { formatClock } from '@/lib/format'
import { MICRO_LABEL, SECTION_LABEL } from '@/styles/type'

type Props = {
  ctaLabel: string
  detail: string
  elapsedSeconds: number
  heading: string
  isEasy: boolean
  isLastStep: boolean
  name: string
  onAddTime: () => void
  onContinue: () => void
  remainingSeconds: number
  totalSeconds: number
}

const RADIUS = 110
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

/**
 * The full-screen rest timer. It never shows an empty countdown: `heading`,
 * `name` and `detail` always preview what to set up next — the next set of the
 * current exercise, or the next exercise (BUILD-GUIDE §4 rest-flow). A finished
 * last set skips this entirely and lands on the summary, so this overlay is
 * only ever a bridge to more work.
 */
export const RestOverlay = ({
  ctaLabel,
  detail,
  elapsedSeconds,
  heading,
  isEasy,
  isLastStep,
  name,
  onAddTime,
  onContinue,
  remainingSeconds,
  totalSeconds,
}: Props) => {
  const t = useTranslations('workout')
  const isOver = remainingSeconds <= 0
  const progress =
    totalSeconds > 0 ? clamp01(remainingSeconds / totalSeconds) : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Promote to a real modal so focus is trapped inside the overlay and the
  // controls behind it go inert — a bare `open` dialog leaves them tabbable.
  // Escape is swallowed: rest ends via the CTA, not a stray key press.
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      aria-label={t('rest.dialogLabel')}
      className={cn(
        'fixed inset-0 z-50 m-0 h-dvh max-h-none w-screen max-w-none border-0',
        'flex flex-col items-center justify-between',
        'bg-d-bg touch-manipulation px-6 pt-10 pb-8',
      )}
      onCancel={(event) => event.preventDefault()}
      ref={dialogRef}
    >
      <div className="flex flex-col items-center gap-1">
        <span className={cn(SECTION_LABEL, 'text-d-ink-2')}>
          {t(isEasy ? 'rest.titleEasy' : 'rest.title')}
        </span>
        <span className={cn(MICRO_LABEL, 'text-d-ink-3 tabular-nums')}>
          {t('rest.total', { time: formatClock(elapsedSeconds) })}
        </span>
      </div>

      <div className="relative flex aspect-square w-[min(74vw,300px)] items-center justify-center">
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 240 240"
        >
          <circle
            cx="120"
            cy="120"
            fill="none"
            r={RADIUS}
            stroke="var(--color-d-line)"
            strokeWidth="9"
          />
          <circle
            cx="120"
            cy="120"
            fill="none"
            r={RADIUS}
            stroke={isOver ? 'var(--color-d-ink-3)' : 'var(--color-d-accent)'}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="9"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="flex flex-col items-center">
          <span
            aria-live="off"
            className={cn(
              'text-timer font-mono font-bold tabular-nums',
              isOver ? 'text-d-accent' : 'text-d-ink',
            )}
            role="timer"
          >
            {isOver ? '0:00' : formatClock(remainingSeconds)}
          </span>
          <span
            className={cn(
              SECTION_LABEL,
              'mt-2',
              isOver ? 'text-d-accent' : 'text-d-ink-2',
            )}
          >
            {t(isOver ? 'rest.go' : 'rest.remaining')}
          </span>
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <div className="flex min-h-11 flex-col items-center gap-1 text-center">
          <span className={cn(SECTION_LABEL, 'text-d-ink-3')}>{heading}</span>
          <span className="text-d-ink-2 text-base tabular-nums">
            {name}
            {detail === '' ? '' : ' · '}
            <span className="text-d-ink font-semibold">{detail}</span>
          </span>
        </div>

        <div className="flex w-full items-stretch gap-2.5">
          {isOver ? null : (
            <Button
              aria-label={t('rest.addTime')}
              className="shrink-0 px-5 font-mono text-sm"
              onClick={onAddTime}
              size="lg"
              tone="dark"
              variant="ghost"
            >
              {t('rest.addTimeShort')}
            </Button>
          )}
          <Button className="flex-1" onClick={onContinue} size="lg" tone="dark">
            {ctaLabel}
            {isLastStep ? (
              <ChevronRightIcon size={20} />
            ) : (
              <PlayIcon size={16} />
            )}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
