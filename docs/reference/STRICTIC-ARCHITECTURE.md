# Strictic — Next.js project architecture (final, v2)

> Target structure for the rewrite. Next.js 15/16 App Router best practices
> (2026), adapted to Strictic (8 app screens + landing + future AI/payments) and
> prepared for multilingual + RTL FROM THE START. Principle: **feature-based,
> not type-based.** Code is grouped by WHAT it does, not what it IS.
>
> Note: `/cs/...` route slugs (trenink, pokrok, nastaveni, ochrana-soukromi,
> podminky) are real Czech URLs — keep them verbatim.

---

## 0. Guiding principles

1. **Feature-first.** A domain = a folder (`features/workout/`). Not a dumping
   ground in `/components`.
2. **Server Components by default, `"use client"` only at interactive leaves.**
   The landing is ~fully server, the app is largely client — the boundary is
   explicit.
3. **Route groups separate two worlds:** `(marketing)` = landing (SSG, SEO),
   `(app)` = app (client, PWA, auth).
4. **i18n and RTL are structural, not an afterthought.** `[locale]` segment,
   strings in JSON, logical CSS properties from line one. The MVP has only `cs`
   — but the structure admits a new language as a new JSON file.
5. **Business logic = pure functions in `lib/`,** testable without React. Server
   Actions are only a thin layer.
6. **Simplicity now, extensibility through structure.** No monorepo, no
   state-management lib upfront, no UI kit.

---

## 1. Tree structure

```
strictic/
├── CLAUDE.md                         # instructions for Claude Code (copy from the package)
├── docs/reference/                   # this reference package
├── messages/
│   └── cs.json                       # ALL UI strings (MVP Czech only; en.json/ar.json = future)
├── src/
│   ├── i18n/
│   │   ├── routing.ts                # locales, defaultLocale, createNavigation (Link/useRouter FROM HERE!)
│   │   └── request.ts                # server-side messages loading
│   ├── middleware.ts                 # next-intl locale detection; (Phase 2) + auth gate on /app
│   │
│   ├── app/
│   │   ├── globals.css               # Tailwind v4: @import "tailwindcss" + @theme with design tokens
│   │   ├── [locale]/                 # ⭐ the whole site lives under the locale segment
│   │   │   ├── layout.tsx            # <html lang={locale} dir={rtl?'rtl':'ltr'}>, fonts, providers
│   │   │   ├── (marketing)/
│   │   │   │   ├── layout.tsx        # nav + footer, session-aware CTA
│   │   │   │   ├── page.tsx          # / (landing)
│   │   │   │   ├── ochrana-soukromi/page.tsx
│   │   │   │   └── podminky/page.tsx
│   │   │   └── (app)/
│   │   │       ├── layout.tsx        # app shell (max-width, auth guard Phase 2, providers)
│   │   │       ├── app/page.tsx      # /app → redirect per state (onboarding/home)
│   │   │       ├── app/trenink/page.tsx
│   │   │       ├── app/pokrok/page.tsx
│   │   │       ├── app/nastaveni/page.tsx
│   │   │       └── app/onboarding/page.tsx
│   │   ├── api/                      # (Phase 2) coach/, plan/, webhooks/stripe/
│   │   ├── manifest.ts  sitemap.ts  robots.ts  opengraph-image.tsx
│   │
│   ├── features/
│   │   ├── onboarding/  components/ lib/ types.ts     # wizard + deterministic engine (buildPlan)
│   │   ├── workout/     components/ lib/ types.ts     # rest-flow, isExerciseDone, completeOrRest
│   │   ├── progress/    components/ lib/ types.ts     # BigChart, HeroCarousel, share canvas, deltas
│   │   ├── auth/                                      # (Phase 2) login, session hooks
│   │   ├── billing/                                   # (Phase 2) paywall, Stripe
│   │   └── coach/                                     # (Phase 2) AI chat
│   │
│   ├── data/
│   │   └── exercises.ts              # ⭐ EXERCISE CATALOG — versioned file in git (see §4)
│   │
│   ├── components/ui/                # shared primitives: Logo, Wordmark, Button, Stepper, Stat,
│   │                                 # StepDots, Disc, CountUp, AuthModal (focus trap, scrollbar comp.)
│   ├── lib/
│   │   ├── format.ts                 # fmtKg, fmtDur, fmtVol, relDate, dShort (via the next-intl formatter!)
│   │   ├── storage.ts                # ⭐ storage abstraction: localStorage (dev) ⇄ Supabase (launch)
│   │   ├── constants.ts              # keys, limits
│   │   ├── env.ts                    # zod validation of process.env at startup
│   │   └── supabase/                 # (from step 5) client.ts, server.ts
│   ├── db/                           # (from step 5) drizzle schema.ts + migrations/
│   ├── styles/tokens.ts              # JS mirror of tokens (for the share-image canvas)
│   ├── hooks/                        # useWakeLock, useAudio, useHaptics
│   └── types/                        # WorkoutRecord, Equipment, Gear…
├── public/                           # PWA icons, favicons, OG fallback
├── tests/                            # Playwright e2e (ports of jsdom probes) + Vitest unit
└── drizzle.config.ts                 # (from step 5)
```

---

## 2. Technology stack (final)

| Area               | Choice                                                                   | Why                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Framework          | **Next.js 15+ (App Router), React 19, TS 5**                             | standard                                                                                                                |
| Styling            | **Tailwind CSS v4**                                                      | tokens via `@theme` in `globals.css` (v4 no longer has tailwind.config.ts). JS mirror in `styles/tokens.ts` for canvas. |
| i18n               | **next-intl**                                                            | built for App Router, RSC support, ~2 KB, strings in `messages/*.json`, number/date formatting per language             |
| Validation         | **zod** (+ `react-hook-form` + `@hookform/resolvers` on the wizard)      | inputs, API bodies, env — types inferred, not written twice                                                             |
| State              | **no library** (React state + URL); `zustand` ONLY when genuinely needed | the app doesn't need it; don't introduce it upfront                                                                     |
| DB                 | **Supabase (Postgres) + Drizzle ORM**                                    | TS-first, lightweight, SQL-close; migrations in git from the first table                                                |
| Auth               | **Supabase Auth via `@supabase/ssr`**                                    | Google/Apple/magic link, persistent session, cookies for RSC/middleware                                                 |
| Payments (Phase 2) | **Stripe** + Stripe Tax                                                  | web billing ~3% vs 15–30% stores                                                                                        |
| AI (Phase 2)       | **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`)                           | streaming coach via a route handler                                                                                     |
| Analytics          | **Plausible** (or Umami)                                                 | cookieless → no cookie banner; funnel events per the blueprint                                                          |
| Tests              | **Vitest** (engine, format) + **Playwright** (e2e probe ports)           |                                                                                                                         |
| Icons              | **lucide-react**                                                         | the reference already uses them                                                                                         |

---

## 3. i18n + RTL — binding conventions (from line one)

1. **No hardcoded text in a component.** Everything via `t('key')` from
   `messages/cs.json`. This applies to exercise names too (the catalog carries
   i18n keys).
2. **Navigation EXCLUSIVELY from `src/i18n/routing.ts`** (`createNavigation`) —
   `Link`/`useRouter` from `next/navigation` are NOT locale-aware and break
   prefixes.
3. **`setRequestLocale(locale)` in every page/layout** + `generateStaticParams`
   with locales — otherwise static rendering silently degrades to dynamic (a
   quiet build regression).
4. **RTL: logical CSS properties only.** Tailwind: `ms-*/me-*` (not `ml/mr`),
   `ps-*/pe-*` (not `pl/pr`), `start-*/end-*` (not `left/right`),
   `text-start/text-end`. `<html dir>` is set from the locale (ar/he/fa/ur →
   rtl) in the root layout. Keep this and Arabic later "just works".
5. **Numbers and dates via the next-intl formatter** (not manual
   `toLocaleString("cs")`) — cs "5,4 t" vs en "5.4 t" for free.
   `fmtKg/fmtVol/fmtDur` in `lib/format.ts` are rewritten on top of
   `useFormatter`/`getFormatter`.
6. URL strategy: **prefix always** (`/cs/...`), decided — cleanest for
   SEO/hreflang, no exceptions.

---

## 4. Exercise catalog (decided)

- **MVP: a versioned file `src/data/exercises.ts`** (not a DB table). Reference
  data that changes only with a release belongs in git: history for free, zero
  queries, offline, one source of truth with the AI spec (`EXERCISE_CATALOG`,
  ~44 exercises, already exists in `strictic-ai-coach-spec.md`).
- **Record structure (the same now in the file and later in a table):** `id`,
  `nameKey` (i18n key!), `equipment` (db/bench/pullup/bar/kb/wheel/bands),
  `muscleGroup`, `pattern` (push/pull/squat/hinge/core), `difficulty`, `scaling`
  (easier/harder id). The deterministic engine and future AI only SELECT from
  it.
- It moves to a DB table once exercises need changing without a deploy
  (admin/custom exercises) — a data move, not a rewrite.

## 5. User data (in the DB from step 5)

Tables from the existing storage keys: `profiles` (user, goal, gear, weights[],
muted), `workouts` (user_id, date, dur, volume), `workout_exercises`
(workout_id, exercise_id, w, r, e1). RLS per user. `lib/storage.ts` is the only
place data flows through — dev on localStorage, launch switches the
implementation to Supabase, components don't change.

---

## 6. Reference → new structure mapping

| In the reference (`strictic-app-reference.jsx`) | Where                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `phase` state machine                           | URL routes under `[locale]/(app)/app/*`                           |
| `L` colors                                      | `globals.css @theme` + `styles/tokens.ts` (canvas)                |
| `F` fonts                                       | `next/font` (Inter 400–800) in `[locale]/layout.tsx`              |
| Czech strings in JSX                            | `messages/cs.json` (extract while porting each screen)            |
| `BigChart`, carousel, share canvas              | `features/progress/`                                              |
| rest-flow logic                                 | `features/workout/lib/`                                           |
| `gen`, `lighterPlan`, engine                    | `features/onboarding/lib/` + catalog from `src/data/exercises.ts` |
| `Logo`…`CountUp`, AuthModal                     | `components/ui/`                                                  |
| wake lock, audio, haptics                       | `hooks/`                                                          |
| `fmtKg`/`fmtDur`/`fmtVol`                       | `lib/format.ts` (on top of the next-intl formatter)               |
| storage load/save + keys                        | `lib/storage.ts` + `lib/constants.ts`                             |
| `LOCAL=true` coach                              | gone (MVP has no coach; Phase 2 = `api/coach`)                    |
| landing HTML                                    | `[locale]/(marketing)/page.tsx`                                   |

## 7. Execution order

See **STRICTIC-PROCEDURE.md** (exact steps with commands). Scope guardrails see
**STRICTIC-MVP.md**. What not to break during the port:
**STRICTIC-BUILD-GUIDE.md §4**.
