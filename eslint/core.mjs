import js from '@eslint/js'
import { block, FILES } from './utils.mjs'

/**
 * Base JS layer: `eslint recommended` + a curated set of high-value
 * additions. Deliberately lean — correctness and modern-JS rules only.
 * Stylistic opinions live in dedicated plugin modules; formatting is
 * owned entirely by Prettier.
 *
 * `func-style` is intentionally absent: it fights the idiomatic Next.js
 * `export default function Page()` pattern.
 */
export const core = () => [
  block('core/recommended', js.configs.recommended, FILES.allCode),

  block(
    'core/additions',
    {
      rules: {
        'array-callback-return': ['error', { checkForEach: true }],
        'no-constructor-return': 'error',
        // `allowVoid` permits a fire-and-forget executor body, e.g.
        // `new Promise((resolve) => void run())`.
        'no-promise-executor-return': ['error', { allowVoid: true }],
        'no-return-assign': 'error',
        'no-self-compare': 'error',
        'no-template-curly-in-string': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-unreachable-loop': 'error',
        // Short-circuit/ternary allowed: `isValid && doThing()` and
        // `cond ? a() : b()` are intentional side-effect idioms, not bugs.
        'no-unused-expressions': [
          'error',
          { allowShortCircuit: true, allowTernary: true },
        ],

        curly: ['error', 'all'],
        'default-case-last': 'error',
        'dot-notation': 'error',
        // `null: 'ignore'` keeps the `== null` idiom for matching both
        // `null` and `undefined` in a single check.
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        'no-alert': 'error',
        'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
        'no-else-return': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-nested-ternary': 'error',
        'no-new-func': 'error',
        // `props: false` blocks reassigning the parameter itself, but
        // still allows mutating its properties (e.g. reduce accumulators).
        'no-param-reassign': ['error', { props: false }],
        'no-throw-literal': 'error',
        'no-unneeded-ternary': ['error', { defaultAssignment: false }],
        'no-useless-concat': 'error',
        'no-useless-rename': 'error',
        'no-useless-return': 'error',
        'no-var': 'error',
        'object-shorthand': ['error', 'always'],
        'prefer-const': ['error', { destructuring: 'all' }],
        'prefer-object-spread': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-template': 'error',
        radix: ['error', 'always'],
        'require-unicode-regexp': 'error',
        yoda: ['error', 'never'],
      },
    },
    FILES.allCode,
  ),

  // App Router architecture guards. Scoped to `src/` only — the `@/*`
  // alias and Pages Router ban don't apply to root-level tooling config.
  block(
    'core/architecture',
    {
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'next/router',
                message:
                  'Pages Router API. Use `next/navigation` (App Router) ' +
                  'instead.',
              },
            ],
            patterns: [
              {
                group: ['../../*'],
                message: 'Deep relative import. Use the `@/*` alias instead.',
              },
            ],
          },
        ],
      },
    },
    FILES.src,
  ),
]
