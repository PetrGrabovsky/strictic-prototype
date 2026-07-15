import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  checked: boolean
  label: ReactNode
  name?: string
  onChange: () => void
  type?: 'checkbox' | 'radio'
}

/**
 * A pill toggle backed by a real `<input>` (visually hidden) so keyboard,
 * screen-reader and grouping semantics come for free. `has-[:checked]` styles
 * the pill from the input's state; `has-[:focus-visible]` gives the visible
 * focus ring the clipped input can't show itself. Use `radio` + a shared
 * `name` for single-select groups, the default `checkbox` for multi-select.
 */
export const SelectableChip = ({
  checked,
  label,
  name,
  onChange,
  type = 'checkbox',
}: Props) => (
  <label
    className={cn(
      'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full',
      'border px-4 py-2.5 text-sm font-semibold transition-colors',
      'border-line-2 bg-surface text-ink-2',
      'has-[:checked]:border-accent has-[:checked]:bg-cream',
      'has-[:checked]:text-ink',
      'has-[:focus-visible]:outline has-[:focus-visible]:outline-2',
      'has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-offset-2',
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
