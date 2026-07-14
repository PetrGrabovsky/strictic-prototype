import type { ReactNode } from 'react'

type Props = {
  label: string
  unit?: string
  value: ReactNode
}

/**
 * A boxed metric: a big tabular value (with an optional small unit) above an
 * uppercase micro-label. `label`/`unit` are passed in already translated.
 */
export const Stat = ({ label, unit, value }: Props) => (
  <div className="border-line bg-surface rounded-md border px-2 py-3.5 text-center">
    <div className="text-ink text-xl leading-none font-semibold tracking-[-0.02em] tabular-nums">
      {value}
      {unit ? (
        <span className="text-ink-3 ms-1 text-xs font-normal">{unit}</span>
      ) : null}
    </div>
    <div className="text-ink-3 text-2xs mt-1.5 tracking-[0.14em] uppercase">
      {label}
    </div>
  </div>
)
