import { cn } from '@/lib/cn'
import { MICRO_LABEL } from '@/styles/type'

type Props = {
  kicker: string
  lead?: string
  title: string
}

/** The shared kicker + `h1` + optional lead paragraph atop every wizard step. */
export const StepHeader = ({ kicker, lead, title }: Props) => (
  <header>
    <p className={cn(MICRO_LABEL, 'text-ink-2')}>{kicker}</p>
    <h1 className="text-ink mt-2 text-3xl font-bold tracking-tight">{title}</h1>
    {lead ? (
      <p className="text-ink-2 mt-3 max-w-[42ch] text-sm leading-relaxed">
        {lead}
      </p>
    ) : null}
  </header>
)
