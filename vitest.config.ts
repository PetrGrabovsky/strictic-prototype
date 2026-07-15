import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Vitest config for the pure lib/engine tests. Mirrors the two tsconfig path
 * aliases (`@/*` → `src`, `@/messages/*` → `messages`) so test imports resolve
 * exactly like the app; the longer alias is listed first so it wins.
 */
const config = defineConfig({
  resolve: {
    alias: [
      {
        find: '@/messages',
        replacement: fileURLToPath(new URL('messages', import.meta.url)),
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('src', import.meta.url)),
      },
    ],
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})

export default config
