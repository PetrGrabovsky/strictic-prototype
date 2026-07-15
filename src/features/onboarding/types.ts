import { z } from 'zod'
import { equipmentSchema } from '@/types/equipment'
import { goalPrimarySchema } from '@/types/plan'

/**
 * Training experience — maps to a numeric level for catalog gating
 * (new=0 · returning=1 · regular=2, spec §3.1 `level_min`).
 */
export const experienceSchema = z.enum(['new', 'returning', 'regular'])

export type Experience = z.infer<typeof experienceSchema>

/** Sex — only drives conservative starting-weight anchors (spec §10). */
export const sexSchema = z.enum(['male', 'female', 'unspecified'])

export type Sex = z.infer<typeof sexSchema>

/** Self-reported pull-up capability (spec §2), asked only with a pull-up bar. */
export const pullupsCapabilitySchema = z.enum(['0', '1-3', '4+', 'unknown'])

/** Self-reported push-up capability (spec §2). */
export const pushupsCapabilitySchema = z.enum(['0-5', '6-15', '16+', 'unknown'])

export const capabilitiesSchema = z.object({
  pullupsNow: pullupsCapabilitySchema,
  pushupsNow: pushupsCapabilitySchema,
})

export type Capabilities = z.infer<typeof capabilitiesSchema>

/**
 * Boolean injury flags (spec §12.4 — MVP restriction checkboxes, not free
 * text). Each maps to a substitution rule from spec §11 (hard rule 11).
 */
export const restrictionsSchema = z.object({
  back: z.boolean(),
  knee: z.boolean(),
  shoulder: z.boolean(),
})

export type Restrictions = z.infer<typeof restrictionsSchema>

/** Time budget — a mandatory wizard input; it drives count + frequency. */
export const sessionTimeSchema = z.object({
  daysPerWeekAvailable: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().positive(),
})

export type SessionTime = z.infer<typeof sessionTimeSchema>

/**
 * The engine input — the structured profile the onboarding wizard assembles
 * (spec §2 PROFILE, minus the body fields the deterministic engine does not
 * use). This is what {@link buildPlan} consumes.
 */
export const planInputSchema = z.object({
  capabilities: capabilitiesSchema,
  equipment: equipmentSchema,
  experience: experienceSchema,
  goalPrimary: goalPrimarySchema,
  restrictions: restrictionsSchema,
  sex: sexSchema,
  time: sessionTimeSchema,
})

export type PlanInput = z.infer<typeof planInputSchema>
