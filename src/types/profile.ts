import { z } from 'zod'
import { equipmentSchema } from '@/types/equipment'
import { goalPrimarySchema } from '@/types/plan'

/**
 * The user's profile, stored under the equipment key: their gear plus the
 * training settings that live alongside it (reference `equip` blob, cleaned
 * up — `weights`/`gear` are now folded into {@link Equipment}). `goal` reuses
 * the plan's {@link goalPrimarySchema}, so the stored value is byte-identical
 * to the wizard's goal chip — no translation layer.
 */
export const profileSchema = z.object({
  equipment: equipmentSchema,
  goal: goalPrimarySchema,
  muted: z.boolean(),
})

export type Profile = z.infer<typeof profileSchema>
