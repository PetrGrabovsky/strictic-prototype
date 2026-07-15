import { cn } from '@/lib/cn'
import { CheckIcon } from './icons'

type Props = {
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
}: Props) => (
  <label
    className={cn(
      'flex cursor-pointer items-start gap-3 rounded-lg border p-4',
      'text-start transition-colors',
      'border-line-2 bg-surface',
      'has-[:checked]:border-accent has-[:checked]:bg-cream',
      'has-[:focus-visible]:outline has-[:focus-visible]:outline-2',
      'has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-offset-2',
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
        'peer-checked:border-accent peer-checked:bg-accent peer-checked:text-d-bg',
      )}
    >
      <CheckIcon />
    </span>
    <span className="min-w-0">
      <span className="text-ink block font-semibold">{title}</span>
      <span className="text-ink-2 mt-0.5 block text-sm leading-relaxed">
        {description}
      </span>
    </span>
  </label>
)
