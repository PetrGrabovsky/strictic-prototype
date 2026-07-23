# strictic — overview

Next.js 16.2.10 (Turbopack) app, React 19.2.4, TypeScript, Tailwind 4, ESLint 10, `babel-plugin-react-compiler`. Vitest for unit tests (colocated `*.test.ts`).

Key deps: zod (validation), next-intl (i18n), class-variance-authority + clsx + tailwind-merge (styling via `cn`/`cva`).

## Current state

Client-only MVP: no backend yet. State persists to `localStorage` via `src/lib/storage.ts` (read through the `use-storage-snapshot` hook). No Server Actions and no `src/lib/env.ts` exist yet — the server-first rules in `CLAUDE.md` are the target for when a backend/secrets land, not the current reality. Single locale `cs` (next-intl wired for more).

## Structure

- `src/app/[locale]/` — localized App Router.
  - `(marketing)` route group: the landing page + its `_components/` (hero, sections, phone-mock, pricing, auth-modal-provider, ...), plus `opengraph-image.tsx`.
  - `(app)` route group: the app shell (`app/`) with screens `home` (`page.tsx` + `_components/home-screen`), `onboarding`, `trenink` (workout), `pokrok` (progress) — each screen has its own `error.tsx`.
- `src/features/` — feature-first domains (`components/`, `lib/`, `types.ts` per feature):
  - `onboarding/` — the deterministic plan engine. `lib/build-plan.ts` `buildPlan` + supporting pure fns (`selection`, `prescription`, `start-weight`, `time-budget`, `catalog`, `wizard`, `lighter-plan`) select from `src/data/exercises.ts` and return a `Plan` (`src/types/plan.ts`) — the same shape a future AI coach will return. `components/` holds the wizard + step UIs.
  - `workout/` — the training-session runner. `lib` (`session`, `finish`, `weights`), `hooks/use-workout-session`, and components (`workout-screen`, `set-input`, `rest-overlay`, `workout-summary`, ...).
  - `progress/` — the progress charts. `lib` (`derive`, `bucket-series`, `bar-scale`, `drill-down`, `format-bucket-date`, `share-canvas`) and components (`big-chart`, `hero-carousel`, `bucket-detail`, `exercise-progress-card`, `progress-screen`, ...). This is the most active area (journey chart, buckets, drill-down, share loop).
- `src/i18n/` — next-intl wiring (`routing.ts`, `request.ts`, `alternates.ts`). Navigate only via `@/i18n/routing` helpers.
- `src/lib/` — shared pure, React-free utilities (`cn`, `constants`, `format`, `storage`, `rem`, `brand`, `haptics`, `site-config`).
- `src/components/ui/` — reusable UI primitives (`button`, `card`, `logo`, `logo-mark`, `stepper`, `step-dots`, `status-screen`, `loading-screen`, `route-error`, `count-up`, `disc`, `icon-button`, `app-header`, `auth-modal`, ...).
- `src/hooks/`, `src/data/`, `src/types/` — client hooks, static data (`exercises.ts`), shared types (`plan`, `workout`, `profile`, `exercise`, `equipment`, `coach`).
- `messages/` — i18n JSON message catalogs (`cs.json`).
- alias `@/*` → `./src/*`
- `docs/reference/` — deeper context (architecture, design system, build guide, marketing, MVP, backlog, AI-coach spec, monetization, procedure). Start from `STRICTIC-BUILD-GUIDE.md`.

## Critical

`AGENTS.md` warns: this Next.js version has BREAKING CHANGES vs training data (APIs, conventions, file structure). Read `node_modules/next/dist/docs/` before writing Next.js code. Heed deprecation notices.
