import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { buttonClass } from './button-classes'
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
    <section
      className="scroll-mt-19 pt-19.5 pb-16.5"
      data-sticky-after
      id="zacit"
    >
      <div
        className={cn(
          WRAP,
          'grid grid-cols-1 gap-10',
          'min-[860px]:grid-cols-[1.05fr_0.9fr]',
          'min-[860px]:items-center min-[860px]:gap-13',
        )}
      >
        <div className="hero-rise">
          <span className={KICKER}>{t('hero.kicker')}</span>
          <h1
            className={cn(
              'mb-4.5 text-[clamp(34px,5.6vw,56px)] font-extrabold',
              'leading-[1.12] tracking-tight',
            )}
          >
            {t.rich('hero.h1', { em: renderEm })}
          </h1>
          <p className="text-accent-deep mb-2 text-lg font-semibold">
            {t('hero.slogan')}
          </p>
          <p className={cn(LEAD, 'mb-7')}>{t('hero.lead')}</p>
          <div className="flex flex-wrap gap-2.5 max-[560px]:flex-col">
            <StartButton
              className="max-[560px]:w-full"
              label={t('cta.start')}
            />
            <a
              className={buttonClass('ghost', 'max-[560px]:w-full')}
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
              'mt-6.5 flex list-none flex-wrap gap-x-4.5 gap-y-2',
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
