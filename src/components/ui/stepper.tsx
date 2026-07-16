'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const HOLD_DELAY_MS = 350
const HOLD_INTERVAL_MS = 80

const MINUS_ICON_PATH = 'M5 12h14'
const PLUS_ICON_PATH = 'M12 5v14M5 12h14'
const REPEAT_ICON_SIZE = 19

type RepeatButtonProps = {
  ariaLabel: string
  colorClass: string
  iconPath: string
  onCancel: () => void
  onStart: () => void
  onTap: () => void
}

/**
 * A −/＋ tap target wired for press-and-hold auto-repeat. Both stepper
 * buttons are the same control; only the label, icon and target handler
 * differ, so they share this one definition.
 */
const RepeatButton = ({
  ariaLabel,
  colorClass,
  iconPath,
  onCancel,
  onStart,
  onTap,
}: RepeatButtonProps) => (
  <button
    aria-label={ariaLabel}
    className={cn(
      'flex size-14 shrink-0 touch-manipulation items-center justify-center select-none',
      colorClass,
    )}
    onClick={onTap}
    onPointerCancel={onCancel}
    onPointerDown={onStart}
    onPointerLeave={onCancel}
    onPointerUp={onCancel}
    type="button"
  >
    <svg
      aria-hidden
      fill="none"
      height={REPEAT_ICON_SIZE}
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={REPEAT_ICON_SIZE}
    >
      <path d={iconPath} />
    </svg>
  </button>
)

type Props = {
  active?: boolean
  dark?: boolean
  decreaseLabel?: string
  editLabel?: string
  increaseLabel?: string
  label: string
  onDecrement: () => void
  onIncrement: () => void
  onSet?: (value: number) => void
  value: number
}

/**
 * A labelled number stepper: −/＋ with press-and-hold auto-repeat, plus an
 * optional tap-to-type field when `onSet` is given. `dark` switches to the
 * training-screen palette. a11y strings for the controls are passed in so the
 * primitive holds no hardcoded copy.
 */
export const Stepper = ({
  active = false,
  dark = false,
  decreaseLabel,
  editLabel,
  increaseLabel,
  label,
  onDecrement,
  onIncrement,
  onSet,
  value,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const repeatTimer = useRef<null | ReturnType<typeof setTimeout>>(null)
  const didRepeat = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const stopRepeat = (): void => {
    if (repeatTimer.current === null) {
      return
    }

    clearTimeout(repeatTimer.current)
    clearInterval(repeatTimer.current)
    repeatTimer.current = null
  }

  const startRepeat = (step: () => void): void => {
    stopRepeat()
    didRepeat.current = false
    repeatTimer.current = setTimeout(() => {
      repeatTimer.current = setInterval(() => {
        didRepeat.current = true
        step()
      }, HOLD_INTERVAL_MS)
    }, HOLD_DELAY_MS)
  }

  const tap = (step: () => void): void => {
    if (didRepeat.current) {
      didRepeat.current = false
      return
    }
    step()
  }

  const commit = (): void => {
    const normalized = draft.replace(',', '.').trim()
    const parsed = Number(normalized)
    if (normalized !== '' && !Number.isNaN(parsed)) {
      onSet?.(parsed)
    }
    setIsEditing(false)
  }

  // Clear any pending repeat timer if the component unmounts mid-hold.
  useEffect(
    () => () => {
      if (repeatTimer.current === null) {
        return
      }

      clearTimeout(repeatTimer.current)
      clearInterval(repeatTimer.current)
    },
    [],
  )

  // Focus the field when edit mode opens (avoids the a11y `autoFocus` pitfall).
  useEffect(() => {
    if (!isEditing) {
      return
    }

    inputRef.current?.focus()
    inputRef.current?.select()
  }, [isEditing])

  const labelColor = dark ? 'text-d-ink-3' : 'text-ink-3'
  const frame = dark ? 'border-d-line-2 bg-d-bg' : 'border-line-2 bg-surface'
  const iconColor = dark ? 'text-d-ink' : 'text-ink'
  const divider = dark ? 'border-d-line' : 'border-line'
  const accentColor = dark ? 'text-d-accent' : 'text-accent'
  const idleColor = dark ? 'text-d-ink' : 'text-ink'
  const valueColor = active ? accentColor : idleColor
  const fieldClasses = cn(
    'flex-1 border-x py-3 text-center text-xl font-bold tabular-nums',
    divider,
  )

  let valueNode
  if (isEditing) {
    valueNode = (
      <input
        aria-label={label}
        className={cn(
          fieldClasses,
          accentColor,
          'w-full min-w-0 bg-transparent outline-none',
        )}
        inputMode="decimal"
        onBlur={commit}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          } else if (event.key === 'Escape') {
            setIsEditing(false)
          }
        }}
        ref={inputRef}
        type="text"
        value={draft}
      />
    )
  } else if (onSet) {
    valueNode = (
      <button
        aria-label={editLabel ?? label}
        className={cn(fieldClasses, valueColor, 'cursor-text bg-transparent')}
        onClick={() => {
          setDraft(String(value).replace('.', ','))
          setIsEditing(true)
        }}
        type="button"
      >
        {value}
      </button>
    )
  } else {
    valueNode = <div className={cn(fieldClasses, valueColor)}>{value}</div>
  }

  return (
    <div className="min-w-0 flex-1">
      <div
        className={cn(
          'text-2xs mb-1.5 text-center tracking-widest uppercase',
          labelColor,
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-md border',
          frame,
        )}
      >
        <RepeatButton
          ariaLabel={decreaseLabel ?? label}
          colorClass={iconColor}
          iconPath={MINUS_ICON_PATH}
          onCancel={stopRepeat}
          onStart={() => startRepeat(onDecrement)}
          onTap={() => tap(onDecrement)}
        />
        {valueNode}
        <RepeatButton
          ariaLabel={increaseLabel ?? label}
          colorClass={iconColor}
          iconPath={PLUS_ICON_PATH}
          onCancel={stopRepeat}
          onStart={() => startRepeat(onIncrement)}
          onTap={() => tap(onIncrement)}
        />
      </div>
    </div>
  )
}
