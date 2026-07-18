import { Card } from '@/components/ui/card'

const CARD_H3 = 'mb-2 text-lg leading-heading tracking-tight'
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
  <Card inset="lg">
    <h3 className={CARD_H3}>{title}</h3>
    <p className={CARD_P}>{body}</p>
  </Card>
)
