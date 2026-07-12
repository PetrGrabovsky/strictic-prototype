import type { ReactNode } from 'react'

type Props = Readonly<{ children: ReactNode }>

const AppLayout = ({ children }: Props) => children

export default AppLayout
