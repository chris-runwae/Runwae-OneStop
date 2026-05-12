# Phase 2.5 — Test recipe (start here)

> Read this first. Everything Phase 2.5 needed to ship is in code; this doc is the recipe for getting it live in front of you and confirming events + funnels in PostHog.

## What's in code right now

- **Stream A Commit 2** (already done in the previous session) — 4 client events wired in mobile: `signin_failed`, `trip_viewed`, `itinerary_item_added`, `booking_started`.
- **Stream A Commit 3** (this session) — 7 server events wired in Convex: `signup_completed`, `signin_succeeded`, `first_trip_created`, `first_invite_accepted`, `onboarding_completed`, `booking_completed`, `booking_failed`.
- **Stream B foundation** (this session) — i18next initialised on mobile with 7 locales loaded, locale picker on Profile → Appearance, server-side `users.locale` persistence via `LocaleSync`. Strings still hardcoded (extraction is Phase 6.5) — switching locales swaps formatters and re-renders the picker selection, but UI copy stays in source until extraction.

All changes are OTA-able. No new native modules. No `eas build` required.

The previous "Live Events miss" you hit was simply that **none of the new analytics code is deployed yet**. TestFlight is still running pre-analytics `main`. The steps below ship it.

---

## Step 1 — Set the two missing env vars (5 min, one-time)

**On Convex** (dev deployment is enough to test):

```bash
cd packages/convex
npx convex env set POSTHOG_API_KEY phc_<your_project_api_key>
# Optional — defaults to https://eu.i.posthog.com. Set only if your PostHog project is on US cloud or self-hosted.
# npx convex env set POSTHOG_HOST https://us.i.posthog.com
```

The project API key is the same `phc_…` key you put in `EXPO_PUBLIC_POSTHOG_KEY` for the client. PostHog accepts the same key for server `/capture/` calls.

**On EAS** (only if not already set per the handover claim at line 59 of `phase-2.5-and-4-handover.md`):

Check the EAS dashboard → Project settings → Environment variables → `preview`. Confirm `EXPO_PUBLIC_POSTHOG_KEY` is set. If it isn't, set it.

If your PostHog project is on US cloud (not the EU default the code uses), ALSO set `EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` in EAS preview env. Otherwise mobile events go to EU and US dashboards see nothing.

---

## Step 2 — Ship the code (10 min)

**Push the OTA to TestFlight preview:**

```bash
cd apps/mobile
eas update --branch preview --platform ios --message "Phase 2.5: client + server analytics + i18n foundation"
```

⚠️ `--platform ios` is required. Without it, `eas update` bundles all platforms including web, and the web bundler chokes on `@stripe/stripe-react-native`'s native-only internals (it's reachable from `flights/book/payment.tsx` via `utils/stripe-safe.tsx`). Pre-existing; will be fixed by gating the Stripe import behind `Platform.OS` in a separate commit.

This OTAs the analytics code into your TestFlight build. On the device, force-quit the app and reopen — Expo Updates will fetch the new bundle on next launch.

**Deploy Convex backend to DEV:**

```bash
cd packages/convex
npx convex dev --once
```

⚠️ **Don't run `npx convex deploy` without flags** — that's the PROD deploy command and will prompt you to push to `abundant-pika-833`. We want dev (`joyous-yak-612`) for testing.

When you're ready to ship to prod (later, deliberately), the sequence is:

```bash
# Set prod env vars FIRST
npx convex env set --prod POSTHOG_API_KEY phc_<key>
npx convex env set --prod AUTH_APPLE_AUDIENCES "app.runwae.io,app.runwae.preview,app.runwae.dev"
# Then push
npx convex deploy
```

This is also when the deferred `apple-native` provider work from [docs/phase-2.5-and-4-handover.md:57](phase-2.5-and-4-handover.md) lands on prod, so plan a deliberate window.

---

## Step 3 — Test in-app, watch PostHog Live Events

Open PostHog → Activity → Live Events in one window. Trigger the following on the device and confirm each event appears within ~5s:

| Action | Expected event | Properties |
|---|---|---|
| Sign in with wrong password | `signin_failed` | `provider: "password"`, `error_code: "InvalidSecret"` |
| Tap Apple sign-in then cancel | `signin_failed` | `provider: "apple"`, `error_code: "cancelled"` |
| Sign up with a fresh email + verify OTP | `signup_completed` | `provider: "password"` |
| Sign in with existing creds | `signin_succeeded` | `provider: "password"` |
| Complete the 5-step boarding flow | `onboarding_completed` | (no properties) |
| Create your first trip on this account | `first_trip_created` | (no properties) |
| Open that trip | `trip_viewed` | `trip_id_hash` (64-char hex) |
| Add a flight to the itinerary | `itinerary_item_added` | `item_type: "flight"` |
| Add a restaurant to the itinerary | `itinerary_item_added` | `item_type: "experience"` (restaurant flattens) |
| Tap "Book" on a hotel room | `booking_started` | `type: "hotel"`, `amount_gbp: <number>` |
| Complete a hotel/event-ticket payment | `booking_completed` | `type`, `amount_gbp` |
| Trigger a payment that fails (Stripe test card `4000 0000 0000 9995`) | `booking_failed` | `type`, `failure_reason: "stripe_payment_failed"` |
| Accept a trip invite (have a friend invite you, or invite a test account) | `first_invite_accepted` | (no properties) |

Every event should also carry the super-properties `app_release`, `app_dist` (the 8-char OTA id), and `app_variant` (`preview`).

If `app_dist` shows `"embedded"`, you're still on the old build — the OTA hasn't activated. Force-quit and reopen the app. Check the new OTA pill on Profile to confirm.

---

## Step 4 — Build the funnel insight in PostHog (5 min)

This is the artefact the handover lists as the final verification gate:

1. PostHog → Product analytics → Insights → **New insight**
2. Type → **Funnel**
3. Step 1: Event = `signup_completed`
4. Step 2: Event = `first_trip_created`
5. Step 3: Event = `booking_completed`
6. Top-right date range → Last 7 days (so your test session shows up)
7. Save as **"Activation → Conversion funnel"**
8. Pin to a new dashboard called **"Runwae Launch — Phase 2.5"**

Optional add-ons to the same dashboard:
- Trend: `signin_failed` count, broken down by `error_code` — catches auth-flow regressions
- Trend: `itinerary_item_added` count, broken down by `item_type` — what kind of plans users build
- Trend: `booking_started` count vs `booking_completed` count — hotel-room conversion proxy

---

## Step 5 — Sanity: test the locale picker

1. Open the app → Profile → Appearance.
2. Scroll past the theme picker; you should see a "Language" section with 7 radio rows: English (UK), English (US), Français, Español (México), Español (España), Português (Brasil), Italiano.
3. Tap one. The selection should update instantly.
4. Convex `users.locale` should now hold the picked tag. Verify with `npx convex run --no-push users:getCurrentUser` (or open Convex dashboard → Tables → users → your row).
5. Close and reopen the app. The picker should remember your choice (it reads `users.locale` via `LocaleSync`).
6. **UI strings still display in English** — that's expected; string extraction lands in Phase 6.5.

---

## Things to flag back to me

After your test session, let me know:

1. Did every row in Step 3 produce its event? Any misses?
2. Is the funnel-conversion artefact saved in PostHog?
3. Did the locale picker remember your choice across an app restart?
4. Any `signin_failed` events with `error_code: "unknown"` — if so, paste the Sentry context so we can extend `extractAuthErrorCode`.

Once that's confirmed, Phase 2.5 is officially closed and we can pick up Phase 4 (manual auth test matrix) or Phase 5 (web placeholder pages) next.

---

## If something doesn't fire

Quick triage:

- **No events at all from mobile** → check `EXPO_PUBLIC_POSTHOG_KEY` in EAS preview env. Without the key, `lib/analytics.ts` becomes a no-op singleton.
- **No events at all from server** → check `POSTHOG_API_KEY` on the Convex deployment with `npx convex env get POSTHOG_API_KEY`. Without it, `lib/posthog.ts` `serverTrack` no-ops silently.
- **Events fire but don't appear in dashboard** → host/region mismatch. Code defaults to EU; if your project is US, set `POSTHOG_HOST` on Convex AND `EXPO_PUBLIC_POSTHOG_HOST` on EAS.
- **`signup_completed` fires but `signin_succeeded` doesn't on subsequent sign-in** → check whether Convex auth's `args.existingUserId` is being populated. The `apple-native` provider relies on its own account-lookup logic in `lib/appleNative.ts`; if it can't find the account, it falls back to "new user" semantics.

Files to grep through if needed:
- [`apps/mobile/lib/analytics.ts`](../apps/mobile/lib/analytics.ts) — client singleton, identify/reset
- [`packages/convex/convex/lib/posthog.ts`](../packages/convex/convex/lib/posthog.ts) — server capture action
- [`docs/analytics-events.md`](analytics-events.md) — the contract; everything that fires is in here
