import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { WRAP } from './landing-styles'
import { Reveal } from './reveal'

const SECTION = 'py-18.5'
const SECTION_ANCHOR = 'scroll-mt-19 pt-5 pb-18.5'

type Props = Readonly<{
  children: ReactNode
  className?: string
  id?: string
  stickyBefore?: boolean
}>

/**
 * Standard section shell: vertical rhythm, centered wrap and a
 * scroll-reveal. Passing `id` switches to the anchor-aware spacing so
 * the sticky header never covers the section title. `stickyBefore`
 * marks the closing section that hides the mobile sticky CTA.
 */
export const ContentSection = ({
  children,
  className,
  id,
  stickyBefore = false,
}: Props) => (
  <section
    className={cn(id ? SECTION_ANCHOR : SECTION, className)}
    data-sticky-before={stickyBefore || undefined}
    id={id}
  >
    <div className={WRAP}>
      <Reveal>{children}</Reveal>
    </div>
  </section>
)
