import { z } from 'zod'

/**
 * The best set of one exercise in a finished workout, as stored in history.
 * Terse field names are intentional — they are the wire format and map 1:1
 * to the future `workout_exercises` columns (ARCHITECTURE §5).
 */
export const exerciseResultSchema = z.object({
  w: z.number(), // top-set weight in kg (per hand where the exercise is)
  r: z.number(), // reps performed in that set
  e1: z.number(), // estimated 1RM (Epley), used only to rank the best set
})

export type ExerciseResult = z.infer<typeof exerciseResultSchema>

/** One finished session on the Progress screen. */
export const workoutRecordSchema = z.object({
  date: z.number(), // epoch ms
  dur: z.number(), // duration in seconds
  volume: z.number(), // total kg moved (Σ sets × reps × weight)
  ex: z.record(z.string(), exerciseResultSchema), // keyed by exercise id
  demo: z.boolean().optional(), // seeded sample, shown until real history exists
  easy: z.boolean().optional(), // logged on a light day
})

export type WorkoutRecord = z.infer<typeof workoutRecordSchema>

export const workoutHistorySchema = z.array(workoutRecordSchema)

export type WorkoutHistory = z.infer<typeof workoutHistorySchema>

/** One logged set inside an in-progress workout. */
export const workoutSetSchema = z.object({
  reps: z.number(),
  weight: z.number(),
  done: z.boolean(),
  secs: z.number().optional(), // elapsed time, holds only
})

export type WorkoutSet = z.infer<typeof workoutSetSchema>

export const exerciseStatusSchema = z.enum(['pending', 'done', 'skipped'])

export type ExerciseStatus = z.infer<typeof exerciseStatusSchema>

/** All sets of one exercise plus its completion state, mid-workout. */
export const exerciseLogSchema = z.object({
  sets: z.array(workoutSetSchema),
  status: exerciseStatusSchema,
})

export type ExerciseLog = z.infer<typeof exerciseLogSchema>

/**
 * A paused, resumable workout. Offered for resume only within
 * `SESSION_RESUME_WINDOW_MS` of `ts` (checked by the caller in Etapa 5).
 */
export const workoutSessionSchema = z.object({
  idx: z.number(), // current exercise index
  elapsed: z.number(), // seconds elapsed so far
  ts: z.number(), // saved-at epoch ms
  easy: z.boolean(),
  logs: z.record(z.string(), exerciseLogSchema), // keyed by exercise id
})

export type WorkoutSession = z.infer<typeof workoutSessionSchema>

/** Progression state for one exercise: its working weights and last bump. */
export const progressEntrySchema = z.object({
  weights: z.array(z.number()),
  bump: z.object({ from: z.number(), to: z.number() }).nullish(),
  secs: z.array(z.number()).optional(), // last hold durations, holds only
})

export type ProgressEntry = z.infer<typeof progressEntrySchema>

/**
 * Per-exercise progression plus a marker of the last finished session.
 * Reworked from the reference's `_last` sentinel key into an explicit `last`
 * field — there is no legacy data to preserve, and this validates cleanly.
 */
export const workoutProgressSchema = z.object({
  entries: z.record(z.string(), progressEntrySchema), // keyed by exercise id
  last: z.object({ date: z.number(), volume: z.number() }).optional(),
})

export type WorkoutProgress = z.infer<typeof workoutProgressSchema>
