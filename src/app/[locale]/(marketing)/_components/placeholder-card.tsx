import { cn } from '@/lib/cn'

const PH = cn(
  'flex min-h-42 flex-col justify-center gap-1.5 rounded-md',
  'border-2 border-dashed border-line-2 bg-cream p-5',
)
const PH_TITLE = 'text-2xs uppercase tracking-widest text-accent-deep'
const PH_DESC = 'text-sm leading-normal text-ink-3'

type Props = Readonly<{
  className?: string
  description: string
  title: string
}>

/**
 * Dashed "image goes here" block standing in for a screenshot or photo
 * until the real assets land (steps + founder sections).
 */
export const PlaceholderCard = ({ className, description, title }: Props) => (
  <div className={cn(PH, className)}>
    <b className={PH_TITLE}>{title}</b>
    <span className={PH_DESC}>{description}</span>
  </div>
)
