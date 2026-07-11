/** @type {import('lint-staged').Configuration} */
const lintStagedConfig = {
  // Same extensions as eslint.config.mjs's FILES.allCode. eslint runs
  // first (fixes logic), prettier last (owns formatting) — reversed,
  // prettier's output could get undone by eslint's --fix pass.
  '*.{mjs,ts,tsx}': ['eslint --fix --max-warnings 0', 'prettier --write'],
  // No eslint layer targets these extensions — formatting only.
  '*.{json,css,md}': 'prettier --write',
}

export default lintStagedConfig
