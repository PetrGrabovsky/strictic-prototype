import { useFormatter } from 'next-intl'
import { cn } from '@/lib/cn'
import { formatKg } from '@/lib/format'
import { MICRO_LABEL } from '@/styles/type'
import { SelectableChip } from './selectable'

type Props = {
  emptyHint: string
  hint: string
  label: string
  onChange: (weights: number[]) => void
  options: readonly number[]
  selected: readonly number[]
}

/**
 * Multi-select of a standard weight series (spec §2 `weightsKg`): the user
 * checks the loads they actually own, so the engine only ever prescribes and
 * progresses real weights. Kept sorted ascending on every toggle.
 */
export const WeightPicker = ({
  emptyHint,
  hint,
  label,
  onChange,
  options,
  selected,
}: Props) => {
  const format = useFormatter()
  const toggle = (weight: number): void => {
    const next = selected.includes(weight)
      ? selected.filter((value) => value !== weight)
      : [...selected, weight].toSorted((a, b) => a - b)
    onChange(next)
  }

  return (
    <div className="border-line mt-6 border-t pt-5">
      <h2 className={cn(MICRO_LABEL, 'text-ink-2')}>{label}</h2>
      <p className="text-ink-3 mt-1 text-sm leading-relaxed">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((weight) => (
          <SelectableChip
            checked={selected.includes(weight)}
            key={weight}
            label={formatKg(format, weight)}
            onChange={() => toggle(weight)}
          />
        ))}
      </div>
      {selected.length === 0 ? (
        <p className="text-accent-deep mt-2 text-sm">{emptyHint}</p>
      ) : null}
    </div>
  )
}
