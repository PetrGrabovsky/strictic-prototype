# strictic — overview

Next.js 16.2.10 (Turbopack) app, React 19.2.4, TypeScript, Tailwind 4, ESLint 10, `babel-plugin-react-compiler`. No test framework yet.

Key deps: zod (validation), next-intl (i18n), class-variance-authority + clsx + tailwind-merge (styling via `cn`/`cva`).

## Structure

- `src/app/[locale]/` — localized App Router; `(marketing)` route group holds the landing page + its `_components/`.
- `src/i18n/` — next-intl wiring (`routing.ts`, `request.ts`, `alternates.ts`).
- `src/lib/` — shared pure, React-free utilities (`cn`, `constants`, `format`, `storage`).
- `src/components/ui/` — reusable UI primitives (button, logo, stat, stepper, ...).
- `src/hooks/`, `src/data/`, `src/types/` — client hooks, static data, shared types.
- `messages/` — i18n JSON message catalogs (e.g. `cs.json`).
- alias `@/*` → `./src/*`
- `docs/reference/` — deeper context (architecture, design system, build guide, marketing, MVP, backlog). Start from `STRICTIC-BUILD-GUIDE.md`.

## Critical

`AGENTS.md` warns: this Next.js version has BREAKING CHANGES vs training data (APIs, conventions, file structure). Read `node_modules/next/dist/docs/` before writing Next.js code. Heed deprecation notices.
