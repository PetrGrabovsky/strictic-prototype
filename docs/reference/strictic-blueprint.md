# Strictic — Master blueprint: from visitor to payer (binding version)

> This document closes all open decisions. It builds on
> `strictic-ai-coach-spec.md` (AI coach) and `strictic-backlog.md`. From now the
> plan doesn't change — it changes only per data from real users.
>
> Note: Czech UI strings in quotes (CTAs, screen titles) are actual product copy
> — keep them verbatim. English glosses are given in parentheses where helpful.

---

## 0. Decided (binding)

| Question          | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Free vs paid core | Free = a full-featured local-first app + a tailored deterministic plan. Plus = "your coach" (AI plan generation/revision + chat) + sync.                                                                                                                                                                                                                                                                                                                                                                                                   |
| Sign-in           | **FINAL (3rd revision): sign-in ALWAYS as the very first step, one path, no exceptions.** Google One Tap / Apple / email magic link right after the landing "Začít zdarma" — the app detects new/returning from identity, the wizard comes only afterwards and only for new users. Session persistent by default, no checkbox. Passwords don't exist. Path: anonymous start (3 structural bugs) → wizard-before-sign-in (4 necessary patches because of that bug) → sign-in always first (0 patches, the simplest of the three — see 2.1). |
| First AI plan     | Free 1× per account (the aha moment). Revision/regeneration = Plus.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Coach             | 3 messages free (server-side counter), then Plus.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Payment           | Stripe Checkout, 7-day trial **with card upfront**, annual tier preselected. Subscription state ALWAYS from the server.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Lifetime          | Keep only with a fair-use clause; on the AI coach launch raise it to 2,990 CZK, or withdraw it.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Build order       | **Phase 1 without a backend → data → Phase 2 backend.** The backend isn't built until phase 1 shows returns.                                                                                                                                                                                                                                                                                                                                                                                                                               |

> **UPDATE (overriding — see `STRICTIC-MVP.md`):** "Phase 1 without a backend"
> predates the final login-first architecture (§2.1, 3rd revision) and is
> incompatible with it for a public launch. What holds: **MVP = sign-in +
> Supabase from launch**; "without a backend" survives only as a development
> order (screens are built on a localStorage adapter, Supabase is connected
> before launch). Go/kill metrics, the engine, and the deferral of payments/AI
> hold unchanged.

> **Important:** everything in section 2.1 (anonymous accounts, identity
> linking, sync) is Phase 2. In today's prototype (Phase 1) there is no account,
> no Supabase, no sync — the app runs purely on one browser's localStorage. Two
> devices = two entirely separate apps until phase 2 exists. | Hard gate after
> plan reveal | NO (a deliberate decision — see spec 12.7). |

---

## 1. PHASE 1 — launch without a backend (zero cost, zero API risk)

**What it contains:** today's PWA + wizard (equipment → body (skippable) →
experience + abilities → goal **chips + restriction checkboxes**
shoulder/back/knee) + the deterministic engine (personalization by equipment,
abilities, restrictions, time — the rules from spec section 5 implemented in
code) + plan reveal with reasons on exercises (templated text) +
workout/progress/sharing. Landing connected to the app on a real domain.

**Why no AI:** free text without a backend can't be read honestly (spec 12.4);
the deterministic engine covers ~90% of the personalization value (equipment +
abilities + restrictions + time) at 0 CZK running cost. AI arrives as a visible
upgrade, not as a patch.

**Measurement (Plausible/Umami, disclosed in the terms):** landing → wizard
start → wizard completion → plan reveal → 1st workout start → 1st workout
completion → return within 7 days → 3+ workouts.

**Phase 1 go/kill criteria (after ~50 users):**

- Wizard completion > 70% of those who started it.
- Completed 1st workout > 40% of completed wizards.
- Return for another workout within 7 days > 30%.
- **Go:** numbers met → build phase 2. **Kill/fix:** returns < 15% → don't build
  the backend, fix the product/audience.

---

## 2. PHASE 2 — backend + monetization (Supabase + Stripe + AI coach)

### 2.1 Accounts: sign-in ALWAYS as the first step, one path (final, 3rd and last revision)

**Replaces "wizard first, sign-in only before the plan reveal"** (kept collapsed
below for history). Reason for the third revision: that variant demanded, for
one benefit (the psychology of "invested time, will finish sign-in too"), four
separate patches — a localStorage wizard draft, the exact order of clearing it,
handling a cross-device magic link (email opened on a different device than
where the wizard was filled), and giving an existing account priority when
signing in on a new device (otherwise a freshly filled wizard would overwrite
existing history). Four necessary exceptions for one decision is a signal that
the cost outweighs the benefit — especially when sign-in itself (Google One Tap)
is nearly frictionless. The classic advice "defer sign-in" arose in the context
of email+password forms (real friction); with a single tap the benefit of
deferring is negligible.

1. **Flow (single path, no exception):** Landing → one "Začít zdarma" button →
   sign-in (Google One Tap primarily, Apple at the top on iOS, email magic link
   as backup) → the app detects new/returning from identity → new proceeds to
   the wizard (equipment/body/experience/goal) → plan reveal; returning goes
   straight to their existing plan/home.
2. **This makes all four patches vanish at once:** no localStorage draft
   (nothing is filled before sign-in, nothing to lose or order the clearing of),
   no cross-device risk with the magic link, no collision with an existing
   account (detected right at sign-in, not after a pointlessly filled wizard),
   the landing has only ONE button — no second silent "already using the app"
   link.
3. **Session persistent by default** (weeks–months, silent refresh) — no "keep
   me signed in" checkbox.
4. **Multi-device works automatically and trivially** from the first second —
   the same identity on any device = the same `user_id`, no special cases.
5. Facebook/Microsoft/passwords don't exist. Passkeys deferred (Supabase can't
   do it natively yet) — returns are handled by the persistent session + One
   Tap.
6. **The magic link stays the weakest method** (leaving the app for email) —
   keep it as a backup option, not an equal one.
7. **Honestly accepted cost:** a small share of landing visitors leave right at
   the sign-in prompt without even trying the app — the exact size of this leak
   will be learned only from real post-launch data, not now. A possible future
   lever (only per data, not now): an A/B test with an "explore the app without
   signing in" link for the most hesitant segment.
8. **Impact on copy:** the landing "Bez registrace" (No registration) stays
   replaced with "Přihlášení na 1 klepnutí" (Sign in with 1 tap); the "Už appku
   používáš? Přihlásit se" (Already using the app? Sign in) link is REMOVED from
   the landing — no longer needed, the single button handles both situations.
9. **Landing CTA copy vs. the sign-in screen (clarified):** the landing button
   stays "Začít zdarma" (Start for free) (a standard pattern across SaaS —
   Notion/Figma/Linear — it signals PRICE/zero fee, not the sign-in mechanic;
   "Přihlásit se" (Sign in) as the ONLY button would read wrong for the vast
   majority of new/organic visitors — it implies they already know the app,
   which is true only for a minority). The actual sign-in screen
   (Google/Apple/email, shown right after clicking) must have a NEUTRAL title —
   "Pokračovat do Strictic" (Continue to Strictic), not "Zaregistrovat se" (Sign
   up) nor "Přihlásit se" (Sign in) — because it serves new and returning
   identically.
10. **The landing must be session-aware (new item):** an existing/returning user
    (even a paying Plus one) can land on `strictic.com` again (an old link, a
    Google search instead of opening the installed app, a deleted home-screen
    icon…) — at that moment "Začít zdarma" would be nonsensical to the point of
    embarrassing. Solution: on load the landing checks for a valid session
    (server-side via the Supabase cookie, for zero flicker) and ALL main CTA
    buttons (header, hero, final section) switch per state:
    - not signed in → "Začít zdarma" → sign-in → wizard/home per new/returning,
    - already signed in → "Otevřít appku" (Open the app) / "Pokračovat do
      aplikace" (Continue to the app) → straight home, no re-sign-in, no "free"
      in front of a paying user. A standard pattern (Notion, Linear and other
      marketing pages over an app behave the same). It doesn't affect the rest
      of the page (pitch/FAQ/pricing stay visible unchanged) — only the action
      buttons.
11. **A third state (not just signed in/out): an unfinished wizard.** A new user
    signs in, starts the wizard, closes the app midway. On return (the cookie
    recognizes them) the app must not check just "signed in?" but "has a
    completed profile/plan?" — if not, it resumes the wizard exactly where it
    stopped, never shows an empty/broken home. A trivial addition (one extra
    condition), not new architecture.
12. **Known, accepted risk: switching providers between devices.** An account
    created via Google on device A, then "Continue with Apple" on device B →
    without linking the app creates a second empty account (Google and Apple are
    independent identities). Mitigation: enable Supabase automatic linking by
    VERIFIED email (covers the case where Google and Apple return the same
    email). It fails when the user uses Apple "Hide My Email" (a different inbox
    than reality) — in that case a duplicate account arises. **The impact is
    limited and recoverable:** the original account with all data stays intact
    and available, just temporarily inaccessible until the person signs in with
    the correct original provider — confusing, not destructive. This is a risk
    the industry generally accepts for multi-provider sign-in (no app has it
    100% solved), not a specific Strictic design flaw. No special extra UI for
    v1 — just enable auto-link by email.

<details><summary>Decision history — 2nd revision: "wizard first, sign-in only before plan reveal" (no longer valid)</summary>

It replaced the anonymous-first design (see below), but gradually demanded four
patches: a localStorage wizard draft with an exact clearing order (after
confirmed server save, not earlier), handling a magic link opened on a different
device than the wizard, giving an existing account priority when signing in on a
new device (otherwise history is overwritten by a fresh wizard), and two entry
points on the landing (a large CTA for new + a small link for returning).
Dropped in the 3rd revision because four necessary exceptions for one decision
outweighed the benefit, which is further weakened by the low friction of Google
One Tap.

</details>

<details><summary>Decision history — 1st revision: anonymous-first design (no longer valid)</summary>

1. Silent `signInAnonymously()` (Supabase) on the first valuable action, not on
   page open.
2. Pinning identity (Google One Tap / Apple / magic link) at 3 moments: after
   the ~3rd workout, second device, payment (mandatory).
3. Edge-case merging of two non-empty anonymous accounts + edge-case identity
   collision + a proactive "Sync" in settings — the motive for reversing the
   decision.

</details>

### 2.2 Payment (exact flow)

Tap on Plus → (if identity isn't pinned → One Tap, 1 tap) → Stripe Checkout
(7-day trial, card upfront, annual preselected) → webhook
`checkout.session.completed` → `subscriptions` table at `user_id` → the client
asks the server (`/me/entitlements`) at startup and after returning from
Checkout. Never trust the client. **Turn on Stripe Tax from day one** (EU VAT on
digital services per the customer's country — otherwise OSS catches up with
you).

### 2.3 AI coach (per spec) — who, when, for how much

- Generation: 1× free per account (a flag in the DB), then Plus (4
  regenerations/month fair-use). Regeneration preserves progress (weight mapping
  via `exercise_id`) and shows a **diff of "what changed and why"** — visible
  subscription value.
- Coach: 3 messages free per account, Plus 100/month fair-use.
- Mask latency: fire the AI request immediately on submitting the last wizard
  step; the deterministic plan is computed meanwhile as an instant fallback.

---

## 3. Protection against API costs (7 layers)

1. **The free core is deterministic** → ~90% of users cost you nothing for AI,
   ever.
2. **AI endpoints only for accounts** (even anonymous) and **counters on the
   server** (1 gen / 3 messages) — never in the client; the client can always be
   bypassed.
3. **Prompt caching** (system + catalog constant) → generation ~0.3–0.5 CZK, a
   coach message ~0.2–0.4 CZK. The coach gets **compressed context** (a profile
   summary + recent workouts, not the whole history); a `max_tokens` cap on
   both.
4. **Model tiering:** the strong model only for plan generation (and after a
   golden-set test try the mid tier); the coach on the mid tier from the start.
5. **Rate limits:** per-user (e.g. 5 AI actions/min, 30/day), a per-IP limit on
   creating anonymous accounts (anti-farming), and a **global daily budget with
   a kill-switch** (a flag in the DB → AI features turn off, the app keeps
   running deterministically) + a spend alert at the API provider.
6. **Fair-use in the terms** for Plus and lifetime (numbers above) — without it,
   lifetime is an open position.
7. **Economics on numbers** (verifying it works out): 1,000 free users/mo ≈
   1,000 generations × 0.5 CZK + 3,000 messages × 0.3 CZK ≈ **1,400 CZK of
   cost**. 30 payers × 119 CZK = 3,570 CZK; their consumption ~600 CZK.
   **AI-cost break-even ≈ 12 payers per 1,000 free** — well below realistic
   conversion (see §5). The fees won't eat you; the only thing that would is an
   unprotected (unauthenticated, unlimited) endpoint — hence layers 2 and 5.

---

## 4. Free vs Plus (final cut)

|                                                                              | Free (forever)                     | Plus (119/mo · 990/yr · 7-day trial)     |
| ---------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------- |
| Tailored plan (equipment, abilities, restrictions, time)                     | ✅ deterministic                   | ✅ + AI reads the goal in your own words |
| Workout, progression, progress, sharing                                      | ✅ all                             | ✅                                       |
| Offline                                                                      | ✅                                 | ✅                                       |
| First AI plan                                                                | ✅ 1×                              | ✅                                       |
| Plan revision/regeneration (milestones, plateau, new equipment, goal change) | —                                  | ✅ (fair-use 4/mo)                       |
| Coach (chat)                                                                 | 3 messages                         | ✅ (fair-use 100/mo)                     |
| Cross-device sync + cloud backup                                             | backup silently yes (anon account) | ✅ full sync                             |

**Paywall moments** (contextual, see spec 12.3): stuck-detector (highest intent)
→ equipment change → ~6-week milestone → goal change → second device. After the
plan reveal, only a non-intrusive awareness screen.

---

## 5. Funnel + benchmarks (what "good" is)

| Step                   | Metric                         | Target                        |
| ---------------------- | ------------------------------ | ----------------------------- |
| Landing → wizard start | main CTA CTR                   | > 40% (mobile)                |
| Wizard                 | completion                     | > 70%                         |
| Reveal → 1st workout   | start                          | > 60%                         |
| Activation             | completed 1st workout / wizard | > 40%                         |
| Retention              | return within 7 days           | > 30%                         |
| Habit                  | 3+ workouts                    | > 20%                         |
| Paywall → trial        | with card                      | 8–15% of views                |
| Trial → paid           |                                | 40–60%                        |
| Churn                  | monthly                        | < 10%                         |
| Total free → paid      | active users                   | **2–5% = a realistic target** |

Always optimize the **leakiest step**, not everything at once. Without
instrumentation, nothing gets optimized.

---

## 6. Launch checklist (phase 1)

- [ ] Real domain (replace `strictic.com` in SHARE_URL + landing +
      sitemap/robots/canonical/JSON-LD)
- [ ] Landing ↔ app connected (CTA "Začít zdarma" → /app), OG image 1200×630,
      favicon
- [ ] Legal pages (privacy, terms — the footer is 404 now) + a mention of
      analytics
- [ ] Plausible/Umami + 8 events
- [ ] Search Console + sitemap
- [ ] Phase 1 wizard (chips + restrictions) + the deterministic engine with the
      rules from the spec
- [ ] 20–50 first users (communities, acquaintances, CZ fitness forums/FB
      groups) — manually, personally
- [ ] Weekly metric review against the go/kill criteria

---

## 7. What NOT to do deliberately

- A hard gate after the plan reveal (spec 12.7 — a lever in reserve, not the
  default).
- Backend/Stripe before phase 1 data.
- A/B tests under ~1,000 visits/variant (noise, not signal).
- False urgency, fake discounts, crippling the free version — it breaks the only
  real competitive advantage (trust).
- Another round of planning. The plan is done; further improvements come from
  data.
