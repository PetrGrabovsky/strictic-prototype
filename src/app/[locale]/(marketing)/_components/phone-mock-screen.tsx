'use client'

import { useEffect, useState } from 'react'
import { useIsReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/cn'
import { formatClock } from '@/lib/format'

export type PhoneLabels = Readonly<{
  cta: string
  exercise: string
  exerciseNext: string
  muscles: string
  name: string
  repsDone: string
  repsTarget: string
  set2: string
  set3: string
  weight: string
  weightLabel: string
  weightNext: string
  weightUnit: string
}>

type Props = Readonly<{ labels: PhoneLabels }>

type ChipVariant = 'current' | 'done' | 'next'

type Chip = Readonly<{ id: string; label: string; variant: ChipVariant }>

type Frame = Readonly<{
  bump: boolean
  chips: readonly Chip[]
  exercise: string
  weight: string
}>

/** Clock start (12:34) as seconds; the mock ticks forward from here. */
const START_SECONDS = 12 * 60 + 34
/** Advance to the next training frame every this many ms. */
const FRAME_MS = 2600
/** Number of frames `buildFrames` returns — keep the two in sync. */
const FRAME_COUNT = 4
const LAST_FRAME = FRAME_COUNT - 1

/**
 * The training-screen animation as data: set 2 in progress → set 2 done,
 * set 3 active → all sets done → weight bumped for next time, then loop.
 * Mirrors the reference demo (docs/reference/strictic-landing-demo.html).
 */
const buildFrames = (labels: PhoneLabels): readonly Frame[] => {
  const set1Done: Chip = { id: 'set1', label: labels.repsDone, variant: 'done' }
  const set2Done: Chip = { id: 'set2', label: labels.repsDone, variant: 'done' }
  const set3Done: Chip = { id: 'set3', label: labels.repsDone, variant: 'done' }

  return [
    {
      exercise: labels.exercise,
      weight: labels.weight,
      bump: false,
      chips: [
        set1Done,
        { id: 'set2', label: labels.set2, variant: 'current' },
        { id: 'set3', label: labels.repsTarget, variant: 'next' },
      ],
    },
    {
      exercise: labels.exercise,
      weight: labels.weight,
      bump: false,
      chips: [
        set1Done,
        set2Done,
        { id: 'set3', label: labels.set3, variant: 'current' },
      ],
    },
    {
      exercise: labels.exercise,
      weight: labels.weight,
      bump: false,
      chips: [set1Done, set2Done, set3Done],
    },
    {
      exercise: labels.exerciseNext,
      weight: labels.weightNext,
      bump: true,
      chips: [set1Done, set2Done, set3Done],
    },
  ]
}

const CHIP_BASE = cn(
  'flex h-10 flex-1 items-center justify-center',
  'rounded-md text-xs tabular-nums',
)

const CHIP_VARIANT: Record<ChipVariant, string> = {
  done: 'border-d-green/50 text-d-green bg-d-green/15 border',
  current: 'border-d-accent text-d-ink border',
  next: 'border-d-line text-d-ink-3 border border-dashed',
}

/**
 * The live training-screen card. Renders frame 0 on the server; once
 * mounted it ticks the clock and cycles the frames. Under
 * `prefers-reduced-motion` it never starts a timer and settles on the
 * final frame (the "next time: heavier weight" payoff) as a static image.
 */
export const PhoneMockScreen = ({ labels }: Props) => {
  const frames = buildFrames(labels)
  const isReducedMotion = useIsReducedMotion()

  const [frameIndex, setFrameIndex] = useState(0)
  const [seconds, setSeconds] = useState(START_SECONDS)

  useEffect(() => {
    if (isReducedMotion) {
      return
    }

    const clockTimer = setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)
    const frameTimer = setInterval(() => {
      setFrameIndex((current) => (current + 1) % FRAME_COUNT)
    }, FRAME_MS)

    return () => {
      clearInterval(clockTimer)
      clearInterval(frameTimer)
    }
  }, [isReducedMotion])

  const frame = isReducedMotion ? frames[LAST_FRAME] : frames[frameIndex]

  return (
    <div
      className={cn(
        'mx-auto w-[min(320px,88vw)] rounded-[34px]',
        'border-d-line bg-d-bg text-d-ink border',
        'px-4 pt-5 pb-4',
        'shadow-phone',
      )}
    >
      <div
        className={cn(
          'mb-4 flex justify-between tabular-nums',
          'text-2xs text-d-ink-2 tracking-widest uppercase',
        )}
      >
        <span>{frame.exercise}</span>
        <span>{formatClock(seconds)}</span>
      </div>
      <div className="mb-0.5 text-lg font-bold tracking-tight">
        {labels.name}
      </div>
      <div
        className={cn('text-2xs mb-4 uppercase', 'text-d-ink-2 tracking-wide')}
      >
        {labels.muscles}
      </div>
      <div className="border-d-line bg-d-card mb-3 rounded-md border p-4">
        <div className="text-2xs text-d-ink-2 tracking-widest uppercase">
          {labels.weightLabel}
        </div>
        {/*
         * Keyed by frame so the node remounts each cycle — that re-runs
         * the `phone-bump` animation when the weight increases (the class
         * alone would only animate the first time).
         */}
        <div
          className={cn(
            'mt-0.5 text-[38px] font-extrabold tabular-nums',
            frame.bump && 'phone-bump',
          )}
          key={frameIndex}
        >
          {frame.weight}{' '}
          <small className="text-d-ink-2 text-base font-semibold">
            {labels.weightUnit}
          </small>
        </div>
        <div className="mt-3.5 flex gap-2">
          {frame.chips.map((chip) => (
            <div
              className={cn(CHIP_BASE, CHIP_VARIANT[chip.variant])}
              key={chip.id}
            >
              {chip.label}
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn(
          'bg-d-accent mt-3.5 w-full rounded-md py-4',
          'text-d-bg text-center text-base font-bold',
        )}
      >
        {labels.cta}
      </div>
    </div>
  )
}
