import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { WRAP } from './landing-styles'

/**
 * Landing footer: copyright plus legal + contact links. Locale-aware
 * routes go through the i18n `Link`; the mailto is a plain anchor.
 */
export const SiteFooter = async () => {
  const t = await getTranslations('landing')

  return (
    <footer className="border-line text-ink-3 border-t py-8.5 text-sm">
      <div
        className={cn(
          WRAP,
          'flex flex-wrap items-center justify-between',
          'gap-x-6.5 gap-y-3',
        )}
      >
        <div>{t('footer.copyright')}</div>
        <nav
          aria-label={t('footer.ariaLabel')}
          className="flex flex-wrap gap-x-2"
        >
          <Link className="hover:text-ink" href="/ochrana-soukromi">
            {t('footer.privacy')}
          </Link>
          <span aria-hidden>·</span>
          <Link className="hover:text-ink" href="/podminky">
            {t('footer.terms')}
          </Link>
          <span aria-hidden>·</span>
          <a className="hover:text-ink" href="mailto:ahoj@strictic.com">
            {t('footer.contact')}
          </a>
        </nav>
      </div>
    </footer>
  )
}
