import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import { block, FILES } from './utils.mjs'

const ENUM_BAN = {
  selector: 'TSEnumDeclaration',
  message: 'Enums are banned. Use a union type or a const object.',
}

const CLASS_DECLARATION_BAN = {
  selector: 'ClassDeclaration',
  message:
    'Functional style: no classes. Exception: React error boundaries — disable locally there.',
}

const CLASS_EXPRESSION_BAN = {
  selector: 'ClassExpression',
  message: 'Functional style: no class expressions.',
}

const SYNTAX_BANS = [ENUM_BAN, CLASS_DECLARATION_BAN, CLASS_EXPRESSION_BAN]

const PROCESS_ENV_BAN = {
  selector: 'MemberExpression[object.name="process"][property.name="env"]',
  message: "Import from '@/lib/env' instead of reading process.env directly.",
}

/**
 * Type-aware tier: `recommendedTypeChecked` + `stylisticTypeChecked`.
 * Swap `recommendedTypeChecked` for `strictTypeChecked` when you want
 * maximum strictness — a low-friction base tier is a deliberate choice
 * for migration and porting phases, not an oversight.
 */
export const typescript = () => [
  ...defineConfig({
    files: FILES.ts,
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
  }),

  block(
    'typescript/overrides',
    {
      rules: {
        // Project convention: `type` everywhere, no `interface`.
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        // CLAUDE.md bans `as` type assertions (`as const` stays allowed).
        // The stylistic preset only enforces `as` *style*, not a ban —
        // upgrade it to forbid assertions outright.
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          { assertionStyle: 'never' },
        ],
        // JSX event handlers are void slots; an async handler there is safe.
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: { attributes: false } },
        ],
        // Same carve-out as the base `no-unused-expressions` in core.mjs:
        // `isValid && doThing()` / `cond ? a() : b()` are intentional,
        // not bugs. `recommendedTypeChecked` disables the base rule and
        // re-enables this typed one with strict defaults — restate here.
        '@typescript-eslint/no-unused-expressions': [
          'error',
          { allowShortCircuit: true, allowTernary: true },
        ],
        // `_` prefix marks intentionally unused (params, catch, destructuring).
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        // Same false-positive risk as base `require-await`, which core.mjs
        // deliberately skips: Next.js Server Actions must be `async` even
        // when the body never awaits anything.
        '@typescript-eslint/require-await': 'off',
      },
    },
    FILES.ts,
  ),

  block(
    'typescript/additions',
    {
      rules: {
        // Enforce `import type` — keeps type-only imports out of the
        // runtime graph.
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        // Mirror for exports; inline specifier matches the import fixStyle.
        '@typescript-eslint/consistent-type-exports': [
          'error',
          { fixMixedExportsWithInlineTypeSpecifier: true },
        ],
        // Collapse an all-inline-type import to a top-level `import type`,
        // dropping the leftover runtime side effect.
        '@typescript-eslint/no-import-type-side-effects': 'error',
        // Flags use of `@deprecated` APIs — catches Next/React deprecations
        // across version bumps before they become removals.
        '@typescript-eslint/no-deprecated': 'error',
        // Discriminated-union switches must handle every member; pairs with
        // a `never` default for compile-time exhaustiveness.
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        // `[10, 2].sort()` sorts lexically → `[10, 2]`. Require a comparator
        // on number/object arrays (string arrays keep the default sort).
        '@typescript-eslint/require-array-sort-compare': 'error',
        // Await returned promises inside try/catch so a rejection keeps its
        // stack frame instead of escaping the handler.
        '@typescript-eslint/return-await': ['error', 'in-try-catch'],
        // Type a Promise-rejection callback's reason as `unknown`, matching
        // how a caught error is typed under `strict`.
        '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
        // `!` is an unsafe typing shortcut, same family as `as` — the
        // project bans both in favor of real narrowing.
        '@typescript-eslint/no-non-null-assertion': 'error',
        // Base `no-shadow` is off; the type-aware version understands
        // type-vs-value shadowing (this is its intended home layer).
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/default-param-last': 'error',
        'no-restricted-syntax': ['error', ...SYNTAX_BANS],
      },
    },
    FILES.ts,
  ),

  // Same rule as above, restated: flat config replaces a rule's options
  // wholesale per matching file, it doesn't merge across blocks. `src/`
  // additionally bans reading `process.env` directly — root-level tooling
  // (e.g. `next.config.ts`) legitimately needs it at build time.
  block(
    'typescript/env-guard',
    {
      rules: {
        'no-restricted-syntax': ['error', ...SYNTAX_BANS, PROCESS_ENV_BAN],
      },
    },
    FILES.src,
  ),

  // `src/lib/env.ts` is the single module allowed to read `process.env`
  // (it validates and re-exports it) — restate the bans minus that one.
  block(
    'typescript/env-overrides',
    {
      rules: {
        'no-restricted-syntax': ['error', ...SYNTAX_BANS],
      },
    },
    ['src/lib/env.ts'],
  ),
]
