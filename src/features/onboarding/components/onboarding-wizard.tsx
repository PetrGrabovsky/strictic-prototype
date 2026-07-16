'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { StepDots, type StepDotStatus } from '@/components/ui/step-dots'
import { buildPlan } from '@/features/onboarding/lib/build-plan'
import {
  createInitialDraft,
  draftToPlanInput,
  draftToProfile,
  isAboutStepValid,
  isEquipmentStepValid,
  isGoalStepValid,
  isTimeStepValid,
  type WizardDraft,
} from '@/features/onboarding/lib/wizard'
import { cn } from '@/lib/cn'
import { savePlan, saveProfile } from '@/lib/storage'
import type { Plan } from '@/types/plan'
import { AboutStep } from './about-step'
import { EquipmentStep } from './equipment-step'
import { GoalStep } from './goal-step'
import { ChevronLeftIcon } from './icons'
import { PlanReveal } from './plan-reveal'
import { TimeStep } from './time-step'

type Phase = 'building' | 'reveal' | 'wizard'

/** Perceived "crafting your plan" beat — the engine itself is instant. */
const BUILD_DELAY_MS = 700

const STEP_IDS = ['equipment', 'about', 'goal', 'time'] as const

const CONTAINER_CLASS = cn(
  'mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6 pb-8',
)

/**
 * Placeholder for the workout screen (next step of Etapa 5). `console.log` is
 * banned by lint; `info` is allowed — mirrors the landing auth mock.
 */
const logStartWorkout = () => console.info('would start workout')

/**
 * The onboarding wizard: the whole thing is interactive, so it is the client
 * boundary (the route's server component renders nothing but this). Holds the
 * draft profile and step index in plain React state, deriving everything else
 * during render (the only effect resets scroll on step change). Validates each
 * step before advancing, then calls the deterministic engine, persists the
 * profile and reveals the plan.
 */
export const OnboardingWizard = () => {
  const t = useTranslations('onboarding')
  const [draft, setDraft] = useState<WizardDraft>(createInitialDraft)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('wizard')
  const [plan, setPlan] = useState<null | Plan>(null)

  // Start every step (and the reveal) at the top — the previous screen may
  // have been scrolled down. Syncing window scroll is a genuine external effect.
  useEffect(() => {
    globalThis.scrollTo({ top: 0 })
  }, [phase, stepIndex])

  if (phase === 'reveal' && plan) {
    return (
      <main className={CONTAINER_CLASS}>
        <PlanReveal onStart={logStartWorkout} plan={plan} />
      </main>
    )
  }

  if (phase === 'building') {
    return (
      <main
        className={cn(CONTAINER_CLASS, 'items-center justify-center gap-4')}
      >
        <span
          aria-hidden
          className={cn(
            'border-line-2 border-t-accent size-8 rounded-full border-2',
            'motion-safe:animate-spin',
          )}
        />
        <output className="text-ink-2 text-sm font-medium">
          {t('building')}
        </output>
      </main>
    )
  }

  const updateDraft = (partial: Partial<WizardDraft>): void =>
    setDraft((current) => ({ ...current, ...partial }))

  const stepStatus = (index: number): StepDotStatus => {
    if (index < stepIndex) {
      return 'done'
    }
    return index === stepIndex ? 'current' : 'upcoming'
  }

  const stepValidity = [
    isEquipmentStepValid(draft.equipment),
    isAboutStepValid(draft),
    isGoalStepValid(draft),
    isTimeStepValid(draft),
  ]
  const isLastStep = stepIndex === STEP_IDS.length - 1
  const canAdvance = stepValidity[stepIndex]

  const generatePlan = (): void => {
    setPhase('building')
    setTimeout(() => {
      const generated = buildPlan(draftToPlanInput(draft))
      void saveProfile(draftToProfile(draft))
      void savePlan(generated)
      setPlan(generated)
      setPhase('reveal')
    }, BUILD_DELAY_MS)
  }

  const goNext = (): void => {
    if (!canAdvance) {
      return
    }
    if (isLastStep) {
      generatePlan()
    } else {
      setStepIndex((index) => index + 1)
    }
  }

  const goBack = (): void => setStepIndex((index) => Math.max(0, index - 1))

  const dots = STEP_IDS.map((id, index) => ({
    id,
    status: stepStatus(index),
  }))

  return (
    <main className={CONTAINER_CLASS}>
      <div className="flex items-center gap-3">
        <button
          aria-label={t('back')}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full',
            'text-ink hover:bg-line -ms-2 transition-colors',
            stepIndex === 0 && 'invisible',
          )}
          onClick={goBack}
          type="button"
        >
          <ChevronLeftIcon />
        </button>
        <div className="flex-1">
          <StepDots steps={dots} />
        </div>
      </div>
      <p className="text-2xs text-ink-3 mt-2 font-mono tracking-widest uppercase">
        {t('stepStatus', { current: stepIndex + 1, total: STEP_IDS.length })}
      </p>

      <div className="mt-6 flex-1">
        {stepIndex === 0 && (
          <EquipmentStep
            equipment={draft.equipment}
            onChange={(equipment) => updateDraft({ equipment })}
          />
        )}
        {stepIndex === 1 && (
          <AboutStep
            capabilities={draft.capabilities}
            experience={draft.experience}
            hasPullupBar={draft.equipment.pullup_bar}
            onCapabilitiesChange={(capabilities) =>
              updateDraft({ capabilities })
            }
            onExperienceChange={(experience) => updateDraft({ experience })}
            onSexChange={(sex) => updateDraft({ sex })}
            sex={draft.sex}
          />
        )}
        {stepIndex === 2 && (
          <GoalStep
            goalPrimary={draft.goalPrimary}
            onGoalChange={(goalPrimary) => updateDraft({ goalPrimary })}
            onRestrictionsChange={(restrictions) =>
              updateDraft({ restrictions })
            }
            restrictions={draft.restrictions}
          />
        )}
        {stepIndex === 3 && (
          <TimeStep
            onTimeChange={(time) => updateDraft({ time })}
            time={draft.time}
          />
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Button
          className="flex-1"
          disabled={!canAdvance}
          onClick={goNext}
          size="lg"
          variant="primary"
        >
          {t(isLastStep ? 'finish' : 'next')}
        </Button>
      </div>
    </main>
  )
}
