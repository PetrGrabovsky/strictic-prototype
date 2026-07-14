import { z } from 'zod'

/** Who authored a coach chat turn. */
export const coachRoleSchema = z.enum(['user', 'assistant'])

export type CoachRole = z.infer<typeof coachRoleSchema>

export const coachMessageSchema = z.object({
  role: coachRoleSchema,
  content: z.string(),
})

export type CoachMessage = z.infer<typeof coachMessageSchema>

/**
 * Persisted coach state: the chat transcript, remaining free messages
 * (`FREE_COACH_MESSAGES`) and whether the user has unlocked Plus.
 */
export const coachStateSchema = z.object({
  free: z.number(),
  messages: z.array(coachMessageSchema),
  plus: z.boolean(),
})

export type CoachState = z.infer<typeof coachStateSchema>
