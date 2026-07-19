import type { ReactNode } from 'react'
import { CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'

/**
 * The one checked-state frame both wizard selectables share: a visually
 * hidden real `<input>` drives the accent border + cream fill via
 * `has-[:checked]`, and `has-[:focus-visible]` paints the focus ring the
 * clipped input can't show itself. Keyboard, screen-reader and radio-group
 * semantics come from the input, not from ARIA.
 */
const SELECTABLE_FRAME = cn(
  'border-line-2 bg-surface cursor-pointer border transition-colors',
  /* accent-deep, not accent: vivid accent is 2.92:1 against the cream
     fill it touches — under the 3:1 of WCAG 1.4.11. */
  'has-[:checked]:border-accent-deep has-[:checked]:bg-cream',
  'has-[:focus-visible]:outline has-[:focus-visible]:outline-2',
  'has-[:focus-visible]:outline-accent-deep',
  'has-[:focus-visible]:outline-offset-2',
)

type ChipProps = {
  checked: boolean
  label: ReactNode
  name?: string
  onChange: () => void
  type?: 'checkbox' | 'radio'
}

/**
 * A pill toggle for short options. Use `radio` + a shared `name` for
 * single-select groups, the default `checkbox` for multi-select.
 */
export const SelectableChip = ({
  checked,
  label,
  name,
  onChange,
  type = 'checkbox',
}: ChipProps) => (
  <label
    className={cn(
      SELECTABLE_FRAME,
      'inline-flex min-h-11 items-center gap-2 rounded-full',
      'px-4 py-2.5 text-sm font-semibold',
      'text-ink-2 has-[:checked]:text-ink',
    )}
  >
    <input
      checked={checked}
      className="sr-only"
      name={name}
      onChange={onChange}
      type={type}
    />
    {label}
  </label>
)

type ChoiceProps = {
  checked: boolean
  description: string
  name: string
  onChange: () => void
  title: string
}

/**
 * A large single-select card (title + description) for the "pick one" wizard
 * questions — experience and goal. Backed by a real radio so a group shares
 * roving focus and arrow-key selection natively; the filled check disc is
 * driven purely off `peer-checked`.
 */
export const ChoiceCard = ({
  checked,
  description,
  name,
  onChange,
  title,
}: ChoiceProps) => (
  <label
    className={cn(
      SELECTABLE_FRAME,
      'flex items-start gap-3 rounded-md p-4 text-start',
    )}
  >
    <input
      checked={checked}
      className="peer sr-only"
      name={name}
      onChange={onChange}
      type="radio"
    />
    <span
      className={cn(
        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
        'border-line-2 border text-transparent',
        'peer-checked:border-accent-deep peer-checked:bg-accent',
        'peer-checked:text-d-bg',
      )}
    >
      <CheckIcon size={16} />
    </span>
    <span className="min-w-0">
      <span className="text-ink block font-semibold">{title}</span>
      <span className="text-ink-2 mt-0.5 block text-sm leading-relaxed">
        {description}
      </span>
    </span>
  </label>
)
