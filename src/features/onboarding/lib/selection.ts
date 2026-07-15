import { getExercise, isFeasible } from '@/features/onboarding/lib/catalog'
import type {
  EngineContext,
  NoteKind,
  Role,
  Selected,
} from '@/features/onboarding/lib/engine-types'
import type { Exercise, ExerciseId } from '@/types/exercise'

type NoteFn = (exercise: Exercise, ctx: EngineContext) => NoteKind | null

type SlotSpec = {
  ctx: EngineContext
  ids: readonly ExerciseId[]
  /** Capability (not level) drives the choice, e.g. a 4+ pull-up on level 0. */
  ignoreLevel?: boolean
  noteFn?: NoteFn
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
    if (!exercise || !isFeasible(exercise, spec.ctx.gear)) {
      continue
    }
    if (!spec.ignoreLevel && exercise.levelMin > spec.ctx.level) {
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
  const note = spec.noteFn ? spec.noteFn(exercise, spec.ctx) : null
  return { exercise, note, role: spec.role }
}

// ── Per-pattern preference lists (best catalog option first, spec §5) ──────

const squatIds: readonly ExerciseId[] = ['goblet_squat', 'air_squat']

const hingeIds = (ctx: EngineContext): readonly ExerciseId[] =>
  ctx.restrictions.back
    ? ['hip_thrust_db', 'glute_bridge_bw', 'db_rdl', 'kb_swing', 'bb_rdl']
    : ['db_rdl', 'bb_rdl', 'kb_swing', 'hip_thrust_db', 'glute_bridge_bw']

const pushHIds = (ctx: EngineContext): readonly ExerciseId[] => {
  const bodyweight: readonly ExerciseId[] =
    ctx.capabilities.pushupsNow === '0-5'
      ? ['incline_pushup', 'pushup']
      : ['pushup', 'incline_pushup']
  return ['db_bench_press', 'db_floor_press', 'bb_floor_press', ...bodyweight]
}

const pushVIds: readonly ExerciseId[] = ['db_ohp', 'band_ohp', 'pike_pushup']

const pullHIds = (ctx: EngineContext): readonly ExerciseId[] =>
  ctx.restrictions.back
    ? ['chest_supported_row', 'db_row_bench', 'band_row', 'bb_bent_row']
    : [
        'db_row_bench',
        'chest_supported_row',
        'bb_bent_row',
        'db_bent_row',
        'band_row',
      ]

const pullVIds = (ctx: EngineContext): readonly ExerciseId[] => {
  const assisted: readonly ExerciseId[] = ctx.gear.bands
    ? ['band_assisted_pullup', 'negative_pullup']
    : ['negative_pullup']
  switch (ctx.capabilities.pullupsNow) {
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
      return ctx.level >= 1 ? ['chinup', ...assisted] : assisted
    }
  }
}

const lungeIds = (ctx: EngineContext): readonly ExerciseId[] =>
  ctx.restrictions.knee
    ? ['step_up_db', 'reverse_lunge_db', 'db_split_squat']
    : [
        'bulgarian_split_squat',
        'reverse_lunge_db',
        'db_split_squat',
        'step_up_db',
      ]

const coreIds: readonly ExerciseId[] = ['plank', 'deadbug', 'side_plank']

// ── Slot notes (spec §11 substitutions get a Czech scaling note) ───────────

const hingeNote: NoteFn = (exercise, ctx) =>
  ctx.restrictions.back &&
  (exercise.id === 'hip_thrust_db' || exercise.id === 'glute_bridge_bw')
    ? 'back_hinge'
    : null

const pushHNote: NoteFn = (exercise, ctx) =>
  exercise.id === 'incline_pushup' && ctx.capabilities.pushupsNow === '0-5'
    ? 'incline'
    : null

const pullVNote: NoteFn = (exercise) =>
  exercise.id === 'band_assisted_pullup' || exercise.id === 'negative_pullup'
    ? 'assist'
    : null

const lungeNote: NoteFn = (exercise, ctx) =>
  ctx.restrictions.knee && exercise.id === 'step_up_db' ? 'knee_step' : null

type AccessorySpec = { ids: readonly ExerciseId[]; noteFn?: NoteFn }

/** Goal-driven accessory patterns, highest value first (spec §5 method 4). */
const accessorySpecs = (ctx: EngineContext): readonly AccessorySpec[] =>
  ctx.goal === 'strength'
    ? [
        { ids: ['db_lateral_raise', 'band_lateral_raise'] },
        { ids: ['db_curl', 'bb_curl', 'band_curl'] },
      ]
    : [
        { ids: lungeIds(ctx), noteFn: lungeNote },
        { ids: ['db_lateral_raise', 'band_lateral_raise'] },
        { ids: ['db_curl', 'bb_curl', 'band_curl'] },
        { ids: ['db_oh_triceps', 'diamond_pushup'] },
        { ids: ['db_rear_delt_fly', 'band_pull_apart'] },
        { ids: ['db_calf_raise'] },
      ]

/** The vertical-push slot, or a second horizontal push when shoulder-limited. */
const pushSlot = (
  ctx: EngineContext,
  used: Set<ExerciseId>,
): Selected | undefined => {
  const isShoulderLimited = ctx.restrictions.shoulder
  return slot({
    ctx,
    ids: isShoulderLimited ? pushHIds(ctx) : pushVIds,
    noteFn: isShoulderLimited ? pushHNote : undefined,
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
export const buildSelection = (ctx: EngineContext): Selected[] => {
  const used = new Set<ExerciseId>()
  const selected: Selected[] = []
  const push = (item: Selected | undefined): void => {
    if (item) {
      selected.push(item)
    }
  }

  push(slot({ ctx, ids: squatIds, role: 'compound', used }))
  push(
    slot({
      ctx,
      ids: hingeIds(ctx),
      noteFn: hingeNote,
      role: 'compound',
      used,
    }),
  )
  push(
    slot({
      ctx,
      ids: pushHIds(ctx),
      noteFn: pushHNote,
      role: 'compound',
      used,
    }),
  )
  push(slot({ ctx, ids: pullHIds(ctx), role: 'compound', used }))
  push(pushSlot(ctx, used))
  if (ctx.gear.pullup_bar) {
    push(
      slot({
        ctx,
        ids: pullVIds(ctx),
        ignoreLevel: true,
        noteFn: pullVNote,
        role: 'compound',
        used,
      }),
    )
  }

  for (const spec of accessorySpecs(ctx)) {
    push(
      slot({
        ctx,
        ids: spec.ids,
        noteFn: spec.noteFn,
        role: 'accessory',
        used,
      }),
    )
  }

  push(slot({ ctx, ids: coreIds, role: 'core', used }))
  return selected
}
