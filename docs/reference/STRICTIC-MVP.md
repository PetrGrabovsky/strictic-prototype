# Strictic — MVP scope (binding guardrails)

> Purpose: to keep launch from slipping half a year out. This document states
> what the MVP IS and what it deliberately IS NOT. Claude Code: when a task aims
> outside the MVP scope, decline it / log it to the backlog — do not build it.

---

## 1. Relationship to the blueprint (resolves a conflict, read carefully)

`strictic-blueprint.md` defines a "Phase 1 without a backend" (a purely local
PWA with no accounts). That decision **predates the final login-first
architecture** (blueprint §2.1, 3rd revision) and is incompatible with it — an
app where signing in is ALWAYS the first step cannot run publicly without an
auth backend.

**What holds:** the MVP for public launch = sign-in (Supabase Auth) +
server-side data storage FROM THE START. "Without a backend" survives only as a
**development order** (screens are built first against a localStorage adapter in
`lib/storage.ts`; Supabase is connected before launch — see
STRICTIC-PROCEDURE.md step 5). Everything else from the blueprint (go/kill
metrics, funnel, deterministic engine, payments only after validation) holds
unchanged.

---

## 2. The MVP CONTAINS (and nothing more)

1. **Landing** (done in the reference) + legal pages (privacy, terms).
2. **Login-first sign-in**: Google One Tap / Apple / email magic link.
   Persistent session. (blueprint §2.1)
3. **Onboarding wizard** (equipment, body, experience, goal) → **deterministic
   plan** from the exercise catalog. No AI.
4. **Workout** — set guidance, rest flow, weight progression (tuned in the
   reference, do not break it — BUILD-GUIDE §4).
5. **Progress** — per-exercise carousel, charts with labels, shareable images.
6. **Settings** — equipment editor, reset, mute.
7. **Server persistence** — data survives reinstall, works across devices
   (Supabase + Drizzle, RLS).
8. **PWA** — installable, offline shell.
9. **Czech only** — but ALL strings in `messages/cs.json` from day one (i18n
   structurally complete).
10. **Analytics (Plausible)** with funnel events: `landing_cta`, `auth_started`,
    `auth_done`, `wizard_started`, `wizard_done`, `plan_revealed`,
    `workout_started`, `workout_finished`. Without them go/kill does not work.

## 3. The MVP DOES NOT CONTAIN (deliberately, not up for debate during the build)

- ❌ **AI coach** — Phase 2. The deterministic engine covers ~90% of the
  personalization value at zero running cost.
- ❌ **Payments/Stripe** — there is nothing to charge for without the AI;
  returning users must exist first.
- ❌ **Additional languages, Arabic/RTL content** — the structure is prepared
  (see §4), the content is not.
- ❌ **Custom admin dashboard for metrics** — Supabase console (users) +
  Plausible (behavior) + later Stripe (payers). Three third-party dashboards >
  weeks of custom work.
- ❌ Custom exercises, social features, notifications, gamification.

## 4. "Prepare structurally" vs. "build" (the core of the whole strategy)

| Thing            | Built in MVP? | Prepared HOW (cheaply, now)                                                                       |
| ---------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| Multilingual     | `cs` only     | `[locale]` segment, `messages/cs.json`, next-intl → a new language = a new JSON                   |
| RTL (Arabic)     | no            | **logical CSS properties from line 1** (`ms/me/ps/pe/start/end`) → mirrors automatically          |
| AI coach         | no            | the engine = a pure function returning a plan; the AI later returns the SAME format (spec §JSON)  |
| Payments         | no            | empty `features/billing/`; the data model accounts for entitlements                               |
| Exercise catalog | yes, full     | structured data (ARCHITECTURE §4), `nameKey` i18n, fields for the AI → later just moved to the DB |
| Payer metrics    | no            | the Stripe dashboard gives it for free once payments exist                                        |

**Rule:** readiness = structure + data models. NOT finished features for zero
users.

## 5. Definition of a done MVP (launch checklist)

- [ ] Runs on `strictic.com` (Vercel, custom domain, HTTPS)
- [ ] The whole flow passes: landing → sign-in → wizard → plan → 1st workout →
      progress, on mobile
- [ ] Data survives a PWA reinstall and works on a 2nd device (same account)
- [ ] Playwright tests green (port the probes: rest-flow, progress start-state +
      labels, a11y, presets)
- [ ] Funnel events measured (verified live in Plausible)
- [ ] Legal pages exist, no cookie banner needed (Plausible is cookieless)
- [ ] **10–20 real people with dumbbells at home use it** → go/kill from the
      blueprint is measured: wizard >70%, 1st workout >40%, return within 7
      days >30% (kill <15%)

After the MVP, NOTHING is added until the numbers say people come back. Then
Phase 2: Stripe + AI coach (the spec is done).
