import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import { block, FILES } from './utils.mjs'

/**
 * React: `recommended` + `jsx-runtime` (new JSX transform, no `import
 * React`) for the base plugin, `recommended-latest` for hooks — which as
 * of `eslint-plugin-react-hooks` v6+ also carries the React Compiler
 * diagnostics (`purity`, `immutability`, `set-state-in-render`, ...),
 * merged into this plugin instead of a separate experimental package.
 * `exhaustive-deps` and a couple of compiler rules ship at `warn`;
 * `lint`'s `--max-warnings 0` makes those blocking too, same pattern as
 * next.mjs.
 */
export const react = () => [
  block(
    'react/base',
    {
      ...reactPlugin.configs.flat.recommended,
      ...reactPlugin.configs.flat['jsx-runtime'],
      rules: {
        ...reactPlugin.configs.flat.recommended.rules,
        ...reactPlugin.configs.flat['jsx-runtime'].rules,
      },
      // Pinned, not 'detect': auto-detection calls an ESLint context API
      // (`getFilename`) that ESLint 10's flat-config context no longer
      // exposes and crashes the whole run. A literal version sidesteps
      // that code path entirely.
      settings: { react: { version: '19.2' } },
    },
    FILES.ts,
  ),

  block(
    'react/overrides',
    {
      rules: {
        // TypeScript types the props; PropTypes validation is dead weight.
        'react/prop-types': 'off',
      },
    },
    FILES.ts,
  ),

  block(
    'react/correctness',
    {
      rules: {
        // CLAUDE.md: arrow functions only, no function declarations.
        'react/function-component-definition': [
          'error',
          {
            namedComponents: 'arrow-function',
            unnamedComponents: 'arrow-function',
          },
        ],
        'react/button-has-type': 'error',
        'react/checked-requires-onchange-or-readonly': 'error',
        'react/hook-use-state': 'error',
        'react/iframe-missing-sandbox': 'error',
        // `javascript:` URLs in an href/src are an XSS vector.
        'react/jsx-no-script-url': 'error',
        'react/jsx-no-constructed-context-values': 'error',
        'react/jsx-no-leaked-render': 'error',
        // Bans spreading the same identifier twice onto one element — a
        // copy-paste bug, not a style choice.
        'react/jsx-props-no-spread-multi': 'error',
        'react/no-array-index-key': 'error',
        // Forces an explicit per-line disable, not a ban — dangerous HTML
        // stays available for the rare pre-sanitized-content case.
        'react/no-danger': 'error',
        'react/no-invalid-html-attribute': 'error',
        // A literal default (`= {}` / `= []`) is a fresh identity every
        // render, defeating memoization even under the Compiler.
        'react/no-object-type-as-default-prop': 'error',
        'react/no-unstable-nested-components': 'error',
        'react/self-closing-comp': 'error',
        // `children` is untyped on void elements in React's own JSX
        // types, so TS won't catch `<img>text</img>` — this does.
        'react/void-dom-elements-no-children': 'error',
      },
    },
    FILES.ts,
  ),

  block(
    'react/jsx-style',
    {
      rules: {
        'react/jsx-boolean-value': ['error', 'never'],
        'react/jsx-curly-brace-presence': [
          'error',
          { props: 'never', children: 'never' },
        ],
        'react/jsx-fragments': ['error', 'syntax'],
        'react/jsx-no-useless-fragment': 'error',
      },
    },
    FILES.ts,
  ),

  block(
    'react-hooks/recommended',
    reactHooks.configs.flat['recommended-latest'],
    FILES.ts,
  ),
]
