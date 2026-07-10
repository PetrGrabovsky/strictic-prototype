# Code style & conventions

- TypeScript, Next.js App Router conventions.
- Formatting via Prettier (plugins: prettier-plugin-tailwindcss, prettier-plugin-packagejson) — run `npm run format`.
- Linting via ESLint 9 flat config (`eslint.config.mjs`), includes `@next/eslint-plugin-next`, `typescript-eslint`, `eslint-config-prettier`.
- React Compiler enabled (`babel-plugin-react-compiler`) — avoid manual memoization patterns that fight the compiler.
- Commit messages: Conventional Commits per `commitlint.config.mjs`: `type(scope?): subject`, all lowercase, imperative, no trailing dot. Scope optional; omit only for project-wide changes.
