import sonarjs from 'eslint-plugin-sonarjs'
import { block, FILES } from './utils.mjs'

/**
 * SonarJS: hand-picked, NOT the `recommended` preset. `recommended` turns
 * on 206 rules, the wrong shape for this stack: ~17 `aws-*` infra checks
 * and a large Express/Node-oriented security suite that mostly can't fire
 * in an App Router app, ~20 test-framework rules (no test runner yet),
 * and a regex/React set that overlaps core, unicorn and the React layer.
 * Its real, unique value is the dataflow/symbolic bug detection no other
 * plugin here does — so only that is kept.
 *
 * Every rule below was verified by probe (a crafted violation linted
 * against the full composed config), not by name: keep only if it fires
 * and is the sole reporter. That surfaced a wall of concept-level overlap
 * a same-name sweep can't see — unicorn is far broader than its docs let
 * on. Dropped because another layer already owns the concept:
 *
 * - `no-identical-conditions` → core `no-dupe-else-if` + `no-duplicate-case`
 * - `no-all-duplicated-branches`/`no-duplicated-branches`
 *     → unicorn `no-duplicate-if-branches`
 * - `no-identical-expressions` → unicorn `no-duplicate-logical-operands`
 *     (core `no-self-compare` covers the comparison case)
 * - `no-redundant-boolean` → unicorn `no-unnecessary-boolean-comparison`
 *     + `no-useless-logical-operand`
 * - `no-inverted-boolean-check` → unicorn `no-negated-comparison`
 * - `prefer-single-boolean-return` → unicorn `prefer-boolean-return`
 * - `no-collection-size-mischeck` → unicorn `no-impossible-length-comparison`
 * - `no-misleading-array-reverse` → unicorn `no-array-reverse`
 * - `no-redundant-jump` → unicorn `no-useless-continue`
 * - `no-primitive-wrappers` → unicorn `new-for-builtins`
 * - `no-array-delete` → `@typescript-eslint/no-array-delete`
 * - `no-duplicate-in-composite`
 *     → `@typescript-eslint/no-duplicate-type-constituents`
 * - `no-nested-conditional` → core `no-nested-ternary`
 * - `array-callback-without-return` → core `array-callback-return`
 * - `no-dead-store` → core `no-useless-assignment`
 * - `no-parameter-reassignment` → core `no-param-reassign`
 * - `no-alphabetical-sort` → unicorn `no-array-sort`
 *     + `@typescript-eslint/require-array-sort-compare`
 *
 * Also dropped, not for overlap: `void-use` fights the allowed
 * `void run()` fire-and-forget idiom; `redundant-type-aliases` flags
 * legitimate semantic aliases (`type UserId = string`);
 * `prefer-immediate-return` is noisy and demoted to `off` upstream (it
 * fights naming a value for a breakpoint); `todo-tag`/`fixme-tag` make
 * every TODO an error (policy, not a bug — unicorn already handles
 * *expiring* ones); `no-gratuitous-expressions` proved inert here (never
 * fired, even on `const f = true; if (f)`); `no-invariant-returns` false-
 * positives on side-effecting handlers that intentionally return a
 * constant.
 *
 * Scoped to `FILES.ts`: the type-aware rules (`arguments-order`,
 * `different-types-comparison`, `no-ignored-return`) need the TypeScript
 * program, which bootstrap.mjs wires up for `.ts`/`.tsx` only; the
 * `.mjs` tooling files are already covered by core and unicorn.
 */
export const sonarRules = () => [
  block(
    'sonarjs/curated',
    {
      plugins: { sonarjs },
      rules: {
        // Dataflow/symbolic bug detection — unique to SonarJS here.
        // Writing the same index twice with no read in between.
        'sonarjs/no-element-overwrite': 'error',
        // Iterating/reading a collection that is provably always empty.
        'sonarjs/no-empty-collection': 'error',
        // A collection is populated but its contents are never read.
        'sonarjs/no-unused-collection': 'error',
        // Return value of a side-effect-free call (e.g. `s.trim()`)
        // silently discarded — almost always a forgotten reassignment.
        'sonarjs/no-ignored-return': 'error',
        // `new Error(...)` created but never thrown or returned.
        'sonarjs/no-unthrown-error': 'error',
        // `=+`/`=-`/`=!` — a typo for the `+=`/`-=`/`!==` operator.
        'sonarjs/non-existent-operator': 'error',
        // Call args whose names/types match the parameters in a swapped
        // order — a type-aware catch for transposed arguments.
        'sonarjs/arguments-order': 'error',
        // A `===`/`!==` whose result is constant per the types (e.g. a
        // check the compiler has already narrowed to always-true). No
        // `as`/`any` in this project, so the type verdict is trustworthy;
        // `@typescript-eslint/no-unnecessary-condition` is not enabled, so
        // nothing else catches these.
        'sonarjs/different-types-comparison': 'error',

        // Code smells with no equivalent in the other layers.
        // Copy-pasted function bodies (default: 3+ statements).
        'sonarjs/no-identical-functions': 'error',
        'sonarjs/no-nested-switch': 'error',
        // A `switch` with a single real case reads better as an `if`.
        'sonarjs/no-small-switch': 'error',
        'sonarjs/no-nested-template-literals': 'error',
        // `x?: T | undefined` — the `?` already implies `| undefined`.
        'sonarjs/no-redundant-optional': 'error',

        // Complexity metric. core.mjs deliberately carries none, leaving
        // it to this layer; 15 is SonarQube's own default threshold.
        // Cognitive (not cyclomatic) complexity — it doesn't penalise a
        // flat sequence, only genuinely tangled control flow.
        'sonarjs/cognitive-complexity': ['error', 15],
      },
    },
    FILES.ts,
  ),
]
