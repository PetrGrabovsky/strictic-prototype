import tseslint from 'typescript-eslint'
import { block, FILES } from './utils.mjs'

const IGNORES = [
  '**/node_modules/**',
  '**/.next/**',
  '**/out/**',
  '**/build/**',
  '**/next-env.d.ts',
]

/**
 * Prerequisites every other layer depends on: global ignores + the
 * TypeScript parser. `projectService` wires type-aware linting straight
 * from `tsconfig.json`, no hand-maintained `project` paths.
 */
export const bootstrap = () => [
  block('bootstrap/ignores', { ignores: IGNORES }),

  block(
    'bootstrap/typescript-parser',
    {
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { projectService: true },
      },
    },
    FILES.ts,
  ),
]
