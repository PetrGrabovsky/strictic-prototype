/** @type {import('@commitlint/types').UserConfig} */
const commitlintConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Minimalist type set. 'revert' is kept strictly to prevent conflicts
    // with the 'git revert' command.
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'revert'],
    ],
    'type-case': [2, 'always', 'lower-case'],

    // Scope is optional to prevent artificial clutter (e.g., 'chore(misc)')
    'scope-empty': [0],
    'scope-case': [2, 'always', 'lower-case'],

    // Enforcing strict lowercase to maintain 100% visual consistency.
    // Note: This intentionally forbids uppercase in names and acronyms
    // (e.g., 'api', 'next.js').
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
}

export default commitlintConfig
