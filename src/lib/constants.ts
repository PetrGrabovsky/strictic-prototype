/**
 * Storage keys — the localStorage namespace for each island of data. Values
 * are kept verbatim from the reference (`fitcoach:*`) as the on-disk wire
 * format; only the constant names are spelled out (the reference used
 * PKEY/EKEY/SKEY/HKEY/CKEY). A future rename to a `strictic:*` prefix is a
 * one-off migration, deliberately not done here to keep parity with the
 * reference's data shapes.
 */
export const PROGRESS_STORAGE_KEY = 'fitcoach:progress:v5'
export const EQUIPMENT_STORAGE_KEY = 'fitcoach:equip:v2'
export const SESSION_STORAGE_KEY = 'fitcoach:session:v1'
export const HISTORY_STORAGE_KEY = 'fitcoach:history:v1'
export const COACH_STORAGE_KEY = 'fitcoach:coach:v1'
export const PLAN_STORAGE_KEY = 'fitcoach:plan:v1'

/**
 * Free-tier limits (blueprint §2.3 / §4). The deterministic core is free
 * forever; these cap the AI features that cost money to run.
 */
export const FREE_COACH_MESSAGES = 3
export const FREE_PLAN_GENERATIONS = 1
export const PLUS_COACH_MESSAGES_PER_MONTH = 100

/**
 * How long a paused workout stays resumable. Reopening the training screen
 * within this window of the last saved step silently continues the session
 * (the {@link WorkoutSession} `ts` guard from `types/workout.ts`); past it, a
 * stale session is ignored and the workout starts fresh. Six hours comfortably
 * covers a mid-session interruption without ever resurrecting yesterday's run.
 */
export const SESSION_RESUME_WINDOW_MS = 6 * 60 * 60 * 1000
