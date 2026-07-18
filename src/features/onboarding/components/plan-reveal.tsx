import { useFormatter, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, cardVariants } from '@/components/ui/card'
import { ArrowRightIcon } from '@/components/ui/icons'
import { getExercise } from '@/features/onboarding/lib/catalog'
import { cn } from '@/lib/cn'
import { formatKg } from '@/lib/format'
import { MICRO_LABEL } from '@/styles/type'
import type { Plan, PlanExercise } from '@/types/plan'

type Props = {
  onStart: () => void
  plan: Plan
}

const META_CHIP_CLASS = cn(
  MICRO_LABEL,
  'text-ink-2 rounded-full border border-line-2 bg-surface px-3 py-1',
)

const KICKER_CLASS = cn(MICRO_LABEL, 'text-ink-2')

/**
 * The plan reveal (spec §5 step 7 / blueprint Phase-1): the deterministic
 * engine's honest Czech output rendered verbatim — name, coach summary,
 * warm-up, blunt notes and every exercise with its personal reason. The CTA
 * hands off to `onStart`, which takes the user into their first workout.
 */
export const PlanReveal = ({ onStart, plan }: Props) => {
  const t = useTranslations('onboarding.reveal')
  const tExercise = useTranslations('exercises')
  const format = useFormatter()
  const { meta } = plan

  const exerciseMeta = (exercise: PlanExercise): string => {
    const catalogEntry = getExercise(exercise.exercise_id)
    const effortLine =
      exercise.hold_s === null
        ? t('setsReps', { reps: exercise.reps ?? 0, sets: exercise.sets })
        : t('setsHold', { seconds: exercise.hold_s, sets: exercise.sets })
    const parts = [effortLine, t('rest', { seconds: exercise.rest_s })]
    if (exercise.start_weight_kg !== null) {
      const weight = t('startWeight', {
        weight: formatKg(format, exercise.start_weight_kg),
      })
      parts.push(catalogEntry?.perHand ? `${weight} ${t('perHand')}` : weight)
    }
    return parts.join(' · ')
  }

  return (
    <div>
      <p className={KICKER_CLASS}>{t('kicker')}</p>
      <h1 className="text-ink mt-2 text-3xl font-bold tracking-tight">
        {meta.plan_name_cs}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={META_CHIP_CLASS}>
          {t('frequency', { count: meta.frequency_per_week })}
        </span>
        <span className={META_CHIP_CLASS}>
          {t('duration', { count: meta.session_time_est_min })}
        </span>
        <span className={META_CHIP_CLASS}>
          {t('exerciseCount', { count: plan.plan.length })}
        </span>
      </div>

      <p className="text-ink-2 mt-5 text-sm leading-relaxed">
        {meta.coach_summary_cs}
      </p>

      <Card className="bg-cream/60 mt-5">
        <p className={KICKER_CLASS}>{t('warmupLabel')}</p>
        <p className="text-ink mt-1.5 text-sm leading-relaxed">
          {plan.warmup_cs}
        </p>
      </Card>

      {meta.honest_notes_cs.length > 0 ? (
        <div className="mt-5">
          <p className={KICKER_CLASS}>{t('notesLabel')}</p>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {meta.honest_notes_cs.map((note) => (
              <li className="text-ink-2 text-sm leading-relaxed" key={note}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ol className="mt-6 flex flex-col gap-3">
        {plan.plan.map((exercise, index) => (
          <li className={cardVariants()} key={exercise.exercise_id}>
            <div className="flex items-baseline gap-2">
              <span className="text-2xs text-ink-3 font-mono font-semibold tabular-nums">
                {index + 1}
              </span>
              <h2 className="text-ink text-base font-semibold">
                {tExercise(`${exercise.exercise_id}.name`)}
              </h2>
            </div>
            <p className="text-ink-2 mt-1 font-mono text-sm tabular-nums">
              {exerciseMeta(exercise)}
            </p>
            <p className="text-ink-2 mt-2 text-sm leading-relaxed">
              {exercise.why_this_for_you_cs}
            </p>
            {exercise.scaling_note_cs === null ? null : (
              <p className="text-accent-deep mt-1.5 text-sm leading-relaxed">
                {exercise.scaling_note_cs}
              </p>
            )}
          </li>
        ))}
      </ol>

      <Button
        className="mt-8 w-full"
        onClick={onStart}
        size="lg"
        variant="primary"
      >
        {t('cta')}
        <ArrowRightIcon />
      </Button>
    </div>
  )
}
