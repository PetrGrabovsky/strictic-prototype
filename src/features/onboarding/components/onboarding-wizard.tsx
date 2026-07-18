'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { ChevronLeftIcon } from '@/components/ui/icons'
import { LoadingScreen } from '@/components/ui/loading-screen'
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
import { useRouter } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { savePlan, saveProfile } from '@/lib/storage'
import { SCREEN } from '@/styles/layout'
import { MICRO_LABEL } from '@/styles/type'
import type { Plan } from '@/types/plan'
import { AboutStep } from './about-step'
import { EquipmentStep } from './equipment-step'
import { GoalStep } from './goal-step'
import { PlanReveal } from './plan-reveal'
import { TimeStep } from './time-step'

type Phase = 'building' | 'reveal' | 'wizard'

/** Perceived "crafting your plan" beat — the engine itself is instant. */
const BUILD_DELAY_MS = 700

const STEP_IDS = ['equipment', 'about', 'goal', 'time'] as const

/**
 * The onboarding wizard: the whole thing is interactive, so it is the client
 * boundary (the route's server component renders nothing but this). Holds the
 * draft profile and step index in plain React state, deriving everything else
 * during render (the only effects sync window scroll and clean up the build
 * timer). Validates each step before advancing, then calls the deterministic
 * engine, persists the profile, reveals the plan and hands off to the first
 * workout.
 */
export const OnboardingWizard = () => {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [draft, setDraft] = useState<WizardDraft>(createInitialDraft)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('wizard')
  const [plan, setPlan] = useState<null | Plan>(null)
  const buildTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  // Start every step (and the reveal) at the top — the previous screen may
  // have been scrolled down. Syncing window scroll is a genuine external effect.
  useEffect(() => {
    globalThis.scrollTo({ top: 0 })
  }, [phase, stepIndex])

  // Cancel the staged "building" beat if the wizard unmounts mid-delay.
  useEffect(() => () => clearTimeout(buildTimer.current), [])

  if (phase === 'reveal' && plan) {
    return (
      <main className={SCREEN}>
        <PlanReveal onStart={() => router.push('/app/trenink')} plan={plan} />
      </main>
    )
  }

  if (phase === 'building') {
    return <LoadingScreen label={t('building')} spinner />
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
    buildTimer.current = setTimeout(() => {
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
    <main className={SCREEN}>
      <div className="flex items-center gap-3">
        <IconButton
          className={cn(
            'text-ink hover:bg-line -ms-2 rounded-full transition-colors',
            stepIndex === 0 && 'invisible',
          )}
          label={t('back')}
          onClick={goBack}
        >
          <ChevronLeftIcon size={20} />
        </IconButton>
        <div className="flex-1">
          <StepDots steps={dots} />
        </div>
      </div>
      <p className={cn(MICRO_LABEL, 'text-ink-3 mt-2')}>
        {t('stepStatus', { current: stepIndex + 1, total: STEP_IDS.length })}
      </p>

      <div className="mt-6 flex-1">
        {stepIndex === 0 ? (
          <EquipmentStep
            equipment={draft.equipment}
            onChange={(equipment) => updateDraft({ equipment })}
          />
        ) : null}
        {stepIndex === 1 ? (
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
        ) : null}
        {stepIndex === 2 ? (
          <GoalStep
            goalPrimary={draft.goalPrimary}
            onGoalChange={(goalPrimary) => updateDraft({ goalPrimary })}
            onRestrictionsChange={(restrictions) =>
              updateDraft({ restrictions })
            }
            restrictions={draft.restrictions}
          />
        ) : null}
        {stepIndex === 3 ? (
          <TimeStep
            onTimeChange={(time) => updateDraft({ time })}
            time={draft.time}
          />
        ) : null}
      </div>

      <Button
        className="mt-8 w-full"
        disabled={!canAdvance}
        onClick={goNext}
        size="lg"
        variant="primary"
      >
        {t(isLastStep ? 'finish' : 'next')}
      </Button>
    </main>
  )
}
