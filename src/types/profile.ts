import { z } from 'zod'
import { equipmentSchema } from '@/types/equipment'

/** Training intent — drives rest length and the light-day trim (reference). */
export const goalSchema = z.enum(['strength', 'cutting', 'health'])

export type Goal = z.infer<typeof goalSchema>

/**
 * The user's profile, stored under the equipment key: their gear plus the
 * training settings that live alongside it (reference `equip` blob, cleaned
 * up — `weights`/`gear` are now folded into {@link Equipment}).
 */
export const profileSchema = z.object({
  equipment: equipmentSchema,
  goal: goalSchema,
  muted: z.boolean(),
})

export type Profile = z.infer<typeof profileSchema>
