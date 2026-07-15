import { useTranslations } from 'next-intl'
import { gearFrom } from '@/features/onboarding/lib/catalog'
import {
  BAND_LEVELS,
  feasibleExerciseCount,
  LOW_EXERCISE_HINT_THRESHOLD,
  STANDARD_BARBELL_WEIGHTS,
  STANDARD_DUMBBELL_WEIGHTS,
  STANDARD_KETTLEBELL_WEIGHTS,
} from '@/features/onboarding/lib/wizard'
import { cn } from '@/lib/cn'
import type { BandLevel, Equipment, EquipmentId } from '@/types/equipment'
import { FIELD_LABEL } from './onboarding-styles'
import { SelectableChip } from './selectable-chip'
import { StepHeader } from './step-header'
import { WeightPicker } from './weight-picker'

type Props = {
  equipment: Equipment
  onChange: (equipment: Equipment) => void
}

const GEAR_ORDER: readonly EquipmentId[] = [
  'dumbbells',
  'barbell',
  'kettlebell',
  'bench',
  'pullup_bar',
  'ab_wheel',
  'bands',
]

/**
 * Step 1 — owned gear. Simple implements are one toggle each; loadable ones
 * (dumbbells/barbell/kettlebell) reveal a weight multi-select when on, and
 * bands reveal a strength multi-select. The live feasible-exercise count sets
 * expectations (and nudges when the gear is too sparse for a varied plan).
 */
export const EquipmentStep = ({ equipment, onChange }: Props) => {
  const t = useTranslations('onboarding.equipment')

  const gearEnabled = gearFrom(equipment)

  const toggleGear: Record<EquipmentId, () => void> = {
    ab_wheel: () => onChange({ ...equipment, ab_wheel: !equipment.ab_wheel }),
    bands: () =>
      onChange({
        ...equipment,
        bands: { ...equipment.bands, available: !equipment.bands.available },
      }),
    barbell: () =>
      onChange({
        ...equipment,
        barbell: {
          ...equipment.barbell,
          available: !equipment.barbell.available,
        },
      }),
    bench: () => onChange({ ...equipment, bench: !equipment.bench }),
    dumbbells: () =>
      onChange({
        ...equipment,
        dumbbells: {
          ...equipment.dumbbells,
          available: !equipment.dumbbells.available,
        },
      }),
    kettlebell: () =>
      onChange({
        ...equipment,
        kettlebell: {
          ...equipment.kettlebell,
          available: !equipment.kettlebell.available,
        },
      }),
    pullup_bar: () =>
      onChange({ ...equipment, pullup_bar: !equipment.pullup_bar }),
  }

  const toggleBand = (level: BandLevel): void => {
    const levels = equipment.bands.levels.includes(level)
      ? equipment.bands.levels.filter((value) => value !== level)
      : [...equipment.bands.levels, level]
    onChange({ ...equipment, bands: { ...equipment.bands, levels } })
  }

  const count = feasibleExerciseCount(equipment)
  const isSparse = count < LOW_EXERCISE_HINT_THRESHOLD

  return (
    <div>
      <StepHeader kicker={t('kicker')} lead={t('lead')} title={t('title')} />

      <div className="mt-6 flex flex-wrap gap-2">
        {GEAR_ORDER.map((id) => (
          <SelectableChip
            checked={gearEnabled[id]}
            key={id}
            label={t(`items.${id}`)}
            onChange={toggleGear[id]}
          />
        ))}
      </div>

      <p
        className={cn(
          'mt-3 font-mono text-sm leading-relaxed',
          isSparse ? 'text-accent-deep' : 'text-ink-2',
        )}
      >
        {t(isSparse ? 'fitCountLow' : 'fitCount', { count })}
      </p>

      {equipment.dumbbells.available ? (
        <WeightPicker
          emptyHint={t('weights.empty')}
          hint={t('weights.hint')}
          label={t('weights.dumbbells')}
          onChange={(weights) =>
            onChange({
              ...equipment,
              dumbbells: { ...equipment.dumbbells, weightsKg: weights },
            })
          }
          options={STANDARD_DUMBBELL_WEIGHTS}
          selected={equipment.dumbbells.weightsKg}
        />
      ) : null}

      {equipment.barbell.available ? (
        <WeightPicker
          emptyHint={t('weights.empty')}
          hint={t('weights.hint')}
          label={t('weights.barbell')}
          onChange={(weights) =>
            onChange({
              ...equipment,
              barbell: { ...equipment.barbell, weightsKg: weights },
            })
          }
          options={STANDARD_BARBELL_WEIGHTS}
          selected={equipment.barbell.weightsKg}
        />
      ) : null}

      {equipment.kettlebell.available ? (
        <WeightPicker
          emptyHint={t('weights.empty')}
          hint={t('weights.hint')}
          label={t('weights.kettlebell')}
          onChange={(weights) =>
            onChange({
              ...equipment,
              kettlebell: { ...equipment.kettlebell, weightsKg: weights },
            })
          }
          options={STANDARD_KETTLEBELL_WEIGHTS}
          selected={equipment.kettlebell.weightsKg}
        />
      ) : null}

      {equipment.bands.available ? (
        <div className="border-line mt-6 border-t pt-5">
          <h2 className={FIELD_LABEL}>{t('bands.label')}</h2>
          <p className="text-ink-3 mt-1 text-sm leading-relaxed">
            {t('bands.hint')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BAND_LEVELS.map((level) => (
              <SelectableChip
                checked={equipment.bands.levels.includes(level)}
                key={level}
                label={t(`bands.levels.${level}`)}
                onChange={() => toggleBand(level)}
              />
            ))}
          </div>
          {equipment.bands.levels.length === 0 ? (
            <p className="text-accent-deep mt-2 text-sm">{t('bands.empty')}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
