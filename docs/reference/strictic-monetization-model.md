# Strictic — monetization model

> **Decision in one sentence:** Freemium with an **annually-led subscription**,
> sold **on the web via Stripe**, with a **daily fair-use cap** on the AI coach.
> Not credits.

This model yields the highest LTV, is understandable on first read, and protects
the AI margin — without breaking the "radical honesty" brand.

> Note: Czech UI strings in quotes (paywall/reminder copy) are actual product
> copy — keep them verbatim.

---

## 1. Chosen model: freemium subscription (annually-led)

**Free forever**

- Set logging, automatic progression, equipment editor, progress overview.
- Builds the habit, keeps the brand promise, and **costs practically nothing**
  (no AI calls).

**Strictic Plus (subscription)**

- AI coach + advanced features.
- The coach has a **generous daily cap** (~20 messages/day) — a normal user
  never hits it, but it protects the margin against a "chatty" power user.
- **Resets daily**, no balance counting, no anxiety. (This is the good part of
  the "credit" intuition, dressed as something that doesn't hurt.)

**Key principle:** what costs you money (AI) is behind payment; what's free
costs you almost nothing. The margin is protected by design.

---

## 2. Why NOT credits

Credits look tempting ("every action pays for its AI cost"), but for a daily
coach they're a trap:

- **They kill the habit and engagement.** When a user weighs "am I wasting a
  credit?" on every message, they stop asking → stop logging → leave. And
  retention = money. You want the opposite: let them ask as much as possible.
- **They break the brand.** "No tricks" + counting pennies = a contradiction.
  Your persona can't bear it.
- **Worse LTV and higher friction.** Everyone understands a subscription.
  Credits have to be explained (what costs what, how much is left) → worse
  conversion.

**Credits make sense only** for one-off AI tools ("generate an image for 5
credits" and gone). Strictic is a relationship, not a one-off.

---

## 3. Fair-use cap on the coach (margin safeguard)

- Plus = a fair daily limit (roughly ~20 messages/day), daily reset.
- Communication neutral, not punishing: show "today's messages with the coach"
  as calm information, not a countdown.
- **Technically:** route 90% of queries to a cheap model (Haiku-class), switch
  to the expensive model only for complex things. Enforce the limit **on the
  server** (the client can be bypassed).

---

## 4. The twist that lifts profit the most: web billing via Stripe

**Sell the subscription on the web via Stripe, not through the App Store /
Google Play.**

| Channel                 | Commission |
| ----------------------- | ---------- |
| App Store / Google Play | **15–30%** |
| Web (Stripe)            | **~3%**    |

Because you're building a web PWA, you can charge on the web and keep **~97%
instead of 70–85%.** That's **+15–30% net profit out of nothing** — more than
any credit system will ever bring.

**Flow:** acquire the user on the web → subscription via Stripe → PWA to the
home screen. You bypass the store cut.

> Note: watch platform rules if you also put the app in stores (Apple/Google
> restrict linking to external payment). With web-first PWA distribution you
> avoid it.

---

## 5. Pricing (proposal)

| Plan       | Price                 | Role                                   |
| ---------- | --------------------- | -------------------------------------- |
| Monthly    | ~119–129 CZK/mo       | anchor (shows that the year is a deal) |
| **Annual** | **~990–1,290 CZK/yr** | **main, default** (≈ 83–108 CZK/mo)    |
| Lifetime   | ~1,990 CZK            | optional, cash now                     |

Position vs. the market: cheaper than Fitbod, dearer than bare loggers —
justified by the AI coach. Around 68% of revenue in the fitness category comes
from annual plans (RevenueCat 2026), hence annually-led.

---

## 6. Trial + honest reminder (the conversion core)

- **7 days free** as the main paywall action.
- Brand hook: _„Den před koncem ti připomeneme — nezaplatíš omylem."_ (= "We'll
  remind you the day before it ends — you won't pay by mistake.")
- **This reminder must actually be delivered** (Stripe webhook → email/push the
  day before charging). Otherwise it's a lie and it kills the trust the brand
  rests on.
- Onboarding decides everything: ~55% of trial cancellations happen on day 0
  (RevenueCat 2026). You must show value in the first minute (the goal in
  onboarding, a quick "quick win").

---

## 7. Optional overflow (the only place for a credit mechanic)

If someone hits the coach's daily cap:

> „Dnešní limit vyčerpán — pokračuj zítra, nebo si dokup balíček na dnešek." (=
> "Today's limit reached — continue tomorrow, or buy a pack for today.")

A safeguard for ~1% of power users, **not the basis of the model**. Small
supplementary income, doesn't threaten clarity.

---

## 8. Competition (Strictic's position)

| App          | Price/yr            | What it does                                        |
| ------------ | ------------------- | --------------------------------------------------- |
| Fitbod       | ~$96 (~2,200 CZK)   | AI plans, premium incumbent, no permanent free tier |
| Strong       | ~€30 (~750 CZK)     | logging only, doesn't generate programs             |
| Hevy         | ~€25 (~620 CZK)     | tracking only, no AI plans                          |
| **Strictic** | **~€43 (~990 CZK)** | **AI coach + plan + honest nutrition**              |

Strictic's real wedge: **honest integrated nutrition/supplements** (nobody does
it properly) + **home minimalism**. Fitbod runs EN/ES/PT only — EN+CZ opens up
the Europe it ignores.

---

## 9. Realistic revenue (after 12–18 months of work)

Fitness is the best-monetizing category (highest revenue per install, P90
~$4.19; RevenueCat). But the market is uneven: **only ~4.6% of apps reach $10K
MRR within 2 years.**

| Scenario                 | Chance  | MRR                         |
| ------------------------ | ------- | --------------------------- |
| Doesn't catch on (model) | ~60–70% | **2,000–20,000 CZK/mo**     |
| Decent side income       | ~20%    | **20,000–80,000 CZK/mo**    |
| Breakout (top ~5%)       | ~5%     | **100,000–700,000+ CZK/mo** |

Tied to the funnel: ~500 downloads/mo × ~3% conversion × ~12 mo lifetime ≈ ~180
payers ≈ ~15,000 CZK/mo. For 80,000 CZK you need ~2,000 downloads/mo
**sustained** — a lot for a solo dev with no ads.

---

## 10. What actually moves the money (growth levers)

1. **Progress share cards = a growth engine, not decoration.** Without an ad
   budget, the viral loop is the #1 source of downloads. An honest "real number"
   instead of a vanity chart = a shareable differentiator.
2. **EN first, CZ as the home test.** Czechia (10M) has a low ceiling; the
   volume is in English.
3. **SEO** — slow, but compounding (6–18 months).
4. **Social login** (Google/Apple/FB) = a necessity to reduce friction, not an
   advantage.
5. **Retention > acquisition.** Annual plans: top retention 50–60% after a year,
   median ~44%; ~30% cancel in the first month. The first renewal is the biggest
   churn point.

---

## 11. Two margin warnings

- **The AI coach is a margin trap.** Every message costs money, free users
  generate cost without revenue. The fix: fair-use cap + a cheap model for
  most + hard server-side enforcement.
- **AI alone isn't enough.** Most AI apps have decent revenue per install, but
  **differentiation** decides, not the "AI" label. Honesty and nutrition must be
  _felt_, not just claimed.

---

## Summary

- **Model:** freemium annual subscription (not credits) — highest LTV, max
  clarity.
- **Margin safeguard:** a daily fair-use cap on the coach — solves exactly what
  made credits tempting, without anxiety and without breaking the brand.
- **Profit lever #1:** web billing via Stripe → **+15–30% margin** vs. the
  stores.
- **Conversion:** a 7-day trial with an actually-delivered reminder + onboarding
  that shows value in the first minute.
- **Growth:** share cards + SEO + EN-first.

_Benchmark sources: RevenueCat State of Subscription Apps 2025/2026; public
pricing of Fitbod / Strong / Hevy (2026)._
