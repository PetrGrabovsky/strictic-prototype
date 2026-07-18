import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/cn'
import { AutoHideHeader } from './auto-hide-header'
import { WRAP } from './landing-styles'
import { StartButton } from './start-button'

const NAV_LINKS = [
  { href: '#jak', key: 'how' },
  { href: '#umi', key: 'features' },
  { href: '#cenik', key: 'pricing' },
  { href: '#faq', key: 'faq' },
] as const

/**
 * Landing header: logo, in-page anchors (desktop only) and the sign-in CTA.
 * Wrapped in {@link AutoHideHeader} so on the phone it slides away as the user
 * reads down — the bottom sticky CTA carries the sign-in there — and snaps back
 * on scroll-up; on desktop it stays pinned, CTA always in reach.
 */
export const SiteHeader = async () => {
  const t = await getTranslations('landing')

  return (
    <AutoHideHeader
      className={cn('border-line border-b', 'bg-bg/85 backdrop-blur-[10px]')}
    >
      <div className={cn(WRAP, 'flex h-16 items-center justify-between')}>
        <a aria-label={t('nav.logoAria')} href="#zacit">
          <Logo withWordmark />
        </a>
        <nav
          aria-label={t('nav.ariaLabel')}
          className="flex items-center gap-6"
        >
          {NAV_LINKS.map((link) => (
            <a
              className={cn(
                'text-ink-2 hidden text-sm font-medium',
                'hover:text-ink nav:inline',
              )}
              href={link.href}
              key={link.key}
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
          <StartButton label={t('cta.start')} size="md" />
        </nav>
      </div>
    </AutoHideHeader>
  )
}
