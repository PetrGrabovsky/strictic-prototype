'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'
import { AuthModal } from '@/components/ui/auth-modal'

type SetAuthModalOpen = Dispatch<SetStateAction<boolean>>

const AuthModalContext = createContext<null | SetAuthModalOpen>(null)

/**
 * Returns a callback that opens the shared {@link AuthModal}. Throws when
 * used outside {@link AuthModalProvider}, so a missing provider fails
 * loudly instead of silently doing nothing on click.
 */
export const useAuthModal = () => {
  const setOpen = useContext(AuthModalContext)
  if (!setOpen) {
    throw new Error('useAuthModal must be used within <AuthModalProvider>')
  }
  return () => setOpen(true)
}

type Props = Readonly<{ children: ReactNode }>

/**
 * Mounts exactly one AuthModal for the whole marketing tree and shares
 * its open-state setter through context. Every CTA drives the same dialog
 * instance — one focus-return target, no duplicated element ids — instead
 * of each button rendering its own modal.
 */
export const AuthModalProvider = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AuthModalContext value={setIsOpen}>
      {children}
      <AuthModal onClose={() => setIsOpen(false)} open={isOpen} />
    </AuthModalContext>
  )
}
