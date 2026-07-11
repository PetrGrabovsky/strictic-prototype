import { defineConfig } from 'eslint/config'
import { a11y } from './eslint/a11y.mjs'
import { bootstrap } from './eslint/bootstrap.mjs'
import { core } from './eslint/core.mjs'
import { imports } from './eslint/imports.mjs'
import { next } from './eslint/next.mjs'
import { prettierCompat } from './eslint/prettier.mjs'
import { react } from './eslint/react.mjs'
import { sonarRules } from './eslint/sonar.mjs'
import { typescript } from './eslint/typescript.mjs'
import { unicornRules } from './eslint/unicorn.mjs'

/**
 * Layers compose in order; a later block wins over an earlier one for
 * the same rule on the same file. Three invariants fix the sequence:
 * `bootstrap` first (its ignores + TypeScript parser underpin every
 * later layer), `core` before `typescript` (the typed layer switches off
 * base rules and re-enables type-aware equivalents — it has to see them
 * first), and `prettierCompat` last (it must override any formatting
 * rule an earlier layer turned on). `unicornRules` is filtered to
 * `unicorn/*` rule IDs only (see unicorn.mjs), so — like the rest of the
 * middle layers (sonar, imports, react, a11y, next), which touch disjoint
 * rule namespaces — its position is grouped by concern for the reader
 * (general JS → types → deeper bug analysis → module graph → UI → a11y →
 * framework), not required for correctness. `sonar` sits after
 * `typescript` because its type-aware rules read as an extra analysis
 * pass over the typed layer.
 */
export default defineConfig(
  ...bootstrap(),
  ...core(),
  ...unicornRules(),
  ...typescript(),
  ...sonarRules(),
  ...imports(),
  ...react(),
  ...a11y(),
  ...next(),
  ...prettierCompat(),
)
