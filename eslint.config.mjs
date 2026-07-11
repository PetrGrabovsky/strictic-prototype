import { defineConfig } from 'eslint/config'
import { a11y } from './eslint/a11y.mjs'
import { bootstrap } from './eslint/bootstrap.mjs'
import { core } from './eslint/core.mjs'
import { imports } from './eslint/imports.mjs'
import { next } from './eslint/next.mjs'
import { prettierCompat } from './eslint/prettier.mjs'
import { react } from './eslint/react.mjs'
import { typescript } from './eslint/typescript.mjs'

/**
 * Layers compose in order; a later block wins over an earlier one for
 * the same rule on the same file. Three invariants fix the sequence:
 * `bootstrap` first (its ignores + TypeScript parser underpin every
 * later layer), `core` before `typescript` (the typed layer switches off
 * base rules and re-enables type-aware equivalents — it has to see them
 * first), and `prettierCompat` last (it must override any formatting
 * rule an earlier layer turned on). The middle layers — imports, react,
 * a11y, next — touch disjoint rule namespaces, so their order is grouped
 * by concern for the reader (module graph → UI → a11y → framework), not
 * for correctness.
 */
export default defineConfig(
  ...bootstrap(),
  ...core(),
  ...typescript(),
  ...imports(),
  ...react(),
  ...a11y(),
  ...next(),
  ...prettierCompat(),
)
