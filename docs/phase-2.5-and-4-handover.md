# Phase 2.5 + Phase 4 Handover (and beyond)

> **For the new Claude session picking this up:** You have no prior conversation context. Read this doc end-to-end before touching anything. It's self-contained.

> **Read these too, in order:**
> 1. [`docs/launch-readiness-spec.md`](launch-readiness-spec.md) — the full 8–12 week plan.
> 2. [`docs/phase-3-handover.md`](phase-3-handover.md) — the Phase 3 brief (most of which is now done).
> 3. [`docs/beta-test-guide.md`](beta-test-guide.md) — what the beta group is being asked to verify; the technical appendix at the bottom captures non-obvious gotchas.

---

## What's already done (this session and before)

Merged into `main` via PR [#24](https://github.com/chris-runwae/oneStop/pull/24):

**Phase 3 #1 — Apple Sign-In iOS** ✅
- Native iOS Apple sheet via `expo-apple-authentication.signInAsync()` ([apps/mobile/hooks/useAuth.ts](../apps/mobile/hooks/useAuth.ts) → `signInWithApple`)
- Apple credential-revocation listener ([apps/mobile/hooks/useAppleCredentialsRevoke.ts](../apps/mobile/hooks/useAppleCredentialsRevoke.ts), wired in [apps/mobile/app/_layout.tsx](../apps/mobile/app/_layout.tsx))
- Custom `apple-native` ConvexCredentials provider that validates Apple ID tokens against Apple's JWKS server-side ([packages/convex/convex/lib/appleNative.ts](../packages/convex/convex/lib/appleNative.ts))
- Spec at [docs/phase-3-apple-signin-spec.md](phase-3-apple-signin-spec.md)

**Phase 3 #3 — Specific location permission strings** ✅
- [apps/mobile/app.config.ts](../apps/mobile/app.config.ts) `expo-maps` plugin + `ios.infoPlist.NSLocationWhenInUseUsageDescription`

**Phase 3 #4 — Privacy data collection inventory (doc-only)** ✅
- [docs/privacy-data-collection.md](privacy-data-collection.md) — feed this into App Store Connect's App Privacy questionnaire and Play Console's Data Safety form when submitting

**Phase 3 #6 — Sentry init + release/dist tagging** ✅
- [apps/mobile/lib/sentry.ts](../apps/mobile/lib/sentry.ts) — initializes the SDK with `release` (version + OTA updateId) and `dist` (OTA updateId or "embedded")
- Side-effect imported at the top of `app/_layout.tsx`; default export wrapped via `Sentry.wrap`

**Phase 3 #7 — OTA channel verification + docs** ✅
- All EAS profiles have a `channel`. `runtimeVersion.policy: 'appVersion'`. Docs at [docs/mobile-ota-updates.md](mobile-ota-updates.md)

**Other Phase 3 work / polish landed in PR #24:**
- `chore: hoist babel + eslint deps` — [`/.npmrc`](../.npmrc) — fixes `eas update` + metro bundling under pnpm strict hoisting
- `feat(mobile): unify splash screens to black + add subtle animation` — both OS splash (in `app.config.ts`, native; needs next EAS build to take effect) and the in-app `SplashScreen` ([apps/mobile/components/ui/splash-screen.tsx](../apps/mobile/components/ui/splash-screen.tsx))
- `chore(mobile): polish` — exposed the existing **Delete Account** flow in the Security menu (Profile → Security → Delete account); replaced the hardcoded "Updated: March 2026" with `Updates.createdAt`; fixed the white-edge nav transition by setting `Stack.contentStyle.backgroundColor`; removed debug breadcrumbs
- `scripts/generate-apple-secret.mjs` — Node-only script for the 6-month `AUTH_APPLE_SECRET` JWT rotation. Reads a `.p8` key path via env var

**Deferred from Phase 3 by user direction:**
- **#2 — Android EAS submit profile** — needs Play Console listing + service-account JSON. Pick this up when Android matters.
- **#5 — Privacy Policy + Terms of Service URLs** — needs finalised legal text. Pick up when ready to submit to App Store / Play.

**Outstanding user-side actions (still required for launch):**
- App Store Connect → App Privacy questionnaire (use the [data-collection inventory](privacy-data-collection.md))
- App Store Connect → Privacy Policy URL (blocked by Phase 3 #5)
- App Store Connect → declare ATT exempt (don't add `NSUserTrackingUsageDescription` to `Info.plist`)
- Sentry dashboard → create the crash-free-session alert rule (see Phase 3 handover #6)
- Apple Developer Portal → group `app.runwae.preview` and `app.runwae.dev` under `app.runwae.io` as Primary App ID (so the Sign in with Apple key signs tokens for all variants)

---

## Current state of the codebase

- Branch: `main` at PR #24 merge (`db0fad17` or later)
- Convex deployments: dev `joyous-yak-612` (your personal) has `AUTH_APPLE_AUDIENCES`, `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, etc. **Production deployment has NOT had the new `apple-native` provider deployed yet** — when you deploy to prod, also set `AUTH_APPLE_AUDIENCES` on it: `npx convex env set --prod AUTH_APPLE_AUDIENCES "app.runwae.io,app.runwae.preview,app.runwae.dev"` then `npx convex deploy --prod`.
- TestFlight: `app.runwae.preview` build at v0.8.7 is current. Native splash colour change (`#000` always) needs a fresh `eas build --profile preview --platform ios` to take effect — until then, cold-launch in light mode briefly flashes white.
- EAS env (preview environment) has `EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_APP_VARIANT`, `SENTRY_AUTH_TOKEN` all set.

---

# Phase 2.5 — Analytics + i18n (weeks 2–4, parallel with Phase 4)

Two distinct streams under the same phase number. Do analytics first because it lights up Phase 4's testing telemetry.

## Stream A — Analytics

### Decisions already made

**Provider:** PostHog. Mobile via `posthog-react-native`. Backend (Convex) via `posthog-node`. Project key already in EAS env as `EXPO_PUBLIC_POSTHOG_KEY`.

**Open question for the new session to confirm with the user:**
- PostHog host URL — defaults to US cloud (`https://us.i.posthog.com`). If they're on EU cloud or self-hosted, set `EXPO_PUBLIC_POSTHOG_HOST` accordingly.

**The 11-event contract (tentatively approved by user; confirm before encoding):**

| Event | Where it fires | Properties | Why |
|---|---|---|---|
| `signup_completed` | Convex `auth:signIn` callback (createOrUpdateUser) | `provider: "apple" \| "google" \| "password"` | Acquisition |
| `signin_succeeded` | Convex `auth:signIn` callback | `provider` | Acquisition |
| `signin_failed` | Mobile `useAuth.ts` catch blocks | `provider`, `error_code` | Acquisition (server doesn't see all failures) |
| `first_trip_created` | Convex `trips.create` mutation, fires once per user | none | Activation |
| `first_invite_accepted` | Convex `trips.acceptInvite`, fires once per user | none | Activation |
| `onboarding_completed` | Convex `users.completeOnboarding` mutation | none | Activation |
| `trip_viewed` | Mobile trip screen mount | `trip_id_hash` (sha256 of trip id, never raw) | Engagement |
| `itinerary_item_added` | Convex itinerary mutation | `item_type: "flight" \| "hotel" \| "event" \| "experience"` | Engagement |
| `booking_started` | Mobile, when user taps "Book" | `type`, `amount_gbp` | Conversion funnel |
| `booking_completed` | Convex Stripe webhook handler | `type`, `amount_gbp` | Conversion (server-side for reliability) |
| `booking_failed` | Convex Stripe webhook handler | `type`, `failure_reason` | Conversion |

**Hard rules:**
- **No PII in event properties** — only the internal user ID. Never `email`, `name`, `phone`. PostHog joins user properties separately via `identify`.
- **Server-side wins** for high-value events (`booking_*`, `signup_*`, `signin_succeeded`, `first_*`, `onboarding_*`). Mobile can be lossy; Convex actions can't.
- **Event names are forever** — no renaming after first ship. Period.

### Implementation — 4 commits

**Commit 1: PostHog SDK install + init** (needs EAS rebuild — native module)

Files:
- `apps/mobile/package.json` — add `posthog-react-native@^4.0.0` (verify latest)
- `apps/mobile/lib/analytics.ts` (new) — initialize the client, expose typed `track()` + `identify()` wrappers
- `apps/mobile/app/_layout.tsx` — side-effect import + wrap with `<PostHogProvider>` if needed (check current SDK API), call `identify(user.id)` once on auth, `reset()` on signOut

The wrapper enforces the event registry — calling `track('made_up_event')` should be a TypeScript error. Implement via a discriminated union of allowed event names.

```ts
// apps/mobile/lib/analytics.ts (sketch)
type AnalyticsEvent =
  | { name: 'signin_failed'; properties: { provider: 'apple' | 'google' | 'password'; error_code: string } }
  | { name: 'trip_viewed'; properties: { trip_id_hash: string } }
  | { name: 'itinerary_item_added'; properties: { item_type: 'flight' | 'hotel' | 'event' | 'experience' } }
  | { name: 'booking_started'; properties: { type: 'hotel' | 'experience' | 'flight'; amount_gbp: number } };

export function track<E extends AnalyticsEvent>(event: E): void { ... }
```

The typed wrapper is the difference between analytics that lasts 6 months and analytics that lasts 6 weeks.

**Commit 2: Client-side events + the event registry doc** (OTA-able)

- `docs/analytics-events.md` (new) — the event registry: every event, its trigger, its properties, its retention guarantees. This is the contract; lock it in.
- Wire the 4 client-side events: `signin_failed`, `trip_viewed`, `itinerary_item_added`, `booking_started` (the rest are server-side in commit 3).

**Commit 3: Server-side events from Convex** (no mobile change; Convex deploy)

- `packages/convex/package.json` — add `posthog-node@^4.0.0`
- `packages/convex/convex/lib/posthog.ts` (new) — initialise a server PostHog client; expose `serverTrack(distinctId, event, props)`
- Wire 7 server-side events into the relevant Convex mutations / actions / webhook handlers:
  - `signup_completed` + `signin_succeeded` — `convex/auth.ts` `createOrUpdateUser` callback
  - `first_trip_created` — `convex/trips.ts` create mutation, gated on a "has user ever created a trip?" check
  - `first_invite_accepted` — `convex/trips.ts` join mutation
  - `onboarding_completed` — wherever `users.onboardingComplete` flips true
  - `booking_completed` + `booking_failed` — Stripe webhook handler at `apps/web/app/api/webhooks/stripe`
- Required Convex env: `POSTHOG_API_KEY` (different from the client key) + `POSTHOG_HOST` if not US cloud
- Use `await posthog.shutdownAsync()` in long-lived actions to flush events before they exit, or at minimum set `flushAt: 1` for low-traffic to avoid losing events

**Commit 4: Telemetry validation** (OTA-able)

- Trigger every event manually on the dev convex deployment
- Confirm in PostHog → Events that all 11 appear with correct properties and a real distinct ID
- Build a simple PostHog Insight: signup → first-trip-created funnel. Save it. Share it with the team. This is the artefact that makes analytics worth doing.

## Stream B — i18n (mobile + web locale wiring)

The foundations are already in place from PR #23:
- `@runwae/i18n` workspace package with canonical `en-GB.json`
- Convex `users.locale` field + `setLocale` mutation
- LLM translation generator script

Missing wiring:
- Mobile: `i18next` + `expo-localization`
- Web: `next-intl`
- A locale picker UI on Profile → Appearance
- Convert `formatCurrency` / `formatDate` (in `apps/mobile/lib/utils.ts` and equivalent web file) to be locale-aware via `Intl.NumberFormat` + `Intl.DateTimeFormat` using the active locale

### Implementation — 1 commit

- Install `i18next`, `react-i18next`, `expo-localization`
- `apps/mobile/lib/i18n.ts` (new) — initialise i18next, default locale from `expo-localization.getLocales()[0].languageTag`, fall back to `en-GB`. Hydrate from `users.locale` on auth, persist locally for offline.
- Wrap `_layout.tsx` with `I18nextProvider`
- Add `apps/mobile/app/(tabs)/profile/appearance/language.tsx` — picker for the 7 supported locales (`en-GB`, `en-US`, `fr-FR`, `es-MX`, `es-ES`, `pt-BR`, `it-IT`)
- Update `formatCurrency` + `formatDate` in `apps/mobile/lib/utils.ts` to take the active locale
- Hook the locale change into a Convex `users.setLocale` call so it syncs across devices

This is OTA-able — no native modules.

---

# Phase 4 — Auth polish (week 3, parallel with Phase 2.5)

Mostly testing. Some hardening based on what testing reveals.

## 1. End-to-end auth test pass

For each provider, on the latest TestFlight build, run through:

| Provider | Scenario | Expected |
|---|---|---|
| Apple | Share My Email, brand-new account | New user row, lands in 5-step boarding, `signup_completed` event fires |
| Apple | Share My Email, account exists with same email under password | Linked to existing user (via `shouldLinkViaEmail` in `appleNative.ts`), lands in `/(tabs)` |
| Apple | Hide My Email, brand-new | New user row with `@privaterelay.appleid.com` email; `apple-signin-relay-email` Sentry info-event fires |
| Apple | Subsequent sign-in (existing apple-native account) | `retrieveAccount` finds the row by Apple `sub`, no `createAccount` call, instant `/(tabs)` |
| Google | Brand-new account | New user via OAuth code-exchange flow, lands in 5-step boarding |
| Google | Subsequent sign-in | Same userId, lands in `/(tabs)` |
| Password | Sign-up + OTP code | Receives 8-digit code via Resend within 30s, accepts, creates account |
| Password | Wrong OTP code | Rejected, can retry |
| Password | Expired OTP | Rejected with appropriate error message |
| Password | Sign-in with valid credentials | Lands in `/(tabs)` (or boarding if `onboardingComplete=false`) |
| Password | Wrong password | "Wrong password" toast |
| Password | Reset flow — request | Email arrives, contains 8-digit code |
| Password | Reset flow — confirm + new password | Old password invalidated, new password works |
| Apple | Revoke in iOS Settings → Apps Using Apple ID | Next foreground signs user out (the `useAppleCredentialsRevoke` listener) |

For each row, log the result in a markdown table. Anything that fails gets a follow-up commit.

## 2. Email verification edge cases

- Test the OTP expiry (the provider config in `convex/auth.ts` uses `maxAge: 60 * 15` — 15 minutes)
- Test the Resend integration on the dev convex deployment by triggering a sign-up. Check the Convex logs for the email send. Check the inbox.
- Test resending — does the second OTP invalidate the first? (It should — convex auth handles this internally.)

## 3. Account-linking validation

The `shouldLinkViaEmail: true` in [`packages/convex/convex/lib/appleNative.ts`](../packages/convex/convex/lib/appleNative.ts) auto-links a new Apple-native account to an existing user with the same verified non-relay email. To verify:

1. Sign up with password as `you@example.com`
2. Complete onboarding so `onboardingComplete: true`
3. Sign out
4. Sign in with Apple, choosing **Share My Email**, with the same Apple ID that resolves to `you@example.com`
5. Expected: you land in `/(tabs)`, not the 5-step boarding. The Convex `users` row count hasn't increased — same user. Check the `authAccounts` table — there should be both a `password` and an `apple-native` row mapping to the same userId.

If this fails, the most likely issue is that Apple's identity token's `email_verified` claim is missing or false on Test Flight Apple IDs (which has been known to happen). Check Sentry for the captured token claims (the `apple-signin/*` breadcrumbs were removed in PR #24 polish — temporarily re-add `console.log(claims)` in `appleNative.ts:90` if needed for one-shot debugging, then remove).

---

# Phase 5+ — What comes after (briefly)

From [`docs/launch-readiness-spec.md`](launch-readiness-spec.md):

**Phase 5 — Web placeholder pages**
- Real `/t/[slug]` (trip share landing) and `/d/[slug]` (destination page) on `apps/web`
- Dynamic Home hero with real data
- Mostly Next.js + Convex queries — no auth complexity

**Phase 6 — Headline features**
- Discover Grid (the home discovery experience)
- Sectioned Experiences (curated lists)
- Trip-from-link (paste a URL, generate a trip)
- All flag-gated, so they can launch progressively

**Phase 7 — Critical-path tests**
- Per the original handover: payments, auth, booking, commissions
- Use convex-test (already a devDep in `packages/convex`); mobile flows are harder to automate, prioritise convex side first

**Phase 8 — Pre-launch checklist + go-live**
- Submit to App Store Connect for review
- Marketing site updates
- Support inbox / on-call rota

Refer to the launch readiness spec for the full plan and risk register.

---

## Required user actions (still outstanding across phases)

Pulled together so you don't have to grep the other handovers:

1. **App Store Connect** → fill in App Privacy questionnaire from [docs/privacy-data-collection.md](privacy-data-collection.md); declare ATT exempt
2. **App Store Connect** → set Privacy Policy URL (blocked by Phase 3 #5)
3. **Apple Developer Portal** → group `app.runwae.preview` and `app.runwae.dev` under `app.runwae.io` as Primary App ID for Sign in with Apple
4. **Convex production deployment** → set `AUTH_APPLE_AUDIENCES`, deploy the new `apple-native` provider
5. **Sentry dashboard** → create the crash-free-session alert rule
6. **PostHog** → confirm host (US cloud vs EU/self-hosted), confirm project key (already in EAS env), provide `POSTHOG_API_KEY` for server-side capture (different from the client key — generate from PostHog → Project Settings → Project API Keys → Personal API Key for backend use)
7. **Play Console** (Phase 3 #2) → create listing, generate service-account JSON
8. **Privacy/Terms content** (Phase 3 #5) → finalise legal text, decide hosting (`runwae.io` vs `apps/web`)
9. **Pending from Phase 1/2** — rotate Sentry auth token to EAS secrets; verify whether `pk_live_*` Stripe key in `apps/mobile/.env` is intentional for dev builds

---

## Phase 2.5 + 4 verification checklist

Mark green before declaring each phase done.

### Phase 2.5 (Analytics)
- [ ] PostHog SDK initialises on app launch with the right project key (verify in PostHog → Live Events)
- [ ] `track()` wrapper rejects unknown event names at compile time
- [ ] All 11 events appear in PostHog with correct properties for a fresh signup → first trip → first booking flow
- [ ] Server-side events (`booking_*`, `signup_*`, `first_*`) survive an aeroplane-mode-and-back test (capture from server even if client is offline at fire time)
- [ ] No PII in any event property (search Convex code for `email` next to `track`/`capture`)
- [ ] Funnel insight created: signup → first-trip-created → first-booking-completed
- [ ] [docs/analytics-events.md](analytics-events.md) shipped and matches what's actually firing

### Phase 2.5 (i18n)
- [ ] Locale picker visible at Profile → Appearance → Language; switching it persists across app restarts
- [ ] `formatCurrency` and `formatDate` respect the active locale
- [ ] Switching locale on one device propagates to others within ~5s (via convex `users.locale` query)
- [ ] All 7 locales render without crashes (basic smoke: open Home, Trips, Profile in each)

### Phase 4 (Auth polish)
- [ ] Every row in the auth-test-pass table above has a result documented
- [ ] OTP expiry test: code older than 15min is rejected with a clear error
- [ ] Account-linking test: password user signs in with Apple Share-My-Email → same userId
- [ ] Apple revoke test passes (revoke in Settings, reopen app, signed out)
- [ ] No new Sentry exceptions tagged `auth_method` after a full test pass

---

## How to brief the next Claude session

Open a fresh Claude Code session in the repo, then paste:

> Read `docs/phase-2.5-and-4-handover.md` end-to-end. Start Phase 2.5 Stream A (analytics), commit 1 (PostHog SDK install + init). Confirm the PostHog host with me before installing the SDK. The OTA-shippable commits are independent — ship and verify each one as you go.

The handover is self-contained.
