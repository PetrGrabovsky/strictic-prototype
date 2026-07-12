# Strictic — step-by-step procedure (from zero to launch)

> For Petr and for Claude Code. Every step has a "DONE WHEN" — do not move on
> without it. Daily tick-box version (task by task): `STRICTIC-PLAN.md`. Golden
> rule: the app is runnable at EVERY commit. Not perfect — alive and one step
> further.

> Note: Czech strings in quotes and `/cs/...` route slugs are actual product
> copy — keep them verbatim.

---

## Step 0 — Project setup (15 minutes, TODAY)

```bash
npx create-next-app@latest strictic
# options: TypeScript ✔ · ESLint ✔ · Tailwind ✔ · src/ ✔ · App Router ✔ · Turbopack ✔ · import alias @/* ✔
cd strictic && git init && git add -A && git commit -m "init"
```

Create a GitHub repo `strictic` (private) and push.

**DONE WHEN:** repo on GitHub, `npm run dev` shows the default page.

## Step 1 — Deploy the EMPTY project (same day)

1. vercel.com → Import repository → deploy (defaults are fine).
2. Buy `strictic.com` (Cloudflare/porkbun/anyone) → Vercel → Settings → Domains
   → add + set DNS per instructions.

Why empty: from now on EVERY push is automatically live. You solve deployment
while it's trivial, not before launch.

**DONE WHEN:** `https://strictic.com` shows a (possibly empty) page from your
repo.

## Step 2 — Skeleton: reference, CLAUDE.md, dependencies, tokens, i18n (1–2 evenings)

```bash
mkdir -p docs/reference   # → copy the whole contents of the strictic-reference package
# CLAUDE.md from the package → repo ROOT
npm i next-intl zod react-hook-form @hookform/resolvers lucide-react
npm i -D vitest @playwright/test
```

Then tell Claude Code:

> "Read CLAUDE.md and docs/reference/STRICTIC-BUILD-GUIDE.md. Build the skeleton
> per STRICTIC-ARCHITECTURE.md §1: [locale] segment with next-intl (`cs` only,
> prefix always), messages/cs.json, design tokens into globals.css @theme
> (values from BUILD-GUIDE §5) + styles/tokens.ts, Inter via next/font, empty
> routes (marketing)/(app). Nothing more."

**DONE WHEN:** `strictic.com/cs` renders an empty layout with the right font and
colors; build passes; `messages/cs.json` exists and the layout reads at least
one string from it.

## Step 3 — Landing (a few evenings)

Prompt for Claude Code:

> "Port docs/reference/strictic-landing-demo.html into
> [locale]/(marketing)/page.tsx. Strings into messages/cs.json. Preserve: SEO
> (JSON-LD, meta, OG), the auth modal exactly (focus trap, scrollbar
> compensation, aria-disabled), sticky mobile CTA, prefers-reduced-motion.
> Logical CSS properties."

The modal is a mock for now (as in the reference) — it gets wired up in step 5.
Add the Plausible script + `landing_cta` event.

**DONE WHEN:** the landing on strictic.com visually matches the reference,
Lighthouse SEO/a11y ≥ 95, the event is measured.

## Step 4 — App screen by screen, ON the localStorage adapter (the biggest chunk)

Foundations first: `lib/storage.ts` (interface + localStorage implementation),
`lib/format.ts`, `src/data/exercises.ts` (catalog from the spec, `nameKey`
i18n), `types/`.

Screen order (each = a separate commit + test):

1. **onboarding** (wizard → deterministic engine → plan) — engine as pure
   functions in `features/onboarding/lib`, Vitest tests on the engine
2. **home** 3. **workout** (rest-flow! BUILD-GUIDE §4) 4. **progress** (charts,
   carousel, share canvas) 5. **settings**

After each screen: a Playwright test equivalent to the probe (setup presets /
rest-flow / progress start-state

- labels / a11y). Reference behavior = `strictic-app-reference.jsx`.

**DONE WHEN:** the whole wizard→workout→progress flow works in the browser on
localStorage; tests green.

## Step 5 — Supabase: sign-in + server data (launch blocker)

```bash
npm i @supabase/ssr @supabase/supabase-js drizzle-orm && npm i -D drizzle-kit
```

1. Supabase project → Auth providers: Google, Apple, Email (magic link). Env
   into `.env.local` + Vercel (validated via `lib/env.ts` with zod).
2. Drizzle schema (`profiles`, `workouts`, `workout_exercises` — ARCHITECTURE
   §5) → `drizzle-kit generate` → migrations → RLS per user.
3. Auth flow per blueprint §2.1: landing "Začít zdarma" → sign-in → new→wizard /
   returning→home. Session-aware CTA. Middleware gate on `/app`.
4. `lib/storage.ts`: add the Supabase implementation and SWITCH the adapter.
   Components don't change — if they do, something leaked outside the storage
   layer (fix it there).

**DONE WHEN:** you sign in on mobile, do a workout, open on PC → same data. A
PWA reinstall doesn't destroy data.

## Step 6 — PWA + analytics + legal (finish)

- `manifest.ts`, service worker (offline shell), icons from the reference zip,
  install to home screen.
- Remaining funnel events (MVP §2 point 10), verify live in Plausible.
- `/cs/ochrana-soukromi`, `/cs/podminky` (generate the texts, have them
  reviewed).

**DONE WHEN:** the checklist in STRICTIC-MVP.md §5 is fully ticked except the
last point.

## Step 7 — The first 10–20 people (the one step that can't be delegated)

People with dumbbells at home: army buddies, colleagues, home-workout FB groups,
r/homegym. A personal message, not a broadcast. Watch in Plausible what they DO
(not what they say): wizard >70%? 1st workout >40%? return within 7 days >30%? →
the blueprint go/kill decides.

**DONE WHEN:** you have numbers. Then — and only then — Phase 2: Stripe + AI
coach (the spec is done in the package).

---

## The trap to watch for (you know it)

Step 4 tempts you into endless pixel-tuning "while I'm rewriting anyway". NO.
The reference is tuned — port it 1:1, improve later based on data from the
people in step 7. Every evening, ask: "Am I closer today to a stranger using
this?"
