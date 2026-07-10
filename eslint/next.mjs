import nextPlugin from '@next/eslint-plugin-next'
import { block, FILES } from './utils.mjs'

/**
 * Next.js' own flat preset, verbatim (`core-web-vitals` is `recommended`
 * with a couple of rules promoted to error). Several rules ship at
 * `warn`; `lint`'s `--max-warnings 0` makes those blocking. Gating lives
 * in the script, so this layer tracks upstream severities as-is —
 * nothing to hand-edit or re-sync when the plugin updates.
 */
export const next = () => [
  block(
    'next/core-web-vitals',
    nextPlugin.configs['core-web-vitals'],
    FILES.ts,
  ),
]
