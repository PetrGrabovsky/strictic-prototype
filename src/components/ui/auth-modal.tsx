'use client'

import { useTranslations } from 'next-intl'
import type { ReactNode, SyntheticEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { AppleIcon, ArrowIcon, CloseIcon, GoogleIcon } from './auth-modal-icons'

/** Sign-in providers the mock can be "pending" on. */
type Provider = 'apple' | 'email' | 'google'

/** Simulated sign-in latency before the mock "redirect". */
const MOCK_DELAY_MS = 800

/**
 * Placeholder for the real navigation Etapa 6 wires up once Supabase Auth
 * is connected. `console.log` is banned by lint; `info` is allowed.
 */
const logMockRedirect = (provider: Provider) =>
  console.info(`would redirect to /app (${provider})`)

const HEADING_ID = 'auth-modal-heading'
const EMAIL_ID = 'auth-modal-email'
const TERMS_HREF = '/podminky'
const PRIVACY_HREF = '/ochrana-soukromi'
const FOCUSABLE_SELECTOR = 'a[href], button, input'
const LEGAL_LINK_CLASS = 'underline hover:text-ink'

const OAUTH_BASE = cn(
  'flex h-13 w-full items-center justify-center gap-2.5',
  'rounded-md text-base font-semibold',
  'transition-[background-color,border-color] duration-150',
)

const OAUTH_TONE = {
  apple: 'border border-ink bg-ink text-surface hover:bg-black',
  google: 'border border-line-field bg-surface text-ink hover:bg-bg',
} satisfies Record<Exclude<Provider, 'email'>, string>

/** Keyboard-reachable elements inside the dialog, in DOM order. */
const getFocusableElements = (card: HTMLElement | null) => {
  const items = card?.querySelectorAll(FOCUSABLE_SELECTOR)
  return [...(items ?? [])].filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-disabled') !== 'true',
  )
}

/** Adapts to the button's `currentColor`, so it reads on light or dark. */
const Spinner = () => (
  <span
    aria-hidden
    className={cn(
      'size-4 rounded-full border-2',
      'border-current/30 border-t-current motion-safe:animate-spin',
    )}
  />
)

const OAUTH_BUTTONS = [
  { Icon: GoogleIcon, id: 'google', tone: OAUTH_TONE.google },
  { Icon: AppleIcon, id: 'apple', tone: OAUTH_TONE.apple },
] as const

// Hoisted so `t.rich`'s inline tags aren't re-created as fresh components
// each render (react/no-unstable-nested-components).
const renderTermsLink = (chunks: ReactNode) => (
  <Link className={LEGAL_LINK_CLASS} href={TERMS_HREF}>
    {chunks}
  </Link>
)

const renderPrivacyLink = (chunks: ReactNode) => (
  <Link className={LEGAL_LINK_CLASS} href={PRIVACY_HREF}>
    {chunks}
  </Link>
)

type Props = Readonly<{
  onClose: () => void
  open: boolean
}>

/**
 * Landing sign-in dialog. The auth itself is still a mock — every action
 * (Google, Apple, magic-link e-mail) fakes a short load, logs a would-be
 * redirect and closes; Etapa 6 swaps the `setTimeout` for real Supabase
 * calls without changing this UI. What is real here is the behaviour
 * ported from the reference landing: a manual focus trap, scrollbar-width
 * compensation so the page never shifts under the backdrop, Escape /
 * click-outside to dismiss, a bottom-sheet layout on mobile and full
 * `prefers-reduced-motion` support.
 *
 * `AuthModalProvider` mounts a single instance driven by `open`, so the
 * `id`s stay unique and every CTA returns focus to the button that opened
 * it. Key and pointer handling live on `document` (not JSX handlers) so
 * the decorative backdrop needs no interactive role.
 */
export const AuthModal = ({ onClose, open }: Props) => {
  const t = useTranslations('landing.authModal')
  const cardRef = useRef<HTMLDialogElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [pendingProvider, setPendingProvider] = useState<null | Provider>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const trigger = document.activeElement

    // Lock the page and pad by exactly the scrollbar's width so content
    // behind the backdrop doesn't jump sideways as the bar disappears.
    const scrollbarWidth =
      globalThis.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      // Logical property, not `paddingRight`: in an RTL locale the vertical
      // scrollbar sits on the inline-end (left) side too.
      document.body.style.paddingInlineEnd = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    getFocusableElements(cardRef.current).at(0)?.focus()

    // Fresh e-mail field on each open — an uncontrolled input keeps its
    // value across close/reopen otherwise.
    if (emailRef.current) {
      emailRef.current.value = ''
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') {
        return
      }

      const focusable = getFocusableElements(cardRef.current)
      const first = focusable.at(0)
      const last = focusable.at(-1)
      if (!first || !last) {
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const onPointerDown = (event: MouseEvent) => {
      // A press outside the card (i.e. on the backdrop) dismisses; a press
      // that lands inside it never does — no stopPropagation needed.
      const target = event.target
      if (
        target instanceof Node &&
        cardRef.current &&
        !cardRef.current.contains(target)
      ) {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)

    return () => {
      globalThis.clearTimeout(timerRef.current)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      document.body.style.overflow = ''
      document.body.style.paddingInlineEnd = ''
      // Every close path routes through `onClose` → this cleanup, so the
      // pending flow resets in one place and a reopen always starts clean.
      setPendingProvider(null)
      // Return focus to whichever CTA opened the dialog.
      if (trigger instanceof HTMLElement) {
        trigger.focus()
      }
    }
  }, [open, onClose])

  const startMockSignIn = (provider: Provider) => {
    setPendingProvider(provider)
    timerRef.current = globalThis.setTimeout(() => {
      logMockRedirect(provider)
      onClose()
    }, MOCK_DELAY_MS)
  }

  const handleOAuthClick = (provider: Provider) => {
    // The guard, not a `disabled` attribute, blocks a double submit — so
    // the button stays in focus order and announced to screen readers.
    if (pendingProvider) {
      return
    }
    startMockSignIn(provider)
  }

  const handleEmailSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pendingProvider) {
      return
    }
    // Manual validation (the form is `noValidate`) so an invalid address
    // just re-focuses the field instead of firing the mock flow.
    const input = emailRef.current
    if (!input?.value || !input.checkValidity()) {
      input?.focus()
      return
    }
    startMockSignIn('email')
  }

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-200 flex items-end justify-center sm:items-center',
        'bg-ink/60 p-0 sm:p-6',
        'motion-safe:transition-[opacity,backdrop-filter]',
        'motion-safe:duration-200 motion-safe:ease-out',
        open
          ? 'opacity-100 backdrop-blur-[6px]'
          : 'pointer-events-none opacity-0',
      )}
      inert={!open}
    >
      <dialog
        aria-labelledby={HEADING_ID}
        aria-modal
        className={cn(
          // `static m-0` overrides the UA `dialog` rule (position:absolute
          // + margin:auto), so the always-open dialog lays out as a normal
          // flex child of the overlay — bottom sheet on mobile, centred above.
          'static m-0 block w-full max-w-110',
          'max-h-[88vh] overflow-y-auto',
          'bg-surface text-ink border-0 p-7',
          'rounded-t-lg shadow-[0_-8px_40px_rgba(10,10,10,0.18)] sm:rounded-lg',
          'motion-safe:transition-[transform,opacity]',
          'motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]',
          open
            ? 'translate-y-0 opacity-100'
            : 'translate-y-5 opacity-0 motion-reduce:translate-y-0',
        )}
        open
        ref={cardRef}
      >
        <div className="mb-4.5 flex justify-end">
          <button
            aria-label={t('close')}
            className={cn(
              'flex size-11 shrink-0 items-center justify-center',
              'bg-bg text-ink-3 rounded-full',
              'hover:bg-line hover:text-ink',
            )}
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <h2
          className="mb-1.5 text-lg font-bold tracking-[-0.02em]"
          id={HEADING_ID}
        >
          {t('title')}
        </h2>
        <p className="text-ink-2 mb-5.5 text-sm leading-relaxed">
          {t('subtitle')}
        </p>

        <div className="flex flex-col gap-2.5">
          {OAUTH_BUTTONS.map(({ Icon, id, tone }) => (
            <button
              aria-busy={pendingProvider === id}
              aria-disabled={pendingProvider === id}
              className={cn(
                OAUTH_BASE,
                tone,
                pendingProvider === id && 'opacity-75',
              )}
              key={id}
              onClick={() => handleOAuthClick(id)}
              type="button"
            >
              {pendingProvider === id ? <Spinner /> : <Icon />}
              {t(pendingProvider === id ? 'loading' : id)}
            </button>
          ))}
        </div>

        <div className="my-4 flex items-center gap-3">
          <span className="bg-line h-px flex-1" />
          <span
            className={cn(
              'text-2xs font-mono uppercase',
              'text-ink-3 tracking-[0.14em]',
            )}
          >
            {t('or')}
          </span>
          <span className="bg-line h-px flex-1" />
        </div>

        <form noValidate onSubmit={handleEmailSubmit}>
          <label className="sr-only" htmlFor={EMAIL_ID}>
            {t('emailLabel')}
          </label>
          <div className="flex gap-2">
            <input
              aria-disabled={pendingProvider === 'email'}
              autoComplete="email"
              className={cn(
                'h-12.5 min-w-0 flex-1 rounded-md px-4',
                'border-line-field bg-surface text-ink border text-base',
                'placeholder:text-ink-3',
              )}
              id={EMAIL_ID}
              name="email"
              placeholder={t('emailPlaceholder')}
              ref={emailRef}
              required
              type="email"
            />
            <button
              aria-busy={pendingProvider === 'email'}
              aria-disabled={pendingProvider === 'email'}
              aria-label={t('emailSubmit')}
              className={cn(
                'flex size-12.5 shrink-0 items-center justify-center',
                'bg-ink text-surface rounded-md hover:bg-black',
                pendingProvider === 'email' && 'opacity-60',
              )}
              type="submit"
            >
              {pendingProvider === 'email' ? <Spinner /> : <ArrowIcon />}
            </button>
          </div>
        </form>

        <p className="text-ink-3 mt-4.5 text-center text-xs leading-relaxed">
          {t.rich('legal', {
            privacy: renderPrivacyLink,
            terms: renderTermsLink,
          })}
        </p>
      </dialog>
    </div>
  )
}
