import { FIELD_LABEL } from './onboarding-styles'

type Props = {
  kicker: string
  lead?: string
  title: string
}

/** The shared kicker + `h1` + optional lead paragraph atop every wizard step. */
export const StepHeader = ({ kicker, lead, title }: Props) => (
  <header>
    <p className={FIELD_LABEL}>{kicker}</p>
    <h1 className="text-ink mt-2 text-3xl font-bold tracking-[-0.02em]">
      {title}
    </h1>
    {lead ? (
      <p className="text-ink-2 mt-3 max-w-[42ch] text-sm leading-relaxed">
        {lead}
      </p>
    ) : null}
  </header>
)
