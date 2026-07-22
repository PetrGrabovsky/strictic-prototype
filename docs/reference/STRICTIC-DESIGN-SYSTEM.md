# Strictic — design system (token and component consolidation)

> Binding result of analyzing both sources (`strictic-app-reference.jsx` +
> `strictic-landing-demo.html`). Purpose: ONE source of truth for
> color/type/dimensions and a minimal inventory of reusable components.
> Principle: **only what is cross-cutting is global. Tuned one-off values stay
> local.** Implementation: `globals.css` `@theme` (Tailwind v4) +
> `styles/tokens.ts` (JS color mirror for canvas).

---

## 1. Colors — DONE, do not unify, just rewrite into @theme

The analysis confirmed: the light and dark palettes are **identical** in the app
and on the landing (landing `--d-*` is a subset of the app's `D`). Nothing
changes, both are just rewritten from two places into one.

**Light (12):**
`bg #F4F4F2 · surface #FFFFFF · line #ECECEA · line2 #E0E0DD · line-field #8B8B85 · ink #0A0A0A · ink2 #6E6E6B · ink3 #67675F · accent #FF4D1C · accent-deep #C13A12 · cream #F8EFE7 · green #3E9457`

**Dark / dim (10):**
`d-bg #0C0C0B · d-surface #15150F · d-card #1E1E18 · d-line #2A2A24 · d-line2 #3A3A30 · d-ink #F5F5F2 · d-ink2 #A4A49C · d-ink3 #828278 · d-accent #FF5A2C · d-green #4FB06A`

**Rules:** hex NOWHERE but in @theme (ESLint/CLAUDE.md). Values NOT rounded or
changed — they have computed WCAG contrasts (accent-deep is deliberately darker;
white on accent FAILS — BUILD-GUIDE §4). Black overlay/scrim (`#0A0A0A`/`#000`
full-screen in dim mode) = local, not a token.

## 2. Type — 1 family, 2 roles, 5 weights, 3 tracking values

- **Family:** Inter (the only one, via `next/font`). "Mono" in the reference is
  NOT a second font — it is a ROLE.
- **Role `sans`:** normal text. **Role `label`:** data/labels = uppercase +
  tracking + `tabular-nums` (one utility class, not manual repetition of three
  properties).
- **Weights (keep the Tailwind names, just a limited set):** 400 normal (body) ·
  500 medium · 600 semibold (default UI emphasis — dominant, 49×) · 700 bold ·
  800 extrabold (ONLY brand/logo/hero).
- **Tracking — from 8 values to 3 tokens:**

| Token            | em    | Replaces      | Use                                 |
| ---------------- | ----- | ------------- | ----------------------------------- |
| `tracking-tight` | −0.02 | −.01, −.02    | headings, hero                      |
| `tracking-wide`  | 0.08  | .04, .06, .08 | smaller labels                      |
| `tracking-wider` | 0.14  | .10, .14, .16 | micro uppercase labels (label role) |

- Local tracking exception: 5 micro-kernings (.01/.02/.03em) on specific
  headings/numbers — single-location optical corrections, not tokens.
- **`tabular-nums` mandatory** on all numbers (weights, timer, sets, charts) —
  CLAUDE.md rule 4.

## 3. Type scale — from ~48 free values to 7 tokens

| Token       | px  | Replaces (mapping during the port) |
| ----------- | --- | ---------------------------------- |
| `text-2xs`  | 10  | 8.5, 9, 9.5, 10                    |
| `text-xs`   | 12  | 10.5, 11, 11.5, 12                 |
| `text-sm`   | 14  | 12.5, 13, 13.5, 14, 14.5           |
| `text-base` | 16  | 15, 15.5, 16, 16.5, 17             |
| `text-lg`   | 19  | 17.5, 18, 19, 20, 21               |
| `text-xl`   | 24  | 22, 24, 25, 26                     |
| `text-2xl`  | 34  | 30, 34                             |

**Local exceptions (NOT tokens — used by a single location and tuned):**
progress hero number 46, landing H1 38, stat 29→30, internal chart typography
(BigChart 9.5/10 inside bars — keep exactly), share-image canvas (1080×1920
story / 9:16, its own dimensions — revised from the original 1:1 square, which
letterboxed on every Stories surface; see progress-charts-plan decision 21).

## 4. Radii — from 23 values to 4 tokens

| Token         | px  | Replaces                                        |
| ------------- | --- | ----------------------------------------------- |
| `radius-sm`   | 6   | 3, 4, 6, 9                                      |
| `radius-md`   | 14  | 10, 12, 13, 14, 16 (dominant app value: 37× 14) |
| `radius-lg`   | 18  | 18, 20, 22                                      |
| `radius-full` | 999 | 99, 999                                         |

Local exception: landing phone-mock 34 (one-off visual).

## 5. Spacing — no custom tokens, 4px grid

Tailwind default scale (4px step). Free values (9, 11, 13, 15, 22…) are rounded
during the port to the nearest step (`p-2/3/4/5/6/7` = 8/12/16/20/24/28). Local
exceptions: `env(safe-area-inset-*)`, chart internals (fixed bar width 42px —
BUILD-GUIDE §4, DO NOT CHANGE).

**Never write an arbitrary `[Npx]` when a scale token exists** — write the
token: `px-4` not `px-[16px]`, `gap-2.5` not `gap-[10px]`. Half-steps (`.5`,
i.e. 2px) are on-scale and fine (`mt-4.5`, `gap-6.5`); off-grid values (odd px
like 9/11/15/17) round to the nearest step per the rule above (`[15px]`→`px-4`,
`[11px]`→`py-3`). Tailwind 4 generates every numeric step on demand, so the
token always exists — brackets stay ONLY for values with no scale equivalent:
fluid `clamp()`, `min()/max()`, arbitrary breakpoints (`min-[760px]:`), grid
templates (`grid-cols-[64px_1fr]`), off-scale radii (`rounded-[34px]`) and
`backdrop-blur-[6px]`.

## 6. Shadows — from 7 values to 4 tokens + 1 ring

| Token           | Value                                                               | Use                                     |
| --------------- | ------------------------------------------------------------------- | --------------------------------------- |
| `shadow-card`   | `0 1px 2px rgb(10 10 10/.04), 0 20px 44px -24px rgb(10 10 10/.18)`  | cards on surface                        |
| `shadow-pop`    | `0 10px 34px -8px rgb(10 10 10/.55)`                                | toast, floating elements                |
| `shadow-modal`  | `0 24px 60px -15px rgb(10 10 10/.5)`                                | dialogs (unify .45/.5 → .5)             |
| `shadow-accent` | `0 2px 6px rgb(255 77 28/.25), 0 14px 30px -12px rgb(255 77 28/.5)` | primary CTA                             |
| ring (focus)    | `0 0 0 3px rgb(255 90 44/.12)`                                      | field focus — as `--ring`, not a shadow |

## 7. Components — minimal inventory

### `components/ui/` — shared primitives (12)

| Component                                        | Comes from / replaces                                                                                                                                                                                                                                      |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Logo`                                           | merge `Logo` + `Wordmark` (prop `withWordmark`); landing SVG logo = the same source                                                                                                                                                                        |
| `Button` (cva)                                   | **no Button exists in the app** — all buttons are inline styles; the landing has `.btn/.btn-primary/.btn-nav`. Variants: `primary / dark / ghost`, sizes `sm / md / lg`. Replaces ALL buttons in both worlds.                                              |
| `Card`                                           | the repeated surface + line + radius-md + padding pattern (both layers)                                                                                                                                                                                    |
| `AppHeader`                                      | replaces 4 inconsistent inline sticky bars in the app (padding 14/22 vs 13/18 vs 13/22 — unify to one: height 56px, padding-inline 20px, title + action slot). Only in the `(app)` layout — the landing has its own marketing nav, DELIBERATELY different. |
| `Modal`                                          | replaces 2 hand-written dialogs (confirm + share): overlay, focus trap, Escape, click-outside — ONE implementation                                                                                                                                         |
| `AuthModal`                                      | from the landing (preserve focus trap + scrollbar compensation exactly)                                                                                                                                                                                    |
| `Toast`                                          | inline toast from the app (line 678)                                                                                                                                                                                                                       |
| `Stepper`, `Stat`, `StepDots`, `Disc`, `CountUp` | exist in the reference — port 1:1                                                                                                                                                                                                                          |

### `features/*/components/` — domain-specific (not ui primitives)

`progress/`: BigChart, HeroCarousel, ShareCard · `workout/`: RestOverlay,
SetRow… · `onboarding/`: wizard steps.

### What a component is NOT

One-off landing marketing sections (manifest, pricing, FAQ) stay in the page —
the rule from ARCHITECTURE: **into `components/ui` only on the SECOND use.**

## 8. Minimization summary

| Category           | Before                             | After                      |
| ------------------ | ---------------------------------- | -------------------------- |
| Colors             | 2 duplicate definitions (JS + CSS) | 22 tokens, 1 place         |
| Font sizes         | ~48 free                           | 7 tokens + 4 local display |
| Weights            | free                               | 5 allowed                  |
| Tracking           | 8                                  | 3                          |
| Radii              | 23                                 | 4                          |
| Shadows            | 7                                  | 4 + ring                   |
| Spacing            | free px                            | Tailwind 4px grid          |
| Dialogs            | 2 hand implementations             | 1 Modal                    |
| Buttons            | inline + 3 CSS classes             | 1 Button (cva)             |
| App sticky headers | 4 different                        | 1 AppHeader                |

## 9. Rules during the port (supplements CLAUDE.md, doesn't override it)

1. An off-scale value is ALWAYS rounded to a token during the port per the
   mapping tables above — exceptions only those listed as local.
2. Contrast pairs and chart internals (BUILD-GUIDE §4) take precedence over
   unification.
3. Landing nav ≠ AppHeader — two worlds, two headers, deliberately (decided,
   don't merge).
4. A new token may be created only with a justification in the PR/commit — the
   default answer is "use an existing one".
