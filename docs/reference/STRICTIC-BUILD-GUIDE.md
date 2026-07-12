# Strictic — main build document (for Claude Code)

> **Purpose of this file:** This is the entry point for rewriting Strictic into
> a production Next.js app. Read it WHOLE first, then `STRICTIC-MVP.md` (scope
> guardrails), `strictic-blueprint.md`, `STRICTIC-ARCHITECTURE.md` (where things
> go) and `STRICTIC-PROCEDURE.md` (current step) — only then build. `CLAUDE.md`
> from the package belongs in the repo ROOT. The other files in this package are
> references — when to use which is described below.
>
> Note on language: the product UI is Czech (informal "ty"). Czech strings in
> quotes throughout these docs are actual product copy — keep them verbatim;
> they belong in `messages/cs.json`.

---

## 0. What Strictic is (in one sentence)

A home strength-training PWA in Czech for people with minimal equipment
(dumbbells, a bench, a pull-up bar). It builds a plan tailored to the available
equipment, guides the user set by set, enforces progressive overload, and shows
progress. Brand = **radical honesty** (no hype, no lies, direct wording).
Domain: **strictic.com**. UI language: Czech, informal address.

---

## 1. Files in this package and how to use them

| File                               | What it is                                                                                                                                               | How to use it while building                                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **STRICTIC-BUILD-GUIDE.md**        | this file                                                                                                                                                | entry point, read first                                                                                                                       |
| **strictic-app-reference.jsx**     | ⭐ REFERENCE IMPLEMENTATION of the app (~1250 lines, single file)                                                                                        | **source of truth for app behavior and looks.** Don't port blindly — read section 4.                                                          |
| **strictic-landing-demo.html**     | ⭐ REFERENCE IMPLEMENTATION of the landing page (complete, incl. the sign-in modal)                                                                      | source of truth for the landing. Static HTML → convert to Next.js components/SSG.                                                             |
| **strictic-blueprint.md**          | binding product/launch architecture (sign-in, payments, phases, funnel)                                                                                  | **read second.** Decides WHAT gets built and in what order. The sign-in flow is final here.                                                   |
| **STRICTIC-ARCHITECTURE.md**       | ⭐ target Next.js project structure (folders, feature modules, reference→code mapping)                                                                   | **read third.** Decides WHERE things go. Feature-based, 2026 best practices.                                                                  |
| **STRICTIC-MVP.md**                | ⭐ MVP scope — what to build and what deliberately NOT                                                                                                   | guardrails against scope creep; resolves the conflict with "Phase 1 without a backend" in the blueprint (MVP = login + Supabase from launch). |
| **STRICTIC-PROCEDURE.md**          | step-by-step execution with commands and "done when"                                                                                                     | stick to the current step.                                                                                                                    |
| **STRICTIC-PLAN.md**               | tick-box work plan (task by task, 8 stages)                                                                                                              | daily work management; rule: every session ≥1 box.                                                                                            |
| **STRICTIC-DESIGN-SYSTEM.md**      | ⭐ unified tokens (color/type/scales/shadows) + minimal component inventory, with old-value→token mapping tables                                         | binding when porting EVERY screen (Stage 3+5); local exceptions listed inside.                                                                |
| **STRICTIC-MARKETING.md**          | founder story + text for the "Who makes it" section, positioning ("the most out of the time you have"), SEO content plan, affiliate principles (Phase 3) | when porting the landing (Stage 3) and for all strings in cs.json; no hype — honest expectations are part of the brand.                       |
| **CLAUDE.md**                      | instructions for Claude Code                                                                                                                             | copy into the repo ROOT (not docs/).                                                                                                          |
| **strictic-ai-coach-spec.md**      | complete AI-coach spec (system prompt, JSON schema, validator, fallback)                                                                                 | Phase 2 only (backend + AI). Phase 1 doesn't need it.                                                                                         |
| **strictic-monetization-model.md** | monetization (freemium, annual subscription, Stripe web billing, fair-use)                                                                               | at the payment layer (Phase 2). Consistent with the blueprint.                                                                                |
| **strictic-backlog.md**            | log of done + ideas + deliberately deferred items                                                                                                        | context for "why something is the way it is". Not a task list — a decision history.                                                           |

⚠️ **On conflict = blueprint.md and this file win.** The references (`.jsx`,
`.html`) show the CURRENT state, the blueprint shows the TARGET state (e.g.
sign-in: `.jsx` has `LOCAL=true` with no login, the blueprint wants login-first
— build per the blueprint).

---

## 2. Target stack (decided, not up for re-discussion)

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**.
- **One repository, one project** — landing and app together. Shared design
  tokens and components.
- **Landing** = SSG/SSR (for SEO, see strictic-landing-demo.html — it has
  JSON-LD, meta, hreflang ready).
- **App** = client PWA (`app/(app)/…`), installable, offline-capable (service
  worker).
- **Font:** Inter via `next/font/google` (self-hosted, only weights
  400/500/600/700, landing +800 for the logo). Do NOT use a `<link>` to Google
  Fonts as in the references — that's only for the standalone preview.
- **Phase 2 backend:** Supabase (auth + Postgres), Stripe (payments). Details in
  blueprint §2.

---

## 3. Build order (TOP-DOWN, not bottom-up)

**Don't build a Storybook. Don't build components upfront.** Port whole screens;
extract components only on the SECOND use. At every moment the app must be
runnable, not half-built.

**Step 1 — Skeleton + design tokens.**

- Next.js project, TypeScript, Tailwind, `next/font` (Inter).
- Design tokens from the reference into `tailwind.config` (exact values —
  section 5 below). Verified AA contrasts, DO NOT CHANGE.
- Empty routes: `/` (landing), `/app` (app). Boot.

**Step 2 — Landing (`/`).**

- The simplest part, purely presentational, out first (it can start collecting
  interest).
- Source: `strictic-landing-demo.html` 1:1 → JSX components. Preserve SEO
  (JSON-LD, meta, OG, hreflang).
- Sign-in modal: preserve exactly (focus trap, scrollbar-width compensation via
  padding-right, `aria-disabled` instead of `disabled` on the loading state,
  Escape/click-outside). In production wire it to real auth (Phase 2).
- Session-aware CTA (blueprint §2.1 point 10): a signed-in user sees "Otevřít
  appku", not "Začít zdarma".

**Step 3 — App, screen by screen** (from `strictic-app-reference.jsx`):

1. **Onboarding/wizard** (equipment, body, experience, goal) → deterministic
   plan engine (no AI in Phase 1).
2. **Home** (today's workout, CTA "Jdu cvičit", navigation).
3. **Workout** (sets, rests, rest-flow, data integrity on skip — section 4 =
   what NOT to break).
4. **Progress** (per-exercise hero carousel, volume chart, shareable images).
5. **Settings** (equipment editor, reset, mute).

**Step 4 — PWA layer.** manifest, service worker (cache-first shell), install,
offline.

**Step 5 (Phase 2) — Backend.** Supabase auth (login-first per the blueprint) →
Postgres (schema from the storage keys, section 5) → Stripe (monetization model)
→ AI coach (spec). Only now `LOCAL=false`.

---

## 4. What NOT to break during the port (tuned subtleties that aren't obvious at first glance)

The reference looks simple but contains a lot of hard-tuned things. These are
the easiest to lose — watch them:

- **Rest-flow:** the last set of an exercise goes straight to the summary (not
  into an empty rest); during a rest the prep for the next set is shown
  (weight/exercise). It is not "set → always a rest".
- **Data integrity on skipping an exercise:** when the user skips an exercise,
  completed sets STILL count; "Ukončit a uložit, co mám" saves what was actually
  done, not zeros.
- **Progress — carousel:** scroll IS the source of truth (not a React state
  driving scroll — that caused a loop). State only reflects position for the
  dots. Arrows/keys call native `scrollTo`. Swipe on mobile, scroll on PC.
- **Charts (`BigChart`):** fixed bar width (not stretched to 100%), a label on
  EVERY bar (inside when height ≥30px, otherwise above it), text color inside
  per background (**white FAILS on orange — must be dark, contrast 3.3 vs the
  required 4.5; on dark, white**), horizontal scroll on overflow, tonnes from
  1000 kg ("5.4 t").
- **Contrasts:** all colors in `L` have computed WCAG AA. `accentDeep #C13A12`
  is a darker orange for text on light (plain `accent` fails as small text).
  `lineField #8B8B85` = 3:1 for input borders. DO NOT CHANGE without
  recomputing.
- **Tabular figures:** everywhere there are numbers (weights, timer, sets) there
  is `font-variant-numeric: tabular-nums` (`tnum`/`...TN` in the ref). Inter
  supports it — without it numbers jitter.
- **`fmtDur`** (1 h 34 min), **`fmt`** (hourly timer rollover), **wake lock**
  during the workout, **haptics** even under mute.
- **ErrorBoundary** around the app.

**Safety net:** the reference has a set of jsdom probes (probe2–6) verifying
these flows. They are not in this package as files, but THEIR LOGIC is a
behavior spec — after porting a screen, write an equivalent test
(Playwright/RTL) verifying: setup presets, rest-flow, a11y, progress
(start-state + chart labels). If it passes, the port of that screen didn't
silently break something.

---

## 5. Concrete values to take over

**Design tokens (→ `tailwind.config.ts`, exactly):**

```
bg:#F4F4F2  surface:#FFFFFF  line:#ECECEA  line2:#E0E0DD  lineField:#8B8B85
ink:#0A0A0A  ink2:#6E6E6B  ink3:#67675F
accent:#FF4D1C  accentDeep:#C13A12  cream:#F8EFE7  green:#3E9457
```

Button radius 14px. Logo = bare mark in `currentColor` (see `Logo` in the ref),
orange only on actions + the dot after "strictic.".

**Data model (from the reference storage keys → TypeScript types and later
Postgres tables):**

- `equip` (EKEY):
  `{ weights:number[], muted:boolean, goal:string, gear:{db,bench,pullup,bar,kb,wheel,bands:boolean} }`
- `history` (HKEY): `WorkoutRecord[]` =
  `{ date:number, dur:number, volume:number, ex:{ [id]:{ w:number, r:number, e1:number } } }`
- `progress` (PKEY), `session` (SKEY), `coach` (CKEY) — see reference.
- In Next.js: local state (Phase 1) → Supabase rows at `user_id` (Phase 2). `e1`
  = 1RM estimate (keep it, but silent in the UI).

**Sign-in (blueprint §2.1 — FINAL, not up for debate):** login-first, one path.
Landing "Začít zdarma" → sign-in (Google One Tap / Apple / email magic link) →
the app detects new/returning → new to the wizard, returning home. Persistent
session. No anonymous accounts, no passwords, no Facebook/Microsoft.

---

## 6. Principles for Claude Code while building

1. **Top-down, functional at every commit.** Never a week of half-built code.
2. **Extract components from the SECOND use, don't create them upfront.** Types
   from real data, not from invention.
3. **Phase 1 without a backend** (local state, deterministic engine, no AI) →
   deploy → measure → only then Phase 2.
4. **Don't change tuned values** (contrasts, tokens, rest-flow) without an
   explicit reason. The reference has it thought through.
5. **The goal is "deployable to strictic.com", not "architecturally perfect".**
   When choosing between cleanliness and shipping, ask: does this bring the app
   closer to real users? If not, defer it to the backlog.
6. On ambiguity, read in order: this file → blueprint → specific reference.
   Conflicts are resolved by the blueprint.
