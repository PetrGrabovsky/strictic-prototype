import type { ReactNode } from 'react'
import { cardVariants } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { StartButton, type StartButtonVariant } from './start-button'

const PRICE_LI = 'border-t border-line py-2 text-sm text-ink-2'

type Feature = Readonly<{
  id: string
  label: ReactNode
}>

type Props = Readonly<{
  ctaLabel: string
  ctaVariant?: StartButtonVariant
  featured?: boolean
  features: readonly Feature[]
  note?: string
  period: string
  price: string
  sub: string
  tag?: string
  title: string
}>

/**
 * A single pricing tier. The `featured` variant draws the accent border
 * + ribbon used by the paid plan; `tag` and `note` are plan-specific.
 */
export const PriceCard = ({
  ctaLabel,
  ctaVariant,
  features,
  featured = false,
  note,
  period,
  price,
  sub,
  tag,
  title,
}: Props) => (
  <div
    className={cn(
      cardVariants({ inset: 'lg' }),
      'flex flex-col',
      featured && 'border-accent relative border-2',
    )}
  >
    {tag ? (
      <span
        className={cn(
          'absolute -top-3 left-6 rounded-full',
          'bg-accent text-2xs px-2.5 py-1 font-semibold',
          'text-d-bg tracking-widest uppercase',
        )}
      >
        {tag}
      </span>
    ) : null}
    <h3 className="leading-heading mb-1 text-lg tracking-tight">{title}</h3>
    <div className="mt-1.5 mb-0.5 text-2xl font-extrabold">
      {price} <small className="text-ink-3 text-sm font-medium">{period}</small>
    </div>
    <div className="text-ink-3 mb-4 text-xs">{sub}</div>
    <ul className="mb-5 flex-1 list-none">
      {features.map((feature) => (
        <li className={PRICE_LI} key={feature.id}>
          <span aria-hidden className="text-green">
            ✓
          </span>{' '}
          {feature.label}
        </li>
      ))}
    </ul>
    <StartButton label={ctaLabel} variant={ctaVariant} />
    {note ? <div className="text-ink-3 mt-4 text-sm">{note}</div> : null}
  </div>
)
