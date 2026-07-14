import { getTranslations } from 'next-intl/server'
import { PhoneMockScreen } from './phone-mock-screen'
import type { PhoneLabels } from './phone-mock-screen'

/**
 * Server shell for the hero's training-screen mock. Resolves every label
 * on the server and hands them to the {@link PhoneMockScreen} client leaf,
 * which owns the animation — keeping translations off the client bundle.
 * The `.hero-float` keyframes (globals.css) give the gentle idle drift.
 */
export const PhoneMock = async () => {
  const t = await getTranslations('landing')

  const labels: PhoneLabels = {
    exercise: t('hero.phone.exercise'),
    exerciseNext: t('hero.phone.exerciseNext'),
    name: t('hero.phone.name'),
    muscles: t('hero.phone.muscles'),
    weightLabel: t('hero.phone.weightLabel'),
    weight: t('hero.phone.weight'),
    weightNext: t('hero.phone.weightNext'),
    weightUnit: t('hero.phone.weightUnit'),
    set2: t('hero.phone.set2'),
    set3: t('hero.phone.set3'),
    repsDone: t('hero.phone.repsDone'),
    repsTarget: t('hero.phone.repsTarget'),
    cta: t('hero.phone.cta'),
  }

  return (
    <div className="hero-float">
      <PhoneMockScreen labels={labels} />
      <div className="text-2xs text-ink-3 mt-3.5 text-center tracking-[0.08em]">
        {t('hero.phone.note')}
      </div>
    </div>
  )
}
