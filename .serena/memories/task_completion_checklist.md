# When a coding task is done

1. `npm run lint` — must pass
2. `npm run format:check` (or `npm run format` to fix) — must pass
3. `npm run build` — verify no breaking errors (Next.js 16 has breaking changes vs older versions; check `node_modules/next/dist/docs/` if unsure about an API)
4. No test framework configured yet — no test command to run.
5. Commit messages must satisfy commitlint (husky commit-msg hook enforces this automatically).
