import { cn } from '@/lib/cn'
import { KICKER, LEAD } from './landing-styles'

const H2 = cn(
  'mb-[14px] text-[clamp(26px,4vw,38px)] font-bold',
  'leading-[1.12] tracking-[-0.02em]',
)

type Props = Readonly<{
  dark?: boolean
  kicker: string
  lead?: string
  title: string
}>

/**
 * Kicker + h2 (+ optional lead) that opens most landing sections. The
 * `dark` variant recolours it for the manifesto's dark background.
 */
export const SectionHeading = ({
  dark = false,
  kicker,
  lead,
  title,
}: Props) => (
  <>
    <span className={cn(KICKER, dark && 'text-d-accent')}>{kicker}</span>
    <h2 className={cn(H2, dark && 'text-d-ink')}>{title}</h2>
    {lead ? <p className={cn(LEAD, dark && 'text-d-ink-2')}>{lead}</p> : null}
  </>
)
