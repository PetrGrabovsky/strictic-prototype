/**
 * Storage keys — the localStorage namespace for each island of data. All on
 * the app's own `strictic:` prefix at `v1`: there are no real users before
 * launch, so the old reference-era `fitcoach:*` keys were dropped rather than
 * migrated, and Etapa 6 maps each key to its Supabase table.
 */
export const PROGRESS_STORAGE_KEY = 'strictic:progress:v1'
export const PROFILE_STORAGE_KEY = 'strictic:profile:v1'
export const SESSION_STORAGE_KEY = 'strictic:session:v1'
export const HISTORY_STORAGE_KEY = 'strictic:history:v1'
export const COACH_STORAGE_KEY = 'strictic:coach:v1'
export const PLAN_STORAGE_KEY = 'strictic:plan:v1'

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
