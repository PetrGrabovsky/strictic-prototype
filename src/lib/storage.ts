import type { z } from 'zod'
import {
  COACH_STORAGE_KEY,
  EQUIPMENT_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  PLAN_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
} from '@/lib/constants'
import { coachStateSchema } from '@/types/coach'
import type { CoachState } from '@/types/coach'
import { planSchema } from '@/types/plan'
import type { Plan } from '@/types/plan'
import { profileSchema } from '@/types/profile'
import type { Profile } from '@/types/profile'
import {
  workoutHistorySchema,
  workoutProgressSchema,
  workoutSessionSchema,
} from '@/types/workout'
import type {
  WorkoutHistory,
  WorkoutProgress,
  WorkoutSession,
} from '@/types/workout'

/**
 * The one and only gateway to persisted data. Every read/write in the app
 * flows through these functions — nothing else touches `localStorage`. The
 * implementation is localStorage today and swaps to Supabase at launch
 * (Etapa 6); because the signatures are already async, that swap changes
 * only the bodies below, never a call site.
 *
 * Reads are validated with each key's zod schema, so corrupt or
 * outdated-shape data is discarded (returns `null`) instead of crashing a
 * component — localStorage is user-editable and survives schema changes.
 */

const read = <Schema extends z.ZodType>(
  key: string,
  schema: Schema,
): null | z.output<Schema> => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = globalThis.localStorage.getItem(key)
    if (raw === null) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    const result = schema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    // localStorage or JSON.parse can throw (private mode, quota, bad data);
    // a failed read is a missing value, not a crash.
    return null
  }
}

const write = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Writes are best-effort: localStorage can be unavailable or full.
  }
}

const remove = (key: string): void => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    globalThis.localStorage.removeItem(key)
  } catch {
    // Best-effort — see `write`.
  }
}

export const loadProfile = async (): Promise<null | Profile> =>
  read(EQUIPMENT_STORAGE_KEY, profileSchema)

export const saveProfile = async (value: Profile): Promise<void> => {
  write(EQUIPMENT_STORAGE_KEY, value)
}

export const loadPlan = async (): Promise<null | Plan> =>
  read(PLAN_STORAGE_KEY, planSchema)

export const savePlan = async (value: Plan): Promise<void> => {
  write(PLAN_STORAGE_KEY, value)
}

export const loadProgress = async (): Promise<null | WorkoutProgress> =>
  read(PROGRESS_STORAGE_KEY, workoutProgressSchema)

export const saveProgress = async (value: WorkoutProgress): Promise<void> => {
  write(PROGRESS_STORAGE_KEY, value)
}

export const loadHistory = async (): Promise<null | WorkoutHistory> =>
  read(HISTORY_STORAGE_KEY, workoutHistorySchema)

export const saveHistory = async (value: WorkoutHistory): Promise<void> => {
  write(HISTORY_STORAGE_KEY, value)
}

export const loadSession = async (): Promise<null | WorkoutSession> =>
  read(SESSION_STORAGE_KEY, workoutSessionSchema)

export const saveSession = async (value: WorkoutSession): Promise<void> => {
  write(SESSION_STORAGE_KEY, value)
}

export const clearSession = async (): Promise<void> => {
  remove(SESSION_STORAGE_KEY)
}

export const loadCoach = async (): Promise<CoachState | null> =>
  read(COACH_STORAGE_KEY, coachStateSchema)

export const saveCoach = async (value: CoachState): Promise<void> => {
  write(COACH_STORAGE_KEY, value)
}
