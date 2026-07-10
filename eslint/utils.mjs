/** Shared file globs for ESLint flat-config modules. */
export const FILES = Object.freeze({
  ts: ['**/*.{ts,tsx}'],
  allCode: ['**/*.{mjs,ts,tsx}'],
  src: ['src/**/*.{ts,tsx}'],
  tests: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  tooling: ['**/*.config.mjs', 'eslint/**/*.mjs'],
})

/**
 * Creates a named flat-config block with optional file scoping.
 * Names surface in `eslint --inspect-config` and error output, which is
 * what makes a composed config debuggable.
 */
export const block = (name, config, files) => ({
  ...config,
  name,
  ...(files ? { files } : {}),
})
