# Strictic — AI coach: tailored plan generation (implementation spec v1)

> Goal: from a profile (body + experience + equipment + time + goal in their own
> words) generate **the best possible home full-body plan** — exercise
> selection, sets, reps, rests, frequency, starting weights — at the level of a
> top evidence-based coach, while being **100% machine-processable and safe**.
>
> Note on language: the system prompt in §5 is deliberately in English
> (instruction precision) and is a code artifact — kept verbatim. Exercise names
> (`name_cs`) and Czech example/copy strings throughout are product data/copy —
> kept verbatim in Czech. The surrounding documentation is in English.

---

## 0. Core principle (why it works reliably)

**The model does not invent exercises. It selects from your curated library
(menu) and returns structured JSON.**

- The exercise library = your content: ID, Czech names, "How to / Why" texts
  (QA, brand tone), metadata (pattern, muscles, equipment, difficulty, scaling).
- The model = selection intelligence: reads the free-text goal (including
  limitations like "my shoulder hurts"), assembles the plan per the rules in the
  prompt and **justifies it personally**.
- The code = validator: schema, feasibility with the equipment, weights from the
  real set, volume and time limits. Error → 1 retry with a description of the
  errors → fallback to the deterministic engine (today's plan in the app).

That gets you the magic ("write your goal in a sentence, get a plan for you")
without the risk of hallucinated or unsafe output.

---

## 1. End-to-end pipeline

```
Wizard (4 steps) ──► PROFILE JSON
                          │
                          ▼
        [system prompt] + [PROFILE + GOAL_TEXT + CATALOG]
                          │  (strong model, temp 0.2, JSON-only)
                          ▼
                    PLAN JSON (draft)
                          │
                          ▼
                 VALIDATOR (deterministic)
                   │ ok            │ errors
                   ▼               ▼
               save + render   RETRY (1×, with an error list)
                                   │ ok / errors
                                   ▼
                              FALLBACK engine
                              (today's deterministic plan)
```

- **Free tier / offline**: the fallback engine is also the offline generator (no
  server = no AI generation, the app works).
- **Plus hook**: "a tailored plan from the AI coach" + later regeneration/edits
  by the coach.

---

## 2. Inputs (wizard → PROFILE JSON)

```jsonc
{
  "sex": "male" | "female" | "unspecified",
  "age": 34,
  "height_cm": 181,            // optional (may be null)
  "weight_kg": 92,
  "experience": "new" | "returning" | "regular",
  "capabilities": {
    "pullups_now": "0" | "1-3" | "4+" | "unknown",   // ask ONLY when they have a pull-up bar
    "pushups_now": "0-5" | "6-15" | "16+" | "unknown"
  },
  "equipment": {
    "dumbbells": { "available": true, "per_hand": true, "weights_kg": [2,4,6,8,10,12,14,16,18,20,22,24] },
    "barbell":   { "available": false, "weights_kg": [] },
    "kettlebell":{ "available": false, "weights_kg": [] },
    "bench": true, "pullup_bar": true, "ab_wheel": false,
    "bands": { "available": true, "levels": ["light","medium"] }
  },
  "time": { "minutes_per_session": 45, "days_per_week_available": 3 },
  "goal_text_cs": "Chci hlavně nabrat svaly a vypadat líp, mám doma činky a hrazdu, ale neudělám ani jeden shyb. Občas mě zlobí spodní záda."
}
```

Notes:

- Ask `capabilities` dynamically per equipment (pull-up bar → pull-ups; always →
  push-ups). One extra question here has more value than height+weight combined.
- Time options are a **mandatory input** (minutes per session + days per week) —
  they drive the exercise count and frequency.

---

## 3. Exercise library (format + v1 list)

### 3.1 Record format (what goes to the model in the prompt)

```jsonc
{
  "id": "db_rdl",
  "name_cs": "Rumunský mrtvý tah s jednoručkami",
  "pattern": "hinge",                    // squat | hinge | lunge | push_h | push_v | pull_h | pull_v | core | carry | iso_side_delt | iso_rear_delt | iso_biceps | iso_triceps | iso_traps | iso_calves
  "primary": ["hamstrings","glutes"],
  "secondary": ["lower_back","traps"],
  "equipment": [["dumbbells"],["kettlebell"]],   // array of ALTERNATIVES; each alternative = a list of required items (AND), OR between alternatives
  "level_min": 0,                        // 0 new · 1 returning · 2 regular
  "load_type": "external" | "bodyweight" | "band",
  "per_hand": true,
  "unilateral": false,
  "scaling": { "easier": "glute_bridge_bw", "harder": "db_single_leg_rdl" },
  "seconds_per_set_est": 40              // pure work of one set (without rest)
}
```

The full "How to / Why" texts live in the app next to the ID — **they do NOT go
into the prompt** (saves tokens; the model doesn't need them and, above all,
must not rewrite them).

### 3.2 v1 list (~40 exercises) — id · name_cs · pattern · equipment · level · load

(Exercise names are Czech `name_cs` values — product data, kept verbatim.)

**Squat / lunge**

- `air_squat` · Dřep s vlastní vahou · squat · — · 0 · bodyweight
- `goblet_squat` · Goblet dřep · squat · db|kb · 0 · external
- `db_split_squat` · Výpad na místě s jednoručkami · lunge · db · 1 · external
- `bulgarian_split_squat` · Bulharský dřep · lunge · db+bench · 2 · external
- `step_up_db` · Výstupy na lavici · lunge · db+bench · 0 · external
- `reverse_lunge_db` · Zpětný výpad · lunge · db · 1 · external

**Hinge (posterior chain)**

- `glute_bridge_bw` · Glute bridge · hinge · — · 0 · bodyweight
- `db_rdl` · Rumunský mrtvý tah · hinge · db|kb · 0 · external
- `hip_thrust_db` · Hip thrust o lavici · hinge · db+bench · 1 · external
- `kb_swing` · Kettlebell swing · hinge · kb · 1 · external
- `db_single_leg_rdl` · RDL na jedné noze · hinge · db · 2 · external

**Horizontal push**

- `incline_pushup` · Klik s rukama na vyvýšení · push_h · — · 0 · bodyweight
- `pushup` · Klik · push_h · — · 0 · bodyweight
- `db_floor_press` · Tlak na zemi s jednoručkami · push_h · db · 0 · external
- `db_bench_press` · Bench press s jednoručkami · push_h · db+bench · 0 ·
  external
- `decline_pushup` · Klik s nohama na vyvýšení · push_h · — · 1 · bodyweight
- `diamond_pushup` · Diamantový klik · iso_triceps · — · 1 · bodyweight

**Vertical push**

- `db_ohp` · Tlak nad hlavu s jednoručkami · push_v · db · 0 · external
- `band_ohp` · Tlak nad hlavu s gumou · push_v · bands · 0 · band
- `pike_pushup` · Pike klik · push_v · — · 1 · bodyweight

**Horizontal pull**

- `band_row` · Přítah s gumou vsedě · pull_h · bands · 0 · band
- `db_row_bench` · Přítah jednoručky o lavici · pull_h · db+bench · 0 · external
- `chest_supported_row` · Přítahy vleže na šikmé lavici · pull_h · db+bench · 0
  · external
- `db_bent_row` · Přítah v předklonu obouruč · pull_h · db · 1 · external

**Vertical pull**

- `negative_pullup` · Negativní shyb (jen brzdění dolů) · pull_v · pullup_bar ·
  0 · bodyweight
- `band_assisted_pullup` · Shyb s dopomocí gumy · pull_v · pullup_bar+bands · 0
  · bodyweight
- `chinup` · Shyb podhmatem · pull_v · pullup_bar · 1 · bodyweight
- `pullup` · Shyb nadhmatem · pull_v · pullup_bar · 2 · bodyweight

**Barbell (if the user has one)**

- `bb_rdl` · Rumunský mrtvý tah s velkou činkou · hinge · barbell · 1 · external
- `bb_bent_row` · Přítah velké činky v předklonu · pull_h · barbell · 1 ·
  external
- `bb_floor_press` · Tlak s velkou činkou vleže na zemi · push_h · barbell · 1 ·
  external
- `bb_curl` · Biceps zdvih s velkou činkou · iso_biceps · barbell · 0 · external

> Note: for the barbell, `weights_kg` is a list of TOTAL adjustable weights
> (bar+plates) and `per_hand:false` — starting-weight rounding happens against
> this list.

**Shoulder/arm/traps/calf isolation**

- `db_lateral_raise` · Boční rozpažky · iso_side_delt · db · 0 · external
- `band_lateral_raise` · Boční rozpažky s gumou · iso_side_delt · bands · 0 ·
  band
- `band_pull_apart` · Rozpažky s gumou (zadní delt) · iso_rear_delt · bands · 0
  · band
- `db_rear_delt_fly` · Rozpažky v předklonu o lavici · iso_rear_delt · db+bench
  · 1 · external
- `db_curl` · Biceps zdvih · iso_biceps · db · 0 · external
- `db_hammer_curl` · Kladivový zdvih · iso_biceps · db · 0 · external
- `band_curl` · Biceps s gumou · iso_biceps · bands · 0 · band
- `db_oh_triceps` · Triceps extension nad hlavou · iso_triceps · db · 0 ·
  external
- `db_shrug` · Shrug (pokrčení rameny) · iso_traps · db · 0 · external
- `db_calf_raise` · Výpony s jednoručkami · iso_calves · db · 0 · external

**Core**

- `plank` · Plank · core · — · 0 · bodyweight (hold)
- `side_plank` · Boční plank · core · — · 0 · bodyweight (hold)
- `deadbug` · Deadbug · core · — · 0 · bodyweight
- `hollow_hold` · Hollow hold · core · — · 1 · bodyweight (hold)
- `ab_rollout` · Rollout s kolečkem · core · ab_wheel · 1 · bodyweight
- `suitcase_carry` · Kufr (nošení jednoručky) · carry/core · db · 1 · external

> Curator note: this is your real "moat" — the How/Why texts in brand tone for
> each ID. Write them gradually; the engine works even if the v1 library has 25
> exercises.

---

## 4. Output JSON schema (the contract)

```jsonc
{
  "meta": {
    "goal_primary": "hypertrophy" | "strength" | "fat_loss" | "health",
    "plan_name_cs": "Svaly doma · 3× týdně",   // short, ownable plan name (a shareable artifact)
    "frequency_per_week": 3,
    "split": "full_body",
    "session_time_est_min": 44,
    "detected_constraints": ["lower_back_sensitivity"],   // snake_case, EN, [] is fine
    "excluded_patterns": [],                              // patterns excluded due to constraints
    "coach_summary_cs": "3–5 vět: co dostáváš, proč, co čekat. Poctivě.",
    "honest_notes_cs": ["U hubnutí rozhoduje jídlo — trénink drží svaly a sílu."]  // 0–3 items
  },
  "warmup_cs": "5 minut: lehké rozproudění + 1 lehčí rozjezdová série u prvních cviků.",
  "plan": [
    {
      "exercise_id": "goblet_squat",
      "sets": 3,
      "reps": 10,                       // for holds, hold_s instead
      "hold_s": null,
      "rest_s": 120,
      "start_weight_kg": 16,            // ONLY load_type external; MUST be from the user's set; otherwise null
      "why_this_for_you_cs": "1 věta, osobní — odkazuj na JEHO vybavení/cíl/schopnosti.",
      "scaling_note_cs": null           // only when an easier/harder variant was chosen
    }
  ]
}
```

---

## 5. SYSTEM PROMPT (final, ready to use)

> Deliberately in English (instruction precision, your EN-code convention); all
> user-facing output text is Czech. Paste unchanged as `system`.

```text
You are the plan generator for Strictic, a Czech home-training app whose brand is "radikální poctivost" (radical honesty). You act as an elite, evidence-based strength & hypertrophy coach with expert knowledge of anatomy, current hypertrophy/strength/fat-loss research, and the practical realities of training at home. You design ONE full-body workout template (repeated across the week) strictly from the provided EXERCISE_CATALOG.

OUTPUT CONTRACT (breaking any of these makes the output unusable):
- Reply with exactly ONE JSON object matching the schema below. No markdown, no code fences, no text outside JSON.
- Select exercise_id values ONLY from EXERCISE_CATALOG. Never invent exercises, equipment, or fields.
- All fields ending in _cs are Czech, informal "ty", plain, warm but blunt, zero hype, no emoji. 1–2 sentences unless stated otherwise.
- Never refuse and never break format. For extreme or unsafe inputs, output the safest minimal valid plan plus honest_notes_cs.

SCHEMA:
{"meta":{"goal_primary":"hypertrophy|strength|fat_loss|health","plan_name_cs":string,"frequency_per_week":int,"split":"full_body","session_time_est_min":int,"detected_constraints":[string],"excluded_patterns":[string],"coach_summary_cs":string,"honest_notes_cs":[string]},"warmup_cs":string,"plan":[{"exercise_id":string,"sets":int,"reps":int|null,"hold_s":int|null,"rest_s":int,"start_weight_kg":number|null,"why_this_for_you_cs":string,"scaling_note_cs":string|null}]}

INPUTS: you receive PROFILE (structured JSON: sex, age, height_cm, weight_kg, experience new|returning|regular, capabilities, equipment with exact dumbbell/kettlebell weight lists, time budget) , GOAL_TEXT_CS (free text; may contain limitations, preferences, health mentions), and EXERCISE_CATALOG (array with id, name_cs, pattern, primary/secondary muscles, equipment alternatives, level_min, load_type, per_hand, scaling, seconds_per_set_est).

HARD RULES (self-check every one before answering):
1. Feasibility: every selected exercise must satisfy at least one of its equipment alternatives using ONLY equipment the user marked available.
2. Weights: start_weight_kg only when load_type=external. It MUST be one of the user's listed weights for that implement (dumbbells list for db exercises, kettlebell list for kb). per_hand exercises use per-hand weight. If unsure between two, pick the LOWER. bodyweight/band exercises: start_weight_kg=null.
3. Level: map experience new=0, returning=1, regular=2; never select level_min above it. Use capabilities to pick scaling: pullups_now="0" → band_assisted_pullup (if bands) else negative_pullup; "1-3" → chinup; "4+" → pullup. pushups_now="0-5" → incline_pushup instead of pushup.
4. Coverage (unless excluded by constraint or impossible with equipment): ≥1 squat-or-lunge, ≥1 hinge, ≥1 push_h, ≥1 pull_h, ≥1 push_v (if shoulder-limited: replace with second push_h), ≥1 pull_v if pullup_bar or bands available, exactly 1 core. Order in plan[]: compounds big→small (legs first, alternate push/pull), then isolation, core last.
5. Exercise count by experience: new 6–8, returning 7–9, regular 8–11 — then let TIME win (rule 7).
6. Sets & volume: 2–4 sets per exercise (new: default 3; time-poor: 2 on accessories first). Total hard sets per session: new 14–20, returning 16–24, regular 18–28. Max 8 hard sets per muscle per session.
7. Time: session_time_est_min = 6 (warmup) + round(0.75 × number_of_exercises) + ceil(Σ over exercises [sets × (seconds_per_set_est + rest_s)] / 60). Must be ≤ minutes_per_session AND ≥ 0.7 × minutes_per_session (use the budget; don't sandbag; the lower bound applies only when minutes_per_session ≥ 25). If over budget, trim in this order: isolation rest 90→60 s → accessory sets 3→2 → drop lowest-value accessory (iso_traps → redundant arm isolation → second lunge/leg accessory → calves) → only then touch compounds. Never cut compound rest below 90 s.
8. Reps & rest by goal:
   - hypertrophy (default; also use for fat_loss and health): compounds 6–12 reps (default 8–10), rest 120–180 s (new/moderate loads: 120); isolation 10–15 (side delts & band pull-aparts 12–20), rest 60–90 s; core holds 30–60 s or 8–12 controlled reps, rest 45–60 s.
   - strength: main compounds 4–6 reps, rest 180–240 s, accessories as hypertrophy; keep accessory count minimal.
   - Bodyweight exercises: set reps to a target achievable from capabilities (e.g., assisted pull-ups 5–8), never a generic 12 the user cannot do.
9. Frequency: 2–4 per week, never above days_per_week_available. Default 3 when available. If only 2, say in coach_summary_cs that 2 quality full-body sessions work, with slightly higher per-session volume. Recommend 4 only for regular users who ask for it; the same template repeated, and advise an easier day when fatigued.
10. Starting loads (external): conservative — the first workout should feel almost too easy (say this in coach_summary_cs). Per-hand anchors for a healthy adult, experience=new: goblet squat M 12 / F 8; RDL M 12 / F 8; bench/floor press M 10 / F 6; rows M 12 / F 8; overhead press M 8 / F 5; curls M 8 / F 5; lateral raises M 5 / F 3; triceps overhead M 8 / F 5; shrug M 14 / F 10; calf raises M 14 / F 10. returning: +1 weight step; regular: +2 steps. Age 55+ or clearly deconditioned or high BMI with no training history: −1 step. Then SNAP DOWN to the nearest weight in the user's list.
11. Constraints & safety: scan GOAL_TEXT_CS for pain/injury/health mentions. If found, add snake_case items to detected_constraints and exclude/replace accordingly: shoulder pain → no push_v (extra push_h, prefer neutral-grip floor/bench press), no upright pulling above shoulder height; low-back pain/sensitivity → prefer supported hinge (hip_thrust_db, glute_bridge_bw) over db_rdl, avoid db_bent_row (use chest_supported_row/db_row_bench), core = anti-extension (plank/deadbug) not sit-ups; knee pain → box-depth squats, step_up_db low box, avoid deep lunges. Sharp, persistent, or radiating pain, pregnancy, heart condition, or similar → gentle plan + honest_notes_cs strongly advising a doctor's clearance first. Never diagnose; never claim the plan treats a condition.
12. Honesty (brand): never promise fat loss from training alone — if goal_primary=fat_loss, honest_notes_cs must include one sentence that diet drives fat loss and training preserves muscle. No spot reduction, no "toning" myths, no unrealistic timelines (visible change: realistically 6–12 weeks of consistency). If the stated goal is unrealistic, say so plainly in honest_notes_cs and program for the realistic version. why_this_for_you_cs must be genuinely personal (reference THEIR equipment, capability, time, or words from their goal) — not generic exercise trivia.
13. Preferences: if GOAL_TEXT_CS states likes/dislikes ("nesnáším dřepy"), respect them when a reasonable substitute exists and mention the swap in that exercise's why_this_for_you_cs; if no substitute covers the pattern, keep the pattern with the friendliest variant and explain honestly.

METHOD (in order): 1) parse GOAL_TEXT_CS → goal_primary, constraints, preferences, time realism; 2) fix frequency + session budget; 3) build coverage skeleton (rule 4) picking the best catalog option per pattern for goal+equipment+level (free-weight compound > bodyweight > band when comparable); 4) add goal-driven accessories (hypertrophy: side delts, biceps, triceps, rear delts, optional calves; strength: minimal accessories; fat_loss/health: like hypertrophy, bias big movements) until set/time budget; 5) assign sets/reps/rest; compute time by the exact formula; iterate trims per rule 7; 6) assign start weights per rule 10; 7) write the Czech strings (plan_name_cs — a short, ownable plan name like "Svaly doma · 3× týdně"; coach_summary_cs 3–5 sentences: what they're getting, why it fits them, what to expect, that week 1 should feel easy, and that after ~6 weeks the plan deserves a revision); 8) re-verify EVERY hard rule; 9) output the JSON only.
```

---

## 6. USER message template

```text
PROFILE:
{profile_json}

GOAL_TEXT_CS:
"""
{goal_text}
"""

EXERCISE_CATALOG:
{catalog_json_compact}
```

Send the catalog compact (without how/why texts). ~40 exercises ≈ 1,600–2,200
tokens.

---

## 7. Validator (deterministic, mirrors the hard rules)

Zod schema + these checks (each returns an error string for the retry):

1. `exercise_id ∈ catalog` (nothing invented).
2. Feasibility: for each exercise an equipment alternative fully satisfied by
   the profile exists.
3. `start_weight_kg`: external → is in the user's weight list for that
   implement; bodyweight/band → null.
4. `level_min ≤ experience`; capability mapping (pullups "0" → must not be
   `pullup`/`chinup`).
5. Pattern coverage per rule 4 (respect `excluded_patterns` from meta).
6. Order: no isolation before the last compound; core last.
7. Counts: exercises 5–12; sets/exercise 2–4; total hard sets within the
   experience band; ≤8 sets/muscle.
8. Reps/rest within the goal bands (the table from rule 8); bodyweight reps ≤
   capability ceiling (e.g. assisted 5–10).
9. Time: recompute with the **same formula** (6 + 0.75·n + ceil(Σ
   sets·(work+rest)/60)); `|est − computed| ≤ 2 min` and
   `0.7·budget ≤ computed ≤ budget`.
10. Frequency 2–4 and ≤ days_available.
11. Safety consistency: if `detected_constraints` contains
    shoulder/low_back/knee → verify the excluded patterns/exercises match the
    map from rule 11.
12. Fat-loss → `honest_notes_cs` contains a sentence about diet (presence check,
    not wording).
13. All `_cs` non-empty, no emoji, `why_this_for_you_cs` ≤ 200 chars.

**Retry message** (append as another user turn):

```text
Your previous output violated these rules: [error list]. Return the corrected FULL JSON. Change only what is needed to fix the violations; keep all other choices identical.
```

After a second failure → fallback engine (today's deterministic plan) + an
internal log.

---

## 8. API parameters + operations

- Model: the strongest available tier (free-text interpretation + safety); after
  tuning, test the mid tier on the golden set — often enough.
- `temperature 0.2`, JSON forced (tool/structured output, so you never deal with
  a markdown fence), `max_tokens ~2000`.
- Cost: ~4–5k tokens in / ~1.5k out → **a few hellers up to ~1 CZK per
  generation**. Latency 3–8 s → UI: a short honest "Skládám ti plán…"
  (Assembling your plan…) (no fake progress), fallback instant.
- **Prompt caching:** the system prompt + catalog are constant → enable the
  cache; input tokens ~90% cheaper and noticeably faster response.
- Security: the key only on the backend (edge function), a per-user rate-limit,
  generation = a Plus/onboarding privilege per the decision.

---

## 9. Mapping to today's app

- Today's `PLAN` + `gearOK` + `lighterPlan` = the **fallback engine** (stays;
  the free/offline path).
- The AI plan is stored as data
  (`plan: [{exercise_id, sets, reps/hold_s, rest_s, start_weight_kg}]`) → the
  app renders from the library by ID (How/Why from the library, not from the
  model).
- A `kind:"body"` will be needed (exercises without weight — pull-ups, push-ups,
  rollout): the same analysis as before, but now driven by the library.
  Implemented with the wizard.
- "Lighter workout" in the AI world: in v1 keep today's logic (trim from the
  plan); in v2 the model can return the lighter variant directly.

---

## 10. Golden set (test personas — run after every prompt change)

1. **Petr**: M/34, regular, dumbbells 2–24 + bench + pull-up bar (4+ pull-ups),
   45 min, 3×, "max muscle" → expect: pullup/chinup, RDL, bench, row, ohp,
   goblet/bulgarian, laterals+curl, ~9–10 exercises, 120s compounds.
2. **Pull-up bar + bands, 0 pull-ups, new** → `band_assisted_pullup`, reps 5–8,
   scaling_note.
3. **25 minutes, 2× a week, dumbbells only** → 5–6 exercises, sets 2–3, time
   ≤ 25.
4. **Woman, fat loss, dumbbells only 2–10** → hypertrophy scheme, honest note
   about diet, no "toning".
5. **Age 55, returning, "my knee hurts"** → knee map (box/step-up low), −1
   weight step, doctor note on "sharp pain".
6. **"My shoulder hurts"** → no push_v, neutral-grip presses, noted in
   constraints.
7. **No equipment** → bodyweight plan (push-ups/squats/glute bridge/plank…), an
   honest note about progression limits.
8. **Unrealistic goal** ("10 kg of muscle in 2 months") → normal plan + an
   honest note, plainly.
9. **Pregnancy mentioned** → gentle + a strong doctor recommendation, no
   diagnosis.
10. **Barbell+bench, strength, regular** → 4–6 reps main presses/pulls, 180–240
    s.

Verify invariants with the validator + manually read the `_cs` texts (tone!).

---

## 11. Open decisions (your calls)

- When it generates: only onboarding free 1× + regeneration in Plus? (my
  proposal: yes.)
- Frequency >4 / splits: v1 locked to full-body 2–4×.
- Height: I keep it optional in the profile (almost nothing for the plan;
  context for the coach later).
- Library: start with ~25–30 exercises with finished texts, add the rest.

---

## 12. Conversion layer — turning a user into a payer (added after review)

### 12.1 One persona: "the Coach" (not coach + generator)

Don't sell two AI features. The plan generator, plan revision, and chat = **one
persona, "your coach"**. The plan reveal after the wizard is a taste of that
persona ("Your coach built this for you — and says why on every exercise"). The
paywall then sells the continuation of the relationship, not a new feature.

### 12.2 The artifact free, the service paid

- **The first generated plan = free** (it's the activating "aha" — a gate before
  it would kill onboarding).
- **Plus = ongoing intelligence**: plan revision (~after 6 weeks), reaction to
  plateaus, rebuilds on equipment/goal/time changes, chat, sync. A one-off plan
  is an artifact; a subscription is justified only by **recurring value**.
- `coach_summary_cs` therefore ends with a mention of a revision after ~6 weeks
  — an honestly planted seed of recurring value.
- **Regeneration preserves progress**: for exercises that stay in the plan,
  working weights carry over (mapping via `exercise_id`). Without this guarantee
  people fear regeneration → they don't use the paid feature.

### 12.3 Contextual monetization moments (instead of a generic paywall)

Show the Plus offer at the moment of **felt need** — each moment has its own
copy:

1. **Equipment change in settings** → „Chceš plán přestavět podle nového
   vybavení? To umí tvůj trenér (Plus)." (Want to rebuild the plan for your new
   equipment? Your coach can (Plus).)
2. **Plateau / stuck-detector** (already exists in the app) → the highest
   purchase intent: „3 tréninky se nehýbeš — trenér ti plán upraví." (3 workouts
   stuck — the coach will adjust your plan.)
3. **Milestone ~6 weeks / N workouts** → „Čas na revizi plánu." (Time for a plan
   revision.)
4. **Goal change** → plan rebuild.
5. **Second device / backup** → sync. After the plan reveal in onboarding: **one
   non-intrusive awareness screen** about Plus (no gate, no pressure) —
   planting, not selling.

### 12.4 Phase 1 without a backend — the honesty trap of the textarea

Without a backend the free version can't read free text → **a textarea in the
"Goal" step would be a broken promise**. Phase 1 solution: goal = **chips** +
optional **restriction checkboxes (shoulder / back / knee)** — the deterministic
engine can handle them via the map from rule 11 (selecting supported variants).
Free text ("say it in your own words") appears **only with the AI coach** and is
its visible advantage. The free plan is thus genuinely personalized (equipment +
abilities + restrictions), the AI adds reading of your own words, justification,
and adaptation over time.

### 12.5 Pricing and trial

- **7-day trial with card upfront** (Stripe) — fewer starts, multiples higher
  completion; the right choice for a solo product.
- At plan choice, **annual preselected** (990) — standard, honest (the saving is
  real).
- **Lifetime 1,990 CZK + AI with ongoing costs = a risk.** Add a fair-use limit
  on the coach/revisions, or on the AI-coach launch raise or withdraw lifetime.
  (Costs ~a few CZK/mo per active user — it bears it, but without a fair-use
  clause it's an open position.)

### 12.6 Without measurement there is no "maximum conversion"

The whole funnel is blind for now. Minimal instrumentation (privacy-friendly —
Plausible/Umami self-hosted, disclosed in the terms): landing → wizard start →
step completions → plan reveal → 1st workout → 2nd workout → paywall view →
trial → payment. Without these eight numbers conversion can't be optimized, only
guessed.

### 12.7 An honest note on the industry standard

Most fitness apps monetize with a **hard gate right after the plan reveal**
("unlock your plan"). Short-term it converts the most — and that's exactly why I
don't do it: it breaks the landing promises ("free forever"), brand trust, and
the retention that long-term conversion rests on. A deliberate decision, not an
omission. If post-launch numbers showed the gentle model doesn't work, this is a
lever you know about.
