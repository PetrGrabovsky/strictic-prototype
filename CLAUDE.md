# Project Context

Strictly follow `AGENTS.md` before writing code — breaking changes in this
Next.js version.

## Stack

Next.js 16.2.10 (Turbopack), React 19.2.4, TS, Tailwind 4, ESLint 10,
`babel-plugin-react-compiler`, Vitest (unit tests, colocated `*.test.ts`).

Key deps (reuse before adding a package): zod (validation, incl.
`env.ts`), next-intl (i18n + `@/i18n/routing`), class-variance-authority

- clsx + tailwind-merge (styling via `cn`/`cva`).

## Structure

- `src/app/` — App Router
- `src/lib/` — shared utilities (pure, React-free)
- `src/features/` — feature-first domains (`components/`, `lib/`,
  `types.ts` per feature): `onboarding` (the plan engine), `workout`
  (the session runner), `progress` (the progress charts)
- alias `@/*` → `./src/*`

Deeper context (architecture rationale, design tokens, build plan) lives in
`docs/reference/` — start from `docs/reference/STRICTIC-BUILD-GUIDE.md`, which
indexes the rest. This file stays the short operational contract.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — eslint
- `npm run format` — prettier --write .
- `npm run format:check` — prettier --check .
- `npm test` — vitest (run once); `npx vitest` to watch

## Linting is the source of truth

The layered ESLint config in `eslint/` mechanically enforces the code
rules — don't restate individual lint rules in this file; a prose copy
just drifts out of sync with the config. Run `npm run lint` (or
`lint:fix`) and `npm run format` before treating any task as done; a
`Stop` hook also runs `npm run lint` and blocks on failure. When a
change touches logic with tests, run `npm test` too — a `pre-push` hook
runs the suite and blocks the push on a red test. This file carries only
what the linter can't check: architecture, framework patterns, and the
intent behind a choice.

## Architecture

- Server Components by default; add `'use client'` only at interactive
  leaves, as deep in the tree as possible.
- Fetch data on the server by default; mutate via Server Actions;
  refresh with `revalidatePath`/`revalidateTag`.
- Business logic lives in pure, React-free functions (`src/lib/`,
  feature `lib/` folders) — testable without a framework. Components
  and Server Actions stay thin: call logic, render/return results.
- Every mutation validates its input and checks authorization on the
  server — client-side validation is UX only, and a hidden button is
  not access control.
- Secrets never reach the client: only `NEXT_PUBLIC_*` env vars may
  enter the browser bundle. Everything else stays server-only.
- `process.env` is read in exactly one place — `src/lib/env.ts`, which
  validates it (zod) and re-exports a typed object. Import env from
  there; never touch `process.env` elsewhere (lint enforces this).
- Current state: the app is client-only, persisting to `localStorage`
  via `src/lib/storage.ts`; no Server Actions and no `src/lib/env.ts`
  exist yet. The server-first rules above are the target for when a
  backend/secrets land — apply them the moment server code appears.
- Prefer React/Next.js built-ins over custom code (`useOptimistic`,
  `useActionState`, `cache`, `next/image`, `next/font`) — newest stable
  API, not the oldest that still works.
- Handle states via route conventions: `error.tsx`, `not-found.tsx`,
  `loading.tsx`/`Suspense`. Never swallow errors in silent `catch`.
- Every screen designs all four states: loading, empty, error,
  success. The empty state is a first impression, not an edge case.
- React Compiler is on: no hand-written `useMemo`/`useCallback`/`memo`;
  write plain code following the Rules of React (pure render, immutable
  state/props updates).
- Minimize `useEffect`: derive values during render; effects only for
  syncing with external systems.
- No barrel files (`index.ts` re-exporting a folder) — they slow down
  Turbopack's module resolution/Fast Refresh. Import directly from the
  source file (`@/lib/cn`, not `@/lib`).
- i18n-ready from day one: no hardcoded user-facing text in JSX. Every
  string is a key (`t('key')`) resolved via next-intl from a JSON
  messages file (`messages/`).
- i18n navigation goes through `@/i18n/routing` (its `Link`, `redirect`,
  `usePathname`, `useRouter`) — never raw `next/link` or
  `next/navigation`, which silently drop the locale prefix from the URL.
- RTL-ready from day one: logical CSS properties only. Use
  `ms-*/me-*/ps-*/pe-*/start-*/end-*/text-start/text-end`; never
  `ml/mr/pl/pr/left/right/text-left/text-right`. Layouts must mirror
  automatically once a right-to-left locale (e.g. Arabic) lands.

## Accessibility & SEO

- WCAG 2.2 AA is the floor, not a target — every screen. AAA where
  achievable without breaking the design tokens (contrast, motion).
- Semantic HTML first; ARIA roles/labels only to fill gaps semantic
  HTML can't express. Full keyboard navigation, visible focus states.
- Mobile-first: the phone screen is the default target; desktop is
  the adaptation.
- Tap targets ≥44×44px on mobile (Apple HIG / WCAG 2.5.5).
- Color contrast verified against the actual tokens (4.5:1 text, 3:1
  large text/UI components) — never eyeballed.
- Respect `prefers-reduced-motion`: every animation/transition has a
  reduced or disabled variant behind the media query.
- SEO: Next.js Metadata API per route, one `h1` per page, correct
  heading order, `next/image` with real `alt` text, `sitemap.ts` +
  `robots.ts`.
- Core Web Vitals are a hard requirement, not an afterthought: no
  layout shift (sized images/fonts via `next/image`/`next/font`), no
  unnecessary render-blocking client JS.

## Code Quality

- No duplication: before writing new code, check if something reusable
  exists; extract repeated patterns into shared functions/hooks.
- Same principle for dependencies: before adding a package, check if
  Next.js, React, or an existing dependency covers it.
- No dead code: delete unused exports/variables/commented-out code —
  don't keep it "just in case." Git history is the safety net.
- No magic numbers/strings: name them as constants (module-level or a
  shared constants file) so the value's meaning and reuse are obvious.
- Functional style — no classes unless truly unavoidable (e.g. a
  required `Error` subclass).
- Small, focused components and functions; split when they grow.
- Arrow functions only — no `function` declarations, anywhere.
- Styling: `cn()` (`src/lib/cn.ts`) merges classes and resolves
  Tailwind conflicts; reach for `cva()` only once a component has real
  variants (2+ dimensions) — not for one-off elements.
- `className` over 80 chars: wrap in `cn(...)`, one string arg per
  line, grouped by concern (layout, spacing, color, state/responsive)
  — never split mid-group just to hit the limit.
- Named exports, except Next.js special files (`page.tsx`,
  `layout.tsx`, ...) that require a default export: declare as
  `const X = () => {}`, then `export default X` at the file's end.

## Code Style

- English only — code, comments, commit messages, docs.
- File names: kebab-case (`auth-modal.tsx`) wherever possible, never
  PascalCase/camelCase — avoids OS case-sensitivity clashes. The
  component inside stays PascalCase (`AuthModal`).
- Optimize for the human reader: every name — components, props,
  types, functions, variables — is precise and self-explanatory, no
  cryptic abbreviations.
- Comments explain _why_, not _what_; self-explanatory code makes
  most comments unnecessary.
- Any documented declaration — exported _or_ local `const`/`function`/
  `type` — uses JSDoc, never a `//` block (`/**` alone, lines start
  with a space then `*`, `*/` alone): JSDoc shows on hover at every
  reference site, a `//` block shows nowhere. Plain `//` stays fine for
  inline notes that annotate a line, not a symbol.
- TypeScript: always `type`; never `enum`/`interface`; no `any`, no
  `as` assertions (`as const` is fine), no unsafe-typing shortcuts.
- Type precisely: `satisfies`, generics, discriminated unions where
  they add safety or clarity.
- Component props: named `type Props` declared above the component,
  never typed inline in the function signature.
- Import types explicitly (`import type { ReactNode } from 'react'`);
  never reach for the global `React.X` namespace.

## Formatting

Prettier sets `printWidth: 80` but skips comments/strings/prose. Enforce
max 80 chars/line everywhere yourself — code, comments, `.md` files.
Exception: unbreakable atomic tokens (URLs, paths) — let those run long.

## Commits

Per `commitlint.config.mjs`: `type(scope?): subject`, all lowercase,
imperative, no trailing dot. Scope optional; omit only for project-wide
changes. Keep commits small; each one leaves the app in a working,
buildable state — never a broken intermediate step.
