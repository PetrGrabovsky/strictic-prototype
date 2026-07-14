import { z } from 'zod'

/**
 * Equipment type ids — the shared vocabulary across the exercise catalog,
 * the AI generator PROFILE (spec §2) and future DB columns. Kept verbatim
 * from the spec (snake_case where the spec has it, e.g. `pullup_bar`) so no
 * translation layer is needed when the Phase-2 generator builds its prompt.
 */
export const equipmentIdSchema = z.enum([
  'dumbbells',
  'barbell',
  'kettlebell',
  'bench',
  'pullup_bar',
  'ab_wheel',
  'bands',
])

export type EquipmentId = z.infer<typeof equipmentIdSchema>

/** Resistance-band strengths the user owns (spec §2 `bands.levels`). */
export const bandLevelSchema = z.enum(['light', 'medium', 'heavy'])

export type BandLevel = z.infer<typeof bandLevelSchema>

const loadableEquipmentSchema = z.object({
  available: z.boolean(),
  weightsKg: z.array(z.number()),
})

const dumbbellsSchema = z.object({
  available: z.boolean(),
  perHand: z.boolean(),
  weightsKg: z.array(z.number()),
})

const bandsSchema = z.object({
  available: z.boolean(),
  levels: z.array(bandLevelSchema),
})

/**
 * The user's owned gear plus its configuration (spec §2 PROFILE shape).
 * Loadable implements carry their exact weight list; simple implements are
 * plain availability booleans. This is the single stored source of truth —
 * it supersedes the reference's flat `gear` booleans + separate `weights[]`.
 */
export const equipmentSchema = z.object({
  dumbbells: dumbbellsSchema,
  barbell: loadableEquipmentSchema,
  kettlebell: loadableEquipmentSchema,
  bench: z.boolean(),
  pullup_bar: z.boolean(),
  ab_wheel: z.boolean(),
  bands: bandsSchema,
})

export type Equipment = z.infer<typeof equipmentSchema>

/**
 * Derived availability view: which equipment types the user owns. Not stored
 * separately — read it off {@link Equipment} (`dumbbells.available`, `bench`,
 * …). Kept as a named concept for catalog matching (the deterministic engine,
 * Etapa 5), which only asks "does the user have X?".
 */
export type Gear = Record<EquipmentId, boolean>
