import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/cn'
import { WRAP } from './landing-styles'
import { Logo } from './logo'
import { StartButton } from './start-button'

const NAV_LINKS = [
  { href: '#jak', key: 'how' },
  { href: '#umi', key: 'features' },
  { href: '#cenik', key: 'pricing' },
  { href: '#faq', key: 'faq' },
] as const

/**
 * Sticky landing header: logo, in-page anchors (desktop only) and the
 * sign-in CTA that stays reachable on every screen.
 */
export const SiteHeader = async () => {
  const t = await getTranslations('landing')

  return (
    <header
      className={cn(
        'border-line sticky top-0 z-50 border-b',
        'bg-bg/85 backdrop-blur-[10px]',
      )}
    >
      <div className={cn(WRAP, 'flex h-[62px] items-center justify-between')}>
        <a aria-label={t('nav.logoAria')} href="#zacit">
          <Logo />
        </a>
        <nav
          aria-label={t('nav.ariaLabel')}
          className="flex items-center gap-[26px]"
        >
          {NAV_LINKS.map((link) => (
            <a
              className={cn(
                'text-ink-2 hidden text-sm font-medium',
                'hover:text-ink min-[760px]:inline',
              )}
              href={link.href}
              key={link.key}
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
          <StartButton label={t('cta.start')} variant="nav" />
        </nav>
      </div>
    </header>
  )
}
