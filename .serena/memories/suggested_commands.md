# Commands (Windows)

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — eslint (`eslint . --max-warnings 0`); `npm run lint:fix` to auto-fix
- `npm run format` — prettier --write .
- `npm run format:check` — prettier --check .
- `npm test` — vitest run (once); `npx vitest` to watch

## Tests

- Vitest for unit tests. Files colocated as `*.test.ts` next to source
  (e.g. `src/features/onboarding/lib/build-plan.test.ts`).
- `vitest.config.ts` mirrors the tsconfig `@/*` and `@/messages/*` aliases.

## Git/husky

- husky + commitlint installed (`prepare: husky`).
- `commit-msg` hook enforces commitlint.config.mjs rules.
- `pre-commit` hook runs `lint-staged` (eslint --fix + prettier on staged).
- `pre-push` hook runs `npm test` (blocks the push on a red test).

## Shell

System is Windows. Bash tool (Git Bash) available for POSIX-style commands; PowerShell also available.
