import perfectionist from 'eslint-plugin-perfectionist'
import { block, FILES } from './utils.mjs'

/**
 * `natural` over the default `alphabetical`: it orders embedded numbers
 * the way a human reads them (`item2` before `item10`), which matters
 * once a union or key set carries digits. One shared base so every rule
 * sorts identically.
 */
const NATURAL = { type: 'natural', order: 'asc' }

/**
 * Perfectionist: hand-picked, NOT a `recommended-*` preset. Every preset
 * turns on all 24 rules, the wrong shape for this stack — it would enable
 * sorters for constructs this project bans (`sort-classes`, `sort-enums`,
 * `sort-interfaces`, `sort-decorators`) and intrusive ones that reorder
 * meaning-bearing code. Only the rules that sort *declarative* shapes are
 * kept.
 *
 * The governing line is sort shapes, not runtime order. Import/export
 * lists, type members and union/intersection members have no semantic
 * order, so sorting them is pure signal. Object *literals*, `switch`
 * cases, module bodies and multi-declarator `const`s do carry order
 * (spread precedence, `case` fallthrough, hoisting, `const a = 1, b = a`)
 * — sorting them risks changing behaviour or intent. Hence:
 *
 * - `sort-objects` off — `{ top, right, bottom, left }` and spread
 *     overrides read by position, not alphabet. `sort-object-types`
 *     (below) covers the safe half: type shapes.
 * - `sort-interfaces` → `sort-object-types`; this project writes `type`,
 *     never `interface`.
 * - `sort-classes`/`sort-decorators`/`sort-heritage-clauses`/`sort-enums`
 *     — classes, decorators and enums are all banned here.
 * - `sort-modules` off — reorders top-level declarations; too invasive
 *     and hazardous around hoisting/init order.
 * - `sort-switch-case` off — a comparator can't see `case` fallthrough or
 *     a deliberate frequency/logical ordering.
 * - `sort-variable-declarations` off — would reorder dependent
 *     declarators (`const a = 1, b = a`).
 * - `sort-array-includes`/`sort-sets`/`sort-maps`/`sort-import-attributes`
 *     /`sort-export-attributes` off — niche, near-zero payoff here.
 *
 * No duplication with existing layers: imports.mjs deliberately leaves
 * `import-x/order` off and reserves all ordering for this layer, and
 * `react/jsx-sort-props` is not enabled anywhere, so `sort-jsx-props` is
 * the sole owner of JSX-prop order. Prettier neither sorts nor is touched
 * by `eslint-config-prettier`, so the last layer can't disable these.
 *
 * `sort-jsx-props` is the one discretionary call: it alphabetises every
 * JSX attribute (spreads stay as partition boundaries, so override order
 * is safe). It fits this project's determinism, but is the natural rule
 * to drop for a team that prefers grouping props by meaning.
 */
export const perfectionistRules = () => [
  block(
    'perfectionist/imports-exports',
    {
      plugins: { perfectionist },
      rules: {
        'perfectionist/sort-imports': [
          'error',
          {
            ...NATURAL,
            // Project's only path alias; the default also treats `~/` and
            // `#` as internal, which this codebase never uses.
            internalPattern: ['^@/.+'],
            // Origin order only — type and value imports interleave by
            // path so an `import type` sits with its value sibling
            // (paired with `separate-type-imports`), not exiled to a top
            // block as the default `type-import` group would.
            groups: [
              'builtin',
              'external',
              'internal',
              ['parent', 'sibling', 'index'],
              'unknown',
            ],
            // Don't police blank lines between groups: most files here
            // carry two or three imports, where a forced blank only adds
            // sparseness. Ordering is the goal, not vertical rhythm.
            newlinesBetween: 'ignore',
          },
        ],
        'perfectionist/sort-named-imports': ['error', NATURAL],
        'perfectionist/sort-named-exports': ['error', NATURAL],
        'perfectionist/sort-exports': ['error', NATURAL],
      },
    },
    FILES.allCode,
  ),

  block(
    'perfectionist/types',
    {
      rules: {
        'perfectionist/sort-object-types': ['error', NATURAL],
        'perfectionist/sort-union-types': ['error', NATURAL],
        'perfectionist/sort-intersection-types': ['error', NATURAL],
      },
    },
    FILES.ts,
  ),

  block(
    'perfectionist/jsx',
    { rules: { 'perfectionist/sort-jsx-props': ['error', NATURAL] } },
    FILES.ts,
  ),
]
