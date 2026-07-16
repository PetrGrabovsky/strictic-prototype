'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { ActionButton } from '@/features/workout/components/action-button'
import { ChevronRightIcon, PlayIcon } from '@/features/workout/components/icons'
import { formatClock } from '@/features/workout/lib/format'
import { cn } from '@/lib/cn'

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
        'touch-manipulation bg-black px-6 pt-10 pb-8',
      )}
      onCancel={(event) => event.preventDefault()}
      ref={dialogRef}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-xs tracking-widest text-white/60 uppercase">
          {t(isEasy ? 'rest.titleEasy' : 'rest.title')}
        </span>
        <span className="text-2xs font-mono tracking-wide text-white/50 uppercase tabular-nums">
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
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="9"
          />
          <circle
            cx="120"
            cy="120"
            fill="none"
            r={RADIUS}
            stroke={isOver ? 'rgba(255,255,255,0.3)' : 'var(--color-d-accent)'}
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
              'font-mono leading-none font-bold tabular-nums',
              'text-[clamp(2.75rem,16vw,4.25rem)]',
              isOver ? 'text-d-accent' : 'text-white',
            )}
            role="timer"
          >
            {isOver ? '0:00' : formatClock(remainingSeconds)}
          </span>
          <span
            className={cn(
              'mt-2 font-mono text-xs tracking-widest uppercase',
              isOver ? 'text-d-accent' : 'text-white/60',
            )}
          >
            {t(isOver ? 'rest.go' : 'rest.remaining')}
          </span>
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <div className="flex min-h-11 flex-col items-center gap-1 text-center">
          <span className="font-mono text-xs tracking-widest text-white/50 uppercase">
            {heading}
          </span>
          <span className="text-base text-white/70 tabular-nums">
            {name}
            {detail === '' ? '' : ' · '}
            <span className="font-semibold text-white">{detail}</span>
          </span>
        </div>

        <div className="flex w-full items-stretch gap-2.5">
          {isOver ? null : (
            <button
              aria-label={t('rest.addTime')}
              className={cn(
                'flex shrink-0 items-center justify-center rounded-md px-5',
                'border border-white/20 bg-white/5 font-mono text-sm font-semibold',
                'touch-manipulation text-white',
              )}
              onClick={onAddTime}
              type="button"
            >
              {t('rest.addTimeShort')}
            </button>
          )}
          <ActionButton
            block={false}
            className="flex-1"
            onClick={onContinue}
            size="lg"
          >
            {ctaLabel}
            {isLastStep ? (
              <ChevronRightIcon size={19} />
            ) : (
              <PlayIcon size={17} />
            )}
          </ActionButton>
        </div>
      </div>
    </dialog>
  )
}
