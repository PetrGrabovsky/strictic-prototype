import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { KICKER, LEAD, WRAP } from './landing-styles'
import { PhoneMock } from './phone-mock'
import { StartButton } from './start-button'

const TRUSTLINE = ['time', 'freq', 'plan'] as const

// Hoisted so `t.rich`'s inline tag isn't re-created as a fresh component
// each render (react/no-unstable-nested-components).
const renderEm = (chunks: ReactNode) => (
  <em className="text-accent-deep not-italic">{chunks}</em>
)

/**
 * Above-the-fold hero: headline, slogan, CTAs, trustline and the phone
 * mock. Marked `data-sticky-after` so the mobile sticky CTA appears once
 * it scrolls away.
 */
export const Hero = async () => {
  const t = await getTranslations('landing')

  return (
    <section className="scroll-mt-20 pt-20 pb-16" data-sticky-after id="zacit">
      <div
        className={cn(
          WRAP,
          'grid grid-cols-1 gap-10',
          'split:grid-cols-[1.05fr_0.9fr]',
          'split:items-center split:gap-13',
        )}
      >
        <div className="hero-rise">
          <span className={KICKER}>{t('hero.kicker')}</span>
          <h1 className="text-display mb-4 font-extrabold tracking-tight">
            {t.rich('hero.h1', { em: renderEm })}
          </h1>
          <p className="text-accent-deep mb-2 text-lg font-semibold">
            {t('hero.slogan')}
          </p>
          <p className={cn(LEAD, 'mb-7')}>{t('hero.lead')}</p>
          <div className="max-phone:flex-col flex flex-wrap gap-2.5">
            <StartButton className="max-phone:w-full" label={t('cta.start')} />
            <a
              className={cn(
                buttonVariants({ size: 'lg', variant: 'ghost' }),
                'max-phone:w-full',
              )}
              href="#jak"
            >
              {t('cta.how')}
            </a>
          </div>
          <span className="text-ink-3 mt-2.5 block text-xs tracking-wide">
            {t('cta.micro')}
          </span>
          <ul
            className={cn(
              'mt-6 flex list-none flex-wrap gap-x-4 gap-y-2',
              'text-ink-3 text-xs tracking-wide',
            )}
          >
            {TRUSTLINE.map((key) => (
              <li key={key}>
                <span aria-hidden className="text-accent">
                  {'— '}
                </span>
                {t(`hero.trustline.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <PhoneMock />
      </div>
    </section>
  )
}
