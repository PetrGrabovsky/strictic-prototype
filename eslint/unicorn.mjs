import unicorn from 'eslint-plugin-unicorn'
import { block, FILES } from './utils.mjs'

const RECOMMENDED_RULES = Object.fromEntries(
  Object.entries(unicorn.configs['flat/recommended'].rules).filter(([id]) =>
    id.startsWith('unicorn/'),
  ),
)

/**
 * Unicorn: `flat/recommended`, filtered to `unicorn/*` rule IDs only —
 * the preset also sets a handful of *core* ESLint rules (e.g.
 * `no-nested-ternary`, `no-negated-condition`) to `off`, which would
 * silently fight core.mjs's own choices if this block ever moved before
 * it. Filtering makes the layer order-independent instead of relying on
 * load order to keep those untouched.
 *
 * Three rules verified against real project files/conventions and
 * overridden rather than trusted at their default:
 *
 * `no-null` — bans the `null` literal outright, no escape hatch for
 * JSX. React's own idiom for "render nothing" is `return null` /
 * `condition ? <X /> : null`; banning it fights the ecosystem, not a
 * real bug. Off.
 *
 * `no-anonymous-default-export` — verified byte-for-byte overlapping
 * with `import-x/no-anonymous-default-export` (both fire on every
 * anonymous arrow/class default export, same violations, just a
 * different message). That rule already covers this. Off here to avoid
 * double-reporting the same line.
 *
 * `name-replacements` — successor in spirit to the now-deprecated
 * `prevent-abbreviations`. Its default table still flags `props`,
 * `params`, `ref`/`refs`, `str`, `util` for spelling out — but `props`
 * is React's own type-suffix convention (`ButtonProps`) and `params` is
 * Next.js's literal route-prop name (`{ params }`). An allowlist would
 * mean permanently fighting the framework's own vocabulary. Off.
 *
 * Three rules reconfigured (verified against real files, not just docs):
 *
 * `filename-case` — `checkDirectories: true` confirmed safe for Next's
 * bracket/paren/`@`-prefixed routing folders (`[id]`, `(marketing)`,
 * `@modal`) via a real lint run; the case check only applies to the
 * alphabetic segments, so it still catches a genuine `BadFolder`.
 *
 * `no-array-reduce` — `allowSimpleOperations: true` permits a
 * single-expression reduce (`nums.reduce((a, b) => a + b, 0)`) while
 * still flagging multi-statement reduce bodies, where a `for`/
 * `Object.groupBy()` reads more clearly. Verified both cases fire as
 * expected.
 *
 * `default-export-style` — default wants an inline
 * `export default function X() {}`. CLAUDE.md's convention is the
 * opposite: declare `const X = () => {}`, export it separately at the
 * file's end. `functions: 'separate'` enforces exactly that pattern —
 * verified it accepts the real `page.tsx` shape and rejects an inline
 * `export default function`.
 *
 * Six rules turned off where another layer already carries an
 * equal-or-better version — confirmed via `--print-config` and real
 * probes (same violation, same line, just a second message). The
 * type-aware `@typescript-eslint/*` versions win where the AST can't see
 * the type: `.includes()`/`.startsWith()` need the receiver to actually
 * have the method, and the sort comparator depends on element type.
 * `no-for-loop` yields to `prefer-for-of`, a syntactic superset that
 * also converts a no-brace body — overlap by concept, not name, so a
 * same-name sweep misses it.
 *
 * Two pairs resolve the other way, in unicorn's favour; the tseslint
 * counterpart is disabled over in typescript.mjs (it loads after this
 * layer, so it has to own that `off`):
 *
 * `prefer-array-find` covers a strict superset of `prefer-find` —
 * `.filter().at(-1)`/`.pop()` → `.findLast()` and destructuring, all
 * missed by the tseslint rule — and `.filter()[…]` is an array idiom, so
 * type-awareness buys nothing here.
 *
 * `prefer-regexp-test` beats `prefer-regexp-exec` on a boolean
 * `str.match(re)`: both fire, but `.test()` is the clearer target than
 * `.exec()`, and the autofix fixed-point is `.test()` regardless.
 */
export const unicornRules = () => [
  block(
    'unicorn/recommended',
    {
      plugins: unicorn.configs['flat/recommended'].plugins,
      languageOptions: unicorn.configs['flat/recommended'].languageOptions,
      rules: RECOMMENDED_RULES,
    },
    FILES.allCode,
  ),

  block(
    'unicorn/overrides',
    {
      rules: {
        'unicorn/no-null': 'off',
        'unicorn/no-anonymous-default-export': 'off',
        'unicorn/name-replacements': 'off',
        'unicorn/filename-case': [
          'error',
          { case: 'kebabCase', checkDirectories: true },
        ],
        'unicorn/no-array-reduce': ['error', { allowSimpleOperations: true }],
        'unicorn/default-export-style': ['error', { functions: 'separate' }],
        // Duplicate of core.mjs's `no-useless-concat`.
        'unicorn/no-useless-concat': 'off',
        // Duplicate of typescript-eslint's bundled `prefer-spread`.
        'unicorn/prefer-spread': 'off',
        // Type-aware `@typescript-eslint/*` equivalents win — they read
        // the real receiver type; unicorn only sees the AST.
        'unicorn/prefer-includes': 'off',
        'unicorn/prefer-string-starts-ends-with': 'off',
        'unicorn/require-array-sort-compare': 'off',
        // `@typescript-eslint/prefer-for-of` is a syntactic superset —
        // it also converts a single-statement (no-brace) body.
        'unicorn/no-for-loop': 'off',
      },
    },
    FILES.allCode,
  ),
]
