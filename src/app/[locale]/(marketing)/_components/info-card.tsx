const CARD = 'rounded-md border border-line bg-surface p-[24px]'
const CARD_H3 = 'mb-[8px] text-lg leading-[1.12] tracking-[-0.02em]'
const CARD_P = 'text-sm text-ink-2'

type Props = Readonly<{
  body: string
  title: string
}>

/**
 * Bordered surface card: bold heading over muted body copy. Shared by
 * the problem, features and audience grids.
 */
export const InfoCard = ({ body, title }: Props) => (
  <div className={CARD}>
    <h3 className={CARD_H3}>{title}</h3>
    <p className={CARD_P}>{body}</p>
  </div>
)
