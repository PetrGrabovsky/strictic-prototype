# strictic — overview

Next.js 16.2.10 (Turbopack) app, React 19.2.4, TypeScript, Tailwind 4, ESLint 10, `babel-plugin-react-compiler`. Vitest for unit tests (colocated `*.test.ts`).

Key deps: zod (validation), next-intl (i18n), class-variance-authority + clsx + tailwind-merge (styling via `cn`/`cva`).

## Structure

- `src/app/[locale]/` — localized App Router; `(marketing)` route group holds the landing page + its `_components/`, `(app)` holds the app shell.
- `src/i18n/` — next-intl wiring (`routing.ts`, `request.ts`, `alternates.ts`).
- `src/lib/` — shared pure, React-free utilities (`cn`, `constants`, `format`, `storage`).
- `src/features/` — feature-first domains (`components/`, `lib/`, `types.ts` per feature). `onboarding/lib/` holds the deterministic plan engine (`build-plan.ts` `buildPlan`, `lighter-plan.ts`) — pure functions that select from `src/data/exercises.ts` and return a `Plan` (`src/types/plan.ts`), the same shape a future AI coach will return.
- `src/components/ui/` — reusable UI primitives (button, logo, stat, stepper, ...).
- `src/hooks/`, `src/data/`, `src/types/` — client hooks, static data, shared types.
- `messages/` — i18n JSON message catalogs (e.g. `cs.json`).
- alias `@/*` → `./src/*`
- `docs/reference/` — deeper context (architecture, design system, build guide, marketing, MVP, backlog). Start from `STRICTIC-BUILD-GUIDE.md`.

## Critical

`AGENTS.md` warns: this Next.js version has BREAKING CHANGES vs training data (APIs, conventions, file structure). Read `node_modules/next/dist/docs/` before writing Next.js code. Heed deprecation notices.
