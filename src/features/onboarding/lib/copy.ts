import type { NoteKind } from '@/features/onboarding/lib/engine-types'
import type { Exercise, ExercisePattern } from '@/types/exercise'
import type { GoalPrimary } from '@/types/plan'

/**
 * Product copy for the plan (`_cs` fields, spec §4/§5). These are Czech data
 * strings — the same field the Phase-2 AI coach fills — so they are literal
 * copy here, not i18n keys. Templated (not AI) for the deterministic engine.
 */

/** Warm-up line shared by every generated plan. */
export const WARMUP_CS =
  '5 minut na zahřátí: rozhýbej klouby a u prvních dvou cviků udělej ' +
  'jednu lehčí rozjezdovou sérii.'

const PLAN_NAME_NOUN: Record<GoalPrimary, string> = {
  fat_loss: 'Formuj se doma',
  health: 'Kondice doma',
  hypertrophy: 'Svaly doma',
  strength: 'Síla doma',
}

/** Short, ownable plan name, e.g. `Svaly doma · 3× týdně` (spec §4). */
export const planName = (goal: GoalPrimary, frequency: number): string =>
  `${PLAN_NAME_NOUN[goal]} · ${frequency}× týdně`

const GOAL_CLAUSE: Record<GoalPrimary, string> = {
  fat_loss: 'drží svaly, zatímco tě k formě dostane hlavně jídlo',
  health: 'staví sílu do běžného života',
  hypertrophy: 'sedí na tvůj cíl nabrat svaly',
  strength: 'tlačí tvůj cíl přidat na síle',
}

const DIET_NOTE =
  'O hubnutí rozhoduje hlavně jídlo — trénink ti drží svaly a sílu, ne naopak.'

/** Honest caveats (spec hard rule 12): fat loss must name diet. */
export const honestNotes = (goal: GoalPrimary): string[] =>
  goal === 'fat_loss' ? [DIET_NOTE] : []

/** Coach summary — 4 blunt Czech sentences (spec §5 method step 7). */
export const coachSummary = (goal: GoalPrimary, frequency: number): string =>
  [
    `Tohle je celotělový trénink na ${frequency}× týdně, ` +
      'poskládaný z toho, co máš doma.',
    'První trénink má sednout skoro až moc lehko — ' +
      'tak to má být, ať máš kam růst.',
    `Váhy ber jako start, ne strop; ${GOAL_CLAUSE[goal]}.`,
    'Po zhruba 6 týdnech si plán zaslouží revizi.',
  ].join(' ')

const SCALING_NOTES: Record<NoteKind, string> = {
  assist:
    'Zvolili jsme dopomoc, ať shyb zvládneš čistě; ' +
    'jak přibude síla, dopomoc ubereš.',
  back_hinge: 'Podepřený tah šetří spodní záda.',
  incline: 'Klik s rukama výš pro plný rozsah; postupně sjedeš níž.',
  knee_step: 'Nízký výstup šetří koleno — drž se výšky bez bolesti.',
}

/** Resolve a selection {@link NoteKind} to its Czech `scaling_note_cs`. */
export const scalingNote = (note: NoteKind | null): null | string =>
  note ? SCALING_NOTES[note] : null

const PATTERN_WHY: Record<ExercisePattern, string> = {
  carry: 'Nošení jednoručky pro pevný a stabilní střed',
  core: 'Zpevnění středu těla',
  hinge: 'Zadní řetězec — hamstringy a hýždě',
  iso_biceps: 'Biceps navrch k tahům',
  iso_calves: 'Lýtka pro kompletní nohy',
  iso_rear_delt: 'Zadní ramena pro zdravé držení těla',
  iso_side_delt: 'Boční rozpažky pro širší ramena',
  iso_traps: 'Trapézy pro pevný krk a záda',
  iso_triceps: 'Triceps navrch k tlakům',
  lunge: 'Jednonož pro nohy a stabilitu',
  pull_h: 'Vodorovný přítah pro záda a biceps',
  pull_v: 'Shyb pro široká záda',
  push_h: 'Tlak pro hrudník, triceps a přední rameno',
  push_v: 'Tlak nad hlavu pro ramena',
  squat: 'Dřep zapojí největší svaly nohou',
}

/**
 * Per-exercise `why_this_for_you_cs` (spec §4): pattern rationale tied to the
 * user's goal. Kept under 200 chars (spec §7 check 13).
 */
export const whyFor = (exercise: Exercise, goal: GoalPrimary): string =>
  `${PATTERN_WHY[exercise.pattern]} — ${GOAL_CLAUSE[goal]}.`
