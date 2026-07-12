# strictic — overview

Next.js 16.2.10 (Turbopack) app, React 19.2.4, TypeScript, Tailwind 4, ESLint 10, `babel-plugin-react-compiler`. No test framework yet.

## Structure

- `src/app/` — App Router (layout.tsx, page.tsx, globals.css, favicon.ico)
- `src/lib/` — shared utilities (pure, React-free)
- alias `@/*` → `./src/*`
- Deeper context (architecture, design tokens, build plan) planned for
  `docs/reference/` (not created yet — see CLAUDE.md).

## Critical

`AGENTS.md` warns: this Next.js version has BREAKING CHANGES vs training data (APIs, conventions, file structure). Read `node_modules/next/dist/docs/` before writing Next.js code. Heed deprecation notices.
