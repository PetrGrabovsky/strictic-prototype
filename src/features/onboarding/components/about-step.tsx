import { useTranslations } from 'next-intl'
import type { Capabilities, Experience, Sex } from '@/features/onboarding/types'
import { cn } from '@/lib/cn'
import { ChoiceCard } from './choice-card'
import { FIELD_LABEL } from './onboarding-styles'
import { SelectableChip } from './selectable-chip'
import { StepHeader } from './step-header'

type Props = {
  capabilities: Capabilities
  experience: Experience | null
  hasPullupBar: boolean
  onCapabilitiesChange: (capabilities: Capabilities) => void
  onExperienceChange: (experience: Experience) => void
  onSexChange: (sex: Sex) => void
  sex: Sex
}

const EXPERIENCE_OPTIONS: readonly Experience[] = [
  'new',
  'returning',
  'regular',
]

const SEX_OPTIONS: readonly Sex[] = ['male', 'female', 'unspecified']

const PUSHUP_OPTIONS: readonly Capabilities['pushupsNow'][] = [
  '0-5',
  '6-15',
  '16+',
  'unknown',
]

const PULLUP_OPTIONS: readonly Capabilities['pullupsNow'][] = [
  '0',
  '1-3',
  '4+',
  'unknown',
]

const LEGEND_CLASS = cn(FIELD_LABEL, 'mb-3')

/**
 * Step 2 — the personalization the deterministic engine actually reads: sex
 * (optional; only nudges conservative starting weights), experience (gates the
 * catalog + exercise count) and self-reported capability. Pull-up capability
 * is asked only with a bar; age/height/weight are deliberately not collected —
 * the engine ignores them (they wait for the Phase-2 AI coach).
 */
export const AboutStep = ({
  capabilities,
  experience,
  hasPullupBar,
  onCapabilitiesChange,
  onExperienceChange,
  onSexChange,
  sex,
}: Props) => {
  const t = useTranslations('onboarding.about')

  return (
    <div>
      <StepHeader kicker={t('kicker')} title={t('title')} />

      <fieldset className="mt-6">
        <legend className={LEGEND_CLASS}>{t('experienceLabel')}</legend>
        <div className="flex flex-col gap-2.5">
          {EXPERIENCE_OPTIONS.map((option) => (
            <ChoiceCard
              checked={experience === option}
              description={t(`experience.${option}.desc`)}
              key={option}
              name="onboarding-experience"
              onChange={() => onExperienceChange(option)}
              title={t(`experience.${option}.title`)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="border-line mt-6 border-t pt-5">
        <legend className={LEGEND_CLASS}>{t('sexLabel')}</legend>
        <p className="text-ink-3 -mt-1 mb-3 text-sm leading-relaxed">
          {t('sexHint')}
        </p>
        <div className="flex flex-wrap gap-2">
          {SEX_OPTIONS.map((option) => (
            <SelectableChip
              checked={sex === option}
              key={option}
              label={t(`sex.${option}`)}
              name="onboarding-sex"
              onChange={() => onSexChange(option)}
              type="radio"
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="border-line mt-6 border-t pt-5">
        <legend className={LEGEND_CLASS}>{t('pushupsLabel')}</legend>
        <div className="flex flex-wrap gap-2">
          {PUSHUP_OPTIONS.map((option) => (
            <SelectableChip
              checked={capabilities.pushupsNow === option}
              key={option}
              label={t(`pushups.${option}`)}
              name="onboarding-pushups"
              onChange={() =>
                onCapabilitiesChange({ ...capabilities, pushupsNow: option })
              }
              type="radio"
            />
          ))}
        </div>
      </fieldset>

      {hasPullupBar ? (
        <fieldset className="border-line mt-6 border-t pt-5">
          <legend className={LEGEND_CLASS}>{t('pullupsLabel')}</legend>
          <div className="flex flex-wrap gap-2">
            {PULLUP_OPTIONS.map((option) => (
              <SelectableChip
                checked={capabilities.pullupsNow === option}
                key={option}
                label={t(`pullups.${option}`)}
                name="onboarding-pullups"
                onChange={() =>
                  onCapabilitiesChange({ ...capabilities, pullupsNow: option })
                }
                type="radio"
              />
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  )
}
