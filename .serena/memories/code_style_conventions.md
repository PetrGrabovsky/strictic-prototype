# Code style & conventions

- TypeScript, Next.js App Router conventions.
- Formatting via Prettier (plugins: prettier-plugin-tailwindcss, prettier-plugin-packagejson) — run `npm run format`.
- Linting via ESLint 10 flat config (`eslint.config.mjs`), composed from
  11 named layers in `eslint/` (each a `block()` for `--inspect-config`
  debuggability), in order: `bootstrap` (ignores + TS parser/
  projectService) → `core` (`@eslint/js` recommended + additions) →
  `unicorn` (`flat/recommended`, `unicorn/*` filtered) → `typescript`
  (`typescript-eslint` recommendedTypeChecked + stylisticTypeChecked) →
  `sonar` (`eslint-plugin-sonarjs`, hand-picked dataflow/bug rules, not
  `recommended`) → `imports` (`eslint-plugin-import-x`) → `perfectionist`
  (import/export/type/JSX-prop sorting, natural order) → `react`
  (`eslint-plugin-react` + `eslint-plugin-react-hooks`, incl. React
  Compiler diagnostics) → `a11y` (`eslint-plugin-jsx-a11y`) → `next`
  (`@next/eslint-plugin-next`) → `prettier` (`eslint-config-prettier`,
  must load last). `utils.mjs` is a helper (not a layer): the `block()`
  factory + shared `FILES` globs. Every layer is curated, not preset-as-
  is — rules chosen/dropped per concept to avoid cross-plugin
  duplication (documented in each layer's JSDoc).
- A `Stop` hook in `.claude/settings.json` runs `npm run lint`
  automatically when a task finishes and blocks (feeds errors back)
  until it's clean.
- React Compiler enabled (`babel-plugin-react-compiler`) — avoid manual memoization patterns that fight the compiler.
- Commit messages: Conventional Commits per `commitlint.config.mjs`: `type(scope?): subject`, all lowercase, imperative, no trailing dot. Scope optional; omit only for project-wide changes.
