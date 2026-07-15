import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { createNodeResolver, importX } from 'eslint-plugin-import-x'
import { block, FILES } from './utils.mjs'

const LIB_ZONE = {
  target: './src/lib',
  from: './src/app',
  message:
    'src/lib is pure, React-free shared logic — it must not depend on ' +
    'the app router tree. Pass data in as arguments instead.',
}

/**
 * Imports: `recommended` + `typescript` presets (the latter turns off
 * `named` — TypeScript's own checker already verifies named
 * imports/exports more accurately than an AST-only rule can), plus
 * hand-picked correctness rules the presets don't cover. Resolution runs
 * through the modern `resolver-next` interface (TypeScript resolver
 * first, for the `@/*` path alias; Node resolver as fallback) — the
 * plugin's own bundled resolver doesn't understand tsconfig paths.
 *
 * `no-relative-parent-imports` was tried and dropped: it classifies by
 * the *resolved* file location, not the written specifier, so it
 * misreads every `@/lib/*` alias import from `src/app/*` as a banned
 * relative-parent import — the exact pattern this project's alias
 * convention is supposed to encourage. `no-restricted-imports` in
 * core.mjs already polices literal relative-path depth on the specifier
 * text, which is the correct tool for that job.
 *
 * Ordering (`import-x/order`) is out of scope — not wired up anywhere
 * yet, reserved for a future `perfectionist` layer.
 */
export const imports = () => [
  block(
    'import-x/recommended',
    {
      ...importX.flatConfigs.recommended,
      ...importX.flatConfigs.typescript,
      rules: {
        ...importX.flatConfigs.recommended.rules,
        ...importX.flatConfigs.typescript.rules,
      },
      settings: {
        ...importX.flatConfigs.typescript.settings,
        'import-x/resolver-next': [
          createTypeScriptImportResolver(),
          createNodeResolver(),
        ],
      },
    },
    FILES.allCode,
  ),

  block(
    'import-x/correctness',
    {
      rules: {
        // Upgrade from the preset's `warn`. No `prefer-inline`: a
        // type-only and a value import from the same module stay as two
        // separate statements (pairs with `consistent-type-imports`'
        // `separate-type-imports`); this still collapses two genuine
        // value-import duplicates of the same module.
        'import-x/no-duplicates': 'error',
        // `ignoreExternal`: don't traverse into node_modules looking for
        // cycles — those are the dependency's problem, not this
        // project's, and traversing them is pure wasted work.
        'import-x/no-cycle': ['error', { ignoreExternal: true }],
        'import-x/no-self-import': 'error',
        'import-x/no-useless-path-segments': [
          'error',
          { noUselessIndex: true },
        ],
        'import-x/no-mutable-exports': 'error',
        'import-x/newline-after-import': 'error',
        // ESM imports hoist regardless of position; one appearing after
        // real code is misleading. Not an ordering concern (that is
        // perfectionist's) — a structural one.
        'import-x/first': 'error',
        // Catches a leftover `import Foo, {} from 'x'` after the last
        // named specifier is deleted. `no-unassigned-import` misses this
        // one — the default binding makes the import look "assigned".
        'import-x/no-empty-named-blocks': 'error',
        // Default options already ban anonymous arrow/function/class
        // default exports — exactly CLAUDE.md's "declare as const X,
        // then export default X" convention. Nothing to configure.
        'import-x/no-anonymous-default-export': 'error',
        // Global stylesheet imports (`import './globals.css'` in
        // layout.tsx) are the one legitimate side-effect-only import in
        // this project; everything else must bind a name.
        'import-x/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
        // A devDependency (e.g. `prettier`) imported from shipped code
        // is a phantom dependency once devDependencies are pruned in a
        // production install. Config/tooling files legitimately reach
        // for devDependencies.
        'import-x/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [
              '**/*.config.{mjs,ts}',
              '**/*.test.{ts,tsx}',
              'eslint/**/*.mjs',
            ],
          },
        ],
      },
    },
    FILES.allCode,
  ),

  // Scoped to src/lib itself: the rule fires on the importing file, so it
  // only needs to run there to enforce the one-directional boundary.
  block(
    'import-x/architecture',
    {
      rules: {
        'import-x/no-restricted-paths': ['error', { zones: [LIB_ZONE] }],
      },
    },
    ['src/lib/**/*.{ts,tsx}'],
  ),

  // Every flat-config plugin is consumed as `plugin.configs.x` /
  // `plugin.parser` off a default (or default-shaped) import — the exact
  // shape `no-named-as-default-member` exists to flag. Real bug risk is
  // ~0 in files whose whole job is that access pattern; disabled only
  // for the tooling layer, not project-wide.
  block(
    'import-x/tooling-overrides',
    { rules: { 'import-x/no-named-as-default-member': 'off' } },
    FILES.tooling,
  ),
]
