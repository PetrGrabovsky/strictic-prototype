import { useTranslations } from 'next-intl'
import type { Restrictions } from '@/features/onboarding/types'
import { cn } from '@/lib/cn'
import { MICRO_LABEL } from '@/styles/type'
import type { GoalPrimary } from '@/types/plan'
import { ChoiceCard, SelectableChip } from './selectable'
import { StepHeader } from './step-header'

type RestrictionId = keyof Restrictions

type Props = {
  goalPrimary: GoalPrimary | null
  onGoalChange: (goal: GoalPrimary) => void
  onRestrictionsChange: (restrictions: Restrictions) => void
  restrictions: Restrictions
}

const GOAL_OPTIONS: readonly GoalPrimary[] = [
  'hypertrophy',
  'strength',
  'fat_loss',
  'health',
]

const RESTRICTION_ORDER: readonly RestrictionId[] = ['shoulder', 'back', 'knee']

/**
 * Step 3 — goal + injury flags (spec §12.4: fixed single-select goal chips and
 * restriction checkboxes, never free text — an honest read of free text needs
 * the Phase-2 backend). Goals render as cards so each carries its blunt
 * one-liner; restrictions map to the engine's substitution rules.
 */
export const GoalStep = ({
  goalPrimary,
  onGoalChange,
  onRestrictionsChange,
  restrictions,
}: Props) => {
  const t = useTranslations('onboarding.goal')

  const toggleRestriction = (id: RestrictionId): void =>
    onRestrictionsChange({ ...restrictions, [id]: !restrictions[id] })

  return (
    <div>
      <StepHeader kicker={t('kicker')} lead={t('lead')} title={t('title')} />

      <fieldset className="mt-6">
        <legend className="sr-only">{t('title')}</legend>
        <div className="flex flex-col gap-2.5">
          {GOAL_OPTIONS.map((option) => (
            <ChoiceCard
              checked={goalPrimary === option}
              description={t(`options.${option}.desc`)}
              key={option}
              name="onboarding-goal"
              onChange={() => onGoalChange(option)}
              title={t(`options.${option}.title`)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="border-line mt-6 border-t pt-5">
        <legend className={cn(MICRO_LABEL, 'text-ink-2')}>
          {t('restrictionsLabel')}
        </legend>
        <p className="text-ink-3 -mt-1 mb-3 text-sm leading-relaxed">
          {t('restrictionsHint')}
        </p>
        <div className="flex flex-wrap gap-2">
          {RESTRICTION_ORDER.map((id) => (
            <SelectableChip
              checked={restrictions[id]}
              key={id}
              label={t(`restrictions.${id}`)}
              onChange={() => toggleRestriction(id)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  )
}
