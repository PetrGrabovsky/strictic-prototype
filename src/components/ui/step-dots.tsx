import { cn } from '@/lib/cn'

export type StepDotStatus = 'current' | 'done' | 'upcoming'

type StepDot = {
  id: string
  status: StepDotStatus
}

type Props = {
  dark?: boolean
  steps: readonly StepDot[]
}

/**
 * Decorative progress bar, one segment per step, keyed by step id. Purely
 * `aria-hidden` — the textual "exercise x/N" is the accessible source of
 * truth, so this carries no tap targets or labels.
 */
export const StepDots = ({ dark = false, steps }: Props) => {
  const filled = dark ? 'bg-d-accent' : 'bg-accent'
  const track = dark ? 'bg-d-line-2' : 'bg-line-2'

  return (
    <div aria-hidden className="mt-1.5 flex gap-1">
      {steps.map((step) => (
        <div
          className={cn(
            'h-1 flex-1 rounded-sm transition-[background-color,opacity] duration-300',
            step.status === 'upcoming' ? track : filled,
            step.status === 'current' && 'opacity-50',
          )}
          key={step.id}
        />
      ))}
    </div>
  )
}
