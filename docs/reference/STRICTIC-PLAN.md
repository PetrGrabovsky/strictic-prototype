# Strictic — work plan to MVP launch (checklist)

> Companion to `STRICTIC-PROCEDURE.md` (commands and prompts live there). This
> is a tick-box task list. **Rule: every session at the computer = at least one
> checked box. Stages are not skipped.**

> Note: Czech strings in quotes and `/cs/...` route slugs are actual product
> copy — keep them verbatim.

---

## Stage 0 — Setup (TODAY, ~15 min)

- [ ] `npx create-next-app@latest strictic` (options: TS ✔ ESLint ✔ Tailwind ✔
      src/ ✔ App Router ✔ alias @/* ✔)
- [ ] `git init` + first commit + push to GitHub (private repo `strictic`)

## Stage 1 — Live domain (same day, ~45 min)

- [ ] Vercel: import repo → Deploy
- [ ] Buy `strictic.com` + connect in Vercel → Domains (DNS per instructions)
- [ ] Verify: `https://strictic.com` shows the page from the repo

## Stage 2 — Project skeleton (1–2 evenings)

- [ ] `docs/reference/` ← package contents; `CLAUDE.md` → repo ROOT
- [ ] `npm i next-intl zod react-hook-form @hookform/resolvers lucide-react` +
      `npm i -D vitest @playwright/test`
- [ ] next-intl: `src/i18n/routing.ts` + `request.ts` + `middleware.ts`,
      `[locale]` segment, `messages/cs.json`
- [ ] Design tokens: `globals.css` `@theme` (values from BUILD-GUIDE §5) +
      `styles/tokens.ts` (JS mirror for canvas)
- [ ] Inter via `next/font` in `[locale]/layout.tsx` (+ `dir` per locale)
- [ ] Empty route groups `(marketing)` / `(app)` with layouts
- [ ] ✅ STAGE DONE: `/cs` renders with the right font/colors, build passes, at
      least 1 string comes from `cs.json`

## Stage 3 — Landing (2–4 evenings)

- [ ] Nav + hero (logo 16×22 px, gap 11, line-height:1; H1; trustline; micro
      line)
- [ ] Sections: problem (3 cards) → 3 steps → features + anti-feature box → dark
      manifest ✓/✗ → founder → pricing (Free/Plus) → FAQ (8×, mirrored in
      JSON-LD) → final CTA → footer
- [ ] Auth modal (mock for now): focus trap, scrollbar compensation,
      `aria-disabled` loading, Escape/click-outside, bottom-sheet on mobile
- [ ] Sticky mobile CTA + live phone mock + scroll-reveal (all respect
      `prefers-reduced-motion`)
- [ ] SEO: title/meta/OG/Twitter, SoftwareApplication + FAQPage JSON-LD,
      `sitemap.ts`, `robots.ts`
- [ ] All strings into `messages/cs.json`; logical CSS properties only
- [ ] Plausible script + `landing_cta` event
- [ ] ✅ STAGE DONE: visual match with the reference, Lighthouse SEO/a11y ≥ 95,
      event visible in Plausible

## Stage 4 — App foundations (1 evening)

- [ ] `types/` (Equipment, WorkoutRecord, Gear…) + `lib/constants.ts`
- [ ] `lib/storage.ts` — interface + localStorage implementation (the only path
      to data!)
- [ ] `lib/format.ts` on top of the next-intl formatter (fmtKg, fmtVol with
      tonnes from 1000, fmtDur, dShort)
- [ ] `src/data/exercises.ts` — catalog from the spec (~44 exercises: id,
      nameKey, equipment, muscleGroup, pattern, difficulty, scaling)
- [ ] `hooks/` (useWakeLock, useAudio, useHaptics) + `components/ui/` (Logo,
      Wordmark, Button, Stepper, Stat, StepDots, Disc, CountUp)

## Stage 5 — App screens (the biggest chunk; each box = a commit)

- [ ] **Onboarding UI**: wizard (equipment/body/experience/goal), weight presets
      (2–24 / 2–32 / "Pevný pár"), detail collapsed on first run
- [ ] **Engine**: `buildPlan` + `lighterPlan` as pure functions from the
      catalog + **Vitest tests** (goals, equipment, scaling)
- [ ] Plan reveal → **Home** (today's workout, "lehčí den" markers, CTA)
- [ ] **Workout**: sets + steppers, rest countdown (elapsed time, next weight
      prep), rest-flow (last set → straight to summary), skip exercise with data
      integrity, "Ukončit a uložit, co mám", wake lock, haptics even under mute
- [ ] **Summary** + share canvas (workout image 1080×1080)
- [ ] **Progress**: BigChart (fixed bar width, label on each, inside/above per
      height, scroll, tonnes) · hero carousel (scroll = source of truth, ‹ › +
      dots, keys) · start-states (1 record = starting line) · shareEx canvas
- [ ] **Settings**: equipment editor, reset, mute
- [ ] **Playwright probe ports**: presets · rest-flow · a11y · progress (1 vs 3
      workouts, labels)
- [ ] ✅ STAGE DONE: the whole wizard→workout→progress flow works on mobile
      (localStorage), tests green

## Stage 6 — Supabase (launch blocker)

- [ ] Supabase project; Auth providers: Google, Apple, Email (magic link)
- [ ] `lib/env.ts` (zod validation) + env into Vercel
- [ ] `npm i @supabase/ssr @supabase/supabase-js drizzle-orm` +
      `-D drizzle-kit`; schema `profiles`/`workouts`/`workout_exercises`;
      migrations; RLS per user
- [ ] Auth flow per blueprint §2.1: login-first → new→wizard / returning→home;
      session-aware CTA on the landing; middleware gate `/app`; third state
      (unfinished wizard → resume)
- [ ] Supabase implementation of `storage.ts` + adapter switch (components DO
      NOT change)
- [ ] ✅ STAGE DONE: mobile → PC same data under the same account; a PWA
      reinstall destroys nothing

## Stage 7 — PWA + measurement + legal (finish)

- [ ] `manifest.ts` + service worker (offline shell) + icons from the reference
      zip; install to home screen works
- [ ] Remaining events: `auth_started/done`, `wizard_started/done`,
      `plan_revealed`, `workout_started/finished` — verify live
- [ ] `/cs/ochrana-soukromi` + `/cs/podminky`
- [ ] Walk the full launch checklist `STRICTIC-MVP.md §5`

## Stage 8 — Release (the one stage that can't be delegated)

- [ ] Reach out to 10–20 people with dumbbells at home (personal messages:
      friends, colleagues, FB groups, r/homegym)
- [ ] Watch the funnel in Plausible: wizard >70% · 1st workout >40% · return
      within 7 days >30% (kill <15%)
- [ ] Decide go/kill per the blueprint → only then Phase 2 (Stripe + AI coach)

---

**When Stage 5 tempts you to improve things "while I'm rewriting anyway": NO.
The reference is tuned, port it 1:1.** Improvements come out of Stage 8 — from
what people do, not from what you still notice yourself.
