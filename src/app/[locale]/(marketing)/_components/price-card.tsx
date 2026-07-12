import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { ButtonVariant } from './button-classes'
import { StartButton } from './start-button'

const PRICE_LI = 'border-t border-line py-[8px] text-sm text-ink-2'

type Feature = Readonly<{
  id: string
  label: ReactNode
}>

type Props = Readonly<{
  ctaLabel: string
  ctaVariant?: ButtonVariant
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
      'bg-surface flex flex-col rounded-lg p-[28px]',
      featured ? 'border-accent relative border-2' : 'border-line border',
    )}
  >
    {tag ? (
      <span
        className={cn(
          'absolute -top-[11px] left-[24px] rounded-full',
          'bg-accent text-2xs px-[10px] py-[4px] font-semibold',
          'text-d-bg tracking-[0.14em] uppercase',
        )}
      >
        {tag}
      </span>
    ) : null}
    <h3 className="mb-[4px] text-lg leading-[1.12] tracking-[-0.02em]">
      {title}
    </h3>
    <div className="mt-[6px] mb-[2px] text-[34px] font-extrabold">
      {price} <small className="text-ink-3 text-sm font-medium">{period}</small>
    </div>
    <div className="text-ink-3 mb-[16px] text-xs">{sub}</div>
    <ul className="mb-[22px] flex-1 list-none">
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
    {note ? <div className="text-ink-3 mt-[16px] text-sm">{note}</div> : null}
  </div>
)
