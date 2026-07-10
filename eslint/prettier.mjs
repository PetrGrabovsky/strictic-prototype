import prettier from 'eslint-config-prettier/flat'
import { block, FILES } from './utils.mjs'

/**
 * Neutralizes formatting rules from every earlier layer that would fight
 * Prettier. Must load last so it overrides, not gets overridden.
 *
 * `curly` and `no-unexpected-multiline` are correctness rules, not
 * formatting — eslint-config-prettier disables both defensively, but its
 * own docs list our exact config (`curly: ["error", "all"]`) as safe, and
 * call the other "usable with Prettier without problems". Re-enabled.
 */
export const prettierCompat = () => [
  prettier,

  block(
    'prettier/re-enable',
    {
      rules: {
        curly: ['error', 'all'],
        'no-unexpected-multiline': 'error',
      },
    },
    FILES.allCode,
  ),
]
