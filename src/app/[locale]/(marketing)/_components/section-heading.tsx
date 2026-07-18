import { cn } from '@/lib/cn'
import { KICKER, LEAD } from './landing-styles'

const H2 = cn('text-title mb-3.5 font-bold tracking-tight')

type Props = Readonly<{
  kicker: string
  lead?: string
  title: string
  tone?: 'dark' | 'light'
}>

/**
 * Kicker + h2 (+ optional lead) that opens most landing sections.
 * `tone="dark"` recolours it for the manifesto's dark background.
 */
export const SectionHeading = ({
  kicker,
  lead,
  title,
  tone = 'light',
}: Props) => {
  const isDark = tone === 'dark'
  return (
    <>
      <span className={cn(KICKER, isDark && 'text-d-accent')}>{kicker}</span>
      <h2 className={cn(H2, isDark && 'text-d-ink')}>{title}</h2>
      {lead ? (
        <p className={cn(LEAD, isDark && 'text-d-ink-2')}>{lead}</p>
      ) : null}
    </>
  )
}
