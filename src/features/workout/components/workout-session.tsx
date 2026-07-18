import { useTranslations } from 'next-intl'
import { Disc } from '@/components/ui/disc'
import { RestOverlay } from '@/features/workout/components/rest-overlay'
import { SetInput } from '@/features/workout/components/set-input'
import { SetTray } from '@/features/workout/components/set-tray'
import { WorkoutActions } from '@/features/workout/components/workout-actions'
import { WorkoutControls } from '@/features/workout/components/workout-controls'
import { WorkoutSummary } from '@/features/workout/components/workout-summary'
import {
  useWorkoutSession,
  type WorkoutSessionInput,
} from '@/features/workout/hooks/use-workout-session'
import { cn } from '@/lib/cn'
import { SCREEN } from '@/styles/layout'

type Props = WorkoutSessionInput

/**
 * The live workout screen. All behaviour — timers, set logging, rest, holds,
 * persistence — lives in {@link useWorkoutSession}; this component only lays
 * the returned state out across the sub-bar, the set tray, the input card,
 * the footer actions and the rest overlay.
 */
export const WorkoutSession = (props: Props) => {
  const tExercise = useTranslations('exercises')
  const session = useWorkoutSession(props)

  if (session.phase === 'summary') {
    return (
      <WorkoutSummary
        completedCount={session.completedCount}
        durationSeconds={session.durationSeconds}
        isEasy={props.isEasy}
        onLeave={session.leave}
        skippedNames={session.skippedNames}
        volumeKg={session.volumeKg}
      />
    )
  }

  return (
    <main className="bg-d-bg text-d-ink flex flex-1 flex-col">
      <WorkoutControls
        canGoNext={session.canGoNext}
        canGoPrevious={session.canGoPrevious}
        currentIndex={session.exerciseIndex}
        elapsedSeconds={session.elapsedSeconds}
        isEasy={props.isEasy}
        isMuted={session.isMuted}
        onNext={session.goToNext}
        onPrevious={session.goToPrevious}
        onToggleMute={session.toggleMute}
        steps={session.steps}
        total={session.exerciseCount}
      />

      <div className={cn(SCREEN, 'pt-5 pb-40')}>
        <div className="flex items-start gap-3">
          <Disc tone="dark">{session.exerciseIndex + 1}</Disc>
          <h1 className="text-d-ink mt-0.5 text-xl leading-tight font-semibold">
            {tExercise(`${session.currentExercise.id}.name`)}
          </h1>
        </div>

        <SetTray
          exerciseId={session.currentExercise.id}
          focusSetIndex={session.focusSetIndex}
          isHold={session.currentExercise.isHold}
          onClearFocus={session.clearFocus}
          onFocusSet={session.focusSet}
          sets={session.sets}
        />

        <SetInput
          doneCount={session.doneCount}
          exercise={session.currentExercise}
          heroSet={session.heroSet}
          holdRunningSeconds={session.holdRunningSeconds}
          isEditing={session.isEditing}
          onAdjustReps={session.adjustReps}
          onAdjustWeight={session.adjustWeight}
          onLogSet={session.logSet}
          onSaveEdit={session.saveEdit}
          onSetReps={session.setReps}
          onSetWeight={session.setWeight}
          onStartHold={session.startHold}
          onStopHold={session.stopHold}
          onUndoSet={session.undoSet}
        />

        <WorkoutActions
          canSaveAndExit={session.hasAnyLogged}
          continueIndex={session.continueIndex}
          isConfirmingDiscard={session.isConfirmingDiscard}
          isLastExercise={session.isLastExercise}
          isReviewing={session.isReviewing}
          onCancelDiscard={session.cancelDiscard}
          onConfirmDiscard={session.confirmDiscard}
          onContinueReview={session.continueReview}
          onForward={session.forward}
          onRequestDiscard={session.requestDiscard}
          onSaveAndExit={session.saveAndExit}
          onSkip={session.skipExercise}
        />
      </div>

      {session.rest === null ? null : (
        <RestOverlay
          ctaLabel={session.rest.ctaLabel}
          detail={session.rest.detail}
          elapsedSeconds={session.elapsedSeconds}
          heading={session.rest.heading}
          isEasy={props.isEasy}
          isLastStep={session.rest.isLastStep}
          name={session.rest.name}
          onAddTime={session.addRestTime}
          onContinue={session.rest.onContinue}
          remainingSeconds={session.rest.remainingSeconds}
          totalSeconds={session.rest.totalSeconds}
        />
      )}
    </main>
  )
}
