# Strictic — backlog

> Living document: ideas and improvements to fold in over time. Status: ☐
> proposed · ⏳ up next None of this is in the MVP scope — the MVP is defined by
> STRICTIC-MVP.md. This is what comes after.
>
> Note: Czech strings in quotes are actual product copy — keep them verbatim.

---

## Priority 1 — soon after the MVP (cheap, improves progress visibility)

- ☐ **"Last time" line on an exercise** — e.g. _„minule: 18 kg × 12, 12, 11"_. A
  standard people know from Strong/Hevy; the new target then has context. The
  best single readability improvement.
- ☐ **Progress toward an increase** — _„2 ze 3 sérií na 12 — ještě jednou a
  zvedáme"_. The system is legible, the user understands why the app holds or
  raises the weight.

## Priority 2 — bigger impact, more work

- ☐ **"How did it go?" after an exercise (RPE) → autoregulation** — 3 buttons
  _lehké / akorát / těžké_ (easy / just right / hard) after finishing an
  exercise. On "hard", don't increase even at 12 reps; on repeated "easy",
  increase sooner. Real progression quality over blind rep counting, fits the
  brand (real effort, not vanity). In the full version the AI coach uses it
  better.
- ☐ **Weekly honest summary** — a short _„tvůj týden"_ (your week) once a week:
  volume, what went up, consistency. A reason to return + a shareable moment.
- ☐ **Honest personal records (PR)** — a new working weight on an exercise → a
  clean _„nový osobní rekord"_ (new personal record) moment (real, not made up).
  Satisfaction + material to share.

## Priority 3 — web/full version (needs a server or accounts)

- ☐ **Cloud sync + sign-in** (Google / Apple / Facebook) — the end of worrying
  about data.
- ☐ **Push reminders** 3× a week — honestly, without nagging.
- ☐ **Rep-progression for bodyweight exercises** (pull-ups, ab wheel) — the "add
  weight" model doesn't fit them; needs a second progression track.
- ☐ **Server-side coach** (`/api/coach`) — key on the server, rate-limit,
  free-limit enforcement (the client can be bypassed).
- ☐ **Stripe web billing** + trial + an actually-delivered reminder the day
  before charging.
- ☐ **AI coach as plan author** — from goal, equipment and level (and ongoing
  results) it proposes exercises, weights, sets, reps, rests, volume and the
  progression scheme. Deterministic double-progression stays as the engine that
  progresses the plan between workouts (the AI gives the start, the mechanics
  raise). The user can override everything manually — honesty, not dictate. The
  core of the LLM-native app and the biggest difference from Strong/Hevy.
- ☐ **Reps and volume by goal** — 3 modes (strength → low reps, heavy weights ·
  growth → medium · conditioning → higher reps, more volume). Rests by goal are
  already handled by the engine. The rest only with the AI coach as plan author.
  No pseudo-precision.
- ☐ **Live conversational plan adjustment** — _„bolí mě rameno"_ (my shoulder
  hurts) → swaps exercises · _„mám 20 minut"_ (I have 20 minutes) → shortens the
  workout · _„dnes nemám sílu"_ (no strength today) → eases off. The plan adapts
  to real life via chat. A killer LLM-native feature — it means the user
  actually trains instead of skipping.
- ☐ **Adaptive deload** — when a workout struggles 3× in a row, the coach
  proposes a lighter week or a technique check. Breaks the plateau → frustration
  → churn spiral.
- ☐ **Honest nutrition layer** — a simple protein/calorie target integrated with
  training, without pushing supplements. The main differentiator (training +
  nutrition honestly together is rare).

---

## Accessibility & design — to resolve during the port

> Goal: WCAG 2.2 AA as the floor, AAA where it works without breaking the design
> tokens. Most of these rules are already anchored in CLAUDE.md and enforced by
> ESLint (jsx-a11y) — this is what the linter can't check.

- ☐ **Semantics and landmarks** — build screens on `<main>`, `<h1>/<h2>`,
  `aria-current` on active elements, not on styled `<div>`s.
- ☐ **Smallest fonts** — a lower bound of ~11–12 px (legibility and scanning;
  use the `--text-2xs` = 10 px token only for genuinely marginal labels).
- ☐ **Accent for one primary action per screen** — orange reserved for the
  primary CTA, so accent fatigue doesn't set in and the CTA stands out more.
- ☐ **Trust layer in the paywall** — privacy, "your data stays with you", an
  honest frame. A conversion lever, not a color.
- ☐ **More air in dense lists** — a slightly larger line rhythm improves
  readability and perceived quality.

> Note: the biggest conversion levers are not in the looks, but in a clear value
> prop on the first screen, a working coach, trust and less friction. Looks are
> secondary tuning.

---

## Phase 3 — affiliate recommendations

See STRICTIC-MARKETING.md §5 for the full rules. Summary:

- ☐ Equipment and supplements the founder uses himself, with evidence levels
  stated plainly (creatine strong evidence; protein = convenient food;
  omega/D3/magnesium situational). No health claims.
- ☐ Visible disclosure on every link + add a sentence about commissions to the
  manifesto on the landing.
- ☐ Partners per market: CZ = GymBeam/Alza (Amazon doesn't work in CZ), EN/DE =
  Amazon OneLink.
- ☐ Launch only after go/kill is met and with content pages running — earlier it
  has nothing to earn.

---

## Phase 3 — native distribution (Android → iOS)

Extending from PWA to app-store channels, once the app runs and proves
retention. Android first (cheap, fast), iOS after traction is confirmed.

### Android / Google Play (~1 afternoon technically)

- ☐ **Bubblewrap** or **PWABuilder** wraps the PWA into a **Trusted Web
  Activity** — the app is a window into strictic.com via the full Chrome engine,
  no address bar. Web updates propagate automatically.
- ☐ Prerequisites (the Stage 7 PWA meets them): HTTPS, manifest, service worker,
  icons 192/512, Lighthouse ≥ 80.
- ☐ `assetlinks.json` on strictic.com (proves ownership — otherwise the app runs
  with an address bar).
- ☐ Google Play Developer account — one-time $25.
- ☐ **Fees:** Google Play in principle requires Play Billing (~15/30%) for
  in-app payments. Same solution as iOS below — the app doesn't handle payment,
  the subscription is bought on the web.

### iOS / App Store (dearer, slower)

- ☐ Apple rejects a "wrapped website" — **Capacitor** is required (a native
  wrapper with a WebView). The app (workout, offline, charts) easily meets the
  minimal-functionality requirement.
- ☐ Apple Developer Program — $99/yr. Needs a Mac (Xcode) or cloud CI. Stricter
  and slower review.
- ☐ **Payments:** selling inside an iOS app typically requires Apple StoreKit
  and its cut. **Solution:** the app has no payment inside — sign-in + workout
  work, the subscription is bought on strictic.com in the browser. Preserves the
  Stripe economics, solves the fees on both platforms at once.

### When

Only after Stage 7 (PWA done) and ideally after go/kill retention is confirmed.
