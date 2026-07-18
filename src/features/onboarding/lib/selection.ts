import { getExercise, isFeasible } from '@/features/onboarding/lib/catalog'
import type {
  EngineContext,
  NoteKind,
  Role,
  Selected,
} from '@/features/onboarding/lib/engine-types'
import type { Exercise, ExerciseId } from '@/types/exercise'

type NoteRule = (exercise: Exercise, context: EngineContext) => NoteKind | null

type SlotSpec = {
  context: EngineContext
  ids: readonly ExerciseId[]
  /** Capability (not level) drives the choice, e.g. a 4+ pull-up on level 0. */
  ignoreLevel?: boolean
  noteRule?: NoteRule
  role: Role
  used: Set<ExerciseId>
}

/** First id that is unused, feasible and (unless overridden) within level. */
const firstFeasible = (spec: SlotSpec): Exercise | undefined => {
  for (const id of spec.ids) {
    if (spec.used.has(id)) {
      continue
    }
    const exercise = getExercise(id)
    if (!exercise || !isFeasible(exercise, spec.context.gear)) {
      continue
    }
    if (!spec.ignoreLevel && exercise.levelMin > spec.context.level) {
      continue
    }
    return exercise
  }
  return undefined
}

/** Resolve a slot to a {@link Selected}, marking its id used. */
const slot = (spec: SlotSpec): Selected | undefined => {
  const exercise = firstFeasible(spec)
  if (!exercise) {
    return undefined
  }
  spec.used.add(exercise.id)
  const note = spec.noteRule ? spec.noteRule(exercise, spec.context) : null
  return { exercise, note, role: spec.role }
}

// ── Per-pattern preference lists (best catalog option first, spec §5) ──────

const squatIds: readonly ExerciseId[] = ['goblet_squat', 'air_squat']

const hingeIds = (context: EngineContext): readonly ExerciseId[] =>
  context.restrictions.back
    ? ['hip_thrust_db', 'glute_bridge_bw', 'db_rdl', 'kb_swing', 'bb_rdl']
    : ['db_rdl', 'bb_rdl', 'kb_swing', 'hip_thrust_db', 'glute_bridge_bw']

const horizontalPushIds = (context: EngineContext): readonly ExerciseId[] => {
  const bodyweight: readonly ExerciseId[] =
    context.capabilities.pushupsNow === '0-5'
      ? ['incline_pushup', 'pushup']
      : ['pushup', 'incline_pushup']
  return ['db_bench_press', 'db_floor_press', 'bb_floor_press', ...bodyweight]
}

const verticalPushIds: readonly ExerciseId[] = [
  'db_ohp',
  'band_ohp',
  'pike_pushup',
]

const horizontalPullIds = (context: EngineContext): readonly ExerciseId[] =>
  context.restrictions.back
    ? ['chest_supported_row', 'db_row_bench', 'band_row', 'bb_bent_row']
    : [
        'db_row_bench',
        'chest_supported_row',
        'bb_bent_row',
        'db_bent_row',
        'band_row',
      ]

const verticalPullIds = (context: EngineContext): readonly ExerciseId[] => {
  const assisted: readonly ExerciseId[] = context.gear.bands
    ? ['band_assisted_pullup', 'negative_pullup']
    : ['negative_pullup']
  switch (context.capabilities.pullupsNow) {
    case '4+': {
      return ['pullup', 'chinup', ...assisted]
    }
    case '1-3': {
      return ['chinup', ...assisted]
    }
    case '0': {
      return assisted
    }
    case 'unknown': {
      return context.level >= 1 ? ['chinup', ...assisted] : assisted
    }
  }
}

const lungeIds = (context: EngineContext): readonly ExerciseId[] =>
  context.restrictions.knee
    ? ['step_up_db', 'reverse_lunge_db', 'db_split_squat']
    : [
        'bulgarian_split_squat',
        'reverse_lunge_db',
        'db_split_squat',
        'step_up_db',
      ]

const coreIds: readonly ExerciseId[] = ['plank', 'deadbug', 'side_plank']

// ── Slot notes (spec §11 substitutions get a Czech scaling note) ───────────

const hingeNote: NoteRule = (exercise, context) =>
  context.restrictions.back &&
  (exercise.id === 'hip_thrust_db' || exercise.id === 'glute_bridge_bw')
    ? 'back_hinge'
    : null

const horizontalPushNote: NoteRule = (exercise, context) =>
  exercise.id === 'incline_pushup' && context.capabilities.pushupsNow === '0-5'
    ? 'incline'
    : null

const verticalPullNote: NoteRule = (exercise) =>
  exercise.id === 'band_assisted_pullup' || exercise.id === 'negative_pullup'
    ? 'assist'
    : null

const lungeNote: NoteRule = (exercise, context) =>
  context.restrictions.knee && exercise.id === 'step_up_db' ? 'knee_step' : null

type AccessorySpec = { ids: readonly ExerciseId[]; noteRule?: NoteRule }

/** Goal-driven accessory patterns, highest value first (spec §5 method 4). */
const accessorySpecs = (context: EngineContext): readonly AccessorySpec[] =>
  context.goal === 'strength'
    ? [
        { ids: ['db_lateral_raise', 'band_lateral_raise'] },
        { ids: ['db_curl', 'bb_curl', 'band_curl'] },
      ]
    : [
        { ids: lungeIds(context), noteRule: lungeNote },
        { ids: ['db_lateral_raise', 'band_lateral_raise'] },
        { ids: ['db_curl', 'bb_curl', 'band_curl'] },
        { ids: ['db_oh_triceps', 'diamond_pushup'] },
        { ids: ['db_rear_delt_fly', 'band_pull_apart'] },
        { ids: ['db_calf_raise'] },
      ]

/** The vertical-push slot, or a second horizontal push when shoulder-limited. */
const pushSlot = (
  context: EngineContext,
  used: Set<ExerciseId>,
): Selected | undefined => {
  const isShoulderLimited = context.restrictions.shoulder
  return slot({
    context,
    ids: isShoulderLimited ? horizontalPushIds(context) : verticalPushIds,
    noteRule: isShoulderLimited ? horizontalPushNote : undefined,
    role: 'compound',
    used,
  })
}

/**
 * Build the ordered coverage skeleton (spec hard rule 4): compounds big→small
 * (legs first, alternating push/pull), then goal accessories, then one core.
 * Capabilities and restrictions steer each pick; infeasible patterns are
 * silently skipped.
 */
export const buildSelection = (context: EngineContext): Selected[] => {
  const used = new Set<ExerciseId>()
  const selected: Selected[] = []
  const add = (item: Selected | undefined): void => {
    if (item) {
      selected.push(item)
    }
  }

  add(slot({ context, ids: squatIds, role: 'compound', used }))
  add(
    slot({
      context,
      ids: hingeIds(context),
      noteRule: hingeNote,
      role: 'compound',
      used,
    }),
  )
  add(
    slot({
      context,
      ids: horizontalPushIds(context),
      noteRule: horizontalPushNote,
      role: 'compound',
      used,
    }),
  )
  add(
    slot({ context, ids: horizontalPullIds(context), role: 'compound', used }),
  )
  add(pushSlot(context, used))
  if (context.gear.pullup_bar) {
    add(
      slot({
        context,
        ids: verticalPullIds(context),
        ignoreLevel: true,
        noteRule: verticalPullNote,
        role: 'compound',
        used,
      }),
    )
  }

  for (const spec of accessorySpecs(context)) {
    add(
      slot({
        context,
        ids: spec.ids,
        noteRule: spec.noteRule,
        role: 'accessory',
        used,
      }),
    )
  }

  add(slot({ context, ids: coreIds, role: 'core', used }))
  return selected
}
