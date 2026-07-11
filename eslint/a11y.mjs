import jsxA11y from 'eslint-plugin-jsx-a11y'
import { block, FILES } from './utils.mjs'

/**
 * Accessibility: `recommended` preset, plus five rules the plugin ships
 * disabled in BOTH `recommended` and `strict` (or omits from both
 * entirely) — verified against the plugin's own rule registry, not
 * assumed from the preset name. `strict` only adds stricter *options* to
 * rules already in `recommended`; it doesn't turn on more rules, so
 * there's nothing to gain from swapping presets.
 */
export const a11y = () => [
  block(
    'a11y/recommended',
    {
      ...jsxA11y.flatConfigs.recommended,
      // Next's wrapper components render a native element but are opaque
      // custom identifiers to every a11y rule — an `<Image>` with no
      // `alt` or an `<a>`-less `<Link>` would sail through unchecked.
      // Mapping them makes every rule see through the wrapper: `<Image>`
      // as `<img>` (alt-text, img-redundant-alt), `<Link>` as `<a>`
      // (anchor-is-valid, anchor-ambiguous-text, ...).
      settings: {
        'jsx-a11y': {
          components: {
            Image: 'img',
            Link: 'a',
          },
        },
      },
    },
    FILES.ts,
  ),

  block(
    'a11y/additions',
    {
      rules: {
        // Preset ships this 'off' with a "TODO: error" note upstream —
        // ambiguous link text ("click here", "learn more") fails
        // screen-reader users navigating by link list.
        'jsx-a11y/anchor-ambiguous-text': 'error',
        // Off in both presets, but not for false-positive risk — the
        // project has no custom UI-kit components yet to tune
        // `controlComponents` for, and an unlabeled icon button is a
        // real, common bug on plain HTML elements. A severity-only
        // override merges with, not replaces, the preset's disabled
        // entry (ESLint flat-config rule merge: second config with no
        // options keeps the first's), so this also inherits the
        // preset's own curated `ignoreElements`/`ignoreRoles` — verified
        // via `--print-config`, not hand-copied here to avoid drifting
        // out of sync with the plugin.
        'jsx-a11y/control-has-associated-label': 'error',
        // Absent from both presets. `html-has-lang` only checks the
        // attribute is present; this checks its value is a real IANA
        // language subtag (catches e.g. `lang="eng"`).
        'jsx-a11y/lang': 'error',
        // Absent from both presets. `aria-hidden` on a focusable element
        // removes it from assistive tech while leaving it keyboard-
        // reachable — a screen-reader user tabs onto an element with no
        // announced content.
        'jsx-a11y/no-aria-hidden-on-focusable': 'error',
        // Absent from both presets. Prefer the native element
        // (`<button>`, `<nav>`, ...) over `role="..."` on a `<div>` when
        // one exists — native elements carry keyboard/AT behavior for
        // free that ARIA roles alone don't.
        'jsx-a11y/prefer-tag-over-role': 'error',
      },
    },
    FILES.ts,
  ),
]
