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
      className={cn(
        'border-b border-transparent',
        /* blur-[0px] (not -none) keeps backdrop-filter interpolable. */
        'backdrop-blur-[0px] backdrop-saturate-100',
        'transition-[translate,background-color,border-color,box-shadow,backdrop-filter]',
        'data-scrolled:border-line-2 data-scrolled:bg-bg/85',
        'data-scrolled:backdrop-blur-md data-scrolled:backdrop-saturate-150',
        'data-scrolled:shadow-header',
      )}
    >
      <div className={cn(WRAP, 'flex h-16 items-center justify-between')}>
        {/* `flex` kills the inline baseline gap that pushed the lockup
            above the header's optical center; `p-3` grows the tap target
            to 44px while keeping the focus ring hugging the lockup, not
            the whole header height. */}
        <a
          aria-label={t('nav.logoAria')}
          className="-ms-3 flex items-center p-3"
          href="#zacit"
        >
          <Logo withWordmark />
        </a>
        {/* gap-2 + px-2 keeps the visual 24px rhythm while py-3 grows every
            link's hit area to the 44px AAA target (WCAG 2.5.5) — the nav
            breakpoint (760px) still includes touch tablets. */}
        <nav
          aria-label={t('nav.ariaLabel')}
          className="flex items-center gap-2"
        >
          {NAV_LINKS.map((link) => (
            <a
              className={cn(
                'text-ink hidden min-w-11 px-2 py-3 text-center text-sm',
                'font-medium underline decoration-transparent decoration-2',
                'underline-offset-8',
                'transition-colors duration-100 ease-out',
                'hover:decoration-accent nav:inline',
              )}
              href={link.href}
              key={link.key}
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
          <StartButton className="ms-2" label={t('cta.start')} size="md" />
        </nav>
      </div>
    </AutoHideHeader>
  )
}
